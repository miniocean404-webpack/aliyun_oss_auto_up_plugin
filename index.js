const OSS = require('ali-oss')

require('colors')

const { checkOptions } = require('./utils/check')
const { doWithWebpack } = require('./core/have-webpack')
const { doWithoutWebpack } = require('./core/no-webpack')

class WebpackAliyunOss {
  constructor(options) {
    const { region, accessKeyId, accessKeySecret, bucket, ossOptions = {} } = options

    this.config = Object.assign(
      {
        test: false, // 测试
        dist: '', // oss目录
        buildRoot: '.', // 构建目录名
        deleteOrigin: false, // 是否删除源文件
        timeout: 30 * 1000, // 超时时间
        parallel: 5, // 并发数
        setOssPath: null, // 手动设置每个文件的上传路径
        setHeaders: null, // 设置头部
        overwrite: false, // 覆盖oss同名文件
        bail: false, // 出错中断上传
        logToLocal: false, // 出错信息写入本地文件
      },
      options,
    )

    this.configErrStr = checkOptions(options)
    this.client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      ...ossOptions,
    })

    this.filesUploaded = []
    this.filesIgnored = []
  }

  apply(compiler) {
    if (compiler) {
      return doWithWebpack.bind(this)(compiler)
    } else {
      return doWithoutWebpack.bind(this)()
    }
  }
}

module.exports = WebpackAliyunOss
