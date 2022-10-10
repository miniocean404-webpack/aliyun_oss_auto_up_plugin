const globby =  require('globby')
const path =require('path')
const {upload} = require('./upload')
const {slash} = require('../utils/file')

 function doWithWebpack(compiler) {
  compiler.hooks.afterEmit.tapPromise('WebpackAliyunOss', async (compilation) => {
    if (this.configErrStr) {
      compilation.errors.push(this.configErrStr)
      return Promise.resolve()
    }

    const outputPath = path.resolve(slash(compiler.options.output.path))

    const { from = outputPath + '/**' } = this.config

    const files = await globby(from, { dot: true })

    if (files.length) {
      try {
        await upload.call(this,files, true, outputPath)
        console.log('')
        console.log(' All files uploaded successfully '.bgGreen.bold.white)
      } catch (err) {
        compilation.errors.push(err)
        return Promise.reject(err)
      }
    } else {
      console.log('no files to be uploaded')
      return Promise.resolve('no files to be uploaded')
    }
  })
}

module.exports = {
  doWithWebpack
}
