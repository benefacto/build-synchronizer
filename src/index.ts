import * as mod from './taskmod';
import * as tl from 'vsts-task-lib/task';
import * as trm from 'vsts-task-lib/toolrunner';

async function run() {
    try {
        let tool: trm.ToolRunner;
        if (process.platform == 'win32') {
            let cmdPath = tl.which('cmd');
            tool = tl.tool(cmdPath).arg('/c');
        }
        else {
            let echoPath = tl.which('echo');
            tool = tl.tool(echoPath);
        }

        let rc1: number = await tool.exec();
        if (rc1 == 0) {
            mod.createBuildDefinitions()
                .then(res => console.log('Task completed; exited with code: ' + rc1))
                .catch(err => tl.setResult(tl.TaskResult.Failed, err.message));
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
run();