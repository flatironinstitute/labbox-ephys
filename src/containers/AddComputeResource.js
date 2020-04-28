import React from 'react'
import { connect } from 'react-redux'
import { addComputeResource, deleteComputeResource } from '../actions'

import { useForm } from "react-hook-form";
import { FormGroup, FormControl, InputLabel, Input, Button } from '@material-ui/core';


// Messages
const required = "This field is required";
const maxLength = "Your input exceed maximum length";

const errorMessage = error => {
  return <div className="invalid-feedback">{error}</div>;
};

const TheForm = ({ onSubmit, onCancel, oldComputeResource, existingComputeResourceNames }) => {
  let defaultValues = {};
  if (oldComputeResource) {
    defaultValues = oldComputeResource
  }
  const { register, handleSubmit, errors } = useForm({
    defaultValues: defaultValues
  });

  const formGroupStyle = {
    paddingTop: 25
  };

  const validateName = name => {
    if (existingComputeResourceNames) {
      if (existingComputeResourceNames.indexOf(name) >= 0)
        return false;
    }
    return true;
  }

  return (
    <div className="container">
      <div className="col-sm-12">
        {
          oldComputeResource ?
            (<h3>Edit compute resource: {oldComputeResource.computeResourceName}</h3>) :
            (<h3>Add compute resource</h3>)
        }
      </div>
      <div className="col-sm-12">
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <FormGroup style={formGroupStyle}>
            <FormControl>
              <InputLabel>Compute resource name</InputLabel>
              <Input
                name="computeResourceName"
                readOnly={oldComputeResource ? true : false}
                disabled={oldComputeResource ? true : false}
                inputRef={register({ required: true, maxLength: 30, validate: validateName })
                } />
            </FormControl>
          </FormGroup>
          {errors.computeResourceName &&
            errors.computeResourceName.type === "required" &&
            errorMessage(required)}
          {errors.computeResourceName &&
            errors.computeResourceName.type === "maxLength" &&
            errorMessage(maxLength)}
          {errors.computeResourceName &&
            <div className="invalid-feedback">{"Invalid name"}</div>}

          <FormGroup style={formGroupStyle}>
            <FormControl>
              <InputLabel>Compute resource ID</InputLabel>
              <Input
                name="computeResourceId"
                inputRef={register({ required: true, maxLength: 30 })}
              />
            </FormControl>
          </FormGroup>
          {errors.computeResourceId &&
            errors.computeResourceId.type === "required" &&
            errorMessage(required)}
          {errors.computeResourceId &&
            errors.computeResourceId.type === "maxLength" &&
            errorMessage(maxLength)}

          <FormGroup style={formGroupStyle}>
            <FormControl>
              <InputLabel>Mongo URI</InputLabel>
              <Input
                name="mongoUri"
                inputRef={register({ required: false, maxLength: 2000 })}
              />
            </FormControl>
          </FormGroup>
          {errors.mongoUri &&
            errors.mongoUri.type === "required" &&
            errorMessage(required)}
          {errors.mongoUri &&
            errors.mongoUri.type === "maxLength" &&
            errorMessage(maxLength)}

          <FormGroup style={formGroupStyle}>
            <FormControl>
              <InputLabel>Database name</InputLabel>
              <Input
                name="databaseName"
                inputRef={register({ required: false, maxLength: 50 })}
              />
            </FormControl>
          </FormGroup>
          {errors.databaseName &&
            errors.databaseName.type === "required" &&
            errorMessage(required)}
          {errors.databaseName &&
            errors.databaseName.type === "maxLength" &&
            errorMessage(maxLength)}

          <FormGroup row={true} style={formGroupStyle}>
            <Button variant="contained" type="submit">Save</Button>
            <Button type="button" onClick={() => onCancel && onCancel()}>Cancel</Button>
          </FormGroup>
        </form>
      </div>
    </div>
  );
};

const AddComputeResource = ({ onAddComputeResource, onDeleteComputeResource, onDone, oldComputeResource, existingComputeResourceNames }) => {
  // return <div>Add compute resource...</div>
  const handleSubmit = (data) => {
    if (oldComputeResource) {
      onDeleteComputeResource(oldComputeResource.computeResourceName);
    }
    onAddComputeResource(data);
    onDone && onDone()
  }
  const handleCancel = () => {
    onDone && onDone()
  }
  return <TheForm onSubmit={handleSubmit} onCancel={handleCancel} oldComputeResource={oldComputeResource} existingComputeResourceNames={existingComputeResourceNames} />;
}

const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
  onAddComputeResource: newComputeResource => dispatch(addComputeResource(newComputeResource)),
  onDeleteComputeResource: computeResourceName => dispatch(deleteComputeResource(computeResourceName))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddComputeResource)
