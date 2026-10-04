import { Typography, Tabs, Form, Input, Button, Switch, Divider, Card } from 'antd';
import { UserOutlined, BellOutlined, SecurityScanOutlined, ApiOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('Saved settings:', values);
  };

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile
        </span>
      ),
      children: (
        <Card bordered={false} className="shadow-sm">
          <Title level={4} className="mb-4">Personal Information</Title>
          <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ name: 'Admin User', email: 'admin@opsai.com' }}>
            <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Role" name="role">
              <Input disabled defaultValue="Administrator" />
            </Form.Item>
            <Button type="primary" htmlType="submit">Save Changes</Button>
          </Form>
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
        <Card bordered={false} className="shadow-sm">
          <Title level={4} className="mb-4">Notification Preferences</Title>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="block">Email Alerts</Text>
                <Text className="text-gray-500">Receive email notifications for new high-severity incidents.</Text>
              </div>
              <Switch defaultChecked />
            </div>
            <Divider className="my-0" />
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="block">Slack Messages</Text>
                <Text className="text-gray-500">Get direct messages on Slack for incidents assigned to you.</Text>
              </div>
              <Switch defaultChecked />
            </div>
            <Divider className="my-0" />
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="block">Daily Digest</Text>
                <Text className="text-gray-500">Receive a daily summary of resolved and open incidents.</Text>
              </div>
              <Switch />
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
        <Card bordered={false} className="shadow-sm">
          <Title level={4} className="mb-4">Connected Services</Title>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="block">PagerDuty</Text>
                <Text className="text-gray-500">Sync on-call schedules and trigger escalation policies.</Text>
              </div>
              <Button type="default">Configure</Button>
            </div>
            <Divider className="my-0" />
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="block">Datadog</Text>
                <Text className="text-gray-500">Ingest alerts and metrics automatically.</Text>
              </div>
              <Button type="default">Configure</Button>
            </div>
            <Divider className="my-0" />
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="block">GitHub</Text>
                <Text className="text-gray-500">Link PRs and commits to incident root cause analyses.</Text>
              </div>
              <Button type="default">Configure</Button>
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
        <Card bordered={false} className="shadow-sm">
          <Title level={4} className="mb-4">Security Settings</Title>
          <Form layout="vertical">
            <Form.Item label="Current Password">
              <Input.Password />
            </Form.Item>
            <Form.Item label="New Password">
              <Input.Password />
            </Form.Item>
            <Form.Item label="Confirm New Password">
              <Input.Password />
            </Form.Item>
            <Button type="primary">Update Password</Button>
          </Form>
          <Divider />
          <div className="flex items-center justify-between mt-6">
            <div>
              <Text strong className="block">Two-Factor Authentication</Text>
              <Text className="text-gray-500">Add an extra layer of security to your account.</Text>
            </div>
            <Button type="default">Enable 2FA</Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="mb-6">
        <Title level={2} className="!mb-1">Settings</Title>
        <Text className="text-gray-500">Manage your account, preferences, and integrations.</Text>
      </div>

      <Tabs defaultActiveKey="profile" items={items} className="mt-4" />
    </motion.div>
  );
}
