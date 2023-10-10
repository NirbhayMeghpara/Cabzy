import { UserService } from "src/app/services/user/user.service"
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { CityService } from "src/app/services/city/city.service"
import { CountryService } from "src/app/services/country/country.service"
import { DriverService } from "src/app/services/driver/driver.service"
import { ToastService } from "src/app/services/toast.service"
import { CountryCode } from "../driver-list/driver-list.component"
import { User } from "../users/users.component"
import { SettingService } from "src/app/services/setting/setting.service"

@Component({
  selector: "app-create-ride",
  templateUrl: "./create-ride.component.html",
  styleUrls: ["./create-ride.component.scss"],
})
export class CreateRideComponent implements OnInit {
  countries!: CountryCode[]
  user!: User | undefined
  step = 0
  showStopInput: boolean = false
  showAddStopBtn: boolean = false
  stopList: string[] = []

  userID!: string | undefined
  selectedDate: Date = new Date()

  maxStops!: number
  currentStops = 0

  @ViewChild("pickUp") pickUpInput!: ElementRef
  @ViewChild("dropOff") dropOffInput!: ElementRef
  @ViewChild("stopInput") stopInput!: ElementRef

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
    if (this.step === 1) this.userID = this.user?._id
  }

  prevStep() {
    this.step--
  }

  userDetailsForm: FormGroup = this.fb.group({
    phoneCode: ["", [Validators.required]],
    phone: ["", [Validators.required, Validators.pattern("[0-9]+")]],
  })

  rideDetailsForm: FormGroup = this.fb.group({
    pickUpLocation: ["", [Validators.required]],
    dropOffLocation: ["", [Validators.required]],
    // stopLocation: ["", [Validators.required]],
    // rideDate: ["", [Validators.required]],
    // rideTime: ["", [Validators.required]],
    // stops: this.fb.array([]),
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

    console.log(`stop${index}`)
    console.log(this.stopList)
    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(`stop${index}`) as HTMLInputElement
    )

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      this.rideDetailsForm.get(`stop${index}`)?.setValue(place.formatted_address)
      if (place.geometry && place.geometry.location) {
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
      this.currentStops--
      this.rideDetailsForm.updateValueAndValidity()
    }
    console.log(stop)
    console.log(this.stopList)
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

  // Google Map

  map!: google.maps.Map
  autocompletePickUp!: google.maps.places.Autocomplete
  autocompleteDropOff!: google.maps.places.Autocomplete
  autocompleteStop!: google.maps.places.Autocomplete
  selectedPickUpPlace!: google.maps.places.PlaceResult
  selectedDropOffPlace!: google.maps.places.PlaceResult
  directionsService!: google.maps.DirectionsService
  directionsRenderer!: google.maps.DirectionsRenderer

  waypoints: google.maps.DirectionsWaypoint[] = []

  private async initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
      const myCoordinate = { lat: position.coords.latitude, lng: position.coords.longitude }
      const mapOptions = {
        center: myCoordinate,
        zoom: 10,
        mapTypeId: "roadmap",
      }

      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions)

      this.autocompletePickUp = new google.maps.places.Autocomplete(this.pickUpInput.nativeElement)
      this.autocompleteDropOff = new google.maps.places.Autocomplete(this.dropOffInput.nativeElement)

      this.autocompletePickUp.addListener("place_changed", () => {
        this.selectedPickUpPlace = this.autocompletePickUp.getPlace()
        this.pickUpLocation?.setValue(this.selectedPickUpPlace.formatted_address)

        if (this.selectedPickUpPlace.address_components) {
          // Access the address components
          const addressComponent = this.selectedPickUpPlace.address_components

          let city, state, country

          // Loop through address components
          for (let i = 0; i < addressComponent.length; i++) {
            const types = addressComponent[i].types

            if (types.includes("locality")) {
              city = addressComponent[i].long_name
            } else if (types.includes("administrative_area_level_1")) {
              state = addressComponent[i].long_name
            } else if (types.includes("country")) {
              country = addressComponent[i].long_name
            }
          }

          const location = `${city}, ${state}, ${country}`
          console.log(location)
        } else {
          console.log("No results found")
        }

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

  addStop() {
    if (this.currentStops < this.maxStops) {
      const place = this.autocompleteStop.getPlace()
      if (place.geometry && place.geometry.location) {
        this.waypoints.push({
          location: place.geometry.location,
          stopover: true,
        })
        this.currentStops++
        this.calculateRoute()
        this.toast.info(`${this.currentStops} stop added.`, "Info")
      }
    }
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
            let distance: number = 0
            let time: number = 0

            console.log(response)
            const route = response.routes[0]
            route.legs.forEach((leg) => {
              if (leg.distance?.value) {
                distance = distance + leg?.distance?.value
              }
              if (leg.duration?.value) {
                time = time + leg?.duration?.value
              }
            })
            // const distance = route?.legs[0]?.distance?.text
            // const time = route?.legs[0]?.duration?.text
            distance = distance / 1000
            time = parseFloat((time / 60).toFixed(0))

            console.log("Km", distance)
            console.log("Min", time)
          }

          // document.getElementById('distance').innerText = `Distance: ${distance}`;
          // document.getElementById('time').innerText = `Time: ${time}`;

          // document.getElementById('meterBox').style.display = 'flex'
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

  get pickUpLocation() {
    return this.rideDetailsForm.get("pickUpLocation")
  }
  get dropOffLocation() {
    return this.rideDetailsForm.get("dropOffLocation")
  }
  get stops() {
    return this.rideDetailsForm.get("stops") as FormArray
  }
  get stopLocation() {
    return this.rideDetailsForm.get("stopLocation")
  }
  get phoneCode() {
    return this.userDetailsForm.get("phoneCode")
  }
  get phone() {
    return this.userDetailsForm.get("phone")
  }
}
