import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

type Coordinates = Array<{ lat: number; lng: number }>

@Injectable({
  providedIn: "root",
})
export class CityService {
  constructor(private http: HttpClient) {}

  private _addCityUrl = "http://localhost:3000/city/add"

  addCity(name: string, coordinates: Coordinates) {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("coordinates", JSON.stringify(coordinates))

    return this.http.post(this._addCityUrl, formData)
  }
}
