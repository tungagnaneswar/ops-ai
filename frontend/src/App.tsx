import { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Typography, Card, Button, Dropdown } from 'antd';
import { RobotOutlined, SafetyCertificateOutlined, TeamOutlined, BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import LoginModal from './components/LoginModal';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<{username: string, token: string} | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
      setUser({ token: savedToken, username: savedUsername });
    }
  }, []);

  const handleLoginSuccess = (token: string, username: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setUser({ token, username });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <Layout className="min-h-screen">
        <Header className="flex items-center bg-white shadow-sm px-6 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-2xl text-blue-600" />
            <Title level={4} className="!mb-0 text-gray-800 tracking-tight">OpsAI</Title>
          </div>
          <div className="ml-auto">
            {user ? (
              <Dropdown menu={{ items: [{ key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout }] }} placement="bottomRight">
                <Button type="text" className="font-medium">
                  <UserOutlined /> {user.username}
                </Button>
              </Dropdown>
            ) : (
              <Button type="primary" shape="round" onClick={() => setIsLoginModalOpen(true)}>Sign In</Button>
            )}
          </div>
        </Header>
        
        <Content className="px-12 py-10 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 mt-8"
          >
            <Title level={1} className="!text-5xl !font-bold tracking-tight text-gray-900 mb-4">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Incident Management</span>
            </Title>
            <Text className="text-lg text-gray-500 max-w-2xl mx-auto block">
              Automate detection, route to the right teams, and generate post-mortems with artificial intelligence.
            </Text>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm border-gray-100 h-full hover:shadow-md transition-shadow">
                <SafetyCertificateOutlined className="text-3xl text-blue-500 mb-4" />
                <Title level={4}>Smart Routing</Title>
                <Text className="text-gray-500">Automatically analyze incoming alerts and assign them to the appropriate on-call engineers.</Text>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm border-gray-100 h-full hover:shadow-md transition-shadow">
                <TeamOutlined className="text-3xl text-purple-500 mb-4" />
                <Title level={4}>Team Collaboration</Title>
                <Text className="text-gray-500">Cross-team visibility, internal notes, and integrated Slack/PagerDuty communication.</Text>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm border-gray-100 h-full hover:shadow-md transition-shadow">
                <BellOutlined className="text-3xl text-amber-500 mb-4" />
                <Title level={4}>Automated Summaries</Title>
                <Text className="text-gray-500">Let OpsAI generate executive summaries and RCA documents the moment an incident is resolved.</Text>
              </Card>
            </motion.div>
          </div>
        </Content>
        
        <Footer className="text-center text-gray-500 bg-transparent">
          OpsAI Platform ©{new Date().getFullYear()} Created with Ant Design & Tailwind CSS
        </Footer>
      </Layout>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={handleLoginSuccess} 
      />
    </ConfigProvider>
  );
}

export default App;
