import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"
import { UserService } from "src/app/services/user/user.service"

@Component({
  selector: "app-delete",
  templateUrl: "./delete.component.html",
  styleUrls: ["./delete.component.scss"],
})
export class DeleteComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private userService: UserService,
    private dialogRef: MatDialogRef<DeleteComponent>,
    private toast: ToastService
  ) {}

  userName!: string
  ngOnInit(): void {
    this.userName = this.data.user.name
  }

  delete() {
    this.userService.deleteUser(this.data.user._id).subscribe({
      next: (response: any) => {
        this.dialogRef.close("Deleted")
      },
      error: (error) => {
        console.log(error)
        this.dialogRef.close("Error")
      },
    })
  }
}
