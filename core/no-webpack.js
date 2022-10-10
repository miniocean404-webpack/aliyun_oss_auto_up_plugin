const  globby  = require('globby')
const {upload} = require('./upload')

 async function doWithoutWebpack() {
  if (this.configErrStr) return Promise.reject(this.configErrStr)

  const { from } = this.config
  const files = await globby(from)

  if (files.length) {
    try {
      await upload.call(this,files)
      console.log('')
      console.log(' All files uploaded successfully '.bgGreen.bold.white)
    } catch (err) {
      return Promise.reject(err)
    }
  } else {
    console.log('no files to be uploaded')
    return Promise.resolve('no files to be uploaded')
  }
}

module.exports = {
  doWithoutWebpack
}
