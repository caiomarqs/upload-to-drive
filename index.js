const core = require('@actions/core');
const wait = require('./wait');
const fs = require('fs');


// most @actions toolkit packages have async methods
async function run() {
  try {
    // const ms = core.getInput('milliseconds');
    // core.info(`Waiting ${ms} milliseconds ...`);

    // core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    // await wait(parseInt(ms));
    // core.info((new Date()).toTimeString());

    // core.setOutput('time', new Date().toTimeString());


    var path = process.argv[2];

    fs.readdir(path, function (err, items) {
      console.log(items);

      for (var i = 0; i < items.length; i++) {
        console.log(items[i]);
      }
    })
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();