import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ConfigComputeResource from './ConfigComputeResource';
import ConfigSharing from './ConfigSharing'
import ConfigExtensions from './ConfigExtensions'
import ConfigFrankLabDataJoint from '../extensions/frankLabDataJoint/containers/ConfigFrankLabDataJoint'
import { connect } from 'react-redux';
import { Fragment } from 'react';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const Config = ({ extensionsConfig }) => {
  const classes = useStyles();
  const [currentTabLabel, setCurrentTabLabel] = React.useState(null);

  let tabs = [];
  // tabs.push({
  //   label: 'Job handlers',
  //   component: <ConfigJobHandlers />
  // })
  tabs.push({
    label: 'Sharing',
    component: <ConfigSharing />
  })
  tabs.push({
    label: 'Compute Resource',
    component: <ConfigComputeResource />
  })
  if (extensionsConfig.enabled.frankLabDataJoint) {
    tabs.push({
      label: 'FrankLab DataJoint',
      component: <ConfigFrankLabDataJoint />
    })
  }
  tabs.push({
    label: 'Extensions',
    component: <ConfigExtensions />
  })

  const handleChange = (event, newIndex) => {
    setCurrentTabLabel(tabs[newIndex].label);
  };

  let currentTabIndex = 0;
  tabs.forEach((t, ii) => {
    if (t.label === currentTabLabel) currentTabIndex = ii;
  })

  return (
    <div>
      <h1>Configuration</h1>
      <Paper className={classes.root}>
        <Tabs
          value={currentTabIndex}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          {
            tabs.map(t => (
              <Tab key={t.label} label={t.label} />
            ))
          }
        </Tabs>
      </Paper>
      {
        tabs.filter((t, ii) => (currentTabIndex === ii)).map(t => (
          <Fragment key={t.label}>
            {t.component}
          </Fragment>
        ))
      }
    </div>
  );
}

const mapStateToProps = state => ({
  extensionsConfig: state.extensionsConfig
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Config)
