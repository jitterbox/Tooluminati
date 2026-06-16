# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.x     | yes       |

Pre-1.0 APIs may change. Security fixes are still provided for supported releases.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report privately via
[GitHub Security Advisories](https://github.com/jitterbox/Tooluminati/security/advisories/new).

Include:

- affected package(s) and version(s)
- reproduction steps or proof of concept
- impact assessment (data exposure, privilege escalation, etc.)

We aim to acknowledge reports within 3 business days.

## Threat model notes

WebMCP tools run in the user's authenticated browser session. Treat agents as
untrusted clients. See [docs/security.md](docs/security.md) for library
defaults and recommended policies.
