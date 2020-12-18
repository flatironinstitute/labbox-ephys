import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { View } from './MVSortingView';
import ViewContainerTabBar from './ViewContainerTabBar';


type Props = {
    views: View[]
    onViewClosed: (v: View) => void
    onSetViewArea: (v: View, area: 'north' | 'south') => void
    width: number
    height: number
}

const tabBarHeight = 40 + 5

const ViewContainer: FunctionComponent<Props> = ({ children, views, onViewClosed, onSetViewArea, width, height }) => {
    const [currentNorthView, setCurrentNorthView] = useState<View | null>(null)
    const [currentSouthView, setCurrentSouthView] = useState<View | null>(null)
    const [activeArea, setActiveArea] = useState<'north' | 'south'>('north')
    useEffect(() => {
        views.forEach(v => {
            if (!v.area) v.area = activeArea
            if (v.activate) {
                v.activate = false
                if (v.area === 'north') {
                    setCurrentNorthView(v)
                    setActiveArea('north')
                }
                else if (v.area === 'south') {
                    setCurrentSouthView(v)
                    setActiveArea('south')
                    
                }
            }
        })
    }, [views, activeArea])

    const hMargin = 3
    const vMargin = 3
    const W = (width || 300) - hMargin * 2
    const H = height - vMargin * 2

    const H0 = (H - tabBarHeight * 2) / 2
    const areas: {[key: string]: {
        tabBarStyle: React.CSSProperties,
        divStyle: React.CSSProperties
    }} = {
        'north': {
            tabBarStyle: { left: 0, top: 0, width: W, height: tabBarHeight },
            divStyle: {left: 0, top: tabBarHeight, width: W, height: H0}
        },
        'south': {
            tabBarStyle: { left: 0, top: tabBarHeight + H0, width: W, height: tabBarHeight },
            divStyle: { left: 0, top: tabBarHeight * 2 + H0, width: W, height: H0 }
        }
    }

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const y = eventToPos(e)[1]
        const newActiveArea = (y < tabBarHeight + H0) ? 'north' : 'south'
        if (newActiveArea !== activeArea) {
            setActiveArea(newActiveArea)
        }
    }, [H0, activeArea, setActiveArea])

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        // the following is needed otherwise we can't get the drop. See: https://stackoverflow.com/questions/50230048/react-ondrop-is-not-firing
        event.stopPropagation();
        event.preventDefault();
    }, [])

    const handleDragDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        const y = eventToPos(e)[1]
        const dropArea = (y < tabBarHeight + H0) ? 'north' : 'south'
        const viewId = e.dataTransfer.getData('viewId')
        if (viewId) {
            const view = views.filter(v => v.viewId === viewId)[0]
            if (view) {
                if (view.area !== dropArea) {
                    onSetViewArea(view, dropArea)
                }
            }
        }
    }, [views, H0, onSetViewArea])


    if (!Array.isArray(children)) {
        throw Error('Unexpected children in ViewContainer')
    }
    const children2 = children as React.ReactElement[]
    return (
        <div
            style={{position: 'absolute', left: hMargin, top: vMargin, width: W, height: H}} onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDragDrop}
            className="ViewContainer"
        >
            <div key="north-tab-bar" style={{position: 'absolute', ...areas['north'].tabBarStyle}}>
                <ViewContainerTabBar
                    views={views.filter(v => v.area === 'north')}
                    currentView={currentNorthView}
                    onCurrentViewChanged={setCurrentNorthView}
                    onViewClosed={onViewClosed}
                    active={activeArea === 'north'}
                />
            </div>
            <div key="south-tab-bar" style={{position: 'absolute', ...areas['south'].tabBarStyle}}>
                <ViewContainerTabBar
                    views={views.filter(v => v.area === 'south')}
                    currentView={currentSouthView}
                    onCurrentViewChanged={setCurrentSouthView}
                    onViewClosed={onViewClosed}
                    active={activeArea === 'south'}
                />
            </div>
            {
                children2.map(c => {
                    const childView = c.props.view as any as View
                    const visible = ((childView.area === 'north') && (childView === currentNorthView)) || ((childView.area === 'south') && (childView === currentSouthView))
                    const area = areas[childView.area || 'north']
                    return (
                        <div key={childView.viewId} style={{visibility: visible ? 'visible' : 'hidden', overflowY: 'auto', overflowX: 'hidden', position: 'absolute', ...area.divStyle}}>
                            <c.type {...c.props} width={W} height={area.divStyle.height}/>
                        </div>
                    )
                })
            }
        </div>
    )
}

const eventToPos = (e: React.MouseEvent | React.DragEvent) => {
    const element = e.currentTarget
    const x = e.clientX - element.getBoundingClientRect().x
    const y = e.clientY - element.getBoundingClientRect().y
    return [x, y]
}

export default ViewContainer