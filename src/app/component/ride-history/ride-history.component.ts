import { CreateRideService } from "./../../services/createRide/createRide.service"
import { Component } from "@angular/core"
import * as XLSX from "xlsx"
import { Ride } from "../confirmed-ride/confirmed-ride.component"
import { ToastService } from "src/app/services/toast.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { DatePipe } from "@angular/common"
import { MatDialog } from "@angular/material/dialog"
import { RideDetailsComponent } from "../confirmed-ride/ride-details/ride-details.component"

@Component({
  selector: "app-ride-history",
  templateUrl: "./ride-history.component.html",
  styleUrls: ["./ride-history.component.scss"],
})
export class RideHistoryComponent {
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
  ]
  dataSource: Ride[] = []
  statusList: string[] = ["Cancelled", "Completed"]
  pageIndex: number = 1
  pageSize: number = 4
  totalRideCounts: number = 0
  searchText: string = ""
  flag!: boolean
  showFilter!: boolean
  filteredDate!: boolean
  filterRideDate!: string
  filterVehicleType!: string
  filterStatus!: string

  constructor(
    private createRideService: CreateRideService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchRideData(this.pageIndex)
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(this.pageIndex, this.searchText)
  }

  filterForm: FormGroup = this.fb.group({
    rideStatus: ["", [Validators.required]],
    vehicleType: ["", [Validators.required]],
    filterDate: ["", [Validators.required]],
  })

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
        rideStatus: "[-1,7]",
      })
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

  applyFilter() {
    this.fetchRideData(
      this.pageIndex,
      this.searchText,
      undefined,
      undefined,
      this.filterRideDate,
      this.filterVehicleType,
      this.filterStatus
    )
    this.filteredDate = true
  }

  rideSearch() {
    this.flag = false
    if (this.searchText.length) {
      this.fetchRideData(1, this.searchText)
      this.flag = true
    }
  }

  clearSearch() {
    if (this.searchText.length === 0) {
      if (this.flag) {
        this.fetchRideData(1, undefined)
        this.flag = false
      }
    }
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

  onStatusClick(index: number) {
    index === 0 ? (this.filterStatus = "-1") : (this.filterStatus = "7")
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

  // exportToExcel() {
  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData)
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new()
  //   XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  //   XLSX.writeFile(wb, "TableData.xlsx")
  // }
}
