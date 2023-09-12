import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { FeatherModule } from "angular-feather"
import { allIcons } from "angular-feather/icons"
import { FormsModule } from "@angular/forms"
import { ReactiveFormsModule } from "@angular/forms"

import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { FullComponent } from "./layouts/full/full.component"
import { MaterialModule } from "./material.module"
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http"

// Modules
import { LoginComponent } from "./authentication/login/login.component"
import { CreateRideComponent } from "./component/create-ride/create-ride.component"
import { ConfirmedRideComponent } from "./component/confirmed-ride/confirmed-ride.component"
import { RideHistoryComponent } from "./component/ride-history/ride-history.component"
import { UsersComponent } from "./component/users/users.component"
import { DriverListComponent } from "./component/driver-list/driver-list.component"
import { RunningRequestComponent } from "./component/running-request/running-request.component"
import { CountryComponent } from "./component/country/country.component"
import { CityComponent } from "./component/city/city.component"
import { VehicalTypeComponent } from "./component/vehical-type/vehical-type.component"
import { VehicalPriceComponent } from "./component/vehical-price/vehical-price.component"
import { SettingsComponent } from "./component/settings/settings.component"
import { LoadingSpinnerComponent } from "./shared/loading-spinner/loading-spinner.component"
import { ToastrModule } from "ngx-toastr"
import { AuthInterceptorService } from "./services/interceptor/auth-interceptor.service"
import { NgIdleModule } from "@ng-idle/core"

@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    LoginComponent,
    CreateRideComponent,
    ConfirmedRideComponent,
    RideHistoryComponent,
    UsersComponent,
    DriverListComponent,
    RunningRequestComponent,
    CountryComponent,
    CityComponent,
    VehicalTypeComponent,
    VehicalPriceComponent,
    SettingsComponent,
    LoadingSpinnerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FeatherModule.pick(allIcons),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgIdleModule.forRoot(),
    ToastrModule.forRoot({
      maxOpened: 5,
      autoDismiss: true,
      preventDuplicates: true,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
