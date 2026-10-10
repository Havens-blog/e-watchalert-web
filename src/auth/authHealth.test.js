import {
  deriveAuthHealth,
  AUTH_NORMAL,
  AUTH_DEGRADED,
  AUTH_RECOVERED,
} from './authHealth';

describe('deriveAuthHealth 三态派生', () => {
  it('write_disabled=true → degraded（任意上一态）', () => {
    expect(deriveAuthHealth(AUTH_NORMAL, true)).toBe(AUTH_DEGRADED);
    expect(deriveAuthHealth(AUTH_DEGRADED, true)).toBe(AUTH_DEGRADED);
    expect(deriveAuthHealth(AUTH_RECOVERED, true)).toBe(AUTH_DEGRADED);
  });

  it('write_disabled=false + 上一态 normal → normal', () => {
    expect(deriveAuthHealth(AUTH_NORMAL, false)).toBe(AUTH_NORMAL);
  });

  it('write_disabled=false + 上一态 degraded → recovered（瞬时态）', () => {
    expect(deriveAuthHealth(AUTH_DEGRADED, false)).toBe(AUTH_RECOVERED);
  });

  it('write_disabled=false + 上一态 recovered → normal（回落）', () => {
    expect(deriveAuthHealth(AUTH_RECOVERED, false)).toBe(AUTH_NORMAL);
  });
});
