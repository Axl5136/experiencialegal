import usersData from '../data/users.json'

export function getUserProfile(authUser) {
  if (!authUser) return null
  const exact = usersData.users.find((u) => u.id === authUser.id)
  if (exact) return exact
  const roleDefault = usersData.users.find((u) => u.role === authUser.role)
  return { ...roleDefault, ...authUser }
}
