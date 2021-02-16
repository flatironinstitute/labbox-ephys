import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { LabboxProviderContext } from 'labbox';
import { default as React, Fragment, FunctionComponent, useContext } from 'react';
import ConfigComputeResource from './ConfigComputeResource';
import ConfigExtensions from './ConfigExtensions';
import ConfigSharing from './ConfigSharing';


type Props = {}

// const useStyles = makeStyles({
//   root: {
//     flexGrow: 1,
//   },
// });

const Config: FunctionComponent<Props> = () => {
  // const classes = useStyles()
  const { workspaceInfo } = useContext(LabboxProviderContext)
  const [currentTabLabel, setCurrentTabLabel] = React.useState<string | null>(null)

  let tabs: {label: string, component: React.ComponentElement<any, any>}[] = []
  // tabs.push({
  //   label: 'Job handlers',
  //   component: <ConfigJobHandlers />
  // })
  tabs.push({
    label: 'Compute Resource',
    component: <ConfigComputeResource />
  })
  tabs.push({
    label: 'Sharing',
    component: <ConfigSharing workspaceInfo={workspaceInfo} />
  })
  tabs.push({
    label: 'Extensions',
    component: <ConfigExtensions />
  })

  const handleChange = (event: React.ChangeEvent<{}>, newIndex: number) => {
    setCurrentTabLabel(tabs[newIndex].label);
  }

  let currentTabIndex = 0;
  tabs.forEach((t, ii) => {
    if (t.label === currentTabLabel) currentTabIndex = ii;
  })

  return (
    <div style={{padding: 20}}>
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

export default Config