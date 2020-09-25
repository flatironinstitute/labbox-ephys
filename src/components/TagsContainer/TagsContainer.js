import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import CreateTagChip from './components/CreateTagChip/CreateTagChip'
const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: 200,
        maxHeight: 200,
        marginBottom: 20
    },
    grid: {
        display: 'flex',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        width: '100%',

    },
    createChipContainer: {
        marginBottom: theme.spacing(2)
    },
    chip: {
        backgroundColor: theme.palette.colors.lightBlue1,
        border: 'none',
        margin: 5
    },
    chipsContainer: {
        overflowY: 'auto',
        height: 150
    },
    deleteIcon: {
        color: theme.palette.colors.darkGrey
    },
    checkIcon: {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }
    }
}))

const TagsContainer = () => {
    const classes = useStyles();
    const [chipData, setChipData] = React.useState([])

    const handleDelete = (chipToDelete) => {
        setChipData((chipData) => chipData.filter((chip) => chip.key !== chipToDelete.key));
    };

    const handleSave = (name, key) => {
        if (name) {
            const newItem = { key: key, label: name }
            setChipData(curr => [
                ...curr,
                newItem
            ])
        }
    }

    return (
        <div className={classes.root}>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                className={classes.grid}
                spacing={1}
            >
                <Grid item xs={12} className={classes.createChipContainer}>
                    <CreateTagChip handleSave={handleSave} chipClass={classes.chip} chipData={chipData} />
                </Grid>
                <Grid item className={classes.chipsContainer}>
                    {chipData.map((data) => {
                        return (
                            <Chip
                                key={data.key}
                                variant="outlined"
                                size='medium'
                                onDelete={() => handleDelete(data)}
                                label={data.label}
                                className={classes.chip}
                                classes={{ deleteIcon: classes.deleteIcon }}
                            />

                        );
                    })}
                </Grid>
            </Grid>
        </div>
    )
}

export default TagsContainer
