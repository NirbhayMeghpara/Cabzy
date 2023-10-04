import { CountryService } from "src/app/services/country/country.service"
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { CardComponent } from "./card/card.component"
import { ToastService } from "src/app/services/toast.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { UserService } from "src/app/services/user/user.service"
import { DeleteComponent } from "./delete/delete.component"

export interface User {
  _id: string
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
  showForm: boolean = false
  searchText: string = ""
  flag!: boolean

  selectedFile: any = null
  countries!: Countries[]
  displayedColumns: string[] = ["id", "profile", "name", "email", "phone", "action"]

  dataSource: User[] = []
  pageIndex: number = 1
  pageSize: number = 4
  totalUserCounts: number = 0
  isDisable: boolean = false
  form: "Add" | "Edit" = "Add"
  editUserID!: string
  fileSizeLarge: boolean = false
  invalidFile: boolean = false

  currentSortOrder: "asc" | "desc" | undefined = "asc"
  currentSortField: string | undefined = undefined

  @ViewChild("fileInput") fileInput!: ElementRef

  constructor(
    private countryService: CountryService,
    private userService: UserService,
    private toast: ToastService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.countryService.getCountryData().subscribe({
      next: (response: any) => {
        this.countries = response.map((country: any) => ({
          flag: country.flag,
          code: country.code,
        }))
      },
    })
    this.fetchUserData(this.pageIndex)
  }

  userForm: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.pattern("^[A-Za-z ]+$")]],
    profile: ["", [Validators.required]],
    profileHidden: [""],
    email: [
      "",
      [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
    ],
    phoneCode: ["", [Validators.required]],
    phone: ["", [Validators.required, Validators.pattern("[0-9]+")]],
  })

  toggleForm() {
    if (this.showForm) {
      this.resetForm()
    }
    this.showForm = !this.showForm
  }

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchUserData(this.pageIndex, this.searchText, this.currentSortField, this.currentSortOrder)
  }

  openCardDialog(index: number) {
    this.dialog.open(CardComponent, {
      width: "500px",
      enterAnimationDuration: "300ms",
      data: {
        user: this.dataSource[index],
      },
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

  onSubmitUser() {
    if (this.fileSizeLarge) {
      const errors = { ...this.profile?.errors, fileSizeExceeded: true }
      this.profile?.setErrors(errors)
    }

    if (this.invalidFile) {
      const errors = { ...this.profile?.errors, fileInvalid: true }
      this.profile?.setErrors(errors)
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
      this.onAddUser(name, this.selectedFile, email, phoneCode, phone)
    } else if (this.form === "Edit") {
      this.onEditUser(this.editUserID, name, this.selectedFile, email, phoneCode, phone)
    }
    Object.values(this.userForm.controls).forEach((control) => {
      control.setErrors(null)
    })
    this.toggleForm()
  }

  onAddUser(name: string, profile: any, email: string, phoneCode: string, phone: number) {
    this.userService.addUser(name, profile, email, phoneCode, phone).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Added")
        this.pageIndex = Math.ceil((this.totalUserCounts + 1) / 4)
        this.fetchUserData(this.pageIndex)
      },
      error: (error) => {
        console.log(error)
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

  onEditUser(id: string, name: string, profile: any, email: string, phoneCode: string, phone: number) {
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

  fetchUserData(page: number = 1, searchText?: string, sort?: string, sortOrder?: string) {
    this.userService.getUsers(page, searchText, sort, sortOrder).subscribe({
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

  editUser(index: number) {
    if (this.form !== "Edit") this.toggleForm()
    this.form = "Edit"
    this.isDisable = true
    const user: User = this.dataSource[index]
    this.editUserID = user._id

    this.name?.setValue(user.name)
    this.email?.setValue(user.email)
    this.phoneCode?.setValue(String(user.phoneCode))
    this.phone?.setValue(user.phone)
  }

  deleteUser(index: number) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: "400px",
      enterAnimationDuration: "300ms",
      data: {
        user: this.dataSource[index],
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "Deleted") {
        console.log(this.pageIndex)
        if (Math.ceil(this.totalUserCounts / 4) === this.pageIndex) {
          if ((this.totalUserCounts - 1) % 4 === 0) this.pageIndex--
        }
        this.fetchUserData(this.pageIndex, this.searchText, this.currentSortField, this.currentSortOrder)
      }
    })
  }

  resetForm() {
    this.userForm.get("profileHidden")?.reset()
    this.userForm.reset()
    this.userForm.updateValueAndValidity()
    this.form = "Add"
    this.isDisable = false
  }

  userSearch() {
    this.flag = false
    if (this.searchText.length) {
      this.fetchUserData(1, this.searchText, this.currentSortField, this.currentSortOrder)
      this.flag = true
    }
  }

  clearSearch() {
    if (this.searchText.length === 0) {
      if (this.flag) {
        this.fetchUserData(1, undefined, this.currentSortField, this.currentSortOrder)
        this.flag = false
      }
    }
  }

  toggleSort(field: string) {
    if (field === this.currentSortField) {
      if (this.currentSortOrder === "desc") {
        this.fetchUserData(this.pageIndex, this.searchText)
        this.currentSortOrder = undefined
        this.currentSortField = undefined
        return
      }
      // If the user clicked on the same field, toggle the sorting order
      this.currentSortOrder = this.currentSortOrder === "asc" ? "desc" : "asc"
    } else {
      // If the user clicked on a different field, set it as the new sorting field
      this.currentSortField = field
      this.currentSortOrder = "asc" // Reset to ascending order
    }
    this.fetchUserData(this.pageIndex, this.searchText, this.currentSortField, this.currentSortOrder)
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
