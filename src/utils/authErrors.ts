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

export function getPasswordResetRequestErrorMessage(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 400) {
      return 'Indirizzo email non valido.'
    }
    return err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return 'Errore durante la richiesta di reset password.'
}

export function getPasswordResetConfirmErrorMessage(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 400) {
      const tokenError = err.response?.data?.token
      if (tokenError) {
        return 'Link non valido o scaduto. Richiedi un nuovo reset password.'
      }
      return 'Password non valida. Verifica i requisiti e riprova.'
    }
    return err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return 'Errore durante il reset della password.'
}
