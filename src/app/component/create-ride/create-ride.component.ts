import { UserService } from "src/app/services/user/user.service"
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { CityService } from "src/app/services/city/city.service"
import { CountryService } from "src/app/services/country/country.service"
import { DriverService } from "src/app/services/driver/driver.service"
import { ToastService } from "src/app/services/toast.service"
import { CountryCode } from "../driver-list/driver-list.component"
import { User } from "../users/users.component"
import { SettingService } from "src/app/services/setting/setting.service"
import { DatePipe } from "@angular/common"

@Component({
  selector: "app-create-ride",
  templateUrl: "./create-ride.component.html",
  styleUrls: ["./create-ride.component.scss"],
})
export class CreateRideComponent implements OnInit {
  countries!: CountryCode[]
  user!: User | undefined
  vehicles: string[] = ["Suv", "Sedan"]
  step = 0
  stopList: string[] = []
  stopLocation: { lat: number; lng: number }[] = []

  userID!: string | undefined
  selectedDate: Date = new Date()

  maxStops!: number
  currentStops = 0

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
    private driverService: DriverService,
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
      // this.rideBookForm.reset()
      // this.rideBookForm.updateValueAndValidity()
    }
  }

  prevStep() {
    this.step--
    if (this.step === 1) {
      this.rideDetailsForm.reset()
      this.rideDetailsForm.updateValueAndValidity()
      this.directionsRenderer.setMap(null)
      this.map.setCenter(this.myCoordinate)
      this.map.setZoom(10)
      this.journeyDistance = 0
      this.journeyTime = 0
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
    rideDate: [Date.now(), [Validators.required]],
    rideTime: ["", [Validators.required]],
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

    // console.log(`stop${index}`)
    // console.log(this.stopList)
    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(`stop${index}`) as HTMLInputElement
    )

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
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
    this.calculateRoute()
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
    // console.log(stop)
    // console.log(this.stopList)
  }

  // addStopInput() {
  //   this.stops.push(this.fb.control("", [Validators.required]))
  //   this.currentStops++
  // }

  // removeStopInput(index: number) {
  //   this.currentStops--
  //   this.stops.removeAt(index)
  // }

  // addStopInput() {
  //   this.showStopInput = true
  //   this.cdRef.detectChanges()
  //   this.autocompleteStop = new google.maps.places.Autocomplete(this.stopInput.nativeElement)

  //   this.autocompleteStop.addListener("place_changed", () => {
  //     this.showAddStopBtn = true
  //   })
  // }

  // removeStopInput() {
  //   this.showStopInput = false
  //   this.waypoints = []
  //   this.showAddStopBtn = false
  //   this.calculateRoute()
  //   this.toast.info("All the stops removed !!", "Ride")
  // }

  resetForm() {
    this.userDetailsForm.reset()
    this.userDetailsForm.updateValueAndValidity()
    this.user = undefined
  }

  calculateRideFare(distance: number, time: number) {
    if (distance > this.basePriceDistance) {
      this.totalFarePrice =
        this.basePrice +
        (distance - this.basePriceDistance) * this.unitDistancePrice +
        time * this.unitTimePrice
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

        this.onSelectPickUp(this.selectedPickUpPlace)
      })

      this.autocompleteDropOff.addListener("place_changed", () => {
        this.selectedDropOffPlace = this.autocompleteDropOff.getPlace()
        this.dropOffLocation?.setValue(this.selectedDropOffPlace.formatted_address)
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
    // const
  }

  calculateRoute() {
    const pickUpLocation = this.pickUpLocation?.value
    const dropOffLocation = this.dropOffLocation?.value

    if (this.rideDetailsForm.invalid) {
      this.rideDetailsForm.markAllAsTouched()
      return
    }

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
}
