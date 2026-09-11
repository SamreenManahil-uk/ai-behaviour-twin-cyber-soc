import type { Severity } from '../components/ui/SeverityBadge'

export type IncidentStatus =
  | 'Open'
  | 'Investigating'
  | 'Contained'
  | 'Resolved'
  | 'Closed'

export interface DemoIncident {
  id: string
  title: string
  description: string
  severity: Severity
  status: IncidentStatus
  analyst: string
  alertCount: number
  endpointCount: number
  createdAt: string
  updatedAt: string
  timeline: {
    title: string
    detail: string
    time: string
  }[]
  alertIds: string[]
}

export type EndpointStatus =
  | 'Healthy'
  | 'At Risk'
  | 'Critical'
  | 'Offline'
  | 'Isolated'

export interface DemoEndpoint {
  id: string
  hostname: string
  operatingSystem: 'Windows' | 'Linux' | 'macOS'
  status: EndpointStatus
  ipAddress: string
  owner: string
  riskScore: number
  alertCount: number
  lastSeen: string
  agentVersion: string
  behaviourProfile: {
    historySamples: number
    usualProcesses: string[]
    usualDestinations: string[]
    normalLoginWindow: string
    deviation: number
  }
}

export const demoIncidents: DemoIncident[] = [
  {
    id: 'INC-2026-019',
    title: 'Potential PowerShell-led Endpoint Compromise',
    description: 'Encoded PowerShell, unusual login time and external connection.',
    severity: 'Critical',
    status: 'Investigating',
    analyst: 'Samreen M.',
    alertCount: 4,
    endpointCount: 1,
    createdAt: '2026-09-11 14:35',
    updatedAt: '2 min ago',
    alertIds: ['ALT-1042', 'ALT-1040', 'ALT-1039', 'ALT-1037'],
    timeline: [
      {
        title: 'Incident created',
        detail: 'High-risk alerts grouped automatically for review.',
        time: '14:35',
      },
      {
        title: 'Assigned to analyst',
        detail: 'Samreen M. accepted investigation ownership.',
        time: '14:38',
      },
      {
        title: 'Investigation started',
        detail: 'Endpoint behaviour and process lineage under review.',
        time: '14:42',
      },
    ],
  },
  {
    id: 'INC-2026-018',
    title: 'Possible Data Exfiltration from Linux Server',
    description: 'Abnormal outbound volume to a previously unseen destination.',
    severity: 'Critical',
    status: 'Contained',
    analyst: 'Alex Morgan',
    alertCount: 3,
    endpointCount: 1,
    createdAt: '2026-09-11 13:58',
    updatedAt: '18 min ago',
    alertIds: ['ALT-1038', 'ALT-1036', 'ALT-1032'],
    timeline: [
      {
        title: 'Incident created',
        detail: 'Behaviour Twin score exceeded critical threshold.',
        time: '13:58',
      },
      {
        title: 'Connection reviewed',
        detail: 'Destination was not present in the endpoint profile.',
        time: '14:06',
      },
      {
        title: 'Containment simulated',
        detail: 'Network-isolation workflow recorded for demonstration.',
        time: '14:24',
      },
    ],
  },
  {
    id: 'INC-2026-017',
    title: 'Suspicious Authentication Campaign',
    description: 'Repeated remote login attempts affecting multiple endpoints.',
    severity: 'High',
    status: 'Open',
    analyst: 'Unassigned',
    alertCount: 7,
    endpointCount: 3,
    createdAt: '2026-09-11 12:48',
    updatedAt: '31 min ago',
    alertIds: ['ALT-1034', 'ALT-1033', 'ALT-1029'],
    timeline: [
      {
        title: 'Incident created',
        detail: 'Related authentication alerts grouped by source pattern.',
        time: '12:48',
      },
    ],
  },
  {
    id: 'INC-2026-016',
    title: 'Finance Endpoint Privilege Escalation',
    description: 'Unsigned process obtained elevated privileges.',
    severity: 'High',
    status: 'Investigating',
    analyst: 'Priya Shah',
    alertCount: 2,
    endpointCount: 1,
    createdAt: '2026-09-11 11:22',
    updatedAt: '46 min ago',
    alertIds: ['ALT-1031', 'ALT-1028'],
    timeline: [
      {
        title: 'Incident created',
        detail: 'Privilege rule raised a high-confidence detection.',
        time: '11:22',
      },
      {
        title: 'Analyst review',
        detail: 'Executable signature and parent process being assessed.',
        time: '11:41',
      },
    ],
  },
  {
    id: 'INC-2026-015',
    title: 'Unusual Database File Activity',
    description: 'File access count exceeded the robust behavioural baseline.',
    severity: 'Medium',
    status: 'Resolved',
    analyst: 'Daniel Lee',
    alertCount: 2,
    endpointCount: 1,
    createdAt: '2026-09-11 09:12',
    updatedAt: '2 hr ago',
    alertIds: ['ALT-1022', 'ALT-1021'],
    timeline: [
      {
        title: 'Incident created',
        detail: 'Sensitive path access triggered investigation.',
        time: '09:12',
      },
      {
        title: 'Expected activity confirmed',
        detail: 'Approved maintenance task matched the file activity.',
        time: '10:04',
      },
      {
        title: 'Incident resolved',
        detail: 'No malicious endpoint action identified.',
        time: '10:15',
      },
    ],
  },
  {
    id: 'INC-2026-014',
    title: 'Marketing Email Attachment Review',
    description: 'Unsigned executable delivered through an email attachment.',
    severity: 'Medium',
    status: 'Closed',
    analyst: 'Alex Morgan',
    alertCount: 1,
    endpointCount: 1,
    createdAt: '2026-09-10 16:41',
    updatedAt: 'Yesterday',
    alertIds: ['ALT-1018'],
    timeline: [
      {
        title: 'Incident created',
        detail: 'Attachment detection required analyst review.',
        time: '16:41',
      },
      {
        title: 'False positive confirmed',
        detail: 'Internal approved installer verified by security.',
        time: '17:22',
      },
      {
        title: 'Incident closed',
        detail: 'Evidence and analyst decision recorded.',
        time: '17:30',
      },
    ],
  },
]

