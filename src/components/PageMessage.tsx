import { Typography } from '@mui/material'
import { PageHeader } from './PageHeader'
import { PageContent } from './PageContent'

export const PageMessage = ({ title = 'Dashboard', message }: { title?: string; message: string }) => (
  <>
    <PageHeader title={title} />
    <PageContent>
      <Typography color="text.secondary">{message}</Typography>
    </PageContent>
  </>
)
