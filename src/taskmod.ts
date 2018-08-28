import * as escapeStringRegexp from 'escape-string-regexp';
import { BuildApi } from 'vso-node-api/BuildApi';
import { BuildDefinition, BuildDefinitionReference } from 'vso-node-api/interfaces/BuildInterfaces';
import { CoreApi } from 'vso-node-api/coreApi';
import { getInput } from 'vsts-task-lib/task';
import { getPersonalAccessTokenHandler, getVersionHandler } from 'vso-node-api';
import { inspect } from 'util';
import { IRequestHandler } from 'vso-node-api/interfaces/common/VsoBaseInterfaces';
import { lstatSync, readdirSync, readFileSync } from 'fs';
import { TeamProject } from 'vso-node-api/interfaces/CoreInterfaces';

function _untokenizeJson(branchName: string, branchPath: string, json: string) {
    return json.replace(new RegExp(
        escapeStringRegexp(getInput('branchnametoken')), 'g'),
        branchName)
        .replace(new RegExp(
            escapeStringRegexp(getInput('branchpathtoken')), 'g'),
            branchPath);
}

function _initBuildDefinition(json: string, buildDefPath: string, project: TeamProject) {
    let def: BuildDefinition = JSON.parse(json);
    def.name += getInput('defnamepostfix');
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

function _getBranchDependentPath(tfvc: boolean, branchName: string) {
    let path: string = tfvc ? 'tfvcpath' : 'path';
    if ((branchName.toLowerCase()).indexOf('release') > -1) {
        return getInput('release' + path) + branchName;
    }
    else if ((branchName.toLowerCase()).indexOf('main') > -1) {
        return getInput('base' + path) + branchName;
    }
    else {
        return getInput('feature' + path) + branchName;
    }
}

function _getFileNames(filePath: string) {
    let fileNames: string[] = [];
    if (lstatSync(filePath).isDirectory()) {
        readdirSync(filePath).forEach(file => {
            fileNames.push(filePath + file);
        })
    }
    else {
        fileNames = [filePath];
    }
    return fileNames;
}

export async function syncBuildDefinitions() {
    try {
        const handlers: IRequestHandler[] = [
            getPersonalAccessTokenHandler(getInput('tfstoken')),
            getVersionHandler(getInput('tfsapiversionnumber'))
        ];
        const buildApi = new BuildApi(getInput('tfsurl'), handlers);
        const coreApi = new CoreApi(getInput('tfsurl'), handlers);
        const currentProject: TeamProject =
            await coreApi.getProject(getInput('projectid'));

        let fileNames: string[] = _getFileNames(getInput('filepath'))!;
        let buildDefs: BuildDefinitionReference[] =
            await buildApi.getDefinitions(currentProject.id);

        for (const fileName of fileNames) {
            let json: string = readFileSync(fileName).toString();
            let branches: string[] = getInput('targetbranches').indexOf(',') ?
                getInput('targetbranches').split(',') : [getInput('targetbranches')];

            for (const branchName of branches) {
                let branchPath: string = _getBranchDependentPath(true, branchName);
                let buildDefPath: string = _getBranchDependentPath(false, branchName);

                json = _untokenizeJson(branchName, branchPath, json);
                let def: BuildDefinition = _initBuildDefinition(
                    json, buildDefPath, currentProject);

                let result;
                let matchingBuildDef: BuildDefinitionReference =
                    buildDefs.filter(m => m.name == def.name)[0];
                if (matchingBuildDef) {
                    def.id = matchingBuildDef.id;
                    result = await buildApi.deleteDefinition(def.id, currentProject.id);
                }
                result = await buildApi.createDefinition(def, currentProject.id);
                console.log('Result of build definition operation is: \n' +
                    inspect(result, false, null));
            }
        }
    }
    catch (e) {
        throw e;
    }
}