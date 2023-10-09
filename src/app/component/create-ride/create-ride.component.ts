import { UserService } from "src/app/services/user/user.service"
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { CityService } from "src/app/services/city/city.service"
import { CountryService } from "src/app/services/country/country.service"
import { DriverService } from "src/app/services/driver/driver.service"
import { ToastService } from "src/app/services/toast.service"
import { CountryCode } from "../driver-list/driver-list.component"
import { User } from "../users/users.component"

@Component({
  selector: "app-create-ride",
  templateUrl: "./create-ride.component.html",
  styleUrls: ["./create-ride.component.scss"],
})
export class CreateRideComponent implements OnInit {
  countries!: CountryCode[]
  user!: User | undefined
  step = 0

  userID!: string | undefined
  selectedDate: Date = new Date()

  @ViewChild("pickUp") pickUpInput!: ElementRef
  @ViewChild("dropOff") dropOffInput!: ElementRef

  constructor(
    private countryService: CountryService,
    private userService: UserService,
    private cityService: CityService,
    private driverService: DriverService,
    private toast: ToastService,
    private fb: FormBuilder
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
    stops: ["", [Validators.required]],
    rideDate: ["", [Validators.required]],
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

  resetForm() {
    this.userDetailsForm.reset()
    this.userDetailsForm.updateValueAndValidity()
    this.user = undefined
  }

  // Google Map

  map!: google.maps.Map
  marker!: google.maps.Marker
  drawingManager!: google.maps.drawing.DrawingManager
  autocompletePickUp!: google.maps.places.Autocomplete
  autocompleteDropOff!: google.maps.places.Autocomplete
  currentPolygon!: any
  selectedPlace!: google.maps.places.PlaceResult

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
      let autocompleteDropOff = new google.maps.places.Autocomplete(this.dropOffInput.nativeElement)

      this.autocompletePickUp.addListener("place_changed", () => {
        this.selectedPlace = this.autocompletePickUp.getPlace()
        this.pickUpLocation?.setValue(this.selectedPlace.formatted_address)
        console.log(this.selectedPlace.formatted_address)
        if (this.selectedPlace.address_components) {
          // Access the address components
          const addressComponent = this.selectedPlace.address_components

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

        this.onSelectPickUp(this.selectedPlace)
      })
    })
  }

  onSelectPickUp(location: google.maps.places.PlaceResult) {
    // const
  }

  get pickUpLocation() {
    return this.rideDetailsForm.get("pickUpLocation")
  }
  get dropOffLocation() {
    return this.rideDetailsForm.get("dropOffLocation")
  }
  get phoneCode() {
    return this.userDetailsForm.get("phoneCode")
  }
  get phone() {
    return this.userDetailsForm.get("phone")
  }
}
