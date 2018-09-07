import {
    setResult,
    TaskResult,
    tool,
    which
} from 'vsts-task-lib/task';
import { syncBuildDefinitions } from './taskmod';
import { ToolRunner } from 'vsts-task-lib/toolrunner';

async function run() {
    try {
        let runner: ToolRunner;
        if (process.platform == 'win32') {
            let cmdPath = which('cmd');
            runner = tool(cmdPath).arg('/c');
        }
        else {
            let echoPath = which('echo');
            runner = tool(echoPath);
        }

        let exitCode: number = await runner.exec();
        if (exitCode == 0) {
            syncBuildDefinitions().then(res =>
                console.log('Task completed; exited with code: ' + exitCode)
            ).catch(err =>
                setResult(TaskResult.Failed, err.message));
        }
        else {
            throw new Error('Task exited with code: ' + exitCode);
        }
    }
    catch (err) {
        setResult(TaskResult.Failed, err.message);
    }
}
run();