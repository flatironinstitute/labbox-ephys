import React, { FunctionComponent, useEffect, useState } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import { View } from './MountainView';
import ViewContainerTabBar from './ViewContainerTabBar';


type Props = {
    views: View[]
    onViewClosed: (v: View) => void
    width?: number
}

const tabBarHeight = 56

const ViewContainer: FunctionComponent<Props & SizeMeProps> = ({ children, views, onViewClosed, size, width }) => {
    const [currentView, setCurrentView] = useState<View | null>(null)
    useEffect(() => {
        views.forEach(v => {
            if (v.activate) {
                v.activate = false
                setCurrentView(v)
            }
        })
    }, [views])
    if (!Array.isArray(children)) {
        throw Error('Unepected children in ViewContainer')
    }
    const children2 = children as React.ReactElement[]
    const W = width || size.width || 300
    return (
        <div style={{width: W}}>
            <ViewContainerTabBar
                views={views}
                currentView={currentView}
                onCurrentViewChanged={setCurrentView}
                onViewClosed={onViewClosed}
            />
            {
                children2.map(c => {
                    const childView = c.props.view as any as View
                    const visible = (childView === currentView)
                    return (
                        <div key={childView.viewId} style={{visibility: visible ? 'visible' : 'hidden', position: 'absolute', left: 0, width: W, top: tabBarHeight}}>
                            <c.type {...c.props} width={W}/>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default sizeMe()(ViewContainer)