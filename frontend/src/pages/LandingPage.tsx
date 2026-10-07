import { useState } from 'react';
import { Layout, Typography, Card, Button, Dropdown, Avatar, Tag, Collapse, Tabs, Badge } from 'antd';
import {
  RobotOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  BranchesOutlined,
  AuditOutlined,
  LockOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  DeploymentUnitOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import ThemeToggle from '../components/ThemeToggle';
import { authApi } from '../services/api';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const CURRENT_YEAR = new Date().getFullYear();

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('detection');
  const navigate = useNavigate();

  // Initialize user lazily from localStorage to avoid cascading render lint warnings
  const [user, setUser] = useState<{ username: string; token: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
      return { token: savedToken, username: savedUsername };
    }
    return null;
  });

  const handleLoginSuccess = (token: string, username: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setUser({ token, username });
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const capabilities = [
    {
      icon: <ThunderboltOutlined className="text-3xl text-blue-500" />,
      title: 'Real-Time Anomaly Detection',
      desc: 'Ingests millions of metrics per second from Prometheus, Datadog, and AWS CloudWatch, automatically filtering 99% of transient alert noise.',
      tag: 'Observability',
    },
    {
      icon: <BranchesOutlined className="text-3xl text-purple-500" />,
      title: 'Root Cause Commit Correlation',
      desc: 'Pinpoints culprit git commits, PR diffs, and config drift by cross-referencing distributed APM traces with deployment logs in seconds.',
      tag: 'Diagnosis',
    },
    {
      icon: <TeamOutlined className="text-3xl text-emerald-500" />,
      title: 'Smart On-Call Routing',
      desc: 'Dynamically pages the right service owners based on code ownership, current on-call schedules, and incident severity without alert fatigue.',
      tag: 'Routing',
    },
    {
      icon: <DeploymentUnitOutlined className="text-3xl text-amber-500" />,
      title: 'Self-Healing Automated Runbooks',
      desc: 'Safely triggers pre-approved mitigation runbooks like canary rollbacks, cache flushes, and pod recycling with human-in-the-loop oversight.',
      tag: 'Remediation',
    },
    {
      icon: <AuditOutlined className="text-3xl text-cyan-500" />,
      title: 'Instant AI Post-Mortem & RCA',
      desc: 'Automatically drafts executive-ready Root Cause Analysis (RCA) documents, comprehensive incident timelines, and preventive Jira action items.',
      tag: 'Post-Mortem',
    },
    {
      icon: <LockOutlined className="text-3xl text-rose-500" />,
      title: 'Enterprise Security & Governance',
      desc: 'SOC-2 Type II compliant with zero data retention for sensitive logs, fine-grained RBAC, and VPC peering for mission-critical workloads.',
      tag: 'Security',
    },
  ];

  const workflowSteps = [
    {
      key: 'detection',
      label: '1. Ingest & Detect',
      title: 'Continuous Real-Time Telemetry Ingestion',
      desc: 'OpsAI listens to raw metric streams, OpenTelemetry spans, and distributed logs. Anomaly models detect regressions before customers feel impact.',
      code: `// OpsAI Stream Ingestion
[00:00:02.104] INGEST: prometheus.cluster_primary.http_latency_p99
[00:00:02.148] ANOMALY: Latency jumped from 42ms -> 840ms (+1900%)
[00:00:02.190] TRIAGE: Correlating affected services: [api-gateway, payment-service]
[00:00:02.245] ALERT: Severity elevated to P1-CRITICAL`,
    },
    {
      key: 'diagnosis',
      label: '2. Isolate Root Cause',
      title: 'Multi-Modal AI Root Cause Identification',
      desc: 'Our agent analyzes stack traces and links them to recently merged GitHub pull requests, identifying the exact line of code causing database lock contention.',
      code: `// Root Cause Analysis Engine
[00:00:03.410] TRACE_CORRELATION: Found 4,210 timed-out connections in pool
[00:00:03.780] GIT_DIFF: Commit #a4f91b (v2.14.0) by @dev-alex
[00:00:03.920] CONFIRMED_CAUSE: Missing connection pool release in payment_dao.go:L142
[00:00:04.015] CONFIDENCE_SCORE: 99.4%`,
    },
    {
      key: 'mitigation',
      label: '3. Automated Mitigation',
      title: 'Guarded Self-Healing Runbook Execution',
      desc: 'Executes verified remediation scripts. Teams can set autonomous rollbacks for critical paths or enforce one-click Slack/Teams approval prompts.',
      code: `// Automated Remediation Runner
[00:00:04.510] RUNBOOK: Triggering #RB-09 (Canary Rollback & Traffic Shedding)
[00:00:04.820] DEPLOYMENT: Rolled back payment-service pod revision to v2.13.9
[00:00:05.150] HEALTH_CHECK: p99 latency returned to 38ms (HEALTHY)
[00:00:05.300] SLACK_NOTIFY: Alert resolved in 1m 18s total duration`,
    },
    {
      key: 'rca',
      label: '4. Executive Post-Mortem',
      title: 'Automated Post-Mortem Generation',
      desc: 'Within seconds of incident resolution, OpsAI generates a complete markdown incident report with executive summary, timeline, and mitigation verification.',
      code: `# Incident RCA Report: INC-102
- Severity: P1 Critical
- Duration: 1 min 18 secs (Target MTTR: < 5 min)
- Impact: 0.12% payment attempts dropped, 100% recovered
- Root Cause: Missing connection release in payment_dao.go:L142
- Follow-up Actions: Automated PR #481 submitted with fix & unit test`,
    },
  ];

  const integrations = [
    'Kubernetes',
    'Docker',
    'AWS CloudWatch',
    'Google Cloud',
    'Datadog',
    'Prometheus',
    'Grafana',
    'PagerDuty',
    'Slack',
    'GitHub',
    'PostgreSQL',
    'Redis',
  ];

  const faqs = [
    {
      key: '1',
      label: 'Does OpsAI execute destructive actions in production without human approval?',
      children: (
        <Text className="text-gray-600 dark:text-gray-300">
          No. OpsAI features strict human-in-the-loop policies. You decide which runbooks can execute autonomously (such as pod restarts or cache clears) and which require explicit one-click approvals in Slack, Microsoft Teams, or the OpsAI dashboard.
        </Text>
      ),
    },
    {
      key: '2',
      label: 'How does OpsAI protect our confidential logs and source code?',
      children: (
        <Text className="text-gray-600 dark:text-gray-300">
          OpsAI operates under a strict Zero Data Retention (ZDR) policy. Telemetry and stack traces are analyzed in ephemeral memory and are never used to train public foundational models. Enterprise self-hosted VPC deployments are also supported.
        </Text>
      ),
    },
    {
      key: '3',
      label: 'Which observability and alerting tools are compatible out of the box?',
      children: (
        <Text className="text-gray-600 dark:text-gray-300">
          OpsAI natively integrates with Datadog, Prometheus, Grafana, AWS CloudWatch, PagerDuty, Opsgenie, New Relic, OpenTelemetry, and Splunk with simple webhook and API token configuration.
        </Text>
      ),
    },
    {
      key: '4',
      label: 'How fast can an engineering team onboard and see value?',
      children: (
        <Text className="text-gray-600 dark:text-gray-300">
          Most engineering teams connect their first alert stream and GitHub repository in less than 15 minutes. OpsAI starts triaging and correlating alerts immediately without requiring weeks of custom model training.
        </Text>
      ),
    },
    {
      key: '5',
      label: 'Can I try OpsAI in a sandbox without connecting real production accounts?',
      children: (
        <Text className="text-gray-600 dark:text-gray-300">
          Yes! You can explore the platform right now by clicking &quot;Sign In&quot; and selecting &quot;Login as Demo Admin (Bypass)&quot; to inspect real-time mock incidents, telemetry dashboards, and team configurations.
        </Text>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#f0f2f5] dark:bg-[#121212] transition-colors">
      {/* Top Navigation Bar */}
      <Header className="flex items-center justify-between bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md shadow-sm px-4 sm:px-8 sticky top-0 z-50 border-b border-gray-100 dark:border-zinc-800 transition-colors h-16 leading-none">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none py-1"
            onClick={() => navigate('/')}
          >
            <span className="flex items-center justify-center text-2xl text-blue-600 leading-none">
              <RobotOutlined />
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-none">
              OpsAI
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#integrations" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrations</a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a>
          </nav>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex gap-2 sm:gap-3 items-center">
              <Button type="primary" shape="round" size="middle" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Dropdown
                menu={{
                  items: [{ key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout }],
                }}
                placement="bottomRight"
              >
                <Button type="text" className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-200 px-2 sm:px-3">
                  <Avatar size="small" icon={<UserOutlined />} className="bg-blue-600 text-white shrink-0" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.username}</span>
                </Button>
              </Dropdown>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="default" shape="round" size="middle" onClick={() => setIsLoginModalOpen(true)}>
                Sign In
              </Button>
              <Button
                type="primary"
                shape="round"
                size="middle"
                className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-cyan-600 border-none shadow-md"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Launch Demo
              </Button>
            </div>
          )}
        </div>
      </Header>

      <Content className="w-full">
        {/* Hero Section */}
        <section className="px-4 sm:px-8 md:px-12 pt-12 pb-16 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <ThunderboltOutlined className="text-amber-500 animate-pulse" />
              <span>Autonomous SRE Agent v2.4 • SOC-2 Type II Certified</span>
            </div>

            {/* Main Headline */}
            <Title
              level={1}
              className="!text-3xl sm:!text-5xl md:!text-6xl !font-extrabold tracking-tight text-gray-900 dark:text-white !leading-tight mb-6"
            >
              Resolve Production Outages in Seconds with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500">
                AI SRE Agents
              </span>
            </Title>

            {/* Subtitle */}
            <Paragraph className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              OpsAI continuously correlates telemetry, pinpoints breaking code changes across distributed clouds,
              and coordinates automated runbook remediation before alerts wake your engineers.
            </Paragraph>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
              <Button
                type="primary"
                size="large"
                shape="round"
                icon={<ArrowRightOutlined />}
                onClick={() => setIsLoginModalOpen(true)}
                className="h-12 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 w-full sm:w-auto"
              >
                Try Interactive Demo
              </Button>
              <Button
                size="large"
                shape="round"
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-12 px-6 text-base font-medium w-full sm:w-auto border-gray-300 dark:border-zinc-700"
              >
                Explore Live Workflow
              </Button>
            </div>
          </motion.div>

          {/* Live Incident Simulator Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-[#18181b]"
          >
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 ml-2">opsai-agent://cluster-prod-us-east/live-triage</span>
              </div>
              <Badge status="processing" text={<span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Agent Active</span>} />
            </div>

            {/* Terminal Body */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Live Incident Alert */}
              <div className="lg:col-span-1 flex flex-col gap-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <Tag color="red" className="font-semibold text-xs">CRITICAL P1</Tag>
                  <span className="text-xs text-gray-400 font-mono">INC-102</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  Payment Gateway Timeout Spike
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Target Service: <span className="font-mono text-blue-600 dark:text-blue-400">payment-service.v2</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Trigger: <span className="text-red-500 font-medium">p99 Latency &gt; 800ms</span>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Status</span>
                  <Tag color="green">Auto-Mitigated</Tag>
                </div>
              </div>

              {/* Middle & Right: AI Diagnostics Output */}
              <div className="lg:col-span-2 flex flex-col justify-between font-mono text-xs bg-zinc-950 text-zinc-200 p-4 rounded-xl border border-zinc-800">
                <div className="flex flex-col gap-2">
                  <div className="text-emerald-400 flex items-center gap-2">
                    <CheckCircleOutlined /> AI Root Cause Confirmed in 3.4 seconds
                  </div>
                  <div className="text-zinc-400 text-[11px] leading-relaxed">
                    Identified connection pool starvation introduced in Commit <span className="text-cyan-400">#a4f91b</span> merged 8 mins ago.
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                    <span className="text-purple-400">Autopilot Action:</span> Reverted to canary image <span className="text-yellow-400">payment-service:v2.13.9</span> and recycled 4 pods.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800 text-center">
                  <div>
                    <div className="text-[10px] text-zinc-500">MTTD</div>
                    <div className="text-sm font-bold text-emerald-400">12s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">MTTR</div>
                    <div className="text-sm font-bold text-cyan-400">1m 18s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">Prevention Rate</div>
                    <div className="text-sm font-bold text-blue-400">99.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Ribbon */}
        <section className="border-y border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#161618] py-10 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">78%</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Reduction in MTTR</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400">&lt; 4.2s</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Root Cause Pinpoint Time</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">99.99%</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Customer SLA Protected</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">500k+</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Incidents Resolved</div>
            </div>
          </div>
        </section>

        {/* Capabilities Grid Section */}
        <section id="features" className="px-4 sm:px-8 md:px-12 py-16 sm:py-24 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Tag color="blue" className="uppercase font-semibold tracking-wider text-xs mb-3">Enterprise Features</Tag>
            <Title level={2} className="!text-2xl sm:!text-4xl !font-bold text-gray-900 dark:text-white mb-4">
              Engineered for High-Velocity SRE & DevOps Teams
            </Title>
            <Text className="text-base text-gray-500 dark:text-gray-400 block">
              Everything your organization needs to turn chaotic incident firefighting into predictable, structured reliability engineering.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                <Card
                  className="shadow-sm border-gray-200 dark:border-zinc-800 dark:bg-[#1c1c1e] h-full hover:shadow-xl transition-all duration-300 rounded-xl"
                  styles={{ body: { padding: '24px' } }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/80 inline-block">
                      {cap.icon}
                    </div>
                    <Tag color="default" className="text-xs">{cap.tag}</Tag>
                  </div>
                  <Title level={4} className="dark:text-white !text-lg !font-semibold mb-2">
                    {cap.title}
                  </Title>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed block">
                    {cap.desc}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Interactive "How It Works" Section */}
        <section id="how-it-works" className="px-4 sm:px-8 md:px-12 py-16 sm:py-24 bg-gray-100/60 dark:bg-[#151518] transition-colors border-y border-gray-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Tag color="cyan" className="uppercase font-semibold tracking-wider text-xs mb-3">Workflow Lifecycle</Tag>
              <Title level={2} className="!text-2xl sm:!text-4xl !font-bold text-gray-900 dark:text-white mb-4">
                How OpsAI Automates Incident Lifecycle
              </Title>
              <Text className="text-base text-gray-500 dark:text-gray-400 block">
                Click through each phase to inspect real-time agent reasoning and automated output logs.
              </Text>
            </div>

            <Card className="shadow-lg border-gray-200 dark:border-zinc-800 dark:bg-[#1c1c1e] rounded-2xl overflow-hidden p-2 sm:p-6">
              <Tabs
                activeKey={activeWorkflowTab}
                onChange={setActiveWorkflowTab}
                items={workflowSteps.map((step) => ({
                  key: step.key,
                  label: <span className="font-semibold text-sm px-2 py-1">{step.label}</span>,
                  children: (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                      <div className="lg:col-span-5 flex flex-col justify-center">
                        <Title level={4} className="dark:text-white !mb-2 text-xl font-bold">
                          {step.title}
                        </Title>
                        <Paragraph className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                          {step.desc}
                        </Paragraph>
                        <div className="flex items-center gap-2">
                          <Button
                            type="primary"
                            shape="round"
                            icon={<ArrowRightOutlined />}
                            onClick={() => setIsLoginModalOpen(true)}
                          >
                            Test This in Sandbox
                          </Button>
                        </div>
                      </div>

                      <div className="lg:col-span-7">
                        <div className="bg-zinc-950 text-zinc-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800 shadow-inner">
                          <pre className="m-0 leading-relaxed text-zinc-300 whitespace-pre-wrap">
                            {step.code}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </div>
        </section>

        {/* Integration Ecosystem Marquee */}
        <section id="integrations" className="px-4 sm:px-8 md:px-12 py-16 sm:py-24 max-w-7xl mx-auto w-full text-center">
          <Tag color="purple" className="uppercase font-semibold tracking-wider text-xs mb-3">Ecosystem</Tag>
          <Title level={2} className="!text-2xl sm:!text-4xl !font-bold text-gray-900 dark:text-white mb-4">
            Connects Directly to Your Stack in Minutes
          </Title>
          <Text className="text-base text-gray-500 dark:text-gray-400 block max-w-2xl mx-auto mb-10">
            Plug and play with your cloud providers, container orchestration, communication channels, and telemetry collectors.
          </Text>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
            {integrations.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <CloudServerOutlined className="text-blue-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-4 sm:px-8 md:px-12 py-16 sm:py-24 bg-gray-100/60 dark:bg-[#151518] transition-colors border-t border-gray-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Tag color="orange" className="uppercase font-semibold tracking-wider text-xs mb-3">FAQ</Tag>
              <Title level={2} className="!text-2xl sm:!text-4xl !font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </Title>
              <Text className="text-base text-gray-500 dark:text-gray-400 block">
                Have questions regarding implementation, autonomy guards, or data privacy?
              </Text>
            </div>

            <Collapse
              defaultActiveKey={['1']}
              items={faqs}
              className="bg-white dark:bg-[#1c1c1e] border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden"
            />
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="px-4 sm:px-8 md:px-12 py-20 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <Title level={2} className="!text-3xl sm:!text-5xl !font-extrabold !text-white mb-4">
                Ready to Eliminate 3 AM Panic Alerts?
              </Title>
              <Paragraph className="!text-blue-100 text-base sm:text-lg mb-8 leading-relaxed">
                Join forward-thinking DevOps and SRE teams running intelligent, self-healing production environments.
              </Paragraph>
              <Button
                type="default"
                size="large"
                shape="round"
                onClick={() => setIsLoginModalOpen(true)}
                className="h-12 px-8 text-base font-semibold text-blue-700 hover:text-blue-600 bg-white hover:bg-gray-50 border-none shadow-lg"
              >
                Launch Free Sandbox Demo
              </Button>
            </div>
          </div>
        </section>
      </Content>

      {/* Footer */}
      <Footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#121212] py-12 px-4 sm:px-8 text-sm transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center text-xl text-blue-600 leading-none">
              <RobotOutlined />
            </span>
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100 leading-none">
              OpsAI Platform
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400">Workflow</a>
            <a href="#integrations" className="hover:text-blue-600 dark:hover:text-blue-400">Integrations</a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400">Documentation</a>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <GlobalOutlined /> All Systems Operational
            </span>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            ©{CURRENT_YEAR} OpsAI Systems Inc. All rights reserved.
          </div>
        </div>
      </Footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </Layout>
  );
}
