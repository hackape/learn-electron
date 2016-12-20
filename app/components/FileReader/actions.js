import { createAction } from 'redux-actions'

import os from 'os'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

export const UPDATE_FILES = 'UPDATE_FILES'
export const updateFiles = createAction(UPDATE_FILES)

export const PARSE_DOC = 'PARSE_DOC'
const parseDoc = createAction(PARSE_DOC, (text, imagePaths) => ({text, imagePaths}) )

export const parseFiles = () => {
  return (dispatch, getState) => {
    let state = getState()
    if (!state.files.length) return

    let file = state.files[0]
    let assetsFolderPath = file.path.replace(path.extname(file.path), '.files')

    fs.readdir(assetsFolderPath, (err, filePaths) => {
      let fullImagePaths = {}
      if (!err) {
        fullImagePaths = filePaths.reduce((acc, filePath) => {
          acc[filePath] = path.join(assetsFolderPath, filePath)
          return acc
        }, {})
      }

      fs.readFile(file.path, 'utf8', (err, rawText) => {
        if (err) throw err
        dispatch(parseDoc(rawText, fullImagePaths))
      })
    })
  }
}

// electron 环境下的特殊 require:
var qiniu = require('electron').remote.require('qiniu')
var md5 = require('md5')
qiniu.conf.ACCESS_KEY = '4fxEBmN0eq4uqxeOWMvMRjHEC3n_q14y3NRvz13G'
qiniu.conf.SECRET_KEY = 'gttihMh5CEbm97U7T1GV44nZ1hsQxPTfgsvPY9vV'
const QINIU_BASEURL = '//7u2ndd.com1.z0.glb.clouddn.com'

function uploadFileToQiniu(bucket, key, localFile) {
  var extra = new qiniu.io.PutExtra()
  var putPolicy = new qiniu.rs.PutPolicy(`${bucket}:${key}`)

  qiniu.io.putFile(putPolicy.token(), key, localFile, extra, (err, ret) => {
    if (!err) {
      // 上传成功， 处理返回值
      console.log(ret.hash, ret.key, ret.persistentId)
    } else {
      // 上传失败， 处理返回代码
      console.log(err)
    }
  })
}

const getImageToMD5Map = (imagePaths) => {
  let imageToMD5 = {}
  _.forEach(imagePaths, fullPath =>
    imageToMD5[fullPath] = `${QINIU_BASEURL}/${md5(fs.readFileSync(fullPath))}${path.extname(fullPath)}`
  )
  return imageToMD5
}

export const uploadImages = () => {
  return (dispatch, getState) => {
    const imagePaths = getState().imagePaths
    let imageToMD5 = getImageToMD5Map(imagePaths)

    const BUCKET_NAME = 'test-bucket'

    _.forEach(imageToMD5, (md5_name, fullPath) => {
      uploadFileToQiniu(BUCKET_NAME, `${md5_name}`, fullPath)
    })

    dispatch({type: 'REASSIGN_IMAGES_SOURCE', payload: imageToMD5})
  }
}


var MongoClient = require('electron').remote.require('mongodb').MongoClient
var mongoUrl = 'mongodb://localhost:27017/yixue'

export const saveToMongoDB = () => {
  return (dispatch, getState) => {
    dispatch(uploadImages())

    const { questions } = getState()
    MongoClient.connect(mongoUrl, function(err, db) {
      if (!err) console.log("Connected successfully to server")
      var collection = db.collection('questions')
      var dataToInsert = _.map(questions, q => {
        q.question_id = q.id
        delete q.id
        q.analyze = q.analyze.map((each, idx) => {
          each.analyze_content = each.analyze_content.reduce((acc, step, stepIdx) => {
            acc[`analyze_${idx+1}_step_${stepIdx+1}`] = step
            return acc
          }, {})
          return each
        })
        return q
      })

      collection.insertMany(dataToInsert, (err, result) => {
        if (err) console.log('err!', err)
        db.close()
      })
    })
  }
}


export const dumpData = () => {
  return (dispatch, getState) => {
    dispatch(saveToMongoDB())
  }
}
