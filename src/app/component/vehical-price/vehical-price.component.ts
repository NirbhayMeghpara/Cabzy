import { max } from "rxjs"
import { VehiclePriceService } from "./../../services/vehiclePrice/vehiclePrice.service"
import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { CityService } from "src/app/services/city/city.service"
import { CountryService } from "src/app/services/country/country.service"
import { ToastService } from "src/app/services/toast.service"
import { VehicleTypeService } from "src/app/services/vehicleType/vehicle-type.service"
import { aboveEighty, maxAllowedSpace } from "src/app/shared/custom-validators/vehiclePricing.validator"

export interface Pricing {
  _id: string
  country: string
  city: string
  vehicleType: string
  driverProfit: number
  minFare: number
  basePriceDistance: number
  basePrice: number
  unitDistancePrice: number
  unitTimePrice: number
  maxSpace: number
}

@Component({
  selector: "app-vehical-price",
  templateUrl: "./vehical-price.component.html",
  styleUrls: ["./vehical-price.component.scss"],
})
export class VehicalPriceComponent implements OnInit {
  displayedColumns: string[] = [
    "id",
    "city",
    "vehicleType",
    "driverProfit",
    "minFare",
    "basePriceDistance",
    "basePrice",
    "unitDistancePrice",
    "unitTimePrice",
    "maxSpace",
    "action",
  ]
  selectedCountry: string = ""
  selectedCity: string = ""
  countries!: string[]
  cities!: string[]
  vehicles!: string[]
  distances: Number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  dataSource: Pricing[] = []
  pageIndex: number = 1
  pageSize: number = 4
  totalPricingCounts: number = 0
  isDisable: boolean = false
  form: "Add" | "Edit" = "Add"
  editPricingID!: string

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

  onSubmitPricing() {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched()
      return
    }

    const country = this.country?.value
    const city = this.city?.value
    const vehicleType = this.vehicleType?.value
    const driverProfit = this.driverProfit?.value
    const minFare = this.minFare?.value
    const basePriceDistance = parseInt(this.basePriceDistance?.value)
    const basePrice = this.basePrice?.value
    const unitDistancePrice = this.unitDistancePrice?.value
    const unitTimePrice = this.unitTimePrice?.value
    const maxSpace = this.maxSpace?.value

    if (this.form === "Add") {
      this.onAddVehiclePricing(
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
    } else if (this.form === "Edit") {
      this.onEditVehiclePricing(
        this.editPricingID,
        driverProfit,
        minFare,
        basePriceDistance,
        basePrice,
        unitDistancePrice,
        unitTimePrice,
        maxSpace
      )
    }
    this.resetForm()
  }

  onAddVehiclePricing(
    country: string,
    city: string,
    vehicleType: string,
    driverProfit: number,
    minFare: number,
    basePriceDistance: number,
    basePrice: number,
    unitDistancePrice: number,
    unitTimePrice: number,
    maxSpace: number
  ) {
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
          this.pageIndex = Math.ceil((this.totalPricingCounts + 1) / 4)
          this.fetchPricingData(this.selectedCity, this.pageIndex)
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
    driverProfit: number,
    minFare: number,
    basePriceDistance: number,
    basePrice: number,
    unitDistancePrice: number,
    unitTimePrice: number,
    maxSpace: number
  ) {
    this.vehiclePriceService
      .editVehiclePrice(
        id,
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
          this.toast.success(response.msg, "Success")
          this.fetchPricingData(this.selectedCity, this.pageIndex)
        },
        error: (error) => {
          this.toast.error(error.error.error, "Error")
        },
      })
  }

  resetForm() {
    this.pricingForm.reset()
    this.pricingForm.updateValueAndValidity()
    this.form = "Add"
    this.country?.setValue(this.selectedCountry)
    this.city?.setValue(this.selectedCity)
    this.isDisable = false
  }

  fetchCity(country: String) {
    if (this.isDisable) {
      return
    }

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

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchPricingData(this.selectedCity, this.pageIndex)
  }

  onSelectCity(index: number) {
    if (this.isDisable) {
      return
    }
    this.selectedCity = this.cities[index]
    this.fetchPricingData(this.selectedCity, this.pageIndex)
  }

  fetchPricingData(city: string, page: number = 1) {
    this.vehiclePriceService.getPricing(city, page).subscribe({
      next: (data: any) => {
        this.totalPricingCounts = data.pricingCount
        this.dataSource = data.pricing
      },
      error: (error) => {
        this.dataSource = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  editPricing(index: number) {
    this.form = "Edit"
    this.isDisable = true
    const vehiclePricing: Pricing = this.dataSource[index]
    this.editPricingID = vehiclePricing._id

    this.country?.setValue(vehiclePricing.country)
    this.city?.setValue(vehiclePricing.city)
    this.vehicleType?.setValue(vehiclePricing.vehicleType)
    this.driverProfit?.setValue(vehiclePricing.driverProfit)
    this.minFare?.setValue(vehiclePricing.minFare)
    this.basePriceDistance?.setValue(String(vehiclePricing.basePriceDistance))
    this.basePrice?.setValue(vehiclePricing.basePrice)
    this.unitDistancePrice?.setValue(vehiclePricing.unitDistancePrice)
    this.unitTimePrice?.setValue(vehiclePricing.unitTimePrice)
    this.maxSpace?.setValue(vehiclePricing.maxSpace)
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
