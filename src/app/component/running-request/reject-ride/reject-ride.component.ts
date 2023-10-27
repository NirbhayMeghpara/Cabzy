import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"
import { Ride } from "../../confirmed-ride/confirmed-ride.component"

@Component({
  selector: "app-reject-ride",
  templateUrl: "./reject-ride.component.html",
  styleUrls: ["./reject-ride.component.scss"],
})
export class RejectRideComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { ride: Ride },
    private dialogRef: MatDialogRef<RejectRideComponent>
  ) {}

  rideID!: number
  ngOnInit(): void {
    this.rideID = this.data.ride.rideID
  }

  reject() {
    this.dialogRef.close(true)
  }
}
