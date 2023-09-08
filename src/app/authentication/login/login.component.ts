import { PlatformModule } from "@angular/cdk/platform"
import { Component } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../auth.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup

  get email() {
    return this.loginForm.get("email")
  }
  get password() {
    return this.loginForm.get("password")
  }

  signin() {
    console.log(this.loginForm)
  }

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
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
  }
}
