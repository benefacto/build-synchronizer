# Tamarac Build Synchronizer - VSTS/TFS build extension

This build extension is used to (re-)create VSTS build definitions for TFVC in TFS (2017 Update 2) from 
a provided tokenized JSON file or directory of tokenized files.

## Getting started

You will need to run npm install in the `src` folder to get started:

```bash
npm install
```

## Debugging

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
                "INPUT_BASEBUILDDEFINITIONPATH": "\\\\",
                "INPUT_BRANCHNAMETOKEN": "#(branchName)",
                "INPUT_BRANCHPATHTOKEN": "#(branchPath)",
                "INPUT_DEFNAMEPOSTFIX": "TEST",
                "INPUT_FILEPATH": "C:/TokenizedBuildDefinitions/",
                "INPUT_TFSAPIVERSIONNUMBER": "2.0",
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
    "version": "0.2.0"
}
```

`tasks.json`

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
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

## Packaging

### Staging the files

There is a `gulpfile.js` in the `src` directory that has a `rebuild` task that can be used to create the necessary files to create the build extension package. Run the following:

```bash
gulp rebuild
```

### Creating the VSIX package to publish

First, install the `tfx-cli` tools:

```bash
npm install -g tfx-cli
```

Then run the following from the `src` folder:

```bash
tfx extension create --output-path <your_output_path>
```

NOTE: The version specified in the [vss-extension.json](./src/vss-extension.json) will need to be incremented in order to publish to a VSTS/TFS gallery.