import { PlatformModule } from "@angular/cdk/platform"
import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { SettingService } from "src/app/services/setting/setting.service"
import { ToastService } from "src/app/services/toast.service"

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  times: number[] = [10, 20, 30, 45, 60, 90, 120]
  allowedStops: number[] = [1, 2, 3, 4, 5]
  selectedDriverTimeout!: number
  selectedStops!: number

  settingID!: string
  submitFlag!: boolean
  settingsForm: FormGroup

  constructor(
    private settingService: SettingService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      driverTimeout: ["", [Validators.required]],
      stops: ["", [Validators.required]],
      stripeKey: ["", [Validators.required]],
    })

    this.settingsForm.valueChanges.subscribe(() => (this.submitFlag = true))
  }

  ngOnInit(): void {
    this.settingService.getSettings().subscribe({
      next: (response: any) => {
        this.settingID = response[0]._id
        this.selectedDriverTimeout = response[0].driverTimeout
        this.selectedStops = response[0].stops
        this.driverTimeout?.setValue(response[0].driverTimeout)
        this.stops?.setValue(response[0].stops)

        this.submitFlag = false
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  onSelectTime(index: number) {
    this.selectedDriverTimeout = this.times[index]
    this.submitFlag = true
  }
  onSelectStop(index: number) {
    this.selectedStops = this.allowedStops[index]
    this.submitFlag = true
  }

  onSubmitSettings() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched()
      return
    }

    if (!this.submitFlag) {
      this.toast.info("This settings is already exists", "Info")
      return
    }

    const setting = {
      id: this.settingID,
      driverTimeout: this.selectedDriverTimeout.toString(),
      stops: this.selectedStops.toString(),
      stripeKey: this.stripeKey?.value,
    }

    this.settingService.editSetting(setting).subscribe({
      next: (response: any) => {
        this.settingID = response._id
        this.driverTimeout?.setValue(response.driverTimeout)
        this.stops?.setValue(response.stops)
        this.stripeKey?.setValue(response.stripeKey)

        this.toast.success("Settings updated successfully", "Success")
        this.submitFlag = false
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  get driverTimeout() {
    return this.settingsForm.get("driverTimeout")
  }
  get stops() {
    return this.settingsForm.get("stops")
  }
  get stripeKey() {
    return this.settingsForm.get("stripeKey")
  }
}
