import { Tabs, Modal } from 'antd'
import { useSelector } from 'react-redux'
import { FileOutlined, EditFilled, ExclamationCircleFilled } from '@ant-design/icons'
import './TabList.scss'

const TabList = ({ activeFileId, files, onChange, onRemove }) => {

    const unSaveFileIds = useSelector((state) => state.unSaveFile.unSaveFileIds)

    const items = files.map(file => {
        let closable = false

        if (activeFileId && activeFileId === file.id) {
            closable = true
        }
        return {
            key: file.id,
            label: file.title,
            icon: unSaveFileIds.includes(file.id) ? <EditFilled /> : <FileOutlined/>,
            closable
        }
    })
    const closeEditPage = (id) => {
        if (!unSaveFileIds.includes(id)) {
            onRemove(id)
            return
        }
        Modal.confirm({
            title: '文件未保存',
            icon: <ExclamationCircleFilled />,
            content: '是否不报错，直接关闭编辑',
            okText: '是的',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                onRemove(id)
            }
        })
    }
    return (
        <div className='editor-tab-list'>
            <Tabs
                activeKey={activeFileId}
                hideAdd
                animated={false}
                tabPosition="top"
                type="editable-card"
                tabBarGutter="0"
                items={ items }
                onChange={(id) => onChange(id)}
                onEdit={(id) => closeEditPage(id) }
            />
        </div>
    )
}

export default TabList
