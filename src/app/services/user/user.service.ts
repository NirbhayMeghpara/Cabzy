import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  private _addUserUrl = "http://localhost:3000/user/add"
  private _getUsersUrl = "http://localhost:3000/user/"
  private _editUserUrl = "http://localhost:3000/user/edit/"
  private _deleteUserUrl = "http://localhost:3000/user/delete/"
  private _stripeIntentUrl = "http://localhost:3000/user/createStripeIntent"
  private _addCardUrl = "http://localhost:3000/card/add/"
  private _fetchCardsUrl = "http://localhost:3000/card/"
  private _setDefaultCardsUrl = "http://localhost:3000/card/changeDefault"
  private _deleteCardUrl = "http://localhost:3000/card/delete"

  addUser(name: string, profile: any, email: string, phoneCode: string, phone: number) {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("profile", profile)
    formData.append("email", email)
    formData.append("phoneCode", phoneCode)
    formData.append("phone", String(phone))

    return this.http.post(this._addUserUrl, formData)
  }

  getUsers(page: number, searchText?: string, sort?: string, sortOrder?: string) {
    const url = new URL(this._getUsersUrl)
    url.searchParams.set("page", String(page))

    searchText && url.searchParams.set("search", searchText)
    sort && url.searchParams.set("sort", sort)
    sortOrder && url.searchParams.set("sortOrder", sortOrder)

    return this.http.get(url.toString())
  }

  editUser(id: string, name: string, profile: any, email: string, phoneCode: string, phone: number) {
    const formData = new FormData()
    formData.append("id", id)
    formData.append("name", name)
    formData.append("profile", profile)
    formData.append("email", email)
    formData.append("phoneCode", phoneCode)
    formData.append("phone", String(phone))

    return this.http.patch(this._editUserUrl, formData)
  }

  deleteUser(id: string) {
    const modifiedURL = `${this._deleteUserUrl}${id}`
    return this.http.delete(modifiedURL)
  }

  fetchClientSecret(id: string) {
    const formData = new FormData()
    formData.append("id", id)

    return this.http.post(this._stripeIntentUrl, formData)
  }

  addCard(userID: string, token: string) {
    const formData = new FormData()
    formData.append("id", userID)
    formData.append("token", token)

    return this.http.post(this._addCardUrl, formData)
  }

  fetchCards(userID: string) {
    const formData = new FormData()
    formData.append("id", userID)

    return this.http.post(this._fetchCardsUrl, formData)
  }

  setDefaultCard(cardID: string, userID: string) {
    const formData = new FormData()
    formData.append("cardID", cardID)
    formData.append("userID", userID)

    return this.http.post(this._setDefaultCardsUrl, formData)
  }

  deleteCard(cardID: string, userID: string) {
    const formData = new FormData()
    formData.append("cardID", cardID)
    formData.append("userID", userID)

    return this.http.post(this._deleteCardUrl, formData)
  }
}
