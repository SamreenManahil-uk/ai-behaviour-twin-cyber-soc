export interface ThreatActivityPoint {
  time: string
  total: number
  malicious: number
  anomalous: number
}

export interface SeverityPoint {
  name: 'Critical' | 'High' | 'Medium' | 'Low'
  value: number
  colour: string
}

export interface CriticalThreat {
  id: string
  title: string
  endpoint: string
  riskScore: number
  technique: string
  evidence: string
  time: string
}

export interface RecentAlert {
  id: string
  title: string
  endpoint: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  source: string
  status: string
  riskScore: number
  timestamp: string
}

export const threatActivity: ThreatActivityPoint[] = [
  { time: '00:00', total: 184, malicious: 18, anomalous: 26 },
  { time: '02:00', total: 142, malicious: 11, anomalous: 17 },
  { time: '04:00', total: 126, malicious: 8, anomalous: 14 },
  { time: '06:00', total: 218, malicious: 24, anomalous: 31 },
  { time: '08:00', total: 482, malicious: 44, anomalous: 58 },
  { time: '10:00', total: 646, malicious: 61, anomalous: 76 },
  { time: '12:00', total: 589, malicious: 53, anomalous: 68 },
  { time: '14:00', total: 734, malicious: 82, anomalous: 94 },
  { time: '16:00', total: 612, malicious: 67, anomalous: 81 },
  { time: '18:00', total: 398, malicious: 39, anomalous: 52 },
  { time: '20:00', total: 286, malicious: 28, anomalous: 36 },
  { time: '22:00', total: 226, malicious: 20, anomalous: 29 },
]

export const severityDistribution: SeverityPoint[] = [
  { name: 'Critical', value: 12, colour: '#f43f5e' },
  { name: 'High', value: 34, colour: '#fb923c' },
  { name: 'Medium', value: 78, colour: '#fbbf24' },
  { name: 'Low', value: 142, colour: '#38bdf8' },
]

export const criticalThreats: CriticalThreat[] = [
  {
    id: 'ALT-1042',
    title: 'Encoded PowerShell Execution',
    endpoint: 'WIN-EMP-042',
    riskScore: 94,
    technique: 'T1059.001',
    evidence: 'Encoded command, rare process lineage and unusual 02:14 login.',
    time: '2 min ago',
  },
  {
    id: 'ALT-1038',
    title: 'Possible Data Exfiltration',
    endpoint: 'LNX-SRV-009',
    riskScore: 91,
    technique: 'T1041',
    evidence: 'Outbound transfer exceeded the endpoint behavioural baseline.',
    time: '8 min ago',
  },
  {
    id: 'ALT-1031',
    title: 'Privilege Escalation Indicator',
    endpoint: 'WIN-FIN-017',
    riskScore: 88,
    technique: 'T1068',
    evidence: 'Unexpected privilege event following repeated login failures.',
    time: '17 min ago',
  },
]

export const recentAlerts: RecentAlert[] = [
  {
    id: 'ALT-1042',
    title: 'Encoded PowerShell Execution',
    endpoint: 'WIN-EMP-042',
    severity: 'Critical',
    source: 'Hybrid',
    status: 'Investigating',
    riskScore: 94,
    timestamp: '2 min ago',
  },
  {
    id: 'ALT-1038',
    title: 'Possible Data Exfiltration',
    endpoint: 'LNX-SRV-009',
    severity: 'Critical',
    source: 'Behaviour Twin',
    status: 'New',
    riskScore: 91,
    timestamp: '8 min ago',
  },
  {
    id: 'ALT-1034',
    title: 'Suspicious Authentication Pattern',
    endpoint: 'WIN-HR-026',
    severity: 'High',
    source: 'Isolation Forest',
    status: 'New',
    riskScore: 82,
    timestamp: '12 min ago',
  },
  {
    id: 'ALT-1031',
    title: 'Privilege Escalation Indicator',
    endpoint: 'WIN-FIN-017',
    severity: 'High',
    source: 'Rule',
    status: 'Contained',
    riskScore: 88,
    timestamp: '17 min ago',
  },
  {
    id: 'ALT-1027',
    title: 'Unusual External Connection',
    endpoint: 'LNX-WEB-003',
    severity: 'Medium',
    source: 'XGBoost',
    status: 'Resolved',
    riskScore: 68,
    timestamp: '26 min ago',
  },
]

export const endpointHealth = [
  { label: 'Healthy', value: 1164, percentage: 93.3, colour: 'bg-healthy' },
  { label: 'At risk', value: 58, percentage: 4.6, colour: 'bg-medium' },
  { label: 'Critical', value: 18, percentage: 1.4, colour: 'bg-critical' },
  { label: 'Offline', value: 8, percentage: 0.7, colour: 'bg-slate-500' },
]

export const liveActivity = [
  {
    title: 'Hybrid risk score calculated',
    detail: 'WIN-EMP-042 · Risk 94/100',
    time: 'Now',
    colour: 'bg-critical',
  },
  {
    title: 'Behaviour deviation detected',
    detail: 'LNX-SRV-009 · Outbound traffic',
    time: '1 min',
    colour: 'bg-medium',
  },
  {
    title: 'Security event ingested',
    detail: 'WIN-HR-026 · Authentication',
    time: '3 min',
    colour: 'bg-brand-400',
  },
  {
    title: 'Incident moved to contained',
    detail: 'INC-2026-018',
    time: '7 min',
    colour: 'bg-healthy',
  },
]
