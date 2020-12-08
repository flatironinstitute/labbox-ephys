import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RootAction, RootState } from '../reducers';

interface StateProps {
    nodeId: string | null
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const  ComponentName: FunctionComponent<Props> = ({ nodeId }) => {
    const Content = () => {
        return <div>
            <pre>kachery-p2p node ID: {nodeId}</pre>
        </div>
    }

    return (
        <div>
            <h1>Compute resource configuration</h1>
            <Content />
        </div>
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    nodeId: state.serverInfo.nodeId
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)( ComponentName)