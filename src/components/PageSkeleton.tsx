import { Skeleton, Stack } from '@mui/material'
import { PageLoader } from './RouteProgress'
import styles from './PageSkeleton.module.css'

/** Content-area placeholder while a lazy page chunk loads — the sidebar stays put. */
export const PageSkeleton = () => (
  <>
    <PageLoader />
    <div className={styles.wrap}>
      <Skeleton variant="text" width={220} height={34} />
      <Skeleton variant="text" width={140} height={18} className={styles.titleGap} />
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={72} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={120} />
      </Stack>
    </div>
  </>
)
