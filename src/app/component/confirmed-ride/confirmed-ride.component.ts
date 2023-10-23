import { Component, OnDestroy, OnInit } from "@angular/core"
import { Stops } from "../create-ride/create-ride.component"
import { CreateRideService } from "src/app/services/createRide/createRide.service"
import { ToastService } from "src/app/services/toast.service"
import { MatDialog } from "@angular/material/dialog"
import { RideDetailsComponent } from "./ride-details/ride-details.component"
import { User } from "../users/users.component"
import { Pricing } from "../vehical-price/vehical-price.component"
import { DatePipe } from "@angular/common"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { VehicleTypeService } from "src/app/services/vehicleType/vehicle-type.service"
import { VehicleType } from "src/app/shared/interfaces/vehicle-type.model"
import { AssignDialogComponent } from "./assign-dialog/assign-dialog.component"
import { SocketService } from "src/app/services/socket/socket.service"

export interface Ride {
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
  status: number
  user: User
  serviceType: Pricing
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
  flag!: boolean
  minDate!: string
  showFilter!: boolean
  filteredDate!: boolean
  filterRideDate!: string
  filterVehicleType!: string
  filterStatus!: string

  searchText: string = ""
  currentSortOrder: "asc" | "desc" | undefined = "asc"
  currentSortField: string | undefined = undefined

  constructor(
    private createRideService: CreateRideService,
    private toast: ToastService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private vehicleTypeService: VehicleTypeService,
    private socketService: SocketService
  ) {}

  filterForm: FormGroup = this.fb.group({
    vehicleType: ["", [Validators.required]],
    filterDate: ["", [Validators.required]],
  })

  ngOnInit(): void {
    this.fetchRideData(this.pageIndex)
    this.getVehicle()
    this.restrictDate()
    this.socketService.initializeSocket()
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(this.pageIndex, this.searchText, this.currentSortField, this.currentSortOrder)
  }

  onVehicleTypeSelect(index: number) {
    this.filterVehicleType = this.vehicles[index].vehicleType
  }
  onStatusClick(index: number) {
    this.filterStatus = (index + 1).toString()
  }

  applyFilter() {
    this.fetchRideData(
      this.pageIndex,
      this.searchText,
      this.currentSortField,
      this.currentSortOrder,
      this.filterRideDate,
      this.filterVehicleType,
      this.filterStatus
    )
    this.filteredDate = true
  }

  toggleFilter() {
    if (this.showFilter) {
      this.resetFilterForm()
      this.filterRideDate = ""
      this.filterVehicleType = ""
      this.filterStatus = ""
      if (this.filteredDate) {
        this.fetchRideData()
        this.filteredDate = false
      }
    }
    this.showFilter = !this.showFilter
  }

  resetFilterForm() {
    this.filterForm.reset()
    this.filterForm.updateValueAndValidity()
  }

  fetchRideData(
    page: number = 1,
    searchText?: string,
    sort?: string,
    sortOrder?: string,
    rideDate?: string,
    vehicleType?: string,
    status?: string
  ) {
    this.createRideService
      .getRides(page, searchText, sort, sortOrder, rideDate, vehicleType, status)
      .subscribe({
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

  restrictDate() {
    const currentDate = new Date()

    this.minDate = currentDate.toISOString().split("T")[0] // Get the date in YYYY-MM-DD format
  }

  onDateChange(event: any) {
    const date = new Date(event.value)
    const formattedDate = new DatePipe("en-US").transform(date, "MM/dd/yyyy")!

    this.filterRideDate = formattedDate
  }

  onTRclick(index: number) {
    const dialogRef = this.dialog.open(RideDetailsComponent, {
      width: "600px",
      enterAnimationDuration: "300ms",
      data: this.dataSource[index],
    })
  }

  cancelRide(event: any, index: number) {
    event.stopPropagation()
    console.log(this.dataSource[index])
  }

  assignRide(event: any, index: number) {
    event.stopPropagation()

    const assignRideDialog = this.dialog.open(AssignDialogComponent, {
      width: "800px",
      enterAnimationDuration: "300ms",
      data: this.dataSource[index],
    })

    assignRideDialog.afterClosed().subscribe((result) => {
      if (result.updatedRide) {
        this.fetchRideData(
          this.pageIndex,
          this.searchText,
          this.currentSortField,
          this.currentSortOrder,
          this.filterRideDate,
          this.filterVehicleType,
          this.filterStatus
        )
      }
    })
  }

  getVehicle() {
    this.vehicleTypeService.fetchVehicle().subscribe({
      next: (response: any) => {
        this.vehicles = response
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  get vehicleType() {
    return this.filterForm.get("vehicleType")
  }
  get filterDate() {
    return this.filterForm.get("filterDate")
  }
}
