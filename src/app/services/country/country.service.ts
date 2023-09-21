import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { ToastService } from "../toast.service"

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

  addCountry(name: string, flag: string, currency: string, timezone: string, code: string) {
    const data = {
      name,
      flag,
      currency,
      timezone,
      code,
    }

    return this.http.post(this._addCountryUrl, data)
  }

  getCountryData() {
    return this.http.get(this._fetchCountryUrl)
  }
}
