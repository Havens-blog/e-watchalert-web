/**
 * 鉴权降级状态派生（ui-design §11.5 AuthHealth 三态，按实际后端契约派生）。
 * 后端 `GET /api/watchalert/auth-health` 实际返回：
 *   data = { probe_a: 'up'|'degraded', probe_b: 'up'|'degraded', write_disabled: bool }
 * 前端三态由 `write_disabled` 派生：
 *   normal    = write_disabled=false 且上一态非 degraded
 *   degraded  = write_disabled=true
 *   recovered = degraded → normal 翻转的瞬时态（触发恢复流程后回落 normal）
 * （graceRemaining / 宽限 2h 窗口语义后端未实现，见 parity-checklist §6。）
 */

export const AUTH_NORMAL = 'normal';
export const AUTH_DEGRADED = 'degraded';
export const AUTH_RECOVERED = 'recovered';

/**
 * 纯函数：由上一态 + write_disabled 派生当前 AuthHealth 三态。
 * @param {string} prev 'normal' | 'degraded' | 'recovered'
 * @param {boolean} writeDisabled
 * @returns {string}
 */
export function deriveAuthHealth(prev, writeDisabled) {
  if (writeDisabled) return AUTH_DEGRADED;
  if (prev === AUTH_DEGRADED) return AUTH_RECOVERED;
  return AUTH_NORMAL;
}
