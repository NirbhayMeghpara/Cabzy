import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"
import { UserService } from "src/app/services/user/user.service"

declare let Stripe: any

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnInit {
  showForm: boolean = false
  form: "Save" | "Add" = "Save"
  cards: any[] = []

  clientSecret!: string
  stripe!: any
  cardElement: any
  defaultCard!: string

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private toast: ToastService
  ) {
    this.stripe = Stripe(
      "pk_test_51O9jTFDMkPK75q1NwutmRyOxVaDRkuH5jQPNSKwrguBKFkZ3698Jj7VcuKpig4uQ7ZDxcHaX5HYTK14I0OQH6Ue900fbF04VXT"
    )
    this.createSetupIntent(this.data.user._id)
  }

  ngOnInit(): void {
    this.getCards(this.data.user._id)
  }

  createSetupIntent(userID: string) {
    this.userService.fetchClientSecret(userID).subscribe({
      next: (data: any) => {
        this.clientSecret = data.clientSecret
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  toggleForm() {
    this.form = "Save"
    this.showForm = !this.showForm
    this.cdRef.detectChanges()
    if (this.showForm === true) {
      this.form = "Add"
      const appearance = {
        theme: "flat",
      }
      const elements = this.stripe.elements({ clientSecret: this.clientSecret, appearance })
      this.cardElement = elements.create("card")

      this.cardElement.mount("#card-element")
    }
  }

  async addNewCard() {
    const { token, error } = await this.stripe.createToken(this.cardElement)

    if (error) {
      this.toast.error(error.message, "Invalid")
    } else {
      this.userService.addCard(this.data.user._id, token.id).subscribe({
        next: (response: any) => {
          this.toast.success(response.msg, "Added")
          this.getCards(this.data.user._id)
          this.toggleForm()
        },
        error: (error) => {
          this.toast.error(error.error.error, "Error")
        },
      })
    }
  }

  getCards(userID: string) {
    this.userService.fetchCards(userID).subscribe({
      next: (data: any) => {
        this.cards = data.cards
        this.defaultCard = data.defaultCard
        this.cards.forEach((card) => {
          if (card.id === this.defaultCard) card.defaultCard = true
        })
      },
      error: (error) => {
        this.toast.info(error.error.error, "Info")
      },
    })
  }

  setDefaultCard(index: number) {
    const card = this.cards[index]
    if (card.defaultCard) {
      this.toast.info("This card is already set as default", "Info")
      return
    }
    this.userService.setDefaultCard(card.id, this.data.user._id).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Success")
        this.cards.forEach((card) => (card.defaultCard = false))
        card.defaultCard = true
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  deleteCard(index: number) {
    const card = this.cards[index]
    this.userService.deleteCard(card.id, this.data.user._id).subscribe({
      next: (response: any) => {
        this.toast.success(response.msg, "Deleted")
        this.getCards(this.data.user._id)
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }
}
