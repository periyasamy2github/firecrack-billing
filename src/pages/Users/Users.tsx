import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { SearchField } from '../../components/SearchField'
import { ListFooter } from '../../components/ListFooter'
import { useSession } from '../../hooks/useSession'
import { useDispatch, useSelector } from '../../redux/store'
import { loadUsers, saveUser } from '../../redux/usersSlice'
import { api } from '../../services/api'
import { useListPage } from '../../hooks/useListPage'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import type { User } from '../../types'

import { UserDialog } from './UserDialog'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import { UsersTable } from './UsersTable'
import { UserDetailsDialog } from './UserDetailsDialog'
import { usePageTitle } from '../../hooks/usePageTitle'

export const Users = () => {
  usePageTitle('Users')
  const { counters } = useSession()
  const dispatch = useDispatch()
  const users = useSelector((state) => state.users.items)
  const showToast = useToast()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void dispatch(loadUsers()).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [resettingUser, setResettingUser] = useState<User | null>(null)

  const { query, setQuery, searchInputRef, filtered, page, rowsPerPage, pageRows, changePage, changeRowsPerPage } =
    useListPage<User>({
      rows: users,
      matchesSearch: (user, search) => {
        const q = search.trim().toLowerCase()
        return !q || user.name.toLowerCase().includes(q) || user.staffId.toLowerCase().includes(q)
      },
    })

  const openAdd = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingUser(null)
  }

  // Await before closing so the dialog stays open if saving fails.
  const submitUser = async (user: User) => {
    const wasEditing = Boolean(editingUser)
    try {
      await dispatch(saveUser(user)).unwrap()
    } catch (err) {
      showToast(errorMessage(err, 'Could not save this user'), 'error')
      throw err
    }
    closeForm()
    showToast(`${user.name} ${wasEditing ? 'updated' : 'added'}`)
  }

  const submitPassword = async (password: string) => {
    if (!resettingUser) return
    const { name } = resettingUser
    try {
      await api.resetPassword(resettingUser.id, password)
    } catch (err) {
      showToast(errorMessage(err, 'Could not reset this password'), 'error')
      throw err
    }
    setResettingUser(null)
    showToast(`Password reset for ${name}`)
  }

  return (
    <>
      <PageHeader
        title="Users"
        crumb={`${users.length} users`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}>
            Add user
          </Button>
        }
      />
      <PageContent>
        <SearchField placeholder="Search by name or staff ID… (/)" value={query} onChange={setQuery} inputRef={searchInputRef} sx={{ maxWidth: 340 }} />

        <UsersTable
          rows={pageRows}
          loading={loading}
          filteredCount={filtered.length}
          onView={setViewingUser}
          onEdit={openEdit}
          onResetPassword={setResettingUser}
          footer={<ListFooter count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />}
        />
      </PageContent>

      {formOpen && (
        <UserDialog
          open={formOpen}
          user={editingUser}
          users={users}
          counters={counters}
          onClose={closeForm}
          onSubmit={submitUser}
        />
      )}

      <ResetPasswordDialog
        key={resettingUser?.id ?? 'reset'}
        user={resettingUser}
        onClose={() => setResettingUser(null)}
        onSubmit={submitPassword}
      />

      <UserDetailsDialog user={viewingUser} onClose={() => setViewingUser(null)} />
    </>
  )
}

export default Users
