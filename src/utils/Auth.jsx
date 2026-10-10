"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

/**
 * 鉴权 HOC（会话化改造，tech-design §3.5 / §4.2）。
 * 移除本地 localStorage Authorization 校验与 getCookieConvertToken（端点已删除）。
 * 鉴权强制由后端 Auth 中间件 + http 拦截器（401 → 跳登录）承接；本 HOC 仅做薄透传。
 */
const Auth = (WrappedComponent) => {
  return function WithAuthComponent(props) {
    const navigate = useNavigate()

    // 无本地 token 概念；页面挂载时不主动跳转。
    // 未登录/无角色由全局 http 拦截器（401 → 跳登录 / 403 → 原地提示）兜底。
    useEffect(() => {
      // 保留：防止 SSG/SSR 阶段访问 window 的防御（本仓为 CRA，纯客户端）。
      void navigate
    }, [navigate])

    return <WrappedComponent {...props} />
  }
}

export default Auth
