import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

/** Sweeps the top progress bar on every route change. */
export const RouteProgress = () => {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    NProgress.start()
    const timer = window.setTimeout(() => NProgress.done(), 250)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return null
}

/** Suspense fallback — keeps the bar running while a page chunk downloads. */
export const PageLoader = () => {
  useEffect(() => {
    NProgress.start()
    return () => {
      NProgress.done()
    }
  }, [])
  return null
}
