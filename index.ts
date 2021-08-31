import {useState, useEffect} from 'react'

export interface DevicePixelRatioOptions {
  /**
   * Default DPR to use if browser does not support the `devicePixelRatio`
   * property, or when rendering on server
   *
   * @defaultValue `1`
   */
  defaultDpr?: number

  /**
   * Whether or not to round the number down to the closest integer
   *
   * @defaultValue `true`
   */
  round?: boolean

  /**
   * Maximum DPR to return (set to `2` to only generate 1 and 2)
   *
   * @defaultValue `3`
   */
  maxDpr?: number
}

/**
 * Get the device pixel ratio, potentially rounded and capped.
 * Will emit new values if it changes.
 *
 * @param options
 * @returns The current device pixel ratio, or the default if none can be resolved
 */
export function useDevicePixelRatio(options?: DevicePixelRatioOptions) {
  const {defaultDpr = 1, maxDpr = 3, round = true} = options || {}
  const dpr = getDpr(defaultDpr, maxDpr, round)
  const [currentDpr, setCurrentDpr] = useState(dpr)

  useEffect(() => {
    const canListen = typeof window !== 'undefined' && 'matchMedia' in window
    if (!canListen) {
      return
    }

    const updateDpr = () => setCurrentDpr(getDpr(defaultDpr, maxDpr, round))
    const mediaMatcher = window.matchMedia(`screen and (resolution: ${currentDpr}dppx)`)
    mediaMatcher.addEventListener('change', updateDpr)

    return () => {
      mediaMatcher.removeEventListener('change', updateDpr)
    }
  }, [currentDpr, defaultDpr, maxDpr, round])

  return currentDpr
}

function getDpr(defaultDpr: number, maxDpr: number, round: boolean): number {
  const hasDprProp = typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number'
  const dpr = hasDprProp ? window.devicePixelRatio : defaultDpr
  const rounded = Math.min(Math.max(1, round ? Math.floor(dpr) : dpr), maxDpr)
  return rounded
}