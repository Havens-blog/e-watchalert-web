import { useEffect, useRef, useState } from 'react';
import { getAuthHealth } from '../api/authHealth';
import { deriveAuthHealth, AUTH_NORMAL } from '../auth/authHealth';

/**
 * 鉴权降级状态轮询 hook（ui-design §11.5）。
 * - 每 intervalMs 轮询 `GET /api/watchalert/auth-health`（默认 10s）。
 * - 派生 writeDisabled（boolean）+ authHealth（'normal'|'degraded'|'recovered'）。
 * - 传输层故障不触发降级（ui-design：传输层故障与 eiam 健康判定正交），保持上一态。
 * @param {number} intervalMs 轮询间隔（默认 10000）
 */
export function useAuthHealth(intervalMs = 10000) {
  const [snapshot, setSnapshot] = useState(null);
  const [authHealth, setAuthHealth] = useState(AUTH_NORMAL);
  const [writeDisabled, setWriteDisabled] = useState(false);
  const prevRef = useRef(AUTH_NORMAL);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await getAuthHealth();
        const data = res?.data ?? res;
        if (cancelled) return;

        const wd = !!data?.write_disabled;
        setWriteDisabled(wd);
        setSnapshot({
          probe_a: data?.probe_a,
          probe_b: data?.probe_b,
          write_disabled: wd,
        });

        const next = deriveAuthHealth(prevRef.current, wd);
        // recovered 为瞬时态：下一 tick 回落 normal
        prevRef.current = next === 'recovered' ? AUTH_NORMAL : next;
        setAuthHealth(next);
      } catch (e) {
        // 传输层故障：不降级、不置空，维持上一态
        if (!cancelled) {
          // 保留当前 snapshot/authHealth 不变
        }
      }
    };

    poll();
    const timer = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return { snapshot, authHealth, writeDisabled };
}
