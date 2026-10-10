import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { Login } from '../pages/login';

describe('Login 页（UF-1）', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
    container = null;
    root = null;
  });

  it('无本地用户名/密码输入框（无任何 input 元素）', async () => {
    await act(async () => {
      root.render(<Login />);
    });

    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(container.querySelector('input[type="text"]')).toBeNull();
    expect(container.querySelector('form')).toBeNull();
  });

  it('渲染「使用平台账号登录」主按钮', async () => {
    await act(async () => {
      root.render(<Login />);
    });

    expect(container.textContent).toContain('使用平台账号登录');
    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent.includes('使用平台账号登录')
    );
    expect(btn).toBeTruthy();
  });

  it('配置缺失态（eiamAuthUrl=null）禁用按钮并提示', async () => {
    delete window.__WATCHALERT_CONFIG__;
    delete process.env.REACT_APP_EIAM_AUTH_URL;

    await act(async () => {
      root.render(<Login />);
    });

    expect(container.textContent).toContain('登录服务未配置，请联系管理员');
    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent.includes('使用平台账号登录')
    );
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
  });
});
