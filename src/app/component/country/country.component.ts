import { Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { CountryService } from "src/app/services/country/country.service"
import { ToastService } from "src/app/services/toast.service"
import { Country } from "src/app/shared/interfaces/country.model"

@Component({
  selector: "app-country",
  templateUrl: "./country.component.html",
  styleUrls: ["./country.component.scss"],
})
export class CountryComponent implements OnInit {
  @ViewChild("countryFlag") countryFlag!: ElementRef

  showForm: boolean = false
  searchText: string = ""
  countryData!: Country[]

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.getCountry()
  }

  countryForm: FormGroup = this.fb.group({
    countryName: ["", [Validators.required]],
    currency: ["", [Validators.required]],
    timeZone: ["", [Validators.required]],
    countryCode: ["", [Validators.required]],
  })

  toggleAddForm() {
    if (this.showForm) {
      this.countryForm.reset()
    }
    this.countryForm.get("currency")?.disable()
    this.countryForm.get("timeZone")?.disable()
    this.countryForm.get("countryCode")?.disable()
    this.showForm = !this.showForm
  }

  // Function to fetch country data from api
  fetchData() {
    if (this.countryName?.value.length === 0) return this.toast.error("Enter country name", "Error")
    this.countryService.fetchCountry(this.countryName?.value).subscribe({
      next: (response: any) => {
        this.fillForm(response)
      },
      error: (error) => {
        if (error.error.status === 404) {
          this.toast.error("Invalid country name", error.error.status)
        }
      },
    })
  }

  // Function to add country to database
  onCountrySubmit() {
    if (this.countryForm.invalid) {
      this.countryForm.markAllAsTouched()
      return
    }

    const name = this.countryName?.value
    const flag = this.countryFlag.nativeElement.src
    const currency = this.currency?.value
    const timezone = this.timeZone?.value
    const code = this.countryCode?.value

    this.countryService.addCountry(name, flag, currency, timezone, code).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Added")
        console.log(this.countryService.getCountryData())
      },
      error: (error) => this.toast.error(error.error.error, "Error Occured"),
    })
  }

  getCountry() {
    this.countryService.getCountryData().subscribe({
      next: (response: any) => {
        this.countryData = response
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  fillForm(response: any) {
    this.countryName?.setValue(response[0].name.common)
    this.countryFlag.nativeElement.src = response[0].flags.png

    const currencyKey = Object.keys(response[0].currencies)[0] // Get the first key if currencies object

    const currency =
      response[0].currencies[currencyKey].name + ` (${response[0].currencies[currencyKey].symbol})`
    this.currency?.setValue(currency)

    this.timeZone?.setValue(response[0].timezones[0])

    this.countryCode?.setValue(response[0].idd.root + response[0].idd.suffixes[0])

    this.countryForm.updateValueAndValidity()
  }

  get countryName() {
    return this.countryForm.get("countryName")
  }
  get currency() {
    return this.countryForm.get("currency")
  }
  get timeZone() {
    return this.countryForm.get("timeZone")
  }
  get countryCode() {
    return this.countryForm.get("countryCode")
  }
}
