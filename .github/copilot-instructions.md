# GitHub Copilot Instructions for ioBroker.shrdzm

## General Guidelines

This repository contains an ioBroker adapter for the SHRDZM smartmeter interface. When working on this project, please follow these specific guidelines:

## Issue and Pull Request Handling

- **Do NOT close issues when they are solved by a PR**
- Instead, attach the label `fixed` to the issue
- Add a reference to the solving PR as a comment in the issue
- This helps maintain a clear audit trail of how issues were resolved

## Changelog Management

- **ALL changes must be documented in the changelog section of README.md**
- Add new entries below the `### WORK_IN_PROGRESS` label in the changelog
- Do NOT remove the template comment for `### WORK_IN_PROGRESS`
- Follow the existing changelog format with version, date, and bullet points
- Include author attribution in the format `(mcm1957)`

Example changelog entry:
```markdown
### WORK_IN_PROGRESS
* (mcm1957) Description of the change made
<!-- ### WORK_IN_PROGRESS -->
```

## Build Artifacts

- **Build artifacts in the `build/` directory are intentionally pushed to GitHub**
- Always commit and push build artifacts after making code changes
- This is different from typical Node.js projects - the build artifacts are part of the deployment strategy
- Run `npm run build` after code changes and commit the resulting build files

## Documentation-Only Changes

When making changes that affect ONLY documentation files:
- **Do NOT commit any code changes**
- **Do NOT rebuild the project**
- **Do NOT commit build artifacts**
- Only commit the documentation changes themselves

## Project Structure

- This is a TypeScript-based ioBroker adapter
- Source code is in `src/` directory
- Built code goes to `build/` directory
- Admin UI configuration is in `admin/` directory
- Internationalization files are in `i18n/` and `admin/i18n/` directories

## Development Workflow

1. Make code changes in `src/` directory
2. Run `npm run build` to compile TypeScript
3. Run `npm run test` to ensure tests pass
4. Run `npm run lint` to check code style
5. Update changelog in README.md under WORK_IN_PROGRESS
6. Commit both source changes AND build artifacts

## Testing

- Run `npm run test` before committing changes
- The project uses mocha for testing
- Both TypeScript tests and package tests are included
- Integration tests are available via `npm run test:integration`

## Code Style

- Follow the existing ESLint configuration
- Use TypeScript for all new code
- Follow ioBroker adapter conventions
- Maintain compatibility with Node.js 20+

## Dependencies

- Keep dependencies up to date but test thoroughly
- The adapter uses `@iobroker/adapter-core` as the main dependency
- Development dependencies include TypeScript, ESLint, and testing tools