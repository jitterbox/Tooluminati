import { useWebMcpSecurityBanner } from './useWebMcpSecurityBanner';

export function WebMcpSecurityBanner() {
  const banner = useWebMcpSecurityBanner();

  if (!banner.enabled) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      style={{
        background: '#fff3cd',
        border: '1px solid #ffeeba',
        color: '#856404',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
      }}
    >
      <strong>Tooluminati diagnostics enabled.</strong> {banner.message} Registered
      tools: {banner.registeredTools.join(', ') || 'none'}.
    </aside>
  );
}
