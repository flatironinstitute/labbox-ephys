import React from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUSer } from '../../hooks/useCurrentUser'

const PrivateLink = ({ children, to, ...rest }) => {
  const currentUser = useCurrentUSer()
  if (currentUser) {
    if (children)
      return (
        <Link to={to} {...rest}>
          {children}
        </Link>
      )
    return <Link to={to} {...rest} />
  }
  return null
}

export default PrivateLink