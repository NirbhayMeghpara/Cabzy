import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnInit {
  showForm: boolean = false
  form: "Save" | "Add" = "Save"
  cards = ["345234234242", "345234234242", "345234234242", "345234234242"]

  constructor(private fb: FormBuilder) {}

  creditCardForm: FormGroup = this.fb.group({
    defaultCard: ["", [Validators.required]],
    cardHolderName: ["", [Validators.required, Validators.pattern("^[A-Za-z ]+$")]],
    cardNumber: ["", [Validators.required, Validators.pattern("^[0-9]+$")]],
    expiryDate: ["", [Validators.required]],
    cvv: ["", [Validators.required, Validators.pattern("^[0-9]+$")]],
  })

  ngOnInit(): void {}

  setMonthAndYear(data: any, widget: any) {
    const date = new Date(data)
    this.expiryDate?.setValue(`${date.getMonth() + 1}/${date.getFullYear()}`)
    widget.close()
  }

  toggleForm() {
    if (this.showForm) {
      this.resetForm()
    }
    this.showForm = !this.showForm
  }

  onSubmitCard() {
    this.defaultCard?.setValue("123321123321")
    if (this.creditCardForm.invalid) {
      this.creditCardForm.markAllAsTouched()
      return
    }

    const cardHolderName = this.cardHolderName?.value
    const cardNumber = this.cardNumber?.value
    const expiryDate = this.expiryDate?.value
    const cvv = this.cvv?.value

    console.log(this.creditCardForm.value)

    // if (this.form === "Save") {
    //   this.onSaveCard(this.userID, cardNumber)
    // } else if (this.form === "Add") {
    //   this.onAddCard(this.userID, cardHolderName, cardNumber, expiryDate, cvv)
    // }
    Object.values(this.creditCardForm.controls).forEach((control) => {
      control.setErrors(null)
    })
    this.toggleForm()
  }

  resetForm() {
    this.creditCardForm.reset()
    this.creditCardForm.updateValueAndValidity()
    this.form = "Save"
  }

  get defaultCard() {
    return this.creditCardForm.get("defaultCard")
  }
  get cardHolderName() {
    return this.creditCardForm.get("cardHolderName")
  }
  get cardNumber() {
    return this.creditCardForm.get("cardNumber")
  }
  get expiryDate() {
    return this.creditCardForm.get("expiryDate")
  }
  get cvv() {
    return this.creditCardForm.get("cvv")
  }
}
