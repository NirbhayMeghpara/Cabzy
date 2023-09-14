import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class VehicleTypeService {
  private _addVehicleUrl = "http://localhost:3000/vehicle/add"
  private _fetchVehicleUrl = "http://localhost:3000/vehicle"

  constructor(private http: HttpClient) {}

  addVehicle(vehicleType: string, vehicleImage: File) {
    const formData = new FormData()
    formData.append("vehicleType", vehicleType)
    formData.append("vehicleImage", vehicleImage)
    return this.http.post(this._addVehicleUrl, formData)
  }

  fetchVehicle() {
    return this.http.get(this._fetchVehicleUrl)
  }
}
