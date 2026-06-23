/**
 * useRecords hook — convenience wrapper around useRecordsStore
 */
import { useEffect } from 'react'
import { useRecordsStore } from '@/stores/records'

export function useRecords(type?: string) {
  const records = useRecordsStore((s) => s.records)
  const isLoading = useRecordsStore((s) => s.isLoading)
  const error = useRecordsStore((s) => s.error)
  const fetchRecords = useRecordsStore((s) => s.fetchRecords)
  const refresh = useRecordsStore((s) => s.refresh)

  useEffect(() => {
    fetchRecords(type)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  return {
    records: type ? records.filter((r) => r.type === type) : records,
    isLoading,
    error,
    refresh,
  }
}
