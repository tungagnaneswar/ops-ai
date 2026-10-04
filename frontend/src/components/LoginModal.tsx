import React, { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message, Divider } from 'antd';
import { authApi } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, username: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);
      message.success('Logged in successfully!');
      onSuccess(data.token, data.username);
      onClose();
    } catch (error: any) {
      message.error(error.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      await authApi.register(values);
      message.success('Registered successfully! Please log in.');
      setActiveTab('login');
    } catch (error: any) {
      message.error(error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'login',
      label: 'Login',
      children: (
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Sign In</Button>
          
          <Divider>OR</Divider>
          
          <Button 
            type="dashed" 
            block 
            onClick={() => {
              message.success('Logged in successfully as Admin (Static)!');
              onSuccess('static-admin-token', 'admin_user');
              onClose();
            }}
          >
            Login as Admin (Static)
          </Button>
        </Form>
      )
    },
    {
      key: 'register',
      label: 'Register',
      children: (
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Sign Up</Button>
        </Form>
      )
    }
  ];

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} title="Authentication" destroyOnClose>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </Modal>
  );
};

export default LoginModal;
