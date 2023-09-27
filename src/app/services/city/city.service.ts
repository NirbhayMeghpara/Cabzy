import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

type Coordinates = Array<{ lat: number; lng: number }>

@Injectable({
  providedIn: "root",
})
export class CityService {
  constructor(private http: HttpClient) {}

  private _addCityUrl = "http://localhost:3000/city/add"
  private _getCitiesUrl = "http://localhost:3000/city/fetch/"
  private _editCityUrl = "http://localhost:3000/city/edit"

  addCity(country: string, location: string, coordinates: Coordinates) {
    const formData = new FormData()
    formData.append("country", country)
    formData.append("location", location)
    formData.append("coordinates", JSON.stringify(coordinates))

    return this.http.post(this._addCityUrl, formData)
  }

  getCities(country: string, page: number) {
    country = encodeURIComponent(country)
    const encodedURL = `${this._getCitiesUrl}${country}?page=${page}`
    return this.http.get(encodedURL)
  }

  editCity(id: string, location: string, coordinates: Coordinates) {
    const formData = new FormData()
    formData.append("id", id)
    formData.append("location", location)
    formData.append("coordinates", JSON.stringify(coordinates))

    return this.http.patch(this._editCityUrl, formData)
  }
}
