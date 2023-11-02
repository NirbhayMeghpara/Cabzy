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
import { CardComponent } from "./component/users/card/card.component"
import { DeleteComponent } from "./component/users/delete/delete.component"
import { DeleteDriverComponent } from "./component/driver-list/delete-driver/delete-driver.component"
import { ServiceTypeComponent } from "./component/driver-list/service-type/service-type.component"
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker"
import { RideDetailsComponent } from "./component/confirmed-ride/ride-details/ride-details.component"
import { AssignDialogComponent } from "./component/confirmed-ride/assign-dialog/assign-dialog.component"
import { RejectRideComponent } from "./component/running-request/reject-ride/reject-ride.component"
import { CancelRideComponent } from "./component/confirmed-ride/cancel-ride/cancel-ride.component"

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
    CardComponent,
    DeleteComponent,
    DeleteDriverComponent,
    ServiceTypeComponent,
    RideDetailsComponent,
    AssignDialogComponent,
    RejectRideComponent,
    CancelRideComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FeatherModule.pick(allIcons),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaterialTimepickerModule,
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
