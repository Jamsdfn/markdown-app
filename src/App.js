import { useEffect, useState } from 'react';
import './App.scss';
import "easymde/dist/easymde.min.css";
import { Button, Spin, ConfigProvider, Empty, Modal, Input, message } from 'antd'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import TabList from './components/TabList'
import SimpleMDE from 'react-simplemde-editor'
import fileHelper from './utils/fsHandler'
import { DownloadOutlined, PlusOutlined, ExclamationCircleFilled, FolderOpenOutlined } from '@ant-design/icons'
import { unSaveFileIdAdd, unSaveFileIdRemove } from './store/unSaveIdSlice'
import { useDispatch } from 'react-redux'
import { useKeyPress } from 'ahooks'
import { v4 as uuidv4 } from 'uuid'
import { omit } from 'lodash'

const { existsSync } = window.require('fs')
const path = window.require('path')
const Store = window.require('electron-store')
const { ipcRenderer } = window.require('electron')
// const { dialog } = window.require('@electron/remote')

const fileStore = new Store()

const saveToStore = (files) => {
  const fileData = files.map(file => {
    return omit(file, 'body')
  })
  fileStore.set('file', fileData)
}

function App() {
  const [isLoading, setLoading] = useState(false)
  const [editingFiles, setEditingFiles] = useState([])
  const [activeFileId, setActiveFileId] = useState('')
  const [searchFiles, setSearchFiles] = useState([])
  const [workspaceFile, setWorkspaceFile] = useState(fileStore.get('file'))
  const [newFileModelOpen, setNewFileModelOpen] = useState(false)
  const [newFileLoading, setNewFileLoading] = useState(false)
  const [newFilePath, setNewFilePath] = useState('')
  const [newFileTitle, setNewFileTitle] = useState('')

  const dispatch = useDispatch()
  const key = process.platform === 'darwin' ? 'meta' : 'ctrl'
  useKeyPress(`${key}.s`, (e, key) => {
    handleActiveFileSave();
  })

  let activeFile = workspaceFile.find(item => item.id === activeFileId)

  // 关闭编辑标签
  const handleCloseEditingFile = (closeId) => {
    const files = editingFiles.filter(item => item.id !== closeId)
    if (activeFileId === closeId) {
      activeFile.body = ''
      setActiveFileId(files[0]?.id)
      dispatch(unSaveFileIdRemove(closeId))
    }
    setEditingFiles(files)
  }
  // 关闭工作区中的文件
  const handleCloseFile = (closeId) => {
    const fileLists = workspaceFile.filter(item => item.id !== closeId)
    handleCloseEditingFile(closeId)
    setWorkspaceFile(fileLists)
  }

  // 删除文件
  const handleDeleteFileClick = (deleteId) => {
    const deleteFile = workspaceFile.find(file => file.id === deleteId)
    Modal.confirm({
      title: '是否要删除文件',
      icon: <ExclamationCircleFilled />,
      content: `是否要删除（${deleteFile?.path}）这个文件`,
      okText: '是的',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        handleDeleteFile(deleteId, deleteFile)
      }
    })
  }
  // 删除文件
  const handleDeleteFile = async (deleteId, deleteFile) => {
    try {
      if (!deleteFile) return
      await fileHelper.deleteFile(deleteFile.path)
      handleCloseFile(deleteId)
    } catch (err) {
        Modal.error({
          title: '文件删除失败',
          content: '看看文件是否还存在？',
          okType: 'danger',
          okText: '行'
        })
    }
  }

  // 重命名文件
  const handleRenameFile = async (fileId, newTitle) => {
    try {
      const renameFile = workspaceFile.find(file => file.id === fileId)
      if (!renameFile) return
      const newPath = path.join(path.dirname(renameFile.path), `${ newTitle }.md`)
      if (existsSync(newPath)) {
        Modal.error({
          title: '重命名失败',
          content: `原文件(${renameFile.title})目录下已存在叫${newTitle}.md的文件了，换个名字试试？`,
          okType: 'danger',
          okText: '行'
        })
        return
      }
      await fileHelper.renameFile(renameFile.path, newPath)
      renameFile.path = newPath
      renameFile.title = newTitle
      setWorkspaceFile([...workspaceFile])
    } catch (err) {
        Modal.error({
          title: '文件改名失败',
          content: '看看原文件是否还存在？',
          okType: 'danger',
          okText: '行'
        })
    }
  }

  // 文件搜索
  const handleFileSearch = (keyword) => {
    setSearchFiles(workspaceFile.filter(file => file.title.includes(keyword)))
  }

  // active 文件修改
  const handleActiveFileChange = (id, content) => {
    if (activeFile.body !== content) {
      activeFile.body = content
      dispatch(unSaveFileIdAdd(id))
    }
  }

  // active 文件保存
  const handleActiveFileSave = async () => {
    if (activeFile) {
      try {
        await fileHelper.writeFile(activeFile.path, activeFile.body)
        dispatch(unSaveFileIdRemove(activeFile.id))
      } catch (err) {
          Modal.error({
            title: '文件保存失败',
            content: '看看文件是否还存在？',
            okType: 'danger',
            okText: '行'
          })
      }
    }
  }

  // 重置新增文件
  const handleNewCancel = () => {
    setNewFileModelOpen(false)
    setNewFilePath('')
    setNewFileTitle('')
  }

  // 新增文件
  const handleNewFile = async (choosePath, title) => {
    if (!choosePath || !title) {
      message.error({
        content: '请填入完整信息才能新建文件'
      })
      return
    }
    setNewFileLoading(true)
    const newPath = path.join(choosePath, `${ title }.md`)
    const newId = uuidv4()
    try {
      if (existsSync(newPath)) {
        Modal.error({
          title: '新建失败',
          content: `该目录下已存在叫${title}.md的文件了，换个名字试试？`,
          okType: 'danger',
          okText: '行'
        })
        return
      }
      await fileHelper.writeFile(newPath, '')
      setWorkspaceFile([...workspaceFile, {
        createAt: Date.now(),
        id: newId,
        path: newPath,
        title
      }])
      setActiveFileId(newId)
      handleNewCancel()
    } catch (err) {
      Modal.error({
        title: '文件新建失败',
        content: '未知错误',
        okType: 'danger',
        okText: '行'
      })
    } finally {
      setNewFileLoading(false)
    }
  }

  // 选择目录
  const handleChooseNewFilePath = async () => {
    const res = await ipcRenderer.invoke('choose-file', {
      title: '选择要导入的 Markdown 文件',
      properties: ['openDirectory', 'createDirectory']
    })
    setNewFilePath(res.filePaths[0])
  }

  // 导入文件
  const handleImportFiles = async () => {
    // 放弃remote方式，改用推荐的订阅发布模式(send-on; invoke-handle)
    const res = await ipcRenderer.invoke('choose-file', {
      title: '选择要导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown files', extensions: ['md'] }
      ]
    })
    /**
     * 在以前的老版本electron中electron是remote这个对象的，高版本移除了这个对象，
     * 但是可以装@electron/remote继续使用，可以直接调用一些原主进程的接口（一些原生功能），
     * 可是这样是不合理的，渲染进程就应该只关心渲染的事，应该解耦，官方也可能是这样考虑的所以移除了remote
     */
    // const res = await dialog.showOpenDialog({
    //   title: '选择要导入的 Markdown 文件',
    //   properties: ['openFile', 'multiSelections'],
    //   filters: [
    //     { name: 'Markdown files', extensions: ['md'] }
    //   ]
    // })
    if (Array.isArray(res.filePaths)) {
      // 把已有的文件过滤掉
      const filteredPaths = res.filePaths.filter(path => {
        const alreadyAdded = Object.values(workspaceFile).find(file => {
          return file.path === path
        })
        return !alreadyAdded
      })
      // 扩展文件信息
      const importFilesArr = filteredPaths.map(paths => {
        return {
          id: uuidv4(),
          title: path.basename(paths, path.extname(paths)),
          path: paths,
          createAt: new Date().getTime()
        }
      })
      const newFiles = [ ...workspaceFile, ...importFilesArr ]
      setWorkspaceFile(newFiles)
    }
  }

  // 工作区文件点击
  const handleWorkspaceFileClick = async (id) => {
    setLoading(true)
    const file = workspaceFile.find(item => item.id === id)
    if (!file.body) file.body = await fileHelper.readFile(file.path)
    setActiveFileId(id)
    setLoading(false)
  }

  useEffect(() => {
    activeFile = workspaceFile.find(item => item.id === activeFileId)
    if (activeFileId && !editingFiles.some(editingFile => editingFile.id === activeFileId)) setEditingFiles([...editingFiles, activeFile])
  }, [activeFileId])

  useEffect(() => {
    if (workspaceFile && workspaceFile.length) {
      saveToStore(workspaceFile)
    }
  }, [workspaceFile])

  const fileList = searchFiles.length > 0 ? searchFiles : workspaceFile
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7588A3'
        },
      }}>
      <div className="container">
        <Spin spinning={isLoading} fullscreen tip="加载中" size="large" />
        <div className="left-container">
          <FileSearch title="妈宕编辑器" onFileSearch={ handleFileSearch }></FileSearch>
          <FileList
            files={ fileList }
            activeFileId={ activeFileId }
            onFileClick={ handleWorkspaceFileClick }
            onFileDelete={ handleDeleteFileClick }
            onFileClose={ handleCloseFile }
            onSaveEdit={ handleRenameFile }>
          </FileList>
          <Button
            className='editor-button'
            icon={<PlusOutlined/>}
            type='primary'
            block
            onClick={() => setNewFileModelOpen(true)}>新建</Button>
          <Button
            className='editor-button'
            icon={<DownloadOutlined />}
            block
            onClick={handleImportFiles}
          >导入</Button>
        </div>
        <div className="right-container">
          <TabList
            activeFileId={ activeFileId }
            files={ editingFiles }
            onChange={setActiveFileId}
            onRemove={handleCloseEditingFile}
          />
          {activeFile ? (
            <SimpleMDE
              key={activeFile && activeFile.id}
              value={activeFileId && activeFile.body}
              onChange={(value) => { handleActiveFileChange(activeFile.id, value) }}
              options={{
                minHeight: 'calc(100vh - 110px)',
                maxHeight: 'calc(100vh - 110px)',
                toolbar: false,
                toolbarTips: false,
                previewImagesInEditor: true
              }}
            />
          ) : (
            <Empty
              description="请选择文件"
              style={{
                height: 'calc(100vh - 110px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            />
          )}
        </div>
      </div>
      <Modal
        title="新建文件"
        open={newFileModelOpen}
        onOk={() => handleNewFile(newFilePath, newFileTitle)}
        confirmLoading={newFileLoading}
        onCancel={handleNewCancel}
      >
        <p>
          选择目录:
          <Button
            style={{ marginLeft: '10px', width: '80px' }}
            icon={<FolderOpenOutlined />}
            onClick={handleChooseNewFilePath}>
          </Button>
        </p>
        <p>{newFilePath}</p>
        <Input
          placeholder="请输入文件名，省略文件后缀"
          value={newFileTitle}
          onChange={(e) => { setNewFileTitle(e.target.value) }}
          allowClear>
        </Input>
      </Modal>
    </ConfigProvider>
  );
}

export default App;
