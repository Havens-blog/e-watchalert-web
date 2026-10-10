import {
  getEiamAuthUrl,
  sanitizeRedirect,
  buildConsoleLoginUrl,
  DEFAULT_RETURN_PATH,
} from './auth';

describe('config/auth', () => {
  const originalOrigin = window.location.origin;

  afterEach(() => {
    delete window.__WATCHALERT_CONFIG__;
    delete process.env.REACT_APP_EIAM_AUTH_URL;
  });

  describe('getEiamAuthUrl', () => {
    it('运行时注入优先', () => {
      window.__WATCHALERT_CONFIG__ = { eiamAuthUrl: 'http://runtime-console' };
      expect(getEiamAuthUrl()).toBe('http://runtime-console');
    });

    it('构建期 env 回退', () => {
      process.env.REACT_APP_EIAM_AUTH_URL = 'http://env-console';
      expect(getEiamAuthUrl()).toBe('http://env-console');
    });

    it('缺省返回 null', () => {
      expect(getEiamAuthUrl()).toBeNull();
    });
  });

  describe('sanitizeRedirect 白名单清洗', () => {
    it('空/非字符串 → 默认路径', () => {
      expect(sanitizeRedirect('')).toBe(DEFAULT_RETURN_PATH);
      expect(sanitizeRedirect(null)).toBe(DEFAULT_RETURN_PATH);
      expect(sanitizeRedirect(undefined)).toBe(DEFAULT_RETURN_PATH);
      expect(sanitizeRedirect(123)).toBe(DEFAULT_RETURN_PATH);
    });

    it('拒绝 javascript: / data: / vbscript: scheme', () => {
      expect(sanitizeRedirect('javascript:alert(1)')).toBe(DEFAULT_RETURN_PATH);
      expect(sanitizeRedirect('data:text/html,<script>')).toBe(DEFAULT_RETURN_PATH);
      expect(sanitizeRedirect('vbscript:msgbox')).toBe(DEFAULT_RETURN_PATH);
    });

    it('拒绝协议相对 URL //', () => {
      expect(sanitizeRedirect('//evil.com/path')).toBe(DEFAULT_RETURN_PATH);
    });

    it('拒绝绝对外链', () => {
      expect(sanitizeRedirect('http://evil.com/ruleGroup')).toBe(DEFAULT_RETURN_PATH);
      expect(sanitizeRedirect('https://evil.com/')).toBe(DEFAULT_RETURN_PATH);
    });

    it('放行相对路径', () => {
      expect(sanitizeRedirect('/ruleGroup')).toBe('/ruleGroup');
      expect(sanitizeRedirect('/ruleGroup/123/rule/list')).toBe('/ruleGroup/123/rule/list');
    });

    it('放行相对路径（含 query + hash）', () => {
      expect(sanitizeRedirect('/ruleGroup?id=1#top')).toBe('/ruleGroup?id=1#top');
    });

    it('放行同源完整 URL，规整为相对路径', () => {
      const same = `${originalOrigin}/ruleGroup?id=1`;
      expect(sanitizeRedirect(same)).toBe('/ruleGroup?id=1');
    });
  });

  describe('buildConsoleLoginUrl', () => {
    it('eiamAuthUrl 缺失 → null', () => {
      expect(buildConsoleLoginUrl('/ruleGroup')).toBeNull();
    });

    it('拼装登录 URL（携带清洗后回跳地址）', () => {
      window.__WATCHALERT_CONFIG__ = { eiamAuthUrl: 'http://console:8888' };
      expect(buildConsoleLoginUrl('/ruleGroup?id=1')).toBe(
        'http://console:8888/console/login?redirect=%2FruleGroup%3Fid%3D1'
      );
    });

    it('危险回跳地址 → 回退默认路径', () => {
      window.__WATCHALERT_CONFIG__ = { eiamAuthUrl: 'http://console:8888' };
      expect(buildConsoleLoginUrl('javascript:alert(1)')).toBe(
        'http://console:8888/console/login?redirect=%2F'
      );
    });

    it('基址末尾斜杠规整', () => {
      window.__WATCHALERT_CONFIG__ = { eiamAuthUrl: 'http://console:8888/' };
      expect(buildConsoleLoginUrl('/ruleGroup')).toBe(
        'http://console:8888/console/login?redirect=%2FruleGroup'
      );
    });
  });
});
