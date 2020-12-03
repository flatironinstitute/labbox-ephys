import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import React from 'react';

const Prototypes = () => {
  return (
    <div>
      {/* <h3>{`Prototype views`}</h3>
      <div>
        {
          pluginComponentsList.filter(PluginComponent => (PluginComponent.prototypeViewPlugin)).map(PluginComponent => {
            const config = PluginComponent.prototypeViewPlugin;
            return (
              <Expandable
                key={config.label}
                label={config.label}
              >
                <PluginComponent
                    {...config.props || {}}
                />
              </Expandable>
            )
          })
        }
      </div> */}
    </div>
  );
}

const Expandable = ({ label, children }) => {
  return (
    <Accordion TransitionProps={{ timeout: -1, unmountOnExit: true }}>
      <AccordionSummary>
        {label}
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

export default Prototypes;