#!/usr/bin/env node

import LoggeryServer from './LoggeryServer.js';
import fs from 'fs';

checkEnvironmentVariable('LOGGERY_SERVER_DIR', {checkDirExists: true});
checkEnvironmentVariable('PORT', {checkIsInt: true});

if (process.env.LOGGERY_TEST_SIGNATURE) {
    console.warn('WARNING: the LOGGERY_TEST_SIGNATURE environment variable has been set.');
}

async function main() {
    const server = new LoggeryServer(process.env.LOGGERY_SERVER_DIR);
    await server.listen(process.env.PORT);
}

function checkEnvironmentVariable(varname, opts) {
    let val = process.env[varname];
    if (!val) {
        throw new Error(`Missing environment variable: ${varname}`)
    }
    if (opts.checkDirExists) {
        if (!fs.existsSync(val)) {
            throw new Error(`Directory does not exist: ${val}`)
        }
        if (!fs.lstatSync(val).isDirectory()) {
            throw new Error(`Not a directory: ${val}`)
        }
    }
    if (opts.checkFileExists) {
        if (!fs.existsSync(val)) {
            throw new Error(`File does not exist: ${val}`)
        }
        if (!fs.lstatSync(val).isFile()) {
            throw new Error(`Not a file: ${val}`);
        }
    }
    if (opts.checkIsInt) {
        let val2 = Number(val);
        if (isNaN(val2)) {
            throw new Error(`Invalid value for ${varname}: ${val}`);
        }
        if (val2 != Math.floor(val2)) {
            throw new Error(`Invalid value for ${varname}: ${val}`);
        }
    }
}

main();