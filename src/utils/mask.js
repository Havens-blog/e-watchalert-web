/**
 * 敏感字段脱敏工具（ui-design 组件 3 UF-3 脱敏清单）。
 * 通知渠道凭据 / 数据源密码 / webhook 等一律不展示原文，统一返回 '***'。
 * @param {*} value 原始值
 * @returns {string} 非空 → '***'；空/null/undefined → ''
 */
export function maskSecret(value) {
  if (value === null || value === undefined || value === '') return '';
  return '***';
}

/**
 * 脱敏清单（字段名 → 是否敏感）。用于只读视图逐字段判定。
 */
export const SENSITIVE_FIELDS = [
  'pass',
  'password',
  'secret',
  'secretKey',
  'alicloudAk',
  'alicloudSk',
  'accessKey',
  'hook',
  'sign',
  'kubeConfig',
];

/**
 * 按字段名判定是否敏感。
 * @param {string} fieldName
 * @returns {boolean}
 */
export function isSensitiveField(fieldName) {
  if (!fieldName || typeof fieldName !== 'string') return false;
  const lower = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some((s) => {
    const ls = s.toLowerCase();
    return lower === ls || lower.includes(ls);
  });
}
