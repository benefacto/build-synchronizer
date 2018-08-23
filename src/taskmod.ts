import * as vsts from 'vso-node-api';
import * as bapi from 'vso-node-api/BuildApi';
import * as bi from 'vso-node-api/interfaces/BuildInterfaces';
import * as fs from 'fs';
import * as util from 'util';
import * as escapeStringRegexp from 'escape-string-regexp';
var config = require('./config.json');

export function creatBuildDefinition() {
    // TO-DO: move to launch.json environment variables
    let collectionUrl = config.url;
    let token: string = config.token; 

    let authHandler = vsts.getPersonalAccessTokenHandler(token);
    let handlers = new Array(authHandler);
    let connection = new vsts.WebApi(collectionUrl, authHandler);
    let buildApi = new bapi.BuildApi(collectionUrl, handlers);
    console.log("Connection success!");

    let jsonPath: string = config.path;
    let json: string = (fs.readFileSync(jsonPath)).toString();
    config.targetBranches.forEach(branch => {
        let branchName: string = branch
        let branchPath: string = branch
        if((branchName.toLowerCase()).indexOf("release") > -1) {
            branchPath = config.releaseTfvcPath + branchPath;
        }
        else if((branchName.toLowerCase()).indexOf("main") > -1) {
            branchPath = config.featureTfvcPath + branchPath;
        }
        else {
            branchPath = config.baseTfvcPath + branchPath;
        }
        // replace all occurences of tokens with actual branch name & path
        json = json.replace(new RegExp(escapeStringRegexp(config.branchNameToken), 'g'), branchName)
            .replace(new RegExp(escapeStringRegexp(config.branchPathToken), 'g'), branchPath);
        //let def: bi.BuildDefinition3_2 = JSON.parse(json);
        //console.log(util.inspect(def, {depth:100}));
        //buildApi.createDefinition(def);
    });
}