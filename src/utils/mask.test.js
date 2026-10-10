import { maskSecret, isSensitiveField, SENSITIVE_FIELDS } from './mask';

describe('mask 脱敏工具', () => {
  it('非空敏感值 → ***', () => {
    expect(maskSecret('sk-123456')).toBe('***');
    expect(maskSecret('secret')).toBe('***');
    expect(maskSecret(0)).toBe('***');
    expect(maskSecret(false)).toBe('***');
  });

  it('空值 → 空串', () => {
    expect(maskSecret('')).toBe('');
    expect(maskSecret(null)).toBe('');
    expect(maskSecret(undefined)).toBe('');
  });

  it('isSensitiveField 命中敏感字段（含大小写/包含匹配）', () => {
    expect(isSensitiveField('pass')).toBe(true);
    expect(isSensitiveField('Password')).toBe(true);
    expect(isSensitiveField('secretKey')).toBe(true);
    expect(isSensitiveField('alicloudSk')).toBe(true);
    expect(isSensitiveField('webhook_secret')).toBe(true);
  });

  it('isSensitiveField 放行非敏感字段', () => {
    expect(isSensitiveField('name')).toBe(false);
    expect(isSensitiveField('id')).toBe(false);
    expect(isSensitiveField('')).toBe(false);
    expect(isSensitiveField(null)).toBe(false);
    expect(isSensitiveField(undefined)).toBe(false);
  });

  it('SENSITIVE_FIELDS 清单非空', () => {
    expect(SENSITIVE_FIELDS.length).toBeGreaterThan(0);
  });
});
