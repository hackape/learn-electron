/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import FileInput from './FileInput'
import { updateFiles, parseFiles, dumpData } from './actions'

class FileReader extends Component {
  constructor (props) {
    super(props)
  }

  onFilesChange = (files) => {
    this.props.dispatch(updateFiles(files))
  }

  onFilesError (error, file) {
    console.log('error code ' + error.code + ': ' + error.message)
  }

  filesRemoveOne = (file) => {
    console.log(this.refs.fileInput);
    this.refs.fileInput.removeFile(file)
  }

  filesRemoveAll = () => {
    this.refs.fileInput.removeFiles()
  }

  openFileChooser = () => {
    this.refs.fileInput.openFileChooser()
  }

  exportDataAsJson = (e) => {
    e.target.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.props.state, null, 2))
  }

  render () {
    const fileReaderDrawer = (
    <div className='file-reader'>
      <div className='button-controls'>
        <button className='btn btn-default' onClick={e=>this.openFileChooser()} >选择文件</button>
        <button className='btn btn-default' onClick={this.filesRemoveAll}>清空选择</button>
        <button className='btn btn-primary' onClick={e=>this.props.dispatch(parseFiles())}>开始处理</button>
      </div>
      <div className='file-input-controls'>
        <FileInput
          className='file-input-dropzone'
          ref='fileInput'
          onChange={this.onFilesChange}
          onError={this.onFilesError}
          multiple={false}
          clickable={true}
        />
        {this.props.files.length > 0 ?
          this.props.files.map((file) =>
            <div className='file-item' key={file.id}>
              <div className='file-item-name'>{file.name}</div>
              <div className='file-item-size'>{file.sizeReadable}</div>
            </div>
          )
        : null}
      </div>
      <div className='result-update-controls'>
        <div className='button-controls'>
          <button className='btn btn-default'
            onClick={e => this.props.dispatch(dumpData())}
            >Save</button>
        </div>
      </div>
    </div>)

    return fileReaderDrawer
  }
}

export default connect(state => ({
  files: state.files,
  questions: state.questions,
  state: state
}))(FileReader)

