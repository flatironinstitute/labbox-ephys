/* eslint-disable no-use-before-define */
import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
// TODO: Import own css styling?

// May need to scrap the makestyles call
const useStyles = makeStyles((theme) => ({
  root: {
    width: 500,
    '& > * + *': {
      marginTop: theme.spacing(3),
    },
  },
}));

const MultiComboBox = ({
    id,
    label,
    placeholder,
    onSelectionsChanged,
    getLabelFromOption = (x) => x,
    selectedOptionLabels = [],
    options = []
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Autocomplete
        multiple
        freeSolo
        id={id}
        options={options}
        onChange={onSelectionsChanged}
        getOptionLabel={(option) => getLabelFromOption(option)}
        defaultValue={selectedOptionLabels}
        filterSelectedOptions // avoids repeats
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={label}
            placeholder={placeholder}
          />
        )}
      />
    </div>
  );
}


export default MultiComboBox;