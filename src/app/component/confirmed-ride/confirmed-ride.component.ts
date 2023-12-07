import { Component, OnInit } from "@angular/core"
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
import { Driver } from "../driver-list/driver-list.component"
import { SocketService } from "src/app/services/socket/socket.service"
import { CancelRideComponent } from "./cancel-ride/cancel-ride.component"

export interface Ride {
  _id: string
  userId: string
  cityId: string
  serviceTypeId: string
  rideID: number
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
  driver: Driver
  assignSelected: boolean
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
  statusList: string[] = [
    "Pending",
    "Assigning",
    "Accepted",
    "Arrived",
    "Picked",
    "Started"
  ]
  pageIndex: number = 1
  pageSize: number = 4
  totalRideCounts: number = 0
  flag!: boolean
  showFilter!: boolean
  filteredDate!: boolean
  filterRideFromDate!: string
  filterRideToDate!: string
  filterVehicleType!: string
  filterStatus!: string
  disableFilter: boolean = false

  searchText: string = ""
  currentSortOrder: "asc" | "desc" | undefined = "asc"
  currentSortField: string | undefined = undefined

  filterForm: FormGroup
  constructor(
    private createRideService: CreateRideService,
    private toast: ToastService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private vehicleTypeService: VehicleTypeService,
    private socketService: SocketService
  ) {
    this.filterForm = this.fb.group({
      rideStatus: ["", [Validators.required]],
      vehicleType: ["", [Validators.required]],
      filterFromDate: ["", [Validators.required]],
      filterToDate: ["", [Validators.required]],
    })

    this.filterForm.valueChanges.subscribe(() => (this.disableFilter = false))
  }

  ngOnInit(): void {
    this.fetchRideData(this.pageIndex)
    this.getVehicle()
    this.socketService.initializeSocket()
    this.listenSocket()
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(
      this.pageIndex, 
      this.searchText, 
      this.currentSortField, 
      this.currentSortOrder, 
      this.filterRideFromDate,
      this.filterRideToDate,
      this.filterVehicleType,
      this.filterStatus
    )}

  onVehicleTypeSelect(index: number) {
    this.filterVehicleType = this.vehicles[index].vehicleType
  }
  onStatusClick(index: number) {
    this.filterStatus = (index + 1).toString()
  }

  applyFilter() {
    const rideStatus = this.rideStatus?.value
    const vehicleType = this.vehicleType?.value
    const fromDate = this.filterFromDate?.value
    const toDate = this.filterToDate?.value

    if (!rideStatus && !vehicleType && !fromDate && !toDate) {
      return this.toast.info("Please select any one filter", ":)")
    } else if (!this.disableFilter) {
      this.fetchRideData(
        this.pageIndex,
        this.searchText,
        this.currentSortField,
        this.currentSortOrder,
        this.filterRideFromDate,
        this.filterRideToDate,
        this.filterVehicleType,
        this.filterStatus
      )
      this.filteredDate = true
      this.disableFilter = true
    }
  }

  toggleFilter() {
    if (this.showFilter) {
      this.resetFilterForm()
      this.filterRideFromDate = ""
      this.filterRideToDate = ""
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
    rideDateFrom?: string,
    rideDateTo?: string,
    vehicleType?: string,
    status?: string
  ) {
    this.createRideService
      .getRides({
        page,
        searchText,
        sort,
        sortOrder,
        rideDateFrom,
        rideDateTo,
        vehicleType,
        status,
        rideStatus: "[0,1,2,3,4,5,6]",
      })
      .subscribe({
        next: (data: any) => {
          this.totalRideCounts = data.rideCount
          this.dataSource = data.rides.filter((ride: Ride) => {
            return ride.status >= 0 && ride.status < 7
          })
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

  onFromDateChange(event: any) {
    const date = new Date(event.value)
    const formattedDate = new DatePipe("en-US").transform(date, "MM/dd/yyyy")!
    this.filterRideFromDate = formattedDate
  }

  onToDateChange(event: any) {
    const date = new Date(event.value)
    const formattedDate = new DatePipe("en-US").transform(date, "MM/dd/yyyy")!
    this.filterRideToDate = formattedDate
  }

  onTRclick(index: number) {
    const dialogRef = this.dialog.open(RideDetailsComponent, {
      width: "1200px",
      enterAnimationDuration: "300ms",
      data: this.dataSource[index],
    })
  }

  cancelRide(event: any, index: number) {
    event.stopPropagation()
    const dialogRef = this.dialog.open(CancelRideComponent, {
      width: "400px",
      enterAnimationDuration: "300ms",
      data: {
        ride: this.dataSource[index],
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.socketService.emit("cancelRide", JSON.stringify(this.dataSource[index]))
      }
    })
  }

  assignRide(event: any, index: number) {
    event.stopPropagation()

    const assignRideDialog = this.dialog.open(AssignDialogComponent, {
      width: "800px",
      enterAnimationDuration: "300ms",
      data: this.dataSource[index],
    })

    assignRideDialog.afterClosed().subscribe((result) => {
      if (result && result.assignSelected) {
        this.socketService.emit("assignToSelectedDriver", JSON.stringify(result.rideData))
      } else if (result && !result.assignSelected) {
        this.socketService.emit("assignToNearestDriver", JSON.stringify(result.rideData))
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

  listenSocket() {
    this.socketService.listen("error").subscribe((error: any) => this.toast.error(error, "Error"))

    this.socketService.listen("driverTimeout").subscribe((data: any) => {
      this.updateRideTR(data.ride)
    })

    this.socketService.listen("rideAssigned").subscribe((updatedRide: any) => {
      this.updateRideTR(updatedRide)
    })

    this.socketService.listen("rideAccepted").subscribe((updatedRide: any) => {
      this.updateRideTR(updatedRide)
    })

    this.socketService.listen("rideHold").subscribe((updatedRide: any) => {
      this.updateRideTR(updatedRide)
    })

    this.socketService.listen("rideTimeout").subscribe((updatedRide: any) => {
      if (!updatedRide.driverID) {
        this.toast.info("No driver is available!!", "Ride Timeout")
        const notificationMessage = "No driver is available!!"

        if (Notification.permission === "granted") {
          new Notification("Ride Timeout", {
            body: notificationMessage,
          })
        } else {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Ride Timeout", {
                body: notificationMessage,
              })
            }
          })
        }
      }
      this.updateRideTR(updatedRide)
    })

    this.socketService.listen("statusUpdated").subscribe((updatedRide: any) => {
      if (updatedRide.status === 7) {
        this.removeRideTR(updatedRide.rideID)
      } else if (updatedRide.status >= 0 && updatedRide.status < 7) {
        this.updateRideTR(updatedRide)
      }
    })

    this.socketService.listen("rideCancelled").subscribe((updatedRide: any) => {
      this.removeRideTR(updatedRide.rideID)
    })
  }

  ngOnDestroy(): void {
    this.socketService.disconnectSocket()
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

  get rideStatus() {
    return this.filterForm.get("rideStatus")
  }
  get vehicleType() {
    return this.filterForm.get("vehicleType")
  }
  get filterFromDate() {
    return this.filterForm.get("filterFromDate")
  }
  get filterToDate() {
    return this.filterForm.get("filterToDate")
  }
}
