import { Tabs } from 'antd'
import { FileOutlined } from '@ant-design/icons'
import './TabList.scss'

const TabList = ({ activeFileId, files, onChange, onRemove }) => {
    const items = files.map((file, index) => {
        let closable = false
        if (activeFileId && activeFileId === file.id) {
            closable = true
        }
        return {
            key: file.id,
            label: file.title,
            icon: <FileOutlined/>,
            closable
        }
    })
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
                onEdit={(id) => onRemove(id) }
            />
        </div>
    )
}

export default TabList
