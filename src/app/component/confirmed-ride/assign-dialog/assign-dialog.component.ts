import { Driver } from "./../../driver-list/driver-list.component"
import { DriverService } from "src/app/services/driver/driver.service"
import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"

@Component({
  selector: "app-assign-dialog",
  templateUrl: "./assign-dialog.component.html",
  styleUrls: ["./assign-dialog.component.scss"],
})
export class AssignDialogComponent implements OnInit {
  drivers: Driver[] = []
  selectedDriver!: Driver

  constructor(
    private dialogRef: MatDialogRef<AssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ride: any,
    private driverService: DriverService,
    private toast: ToastService
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
  }

  onDriverSelected(index: number) {
    this.selectedDriver = this.drivers[index]
  }

  assignToSelectedDriver() {
    if (this.selectedDriver) {
      this.dialogRef.close({
        assignSelected: true,
        rideData: { ride: this.ride, driver: this.selectedDriver },
      })
    } else {
      this.toast.info("Please select a driver", "Info")
    }
  }

  assignToNearestDriver() {
    this.dialogRef.close({
      assignSelected: false,
      rideData: { ride: this.ride, driver: this.drivers },
    })
  }
}
