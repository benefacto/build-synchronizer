import * as bApi from 'vso-node-api/BuildApi';
import * as buildInterfaces from 'vso-node-api/interfaces/BuildInterfaces';
import * as escapeStringRegexp from 'escape-string-regexp';
import * as fs from 'fs';
import * as tl from 'vsts-task-lib/task';
import * as vsts from 'vso-node-api';

export function creatBuildDefinition() {
    let collectionUrl: string = tl.getInput('tfsurl');
    let token: string = tl.getInput('tfstoken'); 

    let authHandler = vsts.getPersonalAccessTokenHandler(token);
    let handlers = new Array(authHandler);
    let buildApi = new bApi.BuildApi(collectionUrl, handlers);

    let json: string = fs.readFileSync(tl.getInput('filepath')).toString();
    let branches: string[];

    if (tl.getInput('targetbranches').indexOf(',') ) {
        branches = tl.getInput('targetbranches').split(',');
    }
    else {
        branches = [tl.getInput('targetbranches')];
    }

    branches.forEach(branchName => {
        let branchPath: string;
        if((branchName.toLowerCase()).indexOf('release') > -1) {
            branchPath = tl.getInput('releasetfvcpath') + branchName;
        }
        else if((branchName.toLowerCase()).indexOf('main') > -1) {
            branchPath = tl.getInput('basetfvcpath') + branchName;
        }
        else {
            branchPath = tl.getInput('featuretfvcpath') + branchName;
        }
        
        // replace all occurences of tokens with actual branch name & path
        json = json.replace(
                new RegExp(
                    escapeStringRegexp(
                        tl.getInput('branchnametoken')
                    ), 'g'), branchName)
            .replace(
                new RegExp(
                    escapeStringRegexp(
                        tl.getInput('branchpathtoken')
                    ), 'g'), branchPath);
        
        let def: buildInterfaces.BuildDefinition = JSON.parse(json);
        def.name += "TEST"
        let data = buildApi.createDefinition(def);
        console.log(data);
    });
}