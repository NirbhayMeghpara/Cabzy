import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"
import { DriverService } from "src/app/services/driver/driver.service"

@Component({
  selector: "app-delete-driver",
  templateUrl: "./delete-driver.component.html",
  styleUrls: ["./delete-driver.component.scss"],
})
export class DeleteDriverComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private driverService: DriverService,
    private dialogRef: MatDialogRef<DeleteDriverComponent>,
    private toast: ToastService
  ) {}

  driverName!: string
  ngOnInit(): void {
    this.driverName = this.data.driver.name
  }

  delete() {
    this.driverService.deleteDriver(this.data.driver._id).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Success")
        this.dialogRef.close("Deleted")
      },
      error: (error) => {
        this.toast.success(error.error.error, "Error")
        this.dialogRef.close("Error")
      },
    })
  }
}
