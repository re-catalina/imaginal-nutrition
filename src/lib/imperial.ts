/** US customary → metric for internal BMR/TDEE math. */

export function poundsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return feet * 30.48 + inches * 2.54;
}

export function kgToPounds(kg: number): number {
  return kg / 0.45359237;
}
