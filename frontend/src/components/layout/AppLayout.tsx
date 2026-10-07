import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Drawer, Avatar } from 'antd';
import {
  RobotOutlined,
  DashboardOutlined,
  AlertOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context';
import { authApi } from '../../services/api';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (!savedUser) {
      navigate('/');
    } else {
      setUsername(savedUser);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      navigate('/');
    }
  };

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/dashboard/incidents', icon: <AlertOutlined />, label: 'Incidents' },
    { key: '/dashboard/teams', icon: <TeamOutlined />, label: 'Teams' },
    { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
    setMobileDrawerOpen(false);
  };

  return (
    <Layout className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Top Header */}
      <Header className="flex items-center justify-between bg-white dark:bg-[#1c1c1e] shadow-sm px-3 sm:px-6 z-40 border-b border-gray-100 dark:border-zinc-800 transition-colors h-16 shrink-0 leading-none select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger trigger */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden text-lg text-gray-700 dark:text-gray-200 flex items-center justify-center p-2"
            aria-label="Open navigation menu"
          />

          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none py-1"
            onClick={() => navigate('/')}
          >
            <span className="flex items-center justify-center text-2xl text-blue-600 leading-none">
              <RobotOutlined />
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100 leading-none">
              OpsAI
            </span>
          </div>
        </div>

        {/* Right Actions: Theme Toggle + User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />

          <Dropdown
            menu={{
              items: [
                {
                  key: 'user-info',
                  label: (
                    <div className="px-1 py-1 border-b border-gray-100 dark:border-zinc-800 mb-1">
                      <div className="text-xs text-gray-400">Signed in as</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{username || 'User'}</div>
                    </div>
                  ),
                  disabled: true,
                },
                {
                  key: 'settings',
                  label: 'Settings',
                  icon: <SettingOutlined />,
                  onClick: () => navigate('/dashboard/settings'),
                },
                {
                  key: 'logout',
                  label: 'Logout',
                  icon: <LogoutOutlined />,
                  danger: true,
                  onClick: handleLogout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              type="text"
              className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-200 px-2 sm:px-3 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Avatar size="small" icon={<UserOutlined />} className="bg-blue-600 text-white shrink-0" />
              <span className="hidden sm:inline max-w-[120px] truncate">{username}</span>
            </Button>
          </Dropdown>
        </div>
      </Header>

      {/* Main Body: Fixed Sider + Scrollable Content */}
      <Layout className="flex-1 flex flex-row overflow-hidden min-h-0">
        {/* Desktop Fixed Sidebar (No scroll, permanently fixed in place) */}
        <Sider
          width={240}
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          className="hidden lg:block border-r border-gray-100 dark:border-zinc-800 transition-colors shrink-0 select-none h-full"
          style={{ overflow: 'hidden' }}
        >
          <Menu
            mode="inline"
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            className="pt-4"
          />
        </Sider>

        {/* Mobile Navigation Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center text-xl text-blue-600 leading-none">
                <RobotOutlined />
              </span>
              <span className="font-bold tracking-tight text-gray-900 dark:text-gray-100 text-base leading-none">
                OpsAI Navigation
              </span>
            </div>
          }
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          size={280}
          styles={{ body: { padding: 0 } }}
          className="lg:hidden"
        >
          <div className="flex flex-col h-full justify-between">
            <Menu
              mode="inline"
              theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => handleMenuClick(key)}
              className="pt-2 border-0"
            />

            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 mb-3">
                <Avatar size="default" icon={<UserOutlined />} className="bg-blue-600 text-white" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{username}</div>
                  <div className="text-xs text-gray-400">Operator</div>
                </div>
              </div>
              <Button danger block icon={<LogoutOutlined />} onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </Drawer>

        {/* Scrollable Content Area */}
        <Layout className="bg-gray-50 dark:bg-[#121212] p-3 sm:p-5 lg:p-6 transition-colors flex-1 overflow-y-auto h-full min-h-0">
          <Content className="bg-white dark:bg-[#1c1c1e] p-4 sm:p-6 rounded-xl shadow-sm border border-transparent dark:border-zinc-800 transition-colors w-full min-h-fit">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
