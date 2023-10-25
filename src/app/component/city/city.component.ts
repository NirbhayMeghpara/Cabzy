import { CityService } from "./../../services/city/city.service"
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { count } from "rxjs"
import { CountryService } from "src/app/services/country/country.service"
import { ToastService } from "src/app/services/toast.service"

interface Country {
  name: string
  flag: string
  alphaCode: string
  latLong: Coordinate[]
}

export interface Coordinate {
  lat: number
  lng: number
}

export interface City {
  _id: string
  name: string
  country: string
  location: string
  coordinates: Coordinates
}

type Coordinates = Array<{ lat: number; lng: number }>
type FormType = "Add" | "Edit"

@Component({
  selector: "app-city",
  templateUrl: "./city.component.html",
  styleUrls: ["./city.component.scss"],
})
export class CityComponent implements OnInit {
  displayedColumns: string[] = ["id", "name", "action"]
  dataSource: City[] = []
  countries!: Country[]
  polygonCoordinates: Coordinates = []
  polygonPaths: any = []
  cityPolygons: google.maps.Polygon[] = []

  form: FormType = "Add"
  showDropdown: boolean = false
  isDisable: boolean = false
  disableEditBtn: boolean = false
  selectedCountry!: { name: string; lat: number; lng: number; alphaCode: string }
  editCityID!: string
  pageIndex: number = 1
  pageSize: number = 4
  totalCityCounts: number = 0

  @ViewChild("country") countryElement!: ElementRef
  @ViewChild("city") cityElement!: ElementRef

  constructor(
    private countryService: CountryService,
    private cityService: CityService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  handlePage(event: any) {
    this.pageIndex = event.pageIndex + 1
    this.fetchCityData(this.selectedCountry.name, this.pageIndex)
  }

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

    if (countryName !== this.countryElement.nativeElement.innerText) {
      if (this.cityPolygons.length) {
        this.removePolygons() // Removing the previous country polygons
        this.cityPolygons = []
      }

      this.countryElement.nativeElement.innerText = countryName
      this.selectedCountry = {
        name: countryName,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        alphaCode,
      }
      this.pageIndex = 1
      this.fetchCityData(this.selectedCountry.name)
      // Map configuration
      this.centerMap(parseInt(lat), parseInt(lng), 5)
      this.drawingManager.setMap(null)
      this.autocompleteCity.setComponentRestrictions({ country: `${alphaCode}` })
    }
  }

  onCitySubmit() {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched()
      return
    }

