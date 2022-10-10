const globby = require('globby')
const { upload } = require('./upload')

async function doWithoutWebpack() {
  if (this.configErrStr) return Promise.reject(this.configErrStr)

  const { from } = this.config
  const files = await globby(from)

  if (files.length) {
    try {
      await upload.call(this, files)
      console.log('')
      console.log('\r\n 所有文件成功上传 '.bgGreen.bold.white)
    } catch (err) {
      return Promise.reject(err)
    }
  } else {
    console.log('没有文件被上传')
    return Promise.resolve('没有文件被上传')
  }
}

module.exports = {
  doWithoutWebpack,
}
