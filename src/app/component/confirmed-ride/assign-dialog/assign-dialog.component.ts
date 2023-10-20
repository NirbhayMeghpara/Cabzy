import { Driver } from "./../../driver-list/driver-list.component"
import { DriverService } from "src/app/services/driver/driver.service"
import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"

@Component({
  selector: "app-assign-dialog",
  templateUrl: "./assign-dialog.component.html",
  styleUrls: ["./assign-dialog.component.scss"],
})
export class AssignDialogComponent implements OnInit {
  drivers: Driver[] = []

  constructor(
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
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  assignToSelectedDriver() {}
}
