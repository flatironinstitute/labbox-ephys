import React from 'react'
import Grid from '@material-ui/core/Grid'
import GetAppIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import EditDrawer from '../../../EditDrawer';


const GridActions = ({
    className,
    handleDelete,
    handleExport,
    rowData,
}) => {

    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (open, event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setOpen(open)
    };

    return (
        <>
            <Grid container
                justify="center"
                alignItems="center"
            >
                <Grid item xs={3}>
                    <IconButton onClick={(e) => handleExport(e, rowData)}>
                        <GetAppIcon className={className} />
                    </IconButton>
                </Grid>
                <Grid item xs={3}>
                    <IconButton onClick={() => handleDelete([rowData.id])}>
                        <DeleteIcon className={className} />
                    </IconButton>
                </Grid >
                <Grid item xs={3}>
                    <IconButton onClick={() => toggleDrawer(true)}>
                        <EditIcon className={className} />
                    </IconButton>
                </Grid >
            </Grid >
            <EditDrawer
                open={open}
                toggleDrawer={toggleDrawer}
                handleDelete={() => handleDelete([rowData.id])}
                rowData={rowData}
            />
        </>
    )
}

export default GridActions
