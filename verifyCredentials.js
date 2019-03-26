"use strict";
const request = require('request-promise');
var util      = require('util');

module.exports = verify;

/**
 * Executes the verification logic by sending a simple request to Impartner PRM using the credentials provided.
 * If the request succeeds, we can assume that the credentials are valid. Otherwise, they are not valid.
 *
 * @param credentials object to retrieve auth connection variables from
 *
 * @returns Promise sending HTTP request and resolving its response
 */
function verify(credentials) {

    // get the value of our credentials variables defined in credentials section of component.json
    const username        = credentials.username;
    const password        = credentials.password;
    const environmentType = credentials.environmentType;
    const apiVersion      = credentials.apiVersion;

    //check for missing values and throw errors if not found
    if (!username) {
        throw new Error('Username is missing');
    }else if(!password){
        throw new Error('Password is missing');
    }else if(!environmentType){
        throw new Error('Environment Type is missing');
    }else if(!apiVersion){
        throw new Error('API Version is missing');
    }

    //call to format auth header. Put this into a utility. Doesnt belong here long term
    var credentials    = util.format("%s:%s", username, password);
    var headerAuth     = 'Basic ' + new Buffer(credentials).toString('base64');
    var environmentURL = ''

    switch(environmentType){
        case 'Dev':
            environmentURL = 'https://thilabs.com/rv.dev/api';
        break;
        case 'Stage':
            environmentURL = 'https://thilabs.com/rv.stage/api';
        break;
        case 'Prod':
            environmentURL = 'https://rv.treehousei.com/api';
        break;
    }

    // sending a request to the most simple endpoint of the target API
    const requestOptions = {
        uri: environmentURL + '/objects/' + apiVersion +'/PartnerLevel',
        headers: {
            'Authorization': headerAuth
        },
        json: true
    };

    // if the request succeeds, we can assume the credentials are valid
    return request.get(requestOptions);
}