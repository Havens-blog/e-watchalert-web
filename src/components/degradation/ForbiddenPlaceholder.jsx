import React from 'react';

/**
 * 组件 4：403 无权限占位（UF-1 的 in-place 状态，ui-design §11 组件 4）。
 * - 原地渲染「无访问权限」+ 联系管理员文案，不跳登录页（BIZ-auth-003）。
 * - 不提供「重新登录」按钮；角色恢复由上层轮询 role-bindings 驱动刷新。
 * - danger 语义色（--forbidden-*），aria-live="polite"。
 */
export function ForbiddenPlaceholder() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-page, #08090a)' }}
    >
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-[460px] rounded-2xl p-8 flex flex-col items-center text-center"
        style={{
          background: 'var(--forbidden-card-bg, var(--bg-surface, #191a1b))',
          border: '1px solid var(--forbidden-card-border, var(--border-subtle, rgba(255,255,255,0.05)))',
          boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.5))',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: 'var(--forbidden-icon, var(--color-danger, #ef4444))' }}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m4.9 4.9 14.2 14.2" />
        </svg>
        <h2 className="text-lg font-medium mt-4" style={{ color: 'var(--text-primary, #f7f8f8)' }}>
          无访问权限
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--forbidden-text, var(--text-secondary, #8a8f98))' }}>
          您已登录但没有当前子项目的访问权限，请联系管理员配置角色。
        </p>
      </div>
    </div>
  );
}

export default ForbiddenPlaceholder;
