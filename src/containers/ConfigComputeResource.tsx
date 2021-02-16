import { LabboxProviderContext } from 'labbox';
import React, { FunctionComponent, useContext } from 'react';
import Markdown from '../extensions/common/Markdown';
import md from './ConfigComputeResource.md.gen';


type Props = {}

const ConfigComputeResource: FunctionComponent<Props> = () => {
    const { serverInfo } = useContext(LabboxProviderContext)
    if (!serverInfo) return <div>No server info</div>
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

export default ConfigComputeResource