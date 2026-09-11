import {
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr'
import {
  Radio,
  RefreshCw,
  ShieldAlert,
  WifiOff,
  X,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../hooks/useAuth'
import { ACCESS_TOKEN_KEY } from '../services/apiClient'
import {
  buildRealtimeNotice,
  realtimeStatusLabel,
} from './realtimeUtils'
import type {
  AlertRealtimeMessage,
  RealtimeConnectionStatus,
  RealtimeNotice,
} from './realtimeTypes'

const hubUrl =
  import.meta.env.VITE_SIGNALR_HUB_URL || '/hubs/alerts'

interface RealtimeProviderProps {
  children: ReactNode
}

function statusColour(
  status: RealtimeConnectionStatus,
  isDemo: boolean,
) {
  if (isDemo) {
    return 'border-medium/30 bg-medium/10 text-medium'
  }

  if (status === 'connected') {
    return 'border-healthy/30 bg-healthy/10 text-healthy'
  }

  if (status === 'reconnecting') {
    return 'border-high/30 bg-high/10 text-high'
  }

  return 'border-critical/30 bg-critical/10 text-critical'
}

export function RealtimeProvider({
  children,
}: RealtimeProviderProps) {
  const { user } = useAuth()
  const [status, setStatus] =
    useState<RealtimeConnectionStatus>('disabled')
  const [notices, setNotices] = useState<RealtimeNotice[]>([])

  const accessToken =
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY)

  const isDemo = Boolean(
    user?.id.startsWith('demo-') || (user && !accessToken),
  )

  useEffect(() => {
    if (!user || !accessToken || isDemo) {
      return
    }

    let disposed = false

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect([0, 2_000, 5_000, 10_000])
      .configureLogging(LogLevel.Warning)
      .build()

    function addNotice(
      eventName: 'created' | 'updated',
      message: AlertRealtimeMessage,
    ) {
      const notice = buildRealtimeNotice(eventName, message)

      setNotices((current) => [notice, ...current].slice(0, 3))
    }

    connection.on(
      'AlertCreated',
      (message: AlertRealtimeMessage) =>
        addNotice('created', message),
    )

    connection.on(
      'AlertUpdated',
      (message: AlertRealtimeMessage) =>
        addNotice('updated', message),
    )

    connection.onreconnecting(() => {
      if (!disposed) {
        setStatus('reconnecting')
      }
    })

    connection.onreconnected(() => {
      if (!disposed) {
        setStatus('connected')
      }
    })

    connection.onclose(() => {
      if (!disposed) {
        setStatus('disconnected')
      }
    })

    void connection
      .start()
      .then(() => {
        if (!disposed) {
          setStatus('connected')
        }
      })
      .catch(() => {
        if (!disposed) {
          setStatus('disconnected')
        }
      })

    return () => {
      disposed = true
      void connection.stop()
    }
  }, [accessToken, isDemo, user])

  const visibleStatus = useMemo(
    () => realtimeStatusLabel(status, isDemo),
    [status, isDemo],
  )

  if (!user) {
    return children
  }

  const StatusIcon = isDemo
    ? ShieldAlert
    : status === 'connected'
      ? Radio
      : status === 'reconnecting'
        ? RefreshCw
        : WifiOff

  return (
    <>
      {children}

      <div
        className={[
          'fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full',
          'border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur',
          statusColour(status, isDemo),
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        <StatusIcon
          size={14}
          className={
            status === 'reconnecting' ? 'animate-spin' : undefined
          }
        />
        {visibleStatus}
      </div>

      <div
        className="fixed right-4 top-20 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-3"
        aria-live="polite"
        aria-label="Real-time security notifications"
      >
        {notices.map((notice) => (
          <article
            key={notice.id}
            className="soc-panel border-l-4 border-l-critical p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-critical/10 p-2 text-critical">
                <ShieldAlert size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading">
                  {notice.heading}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {notice.detail}
                </p>
                <p className="technical-value mt-2 text-[0.625rem] text-muted">
                  Alert {notice.alertId}
                </p>
              </div>

              <button
                type="button"
                aria-label={`Dismiss ${notice.heading}`}
                onClick={() =>
                  setNotices((current) =>
                    current.filter((item) => item.id !== notice.id),
                  )
                }
                className="rounded-md p-1 text-muted transition hover:bg-surface-strong hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
