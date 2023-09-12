import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _loginUrl = "http://localhost:3000/login"
  private _logoutUrl = "http://localhost:3000/logout"

  constructor(private http: HttpClient) {}

  login(loginDetails: { email: string; password: string }) {
    return this.http.post<any>(this._loginUrl, loginDetails)
  }

  logout() {
    return this.http.get(this._logoutUrl)
  }

  isLoggedIn() {
    return !!localStorage.getItem("adminToken")
  }

  getToken() {
    return localStorage.getItem("adminToken")
  }
}
