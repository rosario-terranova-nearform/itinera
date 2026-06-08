import { ClientResponseError } from 'pocketbase'

export function getLoginErrorMessage(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 403) {
      return "Account disattivato. Contatta l'amministratore."
    }
    if (err.status === 400 || err.status === 401) {
      return 'Email o password non validi.'
    }
    return err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return 'Errore durante il login.'
}
