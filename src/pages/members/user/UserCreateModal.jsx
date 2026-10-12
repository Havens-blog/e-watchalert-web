"use client"
import { Modal, Form, Input, Button, Select, message, Switch } from "antd"
import React, { useState, useEffect } from "react"
import { createUser, updateUser } from "../../../api/eiam/user"
import { syncLocalUsers } from "../../../api/user"

const MyFormItemContext = React.createContext([])
function toArr(str) {
    return Array.isArray(str) ? str : [str]
}

// 表单自定义 Form.Item 包装器
const MyFormItem = ({ name, ...props }) => {
    const prefixPath = React.useContext(MyFormItemContext)
    const concatName = name !== undefined ? [...prefixPath, ...toArr(name)] : undefined
    return <Form.Item name={concatName} {...props} />
}

// 函数组件
const UserCreateModal = ({ visible, onClose, selectedRow, type, handleList }) => {
    const [form] = Form.useForm()
    const [spaceValue, setSpaceValue] = useState("") // 用户名输入框的值，用于处理空格
    // 「接受值班」是 WatchAlert 应用侧扩展属性（eiam 无此概念），
    // 存于本地 members 扩展表，按 eiam uid 关联，故不随 eiam 用户接口提交。
    const [joinDuty, setJoinDuty] = useState(false)

    useEffect(() => {
        if (visible) {
            if (selectedRow && type === "update") {
                setSpaceValue(selectedRow.username)
                setJoinDuty(selectedRow.joinDuty === "true")
                form.setFieldsValue({
                    username: selectedRow.username,
                    nickname: selectedRow.nickname,
                    email: selectedRow.email,
                    phone: selectedRow.phone,
                    status: selectedRow.status === 'disable' ? 'disable' : 'active',
                })
            } else {
                form.resetFields()
                setSpaceValue("")
                setJoinDuty(false)
                form.setFieldsValue({
                    status: 'active',
                })
            }
        }
    }, [visible, selectedRow, type, form])

    // 用户名输入框处理，禁止输入空格
    const handleInputChange = (e) => {
        const newValue = e.target.value.replace(/\s/g, "")
        setSpaceValue(newValue)
        form.setFieldsValue({ username: newValue }) // 同步更新form的值
    }
    const handleKeyPress = (e) => {
        if (e.key === " ") {
            e.preventDefault()
        }
    }

    // 创建用户
    const handleCreate = async (values) => {
        try {
            // eiam 返回新用户主体 id（eiam uid）
            const newId = await createUser({
                username: values.username,
                email: values.email,
                nickname: values.nickname,
                phone: values.phone,
                status: values.status || 'active',
                password: values.password,
                confirm_password: values.confirm_password,
            })
            // 同步本地扩展记录（承载 join_duty）；失败不影响主体创建结果
            try {
                await syncLocalUsers([{
                    userid: String(newId),
                    username: values.username,
                    joinDuty: joinDuty ? "true" : "false",
                }])
            } catch (syncErr) {
                console.error('同步本地值班扩展失败:', syncErr)
            }
            message.success('用户创建成功')
            handleList()
        } catch (error) {
            console.error(error)
            message.error(error?.message || '创建失败')
        }
    }

    // 更新用户
    const handleUpdate = async (values) => {
        try {
            await updateUser({
                id: selectedRow.id,
                username: values.username,
                email: values.email,
                nickname: values.nickname,
                phone: values.phone,
                status: values.status || 'active',
            })
            // 「接受值班」存本地扩展表（按 eiam uid 关联）
            try {
                await syncLocalUsers([{
                    userid: String(selectedRow.id),
                    username: values.username,
                    joinDuty: joinDuty ? "true" : "false",
                }])
            } catch (syncErr) {
                console.error('同步本地值班扩展失败:', syncErr)
            }
            message.success('用户更新成功')
            handleList()
        } catch (error) {
            console.error(error)
            message.error(error?.message || '更新失败')
        }
    }

    // 提交表单
    const handleFormSubmit = async (values) => {
        if (type === "create") {
            await handleCreate(values)
        }
        if (type === "update") {
            await handleUpdate(values)
        }
        onClose()
    }

    return (
        <Modal visible={visible} onCancel={onClose} footer={null}>
            <Form
                form={form}
                name="user_form"
                layout="horizontal"
                onFinish={handleFormSubmit}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 20 }}
                style={{ padding: "40px 24px" }}
            >
                <MyFormItem
                    name="username"
                    label="用户名"
                    style={{ flex: 1 }}
                    rules={[{ required: true, message: "请输入用户名！" }]}
                >
                    <Input
                        value={spaceValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={type === "update"}
                    />
                </MyFormItem>

                <MyFormItem
                    name="nickname"
                    label="昵称"
                    style={{ flex: 1 }}
                >
                    <Input />
                </MyFormItem>

                {type === "create" && (
                    <>
                        <Form.Item
                            name="password"
                            label="密码"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "请输入密码！" }, {
                                min: 6,
                                message: "密码至少需要6位字符！"
                            }]}
                            hasFeedback
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            name="confirm_password"
                            label="确认密码"
                            dependencies={['password']}
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "请再次输入密码！" }, ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致！'))
                                },
                            })]}
                            hasFeedback
                        >
                            <Input.Password />
                        </Form.Item>
                    </>
                )}

                <MyFormItem
                    name="email"
                    label="邮箱"
                    rules={[
                        { required: true, message: "请输入邮箱！", type: "email" },
                    ]}
                >
                    <Input />
                </MyFormItem>

                <MyFormItem name="phone" label="手机号">
                    <Input />
                </MyFormItem>

                <MyFormItem name="status" label="状态">
                    <Select
                        options={[
                            { label: '启用', value: 'active' },
                            { label: '禁用', value: 'disable' },
                        ]}
                    />
                </MyFormItem>

                <Form.Item label="接受值班" labelCol={{ span: 5 }} wrapperCol={{ span: 20 }}>
                    <Switch checked={joinDuty} onChange={setJoinDuty} />
                    <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 12 }}>
                        开启后该用户可被排入值班表
                    </span>
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: "#000000" }}>
                            提交
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UserCreateModal
