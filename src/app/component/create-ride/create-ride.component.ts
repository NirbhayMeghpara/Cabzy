import { UserService } from "src/app/services/user/user.service"
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { CityService } from "src/app/services/city/city.service"
import { CountryService } from "src/app/services/country/country.service"
import { ToastService } from "src/app/services/toast.service"
import { CountryCode } from "../driver-list/driver-list.component"
import { User } from "../users/users.component"
import { SettingService } from "src/app/services/setting/setting.service"
import { VehiclePriceService } from "src/app/services/vehiclePrice/vehiclePrice.service"
import { Pricing } from "../vehical-price/vehical-price.component"
import { DatePipe } from "@angular/common"
import { generate } from "rxjs"

interface City {
  _id: string
  name: string
  country: string
  location: string
  coordinates: Object
}

@Component({
  selector: "app-create-ride",
  templateUrl: "./create-ride.component.html",
  styleUrls: ["./create-ride.component.scss"],
})
export class CreateRideComponent implements OnInit {
  countries!: CountryCode[]
  user!: User | undefined
  vehicles: Pricing[] = []
  pickUpZone: City[] = []
  step = 0
  sameRide: boolean = false
  showEstimatedFare: boolean = false
  stopList: string[] = []
  stopLocation: { lat: number; lng: number }[] = []

  userID!: string | undefined
  maxStops!: number
  currentStops = 0
  minDate!: string
  minTime!: string
  rideDate!: string | null
  rideTime!: string | null

  basePrice!: number
  basePriceDistance!: number
  unitDistancePrice!: number
  unitTimePrice!: number
  totalFarePrice!: number

  @ViewChild("pickUp") pickUpInput!: ElementRef
  @ViewChild("dropOff") dropOffInput!: ElementRef

