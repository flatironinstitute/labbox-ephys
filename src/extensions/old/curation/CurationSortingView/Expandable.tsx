import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core'
import React, { FunctionComponent } from 'react'

interface Props {
    label: string
    defaultExpanded?: boolean
    icon?: JSX.Element
}

export const Expandable: FunctionComponent<Props> = (props) => {
    return (
      <Accordion TransitionProps={{ unmountOnExit: true }} defaultExpanded={props.defaultExpanded}>
        <AccordionSummary>
          {props.icon && <span style={{paddingRight: 10}}>{props.icon}</span>}{props.label}
        </AccordionSummary>
        <AccordionDetails>
          <div style={{width: "100%"}}>
            {props.children}
          </div>
        </AccordionDetails>
      </Accordion>
    )
  }

  export default Expandable