# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in iroko, please report it responsibly:

1. **Do NOT open a public issue**
2. Email: marcel.djedjeli@africandigitconsulting.com
3. Include: description, reproduction steps, potential impact

I will respond within 48 hours.

## Security Measures

- All config files are sanitized before publication (no secrets, no personal paths)
- The `settings.json` template uses `{{HOME}}` placeholders resolved at install time
- GitHub Push Protection and Secret Scanning are enabled on this repository
- Dependencies are monitored via Dependabot
