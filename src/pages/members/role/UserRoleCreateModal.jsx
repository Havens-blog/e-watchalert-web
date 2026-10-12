/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Form, Input, Button, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { createRole, updateRole } from '../../../api/eiam/role'
const MyFormItemContext = React.createContext([])

function toArr(str) {
    return Array.isArray(str) ? str : [str]
}

// 表单
const MyFormItem = ({ name, ...props }) => {
    const prefixPath = React.useContext(MyFormItemContext)
    const concatName = name !== undefined ? [...prefixPath, ...toArr(name)] : undefined
    return <Form.Item name={concatName} {...props} />
}

// 函数组件
const UserRoleCreateModal = ({ visible, onClose, selectedRow, type, handleList }) => {
    const [form] = Form.useForm()

    // 禁止输入空格
    const [spaceValue, setSpaceValue] = useState('')

    const handleInputChange = (e) => {
        const newValue = e.target.value.replace(/\s/g, '')
        setSpaceValue(newValue)
        form.setFieldsValue({ code: newValue })
    }

    const handleKeyPress = (e) => {
        if (e.key === ' ') {
            e.preventDefault()
        }
    }

    useEffect(() => {
        if (visible) {
            if (selectedRow) {
                setSpaceValue(selectedRow.code || '')
                form.setFieldsValue({
                    name: selectedRow.name,
                    code: selectedRow.code,
                    desc: selectedRow.desc,
                })
            } else {
                form.resetFields()
                setSpaceValue('')
            }
        }
    }, [visible, selectedRow, form])


    // 提交
    const handleFormSubmit = async (values) => {
        if (type === 'create') {
            try {
                await createRole({ name: values.name, code: values.code, desc: values.desc })
                message.success('角色创建成功')
                handleList()
            } catch (error) {
                console.error(error)
                message.error(error?.message || '创建失败')
            }
        }

        if (type === 'update') {
            try {
                await updateRole({ id: selectedRow.id, name: values.name, code: values.code, desc: values.desc })
                message.success('角色更新成功')
                handleList()
            } catch (error) {
                console.error(error)
                message.error(error?.message || '更新失败')
            }
        }

        // 关闭弹窗
        onClose()
    }

    return (
        <Modal visible={visible} onCancel={onClose} footer={null} width={560}>
            <Form form={form} name="form_item_path" layout="vertical" onFinish={handleFormSubmit}>

                <MyFormItem name="name" label="角色名称"
                    rules={[
                        {
                            required: true,
                            message: '请输入角色名称！',
                        },
                    ]}>
                    <Input maxLength={64} />
                </MyFormItem>

                <MyFormItem name="code" label="角色编码"
                    rules={[
                        {
                            required: true,
                            message: '请输入角色编码！',
                        },
                    ]}>
                    <Input
                        value={spaceValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        maxLength={32}
                        placeholder="唯一编码，如 admin / viewer"
                        disabled={type === 'update'} />
                </MyFormItem>

                <MyFormItem name="desc" label="描述">
                    <Input.TextArea rows={3} />
                </MyFormItem>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            backgroundColor: '#000000'
                        }}
                    >
                        提交
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}

export default UserRoleCreateModal
