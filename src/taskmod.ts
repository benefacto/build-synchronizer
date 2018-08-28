import * as bApi from 'vso-node-api/BuildApi';
import * as buildInterfaces from 'vso-node-api/interfaces/BuildInterfaces';
import * as cApi from 'vso-node-api/coreApi';
import * as coreInterfaces from 'vso-node-api/interfaces/CoreInterfaces';
import * as escapeStringRegexp from 'escape-string-regexp';
import * as fs from 'fs';
import * as tl from 'vsts-task-lib/task';
import * as util from 'util';
import * as vsoBaseInterfaces from 'vso-node-api/interfaces/common/VsoBaseInterfaces';
import * as vsts from 'vso-node-api';

function untokenizeJson(branchName: string, branchPath: string, json: string) {
    return json.replace(
        new RegExp(
            escapeStringRegexp(
                tl.getInput('branchnametoken')
            ), 'g'), branchName)
        .replace(
            new RegExp(
                escapeStringRegexp(
                    tl.getInput('branchpathtoken')
                ), 'g'), branchPath);
}

function initBuildDefinition(json: string, buildDefPath: string, project: coreInterfaces.TeamProject) {
    let def: buildInterfaces.BuildDefinition = JSON.parse(json);
    def.name += 'TEST';
    def.path = buildDefPath;
    def.project = {
        abbreviation: project.abbreviation,
        description: project.description,
        id: project.id,
        name: project.name,
        revision: project.revision,
        state: project.state,
        url: project.url
    };
    return def;
}

function getBranchDependentPath(tfvc: boolean, branchName: string) {
    let path: string = tfvc ? 'tfvcpath' : 'path';
    if ((branchName.toLowerCase()).indexOf('release') > -1) {
        return tl.getInput('release' + path) + branchName;
    }
    else if ((branchName.toLowerCase()).indexOf('main') > -1) {
        return tl.getInput('base' + path) + branchName;
    }
    else {
        return tl.getInput('feature' + path) + branchName;
    }
}

function getFileNames() {
    let fileNames: string[] = [tl.getInput('filepath')];
    if (fs.lstatSync(tl.getInput('filepath')).isDirectory()) {
        fs.readdir(tl.getInput('filepath'), (err, files) => {
            if (err) throw err;
            files.forEach(file => {
                fileNames.push(file);
            });
        })
    }
    return fileNames;
}

export async function createBuildDefinitions() {
    const handlers: vsoBaseInterfaces.IRequestHandler[] = [
        vsts.getPersonalAccessTokenHandler(tl.getInput('tfstoken')),
        vsts.getVersionHandler(tl.getInput('tfsapiversionnumber'))
    ];
    const buildApi = new bApi.BuildApi(tl.getInput('tfsurl'), handlers);
    const coreApi = new cApi.CoreApi(tl.getInput('tfsurl'), handlers);
    const currentProject: coreInterfaces.TeamProject =
        await coreApi.getProject(tl.getInput('projectid'));
    let fileNames: string[] = getFileNames();
    let buildDefs: buildInterfaces.BuildDefinitionReference[] =
        await buildApi.getDefinitions(currentProject.id);

    for (const fileName of fileNames) {
        let json: string = fs.readFileSync(fileName).toString();
        let branches: string[] = tl.getInput('targetbranches').indexOf(',') ?
            tl.getInput('targetbranches').split(',') : [tl.getInput('targetbranches')];

        for (const branchName of branches) {
            let branchPath: string = getBranchDependentPath(true, branchName);
            let buildDefPath: string = getBranchDependentPath(false, branchName);

            json = untokenizeJson(branchName, branchPath, json);
            let def: buildInterfaces.BuildDefinition = initBuildDefinition(
                json, buildDefPath, currentProject);

            try {
                let result;
                let matchingBuildDef: buildInterfaces.BuildDefinitionReference =
                    buildDefs.filter(m => m.name == def.name)[0];
                if (matchingBuildDef) {
                    def.id = matchingBuildDef.id;
                    result = await buildApi.deleteDefinition(def.id, currentProject.id);
                }
                result = await buildApi.createDefinition(def, currentProject.id);
                console.log('Result of build definition operation is: '
                    + util.inspect(result, false, null));
            }
            catch (e) {
                throw e;
            }
        }
    }
}