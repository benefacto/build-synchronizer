# Tamarac Build Synchronizer - Azure DevOps build extension

This build extension is used to create or update Team Foundation Version Control build definitions 
in Azure DevOps Services from a provided JSON file(s).

## Running locally

You will need to run npm install in the `src` folder to get started:

```bash
npm install
```

## Debugging locally

Set up these two files in a `.vscode` folder at the root of the Git repository to debug within Visual Studio Code:

`launch.json` - replace example values in env's nested properties as appropriate

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "configurations": [
        {
            "env": {
                "BUILD_SOURCEBRANCH": "$/ProjectName/FeatureBranches/Branch",
                "BUILD_SOURCEBRANCHNAME": "Branch",
                "INPUT_BASETFVCPATH": "$/ProjectName",
                "INPUT_BRANCHNAMETOKEN": "#(branchName)",
                "INPUT_BRANCHPATHTOKEN": "#(branchPath)",
                "INPUT_FILEPATH": "C:/TokenizedBuildDefinitions/*.json",
                "SYSTEM_ACCESSTOKEN": "alphanumerictfstoken",
                "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI": "https://accountName.visualstudio.com/ProjectName/",
                "SYSTEM_TEAMPROJECTID": "alphanumericprojectid"
            },
            "name": "Launch Program",
            "outFiles": [
                "${workspaceFolder}/src/output/**/*.js"
            ],
            "outputCapture": "std",
            "program": "${workspaceFolder}\\src\\output\\TamaracBuildSynchronizer\\index.js",
            "request": "launch",
            "smartStep": true,
            "sourceMaps": true,
            "type": "node"
        }
    ],
    "version": "3.0.1"
}
```

`tasks.json`

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "3.0.1",
    "tasks": [
        {
            "type": "typescript",
            "tsconfig": "src\\tsconfig.json",
            "option": "watch",
            "problemMatcher": [
                "$tsc-watch"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

Then run the build step by pressing `Ctrl+Shift+B`, and any updates will trigger a TypeScript build. Debug by pressing `F5`.

## Staging the files

There is a `gulpfile.js` in the `src` directory that has tasks that can be used to create the necessary files to create the build extension package. Run the following:

```bash
gulp clean; gulp build; gulp package;
```

## Publishing a new version of the build task

First, install the `tfx-cli` tools:

```bash
npm install -g tfx-cli
```

Then run the following from the `src` folder:

```bash
tfx build tasks delete <existing_task_id>
tfx build tasks create --output-path <your_output_path>
```

NOTE: The version specified in the [vss-extension.json](./src/vss-extension.json) and [task.json](./src/TamaracBuildSynchronizer/task.json) will need to be incremented in order to publish.