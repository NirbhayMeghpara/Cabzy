import { PlatformModule } from "@angular/cdk/platform"
import { CreateRideService } from "./../../services/createRide/createRide.service"
import { Component, ElementRef, ViewChild } from "@angular/core"
import { Ride } from "../confirmed-ride/confirmed-ride.component"
import { ToastService } from "src/app/services/toast.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { DatePipe } from "@angular/common"
import { MatDialog } from "@angular/material/dialog"
import { RideDetailsComponent } from "../confirmed-ride/ride-details/ride-details.component"
import * as XLSX from "xlsx"
import { ngxCsv } from "ngx-csv"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { RideInvoiceComponent } from "./ride-invoice/ride-invoice.component"

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
    "driver",
    "serviceType",
    "rideDate",
    "rideTime",
    "journeyDistance",
    "journeyTime",
    "totalFare",
    "status",
    "invoice",
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
  filterRideFromDate!: string
  filterRideToDate!: string
  filterVehicleType!: string
  filterStatus!: string
  disableFilter: boolean = false

  filterForm: FormGroup

  @ViewChild("rideTable") rideTable!: ElementRef

  constructor(
    private createRideService: CreateRideService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastService
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
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchRideData(this.pageIndex, this.searchText)
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
        undefined,
        undefined,
        this.filterRideFromDate,
        this.filterRideToDate,
        this.filterVehicleType,
        this.filterStatus
      )
      this.filteredDate = true
      this.disableFilter = true
    }
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

  onStatusClick(index: number) {
    index === 0 ? (this.filterStatus = "-1") : (this.filterStatus = "7")
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

  showInvoice(event: any,index: number) {
    event.stopPropagation()
    const dialogRef = this.dialog.open(RideInvoiceComponent, {
      width: "650px",
      enterAnimationDuration: "300ms",
      data: this.dataSource[index],
    })
  }

  async exportToCsv() {
    const exportData = await this.getRideTableData()

    const options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      showLabels: true,
      headers: [
        "Ride Id",
        "Name",
        "Email",
        "Phone",
        "Pick Up",
        "Destination",
        "Driver",
        "Service Type",
        "Ride Date",
        "Ride Time",
        "Journey Distance",
        "Journey Time",
        "Estimated Fare",
        "Status",
      ],
    }

    new ngxCsv(exportData, "ride_history", options)
  }

  async exportToPdf() {
    const exportData = await this.getRideTableData()

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [480, 310],
    })
    const options = { margin: { top: 10 } }

    autoTable(doc, {
      head: [
        [
          "Ride Id",
          "Name",
          "Email",
          "Phone",
          "Pick Up",
          "Destination",
          "Driver",
          "Service Type",
          "Ride Date",
          "Ride Time",
          "Journey Distance",
          "Journey Time",
          "Estimated Fare",
          "Status",
        ],
      ],
      body: exportData.map((ride) => Object.values(ride)),
      ...options,
    })

    doc.save("ride_history.pdf")
  }

  async exportToExcel() {
    const exportData = await this.getRideTableData()
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    XLSX.writeFile(wb, "ride_history.xlsx")
  }

  async getRideTableData() {
    try {
      const response: any = await new Promise((resolve, reject) => {
        this.createRideService.getAllRides("[-1,7]").subscribe({
          next: (data) => resolve(data),
          error: (error) => reject(error),
        })
      })

      const ridesData: Ride[] = response

      return ridesData.map((ride: Ride) => {
        return {
          "Ride Id": ride.rideID,
          Name: ride.userName,
          Email: ride.user.email,
          Phone: ride.user.phone,
          "Pick Up": ride.pickUp,
          Destination: ride.dropOff,
          Driver: ride.driver?.name ? ride.driver.name : "N/A",
          "Service Type": ride.serviceType.vehicleType,
          "Ride Date": ride.rideDate,
          "Ride Time": ride.rideTime,
          "Journey Distance": ride.journeyDistance,
          "Journey Time": ride.journeyTime,
          "Estimated Fare": ride.totalFare,
          Status: ride.status === 7 ? "Completed" : "Cancelled",
        }
      })
    } catch (error: any) {
      this.toast.error(error.error.error, "Error")
      return []
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
