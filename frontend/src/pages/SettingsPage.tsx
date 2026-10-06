import { useState, useEffect } from 'react';
import { Typography, Tabs, Form, Input, Button, Switch, Divider, Card, message, Spin, Tag } from 'antd';
import { UserOutlined, BellOutlined, SecurityScanOutlined, ApiOutlined, BgColorsOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { userApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await userApi.getProfile();
        form.setFieldsValue({
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username,
          username: profile.username,
          email: profile.email,
          role: profile.roles && profile.roles.length > 0 ? profile.roles.join(', ') : 'Operator',
        });
      } catch {
        // Fallback to localStorage info if backend offline
        const localUser = localStorage.getItem('user');
        const username = localStorage.getItem('username') || 'Operator';
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            form.setFieldsValue({
              name: parsed.username,
              username: parsed.username,
              email: parsed.email || 'operator@opsai.internal',
              role: 'Operator',
            });
          } catch {
            form.setFieldsValue({ name: username, username, email: 'operator@opsai.internal', role: 'Operator' });
          }
        } else {
          form.setFieldsValue({ name: username, username, email: 'operator@opsai.internal', role: 'Operator' });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [form]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const parts = (values.name || '').trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      await userApi.updateProfile({
        firstName,
        lastName,
        email: values.email,
      });
      message.success('Profile updated successfully!');
    } catch (error: any) {
      message.error(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    {
      key: 'appearance',
      label: (
        <span>
          <BgColorsOutlined />
          Appearance
        </span>
      ),
      children: (
        <Card bordered={false} className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
          <div className="mb-6">
            <Title level={4} className="!mb-1 text-lg sm:text-xl">Theme Preferences</Title>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Customize how OpsAI appears across all pages. You can force light or dark mode, or allow the app to adapt dynamically to your system theme.
            </Text>
          </div>

          <div className="mb-6">
            <ThemeToggle variant="cards" />
          </div>

          <Divider className="my-6 border-gray-100 dark:border-zinc-800" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5 shrink-0" />
              <div>
                <Text strong className="block text-gray-900 dark:text-gray-100 text-sm">Quick Switcher</Text>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1 mt-0.5">
                  <span>Current configuration:</span>
                  <Tag color="blue" className="uppercase text-[11px] m-0">{theme}</Tag>
                  {theme === 'system' && (
                    <span className="text-gray-400">
                      (Resolved to {resolvedTheme} mode)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <ThemeToggle variant="segmented" />
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile
        </span>
      ),
      children: (
        <Card bordered={false} className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
          <Title level={4} className="mb-4 text-lg sm:text-xl">Personal Information</Title>
          {loading ? (
            <div className="py-8 text-center"><Spin /></div>
          ) : (
            <Form form={form} layout="vertical" onFinish={handleSave} className="max-w-xl">
              <Form.Item label="Display Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
                <Input placeholder="Your Name" />
              </Form.Item>
              <Form.Item label="Username" name="username">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input placeholder="user@company.com" />
              </Form.Item>
              <Form.Item label="Assigned Role" name="role">
                <Input disabled />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </Form>
          )}
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Card bordered={false} className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
          <Title level={4} className="mb-4 text-lg sm:text-xl">Notification Preferences</Title>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Text strong className="block text-sm">Email Alerts</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Receive email notifications for new high-severity incidents.</Text>
              </div>
              <Switch defaultChecked className="shrink-0" />
            </div>
            <Divider className="my-0 border-gray-100 dark:border-zinc-800" />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Text strong className="block text-sm">Slack Messages</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Get direct messages on Slack for incidents assigned to you.</Text>
              </div>
              <Switch defaultChecked className="shrink-0" />
            </div>
            <Divider className="my-0 border-gray-100 dark:border-zinc-800" />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Text strong className="block text-sm">Daily Digest</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Receive a daily summary of resolved and open incidents.</Text>
              </div>
              <Switch className="shrink-0" />
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'integrations',
      label: (
        <span>
          <ApiOutlined />
          Integrations
        </span>
      ),
      children: (
        <Card bordered={false} className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
          <Title level={4} className="mb-4 text-lg sm:text-xl">Connected Services</Title>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Text strong className="block text-sm">PagerDuty</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Sync on-call schedules and trigger escalation policies.</Text>
              </div>
              <Button type="default" className="w-full sm:w-auto shrink-0">Configure</Button>
            </div>
            <Divider className="my-0 border-gray-100 dark:border-zinc-800" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Text strong className="block text-sm">Datadog</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Ingest alerts and metrics automatically.</Text>
              </div>
              <Button type="default" className="w-full sm:w-auto shrink-0">Configure</Button>
            </div>
            <Divider className="my-0 border-gray-100 dark:border-zinc-800" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Text strong className="block text-sm">GitHub</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Link PRs and commits to incident root cause analyses.</Text>
              </div>
              <Button type="default" className="w-full sm:w-auto shrink-0">Configure</Button>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined />
          Security
        </span>
      ),
      children: (
        <Card bordered={false} className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
          <Title level={4} className="mb-4 text-lg sm:text-xl">Security Settings</Title>
          <Form layout="vertical" className="max-w-md">
            <Form.Item label="Current Password">
              <Input.Password />
            </Form.Item>
            <Form.Item label="New Password">
              <Input.Password />
            </Form.Item>
            <Form.Item label="Confirm New Password">
              <Input.Password />
            </Form.Item>
            <Button type="primary" className="w-full sm:w-auto">Update Password</Button>
          </Form>
          <Divider className="border-gray-100 dark:border-zinc-800" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <div>
              <Text strong className="block text-sm">Two-Factor Authentication</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Add an extra layer of security to your account.</Text>
            </div>
            <Button type="default" className="w-full sm:w-auto shrink-0">Enable 2FA</Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="mb-6">
        <Title level={2} className="!mb-1 text-2xl sm:text-3xl font-bold">Settings</Title>
        <Text className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Manage your account, preferences, theme, and integrations.</Text>
      </div>

      <Tabs defaultActiveKey="appearance" items={items} className="mt-4" />
    </motion.div>
  );
}
