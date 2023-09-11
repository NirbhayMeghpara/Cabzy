import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  loginUrl = "http://localhost:3000/login"

  constructor(private http: HttpClient) {}

  login(loginDetails: { email: string; password: string }) {
    return this.http.post<any>(this.loginUrl, loginDetails)
  }

  isLoggedIn() {
    return !!localStorage.getItem("token")
  }
}
