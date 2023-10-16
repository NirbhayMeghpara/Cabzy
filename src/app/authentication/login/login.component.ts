import { AuthService } from "../../services/auth.service"
import { Component } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { ToastService } from "src/app/services/toast.service"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../auth.component.scss"],
})
export class LoginComponent {
  isLoading: boolean = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  loginForm: FormGroup = this.fb.group({
    email: [
      "",
      [
        Validators.required,
        Validators.email,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
      ],
    ],
    password: ["", [Validators.required, Validators.minLength(8)]],
  })

  loginAdmin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched()
      return
    }

    const loginDetails = { email: this.email?.value, password: this.password?.value }
    this.isLoading = true
    this.authService.login(loginDetails).subscribe({
      next: (response) => {
        this.isLoading = false

        this.toast.success("Login Successfully", "Success")

        localStorage.setItem("adminToken", response.token)
        this.router.navigate(["/create-ride"])
      },
      error: (error) => {
        this.isLoading = false

        this.toast.error(error.error.error, "Error")
        this.loginForm.reset()
      },
    })
  }

  get email() {
    return this.loginForm.get("email")
  }
  get password() {
    return this.loginForm.get("password")
  }
}