  constructor(
    private countryService: CountryService,
    private userService: UserService,
    private cityService: CityService,
    private vehiclePriceService: VehiclePriceService,
    private settingService: SettingService,
    private toast: ToastService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initMap()

    this.countryService.getCountryData().subscribe({
      next: (response: any) => {
        this.countries = response.map((country: any) => ({
          name: country.name,
          flag: country.flag,
          code: country.code,
        }))
      },
    })

    this.settingService.getSettings().subscribe({
      next: (response: any) => {
        this.maxStops = response[0].stops
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })

    this.dropOffLocation?.disable()
  }

  setStep(index: number) {
    this.step = index
  }

  nextStep() {
    this.step++
    if (this.step === 1) {
      this.userID = this.user?._id
    }
    if (this.step === 2) {
      this.rideBookForm.reset()
      this.rideBookForm.updateValueAndValidity()
      this.restrictDateAndTime()
    }
  }

  prevStep() {
    this.step--
    if (this.step === 1 || this.step === 0) {
      this.rideDetailsForm.reset()
      this.dropOffLocation?.disable()
      this.rideDetailsForm.updateValueAndValidity()
      this.pickUpZone = []
      this.directionsRenderer.setMap(null)
      this.map.setCenter(this.myCoordinate)
      this.map.setZoom(10)
      this.journeyDistance = 0
      this.journeyTime = 0
      this.showEstimatedFare = false
    }
  }

  userDetailsForm: FormGroup = this.fb.group({
    phoneCode: ["", [Validators.required]],
    phone: ["", [Validators.required, Validators.pattern("[0-9]+")]],
  })

  rideDetailsForm: FormGroup = this.fb.group({
    pickUpLocation: ["", [Validators.required]],
    dropOffLocation: ["", [Validators.required]],
  })

  rideBookForm: FormGroup = this.fb.group({
    vehicleType: ["", [Validators.required]],
    scheduleRide: ["", [Validators.required]],
  })

  getUser() {
    if (this.userDetailsForm.invalid) {
      this.userDetailsForm.markAllAsTouched()
      return
    }

    const phoneCode = this.phoneCode?.value
    const phone = this.phone?.value

    this.userService.getUserByPhone(phoneCode, phone).subscribe({
      next: (response: any) => {
        this.user = response
      },
      error: (error) => {
        if (error.status === 404) {
          this.toast.error(error.error.msg, "404")
          return
        }
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  addStopInput() {
    if (this.pickUpZone.length === 0) {
      this.toast.info("No zone is available for your pick up location", "Info")
      return
    }

    let index: number = 1
    this.stopList.forEach((stop) => {
      if (!stop.includes(`${index}`)) {
        return
      }
      index++
    })

    this.rideDetailsForm.addControl(`stop${index}`, this.fb.control("", [Validators.required]))
    this.rideDetailsForm.updateValueAndValidity()
    this.stopList.push(`stop${index}`)
    this.cdRef.detectChanges()

    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(`stop${index}`) as HTMLInputElement
    )

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      this.sameRide = false
      this.rideDetailsForm.get(`stop${index}`)?.setValue(place.formatted_address)
      if (place.geometry && place.geometry.location) {
        this.stopLocation.push({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })

        this.waypoints.push({
          location: place.geometry.location,
          stopover: true,
        })
        this.toast.info(`${this.currentStops} stop added.`, "Info")
      }
    })
    this.currentStops++
  }

  removeStopInput(stop: string) {
    const i = this.stopList.indexOf(stop)

    if (i !== -1) {
      this.rideDetailsForm.removeControl(stop)
      this.stopList.splice(i, 1)
      this.waypoints.splice(i, 1)
      this.stopLocation.splice(i, 1)
      this.currentStops--
      this.rideDetailsForm.updateValueAndValidity()
    }
  }

  onKeydownDropOff() {
    if (this.pickUpZone.length === 0) {
      this.dropOffLocation?.disable()
      this.toast.info("Please don't mess with our product", "Info")
    }
  }

  resetForm() {
    this.userDetailsForm.reset()
    this.userDetailsForm.updateValueAndValidity()
    this.user = undefined
  }

  getVehicleTypes(city: string) {
    this.vehiclePriceService.getAllPricing(city).subscribe({
      next: (data: any) => {
        this.vehicles = data

        if (this.vehicles.length) {
          this.dropOffLocation?.enable()
          this.dropOffInput.nativeElement.focus()
        } else {
          this.dropOffLocation?.disable()
          this.toast.info(
            "Unfortunately, there are no available service types at your current location.",
            "Info"
          )
        }
      },
      error: (error) => {
        this.vehicles = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  restrictDateAndTime() {
    const currentDate = new Date()

    // Add 15 minutes to the current time
    const newDate = new Date(currentDate.getTime() + 15 * 60 * 1000) // Add 15 minutes in milliseconds

    this.minTime = `${newDate.getHours()}:${newDate.getMinutes()}`

    // Check if the new time is on the next day
    if (newDate.getDate() !== currentDate.getDate()) {
      this.minDate = newDate.toISOString().split("T")[0] // Get the date in YYYY-MM-DD format
    } else {
      this.minDate = currentDate.toISOString().split("T")[0] // Get the date in YYYY-MM-DD format
    }
  }

  onDateChange(event: any) {
    const selectedDate = new Date(event.value)
    const currentDate = new Date()
    this.generateDateAndTime(selectedDate.toString())

    if (selectedDate.getDate() !== currentDate.getDate()) {
      this.minTime = "00:00" // Set minimum time to midnight
    } else this.restrictDateAndTime()
  }

  onTimeSet(event: any) {
    this.rideTime = event
  }

  onRadioChange(event: any) {
    if (event.value === "later") {
      this.rideBookForm.addControl("rideDateControl", this.fb.control("", [Validators.required]))
      this.rideBookForm.addControl("rideTimeControl", this.fb.control("", [Validators.required]))
      this.rideDetailsForm.updateValueAndValidity()
      this.cdRef.detectChanges()
    }
    this.rideDateControl?.reset()
    this.rideTimeControl?.reset()
    this.rideBookForm.updateValueAndValidity()
  }

  generateDateAndTime(scheduleDate?: string) {
    let date
    if (!scheduleDate) {
      date = new Date()
      const formattedDate = new DatePipe("en-US").transform(date, "MM/dd/yyyy")

      const hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? "PM" : "AM"
      const formattedTime = `${hours % 12}:${minutes.toString().padStart(2, "0")} ${ampm}`

      this.rideDate = formattedDate
      this.rideTime = formattedTime

      console.log(this.rideDate)
      console.log(this.rideTime)
    } else {
      date = new Date(scheduleDate)
      const formattedDate = new DatePipe("en-US").transform(date, "MM/dd/yyyy")

      this.rideDate = formattedDate
    }
  }

  calculateRideFare(index: number) {
    const selectedServiceType = this.vehicles[index]

    this.showEstimatedFare = true
    if (this.journeyDistance >= selectedServiceType.basePriceDistance) {
      this.totalFarePrice = Math.round(
        selectedServiceType.basePrice +
          (this.journeyDistance - selectedServiceType.basePriceDistance) *
            selectedServiceType.unitDistancePrice +
          this.journeyTime * selectedServiceType.unitTimePrice
      )
    } else {
      this.totalFarePrice = Math.round(
        selectedServiceType.basePrice + this.journeyTime * selectedServiceType.unitTimePrice
      )
    }

    if (this.totalFarePrice < selectedServiceType.minFare) {
      this.totalFarePrice = selectedServiceType.minFare
    }
  }

  onRequestRide() {
    if (this.rideBookForm.invalid) {
      this.rideBookForm.markAllAsTouched()
      return
    }

    if (this.scheduleRide?.value === "now") {
      this.generateDateAndTime()
    }
  }

  // Google Map

  map!: google.maps.Map
  autocompletePickUp!: google.maps.places.Autocomplete
  autocompleteDropOff!: google.maps.places.Autocomplete
  autocompleteStop!: google.maps.places.Autocomplete
  selectedPickUpPlace!: google.maps.places.PlaceResult
  selectedDropOffPlace!: google.maps.places.PlaceResult
  directionsService!: google.maps.DirectionsService
  directionsRenderer!: google.maps.DirectionsRenderer
  myCoordinate!: { lat: number; lng: number }

  waypoints: google.maps.DirectionsWaypoint[] = []
  journeyDistance: number = 0
  journeyTime: number = 0

  private async initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.myCoordinate = { lat: position.coords.latitude, lng: position.coords.longitude }
      const mapOptions = {
        center: this.myCoordinate,
        zoom: 10,
        mapTypeId: "roadmap",
      }

      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions)

      this.autocompletePickUp = new google.maps.places.Autocomplete(this.pickUpInput.nativeElement)
      this.autocompleteDropOff = new google.maps.places.Autocomplete(this.dropOffInput.nativeElement)

      this.autocompletePickUp.addListener("place_changed", () => {
        this.selectedPickUpPlace = this.autocompletePickUp.getPlace()
        this.pickUpLocation?.setValue(this.selectedPickUpPlace.formatted_address)
        this.sameRide = false
        this.onSelectPickUp(this.selectedPickUpPlace)
      })

      this.autocompleteDropOff.addListener("place_changed", () => {
        this.selectedDropOffPlace = this.autocompleteDropOff.getPlace()
        this.dropOffLocation?.setValue(this.selectedDropOffPlace.formatted_address)
        this.sameRide = false
      })

      this.directionsService = new google.maps.DirectionsService()
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeWeight: 3, // Thickness of the route line
        },
      })
    })
  }

  onSelectPickUp(location: google.maps.places.PlaceResult) {
    const lat = location.geometry?.location?.lat()
    const lng = location.geometry?.location?.lng()

    if (lat && lng) {
      this.cityService.findCity(lat, lng).subscribe({
        next: (response: any) => {
          this.pickUpZone = response
          if (this.pickUpZone.length) {
            this.getVehicleTypes(this.pickUpZone[0].name)
          } else {
            this.toast.info("No zone is available at your location", "Info")
          }
        },
        error: (error) => this.toast.error(error.error.error, "Error"),
      })
    } else {
      this.toast.error("Something went wrong. Please try again !!", "Error")
      this.pickUpLocation?.reset()
      this.rideDetailsForm.updateValueAndValidity()
    }
  }

  calculateRoute() {
    const pickUpLocation = this.pickUpLocation?.value
    const dropOffLocation = this.dropOffLocation?.value

    if (this.rideDetailsForm.invalid) {
      this.rideDetailsForm.markAllAsTouched()
      return
    }

    if (this.sameRide) {
      return
    }
    this.sameRide = true
    if (pickUpLocation && dropOffLocation) {
      const request: google.maps.DirectionsRequest = {
        origin: pickUpLocation,
        destination: dropOffLocation,
        waypoints: this.waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      }

      this.directionsService.route(request, async (response, status) => {
        if (status === "OK") {
          // Displaying route between pickUp and dropOff Locations
          this.directionsRenderer.setMap(this.map)
          this.directionsRenderer.setDirections(response)
          if (response) {
            // Calculating data related to route

            const route = response.routes[0]
            route.legs.forEach((leg) => {
              if (leg.distance?.value) {
                this.journeyDistance = this.journeyDistance + leg?.distance?.value
              }
              if (leg.duration?.value) {
                this.journeyTime = this.journeyTime + leg?.duration?.value
              }
            })
            this.journeyDistance = parseFloat((this.journeyDistance / 1000).toFixed(2))
            this.journeyTime = parseFloat((this.journeyTime / 60).toFixed(0))
          }
        } else if (status === "NOT_FOUND") {
          this.toast.error("One or more locations could not be found.", "Error")
        } else if (status === "ZERO_RESULTS") {
          this.toast.error("No routes available between the specified locations.", "Error")
        } else {
          this.toast.error("Something went wrong. Please try again", "Error")
          this.directionsRenderer.setMap(null) // Clear the route if source or destination is empty
        }
      })
    } else {
      this.toast.info("Please select locations", "Ride")
    }
  }

  get phoneCode() {
    return this.userDetailsForm.get("phoneCode")
  }
  get phone() {
    return this.userDetailsForm.get("phone")
  }
  get pickUpLocation() {
    return this.rideDetailsForm.get("pickUpLocation")
  }
  get dropOffLocation() {
    return this.rideDetailsForm.get("dropOffLocation")
  }
  get vehicleType() {
    return this.rideBookForm.get("vehicleType")
  }
  get scheduleRide() {
    return this.rideBookForm.get("scheduleRide")
  }
  get rideDateControl() {
    return this.rideBookForm.get("rideDateControl")
  }
  get rideTimeControl() {
    return this.rideBookForm.get("rideTimeControl")
  }
}
