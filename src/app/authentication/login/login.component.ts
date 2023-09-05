import { PlatformModule } from "@angular/cdk/platform"
import { Component } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../auth.component.scss"],
})
export class LoginComponent {
  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    })
  }
}
