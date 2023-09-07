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

get email () {
  return this.loginForm.get('email')
}

  constructor(private fb: FormBuilder) {
    
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }
}
