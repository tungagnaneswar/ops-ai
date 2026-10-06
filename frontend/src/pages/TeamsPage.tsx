import { useState } from 'react';
import { Typography, Card, Row, Col, Avatar, Button, Modal, Form, Input, InputNumber, message, List, Tag } from 'antd';
import { PlusOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Team {
  id: number;
  name: string;
  description: string;
  members: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'SRE Team', description: 'Site Reliability Engineering and Platform infrastructure.', members: 8 },
    { id: 2, name: 'Payments Squad', description: 'Handles all payment gateway integration and financial services.', members: 5 },
    { id: 3, name: 'Frontend Core', description: 'Maintains core UI components and frontend architecture.', members: 6 },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const [form] = Form.useForm();

  const handleCreateTeam = (values: any) => {
    const newTeam: Team = {
      id: Date.now(),
      name: values.name,
      description: values.description,
      members: values.members || 1,
    };
    
    setTeams([...teams, newTeam]);
    setIsModalVisible(false);
    form.resetFields();
    message.success('Team created successfully!');
  };

  const openViewModal = (team: Team) => {
    setSelectedTeam(team);
    setIsViewModalVisible(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Title level={2} className="!mb-1 text-2xl sm:text-3xl font-bold">Teams</Title>
          <Text className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Manage on-call schedules, escalations, and team members.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} className="w-full sm:w-auto">
          Create Team
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {teams.map(team => (
          <Col xs={24} sm={12} lg={8} key={team.id}>
            <motion.div whileHover={{ y: -4 }}>
              <Card 
                className="shadow-sm border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e] hover:shadow-md transition-all h-full flex flex-col"
                title={<span className="dark:text-gray-100 font-semibold">{team.name}</span>}
                extra={<Button type="link" className="p-0 h-auto" onClick={() => openViewModal(team)}>View</Button>}
              >
                <Text className="text-gray-500 dark:text-gray-400 block mb-6 min-h-[44px] text-sm">
                  {team.description}
                </Text>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <Avatar.Group maxCount={4} size="small">
                    {Array.from({ length: Math.min(team.members, 10) }).map((_, i) => (
                      <Avatar key={i} icon={<UserOutlined />} />
                    ))}
                  </Avatar.Group>
                  <Text className="text-gray-400 text-xs sm:text-sm">{team.members} Members</Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Create Team Modal */}
      <Modal
        title="Create New Team"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
        style={{ maxWidth: '95vw' }}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTeam} className="mt-4">
          <Form.Item 
            name="name" 
            label="Team Name" 
            rules={[{ required: true, message: 'Please enter a team name' }]}
          >
            <Input placeholder="e.g., Backend Services" />
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea placeholder="What does this team do?" rows={3} />
          </Form.Item>
          
          <Form.Item 
            name="members" 
            label="Initial Member Count" 
            initialValue={1}
          >
            <InputNumber min={1} max={100} className="w-full" />
          </Form.Item>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Create Team</Button>
          </div>
        </Form>
      </Modal>

      {/* View Team Modal */}
      <Modal
        title={selectedTeam?.name}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        style={{ maxWidth: '95vw' }}
        width={550}
      >
        {selectedTeam && (
          <div className="mt-4">
            <Text className="text-gray-600 dark:text-gray-300 block mb-4 text-sm sm:text-base">{selectedTeam.description}</Text>
            
            <div className="mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <Text strong className="block text-blue-800 dark:text-blue-300 mb-1 text-xs uppercase tracking-wide">Current On-Call</Text>
                <div className="flex items-center gap-2">
                  <Avatar icon={<UserOutlined />} size="small" className="bg-blue-500" />
                  <Text className="dark:text-gray-200 font-medium">Jane Doe</Text>
                </div>
              </div>
              <Tag icon={<ClockCircleOutlined />} color="blue" className="m-0">Active until 8:00 AM</Tag>
            </div>

            <Title level={5} className="!mb-3 text-sm font-semibold">Team Members ({selectedTeam.members})</Title>
            <List
              itemLayout="horizontal"
              dataSource={Array.from({ length: Math.min(selectedTeam.members, 5) }).map((_, i) => i)}
              renderItem={(item) => (
                <List.Item className="!py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} className="bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-300" />}
                    title={<Text className="text-sm">Engineer {item + 1}</Text>}
                    description={<span className="text-gray-500 dark:text-gray-400 text-xs">Software Engineer</span>}
                  />
                </List.Item>
              )}
            />
            {selectedTeam.members > 5 && (
              <Text className="text-gray-400 block mt-2 text-center text-xs">
                + {selectedTeam.members - 5} more members...
              </Text>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
