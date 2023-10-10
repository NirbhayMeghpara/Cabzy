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
  selectedCroneTime!: number
  selectedStops!: number

  settingID!: string
  submitFlag!: boolean

  constructor(
    private settingService: SettingService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.settingService.getSettings().subscribe({
      next: (response: any) => {
        this.settingID = response[0]._id
        this.selectedCroneTime = response[0].croneTime
        this.selectedStops = response[0].stops
        this.croneTime?.setValue(response[0].croneTime)
        this.stops?.setValue(response[0].stops)

        this.submitFlag = false
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  settingsForm: FormGroup = this.fb.group({
    croneTime: ["", [Validators.required]],
    stops: ["", [Validators.required]],
  })

  onSelectTime(index: number) {
    this.selectedCroneTime = this.times[index]
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
    console.log(this.submitFlag)

    if (!this.submitFlag) {
      this.toast.info("This settings is already exists", "Info")
      return
    }

    const setting = {
      id: this.settingID,
      croneTime: this.selectedCroneTime.toString(),
      stops: this.selectedStops.toString(),
    }

    this.settingService.editSetting(setting).subscribe({
      next: (response: any) => {
        this.settingID = response._id
        this.croneTime?.setValue(response.croneTime)
        this.stops?.setValue(response.stops)

        this.toast.success("Settings updated successfully", "Success")
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  get croneTime() {
    return this.settingsForm.get("croneTime")
  }
  get stops() {
    return this.settingsForm.get("stops")
  }
}
