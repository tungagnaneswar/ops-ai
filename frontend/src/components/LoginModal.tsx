import React, { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { authApi } from '../services/api';
import type { LoginRequest, RegisterRequest } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, username: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);
      message.success(`Welcome back, ${data.username}!`);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
      }));

      onSuccess(data.token, data.username);
      loginForm.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterRequest) => {
    setLoading(true);
    try {
      const res = await authApi.register(values);
      message.success(res.message || 'Account created successfully! Please sign in.');
      registerForm.resetFields();
      setActiveTab('login');
      loginForm.setFieldsValue({ username: values.username });
    } catch (error: any) {
      message.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'login',
      label: 'Sign In',
      children: (
        <Form form={loginForm} layout="vertical" onFinish={handleLogin} requiredMark={false}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Enter password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block className="mt-2 h-10 font-medium">
            Sign In with OpsAI
          </Button>

          <Divider plain className="my-4 text-xs text-gray-400">DEMO BACKUP</Divider>

          <Button
            type="dashed"
            block
            onClick={() => {
              message.success('Signed in using Demo Admin Bypass.');
              localStorage.setItem('token', 'static-admin-token');
              localStorage.setItem('username', 'admin_user');
              onSuccess('static-admin-token', 'admin_user');
              onClose();
            }}
          >
            Login as Demo Admin (Bypass)
          </Button>
        </Form>
      ),
    },
    {
      key: 'register',
      label: 'Create Account',
      children: (
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} requiredMark={false}>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please choose a username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="e.g. jdoe" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="e.g. john@company.com" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Required' }]}>
                <Input prefix={<IdcardOutlined className="text-gray-400" />} placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please set a password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="At least 6 characters" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block className="mt-2 h-10 font-medium">
            Register Account
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title="OpsAI Platform Authentication"
      destroyOnClose
      centered
      width={420}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </Modal>
  );
};

export default LoginModal;
