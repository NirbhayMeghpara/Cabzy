import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { ToastService } from "src/app/services/toast.service"

@Component({
  selector: "app-ride-details",
  templateUrl: "./ride-details.component.html",
  styleUrls: ["./ride-details.component.scss"],
})
export class RideDetailsComponent implements OnInit {
  stopAddress: string[] = []

  constructor(@Inject(MAT_DIALOG_DATA) public ride: any, public toast: ToastService) {}

  ngOnInit(): void {
    this.initMap()
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

  
  map!: google.maps.Map
  directionsService!: google.maps.DirectionsService
  directionsRenderer!: google.maps.DirectionsRenderer
  myCoordinate!: { lat: number; lng: number }

  waypoints: any[] = this.ride.stops

  private async initMap() {
    console.log("Google Map from ride details")
    navigator.geolocation.getCurrentPosition((position) => {
      this.myCoordinate = { lat: position.coords.latitude, lng: position.coords.longitude }
      const mapOptions = {
        center: this.myCoordinate,
        zoom: 10,
        mapTypeId: "roadmap",
      }

      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions)

      this.directionsService = new google.maps.DirectionsService()
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeWeight: 3, // Thickness of the route line
        },
      })

      const request: google.maps.DirectionsRequest = {
        origin: this.ride.pickUp,
        destination: this.ride.dropOff,
        waypoints: this.waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      }

      this.directionsService.route(request, async (response, status) => {
        if (status === "OK") {
          // Displaying route between pickUp and dropOff Locations
          this.directionsRenderer.setMap(this.map)
          this.directionsRenderer.setDirections(response)
        } else if (status === "NOT_FOUND") {
          this.toast.error("One or more locations could not be found.", "Error")
        } else if (status === "ZERO_RESULTS") {
          this.toast.error("No routes available between the specified locations.", "Error")
        } else {
          this.toast.error("Something went wrong. Please try again", "Error")
          this.directionsRenderer.setMap(null) // Clear the route if source or destination is empty
        }
      })
    })
  }

}
