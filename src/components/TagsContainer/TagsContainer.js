import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import CreateTagChip from './components/CreateTagChip/CreateTagChip'
const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: 200,
        maxHeight: 200,
        minWidth: 375,
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

const chip = [
    { key: 0, label: 'Hippocampus' },
    { key: 1, label: 'Ripples' },
    { key: 2, label: 'Theta' },
    { key: 3, label: 'Linear maize' },
    { key: 4, label: 'Place fields' },
    { key: 5, label: 'Hippo' },
    { key: 6, label: 'Theta' },
    { key: 7, label: 'Optogenetics' },
    { key: 8, label: 'Place fields' }
]

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
    console.log(chipData)
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
                {chipData.map((data, index) => {
                    return (
                        <Grid item key={index}>
                            <Chip
                                variant="outlined"
                                size='small'
                                onDelete={() => handleDelete(data)}
                                label={data.label}
                                className={classes.chip}
                                classes={{ deleteIcon: classes.deleteIcon }}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </div>
    )
}

export default TagsContainer
