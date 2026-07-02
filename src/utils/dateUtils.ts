import dayjs, { type Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/it'

dayjs.extend(duration)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)
dayjs.extend(relativeTime)
dayjs.locale('it')

export function formatDate(date: string): string {
  return dayjs(date).format('DD/MM/YYYY')
}

export function formatDateTime(date: string): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

export function formatTime(date: string): string {
  return dayjs(date).format('HH:mm')
}

export function formatTimeRange(start: string, end?: string): string {
  const startLabel = dayjs(start).format('HH:mm')
  if (!end) return startLabel
  return `${startLabel} – ${dayjs(end).format('HH:mm')}`
}

export function formatDurationMinutes(start: string, end?: string): string {
  if (!end) return ''
  const minutes = dayjs(end).diff(dayjs(start), 'minute')
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (remainder === 0) return `${hours}h`
  return `${hours}h ${remainder}m`
}

export function formatCountdown(datetime: string): string {
  const target = dayjs(datetime)
  const now = dayjs()

  if (target.isBefore(now)) return 'In corso'
  if (target.diff(now, 'minute') < 60) {
    const mins = target.diff(now, 'minute')
    return mins <= 1 ? 'Tra 1 min' : `Tra ${mins} min`
  }
  if (target.diff(now, 'hour') < 24) {
    const hours = target.diff(now, 'hour')
    return hours === 1 ? 'Tra 1 ora' : `Tra ${hours} ore`
  }
  if (target.isToday()) return 'Oggi'
  if (target.isTomorrow()) return 'Domani'
  return target.fromNow(true)
}

export function formatUpcomingLabel(datetime: string, end?: string): string {
  const start = dayjs(datetime)
  const timeLabel = start.format('HH:mm')
  const durationLabel = formatDurationMinutes(datetime, end)

  let dayLabel: string
  if (start.isToday()) dayLabel = 'Oggi'
  else if (start.isTomorrow()) dayLabel = 'Domani'
  else dayLabel = start.format('ddd D MMM')

  return durationLabel
    ? `${dayLabel}, ${timeLabel} (${durationLabel})`
    : `${dayLabel}, ${timeLabel}`
}

export function formatVisitSchedule(start: string, end?: string): string {
  const dateLabel = formatDate(start)
  const timeLabel = end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start)
  return `${dateLabel}, ${timeLabel}`
}

export function buildScheduledDatetime(data: {
  date: Dayjs
  time: Dayjs
}): string {
  return data.date
    .hour(data.time.hour())
    .minute(data.time.minute())
    .second(0)
    .millisecond(0)
    .toISOString()
}

export function getWeekEndIso(): string {
  return dayjs().endOf('week').toISOString()
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  return dayjs(a).isSame(dayjs(b), 'day')
}

export function formatDayHeading(date: string | Date): string {
  const value = dayjs(date)
  if (value.isToday()) return 'Oggi'
  return value.format('dddd D MMMM YYYY')
}
