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
  statusList: string[] = [
    "Pending",
    "Assigning",
    "Accepted",
    "Arrived",
    "Picked",
    "Started",
    "Completed",
  ]
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
      if (result) {
        if (this.dataSource[index].assignSelected) {
          this.socketService.emit("selectedDriverRejectRide", { ride: this.dataSource[index] })
        } else {
          this.socketService.emit("nearestDriverRejectRide", { ride: this.dataSource[index] })
        }
      }
    })
  }

  acceptRide(event: any, index: number) {
    event.stopPropagation()
    this.socketService.emit("requestAcceptedByDriver", { ride: this.dataSource[index] })
  }

  updateRideStatue(event: any, index: number) {
    event.stopPropagation()
    this.socketService.emit("updateRideStatus", this.dataSource[index])
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
    this.socketService.listen("error").subscribe((error: any) => this.toast.error(error, "Error"))

    this.socketService.listen("rideAccepted").subscribe((updatedRide: any) => {
      this.updateRideTR(updatedRide)

      this.toast.success(
        `Driver confirmed for ride ${updatedRide.rideID} ! Your ride is on the way.`,
        "Accepted"
      )
    })

    this.socketService.listen("rideRejected").subscribe((data: any) => {
      this.toast.info(data.message, "Rejected")

      this.removeRideTR(data.rideID)
    })

    this.socketService.listen("driverTimeout").subscribe((data: any) => {
      this.dialog.closeAll()
      this.toast.info(
        `Ride ${data.ride.rideID} has timed out as ${data.driver} didn't respond within the expected time.`,
        "Timeout"
      )

      this.removeRideTR(data.ride.rideID)
    })

    this.socketService.listen("rideAssigned").subscribe((updatedRide: any) => {
      const index = this.dataSource.findIndex((ride) => ride.rideID === updatedRide.rideID)

      if (index !== -1) this.dataSource[index] = updatedRide
      else this.dataSource.push(updatedRide)

      this.dataSource = [...this.dataSource]
    })

    this.socketService.listen("statusUpdated").subscribe((updatedRide: any) => {
      if (updatedRide.status === 7) {
        this.removeRideTR(updatedRide.rideID)
      } else if (updatedRide.status > 1 && updatedRide.status < 7) {
        this.updateRideTR(updatedRide)
      }
    })
  }

  updateRideTR(updatedRide: Ride) {
    const index = this.dataSource.findIndex((ride) => ride.rideID === updatedRide.rideID)

    if (index !== -1) {
      this.dataSource[index] = updatedRide
      this.dataSource = [...this.dataSource]
    }
  }

  removeRideTR(rideID: number) {
    const index = this.dataSource.findIndex((ride) => ride.rideID === rideID)

    if (index !== -1) {
      this.dataSource.splice(index, 1)
      this.dataSource = [...this.dataSource]
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnectSocket()
  }
}
