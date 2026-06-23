import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh'

dayjs.extend(relativeTime)
dayjs.locale('zh')

/** Format a date to a relative time string (e.g. "2 小时前"). */
export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow()
}

/** Format a date to a full Chinese date string (e.g. "2025年6月10日 14:30"). */
export function formatFull(date: string | Date): string {
  const d = dayjs(date)
  return `${d.year()}年${d.month() + 1}月${d.date()}日  ${d.hour().toString().padStart(2, '0')}:${d.minute().toString().padStart(2, '0')}`
}

/** Format a date to a short Chinese date string (e.g. "6月10日"). */
export function formatShort(date: string | Date): string {
  const d = dayjs(date)
  return `${d.month() + 1}月${d.date()}日`
}

/** Format seconds to "X 分 Y 秒". */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m} 分 ${s} 秒`
}
