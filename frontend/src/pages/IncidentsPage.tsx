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
      render: (text: string, record: Incident) => (
        <Button type="link" className="p-0 font-semibold" onClick={() => openViewModal(record)}>{text}</Button>
      ) 
    },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
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
      render: (severity: string) => {
        let color = 'default';
        if (severity === 'Critical') color = 'red';
        if (severity === 'High') color = 'volcano';
        return <Tag color={color}>{severity}</Tag>;
      }
    },
    { title: 'Assignee', dataIndex: 'assignee', key: 'assignee' },
    { title: 'Created', dataIndex: 'created', key: 'created' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-1">Incidents</Title>
          <Text className="text-gray-500">Manage and track all ongoing system incidents.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsReportModalVisible(true)}>
          Report Incident
        </Button>
      </div>

      <div className="mb-4 flex gap-4">
        <Input 
          placeholder="Search by ID, title, or assignee..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="max-w-md" 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table 
        dataSource={filteredIncidents} 
        columns={columns} 
        rowKey="id" 
        className="border border-gray-100 rounded-lg shadow-sm"
        pagination={{ pageSize: 10 }}
      />

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
        destroyOnClose
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
          
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
        width={600}
      >
        {selectedIncident && (
          <div className="mt-4 flex flex-col gap-6">
            <div>
              <Title level={4} className="!mb-2">{selectedIncident.title}</Title>
              <Space size="middle">
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
                <Text type="secondary">{selectedIncident.created}</Text>
              </Space>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Assignee">{selectedIncident.assignee}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedIncident.description || 'No description provided.'}</Descriptions.Item>
            </Descriptions>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Text strong className="block mb-3">Update Status</Text>
              <Space>
                <Button 
                  type={selectedIncident.status === 'Open' ? 'primary' : 'default'}
                  onClick={() => handleUpdateStatus('Open')}
                >Open</Button>
                <Button 
                  type={selectedIncident.status === 'In Progress' ? 'primary' : 'default'}
                  className={selectedIncident.status === 'In Progress' ? 'bg-orange-500 text-white border-none' : ''}
                  onClick={() => handleUpdateStatus('In Progress')}
                >In Progress</Button>
                <Button 
                  type={selectedIncident.status === 'Resolved' ? 'primary' : 'default'}
                  className={selectedIncident.status === 'Resolved' ? 'bg-green-500 text-white border-none' : ''}
                  onClick={() => handleUpdateStatus('Resolved')}
                >Resolve</Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
