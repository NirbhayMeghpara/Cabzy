import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { count } from "rxjs"

type Coordinates = Array<{ lat: number; lng: number }>

@Injectable({
  providedIn: "root",
})
export class CityService {
  constructor(private http: HttpClient) {}

  private _getCitiesUrl = "http://localhost:3000/city/fetch/"
  private _addCityUrl = "http://localhost:3000/city/add"

  addCity(name: string, country: string, location: string, coordinates: Coordinates) {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("country", country)
    formData.append("location", location)
    formData.append("coordinates", JSON.stringify(coordinates))

    return this.http.post(this._addCityUrl, formData)
  }

  getCities(country: string) {
    country = encodeURIComponent(country)
    const encodedURL = this._getCitiesUrl + country
    return this.http.get(encodedURL)
  }
}
