const core = require('@actions/core')
const fsAsync = require('fs').promises
const fs = require('fs')
const gdrive = require('./lib/gdrive')
require('dotenv').config()

const run = async () => {
  try {
    const folderPath = core.getInput('folderToUpload')
    const ignorePaths = core.getInput('ignorePaths').split(',')
    const driveFolderId = core.getInput('driveFolderId')

    await gdrive.deleteFilesFolder(driveFolderId)

    fs.readdir(folderPath, (err, items) => {
      
      core.info('Upload files to drive')

      core.info(items)

      items.forEach(
        async item => await gdrive.uploadFile(
          item,
          driveFolderId,
          ignorePaths
        )
      )
    })
  }
  catch (error) {
    core.setFailed(error.message)
  }
}

run()