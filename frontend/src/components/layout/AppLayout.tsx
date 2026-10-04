import { Layout, Menu, Button, Dropdown, Typography } from 'antd';
import { RobotOutlined, DashboardOutlined, AlertOutlined, TeamOutlined, SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (!savedUser) {
      navigate('/');
    } else {
      setUsername(savedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/dashboard/incidents', icon: <AlertOutlined />, label: 'Incidents' },
    { key: '/dashboard/teams', icon: <TeamOutlined />, label: 'Teams' },
    { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center bg-white shadow-sm px-6 sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer w-48" onClick={() => navigate('/')}>
          <RobotOutlined className="text-2xl text-blue-600" />
          <Title level={4} className="!mb-0 text-gray-800 tracking-tight">OpsAI</Title>
        </div>
        <div className="ml-auto">
          <Dropdown menu={{ items: [{ key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout }] }} placement="bottomRight">
            <Button type="text" className="font-medium">
              <UserOutlined /> {username}
            </Button>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={250} theme="light" className="border-r border-gray-100">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="pt-4"
          />
        </Sider>
        <Layout className="bg-gray-50 p-6">
          <Content className="bg-white p-6 rounded-lg shadow-sm">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
