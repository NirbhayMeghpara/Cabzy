import { AuthService } from "./../../services/auth.service"
import { Component, OnInit } from "@angular/core"
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout"
import { Observable } from "rxjs"
import { map, shareReplay } from "rxjs/operators"
import { Router } from "@angular/router"
import { DEFAULT_INTERRUPTSOURCES, Idle } from "@ng-idle/core"
import { ToastService } from "src/app/services/toast.service"
import { SidebarMenu } from "src/app/shared/interfaces/sidebar-menu.model"

@Component({
  selector: "app-full",
  templateUrl: "./full.component.html",
  styleUrls: ["./full.component.scss"],
})
export class FullComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  )

  idleTimer = 1170 // 19 min 30 sec in seconds
  timeoutTimer = 1200 // 20 min in seconds

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private idle: Idle
  ) {
    idle.setIdle(this.idleTimer) // How long can they be inactive before considered idle, in seconds
    idle.setTimeout(this.idleTimer) // How long can they be idle before considered timed out, in seconds
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES) // Different sources that will "interrupt" (provide events indicating that user is active)

    idle.onIdleStart.subscribe(() => {
      this.toast.warning("You are idle. Please stay active !!", "Warning")
    })

    idle.onTimeout.subscribe(() => {
      this.authService.logout().subscribe({
        next: (response) => {
          localStorage.removeItem("adminToken")

          this.toast.info("Oops you are logged out !!", "Timeout", 10000)
          this.router.navigate(["/login"])
        },
        error: (error) => {
          localStorage.removeItem("adminToken")

          this.toast.info("Oops you are logged out !!", "Timeout", 10000)
          this.router.navigate(["/login"])
        },
      })
    })
  }
  // Applying activelink material lib. class to active router
  routerActive: string = "activelink"

  toggleDropdown(menuItem: SidebarMenu): void {
    menuItem.showSubmenu = !menuItem.showSubmenu
  }

  sidebarMenu: SidebarMenu[] = [
    {
      link: "/",
      icon: "truck",
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

  logoutAdmin() {
    this.authService.logout().subscribe({
      next: (response: any) => {
        localStorage.removeItem("adminToken")
        this.toast.success(response.msg, "Success")

        this.router.navigate(["/login"])
      },
      error: (error) => {
        console.log(error)
        this.toast.error(error.error.error, "Error Occured")
      },
    })
  }

  ngOnInit(): void {
    this.idle.watch()
  }
}
