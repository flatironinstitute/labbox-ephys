import React from 'react'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import * as pluginComponents from '../pluginComponents';

const pluginComponentsList = Object.values(pluginComponents);

const Prototypes = () => {
  return (
    <div>
      <h3>{`Prototype views`}</h3>
      <div>
        {
          pluginComponentsList.filter(PluginComponent => (PluginComponent.prototypeViewPlugin)).map(PluginComponent => {
            const config = PluginComponent.prototypeViewPlugin;
            return (
              <Expandable
                label={config.label}
              >
                <PluginComponent
                    {...config.props || {}}
                />
              </Expandable>
            )
          })
        }
      </div>
    </div>
  );
}

const Expandable = ({ label, children }) => {
  return (
    <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
      <ExpansionPanelSummary>
        {label}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {children}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

export default Prototypes;