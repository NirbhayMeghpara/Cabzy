import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  private _addUserUrl = "http://localhost:3000/user/add"
  private _getUsersUrl = "http://localhost:3000/user"
  private _editUserUrl = "http://localhost:3000/user/edit/"

  addUser(name: string, profile: any, email: string, phoneCode: string, phone: number) {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("profile", profile)
    formData.append("email", email)
    formData.append("driverProfit", phoneCode)
    formData.append("phone", String(phone))

    return this.http.post(this._addUserUrl, formData)
  }

  getUsers(page: number) {
    const encodedURL = `${this._getUsersUrl}?page=${page}`
    return this.http.get(encodedURL)
  }

  editUser(id: string, name: string, profile: any, email: string, phoneCode: string, phone: number) {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("profile", profile)
    formData.append("email", email)
    formData.append("driverProfit", phoneCode)
    formData.append("phone", String(phone))

    return this.http.patch(this._editUserUrl, formData)
  }
}
