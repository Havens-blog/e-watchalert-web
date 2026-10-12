/**
 * eiam 统一身份服务请求层（WatchAlert 前端接入 eiam 租户/人员组织 API）。
 *
 * 鉴权口径（对齐 haven-console，parity §6.1）：eiam 鉴权只靠共享 Redis session cookie
 * （`ecmdb-token-key`），同域请求自动携带，**无需 Authorization/X-Tenant-ID 头**。
 * 故复用现有 http 封装（withCredentials=true，已带 cookie 与 baseURL）。
 *
 * 信封口径：eiam 响应为 ginx Result 信封 `{code, data, msg}`，`code === 0` 表示成功。
 * 本模块统一解包，页面层拿到的是纯 data；业务错误（code !== 0）抛 Error 并透传 code/msg，
 * 由页面层 try/catch 承接。
 */
import http from '../../utils/http'

/**
 * 解包 eiam 信封 {code, data, msg} → data。
 * - code === 0 → 返回 data；
 * - code !== 0 → 抛 Error（附 code），msg 优先；
 * - 非信封形态（无 code 字段）→ 原样返回（防御，兼容代理直出场景）。
 */
export function unwrap(res) {
    if (res && typeof res === 'object' && typeof res.code === 'number') {
        if (res.code === 0) {
            return res.data
        }
        const err = new Error(res.msg || `eiam 接口错误 (code=${res.code})`)
        err.code = res.code
        throw err
    }
    return res
}

/**
 * eiam 请求统一出口：复用现有 http（带 cookie），解包信封。
 * @param {string} method 'get' | 'post' | 'delete' | 'put' | 'patch'
 * @param {string} url   eiam 端点，如 '/api/iam/tenant/list'
 * @param {object} param 请求体（post）或 query（get）
 * @param {object} headers 额外请求头（如 X-Active-Tenant-ID 跨租户覆写，仅超管）
 */
export function eiamRequest(method, url, param, headers) {
    return http(method, url, param, headers).then(unwrap)
}

export default eiamRequest
