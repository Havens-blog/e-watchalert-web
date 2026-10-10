import axios from 'axios';
import { get, post } from '../utils/http';

jest.mock('antd', () => ({
  message: { error: jest.fn() },
}));
jest.mock('../config/auth', () => ({
  buildConsoleLoginUrl: jest.fn(),
}));

import { message } from 'antd';
import { buildConsoleLoginUrl } from '../config/auth';

describe('http 拦截器（会话化）', () => {
  let locationMock;

  beforeEach(() => {
    jest.clearAllMocks();
    locationMock = {
      replace: jest.fn(),
      pathname: '/ruleGroup',
      search: '?id=1',
      hash: '',
    };
    // jsdom 的 window.location.replace 只读，整体替换 location 对象
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: locationMock,
    });
    buildConsoleLoginUrl.mockReturnValue('http://console/console/login?redirect=%2FruleGroup');
  });

  afterEach(() => {
    axios.defaults.adapter = undefined;
  });

  const rejectWith = (status) => {
    axios.defaults.adapter = () => Promise.reject({ response: { status } });
  };

  const resolveWith = (capture) => {
    axios.defaults.adapter = (config) => {
      capture(config);
      return Promise.resolve({ data: 'ok', status: 200, statusText: 'OK', headers: {}, config });
    };
  };

  it('401 → 跳 haven-console 登录页（不清共享 cookie）', async () => {
    rejectWith(401);
    await expect(get('/api/x')).rejects.toBeTruthy();
    expect(buildConsoleLoginUrl).toHaveBeenCalled();
    expect(locationMock.replace).toHaveBeenCalledWith('http://console/console/login?redirect=%2FruleGroup');
  });

  it('403 → 原地提示，不跳转登录页', async () => {
    rejectWith(403);
    await expect(get('/api/x')).rejects.toBeTruthy();
    expect(message.error).toHaveBeenCalledWith('无权限访问');
    expect(locationMock.replace).not.toHaveBeenCalled();
  });

  it('503 → 原地提示鉴权服务暂不可用', async () => {
    rejectWith(503);
    await expect(get('/api/x')).rejects.toBeTruthy();
    expect(message.error).toHaveBeenCalledWith('鉴权服务暂不可用');
    expect(locationMock.replace).not.toHaveBeenCalled();
  });

  it('写请求注入 X-Requested-With（CSRF 二因子）', async () => {
    let captured;
    resolveWith((c) => { captured = c; });
    await post('/api/write', { a: 1 });
    expect(captured.headers['X-Requested-With']).toBe('XMLHttpRequest');
  });

  it('读请求不注入 X-Requested-With', async () => {
    let captured;
    resolveWith((c) => { captured = c; });
    await get('/api/read');
    expect(captured.headers['X-Requested-With']).toBeUndefined();
  });
});
