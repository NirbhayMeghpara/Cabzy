import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ToastService } from "src/app/services/toast.service"
import { VehicleTypeService } from "src/app/services/vehicleType/vehicle-type.service"
import { VehicleType } from "src/app/shared/interfaces/vehicle-type.model"

@Component({
  selector: "app-vehical-type",
  templateUrl: "./vehical-type.component.html",
  styleUrls: ["./vehical-type.component.scss"],
})
export class VehicalTypeComponent implements OnInit {
  selectedFile: any = null
  fileSizeLarge: boolean = false
  invalidFile: boolean = false
  showForm: boolean = false

  vehicleTypeData!: VehicleType[]

  constructor(
    private fb: FormBuilder,
    private vehicleTypeService: VehicleTypeService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.getVehicle()
  }

  toggleForm() {
    if (this.showForm) {
      this.vehicleForm.reset()
    }
    this.showForm = !this.showForm
  }

  editForm() {
    if (!this.showForm) this.showForm = !this.showForm

    this.vehicleType
  }

  vehicleForm: FormGroup = this.fb.group({
    vehicleType: ["", [Validators.required]],
    vehicleImage: ["", [Validators.required]],
  })

  onVehicleSave() {
    if (this.fileSizeLarge) {
      const errors = { ...this.vehicleImage?.errors, fileSizeExceeded: true }
      this.vehicleImage?.setErrors(errors)
    }

    if (this.invalidFile) {
      const errors = { ...this.vehicleImage?.errors, fileInvalid: true }
      this.vehicleImage?.setErrors(errors)
    }

    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched()
      return
    }
    this.vehicleTypeService.addVehicle(this.vehicleType?.value, this.selectedFile).subscribe({
      next: (resposne: any) => {
        this.toast.success(resposne?.msg, "Added")
        this.getVehicle()
      },
      error: (error) => this.toast.error(error.error.error, "Error Occured"),
    })
  }

  getVehicle() {
    this.vehicleTypeService.fetchVehicle().subscribe({
      next: (response: any) => {
        this.vehicleTypeData = response
        console.log(this.vehicleTypeData)
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null

    if (this.selectedFile) {
      this.fileValidator()
      this.vehicleImage?.setValue(this.selectedFile.name)
    }
  }

  fileValidator() {
    const extension = this.selectedFile.name.split(".").pop()
    const allowedExtension = ["jpg", "jpeg", "png"]

    if (!allowedExtension.includes(extension.toLowerCase())) {
      this.invalidFile = true
    }
    if (this.selectedFile.size > 5 * 1024 * 1024) {
      this.fileSizeLarge = true
      return
    }
    this.fileSizeLarge = false
  }

  get vehicleType() {
    return this.vehicleForm.get("vehicleType")
  }
  get vehicleImage() {
    return this.vehicleForm.get("vehicleImage")
  }
}
