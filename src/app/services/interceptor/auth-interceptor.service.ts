import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { AuthService } from "../auth.service"
import { catchError, tap, throwError } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class AuthInterceptorService implements HttpInterceptor {
  router: any
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.endsWith("/login") && req.method === "POST") {
      // If it's a login request, don't add the Authorization header
      return next.handle(req)
    }

    const modifiedRequest = req.clone({
      headers: req.headers.append("Authorization", `Bearer ${this.authService.getToken()}`),
    })
    return next.handle(modifiedRequest).pipe(
      tap(
        () => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status !== 401) {
              console.log("sdf")
              return
            }
            this.router.navigate(["login"])
          }
        }
      )
    )
  }
}
