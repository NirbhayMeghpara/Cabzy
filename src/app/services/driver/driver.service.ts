import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class DriverService {
  constructor(private http: HttpClient) {}

  private _addDriverUrl = "http://localhost:3000/driver/add"
  private _getRideDriversUrl = "http://localhost:3000/driver/ride"
  private _getDriversUrl = "http://localhost:3000/driver/"
  private _editDriverUrl = "http://localhost:3000/driver/edit/"
  private _deleteDriverUrl = "http://localhost:3000/driver/delete/"
  private _changeDriverStatusUrl = "http://localhost:3000/driver/changeStatus"
  private _setServiceTypeUrl = "http://localhost:3000/driver/serviceType"
  private _removeServiceTypeUrl = "http://localhost:3000/driver/serviceType/remove"

  addDriver(
    name: string,
    profile: any,
    email: string,
    phoneCode: string,
    phone: number,
    cityID: string
  ) {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("profile", profile)
    formData.append("email", email)
    formData.append("phoneCode", phoneCode)
    formData.append("phone", String(phone))
    formData.append("cityID", cityID)

    return this.http.post(this._addDriverUrl, formData)
  }

  getRideDrivers(serviceType: string, city: string) {
    const url = new URL(this._getRideDriversUrl)
    url.searchParams.set("serviceTypeID", serviceType)
    url.searchParams.set("cityID", city)

    return this.http.get(url.toString())
  }

  getDrivers(page: number, searchText?: string, sort?: string, sortOrder?: string) {
    const url = new URL(this._getDriversUrl)
    url.searchParams.set("page", String(page))

    searchText && url.searchParams.set("search", searchText)
    sort && url.searchParams.set("sort", sort)
    sortOrder && url.searchParams.set("sortOrder", sortOrder)

    return this.http.get(url.toString())
  }

  editDriver(
    id: string,
    name: string,
    profile: any,
    email: string,
    phoneCode: string,
    phone: number,
    cityID: string
  ) {
    const formData = new FormData()
    formData.append("id", id)
    formData.append("name", name)
    formData.append("profile", profile)
    formData.append("email", email)
    formData.append("phoneCode", phoneCode)
    formData.append("phone", String(phone))
    formData.append("cityID", cityID)

    return this.http.patch(this._editDriverUrl, formData)
  }

  deleteDriver(id: string) {
    const modifiedURL = `${this._deleteDriverUrl}${id}`
    return this.http.delete(modifiedURL)
  }

  changeStatus(id: string, status: boolean) {
    const formData = new FormData()
    formData.append("id", id)
    formData.append("status", String(status))

    return this.http.post(this._changeDriverStatusUrl, formData)
  }

  setServiceType(serviceType: string, id: string) {
    const formData = new FormData()
    formData.append("id", id)
    formData.append("serviceTypeID", serviceType)

    return this.http.post(this._setServiceTypeUrl, formData)
  }

  removeServiceType(id: string) {
    const formData = new FormData()
    formData.append("id", id)

    return this.http.post(this._removeServiceTypeUrl, formData)
  }
}
