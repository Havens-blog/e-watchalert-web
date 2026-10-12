import React, { useState, useEffect } from 'react';
import {Button, Tree, Table, Modal, Form, Input, Transfer, Popconfirm, Tooltip, message, Tag, Space, InputNumber} from 'antd';
import {PlusOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {
    listDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    listDepartmentMembers,
    assignDepartmentUsers,
    removeDepartmentUsers,
} from '../../../api/eiam/department';
import { listUsers } from '../../../api/eiam/user';
import {HandleShowTotal} from "../../../utils/lib";
import { Breadcrumb } from "../../../components/Breadcrumb";

const MyFormItemContext = React.createContext([]);
function toArr(str) {
    return Array.isArray(str) ? str : [str];
}
const MyFormItem = ({ name, ...props }) => {
    const prefixPath = React.useContext(MyFormItemContext);
    const concatName = name !== undefined ? [...prefixPath, ...toArr(name)] : undefined;
    return <Form.Item name={concatName} {...props} />;
};

export const Department = () => {
    const [treeData, setTreeData] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);   // 当前选中部门节点
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // 创建/编辑弹窗
    const [createVisible, setCreateVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // 添加成员弹窗
    const [addMemberVisible, setAddMemberVisible] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [targetKeys, setTargetKeys] = useState([]);

    // 将 eiam 部门树转为 antd Tree 数据
    const toTreeData = (nodes) => {
        if (!Array.isArray(nodes)) return [];
        return nodes.map((n) => ({
            key: n.id,
            title: n.name,
            parent_id: n.parent_id,
            sort: n.sort,
            children: n.children ? toTreeData(n.children) : [],
        }));
    };

    const fetchTree = async () => {
        try {
            const res = await listDepartments();
            setTreeData(toTreeData(res));
        } catch (error) {
            console.error(error);
            message.error(error?.message || '加载部门树失败');
        }
    };

    const fetchMembers = async (deptId) => {
        setLoadingMembers(true);
        try {
            const res = await listDepartmentMembers({ dept_id: deptId, offset: 0, limit: 200 });
            setMembers(res?.members || []);
        } catch (error) {
            console.error(error);
            setMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    // 选中部门节点
    const handleSelect = (keys, info) => {
        const node = info?.node;
        if (node) {
            setSelectedDept({ id: node.key, name: node.title, parent_id: node.parent_id });
            fetchMembers(node.key);
        }
    };

    // 创建部门
    const handleCreate = async (values) => {
        try {
            await createDepartment({
                parent_id: values.parent_id || 0,
                name: values.name,
                sort: values.sort || 0,
            });
            message.success('部门创建成功');
            setCreateVisible(false);
            form.resetFields();
            fetchTree();
        } catch (error) {
            console.error(error);
            message.error(error?.message || '创建失败');
        }
    };

    // 编辑部门
    const handleEdit = async (values) => {
        try {
            await updateDepartment({
                id: selectedDept.id,
                parent_id: selectedDept.parent_id || 0,
                name: values.name,
                sort: values.sort || 0,
            });
            message.success('部门更新成功');
            setEditVisible(false);
            fetchTree();
        } catch (error) {
            console.error(error);
            message.error(error?.message || '更新失败');
        }
    };

    // 删除部门
    const handleDelete = async () => {
        try {
            await deleteDepartment(selectedDept.id);
            message.success('部门删除成功');
            setSelectedDept(null);
            setMembers([]);
            fetchTree();
        } catch (error) {
            console.error(error);
            message.error(error?.message || '删除失败');
        }
    };

    // 拉取全部用户（用于添加成员）
    const fetchAllUsers = async () => {
        try {
            const res = await listUsers({ offset: 0, limit: 500 });
            setAllUsers((res?.users || []).map((u) => ({
                key: u.id,
                title: `${u.username}${u.nickname ? ` (${u.nickname})` : ''}`,
                id: u.id,
            })));
        } catch (error) {
            console.error(error);
        }
    };

    // 添加成员
    const handleAddMembers = async () => {
        try {
            await assignDepartmentUsers({ dept_id: selectedDept.id, user_ids: targetKeys });
            message.success(`已添加 ${targetKeys.length} 名成员`);
            setAddMemberVisible(false);
            setTargetKeys([]);
            fetchMembers(selectedDept.id);
        } catch (error) {
            console.error(error);
            message.error(error?.message || '添加失败');
        }
    };

    // 移除成员
    const handleRemoveMember = async (record) => {
        try {
            await removeDepartmentUsers({ dept_id: selectedDept.id, user_ids: [record.id] });
            message.success(`已移除成员: ${record.username}`);
            fetchMembers(selectedDept.id);
        } catch (error) {
            console.error(error);
            message.error(error?.message || '移除失败');
        }
    };

    const memberColumns = [
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '昵称', dataIndex: 'nickname', key: 'nickname', render: (t) => t || '-' },
        { title: '邮箱', dataIndex: 'email', key: 'email', render: (t) => t || '-' },
        { title: '手机号', dataIndex: 'phone', key: 'phone', render: (t) => t || '-' },
        {
            title: '操作',
            key: 'op',
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title={`确定移除成员 ${record.username} 吗?`}
                    onConfirm={() => handleRemoveMember(record)}
                    okText="确定"
                    cancelText="取消"
                >
                    <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <>
            <Breadcrumb items={['人员组织', '组织/部门管理']} />
            <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                {/* 左侧：部门树 */}
                <div style={{
                    width: 280,
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 8,
                    padding: 12,
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <strong>组织架构</strong>
                        <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>新建</Button>
                    </div>
                    <Tree
                        treeData={treeData}
                        onSelect={handleSelect}
                        defaultExpandAll
                        blockNode
                    />
                </div>

                {/* 右侧：选中部门详情 + 成员 */}
                <div style={{ flex: 1, backgroundColor: 'var(--bg-elevated)', borderRadius: 8, padding: 16, minHeight: 400 }}>
                    {selectedDept ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Space>
                                    <strong style={{ fontSize: 16 }}>{selectedDept.name}</strong>
                                    <Tag color="blue">ID: {selectedDept.id}</Tag>
                                </Space>
                                <Space>
                                    <Button size="small" icon={<EditOutlined />} onClick={() => {
                                        editForm.setFieldsValue({ name: selectedDept.name, sort: undefined });
                                        setEditVisible(true);
                                    }}>编辑</Button>
                                    <Button size="small" danger icon={<DeleteOutlined />} onClick={handleDelete}>删除</Button>
                                    <Button size="small" type="primary" icon={<PlusCircleOutlined />} onClick={() => {
                                        fetchAllUsers();
                                        setAddMemberVisible(true);
                                    }}>添加成员</Button>
                                </Space>
                            </div>
                            <Table
                                columns={memberColumns}
                                dataSource={members}
                                rowKey={(r) => r.id}
                                loading={loadingMembers}
                                pagination={{ showTotal: HandleShowTotal, pageSizeOptions: ['10'] }}
                            />
                        </>
                    ) : (
                        <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', paddingTop: 80 }}>
                            请选择左侧部门查看成员
                        </div>
                    )}
                </div>
            </div>

            {/* 创建部门弹窗 */}
            <Modal visible={createVisible} onCancel={() => setCreateVisible(false)} footer={null} title="新建部门">
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <MyFormItem name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
                        <Input maxLength={64} />
                    </MyFormItem>
                    <MyFormItem name="parent_id" label="上级部门 ID（0 为顶级）">
                        <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                    </MyFormItem>
                    <MyFormItem name="sort" label="排序">
                        <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                    </MyFormItem>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: '#000000' }}>提交</Button>
                    </div>
                </Form>
            </Modal>

            {/* 编辑部门弹窗 */}
            <Modal visible={editVisible} onCancel={() => setEditVisible(false)} footer={null} title="编辑部门">
                <Form form={editForm} layout="vertical" onFinish={handleEdit}>
                    <MyFormItem name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
                        <Input maxLength={64} />
                    </MyFormItem>
                    <MyFormItem name="sort" label="排序">
                        <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                    </MyFormItem>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: '#000000' }}>提交</Button>
                    </div>
                </Form>
            </Modal>

            {/* 添加成员弹窗 */}
            <Modal visible={addMemberVisible} onCancel={() => setAddMemberVisible(false)} footer={null} title="添加成员" width={690}>
                <div style={{ marginBottom: 12 }}>
                    <Transfer
                        showSearch
                        dataSource={allUsers}
                        targetKeys={targetKeys}
                        onChange={setTargetKeys}
                        render={(item) => item.title}
                        listStyle={{ height: 300, width: 300 }}
                        oneWay
                        titles={['可选用户', '已选用户']}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" onClick={handleAddMembers} style={{ backgroundColor: '#000000' }}>提交</Button>
                </div>
            </Modal>
        </>
    );
};
