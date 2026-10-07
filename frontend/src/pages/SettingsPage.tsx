import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Divider,
  Card,
  message,
  Spin,
  Tag,
  Table,
  Popconfirm,
  Tooltip,
  Space,
  Badge,
  Modal,
  Row,
  Col,
  Avatar,
  Dropdown,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SecurityScanOutlined,
  ApiOutlined,
  BgColorsOutlined,
  DesktopOutlined,
  MobileOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DisconnectOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  LockOutlined,
  KeyOutlined,
  CrownOutlined,
  CopyOutlined,
  CheckCircleFilled,
  MailOutlined,
  IdcardOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  CalendarOutlined,
  DownOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { userApi, sessionApi, type Session, type UserProfile } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context';

const { Title, Text } = Typography;

interface AvatarTheme {
  id: string;
  name: string;
  gradientClass: string;
  accentColor: string;
}

const AVATAR_THEMES: AvatarTheme[] = [
  { id: 'blue', name: 'Cyber Blue', gradientClass: 'from-blue-600 via-indigo-600 to-cyan-500', accentColor: '#2563eb' },
  { id: 'violet', name: 'Electric Violet', gradientClass: 'from-purple-600 via-indigo-600 to-pink-500', accentColor: '#7c3aed' },
  { id: 'emerald', name: 'Emerald Tech', gradientClass: 'from-emerald-600 via-teal-600 to-cyan-600', accentColor: '#059669' },
  { id: 'amber', name: 'Solar Amber', gradientClass: 'from-amber-500 via-orange-600 to-red-500', accentColor: '#d97706' },
  { id: 'rose', name: 'Neon Rose', gradientClass: 'from-rose-600 via-pink-600 to-purple-600', accentColor: '#e11d48' },
];

