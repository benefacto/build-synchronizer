import * as vsts from 'vso-node-api';
var tfs = require('./tfs.json');

export function sayHello() {
    // from excluded tfs.json
    let collectionUrl = tfs.url;
    let token: string = tfs.token; 

    let authHandler = vsts.getPersonalAccessTokenHandler(token); 
    let connection = new vsts.WebApi(collectionUrl, authHandler);
    console.log("Connection success!");
}