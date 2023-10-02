import { CountryService } from "src/app/services/country/country.service"
import { Component, OnInit } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { CardComponent } from "./card/card.component"
import { ToastService } from "src/app/services/toast.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { UserService } from "src/app/services/user/user.service"

interface User {
  name: string
  profile: string
  email: string
  phoneCode: string
  phone: string
}

interface Countries {
  flag: string
  code: string
}

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  selectedFile: any = null
  countries!: Countries[]
  displayedColumns: string[] = ["id", "profile", "name", "email", "phone", "action"]

  dataSource: User[] = []
  pageIndex: number = 1
  pageSize: number = 4
  totalUserCounts!: number
  isDisable: boolean = false
  form: "Add" | "Edit" = "Add"
  editUserID!: string
  fileSizeLarge: boolean = false
  invalidFile: boolean = false

  constructor(
    private countryService: CountryService,
    private userService: UserService,
    private toast: ToastService,
    private fb: FormBuilder,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchUserData(this.pageIndex)
  }

  userForm: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.pattern("^[A-Za-z]+$")]],
    profile: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    phoneCode: ["", [Validators.required]],
    phone: ["", [Validators.required, Validators.pattern("[0-9]+")]],
  })

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    // this.fetchUserData(this.pageIndex)
  }

  openDialog() {
    this.matDialog.open(CardComponent, {
      width: "500px",
      enterAnimationDuration: "300ms",
    })
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null

    if (this.selectedFile) {
      this.profile?.setValue(this.selectedFile.name)
      this.fileValidator(this.selectedFile)
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

  onSubmitUser() {
    if (this.fileSizeLarge) {
      const errors = { ...this.profile?.errors, fileSizeExceeded: true }
      this.profile?.setErrors(errors)
      console.log("File large")
    }

    if (this.invalidFile) {
      const errors = { ...this.profile?.errors, fileInvalid: true }
      this.profile?.setErrors(errors)
      console.log("File invalid")
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched()
      return
    }

    const name = this.name?.value
    const email = this.email?.value
    const phoneCode = this.phoneCode?.value
    const phone = this.phone?.value

    if (this.form === "Add") {
      this.onAddVehiclePricing(name, this.selectedFile, email, phoneCode, phone)
    } else if (this.form === "Edit") {
      this.onEditVehiclePricing(this.editUserID, name, this.selectedFile, email, phoneCode, phone)
    }
    this.resetForm()
  }

  onAddVehiclePricing(name: string, profile: any, email: string, phoneCode: string, phone: number) {
    this.userService.addUser(name, profile, email, phoneCode, phone).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Added")
        this.pageIndex = response.pageCount
        this.fetchUserData(this.pageIndex)
      },
      error: (error) => {
        if (error.status === 409) {
          this.toast.info(error.error.msg, "Oops !")
          return
        }
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  onEditVehiclePricing(
    id: string,
    name: string,
    profile: any,
    email: string,
    phoneCode: string,
    phone: number
  ) {
    this.userService.editUser(id, name, profile, email, phoneCode, phone).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Success")
        this.fetchUserData(this.pageIndex)
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  fetchUserData(page: number = 1) {
    this.userService.getUsers(page).subscribe({
      next: (data: any) => {
        this.totalUserCounts = data.userCount
        this.dataSource = data.users
      },
      error: (error) => {
        this.dataSource = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  editUser(index: number) {}

  deleteUser(index: number) {}

  resetForm() {
    this.userForm.reset()
    this.userForm.updateValueAndValidity()
    this.form = "Add"
    this.isDisable = false
  }

  get name() {
    return this.userForm.get("name")
  }
  get profile() {
    return this.userForm.get("profile")
  }
  get email() {
    return this.userForm.get("email")
  }
  get phoneCode() {
    return this.userForm.get("phoneCode")
  }
  get phone() {
    return this.userForm.get("phone")
  }
}
