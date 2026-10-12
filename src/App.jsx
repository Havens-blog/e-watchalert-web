import React, { useState, useEffect, useMemo } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Helmet } from 'react-helmet';
import routes from './routes';
import { useRoutes } from 'react-router-dom';
import './index.css'
import { AppContextProvider } from './context/RuleContext';
import { ReactFlowProvider } from 'reactflow';
import { resolveTheme, THEME_DARK } from './theme/theme';

/**
 * Linear 设计令牌 → antd theme 映射（与 haven-console 对齐）：
 * - 主色 #5e6ad2（accent-primary）、强调蓝 #7170ff（accent-blue）
 * - 语义色对齐 Linear（success #27a644 / warning #f59e0b / error #ef4444）
 * - 深色默认（darkAlgorithm），背景/文字基准对齐 Linear 灰阶
 * - 圆角 8px、Inter 字体族
 * 令牌值字节级同源于 theme-variables.css（与 haven-console theme-variables.scss 一致）。
 */
function buildAntdTheme(isDark) {
    return {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            // 主色 / 语义色（Linear）
            colorPrimary: '#5e6ad2',      // --accent-primary
            colorInfo: '#7170ff',         // --accent-blue
            colorLink: '#7170ff',         // --accent-blue
            colorSuccess: '#27a644',      // --color-success
            colorWarning: '#f59e0b',      // --color-warning
            colorError: '#ef4444',        // --color-danger
            // 背景 / 文字基准（让 antd 深色推导对齐 Linear 表面阶）
            colorBgBase: isDark ? '#08090a' : '#f7f8f8',   // --bg-base
            colorTextBase: isDark ? '#f7f8f8' : '#111111', // --text-primary
            // 圆角 / 字体
            borderRadius: 8,              // Linear base
            borderRadiusLG: 12,           // dialog/card
            borderRadiusSM: 6,            // Linear small
            fontFamily: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
            Layout: {
                siderBg: isDark ? '#0f1011' : '#ffffff',   // --bg-elevated
                headerBg: isDark ? '#0f1011' : '#ffffff',
                bodyBg: isDark ? '#08090a' : '#f7f8f8',    // --bg-page
            },
            Menu: {
                darkItemBg: '#0f1011',                       // --bg-elevated
                darkSubMenuItemBg: '#08090a',                // --bg-base
                darkItemColor: '#8a8f98',                    // --text-secondary
                darkItemHoverBg: 'rgba(255,255,255,0.06)',   // --glass-bg-hover
                darkItemSelectedBg: 'rgba(94,106,210,0.22)', // accent 选中
                darkItemSelectedColor: '#f7f8f8',            // --text-primary
            },
        },
    };
}

export default function App() {
    const element = useRoutes(routes);
    const title = "WatchAlert";
    const [isDark, setIsDark] = useState(() => resolveTheme() === THEME_DARK);

    // 跨标签页主题同步：haven-console 切主题（写 localStorage hc_theme）时，
    // 本标签页经 storage 事件跟随；同页内切换经自定义事件 hc-theme-change 通知。
    useEffect(() => {
        const sync = () => setIsDark(resolveTheme() === THEME_DARK);
        window.addEventListener('storage', sync);
        window.addEventListener('hc-theme-change', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('hc-theme-change', sync);
        };
    }, []);

    const antdTheme = useMemo(() => buildAntdTheme(isDark), [isDark]);

    return (
        <AppContextProvider>
            <ReactFlowProvider>
                <ConfigProvider theme={antdTheme}>
                    <Helmet>
                        <title>{title}</title>
                    </Helmet>
                    {element}
                </ConfigProvider>
            </ReactFlowProvider>
        </AppContextProvider>
    );
}