    if (this.cityInputTag?.value) {
      if (this.form === "Add") {
        this.onAddCity(this.selectedCountry.name, this.cityInputTag.value, this.polygonCoordinates)
      } else if (this.form === "Edit") {
        this.onEditCity(this.cityInputTag.value)
      }
    }
    this.resetForm()
  }

  onAddCity(country: string, location: string, coordinates: Coordinate[]) {
    this.cityService.addCity(country, location, coordinates).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Created")
        this.pageIndex = Math.ceil((this.totalCityCounts + 1) / 4)
        this.fetchCityData(this.selectedCountry.name, this.pageIndex)
        this.centerMap(this.selectedCountry.lat, this.selectedCountry.lng, 5)
      },
      error: (error) => this.toast.error(error.error.error, "Error"),
    })
  }

  onEditCity(location: string) {
    if (!this.disableEditBtn) {
      this.polygonCoordinates = this.fetchPolygonCoordinate(this.currentPolygon)

      this.cityService.editCity(this.editCityID, this.polygonCoordinates).subscribe({
        next: (response: any) => {
          this.toast.success(response.msg, "Success")
          this.fetchCityData(this.selectedCountry.name, this.pageIndex)
          this.centerMap(this.selectedCountry.lat, this.selectedCountry.lng, 5)
        },
        error: (error) => this.toast.error(error.error.error, "Error"),
      })
    } else {
      this.toast.info("Please dont mess with our code", "Info")
    }
  }

  fetchCityData(country: string, pageIndex: number = 1) {
    this.cityService.getCities(country, pageIndex).subscribe({
      next: (data: any) => {
        if (this.cityPolygons.length) {
          this.removePolygons() // Removing the previous country polygons
          this.cityPolygons = []
        }

        this.totalCityCounts = data.cityCount
        this.dataSource = data.cities
        this.displayCityPolygons(this.dataSource)
      },
      error: (error) => {
        this.dataSource = []
        if (error.status === 404) this.toast.info(error.error.msg, "404")
      },
    })
  }

  editPolygon(index: number) {
    if (this.currentPolygon) {
      this.currentPolygon.setMap(null)
      this.currentPolygon = null
    }
    this.form = "Edit"
    this.disableEditBtn = true
    const city: City = this.dataSource[index]
    this.editCityID = city._id

    this.showDropdown = false // First minimize dropdown and then disable country field
    this.isDisable = true
    this.cityInputTag?.setValue(city.location)
    this.cityInputTag?.disable()

    this.currentPolygon = new google.maps.Polygon({
      paths: city.coordinates,
    })

    const path = this.currentPolygon.getPath()
    google.maps.event.addListener(path, "set_at", () => {
      this.disableEditBtn = false
    })
    google.maps.event.addListener(path, "insert_at", () => {
      this.disableEditBtn = false
    })
    // Calculating boundaries of polygon
    const bounds = new google.maps.LatLngBounds()
    this.currentPolygon.getPath().forEach((latLng: any) => bounds.extend(latLng))

    this.centerMap(bounds.getCenter().lat(), bounds.getCenter().lng(), 11)
    this.removePolygons()
    this.currentPolygon.setMap(this.map)
    this.currentPolygon.setEditable(true)
  }

  centerMap(lat: number, lng: number, zoomLevel: number) {
    this.map.setCenter({ lat, lng })
    this.map.setZoom(zoomLevel)
  }

  displayCityPolygons(cities: City[]) {
    this.polygonPaths = cities.map((city: any) => city.coordinates)

    for (let i = 0; i < this.polygonPaths.length; i++) {
      const polygon = new google.maps.Polygon({
        paths: this.polygonPaths[i],
      })
      polygon.setMap(this.map)
      this.cityPolygons.push(polygon)
    }
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

  private async initMap() {
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
        this.cityElement.nativeElement,
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
        }
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          this.currentPolygon = event.overlay
          this.drawingManager.setDrawingMode(null)

          this.polygonCoordinates = this.fetchPolygonCoordinate(this.currentPolygon)
        }
      })

      google.maps.event.addListener(this.drawingManager, "drawingmode_changed", () => {
        const isDrawingMode = this.drawingManager.getDrawingMode() !== null
        if (isDrawingMode || this.currentPolygon) this.cityInputTag?.disable()
      })
    })
  }

  fetchPolygonCoordinate(polygon: google.maps.Polygon) {
    const coordinates = polygon.getPath().getArray()

    return coordinates.map((coordinate) => {
      return { lat: coordinate.lat(), lng: coordinate.lng() }
    })
  }

  onSelectPlace(place: google.maps.places.PlaceResult) {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      this.centerMap(lat, lng, 12)
      this.drawingManager.setMap(this.map)
    }
  }

  resetForm() {
    this.currentPolygon.setMap(null)
    this.currentPolygon = null
    if (this.form === "Add") {
      this.drawingManager.setDrawingMode(null)
      this.drawingManager.setMap(null)
    }
    this.cityForm.reset()
    this.cityInputTag?.enable()
    this.cityInputTag?.setErrors(null)
    this.cityForm.updateValueAndValidity()
    this.centerMap(this.selectedCountry.lat, this.selectedCountry.lng, 5)
    this.form = "Add"
    this.isDisable = false
    this.disableEditBtn = false
    this.displayCityPolygons(this.dataSource)
  }

  get cityInputTag() {
    return this.cityForm.get("city")
  }
}
