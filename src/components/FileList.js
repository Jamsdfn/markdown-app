import { useKeyPress } from 'ahooks'
import { useEffect, useRef, useState } from 'react'
import { EditOutlined, DeleteOutlined, FileOutlined, CloseOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import useContextMenu from '../hooks/useContextMenu'
import './FileList.scss'

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete, onFileClose, activeFileId }) => {
    const [editFileId, setEditFileId] = useState(0)
    const [editFileTitle, setEditFileTitle] = useState('')
    const node = useRef(null)
    const clickedItem = useContextMenu([
        {
          label: '打开',
          click: () => {
            const chooseItem = files.find(file => file.title === clickedItem.current.innerText)
            if (chooseItem) onFileClick(chooseItem.id)
          }
        },
        {
          label: '重命名',
          click: () => {
            const chooseItem = files.find(file => file.title === clickedItem.current.innerText)
            if (chooseItem) {
                setEditFileId(chooseItem.id);
                setEditFileTitle(chooseItem.title);
            }
          }
        },
        {
          label: '删除',
          click: () => {
            const chooseItem = files.find(file => file.title === clickedItem.current.innerText)
            if (chooseItem) {
              onFileDelete(chooseItem.id)
            }
          }
        },
        {
          label: '关闭',
          click: () => {
            const chooseItem = files.find(file => file.title === clickedItem.current.innerText)
            if (chooseItem) {
              onFileClose(chooseItem.id)
            }
          }
        }
      ], '.file-list', [files])
    const closeEdit = () => {
        setEditFileId(0)
        setEditFileTitle('')
    }
    const editFile = (e, id) => {
        e.stopPropagation()
        const editItem = files.find(file => file.id === id)
        setEditFileId(id)
        setEditFileTitle(editItem.title)
    }
    const keyCallbackMap = {
        'enter': () => {
            const editItem = files.find(file => file.id === editFileId)
            if (editItem?.id) {
                onSaveEdit(editItem?.id, editFileTitle)
                setEditFileId(0)
            }
        },
        'esc': () => {
            if (editFileId) closeEdit()
        }
    }
    useKeyPress(['enter', 'esc'], (e, key) => {
        keyCallbackMap[key]();
    })
    useEffect(() => {
        if (editFileId) {
            node.current?.focus()
        }
    }, [editFileId])
    return (
        <ul className='file-list'>
            {
                files.map(file => {
                    return (
                        <li className='file-list-item' key={file.id} onClick={() => { onFileClick(file.id) }}>
                            { file.id !== editFileId ? 
                                (
                                    <div className={ `${activeFileId === file.id ? 'active' : ''}` }>
                                        <FileOutlined></FileOutlined>
                                        <span className='file-list-item-container'>{ file.title }</span>
                                        <EditOutlined onClick={ (e) => { editFile(e, file.id) } }></EditOutlined>
                                        <CloseOutlined onClick={ (e) => { e.stopPropagation();onFileClose(file.id) } }></CloseOutlined>
                                    </div>
                                ) : (
                                    <div className='edit'>
                                        <Input
                                            className='file-list-item-container edit'
                                            ref={ node }
                                            placeholder="请输入"
                                            value={ editFileTitle }
                                            onChange={(e) => { setEditFileTitle(e.target.value) }}
                                            allowClear>
                                        </Input>
                                        <div className='icon close-icon'>
                                            <CloseOutlined onClick={(e) => { e.stopPropagation();closeEdit() }}/>
                                        </div>
                                    </div>
                                )
                            }
                        </li>
                    )
                })
            }
        </ul>
    )
}

export default FileList