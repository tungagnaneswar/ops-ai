import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Tabs, message, Divider, Row, Col } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { authApi } from '../services/api';
import type { LoginRequest, RegisterRequest } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, username: string) => void;
}

interface MaskedPasswordInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
}

/**
 * Custom masked password input that uses type="text" with CSS text-security
 * to completely eliminate browser password generator popups ("Suggest strong password...")
 * and saved-credential autofill overlays when clicked.
 */
const MaskedPasswordInput: React.FC<MaskedPasswordInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter password',
  id = 'ops_auth_sec_key',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      id={id}
      name={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      prefix={<LockOutlined className="text-gray-400" />}
      suffix={
        <span
          className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 flex items-center"
          onClick={() => setVisible(!visible)}
          tabIndex={-1}
          role="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </span>
      }
      autoComplete="off"
      aria-autocomplete="none"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      data-lpignore="true"
      data-1p-ignore="true"
      data-form-type="other"
      className={visible ? 'masked-password-revealed' : 'masked-password'}
    />
  );
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // Reset forms whenever the modal opens to guarantee fields are completely clear
  useEffect(() => {
    if (isOpen) {
      loginForm.resetFields();
      registerForm.resetFields();
    }
  }, [isOpen, loginForm, registerForm]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    loginForm.resetFields();
    registerForm.resetFields();
  };

  const handleModalClose = () => {
    loginForm.resetFields();
    registerForm.resetFields();
    onClose();
  };

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
      loginForm.resetFields();
      setActiveTab('login');
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
        <Form
          form={loginForm}
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
          autoComplete="off"
          initialValues={{ username: '', password: '' }}
        >
          {/* Decoy hidden inputs to absorb browser autofill heuristics */}
          <input
            type="text"
            name="fake_autofill_username"
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
          />
          <input
            type="password"
            name="fake_autofill_password"
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
          />

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              id="login_auth_uid"
              name="login_auth_uid"
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Enter username"
              autoComplete="off"
              aria-autocomplete="none"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <MaskedPasswordInput
              id="login_auth_secret_key"
              placeholder="Enter password"
            />
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
              loginForm.resetFields();
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
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
          autoComplete="off"
          initialValues={{
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            password: '',
          }}
        >
          {/* Decoy hidden inputs to absorb browser autofill heuristics */}
          <input
            type="text"
            name="fake_reg_autofill_user"
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
          />
          <input
            type="password"
            name="fake_reg_autofill_pwd"
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
          />

          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please choose a username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input
              id="reg_auth_uid"
              name="reg_auth_uid"
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="e.g. jdoe"
              autoComplete="off"
              aria-autocomplete="none"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              id="reg_contact_mail"
              name="reg_contact_mail"
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="e.g. john@company.com"
              autoComplete="off"
              aria-autocomplete="none"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
            />
          </Form.Item>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Required' }]}>
                <Input
                  id="reg_first_name_val"
                  name="reg_first_name_val"
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="John"
                  autoComplete="off"
                  aria-autocomplete="none"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Required' }]}>
                <Input
                  id="reg_last_name_val"
                  name="reg_last_name_val"
                  placeholder="Doe"
                  autoComplete="off"
                  aria-autocomplete="none"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                />
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
            <MaskedPasswordInput
              id="reg_auth_secret_key"
              placeholder="At least 6 characters"
            />
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
      onCancel={handleModalClose}
      footer={null}
      title="OpsAI Platform Authentication"
      destroyOnHidden
      centered
      width={420}
      style={{ maxWidth: '92vw' }}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
    </Modal>
  );
};

export default LoginModal;
