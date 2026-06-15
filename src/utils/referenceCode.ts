export function generateReferenceCode(appointmentId: string): string {
  return `VIS-${appointmentId.slice(0, 6).toUpperCase()}`
}
