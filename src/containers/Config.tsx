import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { default as React, Dispatch, Fragment, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { ExtensionsConfig } from '../extensions/reducers';
import { RootAction, RootState } from '../reducers';
import ConfigComputeResource from './ConfigComputeResource';
import ConfigExtensions from './ConfigExtensions';
import ConfigSharing from './ConfigSharing';


interface StateProps {
  extensionsConfig: ExtensionsConfig
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const Config: FunctionComponent<Props> = ({ extensionsConfig }) => {
  const classes = useStyles()
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
    component: <ConfigSharing />
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

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  extensionsConfig: state.extensionsConfig
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Config)