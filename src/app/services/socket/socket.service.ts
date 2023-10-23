import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { io } from "socket.io-client"

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: any

  constructor() {}

  initializeSocket() {
    this.socket = io("http://localhost:3000")
  }

  emit(eventName: string, data: any, callback?: (error: any, message: string) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.emit(eventName, data, (error: any, message: string) => {
          callback(error, message)
        })
      } else {
        this.socket.emit(eventName, data)
      }
    }
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect() // Disconnect from the server
    }
  }

  listen(eventName: string) {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on(eventName, (data: any) => {
          observer.next(data)
        })
      }
    })
  }
}
