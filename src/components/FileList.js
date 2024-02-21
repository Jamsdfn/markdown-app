import { useKeyPress } from 'ahooks'
import { useEffect, useRef, useState } from 'react'
import { EditOutlined, DeleteOutlined, FileOutlined, CloseOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import './FileList.scss'

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete, activeFileId }) => {
    const [editFileId, setEditFileId] = useState(0)
    const [editFileTitle, setEditFileTitle] = useState('')
    const node = useRef(null)
    const closeEdit = () => {
        setEditFileId(0)
        setEditFileTitle('')
    }
    const editFile = (e, id) => {
        e.stopPropagation()
        setEditFileId(id)
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
                                        <DeleteOutlined onClick={ (e) => { e.stopPropagation();onFileDelete(file.id) } }></DeleteOutlined>
                                    </div>
                                ) : (
                                    <div className='edit'>
                                        <Input
                                            className='file-list-item-container'
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