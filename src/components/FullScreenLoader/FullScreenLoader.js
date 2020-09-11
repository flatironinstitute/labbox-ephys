import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress } from '@material-ui/core'
import cn from 'classnames'

const useStyles = makeStyles(() => ({
  root: ({ width = '100%', height = '100%' }) => ({
    width,
    height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    padding: 0,
    margin: 0
  })
}))

function FullScreenLoader(props) {
  const { color = 'primary', size = 40, className } = props
  const classes = useStyles(props)
  return (
    <div className={cn(classes.root, className)}>
      <CircularProgress color={color} size={size} />
    </div>
  )
}

export default FullScreenLoader
