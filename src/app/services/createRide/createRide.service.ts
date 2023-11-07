import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Stops } from "src/app/component/create-ride/create-ride.component"

@Injectable({
  providedIn: "root",
})
export class CreateRideService {
  constructor(private http: HttpClient) {}

  private _createRideUrl = "http://localhost:3000/ride/create"
  private _getAllRidesUrl = "http://localhost:3000/ride/fetchAll"
  private _getRidesUrl = "http://localhost:3000/ride"
  private _feedbackUrl = "http://localhost:3000/ride/feedback"
  private _paymentUrl = "http://localhost:3000/ride/charge"

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

  getAllRides(rideStatus?: string) {
    const url = new URL(this._getAllRidesUrl)

    rideStatus && url.searchParams.set("rideStatus", rideStatus)

    return this.http.get(url.toString())
  }

  getRides(data: {
    page: number
    searchText?: string
    sort?: string
    sortOrder?: string
    rideDateFrom?: string
    rideDateTo?: string
    vehicleType?: string
    status?: string
    rideStatus?: string
  }) {
    const url = new URL(this._getRidesUrl)
    url.searchParams.set("page", String(data.page))

    data.searchText && url.searchParams.set("search", data.searchText)
    data.sort && url.searchParams.set("sort", data.sort)
    data.sortOrder && url.searchParams.set("sortOrder", data.sortOrder)
    data.rideDateFrom && url.searchParams.set("rideDateFrom", data.rideDateFrom)
    data.rideDateTo && url.searchParams.set("rideDateTo", data.rideDateTo)
    data.vehicleType && url.searchParams.set("vehicleType", data.vehicleType)
    data.status && url.searchParams.set("status", data.status)
    data.rideStatus && url.searchParams.set("rideStatus", data.rideStatus)

    return this.http.get(url.toString())
  }

  sendFeedback(rideId: string, rating: number, feedback: string) {
    const formData = new FormData()

    formData.append("id", rideId)
    rating && formData.append("rating", String(rating))
    feedback && formData.append("feedback", feedback)

    return this.http.post(this._feedbackUrl, formData)
  }

  payment(rideId: string) {
    const formData = new FormData()

    formData.append("id", rideId)

    return this.http.post(this._paymentUrl, formData)
  }
}
