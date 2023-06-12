const core = require('@actions/core')
const fsAsync = require('fs').promises
const fs = require('fs')
const path = require('path')
const gdrive = require('./lib/gdrive')
require('dotenv').config()

const run = async () => {


  try {
    const folderPath = core.getInput('folderToUpload')
    const ignorePaths = core.getInput('ignorePaths').split(',')
    const driveFolderId = core.getInput('driveFolderId')
    
    await gdrive.deleteFilesFolder(driveFolderId)

    const completeFolderPath = path.join(__dirname, folderPath)

    fs.readdir(completeFolderPath, (err, items) => {
      core.info('Upload files to drive')

      items.forEach(
        async item => await gdrive.uploadFile(
          completeFolderPath,
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