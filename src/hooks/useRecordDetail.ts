/**
 * useRecordDetail hook — fetches a single record by id
 */
import { useState, useEffect } from 'react'
import type { RecordDetail } from '@/types/record'
import * as api from '@/services/api'

export function useRecordDetail(id: string) {
  const [record, setRecord] = useState<RecordDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    api
      .getRecord(id)
      .then((r) => {
        if (!cancelled) {
          setRecord(r)
          setIsLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError((e as Error).message || '加载失败')
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return { record, isLoading, error }
}
