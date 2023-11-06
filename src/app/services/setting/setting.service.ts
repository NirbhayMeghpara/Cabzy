import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

interface Settings {
  id: string
  driverTimeout: string
  stops: string
  stripeKey: string
}

@Injectable({
  providedIn: "root",
})
export class SettingService {
  constructor(private http: HttpClient) {}

  private _editSettingUrl = "http://localhost:3000/setting/edit"
  private _getSettingUrl = "http://localhost:3000/setting/"

  editSetting(settings: Settings) {
    const formData = new FormData()
    formData.append("id", settings.id)
    formData.append("driverTimeout", settings.driverTimeout)
    formData.append("stops", settings.stops)
    formData.append("stripeKey", settings.stripeKey)

    return this.http.patch(this._editSettingUrl, formData)
  }

  getSettings() {
    return this.http.get(this._getSettingUrl)
  }
}
