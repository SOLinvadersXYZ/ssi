# Installing the Bonk Computer Framework as a Package

This guide explains how to set up and publish the Bonk Computer Framework as an installable CLI package like `next-forge@latest`.

## 📦 Package Structure

```
bonk-computer-framework/
├── src/                       # Source code
│   ├── cli.ts                # CLI entry point
│   ├── index.ts              # Package exports
│   ├── commands/             # CLI commands
│   │   ├── init.ts           # Project initialization
│   │   ├── add.ts            # Component addition
│   │   └── update.ts         # Framework updates
│   └── utils/                # Utility functions
│       ├── template.ts       # Template processing
│       ├── install.ts        # Dependency management
│       └── git.ts            # Git operations
├── templates/                # Project templates
│   ├── default/              # Default template
│   └── components/           # Component templates
├── dist/                     # Built output (generated)
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript config
├── tsup.config.ts            # Build configuration
└── biome.json                # Linting/formatting
```

## 🚀 Development Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Build the Package

```bash
npm run build
# or
pnpm build
```

This creates the `dist/` directory with compiled JavaScript files.

### 3. Test Locally

Link the package globally for local testing:

```bash
# Link the package
npm link
# or
pnpm link --global

# Test the CLI
bonk-computer-framework init my-test-app
# or
bcf init my-test-app
```

### 4. Unlink When Done

```bash
npm unlink -g @bonk-computer/framework
# or
pnpm unlink --global @bonk-computer/framework
```

## 📚 Publishing to NPM

### 1. Login to NPM

```bash
npm login
```

### 2. Update Version

```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

### 3. Publish

```bash
npm publish
```

For scoped packages (recommended):

```bash
npm publish --access public
```

## 🔧 Usage After Publishing

Once published, users can install and use it like this:

### Global Installation

```bash
npm install -g @bonk-computer/framework
# or
npx @bonk-computer/framework@latest init my-bonk-app
```

### Usage Commands

```bash
# Create new project
bonk-computer-framework init my-project
bcf init my-project

# Add components
bcf add wallet
bcf add swap
bcf add nft

# Update framework
bcf update
```

## 🏗️ Template System

The framework uses a template system where:

1. **Templates** are stored in `templates/` directory
2. **Variables** like `{{PROJECT_NAME}}` are replaced during project creation
3. **Components** can be added incrementally using `bcf add`

### Available Templates

- `default` - Full-stack Solana dApp
- `minimal` - Basic setup
- `game` - Multiplayer game template
- `defi` - DeFi application template
- `nft` - NFT marketplace template

### Template Variables

- `{{PROJECT_NAME}}` - Project display name
- `{{PROJECT_NAME_KEBAB}}` - kebab-case version
- `{{PROJECT_NAME_PASCAL}}` - PascalCase version
- `{{USE_CONVEX}}` - Boolean for Convex integration
- `{{USE_E2B}}` - Boolean for E2B integration
- `{{PACKAGE_MANAGER}}` - User's package manager choice

## 🔍 Troubleshooting

### TypeScript Errors During Development

The TypeScript errors you see are expected during development since the dependencies aren't installed in the CLI package itself. They will be resolved when:

1. The package is built with `tsup`
2. Users install the generated projects with proper dependencies

### Missing Dependencies

If you see import errors, ensure all dependencies are listed in `package.json`:

```json
{
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^11.1.0",
    "execa": "^8.0.1",
    "fs-extra": "^11.2.0",
    "inquirer": "^9.2.12",
    "ora": "^7.0.1",
    "semver": "^7.5.4",
    "validate-npm-package-name": "^5.0.0"
  }
}
```

### Template Issues

If templates aren't copying correctly:

1. Check the `templates/` directory structure
2. Ensure template variables are properly formatted
3. Verify file paths in template copying logic

## 🚀 Next Steps

1. **Build and test** the package locally
2. **Create additional templates** for different use cases
3. **Add more components** to the component library
4. **Publish to NPM** for public use
5. **Create documentation** and examples

## 📖 Similar Projects

This package structure follows patterns from:

- `create-next-app`
- `create-react-app` 
- `@next-forge/cli`
- `create-t3-app`

The goal is to provide the same developer experience for Solana Web3 development.
