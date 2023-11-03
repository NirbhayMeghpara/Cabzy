import { Component, ElementRef, Inject, ViewChild } from "@angular/core"
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { CreateRideService } from "src/app/services/createRide/createRide.service"
import { ToastService } from "src/app/services/toast.service"

@Component({
  selector: "app-ride-feedback",
  templateUrl: "./ride-feedback.component.html",
  styleUrls: ["./ride-feedback.component.scss"],
})
export class RideFeedbackComponent {
  ratingList = ["5", "4", "3", "2", "1"]
  userFeedback!: string
  selectedRating!: number

  feedbackForm: FormGroup

  @ViewChild("rideTable") rideTable!: ElementRef

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private createRideService: CreateRideService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RideFeedbackComponent>,
    private toast: ToastService
  ) {
    this.feedbackForm = this.fb.group({
      rating: ["", [Validators.required]],
      feedback: ["", [Validators.required]],
    })
  }

  onSubmitFeedback() {
    if (!this.selectedRating && !this.userFeedback) {
      this.toast.info("Please select rating or enter feedback !!", "Info")
      return
    }
    this.createRideService
      .sendFeedback(this.data.ride._id, this.selectedRating, this.userFeedback)
      .subscribe({
        next: (response: any) => {
          this.toast.success(response.msg, "Submitted")
          this.dialogRef.close()
        },
        error: (error) => {
          this.toast.error(error.error.error, "Error")
          this.dialogRef.close()
        },
      })
  }

  get rating() {
    return this.feedbackForm.get("rating")
  }
  get feedback() {
    return this.feedbackForm.get("feedback")
  }
}
