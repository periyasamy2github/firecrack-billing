import { Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PageContent } from '../components/PageContent'
import { PageHeader } from '../components/PageHeader'
import { ROUTES } from '../utils/routes'

export const AccessDenied = () => {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader title="Access denied" />
      <PageContent>
        <Typography color="text.secondary">Only a Super Admin can open this page.</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate(ROUTES.dashboard)}>Return to dashboard</Button>
      </PageContent>
    </>
  )
}

export const NotFound = () => {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader title="Page not found" />
      <PageContent>
        <Typography color="text.secondary">The page you requested does not exist.</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate(ROUTES.dashboard)}>Return to dashboard</Button>
      </PageContent>
    </>
  )
}
