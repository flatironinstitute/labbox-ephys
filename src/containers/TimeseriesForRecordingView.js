import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import TimeseriesView from '../components/TimeseriesView'
import { SizeMe } from 'react-sizeme';
import { createMuiTheme, ThemeProvider, CssBaseline, Paper} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';



const TimeseriesForRecordingView = ({ recordingId, recording, jobHandlers }) => {

  const useStyles = makeStyles({
    paper: {
      background: 'black',
    },
  });

  const theme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  const classes = useStyles();

  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  const hitherConfig = {
    job_handler_role: 'general'
  };

  return (
    
    <ThemeProvider theme={theme}>
      
      <CssBaseline />      
        <h4>{recording.recordingLabel}</h4>
        <SizeMe
          render={
            ({ size }) => {
              const width = size.width;
              const height = 750; // hard-coded for now
              return (
                
                <Paper className={classes.paper}>
                  <TimeseriesView
                    recordingObject={recording.recordingObject}
                    width={width}
                    height={height}
                    hitherConfig={hitherConfig}
                  />
                </Paper>
              );
            }
          }
        /> 
    </ThemeProvider>

  )
}

const mapStateToProps = (state, ownProps) => ({
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0],
  jobHandlers: state.jobHandlers
})

const mapDispatchToProps = dispatch => ({
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeseriesForRecordingView))
