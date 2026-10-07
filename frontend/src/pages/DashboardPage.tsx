import { Typography, Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { AlertOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const recentIncidents = [
    { id: 'INC-101', title: 'Database connection latency', status: 'In Progress', severity: 'High' },
    { id: 'INC-102', title: 'Payment gateway timeout', status: 'Resolved', severity: 'Critical' },
    { id: 'INC-103', title: 'Frontend assets missing', status: 'Open', severity: 'Medium' },
  ];

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Resolved') color = 'green';
        if (status === 'In Progress') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { 
      title: 'Severity', 
      dataIndex: 'severity', 
      key: 'severity',
      width: 110,
      render: (severity: string) => {
        let color = 'default';
        if (severity === 'Critical') color = 'red';
        if (severity === 'High') color = 'volcano';
        return <Tag color={color}>{severity}</Tag>;
      }
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="mb-6">
        <Title level={2} className="!mb-1 text-2xl sm:text-3xl font-bold">Dashboard</Title>
        <Text className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Overview of your system health and active incidents.</Text>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e] hover:shadow-md transition-shadow">
            <Statistic title="Active Incidents" value={2} prefix={<AlertOutlined className="text-red-500" />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e] hover:shadow-md transition-shadow">
            <Statistic title="Resolved Today" value={14} prefix={<CheckCircleOutlined className="text-green-500" />} />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e] hover:shadow-md transition-shadow">
            <Statistic title="System Status" value="Healthy" styles={{ content: { color: '#52c41a' } }} prefix={<SyncOutlined spin />} />
          </Card>
        </Col>
      </Row>

      <Title level={4} className="mb-4">Recent Incidents</Title>
      <div className="overflow-x-auto">
        <Table 
          dataSource={recentIncidents} 
          columns={columns} 
          rowKey="id" 
          pagination={false}
          scroll={{ x: 480 }}
          className="border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden"
        />
      </div>
    </motion.div>
  );
}
