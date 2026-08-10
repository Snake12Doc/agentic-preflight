# Changelog

## 0.2.0 - 2026-08-10

### Added

- Detect npm, pnpm, and Yarn projects when generating starter configuration.
- Generate checks only for the standard scripts present in `package.json`: test,
  lint, typecheck, build, and format checking.
- Run checks with `CI=true` by default to prevent interactive prompts while
  preserving an existing `CI` environment value.

### Changed

- Fall back to the safe Git status check when a Node.js project has no supported
  package scripts.
