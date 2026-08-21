import { Box, Button, Typography } from '@mui/material'
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'

interface AccessDeniedProps {
  onBack: () => void
}

export const AccessDenied = ({ onBack }: AccessDeniedProps) => (
  <>
    <PageHeader title="Access Denied" />
    <PageContent>
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <LockPersonOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" fontWeight="600">Restricted Area</Typography>
        <Typography color="text.secondary" maxWidth="sm" mb={2}>
          You do not have the required permissions to view this page. Only Super Admins are allowed to access this section.
        </Typography>
        <Button variant="outlined" onClick={onBack} sx={{ borderRadius: '30px', px: 4 }}>
          Go Back
        </Button>
      </Box>
    </PageContent>
  </>
)
