import { useKeyPress } from 'ahooks'
import { useState, useRef, useEffect } from 'react'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import './FileSearch.scss'

const FileSearch = ({ title = '编辑器', onFileSearch }) => {
    const [inputActive, setInputActive] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const node = useRef(null)

    const closeSearch = () => {
        setInputActive(false)
        setSearchValue('')
        onFileSearch('')
    }
    const keyCallbackMap = {
        'enter': () => {
            if (inputActive) onFileSearch(searchValue)
        },
        'esc': () => {
            if (inputActive) closeSearch()
        }
    }
    useKeyPress(['enter', 'esc'], (e, key) => {
        keyCallbackMap[key]();
    })
    useEffect(() => {
        if (inputActive) {
            node.current.focus()
        }
    }, [inputActive])
    return (
        <div className='file-search'>
            {
                !inputActive ? 
                (
                    <>
                        <span className='title'>{title}</span>
                        <div className='icon search-icon'>
                            <SearchOutlined onClick={() => { setInputActive(true) }}/>
                        </div>
                    </>
                ) : (
                    <>
                        <Input
                            ref={ node }
                            placeholder="按enter进行文件搜索"
                            value={ searchValue }
                            onChange={(e) => { setSearchValue(e.target.value) }}
                            allowClear>
                        </Input>
                        <div className='icon close-icon'>
                            <CloseOutlined onClick={() => { closeSearch() }}/>
                        </div>
                    </>
                )
            }
        </div>
    )
}

export default FileSearch
