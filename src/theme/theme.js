/**
 * 主题管理器（tech-design §11 令牌层视觉基线）：
 * - 默认深色（Linear 优先），持久化键 `hc_theme`（'dark' | 'light'）。
 * - 应用主题 = 在 <html> 上切换 `.light` 类（令牌层用 `:root.light`）。
 * - 无持久化值时回退系统配色偏好（prefers-color-scheme）。
 */

export const THEME_KEY = 'hc_theme'
export const THEME_DARK = 'dark'
export const THEME_LIGHT = 'light'

/**
 * 读取持久化主题；无有效值返回 null。
 * @returns {string|null}
 */
export function getStoredTheme() {
  if (typeof localStorage === 'undefined') return null
  const v = localStorage.getItem(THEME_KEY)
  return v === THEME_DARK || v === THEME_LIGHT ? v : null
}

/**
 * 系统配色偏好。
 * @returns {string} 'light' | 'dark'
 */
export function getSystemPreference() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return THEME_DARK
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? THEME_LIGHT : THEME_DARK
}

/**
 * 解析当前应生效主题（持久化 → 系统偏好 → dark）。
 * @returns {string} 'light' | 'dark'
 */
export function resolveTheme() {
  return getStoredTheme() ?? getSystemPreference()
}

/**
 * 在 <html> 上应用 `.light` 类（纯 DOM 副作用，便于隔离测试）。
 * @param {string} theme 'light' | 'dark'
 * @param {Document} doc 默认为全局 document
 */
export function applyTheme(theme, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return
  doc.documentElement.classList.toggle('light', theme === THEME_LIGHT)
}

/**
 * 持久化主题。
 * @param {string} theme 'light' | 'dark'
 */
export function persistTheme(theme) {
  if (typeof localStorage === 'undefined') return
  if (theme === THEME_LIGHT || theme === THEME_DARK) {
    localStorage.setItem(THEME_KEY, theme)
  } else {
    localStorage.removeItem(THEME_KEY)
  }
}

/**
 * 切换主题：返回切换后的主题并应用+持久化。
 * @returns {string} 切换后的主题
 */
export function toggleTheme() {
  const next = resolveTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK
  applyTheme(next)
  persistTheme(next)
  return next
}

/**
 * 应用启动初始化：按持久化/系统偏好应用主题（幂等）。
 * @returns {string} 生效主题
 */
export function initTheme() {
  const theme = resolveTheme()
  applyTheme(theme)
  return theme
}
