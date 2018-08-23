import * as vsts from 'vso-node-api';
import * as bi from 'vso-node-api/interfaces/BuildInterfaces';
import * as fs from 'fs'
import * as util from 'util'
var config = require('./config.json');

export function creatBuildDefinition() {
    // from excluded tfs.json
    let collectionUrl = config.url;
    let token: string = config.token; 

    let authHandler = vsts.getPersonalAccessTokenHandler(token); 
    let connection = new vsts.WebApi(collectionUrl, authHandler);
    console.log("Connection success!");

    let jsonPath: string = config.path;
    let json: string = (fs.readFileSync(jsonPath)).toString();
    let def: bi.BuildDefinition3_2 = JSON.parse(json);
    console.log(util.inspect(def, {depth:100}));
}