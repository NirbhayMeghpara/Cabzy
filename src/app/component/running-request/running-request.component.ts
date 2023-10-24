import { Component, OnInit } from "@angular/core"
import { Ride } from "../confirmed-ride/confirmed-ride.component"
import { VehicleType } from "src/app/shared/interfaces/vehicle-type.model"
import { CreateRideService } from "src/app/services/createRide/createRide.service"
import { ToastService } from "src/app/services/toast.service"
import { RideDetailsComponent } from "../confirmed-ride/ride-details/ride-details.component"
import { MatDialog } from "@angular/material/dialog"
import { SocketService } from "src/app/services/socket/socket.service"

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
  statusList: string[] = ["Pending", "Assigning", "Accepted", "Arrived", "Started", "Completed"]
  pageIndex: number = 1
  pageSize: number = 4
  totalRideCounts: number = 0

  constructor(
    private createRideService: CreateRideService,
    private toast: ToastService,
    private dialog: MatDialog,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.fetchRideData(this.pageIndex)
    this.socketService.initializeSocket()
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(this.pageIndex)
  }

  rejectRide(event: any, index: number) {
    event.stopPropagation()
    this.socketService.emit(
      "requestRejectedByDriver",
      { ride: this.dataSource[index] },
      (error, message) => {
        if (error) {
          console.error("Error:", error)
        } else {
          this.dataSource[index] = JSON.parse(message)
          this.dataSource = [...this.dataSource]
        }
      }
    )
  }

  acceptRide(event: any, index: number) {
    event.stopPropagation()
    this.socketService.emit(
      "requestAcceptedByDriver",
      { ride: this.dataSource[index] },
      (error, message) => {
        if (error) {
          console.error("Error:", error)
        } else {
          console.log(message)
          this.dataSource[index] = JSON.parse(message)
          this.dataSource = [...this.dataSource]
        }
      }
    )
  }

  onTRclick(index: number) {
    const dialogRef = this.dialog.open(RideDetailsComponent, {
      width: "600px",
      enterAnimationDuration: "300ms",
      data: this.dataSource[index],
    })
  }

  fetchRideData(page: number = 1) {
    this.createRideService.getRides({ page, rideStatus: "[2,3,4,5,6]" }).subscribe({
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
