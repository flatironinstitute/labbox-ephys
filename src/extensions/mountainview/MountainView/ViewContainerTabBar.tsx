import { IconButton, Tab, Tabs } from '@material-ui/core';
import CloseIcon from "@material-ui/icons/Close";
import { default as React, FunctionComponent, useCallback, useEffect } from 'react';
import { View } from './MountainView';

type Props = {
    views: View[]
    currentView: View | null
    onCurrentViewChanged: (v: View) => void
    onViewClosed: (v: View) => void
}

const ViewContainerTabBar: FunctionComponent<Props> = ({ views, currentView, onCurrentViewChanged, onViewClosed }) => {
    const handleChange = useCallback((event: React.ChangeEvent<{}>, newTabIndex: number) => {
        const v = views[newTabIndex]
        if (v) onCurrentViewChanged(v)
    }, [onCurrentViewChanged, views])
    useEffect(() => {
        const i = currentView ? views.indexOf(currentView) : -1
        if (i < 0) {
            if (views.length > 0) {
                onCurrentViewChanged(views[0])
            }
        }
    }, [currentView, onCurrentViewChanged, views])
    let currentIndex: number | null = currentView ? views.indexOf(currentView) : null
    if (currentIndex === -1) currentIndex = null
    return (
        <Tabs
            value={currentIndex || 0}
            onChange={handleChange}
            scrollButtons="auto"
            variant="scrollable"
        >
            {views.map(v => (
                viewContainerTab(v, onViewClosed)
            ))}
        </Tabs>
    )
}

const viewContainerTab = (view: View, onClose: (view: View) => void) => {
    // thanks: https://stackoverflow.com/questions/63265780/react-material-ui-tabs-close/63277341#63277341
    // thanks also: https://www.freecodecamp.org/news/reactjs-implement-drag-and-drop-feature-without-using-external-libraries-ad8994429f1a/
    const label = (
        <div
            style={{whiteSpace: 'nowrap'}}
            draggable
            onDragStart={(e) => {e.dataTransfer.setData('viewId', view.viewId);}}
        >
            {view.plugin.label}
            <span>&nbsp;</span>
            <IconButton
                component="div"
                onClick={() => onClose(view)}
            >
                <CloseIcon
                    style={{
                        display: 'inline',
                        verticalAlign: 'middle',
                        fontSize: 20
                    }}
                />
            </IconButton>
        </div>
    )
    return (
        <Tab key={view.viewId} label={label} />
    )
}

export default ViewContainerTabBar