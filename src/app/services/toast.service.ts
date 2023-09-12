import { Injectable } from "@angular/core"
import { ToastrService } from "ngx-toastr"

@Injectable({
  providedIn: "root",
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title: string, timeoutDuration: number = 5000) {
    this.toastr.success(message, title, {
      titleClass: "toastTitle",
      messageClass: "toastMessage",
      progressBar: true,
      progressAnimation: "decreasing",
      closeButton: true,
      timeOut: timeoutDuration,
    })
  }

  error(message: string, title: string, timeoutDuration: number = 5000) {
    this.toastr.error(message, title, {
      titleClass: "toastTitle",
      messageClass: "toastMessage",
      progressBar: true,
      progressAnimation: "decreasing",
      closeButton: true,
      timeOut: timeoutDuration,
    })
  }

  info(message: string, title: string, timeoutDuration: number = 5000) {
    this.toastr.info(message, title, {
      titleClass: "toastTitle",
      messageClass: "toastMessage",
      progressBar: true,
      progressAnimation: "decreasing",
      closeButton: true,
      timeOut: timeoutDuration,
    })
  }

  warning(message: string, title: string, timeoutDuration?: number) {
    this.toastr.warning(message, title, {
      titleClass: "toastTitle",
      messageClass: "toastMessage",
      progressBar: true,
      progressAnimation: "decreasing",
      closeButton: true,
      timeOut: timeoutDuration,
    })
  }
}
