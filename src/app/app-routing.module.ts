import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { FullComponent } from "./layouts/full/full.component"
import { LoginComponent } from "./authentication/login/login.component"
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
import { AuthGuard } from "./shared/auth.guard"

const routes: Routes = [
  {
    path: "",
    component: FullComponent,
    children: [
      { path: "", redirectTo: "/create-ride", pathMatch: "full" },
      { path: "create-ride", component: CreateRideComponent, canActivate: [AuthGuard] },
      { path: "confirmed-ride", component: ConfirmedRideComponent, canActivate: [AuthGuard] },
      { path: "ride-history", component: RideHistoryComponent, canActivate: [AuthGuard] },
      { path: "users", component: UsersComponent, canActivate: [AuthGuard] },
      { path: "driver-list", component: DriverListComponent, canActivate: [AuthGuard] },
      { path: "running-request", component: RunningRequestComponent, canActivate: [AuthGuard] },
      { path: "country", component: CountryComponent, canActivate: [AuthGuard] },
      { path: "city", component: CityComponent, canActivate: [AuthGuard] },
      { path: "vehicle-type", component: VehicalTypeComponent, canActivate: [AuthGuard] },
      { path: "vehicle-price", component: VehicalPriceComponent, canActivate: [AuthGuard] },
      { path: "settings", component: SettingsComponent, canActivate: [AuthGuard] },
    ],
  },
  { path: "login", component: LoginComponent },

  { path: "**", redirectTo: "/create-ride", pathMatch: "full" },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
