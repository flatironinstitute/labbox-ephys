import React from 'react'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import { makeStyles } from '@material-ui/core'
import cn from 'classnames'

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: 20,
        fontWeight: 500,
        marginBottom: 40,
        color: theme.palette.type === 'dark'
            ? theme.palette.colors.darkWhite
            : theme.palette.colors.darkGrey
    },
    container: {
        margin: 38
    },
    input: {
        fontSize: 14,
        fontWeight: 600,
        textAlignLast: "right",
        textAlign: "right"
    },
    field: {
        '& .MuiInput-underline:before': {
            borderBottom: `2px solid ${theme.palette.primary.main}`,
        },
        '& .MuiInput-underline:after': {
            borderBottom: `1px solid ${theme.palette.primary.main}`,
        },
    },
    inputRoot: {
        paddingBottom: 15
    },
    subtitle: {
        color: theme.palette.colors.grey2
    }
}))

const CustomField = (props) => {
    const { label, title, subtitle, fullWidth, className } = props
    const classes = useStyles()
    return (
        <TextField
            multiline
            fullWidth={fullWidth}
            value={label}
            className={cn(className, classes.field)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <div style={{ direction: 'column' }}>
                            <Typography>{title}</Typography>
                            {subtitle && <Typography color='textSecondary'>{subtitle}</Typography>}
                        </div>
                    </InputAdornment>
                ),
                readOnly: true,
                classes: {
                    input: classes.input,
                    root: classes.inputRoot
                }
            }}
        />
    )
}

export default CustomField
