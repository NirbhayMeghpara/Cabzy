import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
  selector: "app-assign-dialog",
  templateUrl: "./assign-dialog.component.html",
  styleUrls: ["./assign-dialog.component.scss"],
})
export class AssignDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public ride: any) {}
}
