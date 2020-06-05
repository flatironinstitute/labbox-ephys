import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ConfigJobHandlers from '../containers/ConfigJobHandlers'
import ConfigFrankLabDataJoint from '../containers/ConfigFrankLabDataJoint'
import { Box, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const Config = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <h1>Configuration</h1>
      <Paper className={classes.root}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Job handlers" />
          <Tab label="FrankLab DataJoint" />
        </Tabs>

      </Paper>
      <TabPanel value={value} index={0}>
        <ConfigJobHandlers />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ConfigFrankLabDataJoint />
      </TabPanel>
    </div>
  );
}

export default Config;
