import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { AuthService } from "../auth.service"

@Injectable({
  providedIn: "root",
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.endsWith("/login") && req.method === "POST") {
      // If it's a login request, don't add the Authorization header
      return next.handle(req)
    }

    const modifiedRequest = req.clone({
      headers: req.headers.append("Authorization", `Bearer ${this.authService.getToken()}`),
    })
    return next.handle(modifiedRequest)
  }
}
