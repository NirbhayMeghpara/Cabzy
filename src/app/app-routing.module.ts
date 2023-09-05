import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { FullComponent } from "./layouts/full/full.component"
import { LoginComponent } from "./authentication/login/login.component"
import { RegisterComponent } from "./authentication/register/register.component"
import { CreateRideComponent } from "./component/create-ride/create-ride.component"
import { ConfirmedRideComponent } from "./component/confirmed-ride/confirmed-ride.component"
import { RideHistoryComponent } from "./component/ride-history/ride-history.component"
import { RunningRequestComponent } from "./component/running-request/running-request.component"
import { DriverListComponent } from "./component/driver-list/driver-list.component"
import { CountryComponent } from "./component/country/country.component"
import { CityComponent } from "./component/city/city.component"
import { VehicalTypeComponent } from "./component/vehical-type/vehical-type.component"
import { VehicalPriceComponent } from "./component/vehical-price/vehical-price.component"
import { SettingsComponent } from "./component/settings/settings.component"
import { UsersComponent } from "./component/users/users.component"

const routes: Routes = [
  {
    path: "",
    component: FullComponent,
    children: [
      { path: "", redirectTo: "/create-ride", pathMatch: "full" },
      { path: "create-ride", component: CreateRideComponent },
      { path: "confirmed-ride", component: ConfirmedRideComponent },
      { path: "ride-history", component: RideHistoryComponent },
      { path: "users", component: UsersComponent },
      { path: "driver-list", component: DriverListComponent },
      { path: "running-request", component: RunningRequestComponent },
      { path: "country", component: CountryComponent },
      { path: "city", component: CityComponent },
      { path: "vehicle-type", component: VehicalTypeComponent },
      { path: "vehicle-price", component: VehicalPriceComponent },
      { path: "settings", component: SettingsComponent },
    ],
  },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },

  { path: "**", redirectTo: "/create-ride", pathMatch: "full" },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
