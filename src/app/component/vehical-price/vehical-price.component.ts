import { VehiclePriceService } from "./../../services/vehiclePrice/vehiclePrice.service"
import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { max, min } from "rxjs"
import { CityService } from "src/app/services/city/city.service"
import { CountryService } from "src/app/services/country/country.service"
import { ToastService } from "src/app/services/toast.service"
import { VehicleTypeService } from "src/app/services/vehicleType/vehicle-type.service"
import { aboveEighty, maxAllowedSpace } from "src/app/shared/custom-validators/vehiclePricing.validator"

@Component({
  selector: "app-vehical-price",
  templateUrl: "./vehical-price.component.html",
  styleUrls: ["./vehical-price.component.scss"],
})
export class VehicalPriceComponent implements OnInit {
  selectedCountry: string = ""
  countries!: String[]
  cities!: String[]
  vehicles!: String[]
  distances: Number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  constructor(
    private countryService: CountryService,
    private cityService: CityService,
    private vehicleTypeService: VehicleTypeService,
    private vehiclePriceService: VehiclePriceService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.countryService.getCountryData().subscribe({
      next: (response: any) => {
        this.countries = response.map((country: any) => country.name)
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  pricingForm: FormGroup = this.fb.group({
    country: ["", [Validators.required]],
    city: ["", [Validators.required]],
    vehicleType: ["", [Validators.required]],
    driverProfit: ["", [Validators.required, aboveEighty]],
    minFare: ["", [Validators.required]],
    basePriceDistance: ["", [Validators.required]],
    basePrice: ["", [Validators.required]],
    unitDistancePrice: ["", [Validators.required]],
    unitTimePrice: ["", [Validators.required]],
    maxSpace: ["", [Validators.required, maxAllowedSpace]],
  })

  addVehiclePricing() {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched()
      return
    }

    const country = this.country?.value
    const city = this.city?.value
    const vehicleType = this.vehicleType?.value
    const driverProfit = this.driverProfit?.value
    const minFare = this.minFare?.value
    const basePriceDistance = this.basePriceDistance?.value
    const basePrice = this.basePrice?.value
    const unitDistancePrice = this.unitDistancePrice?.value
    const unitTimePrice = this.unitTimePrice?.value
    const maxSpace = this.maxSpace?.value

    // Repeat the above pattern for other variables (2 through 10)

    this.vehiclePriceService
      .addVehiclePrice(
        country,
        city,
        vehicleType,
        driverProfit,
        minFare,
        basePriceDistance,
        basePrice,
        unitDistancePrice,
        unitTimePrice,
        maxSpace
      )
      .subscribe({
        next: (response: any) => {
          this.toast.success(response.msg, "Added")
        },
        error: (error) => {
          if (error.status === 409) {
            this.toast.info(error.error.msg, "Oops !")
            return
          }
          this.toast.error(error.error.error, "Error")
        },
      })
    this.resetForm()
  }

  resetForm() {
    this.pricingForm.reset()
    this.pricingForm.updateValueAndValidity()
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

    this.vehicleTypeService.fetchVehicle().subscribe({
      next: (response: any) => {
        this.vehicles = response.map((vehicle: any) => vehicle.vehicleType)
      },
      error: (error) => {
        this.vehicles = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  get country() {
    return this.pricingForm.get("country")
  }
  get city() {
    return this.pricingForm.get("city")
  }
  get vehicleType() {
    return this.pricingForm.get("vehicleType")
  }
  get driverProfit() {
    return this.pricingForm.get("driverProfit")
  }
  get minFare() {
    return this.pricingForm.get("minFare")
  }
  get basePriceDistance() {
    return this.pricingForm.get("basePriceDistance")
  }
  get basePrice() {
    return this.pricingForm.get("basePrice")
  }
  get unitDistancePrice() {
    return this.pricingForm.get("unitDistancePrice")
  }
  get unitTimePrice() {
    return this.pricingForm.get("unitTimePrice")
  }
  get maxSpace() {
    return this.pricingForm.get("maxSpace")
  }
}
