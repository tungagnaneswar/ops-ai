import React from 'react';
import { Button, Dropdown, Tooltip, Segmented, Card } from 'antd';
import type { MenuProps } from 'antd';
import {
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useTheme, type ThemeMode } from '../context';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'segmented' | 'cards';
  className?: string;
  size?: 'small' | 'middle' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'dropdown',
  className = '',
  size = 'middle',
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const getActiveIcon = () => {
    if (theme === 'system') return <DesktopOutlined />;
    if (theme === 'dark') return <MoonOutlined />;
    return <SunOutlined />;
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
  };

  // Card Variant - suitable for Settings page with rich previews
  if (variant === 'cards') {
    const options: { key: ThemeMode; label: string; desc: string; icon: React.ReactNode }[] = [
      {
        key: 'light',
        label: 'Light',
        desc: 'Clean & crisp bright appearance',
        icon: <SunOutlined className="text-2xl text-amber-500" />,
      },
      {
        key: 'dark',
        label: 'Dark',
        desc: 'Easy on the eyes in low-light environments',
        icon: <MoonOutlined className="text-2xl text-blue-400" />,
      },
      {
        key: 'system',
        label: 'System',
        desc: `Syncs with OS preference (currently ${resolvedTheme})`,
        icon: <DesktopOutlined className="text-2xl text-purple-500" />,
      },
    ];

    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {options.map((opt) => {
          const isSelected = theme === opt.key;
          return (
            <Card
              key={opt.key}
              hoverable
              onClick={() => setTheme(opt.key)}
              className={`cursor-pointer transition-all border-2 relative overflow-hidden ${
                isSelected
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
              styles={{ body: { padding: '16px' } }}
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 mb-3 inline-block">
                  {opt.icon}
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    <CheckOutlined className="text-[10px]" /> Active
                  </span>
                )}
              </div>
              <div className="font-semibold text-base text-gray-900 dark:text-gray-100">{opt.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</div>

              {/* Theme mini visual mockup */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-1.5">
                <div
                  className={`h-3 w-8 rounded-full ${
                    opt.key === 'dark' || (opt.key === 'system' && resolvedTheme === 'dark')
                      ? 'bg-zinc-700'
                      : 'bg-gray-200'
                  }`}
                />
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <div
                  className={`h-3 flex-1 rounded-full ${
                    opt.key === 'dark' || (opt.key === 'system' && resolvedTheme === 'dark')
                      ? 'bg-zinc-800'
                      : 'bg-gray-100'
                  }`}
                />
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Segmented Variant
  if (variant === 'segmented') {
    return (
      <Segmented
        size={size}
        className={className}
        value={theme}
        onChange={(val) => setTheme(val as ThemeMode)}
        options={[
          {
            value: 'light',
            label: (
              <span className="flex items-center gap-1.5 px-1 py-0.5">
                <SunOutlined className="text-amber-500" /> Light
              </span>
            ),
          },
          {
            value: 'dark',
            label: (
              <span className="flex items-center gap-1.5 px-1 py-0.5">
                <MoonOutlined className="text-blue-400" /> Dark
              </span>
            ),
          },
          {
            value: 'system',
            label: (
              <span className="flex items-center gap-1.5 px-1 py-0.5">
                <DesktopOutlined className="text-purple-400" /> System
              </span>
            ),
          },
        ]}
      />
    );
  }

  // Dropdown Variant (Default) - Compact button for headers
  const menuItems: MenuProps['items'] = [
    {
      key: 'light',
      label: (
        <div className="flex items-center justify-between w-36 py-1">
          <span className="flex items-center gap-2">
            <SunOutlined className="text-amber-500 text-sm" />
            <span>Light</span>
          </span>
          {theme === 'light' && <CheckOutlined className="text-blue-500 text-xs" />}
        </div>
      ),
      onClick: () => setTheme('light'),
    },
    {
      key: 'dark',
      label: (
        <div className="flex items-center justify-between w-36 py-1">
          <span className="flex items-center gap-2">
            <MoonOutlined className="text-blue-400 text-sm" />
            <span>Dark</span>
          </span>
          {theme === 'dark' && <CheckOutlined className="text-blue-500 text-xs" />}
        </div>
      ),
      onClick: () => setTheme('dark'),
    },
    {
      key: 'system',
      label: (
        <div className="flex items-center justify-between w-36 py-1">
          <span className="flex items-center gap-2">
            <DesktopOutlined className="text-purple-400 text-sm" />
            <span>System</span>
          </span>
          {theme === 'system' && <CheckOutlined className="text-blue-500 text-xs" />}
        </div>
      ),
      onClick: () => setTheme('system'),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems, selectedKeys: [theme] }} placement="bottomRight" trigger={['click']}>
      <Tooltip title={`Theme: ${getThemeLabel(theme)}`}>
        <Button
          type="text"
          shape="circle"
          size={size}
          className={`flex items-center justify-center transition-colors text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 ${className}`}
          icon={getActiveIcon()}
          aria-label="Toggle theme"
        />
      </Tooltip>
    </Dropdown>
  );
};

export default ThemeToggle;
