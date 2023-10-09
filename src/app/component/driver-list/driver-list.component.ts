import { CountryService } from "src/app/services/country/country.service"
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ServiceTypeComponent } from "./service-type/service-type.component"
import { ToastService } from "src/app/services/toast.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { DriverService } from "src/app/services/driver/driver.service"
import { DeleteDriverComponent } from "./delete-driver/delete-driver.component"
import { CityService } from "src/app/services/city/city.service"

export interface Driver {
  _id: string
  name: string
  profile: string
  email: string
  phoneCode: string
  phone: string
  city: string
  isApproved: boolean
}

export interface CountryCode {
  name: string
  flag: string
  code: string
}

@Component({
  selector: "app-driver-list",
  templateUrl: "./driver-list.component.html",
  styleUrls: ["./driver-list.component.scss"],
})
export class DriverListComponent implements OnInit {
  showForm: boolean = false
  searchText: string = ""
  flag!: boolean

  selectedCountry: string | null = null
  selectedFile: any = null
  countries!: CountryCode[]
  cities!: string[]
  displayedColumns: string[] = ["id", "profile", "name", "email", "phone", "city", "status", "action"]

  dataSource: Driver[] = []
  pageIndex: number = 1
  pageSize: number = 4
  totalDriverCounts: number = 0
  isDisable: boolean = false
  form: "Add" | "Edit" = "Add"
  editDriverID!: string
  fileSizeLarge: boolean = false
  invalidFile: boolean = false

  currentSortOrder: "asc" | "desc" | undefined = "asc"
  currentSortField: string | undefined = undefined

  @ViewChild("fileInput") fileInput!: ElementRef

  constructor(
    private countryService: CountryService,
    private cityService: CityService,
    private driverService: DriverService,
    private toast: ToastService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.countryService.getCountryData().subscribe({
      next: (response: any) => {
        this.countries = response.map((country: any) => ({
          name: country.name,
          flag: country.flag,
          code: country.code,
        }))
      },
    })
    this.fetchDriverData(this.pageIndex)
  }

