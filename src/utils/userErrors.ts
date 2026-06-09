import { ClientResponseError } from 'pocketbase'

function getValidationMessages(data: Record<string, unknown> | undefined): string[] {
  if (!data) return []

  return Object.entries(data)
    .map(([, value]) => {
      if (value && typeof value === 'object' && 'message' in value) {
        return String((value as { message: string }).message)
      }
      return null
    })
    .filter((message): message is string => Boolean(message))
}

export function getCreateRepresentativeErrorMessage(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 400) {
      const validationMessages = getValidationMessages(err.response?.data)
      if (validationMessages.length > 0) {
        return validationMessages.join(' ')
      }
      const emailError = err.response?.data?.email
      if (emailError) {
        return 'Indirizzo email già in uso o non valido.'
      }
      return 'Dati non validi. Verifica i campi e riprova.'
    }
    if (err.status === 403) {
      return 'Non hai i permessi per creare rappresentanti.'
    }
    return err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return 'Errore durante la creazione del rappresentante.'
}

export function getToggleRepresentativeActiveErrorMessage(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 403) {
      return 'Non hai i permessi per modificare questo account.'
    }
    if (err.status === 404) {
      return 'Rappresentante non trovato.'
    }
    return err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return "Errore durante l'aggiornamento dello stato."
}
