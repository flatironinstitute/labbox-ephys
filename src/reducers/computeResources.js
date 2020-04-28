import { ADD_COMPUTE_RESOURCE } from '../actions'
import { DELETE_COMPUTE_RESOURCE } from '../actions'
import { RECEIVE_COMPUTE_RESOURCE_JOB_STATS } from '../actions'
import { INIT_FETCH_COMPUTE_RESOURCE_JOB_STATS } from '../actions'
import { RECEIVE_COMPUTE_RESOURCE_ACTIVE } from '../actions'
import { INIT_FETCH_COMPUTE_RESOURCE_ACTIVE } from '../actions'

const computeResources = (state = [], action) => {
    switch (action.type) {
        case ADD_COMPUTE_RESOURCE:
            if (findComputeResource(state, action.newComputeResource.computeResourceName)) {
                console.error(`ADD_COMPUTE_RESOURCE: Compute resource with name already exists: ${action.computeResourceName}`);
                return state;
            }
            return [
                ...state,
                action.newComputeResource
            ]
        case DELETE_COMPUTE_RESOURCE:
            if (!findComputeResource(state, action.computeResourceName)) {
                console.error(`DELETE_COMPUTE_RESOURCE: Compute resource with name does not exists: ${action.computeResourceName}`);
                return state;
            }
            return state.filter(r => r.computeResourceName !== action.computeResourceName);
        case INIT_FETCH_COMPUTE_RESOURCE_JOB_STATS:
            return state.map(r => (
                r.computeResourceName === action.computeResourceName ?
                (
                    {...r, fetchingJobStats: true}
                ) : r
            ))
        case RECEIVE_COMPUTE_RESOURCE_JOB_STATS:
            return state.map(r => (
                r.computeResourceName === action.computeResourceName ?
                (
                    {...r, jobStats: action.jobStats, fetchingJobStats: false}
                ) : r
            ))
        case INIT_FETCH_COMPUTE_RESOURCE_ACTIVE:
            return state.map(r => (
                r.computeResourceName === action.computeResourceName ?
                (
                    {...r, fetchingActive: true}
                ) : r
            ))
        case RECEIVE_COMPUTE_RESOURCE_ACTIVE:
            return state.map(r => (
                r.computeResourceName === action.computeResourceName ?
                (
                    {...r, active: action.active, fetchingActive: false}
                ) : r
            ))
        default:
            return state
    }
}

const findComputeResource = (resources, name) => {
    return resources.filter(r => r.computeResourceName === name)[0];
}

export default computeResources