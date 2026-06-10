import { useEffect, useState } from 'react'

/**
 * Demo-only async simulator. Replaces real polling for the PO vs ACK
 * comparison flow: when the launcher fires, we transition through
 * 'idle' → 'processing' → 'completed' on a setTimeout, returning the
 * mock report once "ready".
 *
 * Real backend integration would swap this for a useQuery + polling.
 */
export type SimulatedAsyncStatus = 'idle' | 'processing' | 'completed'

interface UseSimulatedAsyncOptions<T> {
    /** Whether the simulated job is active (e.g. modal is open). */
    enabled: boolean
    /** Factory that returns the eventual "result" — called when status flips to completed. */
    resultFactory: () => T
    /** How long the processing phase lasts. Default 2500ms. */
    durationMs?: number
}

export function useSimulatedAsync<T>({ enabled, resultFactory, durationMs = 2500 }: UseSimulatedAsyncOptions<T>) {
    const [status, setStatus] = useState<SimulatedAsyncStatus>('idle')
    const [result, setResult] = useState<T | null>(null)

    useEffect(() => {
        if (!enabled) {
            setStatus('idle')
            setResult(null)
            return
        }
        setStatus('processing')
        setResult(null)
        const timer = setTimeout(() => {
            setResult(resultFactory())
            setStatus('completed')
        }, durationMs)
        return () => clearTimeout(timer)
        // Intentionally NOT depending on resultFactory — caller is expected to
        // keep it stable across renders during a single "job".
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, durationMs])

    return { status, result }
}
