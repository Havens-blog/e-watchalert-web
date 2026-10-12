"use client"

import { useState, useEffect, useRef } from "react"
import {Layout, theme, Button, Typography, Spin, Result} from "antd"
import { LeftOutlined, LoadingOutlined, HomeOutlined } from "@ant-design/icons"
import "./index.css"
import { ComponentSider } from "./sider"
import Auth from "../utils/Auth"
import {getTenantList} from "../api/tenant";
import {getUserInfo} from "../api/user";
import {buildConsoleLoginUrl} from "../config/auth";
import {DegradedBanner} from "./degradation/DegradedBanner";
import {ForbiddenPlaceholder} from "./degradation/ForbiddenPlaceholder";
import {useAuthHealth} from "../hooks/useAuthHealth";

const Components = (props) => {
    const { name, c } = props
    const { Content } = Layout
    const [loading, setLoading] = useState(true)
    const [authorization, setAuthorization] = useState(null)
    const [tenantId, setTenantId] = useState(null)
    const [error, setError] = useState(false)
    const [forbidden, setForbidden] = useState(false)
    const { writeDisabled } = useAuthHealth()
    const [isRendered, setIsRendered] = useState(false)
    const contentRef = useRef(null)
    const [serviceErrorMsg, setServiceErrorMsg] = useState("服务暂时不可用，请稍后重试或联系管理员") // 新增：服务异常详细信息

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    // 检查认证和租户信息
    useEffect(() => {
        let isMounted = true

        const checkAuthAndTenant = async () => {
            try {
                // 会话化（§3.5 / §4.2）：不再依赖 localStorage Authorization。
                // 通过受 Auth 中间件保护的 getUserInfo 确认共享会话 + 身份；
                // 未认证/无角色由 http 拦截器兜底（401 → 跳登录 / 403 → 原地提示）。
                try {
                    const userRes = await getUserInfo()
                    const userid = userRes?.data?.userid
                    if (userid) {
                        await fetchTenantList(userid)
                    }
                } catch (err) {
                    console.error("Failed to fetch user info:", err)
                    if (isMounted) {
                        // 403 = 已认证但无角色绑定 → 原地 403 占位（BIZ-auth-003，不跳登录）
                        if (err?.response?.status === 403) {
                            setForbidden(true)
                        } else {
                            setError(true)
                        }
                        setLoading(false)
                    }
                    return
                }

                // 再次检查租户信息
                const updatedTenant = localStorage.getItem("TenantID")
                if (isMounted) {
                    setAuthorization(true)
                    setTenantId(updatedTenant)
                    setLoading(false)
                    setError(!updatedTenant)
                }
            } catch (error) {
                console.error("Error accessing localStorage:", error)
                if (isMounted) {
                    setError(true)
                    setLoading(false)
                }
            }
        }

        // 延迟检查逻辑
        const delayCheck = setTimeout(() => {
            checkAuthAndTenant()
        }, 500) // 延迟 500 毫秒

        return () => {
            isMounted = false
            clearTimeout(delayCheck)
        }
    }, [])

    // 监听渲染完成
    useEffect(() => {
        if (loading || error || !authorization || !tenantId) return

        const observer = new MutationObserver(() => {
            const timer = setTimeout(() => {
                setIsRendered(true)
                observer.disconnect()
            }, 300)

            return () => clearTimeout(timer)
        })

        if (contentRef.current) {
            observer.observe(contentRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            })
        }

        const maxWaitTimer = setTimeout(() => {
            setIsRendered(true)
            observer.disconnect()
        }, 1500)

        return () => {
            observer.disconnect()
            clearTimeout(maxWaitTimer)
        }
    }, [loading, error, authorization, tenantId])

    const goBackPage = () => {
        window.history.back()
    }

    const fetchTenantList = async (userid) => {
        try {
            const res = await getTenantList({ userId: userid })

            if (!res?.data || !Array.isArray(res?.data) || res?.data?.length === 0) {
                console.error("No tenant data available")
                setError(true)
                return
            }

            const tenantOptions = res?.data?.map((tenant, index) => ({
                label: tenant.name,
                value: tenant.id,
                index: index,
            }))

            // 设置第一个租户为默认
            const firstTenant = tenantOptions[0]
            localStorage.setItem("TenantName", firstTenant.label)
            localStorage.setItem("TenantID", firstTenant.value)
            localStorage.setItem("TenantIndex", firstTenant.index)

            return tenantOptions
        } catch (error) {
            console.error("Failed to fetch tenant list:", error)
            setError(true)
            throw error
        }
    }

    // 全屏加载组件
    const FullScreenLoading = () => (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #08090a 0%, #0f1011 100%)',
                zIndex: 9999,
                transition: 'opacity 0.3s ease-out'
            }}
        >
            <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 40, color: '#7170ff' }} spin />} 
                size="large" 
            />
            <Typography.Text style={{ marginTop: 16, color: '#CCCCCC' }}>
                {loading ? "正在验证用户信息..." : "页面准备中..."}
            </Typography.Text>
        </div>
    )

    // 错误组件
    const ErrorScreen = () => (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #08090a 0%, #0f1011 100%)",
            }}
        >
            <Result
                status="error"
                title={<span style={{ color: "#FFFFFF" }}>{!authorization ? "用户无效" : "租户无效"}</span>}
                subTitle={<span style={{ color: "#CCCCCC" }}>{!authorization ? "请先登录系统" : "未获取到有效的租户"}</span>}
                extra={[
                    <Button
                        type="primary"
                        key="login"
                        onClick={() => {
                            const currentPath = window.location.pathname + window.location.search
                            // 会话化：不清 localStorage（尤其不清 hc_theme 主题偏好）；
                            // 跳 haven-console 登录页并携带白名单清洗后的回跳地址。
                            const loginUrl = buildConsoleLoginUrl(currentPath)
                            window.location.href = loginUrl || "/login"
                        }}
                        style={{
                            background: "linear-gradient(135deg, #7170ff 0%, #5e6ad2 100%)",
                            borderColor: "#7170ff",
                            color: "#fff",
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(94, 106, 210, 0.3)",
                            border: "none"
                        }}
                    >
                        返回登录
                    </Button>,
                ]}
            />
        </div>
    )

    const SystemErrorScreen = () => {
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #08090a 0%, #0f1011 100%)",
                }}
            >
                <Result
                    status="error"
                    title={<span style={{ color: "#FFFFFF" }}>服务异常</span>}
                    subTitle={<span style={{ color: "#CCCCCC" }}>{serviceErrorMsg}</span>}
                    extra={[
                        <Button
                            type="primary"
                            key="retry"
                            onClick={() => {
                                setServiceErrorMsg("服务暂时不可用，请稍后重试或联系管理员")
                                setError(true)
                                // 直接刷新页面
                                window.location.reload()
                            }}
                            style={{
                                background: "linear-gradient(135deg, #7170ff 0%, #5e6ad2 100%)",
                                borderColor: "#7170ff",
                                color: "#fff",
                                fontWeight: "600",
                                boxShadow: "0 4px 12px rgba(94, 106, 210, 0.3)",
                                border: "none"
                            }}
                        >
                            重试
                        </Button>
                    ]}
                />
            </div>
        )
    }

    // 状态检查优先级：加载中 > 错误/认证失败 > 渲染内容
    if (loading) {
        return <FullScreenLoading />
    }

    if (forbidden) {
        return <ForbiddenPlaceholder />
    }

    if (!authorization || !tenantId) {
        return <ErrorScreen />
    }

    if (error) {
        return <SystemErrorScreen />
    }

    // 主内容区域
    return (
        <>
            {/* 只有当内容完全渲染后才隐藏加载界面 */}
            {!isRendered && <FullScreenLoading />}

            <Layout
                style={{
                    height: "100vh",
                    overflow: "hidden",
                    background: "var(--bg-page)",
                    opacity: isRendered ? 1 : 0, // 添加淡入效果
                    transition: 'opacity 0.3s ease-in'
                }}
                ref={contentRef}
            >
                {/* 宽限横幅插槽（组件 2）：write_disabled 时顶部常驻 */}
                <DegradedBanner visible={writeDisabled} />

                <Layout style={{ background: "transparent", marginTop: "16px" }}>
                    {/* 侧边栏 */}
                    <div
                        style={{
                            width: "210px",
                            borderRadius: borderRadiusLG,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                            height: "100%",
                            background: "var(--bg-elevated)",
                        }}
                    >
                        <div style={{ height: "100%", overflow: "auto" }}>
                            <ComponentSider />
                        </div>
                    </div>

                    {/* 内容区域 */}
                    <Layout style={{ background: "transparent" }}>
                        <div style={{ marginRight: "16px"}}>
                            <Content
                                style={{
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                    padding: "0",
                                    height: "calc(100vh - 40px)",
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                                }}
                            >
                                {/* 主内容 */}
                                <div
                                    style={{
                                        padding: name !== "off" ? "20px" : "0",
                                        height: name !== "off" ? "calc(100%)" : "100%",
                                        overflow: "auto",
                                    }}
                                >
                                    {c}
                                </div>
                            </Content>
                        </div>

                        {/* 页脚 */}
                        <div
                            style={{
                                textAlign: "center",
                                color: "#999999",
                                fontSize: "12px",
                                padding: "2px",
                                background: "rgba(0, 0, 0, 0.8)",
                                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                            }}
                        >
                            <span style={{ color: "#5e6ad2" }}>WatchAlert</span> 提供轻量级一站式监控报警服务!
                        </div>
                    </Layout>
                </Layout>
            </Layout>
        </>
    )
}

export const ComponentsContent = Auth(Components)