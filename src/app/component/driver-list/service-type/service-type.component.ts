import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"
import { DriverService } from "src/app/services/driver/driver.service"
import { VehiclePriceService } from "src/app/services/vehiclePrice/vehiclePrice.service"

@Component({
  selector: "app-service-type",
  templateUrl: "./service-type.component.html",
  styleUrls: ["./service-type.component.scss"],
})
export class ServiceTypeComponent implements OnInit {
  serviceTypes: any[] = []

  serviceTypeElement: any
  alert: boolean = true
  noServiceType!: boolean

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private driverService: DriverService,
    private vehiclePriceService: VehiclePriceService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.getVehicleTypes(this.data.driver.city)
  }

  getVehicleTypes(city: string) {
    this.vehiclePriceService.getAllPricing(city).subscribe({
      next: (data: any) => {
        this.serviceTypes = data
        this.serviceTypes.forEach((serviceType) => {
          if (serviceType.vehicleType === this.data.driver.serviceType) {
            this.alert = false
            serviceType.isAssigned = true
          }
        })

        this.noServiceType = false
      },
      error: (error) => {
        this.serviceTypes = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
        this.noServiceType = true
      },
    })
  }

  setServiceType(index: number) {
    const serviceType = this.serviceTypes[index]
    if (serviceType.isAssigned) {
      this.toast.info("This service type is already assigned to driver", "Info")
      return
    }
    this.driverService.setServiceType(serviceType.vehicleType, this.data.driver._id).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Success")
        this.serviceTypes.forEach((serviceType) => (serviceType.isAssigned = false))
        serviceType.isAssigned = true
        this.alert = false
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  removeType(index: number) {
    const serviceType = this.serviceTypes[index]
    this.driverService.removeServiceType(this.data.driver._id).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Removed")
        this.serviceTypes.forEach((serviceType) => (serviceType.isAssigned = false))
        this.alert = true
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }
}
