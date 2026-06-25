# Forms

Forms are treated as observable validation state machines, not just submit
buttons.

Recommended defaults:

- Expose a read-only validation summary.
- Provide submit/fill tools only when useful.
- Prefer explicit schemas.
- Infer schemas only from concrete non-null defaults.
- Fail closed on `null`, `undefined`, empty arrays, custom controls, files,
  unions, and ambiguous values.
- Return validation errors with stable field paths.

Declarative WebMCP markup (spec attributes on native form elements):

| Framework | Helper |
|-----------|--------|
| React | `WebMcpForm`, `WebMcpInput`, … from `@tooluminati/react-troubleshooting` |
| Angular | `WebMcpFormDirective`, `WebMcpParamDescriptionDirective` from `@tooluminati/angular-troubleshooting` |

Imperative form tools (validation summaries, submit/fill tools) use
`@tooluminati/forms` and `@tooluminati/angular-forms`.

Adapters currently include generic forms, React Hook Form, TanStack Form,
Formik, and native forms. Native forms require explicit schemas.
