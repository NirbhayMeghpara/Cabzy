import { CityService } from "./../../services/city/city.service"
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { CountryService } from "src/app/services/country/country.service"
import { ToastService } from "src/app/services/toast.service"

export interface City {
  id: number
  name: string
}

interface Country {
  name: string
  flag: string
  alphaCode: string
  latLong: Coordinate[]
}

interface Coordinate {
  lat: number
  lng: number
}

type Coordinates = Array<{ lat: number; lng: number }>

const ELEMENT_DATA: City[] = [
  {
    id: 1,
    name: "Rajkot",
  },
  {
    id: 2,
    name: "Ahmedabad",
  },
  {
    id: 3,
    name: "Surat",
  },
  {
    id: 4,
    name: "Vadodara",
  },
]

@Component({
  selector: "app-city",
  templateUrl: "./city.component.html",
  styleUrls: ["./city.component.scss"],
})
export class CityComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["id", "name", "action"]
  dataSource = ELEMENT_DATA
  countries!: Country[]
  polygonCoordinates: Coordinates = []

  isActive: boolean = false
  isDisable: boolean = false
  selectedCountry: string = ""

  @ViewChild("city") cityInput!: ElementRef

  constructor(
    private countryService: CountryService,
    private cityService: CityService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initMap()

    this.countryService.getCountryData().subscribe({
      next: (response: any) => {
        this.countries = response.map(({ name, flag, alphaCode, latLong }: Country) => ({
          name,
          flag,
          alphaCode,
          latLong,
        }))
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  ngAfterViewInit(): void {
    this.initMap()
  }

  cityForm: FormGroup = this.fb.group({
    city: [{ value: "", disabled: true }, [Validators.required]],
  })

  toggleDropdown() {
    if (this.isDisable) {
      return
    }
    this.isActive = !this.isActive
  }

  onSelect(countryName: string, lat: string, lng: string, alphaCode: string) {
    this.cityInputTag?.enable()

    this.selectedCountry = countryName
    this.map.setCenter({ lat: parseInt(lat), lng: parseInt(lng) })
    this.map.setZoom(5)

    this.autocompleteCity.setComponentRestrictions({ country: `${alphaCode}` })
  }

  onCitySubmit() {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched()
      return
    }

    const name = this.cityInputTag?.value

    this.cityService.addCity(name, this.polygonCoordinates).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Added")
        // this.getCity()
      },
      error: (error) => this.toast.error(error.error.error, "Error Occured"),
    })
    this.onCancel()
  }

  // Google Map

  map!: google.maps.Map
  marker!: google.maps.Marker
  drawingManager!: google.maps.drawing.DrawingManager
  autocompleteCity!: any
  currentPolygon!: any

  async initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
      const myCoordinate = { lat: position.coords.latitude, lng: position.coords.longitude }
      const mapOptions = {
        center: myCoordinate,
        zoom: 10,
        mapTypeId: "roadmap",
      }

      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions)

      const autocompleteOptions = {
        types: ["(cities)"],
      }
      this.autocompleteCity = new google.maps.places.Autocomplete(
        this.cityInput.nativeElement,
        autocompleteOptions
      )

      this.autocompleteCity.addListener("place_changed", () => {
        const selectedPlace = this.autocompleteCity.getPlace()
        this.cityInputTag?.setValue(selectedPlace.vicinity)
        this.onSelectPlace(selectedPlace)
      })

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
      })

      google.maps.event.addListener(this.drawingManager, "overlaycomplete", (event: any) => {
        if (this.currentPolygon) {
          this.currentPolygon.setMap(null)
          this.polygonCoordinates = []
        }
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          this.currentPolygon = event.overlay
          // this.currentPolygon.setOptions({ editable: true })
          this.drawingManager.setDrawingMode(null)

          const coordinates = this.currentPolygon.getPath().getArray()

          for (let i = 0; i < coordinates.length; i++) {
            const lat = coordinates[i].lat()
            const lng = coordinates[i].lng()
            this.polygonCoordinates.push({ lat, lng })
          }
          console.log(this.polygonCoordinates)
        }
      })
    })
  }

  onSelectPlace(place: google.maps.places.PlaceResult) {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      this.map.setCenter({ lat, lng })
      this.map.setZoom(12)
      this.drawingManager.setMap(this.map)
    }
  }

  onCancel() {
    this.cityForm.reset()
    this.cityInputTag?.setErrors(null)
    this.currentPolygon.setMap(null)
    this.currentPolygon = null
    this.polygonCoordinates = []
    this.cityForm.updateValueAndValidity()
  }

  get cityInputTag() {
    return this.cityForm.get("city")
  }
}
