 function checkOptions(options = {}) {
  let { from, region, accessKeyId, accessKeySecret, bucket, ossOptions } = options

  let errStr = ''

  if (!region && !ossOptions.region) errStr += '\nregion not specified'
  if (!accessKeyId && !ossOptions.accessKeyId) errStr += '\naccessKeyId not specified'
  if (!accessKeySecret && !ossOptions.accessKeySecret) errStr += '\naccessKeySecret not specified'
  if (!bucket && !ossOptions.bucket) errStr += '\nbucket not specified'

  if (Array.isArray(from)) {
    if (from.some((g) => typeof g !== 'string')) errStr += '\neach item in from should be a glob string'
  } else {
    let fromType = typeof from
    if (['undefined', 'string'].indexOf(fromType) === -1) errStr += '\nfrom should be string or array'
  }

  return errStr
}


module.exports ={
  checkOptions
}
