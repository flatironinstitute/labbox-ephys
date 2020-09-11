import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField'
import { Grid, Button } from '@material-ui/core';
import SpikeSortingButton from '../VirtualGrid/components/SpikeSortingButton';

const drawerWidth = 480;

const useStyles = makeStyles((theme) => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: 32,
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 24,
        flexGrow: 1,
    },
    deleteIcon: {
        fontSize: 24,
        color: theme.palette.colors.red
    },
    closeIcon: {
        fontSize: 24,
        color: theme.palette.colors.grey
    },
    divider: {
        margin: '0px 32px'
    },
    field: {
        margin: '20px 0px',
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                border: '2px solid gray'
            }
        }
    },
    body: {
        width: drawerWidth,
        padding: 32,
        flexGrow: 1
    },
    save: {
        margin: 32,
        backgroundColor: theme.palette.colors.green,
        borderRadius: 6,
        color: theme.palette.colors.white,
        textTransform: 'none',
        '&:hover': {
            backgroundColor: theme.palette.colors.lightGreen
        }
    }
}));

const EditDrawer = ({ open, toggleDrawer, handleDelete, rowData }) => {
    const classes = useStyles();

    const onDelete = () => {
        handleDelete()
        toggleDrawer(false)
    }

    return (
        <Drawer
            className={classes.drawer}
            variant='temporary'
            anchor="right"
            open={open}
            classes={{
                paper: classes.drawerPaper,
            }}
            onClose={() => toggleDrawer(false)}
        >
            <div className={classes.drawerHeader}>
                <Typography className={classes.title}>Edit Recording</Typography>
                <IconButton onClick={onDelete}>
                    <DeleteIcon className={classes.deleteIcon} />
                </IconButton>
                <IconButton onClick={() => toggleDrawer(false)}>
                    <CloseIcon className={classes.closeIcon} />
                </IconButton>
            </div>
            <Divider className={classes.divider} />
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="flex-start"
                className={classes.body}
            >
                <TextField
                    value={rowData.file}
                    fullWidth
                    id="file-name"
                    label="File"
                    size='small'
                    variant="outlined"
                    className={classes.field}
                />
                <TextField
                    fullWidth
                    id="upload-date"
                    label="Upload Date"
                    size='small'
                    variant="outlined"
                    className={classes.field}
                />
                <TextField
                    value={rowData.sampleRate}
                    fullWidth
                    id="samplerate"
                    label="Sample Rate"
                    size='small'
                    variant="outlined"
                    className={classes.field}
                />
                <TextField
                    value={rowData.duration}
                    fullWidth
                    id="duration"
                    label="Duration (sec)"
                    size='small'
                    variant="outlined"
                    className={classes.field}
                />
                <TextField
                    fullWidth
                    id="status"
                    label="Status"
                    size='small'
                    variant="outlined"
                    className={classes.field}
                />
                <div style={{ marginTop: 10 }}>
                    <SpikeSortingButton />
                </div>
            </Grid>
            <Button variant='contained' className={classes.save}>Save</Button>
        </Drawer>
    )
}

export default EditDrawer