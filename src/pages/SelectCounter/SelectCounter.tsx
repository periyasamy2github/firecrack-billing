import { Navigate, useNavigate } from 'react-router-dom'
import { Typography } from '@mui/material'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { AuthShell } from '../../components/AuthShell'
import { useStoreScope } from '../../hooks/useStoreScope'
import { ROUTES } from '../../utils/routes'
import styles from './SelectCounter.module.css'

export const SelectCounter = () => {
  const navigate = useNavigate()
  const { currentUser, setActiveCounter, setCurrentBranchId, branches } = useStoreScope()

  const findBranchByName = (name: string) => branches.find((branch) => branch.name === name)

  const counters = currentUser?.counters.filter((c) => findBranchByName(c)?.active) ?? []
  if (!currentUser || counters.length === 0) {
    return <Navigate to={ROUTES.login} replace />
  }

  const choose = (counter: string) => {
    setActiveCounter(counter)
    setCurrentBranchId(findBranchByName(counter)?.id ?? 'all')
    navigate(ROUTES.dashboard)
  }

  return (
    <AuthShell>
      <div className={styles.body}>
        <div className={styles.heading}>
          <Typography className={styles.title}>
            Welcome, {currentUser.name.split(' ')[0]}
          </Typography>
          <Typography className={styles.subtitle}>
            You're mapped to more than one counter — pick one for this session
          </Typography>
        </div>

        <div className={styles.list}>
          {counters.map((counter) => (
            <div key={counter} className={styles.row} onClick={() => choose(counter)}>
              <StorefrontOutlinedIcon className={styles.rowIcon} />
              <Typography className={styles.rowLabel}>{counter}</Typography>
            </div>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}

export default SelectCounter
