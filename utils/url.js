function normalize(url) {
  const tmpArr = url.split(/\/{2,}/)
  if (tmpArr.length >= 2) {
    const [protocol, ...rest] = tmpArr
    url = protocol + '//' + rest.join('/')
  }
  return url
}

module.exports = {
  normalize,
}
