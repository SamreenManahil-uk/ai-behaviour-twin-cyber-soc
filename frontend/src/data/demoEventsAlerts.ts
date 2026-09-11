import type { Severity } from '../components/ui/SeverityBadge'

export interface DemoSecurityEvent {
  id: string
  type: string
  endpoint: string
  user: string
  source: string
  severity: Severity
  process: string
  destinationIp: string
  timestamp: string
  rawPayload: Record<string, string | number | boolean>
}

export interface DemoAlert {
  id: string
  title: string
  description: string
  endpoint: string
  user: string
  process: string
  destinationIp: string
  severity: Severity
  status: 'New' | 'Investigating' | 'Contained' | 'Resolved' | 'False Positive'
  riskScore: number
  detectionSource:
    | 'Rule'
    | 'XGBoost'
    | 'Isolation Forest'
    | 'Behaviour Twin'
    | 'Hybrid'
  mitreId: string
  mitreName: string
  timestamp: string
  evidence: string[]
  signals: {
    xgboost: number
    anomaly: number
    behaviour: number
    rules: number
  }
}

export const demoEvents: DemoSecurityEvent[] = [
  {
    id: 'EVT-20842',
    type: 'Process Execution',
    endpoint: 'WIN-EMP-042',
    user: 's.analyst',
    source: 'Windows Security',
    severity: 'Critical',
    process: 'powershell.exe',
    destinationIp: '185.220.101.4',
    timestamp: '2026-09-11 14:32:08',
    rawPayload: {
      eventId: 4688,
      encodedCommand: true,
      parentProcess: 'winword.exe',
      failedLoginCount: 8,
    },
  },
  {
    id: 'EVT-20841',
    type: 'Outbound Connection',
    endpoint: 'LNX-SRV-009',
    user: 'svc-backup',
    source: 'Linux Audit',
    severity: 'Critical',
    process: 'curl',
    destinationIp: '45.142.212.61',
    timestamp: '2026-09-11 14:29:44',
    rawPayload: {
      outboundBytes: 18422496,
      destinationPort: 443,
      usualDestination: false,
    },
  },
  {
    id: 'EVT-20840',
    type: 'Authentication Failure',
    endpoint: 'WIN-HR-026',
    user: 'h.recruiter',
    source: 'Windows Security',
    severity: 'High',
    process: 'lsass.exe',
    destinationIp: '10.20.4.18',
    timestamp: '2026-09-11 14:26:15',
    rawPayload: {
      eventId: 4625,
      failedLoginCount: 12,
      logonType: 10,
    },
  },
  {
    id: 'EVT-20839',
    type: 'Privilege Event',
    endpoint: 'WIN-FIN-017',
    user: 'f.operator',
    source: 'EDR Simulator',
    severity: 'High',
    process: 'rundll32.exe',
    destinationIp: '10.20.8.5',
    timestamp: '2026-09-11 14:19:02',
    rawPayload: {
      privilegeEvent: true,
      integrityLevel: 'System',
      signedBinary: false,
    },
  },
  {
    id: 'EVT-20838',
    type: 'File Access Burst',
    endpoint: 'LNX-DB-004',
    user: 'postgres',
    source: 'Linux Audit',
    severity: 'Medium',
    process: 'python3',
    destinationIp: '10.20.2.44',
    timestamp: '2026-09-11 14:12:31',
    rawPayload: {
      fileAccessCount: 420,
      baselineMedian: 38,
      sensitivePath: true,
    },
  },
  {
    id: 'EVT-20837',
    type: 'Network Connection',
    endpoint: 'WIN-SALES-011',
    user: 'sales.user',
    source: 'Network Flow',
    severity: 'Low',
    process: 'chrome.exe',
    destinationIp: '142.250.180.14',
    timestamp: '2026-09-11 14:05:55',
    rawPayload: {
      protocol: 'tcp',
      destinationPort: 443,
      outboundBytes: 42822,
    },
  },
  {
    id: 'EVT-20836',
    type: 'Process Execution',
    endpoint: 'MAC-DEV-021',
    user: 'developer',
    source: 'EDR Simulator',
    severity: 'Medium',
    process: 'osascript',
    destinationIp: '10.20.7.21',
    timestamp: '2026-09-11 13:58:20',
    rawPayload: {
      parentProcess: 'Terminal',
      signedBinary: true,
      unusualProcess: true,
    },
  },
  {
    id: 'EVT-20835',
    type: 'Successful Login',
    endpoint: 'WIN-OPS-030',
    user: 'ops.user',
    source: 'Windows Security',
    severity: 'Info',
    process: 'winlogon.exe',
    destinationIp: '10.20.1.30',
    timestamp: '2026-09-11 13:51:08',
    rawPayload: {
      eventId: 4624,
      logonType: 2,
      successfulLogin: true,
    },
  },
  {
    id: 'EVT-20834',
    type: 'DNS Query',
    endpoint: 'LNX-WEB-003',
    user: 'www-data',
    source: 'Network Flow',
    severity: 'Medium',
    process: 'nginx',
    destinationIp: '8.8.8.8',
    timestamp: '2026-09-11 13:42:11',
    rawPayload: {
      query: 'update-service.example',
      queryType: 'A',
      newlyObserved: true,
    },
  },
  {
    id: 'EVT-20833',
    type: 'Executable Written',
    endpoint: 'WIN-MKT-014',
    user: 'marketing',
    source: 'EDR Simulator',
    severity: 'High',
    process: 'outlook.exe',
    destinationIp: '10.20.3.14',
    timestamp: '2026-09-11 13:36:47',
    rawPayload: {
      fileName: 'invoice-update.exe',
      source: 'email-attachment',
      signedBinary: false,
    },
  },
]

