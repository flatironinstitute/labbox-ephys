import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React, { FunctionComponent, useCallback } from 'react';
import { SortingViewProps } from '../../extensionInterface';
import Units from '../../unitstable/Units/Units';
import AllUnitsTab from './AllUnitsTab';
import SelectedUnitsTab from './SelectedUnitsTab';

const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

const tabBarHeight = 48

const TabPanel: FunctionComponent<{index: number, currentTabIndex: number, width?: number, height?: number}> = ({index, currentTabIndex, children, width, height}) => {
    const style0: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        top: tabBarHeight,
        width: width ? width : undefined,
        height: height ? height - tabBarHeight : undefined
    }
    return (
        <div style={{ ...style0, visibility: currentTabIndex === index ? 'visible' : 'hidden' }}>
            {children}
        </div>
    )
}

const TabsView: FunctionComponent<SortingViewProps & {width?: number, height?: number}> = (props) => {
    const classes = useStyles();
    const [currentTabIndex, setCurrentTabIndex] = React.useState<number>(0);

    const handleChange = useCallback((event: React.ChangeEvent<{}>, newTabIndex: number) => {
        setCurrentTabIndex(newTabIndex);
    }, [setCurrentTabIndex]);

    const tabPanelProps = {
        currentTabIndex,
        width: props.width,
        height: props.height
    }

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Tabs value={currentTabIndex} onChange={handleChange} aria-label="simple tabs example">
                    <Tab label="Units table" {...a11yProps(0)} />
                    <Tab label="All units" {...a11yProps(1)} />
                    <Tab label="Selected units" {...a11yProps(2)} />
                </Tabs>
            </AppBar>
            <TabPanel {...tabPanelProps} index={0} key={0}>
                <Units
                    {...props}
                />
            </TabPanel>
            <TabPanel {...tabPanelProps} index={1} key={1}>
                <AllUnitsTab
                    {...props}
                />
            </TabPanel>
            <TabPanel {...tabPanelProps} index={2} key={2}>
                <SelectedUnitsTab
                    {...props}
                />
            </TabPanel>
        </div>
    )
}

export default TabsView