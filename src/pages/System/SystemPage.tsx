import { useNavigate } from 'react-router-dom'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import { ROUTES } from '../../utils/routes'

import { FullPageErrorLayout } from './FullPageErrorLayout'
import { AccessDenied } from './AccessDenied'

type ErrorType = '404' | '500' | '403'

export const SystemPage = ({ type }: { type: ErrorType }) => {
  const navigate = useNavigate()
  const goToDashboard = () => navigate(ROUTES.dashboard)

  if (type === '403') {
    return <AccessDenied onBack={goToDashboard} />
  }

  if (type === '500') {
    return (
      <FullPageErrorLayout
        code="500"
        title="Internal Server Error"
        subtitle="Oops, something went wrong on our end. We're working on fixing it right away. Please try again later."
        icon={ReportProblemOutlinedIcon}
        onHome={goToDashboard}
      />
    )
  }

  return (
    <FullPageErrorLayout
      code="404"
      title="Page Not Found"
      subtitle="We couldn't find the page you're looking for. It might have been removed, renamed, or temporarily unavailable."
      icon={SearchOffIcon}
      onHome={goToDashboard}
    />
  )
}

export default SystemPage
