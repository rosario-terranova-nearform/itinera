const EMAIL_NOTIFICATIONS_KEY = 'itinera:emailNotifications:v1'

export function getEmailNotificationsEnabled(): boolean {
  try {
    const value = localStorage.getItem(EMAIL_NOTIFICATIONS_KEY)
    return value === null ? true : value === 'true'
  } catch {
    return true
  }
}

export function setEmailNotificationsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(EMAIL_NOTIFICATIONS_KEY, String(enabled))
  } catch {
    // ignore quota / private browsing
  }
}
