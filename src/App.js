import { useEffect, useState } from 'react';
import './App.scss';
import "easymde/dist/easymde.min.css";
import { Button, Spin, ConfigProvider } from 'antd'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import TabList from './components/TabList'
import SimpleMDE from 'react-simplemde-editor'
import defaultFiles from './utils/defaultFiles';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons'

function App() {
  const [isLoading, setLoading] = useState(false)
  const [activeFileId, setActiveFileId] = useState('')
  const [activeFile, setActiveFile] = useState(null)
  useEffect(() => {
    if (activeFileId) {
      setActiveFile(defaultFiles.find(item => item.id === activeFileId))
    }
  }, [activeFileId])
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
          <FileSearch title="我的编辑器" onFileSearch={ (value) => { console.log(value) } }></FileSearch>
          <FileList
            files={ defaultFiles }
            activeFileId={ activeFileId }
            onFileClick={ (id) => setActiveFileId(id) }
            onFileDelete={ (id) => console.log(id) }
            onSaveEdit={ (id, newTitle) => console.log(id, newTitle) }>
          </FileList>
          <Button className='editor-button' icon={<PlusOutlined/>} type='primary' block>新建</Button>
          <Button className='editor-button' icon={<DownloadOutlined />} block>导入</Button>
        </div>
        <div className="right-container">
          <TabList
            activeFileId={ activeFileId }
            files={ defaultFiles }
            onChange={(id) => setActiveFileId(id)}
            onRemove={(id) => console.log(id)}
          />
          {activeFile && <SimpleMDE
            key={activeFile && activeFile.id}
            value={activeFileId && activeFile.body}
            onChange={(value) => { console.log(value) }}
            options={{
              minHeight: 'calc(100vh - 110px)',
              maxHeight: 'calc(100vh - 110px)',
              toolbar: false,
              toolbarTips: false,
              previewImagesInEditor: true
            }}
          />}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
