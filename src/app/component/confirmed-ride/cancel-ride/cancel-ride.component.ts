import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { Ride } from "../confirmed-ride.component"

@Component({
  selector: "app-cancel-ride",
  templateUrl: "./cancel-ride.component.html",
  styleUrls: ["./cancel-ride.component.scss"],
})
export class CancelRideComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { ride: Ride },
    private dialogRef: MatDialogRef<CancelRideComponent>
  ) {}

  rideID!: number
  ngOnInit(): void {
    this.rideID = this.data.ride.rideID
  }

  cancel() {
    this.dialogRef.close(true)
  }
}
