const fs = require('fs')
const path = require('path')

function getBasePath(inWebpack, outputPath, isHaveSetOssPath) {
  if (isHaveSetOssPath) return ''

  let basePath = ''

  if (inWebpack) {
    if (path.isAbsolute(outputPath)) basePath = outputPath
    else basePath = path.resolve(outputPath)
  } else {
    const { buildRoot } = this.config
    if (path.isAbsolute(buildRoot)) basePath = buildRoot
    else basePath = path.resolve(buildRoot)
  }

  return slash(basePath)
}

function slash(path) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  // const hasNonAscii = /[^\u0000-\u0080]+/.test(path);

  if (isExtendedLengthPath) {
    return path
  }

  return path.replace(/\\/g, '/')
}

function deleteEmptyDir(filePath) {
  let dirname = path.dirname(filePath)
  if (fs.existsSync(dirname) && fs.statSync(dirname).isDirectory()) {
    fs.readdir(dirname, (err, files) => {
      if (err) console.error(err)
      else {
        if (!files.length) fs.rmdir(dirname, () => {})
      }
    })
  }
}

function ossFileExists(filepath, client) {
  // return this.client.get(filepath)
  return client
    .head(filepath)
    .then((result) => {
      return result.res.status === 200
    })
    .catch((e) => {
      if (e.code === 'NoSuchKey') return false
    })
}

module.exports = {
  ossFileExists,
  deleteEmptyDir,
  slash,
  getBasePath,
}
