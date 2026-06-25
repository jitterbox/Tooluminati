import { useEffect, useMemo, useState } from 'react';
import {
  filterPanelEvents,
  serializeTroubleshootingDiagnostics,
  type TimelineFilterGroup,
  type TroubleshootingPanelSnapshot,
} from '@tooluminati/diagnostics';
import { useWebMcpTroubleshootingContext } from './WebMcpTroubleshootingContext';

const PALETTE = {
  surface: '#0a0e1a',
  navy: '#17316A',
  amber: '#FECD10',
  cyan: '#0AADF2',
  red: '#FF5C6C',
};

export interface WebMcpTroubleshootingPanelProps {
  position?: 'br' | 'bl' | 'tr' | 'tl';
  startCollapsed?: boolean;
  eventLimit?: number;
  pollMs?: number | null;
  onCopyDiagnostics?: (json: string) => void;
}

const positionStyle: Record<
  NonNullable<WebMcpTroubleshootingPanelProps['position']>,
  { right?: string; left?: string; top?: string; bottom?: string }
> = {
  br: { right: '26px', bottom: '26px' },
  bl: { left: '26px', bottom: '26px' },
  tr: { right: '26px', top: '26px' },
  tl: { left: '26px', top: '26px' },
};

export function WebMcpTroubleshootingPanel({
  position = 'br',
  startCollapsed,
  onCopyDiagnostics,
}: WebMcpTroubleshootingPanelProps) {
  const { viewModel, visibility, isPanelEnabled } =
    useWebMcpTroubleshootingContext();
  const [snapshot, setSnapshot] = useState<TroubleshootingPanelSnapshot>(() =>
    viewModel.refresh(),
  );
  const [filter, setFilter] = useState<TimelineFilterGroup>('all');
  const [openChecks, setOpenChecks] = useState<Record<string, boolean>>({});
  const [openEvents, setOpenEvents] = useState<Record<string, boolean>>({});
  const [openErrors, setOpenErrors] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (startCollapsed) {
      visibility.setCollapsed(true);
    }
  }, [startCollapsed, visibility]);

  useEffect(() => {
    const refresh = () => setSnapshot(viewModel.refresh());
    refresh();
    const unsubVm = viewModel.subscribe(refresh);
    const unsubVis = visibility.subscribe(refresh);
    return () => {
      unsubVm();
      unsubVis();
    };
  }, [viewModel, visibility]);

  const filteredEvents = useMemo(
    () => filterPanelEvents(snapshot.events, filter),
    [snapshot.events, filter],
  );

  if (!isPanelEnabled || !visibility.visible) {
    return null;
  }

  const pos = positionStyle[position];
  const supportColor = snapshot.supported ? PALETTE.cyan : PALETTE.red;
  const collapsed = visibility.collapsed;

  const refresh = () => {
    setSpinning(true);
    setSnapshot(viewModel.refresh());
    window.setTimeout(() => setSpinning(false), 650);
  };

  const copyDiagnostics = async () => {
    const json = serializeTroubleshootingDiagnostics(snapshot);
    if (onCopyDiagnostics) {
      onCopyDiagnostics(json);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(json);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  if (collapsed) {
    return (
    <button
      type="button"
      aria-label="Expand WebMCP troubleshooting panel"
      data-testid="webmcp-troubleshooting-badge"
      onClick={() => visibility.setCollapsed(false)}
        style={{
          position: 'fixed',
          ...pos,
          zIndex: 99990,
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '11px 15px 11px 13px',
          background: '#0d1322',
          border: '1px solid #1f2940',
          borderRadius: 13,
          cursor: 'pointer',
          boxShadow: '0 14px 40px rgba(0,0,0,.5)',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        }}
      >
        <BrandMark />
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#e7ecf6' }}>
            WebMCP
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: supportColor,
            }}
          >
            {snapshot.supported ? 'supported' : 'unsupported'}
          </span>
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingLeft: 11,
            marginLeft: 3,
            borderLeft: '1px solid #20293f',
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: '#aeb7cb',
            }}
          >
            {snapshot.toolCount}
          </span>
          {snapshot.issueCount > 0 ? (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  snapshot.errors.length > 0 ? PALETTE.red : PALETTE.amber,
              }}
            />
          ) : null}
        </span>
      </button>
    );
  }

  return (
    <div
      aria-label="WebMCP troubleshooting panel"
      data-testid="webmcp-troubleshooting-panel"
      style={{
        position: 'fixed',
        ...pos,
        zIndex: 99990,
        width: 412,
        maxHeight: 'calc(100vh - 52px)',
        display: 'flex',
        flexDirection: 'column',
        background: PALETTE.surface,
        border: '1px solid #1c2438',
        borderRadius: 15,
        boxShadow: '0 26px 70px rgba(0,0,0,.62)',
        overflow: 'hidden',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        color: '#eef2fa',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '13px 14px',
          borderBottom: '1px solid #161d2e',
        }}
      >
        <BrandMark />
        <div style={{ marginRight: 'auto', lineHeight: 1.2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>
            WebMCP Troubleshooting
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9.5,
              letterSpacing: 1.6,
              color: '#5f6a82',
              textTransform: 'uppercase',
            }}
          >
            Tooluminati · dev panel
          </div>
        </div>
        <PanelButton title="Re-run checks" onClick={refresh}>
          <span style={{ display: 'inline-block', animation: spinning ? 'tlmSpin .65s linear' : 'none' }}>⟳</span>
        </PanelButton>
        <PanelButton onClick={() => void copyDiagnostics()}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: copied ? PALETTE.cyan : '#9aa5bd' }}>
            {copied ? 'Copied ✓' : 'Copy JSON'}
          </span>
        </PanelButton>
        <PanelButton title="Minimize" onClick={() => visibility.setCollapsed(true)}>
          –
        </PanelButton>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 1,
          background: '#161d2e',
        }}
      >
        <StatTile label="WebMCP" value={snapshot.supported ? 'Supported' : 'Unsupported'} color={supportColor} />
        <StatTile label="Tools" value={String(snapshot.toolCount)} color={snapshot.toolCount > 0 ? '#eef2fa' : PALETTE.amber} />
        <StatTile label="Issues" value={String(snapshot.issueCount)} color={snapshot.errors.length ? PALETTE.red : snapshot.issueCount ? PALETTE.amber : PALETTE.cyan} />
      </div>

      <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
        <Section title="Environment">
          {snapshot.checks.map((check) => (
            <Row
              key={check.id}
              open={openChecks[check.id] ?? false}
              onToggle={() =>
                setOpenChecks((s) => ({ ...s, [check.id]: !s[check.id] }))
              }
              hint={check.guidance}
              label={check.label}
              value={check.value}
              status={check.status}
            />
          ))}
        </Section>

        <Section title="Timeline" meta={`${snapshot.events.length} captured`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 12px 8px' }}>
            {(['all', 'failures', 'blocked', 'tools', 'nav'] as const).map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setFilter(chip)}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10.5,
                  padding: '4px 9px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  border: `1px solid ${filter === chip ? PALETTE.cyan : '#1f2840'}`,
                  background: filter === chip ? 'rgba(10,173,242,.13)' : '#0d1322',
                  color: filter === chip ? '#5EC8F7' : '#8893a8',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
          {filteredEvents.length === 0 ? (
            <EmptyRow label={snapshot.events.length === 0 ? 'No timeline activity yet' : 'No events in this filter'} />
          ) : (
            filteredEvents.map((event) => (
              <Row
                key={event.id}
                open={openEvents[event.id] ?? false}
                onToggle={() =>
                  setOpenEvents((s) => ({ ...s, [event.id]: !s[event.id] }))
                }
                hint={event.detail ?? event.guidance}
                meta={event.metadata ? JSON.stringify(event.metadata, null, 2) : undefined}
                label={event.title}
                value={event.time}
                tag={event.category.slice(0, 4).toUpperCase()}
              />
            ))
          )}
        </Section>

        <Section title="Client Errors" meta={snapshot.errors.length ? `${snapshot.errors.length} captured` : 'clean'}>
          {snapshot.errors.length === 0 ? (
            <EmptyRow label="No errors captured this session" ok />
          ) : (
            snapshot.errors.map((error) => (
              <Row
                key={error.id}
                open={openErrors[error.id] ?? false}
                onToggle={() =>
                  setOpenErrors((s) => ({ ...s, [error.id]: !s[error.id] }))
                }
                hint={error.guidance}
                meta={error.stack}
                label={error.message}
                value={error.time}
                tag="ERR"
                error
              />
            ))
          )}
        </Section>
      </div>

      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 14px',
          borderTop: '1px solid #161d2e',
          background: '#0c1120',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: PALETTE.cyan }} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#6b768c' }}>
          Live · {snapshot.panelState}
        </span>
      </footer>
      <style>{`@keyframes tlmSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function BrandMark() {
  return (
    <span style={{ position: 'relative', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderBottom: '22px solid #17316A', position: 'absolute', top: 1 }} />
      <span style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: '#FECD10', marginTop: 6, boxShadow: '0 0 8px #FECD10' }} />
    </span>
  );
}

function PanelButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 30, height: 30, borderRadius: 8, background: '#121a2b', border: '1px solid #1f2840', color: '#9aa5bd', cursor: 'pointer' }}>
      {children}
    </button>
  );
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0a0e1a', padding: '12px 13px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: 1, color: '#5f6a82', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

function Section({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 8 }}>
      <div style={{ padding: '13px 14px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.5, color: '#7b8aa6', textTransform: 'uppercase', fontWeight: 600 }}>{title}</span>
        {meta ? <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#4f5870' }}>{meta}</span> : null}
      </div>
      <div style={{ padding: '0 12px' }}>{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
  meta,
  tag,
  status,
  open,
  onToggle,
  error,
}: {
  label: string;
  value?: string;
  hint?: string | undefined;
  meta?: string | undefined;
  tag?: string | undefined;
  status?: 'ok' | 'warn' | 'fail' | 'muted';
  open: boolean;
  onToggle: () => void;
  error?: boolean;
}) {
  const expandable = Boolean(hint || meta);
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 3, background: open ? '#0e1424' : error ? 'rgba(255,92,108,.05)' : '#0b0f1c', borderLeft: error ? `2px solid #FF5C6C` : undefined }}>
      <button type="button" onClick={expandable ? onToggle : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', background: 'transparent', border: 0, cursor: expandable ? 'pointer' : 'default', color: 'inherit', textAlign: 'left' }}>
        {tag ? <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8.5, fontWeight: 600, padding: '2px 5px', borderRadius: 4, color: error ? '#FF8088' : '#5EC8F7', background: error ? 'rgba(255,92,108,.12)' : 'rgba(10,173,242,.13)' }}>{tag}</span> : null}
        <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {value ? <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: status === 'warn' ? '#FFD86B' : status === 'fail' ? '#FF8088' : '#58627a' }}>{value}</span> : null}
        {expandable ? <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#586279' }}>{open ? '▾' : '▸'}</span> : null}
      </button>
      {open && hint ? <div style={{ padding: '0 12px 11px 36px', fontSize: 11.5, lineHeight: 1.55, color: '#9aa5bd' }}>{hint}</div> : null}
      {open && meta ? <pre style={{ margin: '0 12px 11px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#6b768c', background: '#070b14', border: '1px solid #161d2e', borderRadius: 6, padding: '7px 9px', whiteSpace: 'pre-wrap' }}>{meta}</pre> : null}
    </div>
  );
}

function EmptyRow({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div style={{ padding: '12px 10px', fontSize: 12, color: '#586279', fontFamily: "'IBM Plex Mono', monospace" }}>
      {ok ? '✓ ' : ''}{label}
    </div>
  );
}
