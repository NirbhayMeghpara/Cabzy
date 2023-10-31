import { AuthService } from "./../services/auth.service"
import { CanActivate, Router } from "@angular/router"
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true
    } else {
      this.router.navigate(["/login"])
      return false
    }
  }
}
