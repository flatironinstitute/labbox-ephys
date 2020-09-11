import { useState } from 'react'

export const useCurrentUSer = () => {
  const [currentUser, setUser] = useState(false)

  const onChangeUser = () => setUser(true)

  return { currentUser, onChangeUser }

}
