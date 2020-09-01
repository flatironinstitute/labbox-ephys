import React from 'react'
import Grid from '@material-ui/core/Grid'
import GetAppIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';

const GridActions = ({
    className,
    handleDelete,
    handleEdit,
    handleExport,
    rowData
}) => {
    return (
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
                <IconButton onClick={(e) => handleDelete(e, rowData)}>
                    <DeleteIcon className={className} />
                </IconButton>
            </Grid >
            <Grid item xs={3}>
                <IconButton onClick={(e) => handleEdit(e, rowData)}>
                    <EditIcon className={className} />
                </IconButton>
            </Grid >
        </Grid >
    )
}

export default GridActions
