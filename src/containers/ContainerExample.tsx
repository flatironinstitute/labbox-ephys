import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RootAction, RootState } from '../reducers';

interface StateProps {
}

interface DispatchProps {
}

interface OwnProps {
    exampleProp: number
}

type Props = StateProps & DispatchProps & OwnProps

const ContainerExample: FunctionComponent<Props> = ({ exampleProp }) => {
    return <div>ContainerExample: {exampleProp}</div>
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ContainerExample)