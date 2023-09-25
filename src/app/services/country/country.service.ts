import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { ToastService } from "../toast.service"

interface Coordinate {
  lat: number
  lng: number
}

@Injectable({
  providedIn: "root",
})
export class CountryService {
  private _restCountry = "https://restcountries.com/v3.1/name/"
  private _fetchCountryUrl = "http://localhost:3000/country"
  private _addCountryUrl = "http://localhost:3000/country/add"

  constructor(private http: HttpClient, private toast: ToastService) {}

  fetchCountry(name: string) {
    const url = this._restCountry + `${name}?fullText=true`
    return this.http.get(url)
  }

  addCountry(
    name: string,
    flag: string,
    currency: string,
    timezone: string,
    code: string,
    alphaCode: string,
    latLong: Coordinate[]
  ) {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("flag", flag)
    formData.append("currency", currency)
    formData.append("timezone", timezone)
    formData.append("code", code)
    formData.append("alphaCode", alphaCode)

    formData.append("latLong", JSON.stringify(latLong))

    return this.http.post(this._addCountryUrl, formData)
  }

  getCountryData() {
    return this.http.get(this._fetchCountryUrl)
  }
}
