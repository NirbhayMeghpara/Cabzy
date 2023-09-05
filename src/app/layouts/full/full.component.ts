import { Component } from "@angular/core"
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout"
import { Observable } from "rxjs"
import { map, shareReplay } from "rxjs/operators"

interface sidebarMenu {
  link: string
  icon: string
  menu: string
  submenus?: sidebarMenu[]
  showSubmenu?: boolean
}

@Component({
  selector: "app-full",
  templateUrl: "./full.component.html",
  styleUrls: ["./full.component.scss"],
})
export class FullComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  )

  constructor(private breakpointObserver: BreakpointObserver) {}

  routerActive: string = "activelink"

  toggleDropdown(menuItem: sidebarMenu): void {
    menuItem.showSubmenu = !menuItem.showSubmenu
  }

  sidebarMenu: sidebarMenu[] = [
    {
      link: "/",
      icon: "layers",
      menu: "Ride",
      submenus: [
        {
          link: "/create-ride",
          icon: "plus",
          menu: "Create",
        },
        {
          link: "/confirmed-ride",
          icon: "bookmark",
          menu: "Confirmed Ride",
        },
        {
          link: "/ride-history",
          icon: "file-text",
          menu: "Ride History",
        },
      ],
      showSubmenu: true,
    },
    {
      link: "/users",
      icon: "users",
      menu: "Users",
    },
    {
      link: "/",
      icon: "user-check",
      menu: "Drivers",
      submenus: [
        {
          link: "/driver-list",
          icon: "list",
          menu: "List",
        },
        {
          link: "/running-request",
          icon: "activity",
          menu: "Running Requests",
        },
      ],
      showSubmenu: false,
    },

    {
      link: "/",
      icon: "dollar-sign",
      menu: "Pricing",
      submenus: [
        {
          link: "/country",
          icon: "list",
          menu: "Country",
        },
        {
          link: "/city",
          icon: "activity",
          menu: "City",
        },
        {
          link: "/vehicle-type",
          icon: "truck",
          menu: "Vehical Type",
        },
        {
          link: "/vehicle-price",
          icon: "dollar-sign",
          menu: "Vehical Pricing",
        },
      ],
      showSubmenu: false,
    },
    {
      link: "/settings",
      icon: "settings",
      menu: "Settings",
    },
  ]
}
