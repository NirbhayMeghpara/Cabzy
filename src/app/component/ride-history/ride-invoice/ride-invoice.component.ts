import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
  selector: "app-ride-invoice",
  templateUrl: "./ride-invoice.component.html",
  styleUrls: ["./ride-invoice.component.scss"],
})
export class RideInvoiceComponent implements OnInit {
  stopAddress: string[] = []

  constructor(@Inject(MAT_DIALOG_DATA) public ride: any) {}

  ngOnInit(): void {
    this.getStopAddress()
  }

  getStopAddress() {
    this.ride.stops.forEach((stop: any) => {
      const geocoder = new google.maps.Geocoder()

      geocoder.geocode({ location: stop }, (results, status) => {
        if (status === "OK" && results) {
          if (results[0]) {
            this.stopAddress.push(results[0].formatted_address)
          }
        } else {
          console.error("Geocoder failed due to: " + status)
        }
      })
    })
  }
}