export const demoAlerts: DemoAlert[] = [
  {
    id: 'ALT-1042',
    title: 'Encoded PowerShell Execution',
    description: 'PowerShell launched from Microsoft Word with an encoded command.',
    endpoint: 'WIN-EMP-042',
    user: 's.analyst',
    process: 'powershell.exe',
    destinationIp: '185.220.101.4',
    severity: 'Critical',
    status: 'Investigating',
    riskScore: 94,
    detectionSource: 'Hybrid',
    mitreId: 'T1059.001',
    mitreName: 'PowerShell',
    timestamp: '2026-09-11 14:32:11',
    evidence: [
      'Encoded command-line argument detected',
      'PowerShell is rare for this endpoint profile',
      'Execution occurred outside the usual login window',
      'Parent process was winword.exe',
    ],
    signals: { xgboost: 88, anomaly: 80, behaviour: 100, rules: 100 },
  },
  {
    id: 'ALT-1038',
    title: 'Possible Data Exfiltration',
    description: 'Outbound transfer exceeded the learned endpoint baseline.',
    endpoint: 'LNX-SRV-009',
    user: 'svc-backup',
    process: 'curl',
    destinationIp: '45.142.212.61',
    severity: 'Critical',
    status: 'New',
    riskScore: 91,
    detectionSource: 'Behaviour Twin',
    mitreId: 'T1041',
    mitreName: 'Exfiltration Over C2 Channel',
    timestamp: '2026-09-11 14:29:48',
    evidence: [
      'Outbound bytes exceeded robust baseline',
      'Destination IP was not previously observed',
      'Activity occurred outside the service schedule',
    ],
    signals: { xgboost: 76, anomaly: 92, behaviour: 98, rules: 75 },
  },
  {
    id: 'ALT-1034',
    title: 'Suspicious Authentication Pattern',
    description: 'Repeated remote login failures followed by a successful attempt.',
    endpoint: 'WIN-HR-026',
    user: 'h.recruiter',
    process: 'lsass.exe',
    destinationIp: '10.20.4.18',
    severity: 'High',
    status: 'New',
    riskScore: 82,
    detectionSource: 'Isolation Forest',
    mitreId: 'T1110',
    mitreName: 'Brute Force',
    timestamp: '2026-09-11 14:26:18',
    evidence: [
      'Twelve failed login attempts',
      'Remote interactive logon type',
      'Authentication pattern exceeded benign reference distribution',
    ],
    signals: { xgboost: 72, anomaly: 96, behaviour: 81, rules: 80 },
  },
  {
    id: 'ALT-1031',
    title: 'Privilege Escalation Indicator',
    description: 'Unsigned process obtained system-level privileges.',
    endpoint: 'WIN-FIN-017',
    user: 'f.operator',
    process: 'rundll32.exe',
    destinationIp: '10.20.8.5',
    severity: 'High',
    status: 'Contained',
    riskScore: 88,
    detectionSource: 'Rule',
    mitreId: 'T1068',
    mitreName: 'Exploitation for Privilege Escalation',
    timestamp: '2026-09-11 14:19:06',
    evidence: [
      'System integrity level obtained',
      'Executable signature validation failed',
      'Privilege event followed authentication failures',
    ],
    signals: { xgboost: 79, anomaly: 74, behaviour: 90, rules: 100 },
  },
  {
    id: 'ALT-1027',
    title: 'Unusual External Connection',
    description: 'Network flow was classified as suspicious by the supervised model.',
    endpoint: 'LNX-WEB-003',
    user: 'www-data',
    process: 'nginx',
    destinationIp: '8.8.8.8',
    severity: 'Medium',
    status: 'Resolved',
    riskScore: 68,
    detectionSource: 'XGBoost',
    mitreId: 'T1071.004',
    mitreName: 'DNS',
    timestamp: '2026-09-11 13:42:15',
    evidence: [
      'Newly observed destination',
      'Unusual DNS query pattern',
    ],
    signals: { xgboost: 84, anomaly: 61, behaviour: 53, rules: 40 },
  },
  {
    id: 'ALT-1022',
    title: 'Unusual File Access Volume',
    description: 'Database service accessed substantially more files than normal.',
    endpoint: 'LNX-DB-004',
    user: 'postgres',
    process: 'python3',
    destinationIp: '10.20.2.44',
    severity: 'Medium',
    status: 'Investigating',
    riskScore: 71,
    detectionSource: 'Behaviour Twin',
    mitreId: 'T1005',
    mitreName: 'Data from Local System',
    timestamp: '2026-09-11 14:12:35',
    evidence: [
      'File access count exceeded median/MAD baseline',
      'Sensitive filesystem path accessed',
    ],
    signals: { xgboost: 58, anomaly: 69, behaviour: 91, rules: 60 },
  },
  {
    id: 'ALT-1018',
    title: 'Suspicious Executable Written',
    description: 'Unsigned executable was written from an email attachment.',
    endpoint: 'WIN-MKT-014',
    user: 'marketing',
    process: 'outlook.exe',
    destinationIp: '10.20.3.14',
    severity: 'High',
    status: 'False Positive',
    riskScore: 79,
    detectionSource: 'Hybrid',
    mitreId: 'T1204.002',
    mitreName: 'Malicious File',
    timestamp: '2026-09-11 13:36:51',
    evidence: [
      'Executable originated from an attachment',
      'File was not digitally signed',
    ],
    signals: { xgboost: 81, anomaly: 70, behaviour: 77, rules: 85 },
  },
  {
    id: 'ALT-1014',
    title: 'Rare Script Interpreter',
    description: 'A rarely observed scripting interpreter was launched.',
    endpoint: 'MAC-DEV-021',
    user: 'developer',
    process: 'osascript',
    destinationIp: '10.20.7.21',
    severity: 'Low',
    status: 'Resolved',
    riskScore: 44,
    detectionSource: 'Behaviour Twin',
    mitreId: 'T1059.002',
    mitreName: 'AppleScript',
    timestamp: '2026-09-11 13:58:25',
    evidence: ['Process frequency was below the learned usual-process threshold'],
    signals: { xgboost: 24, anomaly: 48, behaviour: 72, rules: 30 },
  },
]
