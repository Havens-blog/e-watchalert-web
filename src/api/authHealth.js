import { get } from '../utils/http';

/**
 * 拉取鉴权降级状态（无鉴权，前端轮询驱动降级 UI，不自探 eiam/Redis）。
 * 响应信封：{ code: 0, data: { probe_a, probe_b, write_disabled } }
 */
export async function getAuthHealth() {
  return get('/api/watchalert/auth-health');
}
