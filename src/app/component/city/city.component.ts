import { Component, OnInit } from "@angular/core"
import { CountryService } from "src/app/services/country/country.service"
import { ToastService } from "src/app/services/toast.service"

export interface City {
  id: number
  name: string
}

interface Country {
  name: string
  flag: string
}

const ELEMENT_DATA: City[] = [
  {
    id: 1,
    name: "Rajkot",
  },
  {
    id: 2,
    name: "Ahmedabad",
  },
  {
    id: 3,
    name: "Surat",
  },
  {
    id: 4,
    name: "Vadodara",
  },
]

@Component({
  selector: "app-city",
  templateUrl: "./city.component.html",
  styleUrls: ["./city.component.scss"],
})
export class CityComponent implements OnInit {
  displayedColumns: string[] = ["id", "name", "action"]
  dataSource = ELEMENT_DATA
  countries!: Country[]

  isActive: boolean = false
  isDisable: boolean = false
  selectedCountry: string = ""

  constructor(private countryService: CountryService, private toast: ToastService) {}

  ngOnInit(): void {
    this.countryService.getCountryData().subscribe({
      next: (response: any) => {
        this.countries = response.map(({ name, flag }: { name: string; flag: string }) => ({
          name,
          flag,
        }))
      },
      error: (error) => {
        this.toast.error(error.error.error, "Error")
      },
    })
  }

  toggleDropdown() {
    if (this.isDisable) {
      return
    }
    this.isActive = !this.isActive
  }

  onSelect(countryName: string) {
    this.selectedCountry = countryName
  }
}
