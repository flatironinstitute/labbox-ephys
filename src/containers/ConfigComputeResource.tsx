import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Markdown from '../extensions/common/Markdown';
import { RootAction, RootState } from '../reducers';
import { ServerInfo } from '../reducers/serverInfo';
import md from './ConfigComputeResource.md.gen';


interface StateProps {
    serverInfo: ServerInfo
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const ConfigComputeResource: FunctionComponent<Props> = ({ serverInfo }) => {
    const substitute = {
        nodeId: serverInfo.nodeId,
        computeResourceUri: (serverInfo?.labboxConfig)?.compute_resource_uri || 'local'
    }
    return (
        <Markdown
            source={md}
            substitute={substitute}
        />
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    serverInfo: state.serverInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigComputeResource)