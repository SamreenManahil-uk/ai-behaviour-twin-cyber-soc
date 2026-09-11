import {
  BellRing,
  Check,
  Eye,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Drawer } from '../components/ui/Drawer'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../hooks/useToast'

export function UiKitPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { showToast } = useToast()

  return (
    <section>
      <div className="mb-6">
        <p className="soc-label text-brand-400">Frontend foundation</p>
        <h2 className="soc-value mt-2 text-3xl">SOC Component Library</h2>
        <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
          Reusable interaction, status and feedback components.
        </p>
      </div>

      <div className="space-y-6">
        <article className="soc-panel p-5 sm:p-6">
          <p className="soc-label mb-4">Buttons and feedback</p>
          <div className="flex flex-wrap gap-3">
            <Button leftIcon={<Plus size={16} />}>Create incident</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setConfirmOpen(true)}
            >
              Destructive
            </Button>
            <Button loading>Processing</Button>
          </div>
        </article>

        <article className="soc-panel p-5 sm:p-6">
          <p className="soc-label mb-4">Security status badges</p>
          <div className="flex flex-wrap gap-3">
            <SeverityBadge severity="Critical" />
            <SeverityBadge severity="High" />
            <SeverityBadge severity="Medium" />
            <SeverityBadge severity="Low" />
            <Badge variant="success" dot>Contained</Badge>
            <Badge variant="purple">Behaviour Twin</Badge>
          </div>
        </article>

        <article className="soc-panel p-5 sm:p-6">
          <p className="soc-label mb-4">Overlays and notifications</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
            >
              Open modal
            </Button>
            <Button
              variant="outline"
              leftIcon={<Eye size={16} />}
              onClick={() => setDrawerOpen(true)}
            >
              Open alert drawer
            </Button>
            <Button
              variant="outline"
              leftIcon={<Check size={16} />}
              onClick={() =>
                showToast({
                  title: 'Incident updated successfully',
                  description: 'INC-2026-019 is now under investigation.',
                  variant: 'success',
                })
              }
            >
              Success toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                showToast({
                  title: 'ML service unavailable',
                  description: 'Prediction could not be completed. Try again.',
                  variant: 'error',
                })
              }
            >
              Error toast
            </Button>
          </div>
        </article>

        <article className="soc-panel overflow-hidden">
          <div className="p-5 sm:p-6">
            <p className="soc-label mb-4">Search and pagination</p>
            <div className="max-w-md">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search alerts or endpoints..."
              />
            </div>
            {search && (
              <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                Searching for: <strong>{search}</strong>
              </p>
            )}
          </div>
          <Pagination
            page={page}
            pageSize={10}
            totalItems={86}
            onPageChange={setPage}
          />
        </article>

        <div className="grid gap-6 xl:grid-cols-2">
          <EmptyState
            title="No alerts found"
            description="No security alerts match the current filters."
            icon={ShieldAlert}
            action={<Button variant="outline">Clear filters</Button>}
          />
          <ErrorState
            description="The security event service did not respond."
            onRetry={() =>
              showToast({
                title: 'Retrying request',
                variant: 'info',
              })
            }
          />
        </div>

        <div>
          <p className="soc-label mb-4">Skeleton loading</p>
          <TableSkeleton rows={4} />
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create security incident"
        description="Group related alerts into a coordinated investigation."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false)
                showToast({
                  title: 'Incident draft created',
                  variant: 'success',
                })
              }}
            >
              Create draft
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--foreground-secondary)]">
          The complete incident form will use validated title, severity,
          assignee and alert-selection controls.
        </div>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Suspicious PowerShell Execution"
        description="WIN-EMP-042 · 2 minutes ago"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Close
            </Button>
            <Button leftIcon={<BellRing size={16} />}>
              Create incident
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {[
            [
              'Severity',
              <SeverityBadge key="critical-severity" severity="Critical" />,
            ],
            ['Risk score', '94 / 100'],
            ['Process', 'powershell.exe'],
            ['Detection', 'Hybrid AI + Behaviour'],
            ['MITRE', 'T1059.001 PowerShell'],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
            >
              <span className="text-sm text-[var(--foreground-muted)]">
                {label}
              </span>
              <span className="technical-value text-sm font-semibold">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          showToast({
            title: 'Action confirmed',
            description: 'The simulated record was removed.',
            variant: 'success',
          })
        }}
        title="Remove security record?"
        description="This demonstrates a confirmation boundary. No real endpoint action or record deletion occurs."
        confirmLabel="Confirm removal"
      />
    </section>
  )
}
