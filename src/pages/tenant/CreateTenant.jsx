import { Modal, Form, Input, Button, Divider } from 'antd'
import React, { useEffect } from 'react'
import { createTenant, updateTenant } from '../../api/eiam/tenant'

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

export const CreateTenant = ({ visible, onClose, selectedRow, type, handleList }) => {
    const [form] = Form.useForm()

    useEffect(() => {
        if (selectedRow) {
            form.setFieldsValue({
                name: selectedRow.name,
                code: selectedRow.code,
            })
        }
    }, [selectedRow, form])

    // 创建
    const handleCreate = async (data) => {
        try {
            await createTenant(data)
            handleList()
        } catch (error) {
            console.error(error)
        }
    }

    // 更新
    const handleUpdate = async (data) => {
        try {
            await updateTenant(data)
            handleList()
        } catch (error) {
            console.error(error)
        }
    }

    // 提交
    const handleFormSubmit = async (values) => {
        if (type === 'create') {
            await handleCreate({ name: values.name, code: values.code })
        }

        if (type === 'update') {
            await handleUpdate({ id: selectedRow.id, name: values.name, code: values.code })
        }

        // 关闭弹窗
        onClose()
    }

    return (
        <>
            <Modal visible={visible} onCancel={onClose} footer={null}>
                <Form form={form} name="form_item_path" layout="vertical" onFinish={handleFormSubmit}>
                    <strong style={{ fontSize: '15px' }}>基础信息</strong>
                    <MyFormItem
                            name="name"
                            label="租户名称"
                            style={{
                                marginRight: '10px',
                                width: '472px',
                            }}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input maxLength={64} />
                        </MyFormItem>

                    <MyFormItem
                        name="code"
                        label="租户编码"
                        style={{
                            width: '472px',
                        }}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input maxLength={32} placeholder="唯一编码，如 default / ops" />
                    </MyFormItem>

                    <Divider />

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
        </>
    )
}
