import { Component, OnDestroy, OnInit } from "@angular/core"
import { Ride } from "../confirmed-ride/confirmed-ride.component"
import { VehicleType } from "src/app/shared/interfaces/vehicle-type.model"
import { CreateRideService } from "src/app/services/createRide/createRide.service"
import { ToastService } from "src/app/services/toast.service"
import { RideDetailsComponent } from "../confirmed-ride/ride-details/ride-details.component"
import { MatDialog } from "@angular/material/dialog"
import { SocketService } from "src/app/services/socket/socket.service"
import { RejectRideComponent } from "./reject-ride/reject-ride.component"

@Component({
  selector: "app-running-request",
  templateUrl: "./running-request.component.html",
  styleUrls: ["./running-request.component.scss"],
})
export class RunningRequestComponent implements OnInit, OnDestroy {
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
    "driver",
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
    this.listenSocket()
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(this.pageIndex)
  }

  rejectRide(event: any, index: number) {
    event.stopPropagation()
    const dialogRef = this.dialog.open(RejectRideComponent, {
      width: "400px",
      enterAnimationDuration: "300ms",
      data: {
        ride: this.dataSource[index],
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "Rejected") {
        this.dataSource.splice(index, 1)
        this.dataSource = [...this.dataSource]
      }
    })
  }

  acceptRide(event: any, index: number) {
    event.stopPropagation()
    this.socketService.emit("requestAcceptedByDriver", { ride: this.dataSource[index] })
    this.socketService.listen("rideAccepted").subscribe((ride: any) => {
      this.dataSource[index] = ride
      this.dataSource = [...this.dataSource]
      this.toast.success("Driver confirmed! Your ride is on the way.", "Accepted")
    })
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

  listenSocket() {
    this.socketService.listen("error").subscribe((error) => this.toast.error(String(error), "Error"))
  }

  ngOnDestroy(): void {
    this.socketService.disconnectSocket()
  }
}
