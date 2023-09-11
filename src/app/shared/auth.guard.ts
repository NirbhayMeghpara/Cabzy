import { AuthService } from "./../services/auth.service"
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router"
import { Observable } from "rxjs"
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
