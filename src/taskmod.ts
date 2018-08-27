import * as bApi from 'vso-node-api/BuildApi';
import * as cApi from 'vso-node-api/coreApi';
import * as buildInterfaces from 'vso-node-api/interfaces/BuildInterfaces';
import * as coreInterfaces from 'vso-node-api/interfaces/CoreInterfaces';
import * as escapeStringRegexp from 'escape-string-regexp';
import * as fs from 'fs';
import * as tl from 'vsts-task-lib/task';
import * as vsts from 'vso-node-api';
import * as util from 'util'
import { IRequestHandler } from 'vso-node-api/interfaces/common/VsoBaseInterfaces';

export async function creatBuildDefinition() {
    let collectionUrl: string = tl.getInput('tfsurl');
    let token: string = tl.getInput('tfstoken'); 

    let authHandler = vsts.getPersonalAccessTokenHandler(token);
    let versionHandler = vsts.getVersionHandler('2.0');
    let handlers: IRequestHandler[] = [ authHandler, versionHandler ];
    let buildApi = new bApi.BuildApi(collectionUrl, handlers);
    let coreApi = new cApi.CoreApi(collectionUrl, handlers);

    let currentProject: coreInterfaces.TeamProject = await coreApi.getProject(tl.getInput('projectid'));
    let json: string = fs.readFileSync(tl.getInput('filepath')).toString();
    let branches: string[];

    if (tl.getInput('targetbranches').indexOf(',') ) {
        branches = tl.getInput('targetbranches').split(',');
    }
    else {
        branches = [tl.getInput('targetbranches')];
    }

    // TO-DO: Support multiple target branches
    // branches.forEach(branchName => {
        let branchPath: string;
        if((branches[0].toLowerCase()).indexOf('release') > -1) {
            branchPath = tl.getInput('releasetfvcpath') + branches[0];
        }
        else if((branches[0].toLowerCase()).indexOf('main') > -1) {
            branchPath = tl.getInput('basetfvcpath') + branches[0];
        }
        else {
            branchPath = tl.getInput('featuretfvcpath') + branches[0];
        }
        
        // replaces all occurences of tokens with actual branch name & path
        json = json.replace(
                new RegExp(
                    escapeStringRegexp(
                        tl.getInput('branchnametoken')
                    ), 'g'), branches[0])
            .replace(
                new RegExp(
                    escapeStringRegexp(
                        tl.getInput('branchpathtoken')
                    ), 'g'), branchPath);
        // TO-DO: Make sure build definition is being created in appropriate branch
        let def: buildInterfaces.BuildDefinition = JSON.parse(json);
        def.name += 'TEST';
        def.project = {
            abbreviation: currentProject.abbreviation,
            description: currentProject.description,
            id: currentProject.id,
            name: currentProject.name,
            revision: currentProject.revision,
            state: currentProject.state,
            url: currentProject.url
        };

        // TO-DO: Add try-cactch block for promise
        let result = await buildApi.createDefinition(def, currentProject.id);
        console.log('Result of build definition create is: ' + util.inspect(result, false, null));
   // });
}