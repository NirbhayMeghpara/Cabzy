import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"
import { Ride } from "../../confirmed-ride/confirmed-ride.component"
import { SocketService } from "src/app/services/socket/socket.service"

@Component({
  selector: "app-reject-ride",
  templateUrl: "./reject-ride.component.html",
  styleUrls: ["./reject-ride.component.scss"],
})
export class RejectRideComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { ride: Ride },
    private dialogRef: MatDialogRef<RejectRideComponent>,
    private toast: ToastService,
    private socketService: SocketService
  ) {}

  rideID!: number
  ngOnInit(): void {
    this.rideID = this.data.ride.rideID
  }

  reject() {
    this.socketService.emit("selectedDriverRejectRide", { ride: this.data.ride })
    this.socketService.listen("rideRejected").subscribe((data: any) => {
      this.toast.info(data, "Rejected")
      this.dialogRef.close("Rejected")
    })
  }

  listenSocket() {
    this.socketService.listen("error").subscribe((error: any) => {
      this.toast.error(error, "Error")
      this.dialogRef.close("Error")
    })
  }
}
