/**
 * WatchAlert 前端鉴权配置与登录跳转工具（tech-design §3.5 / §7）。
 *
 * - `eiamAuthUrl`：haven-console 登录页基址（SSO 入口，后端 eiam 支撑）。
 *   来源优先级：运行时注入 `window.__WATCHALERT_CONFIG__.eiamAuthUrl`
 *   → 构建期 `REACT_APP_EIAM_AUTH_URL` → null（触发登录页「配置缺失」态）。
 * - 回跳地址白名单清洗：仅放行「本告警平台域名 + path 以 / 开头」的相对路径；
 *   拒绝绝对外链、`//` 协议相对、`javascript:`/`data:`/`vbscript:` scheme，
 *   校验失败回退默认路径（防开放重定向，§7）。
 */

const LOGIN_PATH = '/console/login'
const DEFAULT_RETURN_PATH = '/'
// 危险 scheme（不区分大小写）
const DANGEROUS_SCHEME_RE = /^(javascript|data|vbscript):/i

/**
 * 获取 haven-console 登录页基址（eiamAuthUrl）。
 * 缺省返回 null（登录页据此进入「配置缺失」态）。
 */
export function getEiamAuthUrl() {
  const runtime = typeof window !== 'undefined' ? window.__WATCHALERT_CONFIG__ : undefined
  if (runtime && typeof runtime.eiamAuthUrl === 'string' && runtime.eiamAuthUrl.length > 0) {
    return runtime.eiamAuthUrl
  }
  const env = process.env.REACT_APP_EIAM_AUTH_URL
  if (typeof env === 'string' && env.length > 0) {
    return env
  }
  return null
}

/**
 * 回跳地址白名单清洗（纯函数）。
 * @param {string} raw 候选回跳地址（可为相对路径或完整 URL）
 * @returns {string} 清洗后的相对路径（path+search+hash）；非法时回退默认路径
 */
export function sanitizeRedirect(raw) {
  if (!raw || typeof raw !== 'string') return DEFAULT_RETURN_PATH
  const value = raw.trim()
  if (value.length === 0) return DEFAULT_RETURN_PATH
  // 危险 scheme（javascript:/data:/vbscript:）
  if (DANGEROUS_SCHEME_RE.test(value)) return DEFAULT_RETURN_PATH
  // 协议相对 URL（//evil.com）→ 拒绝
  if (value.startsWith('//')) return DEFAULT_RETURN_PATH

  let url
  try {
    url = new URL(value, window.location.origin)
  } catch {
    return DEFAULT_RETURN_PATH
  }
  // 绝对外链（host 不匹配本告警平台域名）→ 拒绝
  if (url.origin !== window.location.origin) return DEFAULT_RETURN_PATH

  const path = url.pathname + url.search + url.hash
  // path 必须以 / 开头
  if (!path.startsWith('/')) return DEFAULT_RETURN_PATH
  return path
}

/**
 * 构建 haven-console 登录页完整 URL（携带白名单清洗后的回跳地址）。
 * @param {string} returnPath 回跳目标（相对路径或完整 URL）
 * @returns {string|null} 登录 URL；eiamAuthUrl 缺失时返回 null
 */
export function buildConsoleLoginUrl(returnPath) {
  const base = getEiamAuthUrl()
  if (!base) return null
  const safe = sanitizeRedirect(returnPath)
  const trimmed = base.replace(/\/+$/, '')
  return `${trimmed}${LOGIN_PATH}?redirect=${encodeURIComponent(safe)}`
}

export { LOGIN_PATH, DEFAULT_RETURN_PATH }
