import {Input, Table, Button, Modal, Tooltip, Dropdown} from 'antd';
import React, { useState, useEffect } from 'react';
import UserRoleCreateModal from './UserRoleCreateModal';
import { listRoles, deleteRole } from '../../../api/eiam/role';
import {CopyOutlined, DeleteOutlined, EditOutlined, PlusOutlined, MoreOutlined} from "@ant-design/icons";
import {HandleShowTotal} from "../../../utils/lib";
import {copyToClipboard} from "../../../utils/copyToClipboard";
import { Breadcrumb } from "../../../components/Breadcrumb";


const { Search } = Input;

export const UserRole = () => {
    const [selectedRow, setSelectedRow] = useState(null);
    const [updateVisible, setUpdateVisible] = useState(false);
    const [visible, setVisible] = useState(false);
    const [list, setList] = useState([]);

    // 表头
    const columns = [
        {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
            width: 'auto',
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {text}
                    <Tooltip title="点击复制编码">
                        <span
                            style={{
                                color: '#8c8c8c',
                                fontSize: '12px',
                                cursor: 'pointer',
                                userSelect: 'none',
                                display: 'inline-block',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                            onClick={() => copyToClipboard(record.code)}
                        >
                            {record.code}
                            <CopyOutlined style={{ marginLeft: 8 }} />
                        </span>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: '描述',
            dataIndex: 'desc',
            key: 'desc',
            width: 'auto',
            render: (text) => (!text ? '-' : text),
        },
        {
            title: "创建时间",
            dataIndex: "ctime",
            key: "ctime",
            width: "auto",
            render: (text) => {
                if (!text) return '-';
                const date = new Date(text) // eiam 时间戳为毫秒
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{date.toLocaleString()}</span>
                    </div>
                )
            },
        },
        {
            title: '操作',
            dataIndex: 'operation',
            fixed: 'right',
            width: 60,
            render: (_, record) =>
                list.length >= 1 ? (
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'edit',
                                    icon: <EditOutlined />,
                                    label: '更新',
                                    onClick: () => handleUpdateModalOpen(record)
                                },
                                {
                                    key: 'delete',
                                    icon: <DeleteOutlined />,
                                    label: '删除',
                                    danger: true,
                                    disabled: record.code === 'admin',
                                    onClick: () => {
                                        Modal.confirm({
                                            title: "确定要删除此角色吗?",
                                            content: `角色名称: ${record.name}`,
                                            okText: "确定",
                                            cancelText: "取消",
                                            okType: 'danger',
                                            onOk: () => handleDelete(record)
                                        })
                                    }
                                }
                            ]
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            style={{ color: "#666" }}
                        />
                    </Dropdown>
                ) : null,
        },
    ];

    const [height, setHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {
            setHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleList = async (keyword) => {
        try {
            const res = await listRoles({ offset: 0, limit: 200, keyword: keyword || '' });
            setList(res?.roles || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteRole(record.id);
            handleList();
        } catch (error) {
            console.error(error);
        }
    };

    const handleModalClose = () => {
        setVisible(false);
    };

    const handleUpdateModalClose = () => {
        setUpdateVisible(false);
    };

    const handleUpdateModalOpen = (record) => {
        setSelectedRow(record);
        setUpdateVisible(true);
    };

    const onSearch = (value) => {
        handleList(value);
    };

    useEffect(() => {
        handleList();
    }, []);

    return (
        <>
            <Breadcrumb items={['人员组织', '角色管理']} />
        
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Search
                    allowClear
                    placeholder="输入搜索关键字"
                    onSearch={onSearch}
                    onChange={(e) => { if (!e.target.value) handleList(); }}
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    onClick={() => setVisible(true)}
                    style={{
                        backgroundColor: '#000000'
                    }}
                    icon={<PlusOutlined />}
                >
                    创建
                </Button>
            </div>

            <UserRoleCreateModal visible={visible} onClose={handleModalClose} type="create" handleList={handleList} />

            <UserRoleCreateModal
                visible={updateVisible}
                onClose={handleUpdateModalClose}
                selectedRow={selectedRow}
                type="update"
                handleList={handleList}
            />

            <div style={{ overflowX: 'auto', marginTop: 10, height: '65vh' }}>
                <Table
                    columns={columns}
                    dataSource={list}
                    scroll={{
                        y: height - 250,
                        x: 'max-content',
                    }}
                    style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}
                    pagination={{
                        showTotal: HandleShowTotal,
                        pageSizeOptions: ['10'],
                    }}
                    rowKey={(record) => record.id}
                />
            </div>
        </>
    );
};