  fetchCityOnKey(event: any) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const selectedValue = this.phoneCode?.value
      const selectedCountry = this.countries.find((country) => country.code === selectedValue)
      if (selectedCountry) {
        this.fetchCity(selectedCountry.name)
      }
    }
  }

  fetchCity(country: String) {
    if (String(country) === this.selectedCountry) {
      return
    }
    this.selectedCountry = String(country)
    this.cityService.getAllCities(String(country)).subscribe({
      next: (response: any) => {
        this.cities = response.map((city: any) => city.name)
      },
      error: (error) => {
        this.cities = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  driverForm: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.pattern("^[A-Za-z ]+$")]],
    profile: ["", [Validators.required]],
    profileHidden: [""],
    email: [
      "",
      [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
    ],
    phoneCode: ["", [Validators.required]],
    phone: ["", [Validators.required, Validators.pattern("[0-9]+")]],
    city: ["", [Validators.required]],
  })

  onToggle(status: boolean, index: number) {
    const driver = this.dataSource[index]
    this.driverService.changeStatus(driver._id, status).subscribe({
      next: (response: any) => this.toast.success(response.msg, "Success"),
      error: (error) => this.toast.error(error.error.error, "Error"),
    })
  }

  toggleForm() {
    if (this.showForm) {
      this.resetForm()
    }
    this.showForm = !this.showForm
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchDriverData(this.pageIndex, this.searchText, this.currentSortField, this.currentSortOrder)
  }

  openServiceTypeDialog(index: number) {
    const dialogRef = this.dialog.open(ServiceTypeComponent, {
      width: "500px",
      enterAnimationDuration: "300ms",
      data: {
        driver: this.dataSource[index],
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      this.fetchDriverData(this.pageIndex)
    })
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0]

    if (this.selectedFile) {
      this.fileValidator(this.selectedFile)
      this.profile?.setValue(this.selectedFile.name)
    }
  }

  fileValidator(file: any) {
    const extension = file.name.split(".").pop()
    const allowedExtension = ["jpg", "jpeg", "png"]

    if (!allowedExtension.includes(extension.toLowerCase())) {
      this.invalidFile = true
    }
    if (file.size > 5 * 1024 * 1024) {
      this.fileSizeLarge = true
      return
    }
    this.fileSizeLarge = false
  }

  onSubmitDriver() {
    if (this.fileSizeLarge) {
      const errors = { ...this.profile?.errors, fileSizeExceeded: true }
      this.profile?.setErrors(errors)
    }

    if (this.invalidFile) {
      const errors = { ...this.profile?.errors, fileInvalid: true }
      this.profile?.setErrors(errors)
    }

    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched()
      return
    }

    const name = this.name?.value
    const email = this.email?.value
    const phoneCode = this.phoneCode?.value
    const phone = this.phone?.value
    const city = this.city?.value

    if (this.form === "Add") {
      this.onAddDriver(name, this.selectedFile, email, phoneCode, phone, city)
    } else if (this.form === "Edit") {
      this.onEditDriver(this.editDriverID, name, this.selectedFile, email, phoneCode, phone, city)
    }
    Object.values(this.driverForm.controls).forEach((control) => {
      control.setErrors(null)
    })
    this.toggleForm()
  }

  onAddDriver(
    name: string,
    profile: any,
    email: string,
    phoneCode: string,
    phone: number,
    city: string
  ) {
    this.driverService.addDriver(name, profile, email, phoneCode, phone, city).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Added")
        this.pageIndex = Math.ceil((this.totalDriverCounts + 1) / 4)
        this.fetchDriverData(this.pageIndex)
      },
      error: (error) => {
        if (error.status === 409) {
          this.toast.info(error.error.msg, "Oops !")
          return
        }
        if (error.error.field) {
          if (error.error.field === "phone") {
            this.toast.info(error.error.msg, "Oops !")
            return
          }
          if (error.error.field === "email") {
            this.toast.info(error.error.msg, "Oops !")
            return
          }
        }
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  onEditDriver(
    id: string,
    name: string,
    profile: any,
    email: string,
    phoneCode: string,
    phone: number,
    city: string
  ) {
    this.driverService.editDriver(id, name, profile, email, phoneCode, phone, city).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Success")
        this.fetchDriverData(this.pageIndex)
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  fetchDriverData(page: number = 1, searchText?: string, sort?: string, sortOrder?: string) {
    this.driverService.getDrivers(page, searchText, sort, sortOrder).subscribe({
      next: (data: any) => {
        this.totalDriverCounts = data.driverCount
        this.dataSource = data.drivers
      },
      error: (error) => {
        this.dataSource = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  editDriver(index: number) {
    if (this.form !== "Edit") this.toggleForm()
    this.form = "Edit"
    this.isDisable = true
    const driver: Driver = this.dataSource[index]
    this.editDriverID = driver._id

    this.name?.setValue(driver.name)
    this.email?.setValue(driver.email)
    this.phoneCode?.setValue(String(driver.phoneCode))
    this.phone?.setValue(driver.phone)
    this.city?.setValue(driver.city)
  }

  deleteDriver(index: number) {
    const dialogRef = this.dialog.open(DeleteDriverComponent, {
      width: "400px",
      enterAnimationDuration: "300ms",
      data: {
        driver: this.dataSource[index],
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "Deleted") {
        if (Math.ceil(this.totalDriverCounts / 4) === this.pageIndex) {
          if ((this.totalDriverCounts - 1) % 4 === 0) this.pageIndex--
        }
        this.fetchDriverData(
          this.pageIndex,
          this.searchText,
          this.currentSortField,
          this.currentSortOrder
        )
      }
    })
  }

  resetForm() {
    this.driverForm.get("profileHidden")?.reset()
    this.driverForm.reset()
    this.driverForm.updateValueAndValidity()
    this.form = "Add"
    this.isDisable = false
  }

  driverSearch() {
    this.flag = false
    if (this.searchText.length) {
      this.fetchDriverData(1, this.searchText, this.currentSortField, this.currentSortOrder)
      this.flag = true
    }
  }

  clearSearch() {
    if (this.searchText.length === 0) {
      if (this.flag) {
        this.fetchDriverData(1, undefined, this.currentSortField, this.currentSortOrder)
        this.flag = false
      }
    }
  }

  toggleSort(field: string) {
    if (field === this.currentSortField) {
      if (this.currentSortOrder === "desc") {
        this.fetchDriverData(this.pageIndex, this.searchText)
        this.currentSortOrder = undefined
        this.currentSortField = undefined
        return
      }
      // If the driver clicked on the same field, toggle the sorting order
      this.currentSortOrder = this.currentSortOrder === "asc" ? "desc" : "asc"
    } else {
      // If the driver clicked on a different field, set it as the new sorting field
      this.currentSortField = field
      this.currentSortOrder = "asc" // Reset to ascending order
    }
    this.fetchDriverData(this.pageIndex, this.searchText, this.currentSortField, this.currentSortOrder)
  }

  get name() {
    return this.driverForm.get("name")
  }
  get profile() {
    return this.driverForm.get("profile")
  }
  get email() {
    return this.driverForm.get("email")
  }
  get phoneCode() {
    return this.driverForm.get("phoneCode")
  }
  get phone() {
    return this.driverForm.get("phone")
  }
  get city() {
    return this.driverForm.get("city")
  }
}
