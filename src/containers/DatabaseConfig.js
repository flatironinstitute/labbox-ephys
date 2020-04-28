import React from 'react'
import { connect } from 'react-redux'
import { setDatabaseConfig } from '../actions'

import { useForm } from "react-hook-form";
import { FormGroup, FormControl, InputLabel, Input, Button } from '@material-ui/core';


// Messages
const required = "This field is required";
const maxLength = "Your input exceed maximum length";

const errorMessage = error => {
  return <div className="invalid-feedback">{error}</div>;
};

const TheForm = ({ onSubmit, onCancel, data }) => {
  let defaultValues = data;
  const { register, handleSubmit, errors } = useForm({
    defaultValues: defaultValues
  });

  const formGroupStyle = {
    paddingTop: 25
  };

  return (
    <div className="container">
      <div className="col-sm-12">
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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

const DatabaseConfig = ({ databaseConfig, onSetDatabaseConfig, onDone }) => {
  // return <div>Add compute resource...</div>
  const handleSubmit = (data) => {
    onSetDatabaseConfig(data)
    onDone && onDone()
  }
  const handleCancel = () => {
    onDone && onDone()
  }
  return <TheForm onSubmit={handleSubmit} onCancel={handleCancel} data={databaseConfig} />;
}

const mapStateToProps = state => ({
    databaseConfig: state.databaseConfig
})

const mapDispatchToProps = dispatch => ({
  onSetDatabaseConfig: config => dispatch(setDatabaseConfig(config))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatabaseConfig)
