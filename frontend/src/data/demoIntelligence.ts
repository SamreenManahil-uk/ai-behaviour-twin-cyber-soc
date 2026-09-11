import type { Severity } from '../components/ui/SeverityBadge'

export type IndicatorType =
  | 'IP Address'
  | 'Domain'
  | 'File Hash'
  | 'URL'
  | 'Process'

export interface ThreatIndicator {
  id: string
  type: IndicatorType
  value: string
  name: string
  confidence: number
  source: string
  active: boolean
  firstSeen: string
  lastSeen: string
}

export interface MitreTechnique {
  id: string
  name: string
  tactic: string
  severity: Severity
  detections: number
  description: string
  evidence: string[]
  platforms: string[]
}

export const threatIndicators: ThreatIndicator[] = [
  {
    id: 'IOC-0081',
    type: 'IP Address',
    value: '185.220.101.4',
    name: 'Tor exit-node activity',
    confidence: 96,
    source: 'Community Intelligence',
    active: true,
    firstSeen: '2026-09-02',
    lastSeen: '2026-09-11',
  },
  {
    id: 'IOC-0080',
    type: 'IP Address',
    value: '45.142.212.61',
    name: 'Suspicious exfiltration destination',
    confidence: 91,
    source: 'Internal Analysis',
    active: true,
    firstSeen: '2026-09-10',
    lastSeen: '2026-09-11',
  },
  {
    id: 'IOC-0079',
    type: 'Domain',
    value: 'update-service.example',
    name: 'Newly observed suspicious domain',
    confidence: 78,
    source: 'SOC Analyst',
    active: true,
    firstSeen: '2026-09-11',
    lastSeen: '2026-09-11',
  },
  {
    id: 'IOC-0078',
    type: 'File Hash',
    value: 'a3f2d9b47c816e50ac13a0942f304f97b5eb6e03fc39c15bdf5c8132ce6af431',
    name: 'Untrusted attachment hash',
    confidence: 88,
    source: 'Malware Sandbox',
    active: true,
    firstSeen: '2026-09-08',
    lastSeen: '2026-09-10',
  },
  {
    id: 'IOC-0077',
    type: 'URL',
    value: 'https://downloads.example/security-update',
    name: 'Potential payload delivery URL',
    confidence: 72,
    source: 'Open Threat Feed',
    active: false,
    firstSeen: '2026-08-29',
    lastSeen: '2026-09-04',
  },
  {
    id: 'IOC-0076',
    type: 'Process',
    value: 'invoice-update.exe',
    name: 'Suspicious executable name',
    confidence: 69,
    source: 'Internal Analysis',
    active: true,
    firstSeen: '2026-09-10',
    lastSeen: '2026-09-11',
  },
  {
    id: 'IOC-0075',
    type: 'Process',
    value: 'rundll32.exe',
    name: 'Monitored living-off-the-land binary',
    confidence: 58,
    source: 'SOC Rule Library',
    active: true,
    firstSeen: '2026-08-20',
    lastSeen: '2026-09-11',
  },
]

export const mitreTechniques: MitreTechnique[] = [
  {
    id: 'T1059.001',
    name: 'PowerShell',
    tactic: 'Execution',
    severity: 'Critical',
    detections: 38,
    description: 'PowerShell commands and scripts used for execution.',
    evidence: [
      'Encoded command-line arguments',
      'Office application spawning PowerShell',
      'Rare endpoint process usage',
    ],
    platforms: ['Windows'],
  },
  {
    id: 'T1110',
    name: 'Brute Force',
    tactic: 'Credential Access',
    severity: 'High',
    detections: 24,
    description: 'Repeated authentication attempts used to obtain credentials.',
    evidence: [
      'Failed-login burst',
      'Remote interactive logon attempts',
    ],
    platforms: ['Windows', 'Linux', 'macOS'],
  },
  {
    id: 'T1068',
    name: 'Exploitation for Privilege Escalation',
    tactic: 'Privilege Escalation',
    severity: 'High',
    detections: 11,
    description: 'Exploitation used to obtain higher-level permissions.',
    evidence: [
      'Unexpected system privilege',
      'Unsigned process elevation',
    ],
    platforms: ['Windows', 'Linux'],
  },
  {
    id: 'T1041',
    name: 'Exfiltration Over C2 Channel',
    tactic: 'Exfiltration',
    severity: 'Critical',
    detections: 9,
    description: 'Data transferred through an existing command channel.',
    evidence: [
      'Outbound bytes exceeded baseline',
      'Previously unseen destination IP',
    ],
    platforms: ['Windows', 'Linux', 'macOS'],
  },
  {
    id: 'T1071.004',
    name: 'DNS',
    tactic: 'Command and Control',
    severity: 'Medium',
    detections: 17,
    description: 'DNS protocol used for command-and-control communication.',
    evidence: [
      'Newly observed domain',
      'Unusual query frequency',
    ],
    platforms: ['Windows', 'Linux', 'macOS'],
  },
  {
    id: 'T1005',
    name: 'Data from Local System',
    tactic: 'Collection',
    severity: 'Medium',
    detections: 14,
    description: 'Collection of files and data from a local endpoint.',
    evidence: [
      'Abnormal file access count',
      'Sensitive path access',
    ],
    platforms: ['Windows', 'Linux', 'macOS'],
  },
  {
    id: 'T1204.002',
    name: 'Malicious File',
    tactic: 'Execution',
    severity: 'High',
    detections: 13,
    description: 'A user opens a malicious file leading to execution.',
    evidence: [
      'Unsigned email attachment',
      'Executable written by email client',
    ],
    platforms: ['Windows', 'macOS'],
  },
  {
    id: 'T1059.002',
    name: 'AppleScript',
    tactic: 'Execution',
    severity: 'Low',
    detections: 4,
    description: 'AppleScript used to execute commands on macOS.',
    evidence: ['Rare script interpreter observed'],
    platforms: ['macOS'],
  },
]

export const analyticsTimeline = [
  { day: 'Mon', events: 2480, alerts: 114, incidents: 5 },
  { day: 'Tue', events: 3120, alerts: 146, incidents: 8 },
  { day: 'Wed', events: 2860, alerts: 121, incidents: 6 },
  { day: 'Thu', events: 3940, alerts: 188, incidents: 11 },
  { day: 'Fri', events: 4280, alerts: 206, incidents: 13 },
  { day: 'Sat', events: 2180, alerts: 92, incidents: 4 },
  { day: 'Sun', events: 2680, alerts: 128, incidents: 7 },
]

export const detectionSources = [
  { source: 'Hybrid', detections: 86, precision: 91 },
  { source: 'XGBoost', detections: 74, precision: 82 },
  { source: 'Isolation Forest', detections: 41, precision: 85 },
  { source: 'Behaviour Twin', detections: 53, precision: 88 },
  { source: 'Rules', detections: 62, precision: 94 },
]

export const topRiskEndpoints = [
  { endpoint: 'WIN-EMP-042', risk: 94 },
  { endpoint: 'LNX-SRV-009', risk: 91 },
  { endpoint: 'WIN-FIN-017', risk: 88 },
  { endpoint: 'WIN-HR-026', risk: 82 },
  { endpoint: 'WIN-MKT-014', risk: 79 },
]
