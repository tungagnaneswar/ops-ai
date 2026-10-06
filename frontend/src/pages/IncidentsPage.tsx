import { useState, useMemo } from 'react';
import { Typography, Table, Tag, Button, Input, Modal, Form, Select, message, Descriptions, Space, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, AlertOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  assignee: string;
  created: string;
  description?: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([
    { id: 'INC-101', title: 'Database connection latency', status: 'In Progress', severity: 'High', assignee: 'Jane Doe', created: '2 mins ago', description: 'Observed intermittent connection drops to the primary postgres cluster.' },
    { id: 'INC-102', title: 'Payment gateway timeout', status: 'Resolved', severity: 'Critical', assignee: 'John Smith', created: '1 hour ago', description: 'Stripe API requests timing out after 30s. Rollback of last deployment fixed the issue.' },
    { id: 'INC-103', title: 'Frontend assets missing', status: 'Open', severity: 'Medium', assignee: 'Unassigned', created: '3 hours ago', description: 'CDN is returning 404s for some JS chunks.' },
    { id: 'INC-104', title: 'Redis cache eviction issues', status: 'Open', severity: 'Medium', assignee: 'Jane Doe', created: '4 hours ago', description: 'Memory usage hit 100%, causing massive key evictions.' },
  ]);

  const [searchText, setSearchText] = useState('');
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  const [form] = Form.useForm();

  const handleReportIncident = (values: any) => {
    const newIncident: Incident = {
      id: `INC-${100 + incidents.length + 1}`,
      title: values.title,
      description: values.description,
      status: 'Open',
      severity: values.severity,
      assignee: values.assignee || 'Unassigned',
      created: 'Just now',
    };
    
    setIncidents([newIncident, ...incidents]);
    setIsReportModalVisible(false);
    form.resetFields();
    message.success('Incident reported successfully!');
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedIncident) return;
    setIncidents(incidents.map(inc => inc.id === selectedIncident.id ? { ...inc, status: newStatus } : inc));
    setSelectedIncident({ ...selectedIncident, status: newStatus });
    message.success(`Status updated to ${newStatus}`);
  };

  const openViewModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsViewModalVisible(true);
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => 
      inc.title.toLowerCase().includes(searchText.toLowerCase()) || 
      inc.id.toLowerCase().includes(searchText.toLowerCase()) ||
      inc.assignee.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [incidents, searchText]);

  const columns = [
    { 
      title: 'Incident ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 110,
      render: (text: string, record: Incident) => (
        <Button type="link" className="p-0 font-semibold text-blue-600" onClick={() => openViewModal(record)}>{text}</Button>
      ) 
    },
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
      width: 100,
      render: (severity: string) => {
        let color = 'default';
        if (severity === 'Critical') color = 'red';
        if (severity === 'High') color = 'volcano';
        return <Tag color={color}>{severity}</Tag>;
      }
    },
    { title: 'Assignee', dataIndex: 'assignee', key: 'assignee', width: 130 },
    { title: 'Created', dataIndex: 'created', key: 'created', width: 110 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Title level={2} className="!mb-1 text-2xl sm:text-3xl font-bold">Incidents</Title>
          <Text className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Manage and track all ongoing system incidents.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsReportModalVisible(true)} className="w-full sm:w-auto">
          Report Incident
        </Button>
      </div>

      <div className="mb-4">
        <Input 
          placeholder="Search by ID, title, or assignee..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="w-full sm:max-w-md" 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <div className="overflow-x-auto">
        <Table 
          dataSource={filteredIncidents} 
          columns={columns} 
          rowKey="id" 
          scroll={{ x: 680 }}
          className="border border-gray-100 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden"
          pagination={{ pageSize: 10, responsive: true }}
        />
      </div>

      {/* Report Incident Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertOutlined className="text-red-500" />
            <span>Report New Incident</span>
          </div>
        }
        open={isReportModalVisible}
        onCancel={() => setIsReportModalVisible(false)}
        footer={null}
        destroyOnHidden
        style={{ maxWidth: '95vw' }}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleReportIncident} className="mt-4">
          <Form.Item 
            name="title" 
            label="Incident Title" 
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Briefly describe the issue..." />
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please provide details' }]}
          >
            <TextArea placeholder="Provide detailed context, symptoms, and impact..." rows={4} />
          </Form.Item>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="severity" 
                label="Severity" 
                rules={[{ required: true }]}
                initialValue="Medium"
              >
                <Select>
                  <Option value="Critical">Critical</Option>
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="assignee" label="Assign To" initialValue="Unassigned">
                <Select>
                  <Option value="Unassigned">Unassigned</Option>
                  <Option value="Jane Doe">Jane Doe</Option>
                  <Option value="John Smith">John Smith</Option>
                  <Option value="On-Call Engineer">On-Call Engineer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsReportModalVisible(false)}>Cancel</Button>
            <Button type="primary" danger htmlType="submit">Submit Incident</Button>
          </div>
        </Form>
      </Modal>

      {/* View Incident Modal */}
      <Modal
        title={`Incident Details - ${selectedIncident?.id}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        style={{ maxWidth: '95vw' }}
        width={600}
      >
        {selectedIncident && (
          <div className="mt-4 flex flex-col gap-5">
            <div>
              <Title level={4} className="!mb-2 text-base sm:text-lg">{selectedIncident.title}</Title>
              <Space wrap size="small">
                <Tag color={
                  selectedIncident.status === 'Resolved' ? 'green' : 
                  selectedIncident.status === 'In Progress' ? 'orange' : 'blue'
                }>
                  {selectedIncident.status}
                </Tag>
                <Tag color={
                  selectedIncident.severity === 'Critical' ? 'red' :
                  selectedIncident.severity === 'High' ? 'volcano' : 'default'
                }>
                  {selectedIncident.severity}
                </Tag>
                <Text type="secondary" className="text-xs">{selectedIncident.created}</Text>
              </Space>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Assignee">{selectedIncident.assignee}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedIncident.description || 'No description provided.'}</Descriptions.Item>
            </Descriptions>

            <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
              <Text strong className="block mb-2 text-sm">Update Status</Text>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="small"
                  type={selectedIncident.status === 'Open' ? 'primary' : 'default'}
                  onClick={() => handleUpdateStatus('Open')}
                >Open</Button>
                <Button 
                  size="small"
                  type={selectedIncident.status === 'In Progress' ? 'primary' : 'default'}
                  className={selectedIncident.status === 'In Progress' ? 'bg-orange-500 text-white border-none' : ''}
                  onClick={() => handleUpdateStatus('In Progress')}
                >In Progress</Button>
                <Button 
                  size="small"
                  type={selectedIncident.status === 'Resolved' ? 'primary' : 'default'}
                  className={selectedIncident.status === 'Resolved' ? 'bg-green-500 text-white border-none' : ''}
                  onClick={() => handleUpdateStatus('Resolved')}
                >Resolve</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
