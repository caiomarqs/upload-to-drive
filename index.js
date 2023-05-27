const core = require('@actions/core')
const fsAsync = require('fs').promises
const fs = require('fs')
const gdrive = require('./lib/gdrive')
require('dotenv').config()

async function run() {
  try {
    const folderPath = core.getInput('folderToUpload')
    const ignorePaths = core.getInput('ignorePaths').split(',')

    fs.readdir(folderPath, (err, items) => items.forEach(
      item => gdrive.uploadFile(
        item,
        core.getInput('driveFolderId'),
        ignorePaths
      )
    ))
  }
  catch (error) {
    core.setFailed(error.message)
  }
}

run()