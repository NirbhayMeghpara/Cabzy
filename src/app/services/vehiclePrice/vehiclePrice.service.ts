import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class VehiclePriceService {
  constructor(private http: HttpClient) {}

  private _addVehiclePriceUrl = "http://localhost:3000/vehiclePrice/add"
  private _getPricingsUrl = "http://localhost:3000/vehiclePrice/fetch/"
  private _editPricingUrl = "http://localhost:3000/vehiclePrice/edit"

  addVehiclePrice(
    country: string,
    city: string,
    vehicleType: string,
    driverProfit: number,
    minFare: number,
    basePriceDistance: number,
    basePrice: number,
    unitDistancePrice: number,
    unitTimePrice: number,
    maxSpace: number
  ) {
    const formData = new FormData()
    formData.append("country", country)
    formData.append("city", city)
    formData.append("vehicleType", vehicleType)
    formData.append("driverProfit", String(driverProfit))
    formData.append("minFare", String(minFare))
    formData.append("basePriceDistance", String(basePriceDistance))
    formData.append("basePrice", String(basePrice))
    formData.append("unitDistancePrice", String(unitDistancePrice))
    formData.append("unitTimePrice", String(unitTimePrice))
    formData.append("maxSpace", String(maxSpace))

    return this.http.post(this._addVehiclePriceUrl, formData)
  }

  getPricing(city: string, page: number) {
    city = encodeURIComponent(city)
    const encodedURL = `${this._getPricingsUrl}${city}?page=${page}`
    return this.http.get(encodedURL)
  }

  editVehiclePrice(
    id: string,
    driverProfit: number,
    minFare: number,
    basePriceDistance: number,
    basePrice: number,
    unitDistancePrice: number,
    unitTimePrice: number,
    maxSpace: number
  ) {
    const formData = new FormData()
    formData.append("id", id)
    formData.append("driverProfit", String(driverProfit))
    formData.append("minFare", String(minFare))
    formData.append("basePriceDistance", String(basePriceDistance))
    formData.append("basePrice", String(basePrice))
    formData.append("unitDistancePrice", String(unitDistancePrice))
    formData.append("unitTimePrice", String(unitTimePrice))
    formData.append("maxSpace", String(maxSpace))

    return this.http.patch(this._editPricingUrl, formData)
  }
}
