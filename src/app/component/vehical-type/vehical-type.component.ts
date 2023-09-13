import { Component } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { ToastService } from "src/app/services/toast.service"
import { VehicleTypeService } from "src/app/services/vehicleType/vehicle-type.service"

@Component({
  selector: "app-vehical-type",
  templateUrl: "./vehical-type.component.html",
  styleUrls: ["./vehical-type.component.scss"],
})
export class VehicalTypeComponent {
  selectedFile: any = null

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private vehicleTypeService: VehicleTypeService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  vehicleForm: FormGroup = this.fb.group({
    vehicleType: ["", [Validators.required]],
    vehicleImage: ["", [Validators.required]],
  })

  onVehicleSave() {
    this.vehicleTypeService
      .addVehicle(this.vehicleType?.value, this.selectedFile)
      .subscribe((resposne: any) => {
        this.toast.success(resposne?.msg, "Success")
      })
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null

    if (this.selectedFile !== null) {
      this.vehicleForm.get("vehicleImage")?.setValue(this.selectedFile.name)
    }
  }

  get vehicleType() {
    return this.vehicleForm.get("vehicleType")
  }
  get vehicleImage() {
    return this.vehicleForm.get("vehicleImage")
  }
}
