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
  changeOccured: boolean = false
  callback: Function

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private driverService: DriverService,
    private vehiclePriceService: VehiclePriceService,
    private toast: ToastService
  ) {
    this.callback = data.callback
  }

  ngOnInit(): void {
    this.getVehicleTypes(this.data.driver.city.name)
  }

  getVehicleTypes(city: string) {
    this.vehiclePriceService.getAllPricing(city).subscribe({
      next: (data: any) => {
        this.serviceTypes = data
        this.serviceTypes.forEach((serviceType) => {
          if (serviceType._id === this.data.driver.serviceTypeID) {
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
    this.driverService.setServiceType(serviceType._id, this.data.driver._id).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Success")
        this.serviceTypes.forEach((serviceType) => (serviceType.isAssigned = false))
        serviceType.isAssigned = true
        this.alert = false
        this.changeOccured = true
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  removeType() {
    this.driverService.removeServiceType(this.data.driver._id).subscribe({
      next: (response: any) => {
        this.toast.warning(response.msg, "Removed", 5000)
        this.serviceTypes.forEach((serviceType) => (serviceType.isAssigned = false))
        this.alert = true
        this.changeOccured = true
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }
}
