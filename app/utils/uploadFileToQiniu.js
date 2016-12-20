var qiniu = require('electron').remote.require('qiniu')
var md5 = require('md5')

function uploadFileToQiniu (bucket, localFile) {
  return new Promise(function (resolve, reject) {
    fs.readFile(localFile, (err, buffer) => {
      if (err) return reject(err)

      let key = md5(buffer)
      let blob = new Blob(buffer)
      var putPolicy = new qiniu.rs.PutPolicy(`${bucket}:${key}`)

      let data = new FormData()
      data.append('token', putPolicy.token())
      data.append('key', key)
      data.append('file', blob)

      window.$.ajax({
        type: 'POST',
        url: 'http://up.qiniu.com',
        contentType: false,
        processData: false,
        data: data,
        success: (data) => resolve(data),
        error: (err) => reject(err)
      })

    })
  })
}
