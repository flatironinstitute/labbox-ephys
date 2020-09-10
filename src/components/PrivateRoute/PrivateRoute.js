import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useCurrentUSer } from '../../hooks/useCurrentUser'

export function PrivateRoute({
  component,
  children,
  ...rest
}) {
  const currentUser = useCurrentUSer()
  if (currentUser) {
    if (children) return <Route {...rest}>{children}</Route>
    return <Route {...rest} component={component} />
  }
  return <Redirect to='/login' />
}

export default PrivateRoute