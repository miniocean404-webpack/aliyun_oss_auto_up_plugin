const { slash, getBasePath, ossFileExists, deleteEmptyDir } = require('../utils/file')
const path = require('path')
const { client } = require('ali-oss/lib/setConfig')
const { normalize } = require('../utils/url')
const fs = require('fs')
const Listr = require('listr')

async function upload(files, inWebpack, outputPath = '') {
  const { dist, setHeaders, deleteOrigin, setOssPath, timeout, test, overwrite, bail, parallel, logToLocal } = this.config

  if (test) {
    console.log('')
    console.log('目前运行在测试模式。你的文件不会真正被上传.'.green.underline)
    console.log('')
  } else {
    console.log('')
    console.log('你的文件很快就会上传.'.green.underline)
    console.log('')
  }

  files = files.map((file) => ({
    path: file,
    fullPath: slash(path.resolve(file)),
  }))

  this.filesUploaded = []
  this.filesIgnored = []
  this.filesErrors = []

  const basePath = getBasePath(inWebpack, outputPath, this.config.setOssPath)

  let len = parallel

  const createTask = (file) => ({
    title: `uploading ${file.path.underline}`,
    task(_, task) {
      return _upload(file)
        .then((msg) => {
          task.title = msg
          addTask()
        })
        .catch((e) => {
          if (!bail) addTask()
          return Promise.reject(e)
        })
    },
  })

  const tasks = new Listr(files.slice(0, len).map(createTask), {
    exitOnError: bail,
    concurrent: parallel,
  })

  const addTask = () => {
    if (len < files.length) {
      tasks.add(createTask(files[len]))
      len++
    }
  }

  const _upload = async (file) => {
    const { fullPath: filePath, path: fPath } = file

    // oss 上传路径
    let ossFilePath = slash(
      path.join(dist, (setOssPath && setOssPath(filePath)) || (basePath && filePath.split(basePath)[1]) || ''),
    )

    if (test) {
      return Promise.resolve(fPath.blue.underline + ' is ready to upload to ' + ossFilePath.green.underline)
    }

    // 不需要强制覆盖逻辑
    if (!overwrite) {
      const fileExists = await ossFileExists(ossFilePath, this.client)
      if (fileExists) {
        this.filesIgnored.push(filePath)
        return Promise.resolve(fPath.blue.underline + ' ready exists in oss, ignored')
      }
    }

    const headers = (setHeaders && setHeaders(filePath)) || {}
    let result
    try {
      result = await this.client.put(ossFilePath, filePath, {
        timeout,
        // headers: !overwrite ? Object.assign(headers, { 'x-oss-forbid-overwrite': true }) : headers
        headers,
      })
    } catch (err) {
      // if (err.name === 'FileAlreadyExistsError') {
      // 	this.filesIgnored.push(filePath)
      // 	return Promise.resolve(fPath.blue.underline + ' ready exists in oss, ignored');
      // }

      this.filesErrors.push({
        file: fPath,
        err: { code: err.code, message: err.message, name: err.name },
      })

      const errorMsg = `Failed to upload ${fPath.underline}: ` + `${err.name}-${err.code}: ${err.message}`.red
      return Promise.reject(new Error(errorMsg))
    }

    result.url = normalize(result.url)
    this.filesUploaded.push(fPath)

    if (deleteOrigin) {
      fs.unlinkSync(filePath)
      deleteEmptyDir(filePath)
    }

    return Promise.resolve(fPath.blue.underline + ' successfully uploaded, oss url => ' + result.url.green)
  }

  await tasks.run().catch(() => {})

  // this.filesIgnored.length && console.log('files ignored due to not overwrite'.blue, this.filesIgnored);

  if (this.filesErrors.length) {
    console.log(' 上传失败 '.bgRed.white, '\n')
    logToLocal && fs.writeFileSync(path.resolve('upload.error.log'), JSON.stringify(this.filesErrors, null, 2))

    return Promise.reject(' 上传失败 ')
  }
}

module.exports = {
  upload,
}
