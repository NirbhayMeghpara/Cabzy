import { Component, OnInit } from "@angular/core"
import { Ride } from "../confirmed-ride/confirmed-ride.component"
import { VehicleType } from "src/app/shared/interfaces/vehicle-type.model"
import { CreateRideService } from "src/app/services/createRide/createRide.service"
import { ToastrModule } from "ngx-toastr"
import { ToastService } from "src/app/services/toast.service"
import { RideDetailsComponent } from "../confirmed-ride/ride-details/ride-details.component"
import { MatDialog } from "@angular/material/dialog"

@Component({
  selector: "app-running-request",
  templateUrl: "./running-request.component.html",
  styleUrls: ["./running-request.component.scss"],
})
export class RunningRequestComponent implements OnInit {
  displayedColumns: string[] = [
    "id",
    "userName",
    "pickUp",
    "dropOff",
    "serviceType",
    "rideDate",
    "rideTime",
    "journeyDistance",
    "journeyTime",
    "totalFare",
    "status",
    "action",
  ]
  dataSource: Ride[] = []
  vehicles: VehicleType[] = []
  statusList: string[] = ["Pending", "Accepted", "Arrived", "Started", "Completed"]
  pageIndex: number = 1
  pageSize: number = 4
  totalRideCounts: number = 0

  constructor(
    private createRideService: CreateRideService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchRideData(this.pageIndex)
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(this.pageIndex)
  }

  rejectRide(event: any, index: number) {
    event.stopPropagation()
    console.log(this.dataSource[index])
  }

  acceptRide(event: any, index: number) {
    event.stopPropagation()
    console.log(this.dataSource[index])
  }

  onTRclick(index: number) {
    const dialogRef = this.dialog.open(RideDetailsComponent, {
      width: "600px",
      enterAnimationDuration: "300ms",
      data: this.dataSource[index],
    })
  }

  fetchRideData(page: number = 1) {
    this.createRideService.getRides(page).subscribe({
      next: (data: any) => {
        this.totalRideCounts = data.rideCount
        this.dataSource = data.rides
      },
      error: (error) => {
        this.dataSource = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }
}
