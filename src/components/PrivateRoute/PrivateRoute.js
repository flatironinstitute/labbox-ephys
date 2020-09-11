import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { connect } from 'react-redux';

export function PrivateRoute({
  component,
  children,
  currentUser,
  ...rest
}) {
  if (currentUser) {
    if (children) return <Route {...rest}>{children}</Route>
    return <Route {...rest} component={component} />
  }
  return <Redirect to='/login' />
}

const mapStateToProps = state => ({
  currentUser: state.login.currentUser
})

export default connect(mapStateToProps)(PrivateRoute)