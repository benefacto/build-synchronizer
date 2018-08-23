import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');
import mod = require('./taskmod');

async function run() {
    try {
        console.log(process.env["INPUT_SAMPLESTRING"]);
        let tool: trm.ToolRunner;
        if (process.platform == 'win32') {
            let cmdPath = tl.which('cmd');
            tool = tl.tool(cmdPath).arg('/c').arg('echo ' + tl.getInput('samplestring', true));
        }
        else {
            let echoPath = tl.which('echo');
            tool = tl.tool(echoPath).arg(tl.getInput('samplestring', true));
        }

        let rc1: number = await tool.exec();

        console.log("new change");
        
        // call some module which does external work
        if (rc1 == 0) {
            mod.creatBuildDefinition();
        }
        
        console.log('Task done! ' + rc1);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();