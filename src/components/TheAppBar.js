import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { Home } from '@material-ui/icons';
import "./TheAppBar.css";

const TheAppBar = (props) => {
    return (
        <div className={"TheAppBar"}>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" component={Link} to="/">
                        <Home />&nbsp;
                        <Typography variant="h6">
                            Labbox-ephys
                        </Typography>
                    </Button>
                    <Button color="inherit" component={Link} to="/config" style={{marginLeft: 'auto'}}>Config</Button>
                    <Button color="inherit" component={Link} to="/about">About</Button>
                </Toolbar>
            </AppBar>
            <div style={{padding: 30}}>
                {props.children}
            </div>
        </div>
    )
}

export default TheAppBar