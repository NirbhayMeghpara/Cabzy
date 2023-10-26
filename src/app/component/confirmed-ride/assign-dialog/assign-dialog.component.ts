import { Driver } from "./../../driver-list/driver-list.component"
import { DriverService } from "src/app/services/driver/driver.service"
import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"
import { SocketService } from "src/app/services/socket/socket.service"

@Component({
  selector: "app-assign-dialog",
  templateUrl: "./assign-dialog.component.html",
  styleUrls: ["./assign-dialog.component.scss"],
})
export class AssignDialogComponent implements OnInit, OnDestroy {
  drivers: Driver[] = []
  selectedDriver!: Driver

  constructor(
    private dialogRef: MatDialogRef<AssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ride: any,
    private driverService: DriverService,
    private toast: ToastService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.driverService.getRideDrivers(this.ride.serviceTypeID, this.ride.cityID).subscribe({
      next: (response: any) => {
        this.drivers = response
      },
      error: (error) => {
        this.drivers = []
        if (error.status === 404) {
          this.toast.info(error.error.msg, "404")
          return
        }
        this.toast.error(error.error.error, "Error")
      },
    })
    this.socketService.initializeSocket()
    this.listenSocket()
  }

  onDriverSelected(index: number) {
    this.selectedDriver = this.drivers[index]
  }

  assignToSelectedDriver() {
    if (this.selectedDriver) {
      this.socketService.emit("assignToSelectedDriver", { ride: this.ride, driver: this.selectedDriver })
    } else {
      this.toast.info("Please select a driver", "Info")
    }
  }

  assignToNearestDriver() {
    if (this.selectedDriver) {
      this.socketService.emit("assignToNearestDriver", this.ride)
    } else {
      this.toast.info("Please select a driver", "Info")
    }
  }

  listenSocket() {
    this.socketService.listen("error").subscribe((error) => this.dialogRef.close({ error }))

    this.socketService.listen("rideAssigned").subscribe((ride: any) => {
      console.log("Message:", ride)
      this.dialogRef.close({ updatedRide: ride })
    })
  }

  ngOnDestroy(): void {
    this.socketService.disconnectSocket()
  }
}
