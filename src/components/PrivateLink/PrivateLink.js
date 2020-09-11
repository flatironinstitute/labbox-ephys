import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';

const PrivateLink = ({ children, to, currentUser, className, style }) => {
  if (currentUser || JSON.parse(sessionStorage.getItem("user"))) {
    if (children)
      return (
        <Link to={to} className={className} style={style}>
          {children}
        </Link>
      )
    return <Link to={to} className={className} style={style} />
  }
  return null
}

const mapStateToProps = state => ({
  currentUser: state.login.currentUser
})

export default connect(mapStateToProps)(PrivateLink)