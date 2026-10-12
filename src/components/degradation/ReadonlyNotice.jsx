import React from 'react';

/**
 * 组件 3：只读免登录视图的只读说明条（UF-3，ui-design §11 组件 3）。
 * - 全宽单行条：bg --bg-hover、下边 --border-subtle、文字 --text-secondary。
 * - 图标 + 文字双通道（不单靠颜色传达状态）。
 * - role="status" + aria-live="polite"。
 * 说明：整页「只读免登录降级」的触发依赖后端宽限窗口语义（parity-checklist §6，
 * 后端尚未实现 grace 语义），本组件作为可复用 UI 件先行落地并单测。
 */
export function ReadonlyNotice() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 w-full px-6 h-12 text-sm"
      style={{
        background: 'var(--bg-hover, #28282c)',
        borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.05))',
        color: 'var(--text-secondary, var(--text-secondary))',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span>鉴权服务不可用，当前为只读浏览。请等待恢复或联系管理员</span>
    </div>
  );
}

export default ReadonlyNotice;