const ON_CALL_STATUS_CONFIG: Record<string, { label: string; tagColor: string; dotColor: string; description: string }> = {
  'on-call': { label: 'On-Call (Primary Tier-1)', tagColor: 'green', dotColor: '#10b981', description: 'Active first-responder for Sev-1/Sev-2 incidents' },
  'war-room': { label: 'In Incident War Room', tagColor: 'orange', dotColor: '#f59e0b', description: 'Actively resolving live service incidents' },
  'available': { label: 'Available / Standby', tagColor: 'blue', dotColor: '#3b82f6', description: 'Ready for escalation assignment' },
  'dnd': { label: 'Do Not Disturb / Focus', tagColor: 'default', dotColor: '#6b7280', description: 'Deep engineering focus or off-duty' },
};

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('profile');
  const { theme, resolvedTheme } = useTheme();

  // Full profile data state
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  // Extended custom profile preferences (synced to local storage)
  const [displayTitle, setDisplayTitle] = useState(() => localStorage.getItem('opsai_display_title') || 'Lead Site Reliability Engineer');
  const [department, setDepartment] = useState(() => localStorage.getItem('opsai_department') || 'Platform Infrastructure & Cloud Reliability');
  const [slack, setSlack] = useState(() => localStorage.getItem('opsai_slack') || '@ops-lead');
  const [bio, setBio] = useState(() => localStorage.getItem('opsai_bio') || 'Overseeing multi-region Kubernetes core clusters, automated AI self-healing workflows, and incident triage.');
  const [cluster, setCluster] = useState(() => localStorage.getItem('opsai_cluster') || 'k8s-prod-us-east-1 (Primary)');
  const [avatarTheme, setAvatarTheme] = useState(() => localStorage.getItem('opsai_avatar_theme') || 'blue');
  const [onCallStatus, setOnCallStatus] = useState(() => localStorage.getItem('opsai_oncall_status') || 'on-call');

  // Watch fields for live reactive preview in the hero banner
  const watchedFirstName = Form.useWatch('firstName', form);
  const watchedLastName = Form.useWatch('lastName', form);
  const watchedTitle = Form.useWatch('title', form);
  const watchedDepartment = Form.useWatch('department', form);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await userApi.getProfile();
        setProfileData(profile);
        form.setFieldsValue({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          username: profile.username,
          email: profile.email,
          role: profile.roles && profile.roles.length > 0 ? profile.roles.join(', ') : 'Operator',
          title: displayTitle,
          department: department,
          slack: slack,
          bio: bio,
          cluster: cluster,
        });
      } catch {
        // Fallback to localStorage info if backend offline
        const localUser = localStorage.getItem('user');
        const username = localStorage.getItem('username') || 'Operator';
        let fallbackProfile: UserProfile = {
          id: 1,
          username,
          email: 'operator@opsai.internal',
          firstName: 'Platform',
          lastName: 'Operator',
          roles: ['Operator'],
          status: 'ACTIVE',
        };

        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            fallbackProfile = {
              id: parsed.id || 1,
              username: parsed.username || username,
              email: parsed.email || 'operator@opsai.internal',
              firstName: parsed.firstName || 'Platform',
              lastName: parsed.lastName || 'Operator',
              roles: ['Operator'],
              status: 'ACTIVE',
            };
          } catch {
            // keep default fallback
          }
        }

        setProfileData(fallbackProfile);
        form.setFieldsValue({
          firstName: fallbackProfile.firstName,
          lastName: fallbackProfile.lastName,
          username: fallbackProfile.username,
          email: fallbackProfile.email,
          role: 'Operator',
          title: displayTitle,
          department: department,
          slack: slack,
          bio: bio,
          cluster: cluster,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [form, displayTitle, department, slack, bio, cluster]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await sessionApi.getActiveSessions();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch {
      // Graceful fallback for offline demo
      setSessions([
        {
          id: 1,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          browser: getBrowserFromUA(navigator.userAgent),
          os: getOSFromUA(navigator.userAgent),
          device: 'Desktop',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          current: true,
        },
      ]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const firstName = (values.firstName || '').trim();
      const lastName = (values.lastName || '').trim();
      const newTitle = (values.title || '').trim() || displayTitle;
      const newDept = (values.department || '').trim() || department;
      const newSlack = (values.slack || '').trim() || slack;
      const newBio = (values.bio || '').trim() || bio;
      const newCluster = (values.cluster || '').trim() || cluster;

      // Only display names are mutable on backend. Username and Email are permanently locked credentials.
      await userApi.updateProfile({
        firstName,
        lastName,
      });

      // Persist workspace operational preferences locally
      localStorage.setItem('opsai_display_title', newTitle);
      localStorage.setItem('opsai_department', newDept);
      localStorage.setItem('opsai_slack', newSlack);
      localStorage.setItem('opsai_bio', newBio);
      localStorage.setItem('opsai_cluster', newCluster);

      setDisplayTitle(newTitle);
      setDepartment(newDept);
      setSlack(newSlack);
      setBio(newBio);
      setCluster(newCluster);

      // Update local profile state immediately
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              firstName,
              lastName,
            }
          : null
      );

      message.success('Profile details updated successfully!');
    } catch (error: any) {
      message.error(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (values: any) => {
    setPasswordUpdating(true);
    try {
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Account password updated successfully!');
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleRevokeSession = async (id: number) => {
    setRevokingId(id);
    try {
      await sessionApi.revokeSession(id);
      message.success('Session revoked successfully.');
      await loadSessions();
    } catch (err: any) {
      message.error(err.message || 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setRevokingAll(true);
    try {
      await sessionApi.revokeAllOtherSessions();
      message.success('All other sessions terminated successfully.');
      await loadSessions();
    } catch (err: any) {
      message.error(err.message || 'Failed to terminate other sessions.');
    } finally {
      setRevokingAll(false);
    }
  };

  const handleStatusChange = (statusKey: string) => {
    setOnCallStatus(statusKey);
    localStorage.setItem('opsai_oncall_status', statusKey);
    const cfg = ON_CALL_STATUS_CONFIG[statusKey];
    message.success(`Status set to: ${cfg ? cfg.label : statusKey}`);
  };

  const handleAvatarThemeChange = (themeId: string) => {
    setAvatarTheme(themeId);
    localStorage.setItem('opsai_avatar_theme', themeId);
    const themeObj = AVATAR_THEMES.find((t) => t.id === themeId);
    if (themeObj) {
      message.success(`Avatar accent changed to ${themeObj.name}`);
    }
  };

  const copyText = (text?: string, label: string = 'Item') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Derive dynamic user display values with live typing feedback
  const liveFirstName = watchedFirstName !== undefined ? watchedFirstName : (profileData?.firstName || '');
  const liveLastName = watchedLastName !== undefined ? watchedLastName : (profileData?.lastName || '');
  const userFullName = `${liveFirstName} ${liveLastName}`.trim() || profileData?.username || 'Operator';
  const roleName = profileData?.roles && profileData.roles.length > 0 ? profileData.roles[0] : 'OPERATOR';
  const liveTitle = watchedTitle !== undefined && watchedTitle !== '' ? watchedTitle : displayTitle;
  const liveDepartment = watchedDepartment !== undefined && watchedDepartment !== '' ? watchedDepartment : department;
  const currentAvatarTheme = AVATAR_THEMES.find((t) => t.id === avatarTheme) || AVATAR_THEMES[0];
  const currentStatusConfig = ON_CALL_STATUS_CONFIG[onCallStatus] || ON_CALL_STATUS_CONFIG['on-call'];

  const userTimezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC';
  const userTimezoneOffset = (() => {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
    return `UTC${sign}${hours}:${minutes}`;
  })();

  const onCallMenuItems: MenuProps['items'] = [
    {
      key: 'on-call',
      label: (
        <div className="py-1">
          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            On-Call (Primary Tier-1)
          </div>
          <div className="text-[11px] text-gray-400">Active first-responder for Sev-1/Sev-2 incidents</div>
        </div>
      ),
      onClick: () => handleStatusChange('on-call'),
    },
    {
      key: 'war-room',
      label: (
        <div className="py-1">
          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            In Incident War Room
          </div>
          <div className="text-[11px] text-gray-400">Actively resolving live service disruption</div>
        </div>
      ),
      onClick: () => handleStatusChange('war-room'),
    },
    {
      key: 'available',
      label: (
        <div className="py-1">
          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Available / Standby
          </div>
          <div className="text-[11px] text-gray-400">Ready for escalation assignment</div>
        </div>
      ),
      onClick: () => handleStatusChange('available'),
    },
    {
      key: 'dnd',
      label: (
        <div className="py-1">
          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Do Not Disturb / Focus
          </div>
          <div className="text-[11px] text-gray-400">Deep engineering focus or off-duty</div>
        </div>
      ),
      onClick: () => handleStatusChange('dnd'),
    },
  ];

  const sessionColumns: ColumnsType<Session> = [
    {
      title: 'Device & Client',
      key: 'device',
      render: (_, record) => {
        const isMobile =
          record.device?.toLowerCase() === 'mobile' ||
          record.os?.toLowerCase().includes('android') ||
          record.os?.toLowerCase().includes('ios');
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                record.current
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {isMobile ? <MobileOutlined className="text-lg" /> : <DesktopOutlined className="text-lg" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  {record.browser || 'Web Browser'}
                </Text>
                {record.os && (
                  <Tag className="m-0 text-[11px] font-normal px-1.5 py-0">
                    {record.os}
                  </Tag>
                )}
              </div>
              <Tooltip title={record.userAgent || 'No user-agent info'}>
                <span className="text-xs text-gray-400 dark:text-gray-500 block max-w-[200px] sm:max-w-xs truncate cursor-help">
                  {record.userAgent || 'Standard Web Client'}
                </span>
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: 'IP Address',
      key: 'ipAddress',
      render: (_, record) => {
        const isLocal =
          record.ipAddress === '127.0.0.1' ||
          record.ipAddress === 'localhost' ||
          record.ipAddress === '::1';
        return (
          <div>
            <code className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-gray-800 dark:text-gray-200">
              {record.ipAddress || '127.0.0.1'}
            </code>
            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
              <GlobalOutlined className="text-[10px]" />
              {isLocal ? 'Localhost / Internal' : 'Remote Network'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Signed In',
      key: 'createdAt',
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-gray-800 dark:text-gray-200 font-medium">
            {formatDate(record.createdAt)}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
            <ClockCircleOutlined className="text-[10px]" />
            Expires {formatDate(record.expiresAt)}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) =>
        record.current ? (
          <Tag color="success" className="px-2.5 py-0.5 font-medium flex items-center gap-1 justify-center w-fit mx-auto">
            <Badge status="processing" color="#52c41a" />
            Current Device
          </Tag>
        ) : (
          <Tag color="blue" className="px-2.5 py-0.5 font-medium flex items-center gap-1 justify-center w-fit mx-auto">
            <Badge status="default" color="#1890ff" />
            Active
          </Tag>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => {
        if (record.current) {
          return (
            <Tag className="text-gray-400 border-dashed m-0 text-xs">
              This Session
            </Tag>
          );
        }
        return (
          <Popconfirm
            title="Terminate this session?"
            description="The user on this device will be logged out immediately."
            onConfirm={() => handleRevokeSession(record.id)}
            okText="Terminate"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: revokingId === record.id }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={revokingId === record.id}
              className="text-xs"
            >
              Terminate
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

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
        <div className="space-y-6">
          {/* 1. Hero Identity Banner with Mesh Glow */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 p-6 sm:p-8 transition-all">
            {/* Ambient radial mesh orbs */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />

            {/* Cover top utilities bar */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-200/90 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>OpsAI Autonomous Cloud</span>
                <span className="opacity-40">•</span>
                <span>Cluster: {cluster}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Live On-Call Status Dropdown */}
                <Dropdown menu={{ items: onCallMenuItems }} trigger={['click']} placement="bottomRight">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
                  >
                    <span className="relative flex h-2 w-2">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: currentStatusConfig.dotColor }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-2 w-2"
                        style={{ backgroundColor: currentStatusConfig.dotColor }}
                      />
                    </span>
                    <span>{currentStatusConfig.label}</span>
                    <DownOutlined className="text-[10px] opacity-70 ml-0.5" />
                  </button>
                </Dropdown>

                {/* Quick Password Modal Button */}
                <Button
                  ghost
                  size="small"
                  icon={<KeyOutlined />}
                  onClick={() => {
                    passwordForm.resetFields();
                    setIsPasswordModalOpen(true);
                  }}
                  className="border-white/30 text-white hover:!border-white hover:!text-white backdrop-blur-sm"
                >
                  Password
                </Button>

                {/* Active Sessions Shortcut */}
                <Button
                  ghost
                  size="small"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => setActiveTabKey('sessions')}
                  className="border-white/30 text-white hover:!border-white hover:!text-white backdrop-blur-sm"
                >
                  Sessions ({sessions.length})
                </Button>
              </div>
            </div>

            {/* Main identity card content */}
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar & Palette switcher */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative">
                    <Avatar
                      size={{ xs: 76, sm: 88, md: 96 }}
                      className={`bg-gradient-to-tr ${currentAvatarTheme.gradientClass} text-white font-extrabold text-3xl sm:text-4xl shadow-2xl ring-4 ring-white/20 select-none`}
                    >
                      {getInitials(liveFirstName, liveLastName, profileData?.username)}
                    </Avatar>
                    <span
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center"
                      style={{ backgroundColor: currentStatusConfig.dotColor }}
                      title={currentStatusConfig.label}
                    />
                  </div>

                  {/* Avatar Accent Palette dots */}
                  <div className="flex items-center gap-1.5 mt-2.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    {AVATAR_THEMES.map((t) => (
                      <Tooltip key={t.id} title={`${t.name} Accent`}>
                        <button
                          type="button"
                          onClick={() => handleAvatarThemeChange(t.id)}
                          className={`w-3 h-3 rounded-full transition-transform cursor-pointer ${
                            avatarTheme === t.id
                              ? 'scale-125 ring-2 ring-white shadow-sm'
                              : 'opacity-50 hover:opacity-100 hover:scale-110'
                          }`}
                          style={{ backgroundColor: t.accentColor }}
                          aria-label={t.name}
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Identity Info Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-0 flex items-center gap-2">
                      {userFullName}
                      <Tooltip title="Verified Operator Identity">
                        <CheckCircleFilled className="text-sky-400 text-xl" />
                      </Tooltip>
                    </h1>
                    <Tag
                      color="green"
                      className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border-0 bg-emerald-500/20 text-emerald-300 backdrop-blur-sm"
                    >
                      Active Operator
                    </Tag>
                  </div>

                  <div className="text-sm sm:text-base font-medium text-blue-200/90 flex flex-wrap items-center gap-2">
                    <span>{liveTitle}</span>
                    <span className="opacity-40">•</span>
                    <span className="text-indigo-200/90">{liveDepartment}</span>
                  </div>

                  {/* Metadata Chips Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-mono text-slate-200">
                      <span>@{profileData?.username || 'operator'}</span>
                      <Tooltip title="Copy username">
                        <button
                          type="button"
                          onClick={() => copyText(`@${profileData?.username || 'operator'}`, 'Username')}
                          className="text-slate-400 hover:text-white cursor-pointer ml-0.5"
                        >
                          <CopyOutlined className="text-[11px]" />
                        </button>
                      </Tooltip>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      <MailOutlined className="text-blue-300" />
                      <span className="truncate max-w-[200px] sm:max-w-none">{profileData?.email || 'operator@opsai.internal'}</span>
                      <Tooltip title="Primary credential locked post-registration">
                        <LockOutlined className="text-[10px] text-amber-300 ml-0.5" />
                      </Tooltip>
                    </div>

                    <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-200 px-2.5 py-1 rounded-md border border-blue-400/30 uppercase font-semibold text-[11px]">
                      <CrownOutlined className="text-amber-300" />
                      {roleName}
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/10 text-slate-300 text-[11px]">
                      <GlobalOutlined className="text-sky-300" />
                      <span>{userTimezoneOffset} ({userTimezone})</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/10 text-slate-300 text-[11px]">
                      <CalendarOutlined className="text-indigo-300" />
                      <span>Joined {formatDate(profileData?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Holographic Operator Badge */}
              <div className="w-full lg:w-auto shrink-0 bg-white/10 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-5 rounded-xl border border-white/20 shadow-lg flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 text-[10px] tracking-wider uppercase font-bold text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <CloudServerOutlined />
                    Digital Operator Token
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="font-mono text-xs text-sky-200 font-semibold">
                    {truncateUuid(profileData?.publicId || String(profileData?.id || 'OPS-USR-01'))}
                  </span>
                  <Tooltip title="Copy Public UUID">
                    <button
                      type="button"
                      onClick={() => copyText(profileData?.publicId || String(profileData?.id || ''), 'Public Identifier')}
                      className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      <CopyOutlined className="text-xs" />
                    </button>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Clearance Level</span>
                    <span className="font-semibold text-white">Tier-1 Command</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Active Sessions</span>
                    <span className="font-semibold text-emerald-300">{sessions.length} Device{sessions.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Highlight Metric Cards HUD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500/50 transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
                <CrownOutlined className="text-xl" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">System Clearance</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate uppercase mt-0.5">
                  {roleName}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Tier-1 Autonomous Remediation</div>
              </div>
            </div>

            <div
              onClick={() => setActiveTabKey('sessions')}
              className="p-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/40 group-hover:scale-105 transition-transform">
                <SafetyCertificateOutlined className="text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide flex items-center justify-between">
                  <span>Active Sessions</span>
                  <span className="text-[10px] text-indigo-500 font-semibold group-hover:underline">Manage &rarr;</span>
                </div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mt-0.5">
                  {sessions.length} {sessions.length === 1 ? 'Active Device' : 'Active Devices'}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  PostgreSQL Session Store
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
                <ThunderboltOutlined className="text-xl" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Operational SLA</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mt-0.5">
                  99.98% On-Call SLA
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">&lt; 5m Incident Response Target</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-purple-400 dark:hover:border-purple-500/50 transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/40">
                <LockOutlined className="text-xl" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Identity Protection</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mt-0.5">
                  Verified & Immutable
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">BCrypt Salted • Protected Email</div>
              </div>
            </div>
          </div>

          {/* 3. Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Personal Details Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <Title level={4} className="!mb-0.5 text-base sm:text-lg">Display & Workspace Profile</Title>
                    <Text className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                      Customized display information is visible to other engineers across active incident war rooms, AI diagnostic summaries, and post-mortems.
                    </Text>
                  </div>
                  <Tag color="blue" className="text-xs font-semibold px-2 py-0.5 m-0 self-start sm:self-auto shrink-0">
                    Live Reactive
                  </Tag>
                </div>

                {/* Important notice badge */}
                <div className="mb-6 p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                  <InfoCircleOutlined className="text-blue-500 mt-0.5 shrink-0" />
                  <span>
                    Your <strong>Username</strong> and <strong>Email Address</strong> are immutable authentication credentials and cannot be modified after registration to preserve platform audit integrity.
                  </span>
                </div>

                <Spin spinning={loading}>
                  <Form form={form} layout="vertical" onFinish={handleSave} className="space-y-4">
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="First Name"
                          name="firstName"
                          rules={[{ required: true, message: 'Please enter your first name' }]}
                        >
                          <Input prefix={<IdcardOutlined className="text-gray-400" />} placeholder="e.g. John" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Last Name"
                          name="lastName"
                          rules={[{ required: true, message: 'Please enter your last name' }]}
                        >
                          <Input placeholder="e.g. Doe" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Operational Role / Title" name="title">
                          <Input prefix={<CrownOutlined className="text-gray-400" />} placeholder="e.g. Lead Site Reliability Engineer" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Department / Engineering Unit" name="department">
                          <Input prefix={<TeamOutlined className="text-gray-400" />} placeholder="e.g. Platform Infrastructure & Cloud Reliability" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="flex items-center gap-1.5">
                              Username
                              <Tooltip title="Username is permanently assigned and cannot be altered">
                                <LockOutlined className="text-gray-400 text-xs" />
                              </Tooltip>
                            </span>
                          }
                          name="username"
                        >
                          <Input disabled prefix={<UserOutlined className="text-gray-400" />} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="flex items-center gap-1.5">
                              Primary Email Address
                              <Tooltip title="Primary credential - locked for account security">
                                <LockOutlined className="text-gray-400 text-xs" />
                              </Tooltip>
                            </span>
                          }
                          name="email"
                          extra={
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                              Account email cannot be modified after registration.
                            </span>
                          }
                        >
                          <Input disabled prefix={<MailOutlined className="text-gray-400" />} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Incident Escalation Contact / Slack" name="slack">
                          <Input placeholder="e.g. @ops-lead or Slack user ID" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Primary Cluster Scope" name="cluster">
                          <Input prefix={<ClusterOutlined className="text-gray-400" />} placeholder="e.g. k8s-prod-us-east-1" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Operator Bio & Scope of Responsibility" name="bio">
                      <Input.TextArea
                        rows={3}
                        placeholder="Brief summary of your infrastructure focus, cluster responsibilities, and automated remediation preferences..."
                        className="rounded-lg"
                      />
                    </Form.Item>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                      <Button
                        onClick={() => {
                          if (profileData) {
                            form.setFieldsValue({
                              firstName: profileData.firstName || '',
                              lastName: profileData.lastName || '',
                              title: displayTitle,
                              department: department,
                              slack: slack,
                              bio: bio,
                              cluster: cluster,
                            });
                          }
                        }}
                      >
                        Reset Changes
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={saving}
                        icon={<SaveOutlined />}
                        className="px-6 font-medium shadow-sm"
                      >
                        Save Profile Details
                      </Button>
                    </div>
                  </Form>
                </Spin>
              </Card>

              {/* Card 2: Operational Roster & Cluster Scope */}
              <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
                <Title level={4} className="!mb-1 text-base font-semibold">Operational Roster & Scope</Title>
                <Text className="text-xs text-gray-400 dark:text-gray-500 block mb-4">
                  High-availability clusters and incident channels linked to your account:
                </Text>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <div className="text-gray-400 dark:text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                      <ClusterOutlined className="text-blue-500" />
                      Primary Kubernetes Cluster
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {cluster}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Health: 100% Operational</div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <div className="text-gray-400 dark:text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                      <ClusterOutlined className="text-purple-500" />
                      Secondary Failover Cluster
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      k8s-prod-eu-west-1 (Active Standby)
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">Multi-AZ Replicated</div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <div className="text-gray-400 dark:text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                      <ThunderboltOutlined className="text-amber-500" />
                      AI Copilot Mode
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      Autonomous Runbook Execution
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">Level 4 Self-Healing Enabled</div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <div className="text-gray-400 dark:text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                      <BellOutlined className="text-sky-500" />
                      Escalation Channel
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      #ops-war-room-alpha
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">Direct Slack & PagerDuty Sync</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Col: Access Privileges, Security, & Digital ID Badge */}
            <div className="space-y-6">
              {/* Role Privileges Card */}
              <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
                <Title level={4} className="!mb-1 text-base font-semibold">Role Privileges</Title>
                <Text className="text-xs text-gray-400 dark:text-gray-500 block mb-4">
                  Authorizations granted by your workspace role:
                </Text>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Incident Lifecycle</span>
                    <Tag color="cyan" className="m-0 text-[11px] font-medium">Full Access</Tag>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Team Rosters</span>
                    <Tag color="blue" className="m-0 text-[11px] font-medium">Assign & View</Tag>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">AI Copilot Analysis</span>
                    <Tag color="purple" className="m-0 text-[11px] font-medium">Autonomous</Tag>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Cluster Telemetry</span>
                    <Tag color="green" className="m-0 text-[11px] font-medium">Live Stream</Tag>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Audit Telemetry</span>
                    <Tag color="default" className="m-0 text-[11px] font-medium">Read-Only</Tag>
                  </div>
                </div>
              </Card>

              {/* Security & Sessions Shortcut Card */}
              <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
                <Title level={4} className="!mb-1 text-base font-semibold">Security Quick Controls</Title>
                <Text className="text-xs text-gray-400 dark:text-gray-500 block mb-4">
                  Account authentication and active token controls:
                </Text>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">Account Password</div>
                      <div className="text-[11px] text-gray-400">Secured with BCrypt salt hash</div>
                    </div>
                    <Button
                      size="small"
                      icon={<KeyOutlined />}
                      onClick={() => {
                        passwordForm.resetFields();
                        setIsPasswordModalOpen(true);
                      }}
                      className="shrink-0 text-xs"
                    >
                      Change
                    </Button>
                  </div>

                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">Connected Sessions</div>
                      <div className="text-[11px] text-gray-400">{sessions.length} authorized device token(s)</div>
                    </div>
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      icon={<SafetyCertificateOutlined />}
                      onClick={() => setActiveTabKey('sessions')}
                      className="shrink-0 text-xs"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Digital Operator ID Card */}
              <Card
                variant="borderless"
                className="shadow-sm border border-gray-100 dark:border-zinc-800 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-blue-300 font-bold flex items-center gap-1.5">
                    <CloudServerOutlined />
                    OPSAI DIGITAL IDENTITY
                  </span>
                  <Tag color="cyan" className="m-0 text-[10px] uppercase font-bold">CLEARANCE 4</Tag>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">OPERATOR</span>
                    <span className="font-bold text-white text-sm">{userFullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">IDENTIFIER HASH</span>
                    <div className="flex items-center justify-between text-sky-200 text-xs">
                      <span>{profileData?.publicId || 'OPS-USR-CORP-9482'}</span>
                      <button
                        type="button"
                        onClick={() => copyText(profileData?.publicId || 'OPS-USR-CORP-9482', 'Identity Hash')}
                        className="text-slate-400 hover:text-white cursor-pointer ml-1"
                      >
                        <CopyOutlined className="text-[11px]" />
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>STATUS: ACTIVE DUTY</span>
                    <span className="text-emerald-400">SECURE ENCLAVE</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'sessions',
      label: (
        <span>
          <SafetyCertificateOutlined />
          Active Sessions
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Title level={4} className="!mb-0 text-lg sm:text-xl">Active Sessions & Devices</Title>
                  <Tag color="cyan" className="font-mono text-xs">{sessions.length} active</Tag>
                </div>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1 block">
                  Review browsers and devices currently signed in to your account. Terminate any unrecognized or old session to secure your account.
                </Text>
              </div>
              <Space wrap>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadSessions}
                  loading={sessionsLoading}
                >
                  Refresh
                </Button>
                {sessions.filter(s => !s.current).length > 0 && (
                  <Popconfirm
                    title="Terminate all other sessions?"
                    description="You will stay signed in on this device, but all other browsers and devices will be logged out."
                    onConfirm={handleRevokeAllOtherSessions}
                    okText="Terminate Others"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true, loading: revokingAll }}
                  >
                    <Button
                      danger
                      icon={<DisconnectOutlined />}
                      loading={revokingAll}
                    >
                      Terminate Other Sessions
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </div>

            {/* User-Centric Security Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <DesktopOutlined className="text-xl" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Current Device</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {sessions.find(s => s.current)?.browser || 'This Browser'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <CheckCircleOutlined className="text-xl" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Signed-In Devices</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {sessions.length} {sessions.length === 1 ? 'Device' : 'Devices'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <SafetyCertificateOutlined className="text-xl" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Session Protection</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Token Rotation Active
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions Table */}
            <Table
              dataSource={sessions}
              columns={sessionColumns}
              rowKey="id"
              loading={sessionsLoading}
              pagination={false}
              className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden"
              scroll={{ x: 600 }}
            />
          </Card>
        </div>
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
        <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
          <div className="mb-6">
            <Title level={4} className="!mb-1 text-lg sm:text-xl">Security Settings</Title>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Manage your credentials, active sessions, and additional security layers.
            </Text>
          </div>

          <div className="flex flex-col gap-6">
            {/* Account Password Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <KeyOutlined className="text-blue-500 text-xl mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <Text strong className="text-sm text-gray-900 dark:text-gray-100">Account Password</Text>
                    <Tag color="success" className="text-[11px] m-0">Active</Tag>
                  </div>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
                    Ensure your account is protected with a secure password. We recommend changing it periodically.
                  </Text>
                </div>
              </div>
              <Button
                type="default"
                onClick={() => {
                  passwordForm.resetFields();
                  setIsPasswordModalOpen(true);
                }}
                className="w-full sm:w-auto shrink-0 font-medium"
              >
                Change Password
              </Button>
            </div>

            {/* Quick Active Sessions shortcut */}
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <SafetyCertificateOutlined className="text-blue-500 text-xl mt-0.5" />
                <div>
                  <Text strong className="block text-sm text-gray-900 dark:text-gray-100">Active Sessions Management</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    You currently have {sessions.length} active login session{sessions.length > 1 ? 's' : ''}.
                  </Text>
                </div>
              </div>
              <Button
                type="primary"
                ghost
                size="small"
                onClick={() => setActiveTabKey('sessions')}
                className="shrink-0"
              >
                View All Sessions
              </Button>
            </div>

            <Divider className="my-0 border-gray-100 dark:border-zinc-800" />

            {/* 2FA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
              <div>
                <Text strong className="block text-sm">Two-Factor Authentication (2FA)</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Add an extra layer of protection using authenticator app codes or SMS.
                </Text>
              </div>
              <Button type="default" className="w-full sm:w-auto shrink-0">Enable 2FA</Button>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'appearance',
      label: (
        <span>
          <BgColorsOutlined />
          Appearance
        </span>
      ),
      children: (
        <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e] max-w-2xl">
          <div className="mb-5">
            <Title level={4} className="!mb-1 text-lg">Interface Theme</Title>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Choose your preferred visual theme across the platform.
            </Text>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800">
            <div>
              <Text strong className="block text-gray-900 dark:text-gray-100 text-sm">Active Theme</Text>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span>Selected:</span>
                <Tag color="blue" className="uppercase text-[11px] m-0 font-medium">{theme}</Tag>
                {theme === 'system' && (
                  <span className="text-gray-400">({resolvedTheme} mode)</span>
                )}
              </div>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
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
        <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
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
        <Card variant="borderless" className="shadow-sm border border-gray-100 dark:border-zinc-800 dark:bg-[#1c1c1e]">
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
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="mb-6">
        <Title level={2} className="!mb-1 text-2xl sm:text-3xl font-bold">Settings</Title>
        <Text className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Manage your account profile, active sessions, security, and preferences.
        </Text>
      </div>

      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={items}
        className="mt-4"
      />

      {/* Change Password Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <KeyOutlined className="text-blue-500" />
            <span>Change Account Password</span>
          </div>
        }
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        centered
        width={420}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordUpdate}
          className="mt-4"
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter at least 6 characters" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The new passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter new password" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setIsPasswordModalOpen(false);
                passwordForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={passwordUpdating}>
              Update Password
            </Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  );
}

// Helper utilities for browser and OS extraction
function getBrowserFromUA(ua: string): string {
  const lower = ua.toLowerCase();
  if (lower.includes('edg/')) return 'Microsoft Edge';
  if (lower.includes('chrome/') && !lower.includes('edg/')) return 'Google Chrome';
  if (lower.includes('firefox/')) return 'Mozilla Firefox';
  if (lower.includes('safari/') && !lower.includes('chrome/')) return 'Apple Safari';
  return 'Web Browser';
}

function getOSFromUA(ua: string): string {
  const lower = ua.toLowerCase();
  if (lower.includes('windows')) return 'Windows';
  if (lower.includes('mac os x') || lower.includes('macintosh')) return 'macOS';
  if (lower.includes('android')) return 'Android';
  if (lower.includes('iphone') || lower.includes('ipad')) return 'iOS';
  if (lower.includes('linux')) return 'Linux';
  return 'Unknown OS';
}

function getInitials(first?: string, last?: string, username?: string): string {
  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }
  if (first) {
    return first.slice(0, 2).toUpperCase();
  }
  if (username) {
    return username.slice(0, 2).toUpperCase();
  }
  return 'OP';
}

function truncateUuid(uuid?: string): string {
  if (!uuid) return 'OPS-USR-01';
  if (uuid.length > 18) {
    return `${uuid.slice(0, 8)}...${uuid.slice(-6)}`;
  }
  return uuid;
}
