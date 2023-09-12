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
    const loginDetails = { email: this.email?.value, password: this.password?.value }
    this.isLoading = true
    this.authService.login(loginDetails).subscribe(
      (response) => {
        this.isLoading = false

        // Error success message
        // this.toastr.success("Login Successfully", "Success", {
        //   progressBar: true,
        //   progressAnimation: "decreasing",
        //   closeButton: true,
        //   timeOut: 5000,
        // })
        this.toast.success("Login Successfully", "Success")

        localStorage.setItem("adminToken", response.token)
        this.router.navigate(["/create-ride"])
      },
      (error) => {
        this.isLoading = false

        // Error toast message
        // this.toastr.error(error.error.error, "Error Occured", {
        //   progressBar: true,
        //   progressAnimation: "decreasing",
        //   closeButton: true,
        //   timeOut: 5000,
        // })

        this.toast.error(error.error.error, "Error Occured")

        this.loginForm.reset()
      }
    )
  }

  get email() {
    return this.loginForm.get("email")
  }
  get password() {
    return this.loginForm.get("password")
  }
}
