import {
  Activity,
  BellRing,
  ChartNoAxesCombined,
  Crosshair,
  Gauge,
  Radar,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Swords,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const primaryNavigation: NavigationItem[] = [
  { label: 'SOC Overview', path: '/', icon: Gauge },
  { label: 'Security Events', path: '/events', icon: Activity },
  { label: 'Threat Alerts', path: '/alerts', icon: ShieldAlert },
  { label: 'Incidents', path: '/incidents', icon: BellRing },
  { label: 'Endpoints', path: '/endpoints', icon: Server },
  { label: 'Threat Intelligence', path: '/threats', icon: Crosshair },
  { label: 'MITRE ATT&CK', path: '/mitre-attack', icon: Swords },
  { label: 'Analytics', path: '/analytics', icon: ChartNoAxesCombined },
]

export const secondaryNavigation: NavigationItem[] = [
  { label: 'System Health', path: '/system-health', icon: Radar },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export const allNavigation = [
  ...primaryNavigation,
  ...secondaryNavigation,
]

export const brandIcon = ShieldCheck
