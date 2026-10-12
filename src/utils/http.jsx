/**
 * 网络请求配置（会话化改造，tech-design §3.5 / §5 / §7）。
 * - 移除 localStorage Authorization：请求带同源 cookie（`withCredentials`）。
 * - 写请求注入 `X-Requested-With: XMLHttpRequest`（CSRF 二因子，§7——经核实 eiamAxios 未默认带）。
 * - 401 → 存当前路径为 redirect_uri → 跳 haven-console 登录页（不清共享 cookie）。
 * - 403 → 原地 toast（不跳登录页）；503 → toast「鉴权服务暂不可用」。
 */
import axios from 'axios'
import { message } from 'antd'
import { buildConsoleLoginUrl } from '../config/auth'

const protocol = window.location.protocol
const curUrl = window.location.hostname
const port = window.location.port
axios.defaults.timeout = 100000
axios.defaults.withCredentials = true
axios.defaults.baseURL = `${protocol}//${curUrl}:${port}`

// 401 跳转防抖（模块级单次置位，防多个并发 401 重复跳转）
let isRedirectingToLogin = false

/** 写方法集合（非读方法一律注入 CSRF 头） */
const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete'])

/**
 * http request 拦截器
 */
axios.interceptors.request.use(
  (config) => {
    config.headers = {
      'Content-Type': 'application/json',
      TenantID: localStorage.getItem('TenantID'),
      ...config.headers,
    }

    // 写请求注入 CSRF 二因子头
    const method = (config.method || '').toLowerCase()
    if (WRITE_METHODS.has(method)) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
    }

    // 会话 cookie 由浏览器自动携带（withCredentials），不再注入 Authorization 头。
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 跳转 haven-console 登录页（BIZ-auth-008：不清共享 cookie）。
 * cookie 是 eiam 签发的平台共享凭证，清除会扩散为全平台掉线；仅做本应用局部跳转。
 */
function redirectToLogin() {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true

  const currentPath = window.location.pathname + window.location.search + window.location.hash
  const loginUrl = buildConsoleLoginUrl(currentPath)

  if (!loginUrl) {
    // 配置缺失：无法跳转，退回站内登录页（登录页会展示「配置缺失」态）
    window.location.replace('/login')
    return
  }
  window.location.replace(loginUrl)
}

/**
 * http response 拦截器
 */
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error?.response?.status
    switch (status) {
      case 401:
        // 会话过期/未登录 → 跳登录（不含 query/hash 丢失，含于 currentPath）
        redirectToLogin()
        break
      case 403:
        // 已认证但无角色 → 原地提示，不跳登录页（BIZ-auth-003）
        message.error('无权限访问')
        break
      case 503:
        // 鉴权服务降级 → 原地提示，不跳转、不清会话（TECH-error-006）
        message.error('鉴权服务暂不可用')
        break
      default:
        break
    }

    return Promise.reject(error)
  }
)

/**
 * 封装 get 方法
 */
export function get(url, params = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params, headers })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error))
  })
}

/**
 * 封装 post 方法
 */
export function post(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, data, { headers }).then(
      (response) => resolve(response.data),
      (err) => reject(err)
    )
  })
}

/**
 * 封装 patch 方法
 */
export function patch(url, data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    axios.patch(url, data, { headers }).then(
      (response) => resolve(response.data),
      (err) => reject(err)
    )
  })
}

/**
 * 封装 put 方法
 */
export function put(url, data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, data, { headers }).then(
      (response) => resolve(response.data),
      (err) => reject(err)
    )
  })
}

/**
 * 封装 delete 方法
 */
export function del(url, params = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    axios.delete(url, { params, headers }).then(
      (response) => resolve(response.data),
      (err) => reject(err)
    )
  })
}

/**
 * 统一接口处理，返回数据
 */
// eslint-disable-next-line import/no-anonymous-default-export
export default function (method, url, param, headers) {
  return new Promise((resolve, reject) => {
    switch (method) {
      case 'get':
        get(url, param, headers)
          .then(resolve)
          .catch(reject)
        break
      case 'post':
        post(url, param, headers)
          .then(resolve)
          .catch((error) => {
            console.error('post request failed.', error)
            reject(error)
          })
        break
      case 'put':
        put(url, param, headers)
          .then(resolve)
          .catch(reject)
        break
      case 'patch':
        patch(url, param, headers)
          .then(resolve)
          .catch(reject)
        break
      case 'delete':
        del(url, param, headers)
          .then(resolve)
          .catch(reject)
        break
      default:
        reject(new Error(`unsupported method: ${method}`))
    }
  })
}
