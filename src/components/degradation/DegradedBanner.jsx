import React from 'react';

/**
 * 组件 2：鉴权不可用宽限横幅（UF-2，ui-design §11 组件 2）。
 * - write_disabled=true 时展示（全站顶部常驻，登录页除外）。
 * - warning 语义色（--degradation-banner-*，暗/浅两套）。
 * - role="alert" + aria-live="assertive"（降级需立即通告）。
 * - 写操作按钮禁用由上层（壳层）消费 writeDisabled 统一处理。
 * @param {object} props
 * @param {boolean} props.visible 是否展示
 */
export function DegradedBanner({ visible }) {
  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm"
      style={{
        background: 'var(--degradation-banner-bg, rgba(245,158,11,0.10))',
        borderBottom: '1px solid var(--degradation-banner-border, rgba(245,158,11,0.35))',
        color: 'var(--degradation-banner-text, #fbbf24)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0, color: 'var(--color-warning, #f59e0b)' }}
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <span className="font-medium truncate" style={{ maxWidth: 'calc(100% - 140px)' }}>
        鉴权服务暂不可用，已切换宽限模式（只读）
      </span>
      <span
        className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
        style={{
          background: 'var(--glass-bg, rgba(255,255,255,0.03))',
          border: '1px solid var(--border-base, rgba(255,255,255,0.08))',
          color: 'inherit',
          flexShrink: 0,
        }}
      >
        只读
      </span>
    </div>
  );
}

export default DegradedBanner;
