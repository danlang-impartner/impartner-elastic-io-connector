"use strict";
const request  = require('request-promise');
const messages = require('elasticio-node').messages;
const util     = require('util');

exports.process = processAction;
exports.getPartnerLevelModel = getPartnerLevelModel;

/**
 * Executes the action's logic by sending a request to the Petstore API and emitting response to the platform.
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
function processAction(msg, cfg) {

    // access the value of the apiKey field defined in credentials section of component.json
    const apiKey = cfg.apiKey;
    // body contains the mapped data
    const body = msg.body;
    
    console.log('------');
    console.log(msg);
    console.log('------');
    console.log(body);
    console.log('------');

    // access the value of the mapped value into name field of the in-metadata
    const name = body.name;
    // access the value of the mapped value into name field of the in-metadata
    const partnerLevel = body.partnerLevel;

    const username        = cfg.username;
    const password        = cfg.password;
    const environmentType = cfg.environmentType;
    const apiVersion      = cfg.apiVersion;

    var credentials    = util.format("%s:%s", username, password);
    var headerAuth     = 'Basic ' + new Buffer(credentials).toString('base64');
    var environmentURL = '';

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

    if (!name) {
        throw new Error('Name is required');
    }

    

    var account = {
        name
    };

    if(!isNaN(partnerLevel)){
        account[partnerLevel] = Number(partnerLevel);   
    }else{
        var levelId;
        switch(partnerLevel){
            case 'Reseller':
                levelId = 768;
                break;
            case 'Partner':
                levelId = 724;
                break;   
        }
        account[partnerLevel] = levelId;
    }
    console.log('About to create new account');
    console.log(account);
    console.log(partnerLevel);
    console.log(name);

    const requestOptions = {
        uri: environmentURL + '/objects/' + apiVersion +'/Account',
        headers: {
            'Authorization': headerAuth
        },
        body: account,
        json: true
    };

    // return the promise that sends a request to the Petstore API
    return request.put(requestOptions)
        .then((response) => messages.newMessageWithBody(response.data));
}

function getPartnerLevelModel(cfg) {
    // access the value of the apiKey field defined in credentials section of component.json
    const username        = cfg.username;
    const password        = cfg.password;
    const environmentType = cfg.environmentType;
    const apiVersion      = cfg.apiVersion;

    var credentials    = util.format("%s:%s", username, password);
    var headerAuth     = 'Basic ' + new Buffer(credentials).toString('base64');
    var environmentURL = '';

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

    const requestOptions = {
        uri: environmentURL + '/objects/' + apiVersion +'/PartnerLevel?fields=id,name',
        headers: {
            'Authorization': headerAuth
        },
        json: true
    };

    return request.get(requestOptions)
        .then((response) => {
            const model = {};
            console.log(response);
            // transforming a simple array of statuses into a select model
            response.data.results.forEach((level) => {
                model[level.id] = level.name;
            });
            return model;
        });
}