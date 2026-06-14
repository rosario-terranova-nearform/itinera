import dayjs from 'dayjs'

export function formatDate(date: string): string {
  return dayjs(date).format('DD/MM/YYYY')
}

export function formatDateTime(date: string): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}