export const demoEndpoints: DemoEndpoint[] = [
  {
    id: 'END-0042',
    hostname: 'WIN-EMP-042',
    operatingSystem: 'Windows',
    status: 'Critical',
    ipAddress: '10.20.4.42',
    owner: 's.analyst',
    riskScore: 94,
    alertCount: 4,
    lastSeen: '30 sec ago',
    agentVersion: 'EDR-SIM 1.4.2',
    behaviourProfile: {
      historySamples: 240,
      usualProcesses: ['chrome.exe', 'outlook.exe', 'code.exe'],
      usualDestinations: ['10.20.1.10', '10.20.2.15'],
      normalLoginWindow: '08:00–10:30 UTC',
      deviation: 1,
    },
  },
  {
    id: 'END-0009',
    hostname: 'LNX-SRV-009',
    operatingSystem: 'Linux',
    status: 'At Risk',
    ipAddress: '10.20.6.9',
    owner: 'svc-backup',
    riskScore: 91,
    alertCount: 3,
    lastSeen: '1 min ago',
    agentVersion: 'EDR-SIM 1.4.2',
    behaviourProfile: {
      historySamples: 320,
      usualProcesses: ['systemd', 'sshd', 'rsync'],
      usualDestinations: ['10.20.6.2', '10.20.9.12'],
      normalLoginWindow: 'Service schedule',
      deviation: 0.98,
    },
  },
  {
    id: 'END-0026',
    hostname: 'WIN-HR-026',
    operatingSystem: 'Windows',
    status: 'At Risk',
    ipAddress: '10.20.4.26',
    owner: 'h.recruiter',
    riskScore: 82,
    alertCount: 2,
    lastSeen: '2 min ago',
    agentVersion: 'EDR-SIM 1.4.1',
    behaviourProfile: {
      historySamples: 180,
      usualProcesses: ['outlook.exe', 'chrome.exe', 'teams.exe'],
      usualDestinations: ['10.20.1.10', '10.20.4.1'],
      normalLoginWindow: '08:30–17:30 UTC',
      deviation: 0.81,
    },
  },
  {
    id: 'END-0017',
    hostname: 'WIN-FIN-017',
    operatingSystem: 'Windows',
    status: 'Isolated',
    ipAddress: '10.20.8.17',
    owner: 'f.operator',
    riskScore: 88,
    alertCount: 2,
    lastSeen: '4 min ago',
    agentVersion: 'EDR-SIM 1.4.2',
    behaviourProfile: {
      historySamples: 215,
      usualProcesses: ['excel.exe', 'outlook.exe', 'chrome.exe'],
      usualDestinations: ['10.20.8.2', '10.20.1.10'],
      normalLoginWindow: '07:45–16:30 UTC',
      deviation: 0.9,
    },
  },
  {
    id: 'END-0004',
    hostname: 'LNX-DB-004',
    operatingSystem: 'Linux',
    status: 'Healthy',
    ipAddress: '10.20.2.4',
    owner: 'postgres',
    riskScore: 28,
    alertCount: 1,
    lastSeen: '18 sec ago',
    agentVersion: 'EDR-SIM 1.4.2',
    behaviourProfile: {
      historySamples: 410,
      usualProcesses: ['postgres', 'systemd', 'backup-agent'],
      usualDestinations: ['10.20.2.5', '10.20.6.2'],
      normalLoginWindow: 'Service schedule',
      deviation: 0.19,
    },
  },
  {
    id: 'END-0021',
    hostname: 'MAC-DEV-021',
    operatingSystem: 'macOS',
    status: 'Healthy',
    ipAddress: '10.20.7.21',
    owner: 'developer',
    riskScore: 34,
    alertCount: 1,
    lastSeen: '42 sec ago',
    agentVersion: 'EDR-SIM 1.4.0',
    behaviourProfile: {
      historySamples: 165,
      usualProcesses: ['Code', 'Safari', 'Terminal'],
      usualDestinations: ['10.20.7.1', '10.20.1.10'],
      normalLoginWindow: '09:00–18:00 UTC',
      deviation: 0.26,
    },
  },
  {
    id: 'END-0030',
    hostname: 'WIN-OPS-030',
    operatingSystem: 'Windows',
    status: 'Healthy',
    ipAddress: '10.20.1.30',
    owner: 'ops.user',
    riskScore: 12,
    alertCount: 0,
    lastSeen: '12 sec ago',
    agentVersion: 'EDR-SIM 1.4.2',
    behaviourProfile: {
      historySamples: 275,
      usualProcesses: ['mmc.exe', 'chrome.exe', 'powershell.exe'],
      usualDestinations: ['10.20.1.1', '10.20.6.9'],
      normalLoginWindow: '06:30–15:00 UTC',
      deviation: 0.08,
    },
  },
  {
    id: 'END-0051',
    hostname: 'LNX-ARCH-051',
    operatingSystem: 'Linux',
    status: 'Offline',
    ipAddress: '10.20.9.51',
    owner: 'archive-service',
    riskScore: 8,
    alertCount: 0,
    lastSeen: '3 hr ago',
    agentVersion: 'EDR-SIM 1.3.9',
    behaviourProfile: {
      historySamples: 520,
      usualProcesses: ['systemd', 'archive-job', 'sshd'],
      usualDestinations: ['10.20.9.2'],
      normalLoginWindow: 'Service schedule',
      deviation: 0.04,
    },
  },
]
