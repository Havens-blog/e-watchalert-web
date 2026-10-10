'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { getEiamAuthUrl, buildConsoleLoginUrl } from '../config/auth'

/**
 * 登录页（tech-design §3.5 / ui-design 组件 1 UF-1）：
 * 移除本地账密表单，改为「使用平台账号登录」单按钮跳 haven-console 登录页。
 * 四态：Default（未登录）/ Loading（跳转中）/ Error（登录失败）/ Config（配置缺失）。
 * 视觉按平台设计语言（默认深色 + html.light 浅色、品牌四格 logo、靛蓝 CTA、danger 软底错误条）。
 */
export const Login = () => {
  const [state, setState] = useState('default') // default | loading | error | config
  const [configRetryCount, setConfigRetryCount] = useState(0)

  // 读取 eiamAuthUrl 配置；缺失时进入「配置缺失」态，后台每 30s 重试拉取。
  const refreshConfig = useCallback(() => {
    const url = getEiamAuthUrl()
    setState((prev) => {
      // 仅当此前因配置缺失而禁用时，才在配置命中后回到 Default（不覆盖 loading/error）
      if (url) {
        return prev === 'config' ? 'default' : prev
      }
      return 'config'
    })
  }, [])

  useEffect(() => {
    refreshConfig()
  }, [refreshConfig])

  useEffect(() => {
    // 配置缺失时每 30s 重试拉取
    if (state !== 'config') return
    const timer = setInterval(() => {
      setConfigRetryCount((c) => c + 1)
      refreshConfig()
    }, 30000)
    return () => clearInterval(timer)
  }, [state, refreshConfig])

  const handleLogin = () => {
    // 回跳地址：优先取当前 URL 上的 redirect query（经白名单清洗），否则默认看板。
    const params = new URLSearchParams(window.location.search)
    const redirectTarget = params.get('redirect') || '/'
    const loginUrl = buildConsoleLoginUrl(redirectTarget)

    if (!loginUrl) {
      setState('config')
      return
    }

    setState('loading')
    // 整页跳转（location.replace，不 pushState；跳转失败可回退登录页重试）
    window.location.replace(loginUrl)
  }

  const isDisabled = state === 'loading' || state === 'config'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--bg-page, #08090a)' }}>
      <main
        className="w-full max-w-[400px] rounded-2xl p-6"
        style={{
          background: 'var(--bg-surface, #191a1b)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.05))',
          boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.5))',
        }}
      >
        {/* 品牌区 */}
        <div className="flex flex-col items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            width="40"
            height="40"
            style={{ color: 'var(--accent-blue, #5e6ad2)' }}
          >
            <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
          </svg>
          <h3 className="text-2xl font-medium mt-2" style={{ color: 'var(--text-primary, #ededef)' }}>WatchAlert</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary, #8b8b93)' }}>运维告警平台</p>
        </div>

        {/* 错误提示（登录失败 / 配置缺失 两态复用，文案不同） */}
        {state === 'error' && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg px-3 py-2 mb-4 text-sm"
            style={{ background: 'var(--tag-bg, rgba(255,255,255,0.1))', color: 'var(--color-danger, #ef4444)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>登录失败，请重试</span>
          </div>
        )}

        {state === 'config' && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg px-3 py-2 mb-4 text-sm"
            style={{ background: 'var(--tag-bg, rgba(255,255,255,0.1))', color: 'var(--color-danger, #ef4444)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>登录服务未配置，请联系管理员</span>
          </div>
        )}

        {/* 主按钮：使用平台账号登录 */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-medium transition-colors"
          onClick={handleLogin}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={state === 'loading'}
          tabIndex={state === 'config' ? -1 : 0}
          style={{
            background: 'var(--accent-primary, #5e6ad2)',
            color: '#fff',
            opacity: state === 'config' ? 0.5 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {state === 'loading' && (
            <span className="spinner" aria-hidden="true" style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
              animation: 'wa-spin 0.8s linear infinite',
            }} />
          )}
          <span>{state === 'loading' ? '正在跳转安全登录…' : '使用平台账号登录'}</span>
          {state !== 'loading' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          )}
        </button>

        {/* 重试按钮（登录失败态） */}
        {state === 'error' && (
          <button
            type="button"
            className="w-full rounded-lg py-3 mt-3 font-medium"
            onClick={() => setState('default')}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary, #b4b4bb)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            }}
          >
            重试
          </button>
        )}

        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-tertiary, #8b8b93)' }}>
          请使用运维平台统一账号（eiam）登录
        </p>
      </main>

      <style>{`@keyframes wa-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
