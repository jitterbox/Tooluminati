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

Adapters currently include generic forms, React Hook Form, TanStack Form,
Formik, and native forms. Native forms require explicit schemas.
