import { useRegisteredTools } from './useRegisteredTools';

export function WebMcpDebugPanel() {
  const tools = useRegisteredTools();

  return (
    <section
      aria-label="WebMCP debug panel"
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
      }}
    >
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>
        WebMCP Debug Panel
      </h2>
      {tools.length === 0 ? (
        <p style={{ margin: 0 }}>No tools registered.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {tools.map((tool) => (
            <li key={tool.name}>
              <strong>{tool.name}</strong>
              {tool.annotations?.readOnlyHint === true ? ' (read-only)' : null}
              {' — '}
              {tool.description}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
