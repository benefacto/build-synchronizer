import * as escapeStringRegexp from 'escape-string-regexp';
import * as glob from 'glob';
import { BuildApi } from 'azure-devops-node-api/BuildApi';
import { BuildDefinition, BuildDefinitionReference } from 'azure-devops-node-api/interfaces/BuildInterfaces';
import { CoreApi } from 'azure-devops-node-api/coreApi';
import { getInput, getVariable } from 'vsts-task-lib';
import { getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { inspect } from 'util';
import { IRequestHandler } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { readFileSync } from 'fs';
import { TeamProject } from 'azure-devops-node-api/interfaces/CoreInterfaces';

function _untokenizeJson(branchName: string, branchPath: string, json: string) {
    return json.replace(new RegExp(
        escapeStringRegexp(getInput('branchnametoken', true)), 'g'),
        branchName)
        .replace(new RegExp(
            escapeStringRegexp(getInput('branchpathtoken', true)), 'g'),
            branchPath);
}

function _initBuildDefinition(json: string, buildDefPath: string, project: TeamProject) {
    let def: BuildDefinition = JSON.parse(json);
    def.path = buildDefPath;
    def.project = project;
    return def;
}

function _getBranchDependentPath(branchPath: string) {
    let path: string = branchPath.replace(getInput('basetfvcpath', true), '')
        .replace('/', '\\');
    return path;
}

function _getFileNames(filePath: string) {
    let fileNames: string[] = glob.sync(filePath);
    if (fileNames == undefined || fileNames.length == 0) {
        throw new Error('No files found for path ' + filePath);
    }
    return fileNames;
}

export async function syncBuildDefinitions() {
    try {
        const handlers: IRequestHandler[] = [
            getPersonalAccessTokenHandler(getVariable('SYSTEM_ACCESSTOKEN')),
        ];
        const buildApi =
            new BuildApi(getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'), handlers);
        const coreApi =
            new CoreApi(getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'), handlers);
        const currentProject: TeamProject =
            await coreApi.getProject(getVariable('SYSTEM_TEAMPROJECTID'));

        let fileNames: string[] = _getFileNames(getInput('filepath', true));
        let buildDefs: BuildDefinitionReference[] =
            await buildApi.getDefinitions(currentProject.id);

        for (const fileName of fileNames) {
            console.log("Processing JSON file " + fileName);
            let json: string = readFileSync(fileName).toString();
            let buildDefPath: string =
                _getBranchDependentPath(getVariable('BUILD_SOURCEBRANCH'));

            json = _untokenizeJson(
                getVariable('BUILD_SOURCEBRANCHNAME'), getVariable('BUILD_SOURCEBRANCH'), json
            );
            let def: BuildDefinition =
                _initBuildDefinition(json, buildDefPath, currentProject);
            console.log("Build definition " + def.name + " intialized from JSON file");

            let result;
            let matchingBuildDef: BuildDefinitionReference =
                buildDefs.filter(m => m.name == def.name)[0];
            if (matchingBuildDef) {
                def.id = matchingBuildDef.id;
                def.revision = matchingBuildDef.revision;
                result = await buildApi.updateDefinition(def, matchingBuildDef.id, currentProject.id);
                console.log("Existing build definition " + matchingBuildDef.name + " updated");
            }
            else {
                result = await buildApi.createDefinition(def, currentProject.id);
                console.log("Build definition " + def.name + " created");
            }
            console.log('Resulting build definition is: \n' +
            inspect(result, false, null));
        }
    }
    catch (e) {
        throw e;
    }
}