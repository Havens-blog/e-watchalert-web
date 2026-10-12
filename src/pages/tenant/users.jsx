import React, { useEffect, useState } from 'react';
import {Table, Button, Modal, Transfer, Popconfirm, Tooltip, Tag, message} from 'antd';
import {DeleteOutlined, PlusCircleOutlined} from '@ant-design/icons';
import { listUsers } from '../../api/eiam/user';
import { listTenantMembers, assignTenantUser, unassignTenantUser } from '../../api/eiam/tenant';
import {HandleShowTotal} from "../../utils/lib";

export const TenantUsers = ({ tenantInfo }) => {
    const [addUserModel, setAddUserModel] = useState(false);
    const [allUsers, setAllUsers] = useState([]);      // 全部用户（Transfer 源）
    const [targetKeys, setTargetKeys] = useState([]);  // 已选用户 id
    const [memberData, setMemberData] = useState([]);  // 当前租户成员

    // Table columns definition
    const columns = [
        {
            title: '#',
            dataIndex: '#',
            key: '#',
            width: '50px',
            render: (_, __, index) => index + 1
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '昵称',
            dataIndex: 'nickname',
            key: 'nickname',
            render: (text) => text || '-',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            render: (text) => text || '-',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text) => {
                if (text === 1) return <Tag color="blue">启用</Tag>;
                if (text === 2) return <Tag color="red">禁用</Tag>;
                return <Tag>未知</Tag>;
            },
        },
        {
            title: '操作',
            dataIndex: 'operation',
            fixed: 'right',
            width: '80px',
            render: (_, record) =>
                <Popconfirm
                    title={`确定要移除成员 ${record.username} 吗?`}
                    onConfirm={() => handleRemove(record)}
                    okText="确定"
                    cancelText="取消"
                    placement="left"
                >
                    <Button
                        type="text"
                        icon={<DeleteOutlined/>}
                        style={{color: "#ef4444"}}
                    />
                </Popconfirm>
        },
    ];

    const handleRemove = async (record) => {
        try {
            await unassignTenantUser({ user_id: record.id }, tenantInfo?.id)
            getTenantMembers();
            message.success(`已移除成员: ${record.username}`);
        } catch (error) {
            console.error(error)
            message.error(error?.message || '移除失败')
        }
    }

    // 拉取当前租户成员（超管查看指定租户时带 X-Active-Tenant-ID 覆写）
    const getTenantMembers = async () => {
        try {
            const res = await listTenantMembers({ offset: 0, limit: 200 }, tenantInfo?.id);
            setMemberData(res?.members || []);
        } catch (error) {
            console.error(error);
        }
    }

    // 拉取全部用户（用于 Transfer 添加成员）
    const fetchAllUsers = async () => {
        try {
            const res = await listUsers({ offset: 0, limit: 500 });
            const users = res?.users || [];
            setAllUsers(users.map((u) => ({
                key: u.id,
                title: `${u.username}${u.nickname ? ` (${u.nickname})` : ''}`,
                id: u.id,
                username: u.username,
            })));
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        getTenantMembers();
        fetchAllUsers();
    }, [tenantInfo?.id]);

    const onClose = () => {
        setAddUserModel(false);
        setTargetKeys([]);
    };

    const handleOnChange = (keys) => {
        setTargetKeys(keys);
    };

    // 提交添加成员
    const handleAddMembers = async () => {
        try {
            for (const uid of targetKeys) {
                await assignTenantUser({ user_id: uid }, tenantInfo?.id);
            }
            onClose();
            getTenantMembers();
            message.success(`已添加 ${targetKeys.length} 名成员`);
        } catch (error) {
            console.error(error)
            message.error(error?.message || '添加失败')
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="link" onClick={() => { fetchAllUsers(); setAddUserModel(true); }}>
                    <PlusCircleOutlined /> 添加成员
                </Button>
            </div>

            <Modal
                visible={addUserModel}
                onCancel={onClose}
                footer={null}
                title="选择用户"
                width={690}
            >
                <div style={{ marginBottom: 12 }}>
                    <Transfer
                        showSearch
                        dataSource={allUsers}
                        targetKeys={targetKeys}
                        onChange={handleOnChange}
                        render={(item) => item.title}
                        listStyle={{ height: 300, width: 300 }}
                        oneWay
                        titles={['可选用户', '已选用户']}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        onClick={handleAddMembers}
                        style={{ backgroundColor: '#000000' }}
                    >
                        提交
                    </Button>
                </div>
            </Modal>

            <Table
                style={{ overflow: 'hidden' }}
                columns={columns}
                dataSource={memberData}
                rowKey={(record) => record.id}
                scroll={{
                    x: false,
                    y: '45vh'
                }}
                pagination={{
                    showTotal: HandleShowTotal,
                    pageSizeOptions: ['10'],
                }}
            />
        </>
    );
};
