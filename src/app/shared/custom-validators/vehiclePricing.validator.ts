import { AbstractControl, ValidationErrors } from "@angular/forms"

export function aboveEighty(control: AbstractControl): ValidationErrors | null {
  const value = parseFloat(control.value)
  return value > 80 ? { aboveEighty: true } : null
}

export function maxAllowedSpace(control: AbstractControl): ValidationErrors | null {
  const value = parseFloat(control.value)
  return value > 12 ? { maxAllowedSpace: true } : null
}
