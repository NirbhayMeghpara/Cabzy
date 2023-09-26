import { CityService } from "./../../services/city/city.service"
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { count } from "rxjs"
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

interface Cities {
  name: string
  country: string
  location: string
  coordinates: Coordinates
}

type Coordinates = Array<{ lat: number; lng: number }>

@Component({
  selector: "app-city",
  templateUrl: "./city.component.html",
  styleUrls: ["./city.component.scss"],
})
export class CityComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["id", "name", "action"]
  dataSource = []
  countries!: Country[]
  polygonCoordinates: Coordinates = []
  polygonPaths: any = []
  cityPolygons: google.maps.Polygon[] = []

  showDropdown: boolean = false
  isDisable: boolean = false
  selectedCountry!: string

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
    this.showDropdown = !this.showDropdown
  }

  onSelectCountry(countryName: string, lat: string, lng: string, alphaCode: string) {
    this.cityInputTag?.enable()
    this.cityInputTag?.reset()
    if (countryName !== this.selectedCountry) {
      this.selectedCountry = countryName
      this.fetchCityData(this.selectedCountry)
      // Map configuration

      console.log(countryName)
      console.log(lat)
      console.log(lng)
      this.map.setCenter({ lat: parseInt(lat), lng: parseInt(lng) })
      this.map.setZoom(5)
      this.drawingManager.setMap(null)
      this.autocompleteCity.setComponentRestrictions({ country: `${alphaCode}` })
    }

    if (this.cityPolygons.length) {
      this.removePolygons()
    }
  }

  onCitySubmit() {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched()
      return
    }

    const location = this.cityInputTag?.value

    if (this.selectedPlace.vicinity && location) {
      this.cityService
        .addCity(this.selectedPlace.vicinity, this.selectedCountry, location, this.polygonCoordinates)
        .subscribe({
          next: (response: any) => {
            this.toast.success(response.msg, "Created")
            this.fetchCityData(this.selectedCountry)
          },
          error: (error) => this.toast.error(error.error.error, "Error Occured"),
        })
    }
    this.resetForm()
    console.log(this.polygonCoordinates)
  }

  fetchCityData(country: string) {
    this.cityService.getCities(country).subscribe({
      next: (data: any) => {
        this.dataSource = data
        this.polygonPaths = this.dataSource.map((city: any) => JSON.parse(city.coordinates[0]))

        for (let i = 0; i <= this.polygonPaths.length; i++) {
          const polygon = new google.maps.Polygon({
            paths: this.polygonPaths[i],
          })
          polygon.setMap(this.map)
          this.cityPolygons.push(polygon)
        }
      },
      error: (error) => {
        this.dataSource = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  removePolygons() {
    this.cityPolygons.forEach((polygon) => {
      polygon.setMap(null)
    })
  }

  // Google Map

  map!: google.maps.Map
  marker!: google.maps.Marker
  drawingManager!: google.maps.drawing.DrawingManager
  autocompleteCity!: google.maps.places.Autocomplete
  currentPolygon!: any
  selectedPlace!: google.maps.places.PlaceResult

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
        this.selectedPlace = this.autocompleteCity.getPlace()
        this.cityInputTag?.setValue(this.selectedPlace.formatted_address)
        this.onSelectPlace(this.selectedPlace)
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
        }
      })

      google.maps.event.addListener(this.drawingManager, "drawingmode_changed", () => {
        const isDrawingMode = this.drawingManager.getDrawingMode() !== null
        if (isDrawingMode || this.currentPolygon) this.cityInputTag?.disable()
        else this.cityInputTag?.enable()
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

  resetForm() {
    this.currentPolygon.setMap(null)
    this.currentPolygon = null
    // this.polygonCoordinates = []
    this.drawingManager.setDrawingMode(null)
    this.drawingManager.setMap(null)
    this.cityForm.reset()
    this.cityInputTag?.setErrors(null)
    this.cityForm.updateValueAndValidity()
  }

  get cityInputTag() {
    return this.cityForm.get("city")
  }
}
