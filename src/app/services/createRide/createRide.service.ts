import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Stops } from "src/app/component/create-ride/create-ride.component"

@Injectable({
  providedIn: "root",
})
export class CreateRideService {
  constructor(private http: HttpClient) {}

  private _createRideUrl = "http://localhost:3000/ride/create"
  private _getRidesUrl = "http://localhost:3000/ride"

  createRide(
    userId: string,
    cityId: string,
    serviceTypeId: string,
    userName: string,
    pickUp: string,
    stops: Stops[],
    dropOff: string,
    journeyDistance: number,
    journeyTime: number,
    totalFare: number,
    paymentType: string,
    rideDate: string,
    rideTime: string
  ) {
    const formData = new FormData()

    formData.append("userID", userId)
    formData.append("cityID", cityId)
    formData.append("serviceTypeID", serviceTypeId)
    formData.append("userName", userName)
    formData.append("pickUp", pickUp)
    formData.append("stops", JSON.stringify(stops))

    formData.append("dropOff", dropOff)
    formData.append("journeyDistance", String(journeyDistance))
    formData.append("journeyTime", String(journeyTime))
    formData.append("totalFare", String(totalFare))
    formData.append("paymentType", paymentType)
    formData.append("rideDate", rideDate)
    formData.append("rideTime", rideTime)

    return this.http.post(this._createRideUrl, formData)
  }

  getRides(
    page: number,
    searchText?: string,
    sort?: string,
    sortOrder?: string,
    rideDate?: string,
    vehicleType?: string,
    status?: string
  ) {
    const url = new URL(this._getRidesUrl)
    url.searchParams.set("page", String(page))

    searchText && url.searchParams.set("search", searchText)
    sort && url.searchParams.set("sort", sort)
    sortOrder && url.searchParams.set("sortOrder", sortOrder)
    rideDate && url.searchParams.set("rideDate", rideDate)
    vehicleType && url.searchParams.set("vehicleType", vehicleType)
    status && url.searchParams.set("status", status)

    return this.http.get(url.toString())
  }
}
