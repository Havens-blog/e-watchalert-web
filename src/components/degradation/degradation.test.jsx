import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { DegradedBanner } from './DegradedBanner';
import { ForbiddenPlaceholder } from './ForbiddenPlaceholder';
import { ReadonlyNotice } from './ReadonlyNotice';

function renderTo(component) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(component);
  });
  return { container, root };
}

describe('降级 UI 组件', () => {
  describe('DegradedBanner（组件 2 宽限横幅）', () => {
    it('visible=false 不渲染', () => {
      const { container } = renderTo(<DegradedBanner visible={false} />);
      expect(container.innerHTML).toBe('');
    });

    it('visible=true 渲染 alert + 文案 + 只读徽标', () => {
      const { container } = renderTo(<DegradedBanner visible={true} />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeTruthy();
      expect(alert.getAttribute('aria-live')).toBe('assertive');
      expect(alert.textContent).toContain('鉴权服务暂不可用');
      expect(alert.textContent).toContain('只读');
    });
  });

  describe('ForbiddenPlaceholder（组件 4 403 占位）', () => {
    it('渲染无访问权限 + 联系管理员，且无登录/重登按钮', () => {
      const { container } = renderTo(<ForbiddenPlaceholder />);
      expect(container.textContent).toContain('无访问权限');
      expect(container.textContent).toContain('联系管理员');
      expect(container.querySelector('button')).toBeNull();
      expect(container.querySelector('a')).toBeNull();
    });
  });

  describe('ReadonlyNotice（组件 3 只读说明条）', () => {
    it('渲染 role=status + 只读文案 + 无登录入口', () => {
      const { container } = renderTo(<ReadonlyNotice />);
      const status = container.querySelector('[role="status"]');
      expect(status).toBeTruthy();
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(status.textContent).toContain('只读浏览');
      expect(container.querySelector('button')).toBeNull();
    });
  });
});
