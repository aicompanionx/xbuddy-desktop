import { RenameHistory } from '@/service/main/api/token-safety/types/twitter'

/**
 * Convert date string to timestamp safely.
 * Returns -Infinity if parsing fails, ensuring it sorts to the end.
 */
export const toTime = (date?: string): number =>
  Number.isFinite(Date.parse(date ?? '')) ? Date.parse(date!) : -Infinity

/**
 * Generic sorter — sorts by specified date field in descending order (newest first)
 */
export const sortByDateDesc =
  (key: keyof RenameHistory) =>
  <T extends RenameHistory>(arr: readonly T[] = []): T[] =>
    [...arr].sort((a, b) => toTime(b[key]) - toTime(a[key]))

/** Sort by start_date in descending order */
export const sortRenameHistoriesByStartDate = sortByDateDesc('start_date')

/** Sort by end_date in descending order */
export const sortRenameHistoriesByEndDate = sortByDateDesc('end_date')


export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))