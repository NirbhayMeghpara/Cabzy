import { Component, OnInit } from "@angular/core"
import { Stops } from "../create-ride/create-ride.component"
import { CreateRideService } from "src/app/services/createRide/createRide.service"
import { ToastService } from "src/app/services/toast.service"

interface Ride {
  _id: string
  userId: string
  cityId: string
  serviceTypeId: string
  userName: string
  pickUp: string
  stops: Stops[]
  dropOff: string
  journeyDistance: number
  journeyTime: number
  totalFare: number
  paymentType: string
  rideDate: string
  rideTime: string
}

@Component({
  selector: "app-confirmed-ride",
  templateUrl: "./confirmed-ride.component.html",
  styleUrls: ["./confirmed-ride.component.scss"],
})
export class ConfirmedRideComponent implements OnInit {
  displayedColumns: string[] = [
    "id",
    "userName",
    "pickUp",
    "dropOff",
    "rideDate",
    "rideTime",
    "journeyDistance",
    "journeyTime",
    "totalFare",
    "status",
    "action",
  ]
  dataSource: Ride[] = []
  pageIndex: number = 1
  pageSize: number = 4
  totalRideCounts: number = 0
  flag!: boolean

  searchText: string = ""
  currentSortOrder: "asc" | "desc" | undefined = "asc"
  currentSortField: string | undefined = undefined

  constructor(private createRideService: CreateRideService, private toast: ToastService) {}

  ngOnInit(): void {
    this.fetchRideData(this.pageIndex)
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(this.pageIndex, this.searchText, this.currentSortField, this.currentSortOrder)
  }

  fetchRideData(page: number = 1, searchText?: string, sort?: string, sortOrder?: string) {
    this.createRideService.getRides(page, searchText, sort, sortOrder).subscribe({
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

  rideSearch() {
    this.flag = false
    if (this.searchText.length) {
      this.fetchRideData(1, this.searchText, this.currentSortField, this.currentSortOrder)
      this.flag = true
    }
  }

  clearSearch() {
    if (this.searchText.length === 0) {
      if (this.flag) {
        this.fetchRideData(1, undefined, this.currentSortField, this.currentSortOrder)
        this.flag = false
      }
    }
  }

  onTRclick(index: number) {
    console.log(`${index} indes TR`)
    console.log(this.dataSource[index])
  }
}
