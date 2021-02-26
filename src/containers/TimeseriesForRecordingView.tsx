import React, { FunctionComponent } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import { useRecordingInfo } from '../python/labbox_ephys/extensions/common/useRecordingInfo';
import { Recording } from '../python/labbox_ephys/extensions/pluginInterface';
import TimeseriesViewNew from '../python/labbox_ephys/extensions/timeseries/TimeseriesViewNew/TimeseriesViewNew';

type Props = {
  recording: Recording
  recordingId: string
} & SizeMeProps

const TimeseriesForRecordingView: FunctionComponent<Props> = ({ recordingId, recording, size }) => {
  const recordingInfo = useRecordingInfo(recording?.recordingObject)
  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }
  if (!recordingInfo) {
    return <h3>{`Loading recording info`}</h3>
  }

  const width = size.width;
  const height = 650; // hard-coded for now

  if (!width) return <div>No width</div>

  return (
    <div>
      <h1>{recording.recordingLabel}</h1>
      <div>
        <TimeseriesViewNew
          recordingObject={recording.recordingObject}
          recordingInfo={recordingInfo}
          width={width}
          height={height}
          opts={{channelSelectPanel: true}}
        />
      </div>
    </div>
  )
}

export default sizeMe()(TimeseriesForRecordingView)