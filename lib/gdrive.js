const mime = require('mime')
const core = require('@actions/core')
const fs = require('fs')
const path = require('path')

const { google } = require('googleapis')

const getService = () => {
    const encodeCredentials = core.getInput('serviceAccountCredentials')

    const credentials = JSON.parse(
        Buffer.from(encodeCredentials, 'base64').toString('ascii')
    )

    const scopes = [
        'https://www.googleapis.com/auth/drive'
    ]
    const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        scopes
    )

    return google.drive({ version: "v3", auth })
}

const getResourceName = (path) => {
    let name = path.split('/')
    return name[name.length - 1]
}

const createFolder = async (folderName, parentFolder, service) => {
    const name = getResourceName(folderName)

    const fileMetaData = {
        name: name || folderName,
        parents: [parentFolder],
        mimeType: 'application/vnd.google-apps.folder'
    }

    const response = await service.files.create({
        resource: fileMetaData,
        field: 'id'
    })

    return response
}

const sendFileToDrive = async (resource, parentFolder, service) => {
    let fileName = getResourceName(resource)

    core.info(`Upload file: ${resource}`)

    const fileMetaData = {
        name: fileName || resource,
        parents: [parentFolder]
    }

    const media = {
        mimeType: mime.getType(resource),
        body: fs.createReadStream(resource)
    }

    const response = await service.files.create({
        resource: fileMetaData,
        media: media,
        field: 'id'
    })

    return response
}

const uploadFile = async (root, resource, parentFolder, ignorePaths = []) => {
    const service = getService()
    const relativePath = path.join(root, resource)

    if (fs.statSync(relativePath).isDirectory()) {

        if (ignorePaths.includes(resource)) {
            return
        }

        const newFolder = await createFolder(resource, parentFolder, service)
        const idFolder = newFolder.data.id

        fs.readdir(relativePath, (err, subFolderItens) => {
            subFolderItens.forEach(async subItem => {
                await uploadFile(relativePath, subItem, idFolder)
            })
        })

        return
    }

    return await sendFileToDrive(relativePath, parentFolder, service)
}

const deleteFile = async (fileId, service = null) => {
    const thisService = service || getService()

    core.info(`Delete file: ${fileId}`)

    await thisService.files.update({ fileId, resource: { trashed: true } });
}

const deleteFilesFolder = async (parentFolder) => {
    const service = getService()

    core.info('Delete posible files on drive folder')

    const response = await service.files.list({
        pageSize: 1000,
        q: `'${parentFolder}' in parents`,
        fields: 'nextPageToken, files(id, name, parents)'
    })

    const files = response.data.files

    const ids = files.map(file => file.id)

    if (ids.length > 0) {
        ids.forEach(async id => {
            await deleteFile(id, service)
        })
    }
}

module.exports = { uploadFile, deleteFilesFolder }