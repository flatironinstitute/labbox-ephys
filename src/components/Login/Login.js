import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOffOutlined'
import VisibilityIcon from '@material-ui/icons/VisibilityOutlined'
import cn from 'classnames'
import { hexToHSL } from '../../utils/styles'

const useStyles = makeStyles(theme => ({
  cardLoginWrapper: {
    height: '100%',
    display: 'flex'
  },
  paper: {
    width: '40%',
    margin: 'auto',
    padding: '40px 80px',
    maxWidth: 560
  },
  fieldsContainer: {
    padding: '25px 0'
  },
  actionsContainer: {
    padding: '25px 15px'
  },
  actionLoginButton: {
    margin: '15px 0',
    color: theme.palette.colors.white,
    background: theme.palette.colors.mainColor,
    padding: '7px 0px',
    '&:hover': {
      background: hexToHSL(theme.palette.colors.mainColor, 30),
    }
  },
  forgotPassBtn: () => {
    const color = theme.palette.type === 'light' ? theme.palette.colors.mainColor : theme.palette.colors.white
    const light = theme.palette.type === 'light' ? 30 : 80
    return {
      color,
      '&:hover': {
        background: 'transparent',
        color: hexToHSL(color, light)
      }
    }
  },
  content: {
    textAlign: 'center',
    fontSize: 14,
  },
  cardTitle: {
    paddingBottom: 15,
    fontSize: '34px !important'
  }
}))

const Login = (props) => {
  const classes = useStyles()
  const [passwordType, setPasswordType] = React.useState('password')

  const setPassType = () => {
    setPasswordType(current => current === 'password' ? 'string' : 'password')
  }

  const IconType = () => {
    return <IconButton onClick={setPassType}>
      {
        passwordType === 'password' ? <VisibilityIcon /> : <VisibilityOffIcon />
      }
    </IconButton>
  }

  return <Grid className={classes.cardLoginWrapper}>
    <Paper className={classes.paper}>
      <Typography className={cn(classes.content, classes.cardTitle)}>Authentication</Typography>
      <Typography variant="body2" className={classes.content}>Insert your credentials to access</Typography>
      <Grid className={classes.fieldsContainer}>
        <TextField placeholder="Insert your username" variant="outlined" label="Username" margin="normal" name="username" fullWidth required />
        <TextField placeholder="Password" type={passwordType} variant="outlined" label="Password" margin="normal" name="password" InputProps={{
          endAdornment: (
            <IconType />
          ),
        }} fullWidth required />

      </Grid>
      <FormControlLabel
        control={
          <Checkbox
            name="remember_me"
            color="primary"
          />
        }
        label="Remember me"
      />
      <Grid className={classes.actionsContainer}>
        <Button variant="contained" size="small" className={classes.actionLoginButton} fullWidth disableElevation>login</Button>
        <Button variant="contained" size="small" className={classes.actionLoginButton} fullWidth disableElevation>signup</Button>
        <Button variant="text" size="small" className={classes.forgotPassBtn} fullWidth>Forgot your password?</Button>
      </Grid>
    </Paper>
  </Grid>
}

export default Login