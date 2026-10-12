import {
  getStoredTheme,
  resolveTheme,
  applyTheme,
  persistTheme,
  toggleTheme,
  initTheme,
  THEME_KEY,
  THEME_DARK,
  THEME_LIGHT,
} from './theme';

describe('theme/theme 管理器', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light');
    // jsdom 未实现 matchMedia，默认 mock 为 dark
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('getStoredTheme：无持久化返回 null', () => {
    expect(getStoredTheme()).toBeNull();
  });

  it('getStoredTheme：非法值返回 null', () => {
    localStorage.setItem(THEME_KEY, 'purple');
    expect(getStoredTheme()).toBeNull();
  });

  it('getStoredTheme：合法值返回', () => {
    localStorage.setItem(THEME_KEY, THEME_LIGHT);
    expect(getStoredTheme()).toBe(THEME_LIGHT);
  });

  it('getStoredTheme：兼容 haven-console pinia JSON 格式 {"theme":"light"}', () => {
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme: THEME_LIGHT }));
    expect(getStoredTheme()).toBe(THEME_LIGHT);
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme: THEME_DARK }));
    expect(getStoredTheme()).toBe(THEME_DARK);
  });

  it('resolveTheme：无持久化回退系统偏好（dark）', () => {
    expect(resolveTheme()).toBe(THEME_DARK);
  });

  it('resolveTheme：持久化优先', () => {
    localStorage.setItem(THEME_KEY, THEME_LIGHT);
    expect(resolveTheme()).toBe(THEME_LIGHT);
  });

  it('applyTheme：light 加类 / dark 移除类', () => {
    applyTheme(THEME_LIGHT);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    applyTheme(THEME_DARK);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('persistTheme：写入（JSON 格式）/移除', () => {
    persistTheme(THEME_LIGHT);
    expect(localStorage.getItem(THEME_KEY)).toBe(JSON.stringify({ theme: THEME_LIGHT }));
    persistTheme('bogus');
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it('toggleTheme：dark→light→dark 并持久化', () => {
    const first = toggleTheme();
    expect(first).toBe(THEME_LIGHT);
    expect(localStorage.getItem(THEME_KEY)).toBe(JSON.stringify({ theme: THEME_LIGHT }));
    expect(document.documentElement.classList.contains('light')).toBe(true);

    const second = toggleTheme();
    expect(second).toBe(THEME_DARK);
    expect(localStorage.getItem(THEME_KEY)).toBe(JSON.stringify({ theme: THEME_DARK }));
  });

  it('initTheme：应用并返回生效主题', () => {
    const t = initTheme();
    expect([THEME_DARK, THEME_LIGHT]).toContain(t);
    expect(document.documentElement.classList.contains('light')).toBe(t === THEME_LIGHT);
  });
});
