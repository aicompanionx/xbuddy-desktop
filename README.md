# XBuddy Desktop Application

## Project Overview

This is a modern desktop application template based on Electron and React 19, integrating the latest front-end technology stack including TailwindCSS 4.1, shadcn UI, and React Query, providing high-performance, beautiful user interfaces and a smooth development experience.

## Technology Stack

- **Core Frameworks**:
  - Electron 35+
  - React 19
  - TypeScript
  - Vite 5

- **UI & Styling**:
  - TailwindCSS 4.1
  - shadcn UI
  - Tailwind Merge
  - Tailwind Animate

- **State Management & Data Fetching**:
  - React Query (@tanstack/react-query)
  - Zustand

- **Routing**:
  - React Router v7

- **Development Tools**:
  - pnpm
  - ESLint
  - Prettier
  - Electron Forge

## Quick Start

### Environment Requirements

- Node.js 18+
- pnpm 8+

### Install Dependencies

```bash
pnpm install
```

### Development Mode

Start the development server with hot reload support:

```bash
pnpm start
```

### Build Application

Package the application:

```bash
pnpm package
```

Generate distributable installer:

```bash
pnpm make
```

## Project Structure

```text
electron-app/
├── src/
│   ├── main.ts         # Main process entry point
│   ├── preload.ts      # Preload script
│   ├── renderer.tsx    # Renderer process entry
│   ├── components/     # React components
│   │   ├── ui/         # Base UI components (shadcn)
│   │   └── features/   # Feature components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utility functions and libraries
│   ├── api/            # API requests and React Query hooks
│   ├── pages/          # Page components
│   ├── router/         # Router configuration
│   ├── store/          # State management (Zustand)
│   ├── styles/         # Global styles and Tailwind config
│   └── types/          # TypeScript type definitions
├── index.html          # Main HTML file
├── package.json
├── tsconfig.json
├── tailwind.config.cjs # Tailwind configuration
├── vite.*.config.ts    # Vite configuration files
└── forge.config.ts     # Electron Forge configuration
```

## Main Features

- **High-Performance Rendering**: High-performance rendering system built with React 19 and Vite
- **Modern UI Library**: Integration of shadcn UI and TailwindCSS 4.1, providing beautiful user interfaces
- **Type Safety**: Fully developed with TypeScript, providing type safety and intelligent suggestions
- **Efficient State Management**: Using React Query for data fetching and caching, Zustand for global state management
- **Build System**: Using Electron Forge to simplify the building, packaging, and distribution process

## Development Guide

### Adding New Components

Use shadcn UI CLI to add components:

```bash
npx shadcn-ui add [component-name]
```

### Styling Guidelines

- Prioritize TailwindCSS utility classes
- When custom styles are needed, use TailwindCSS's `@apply` directive
- Follow mobile-first responsive design principles

### Data Fetching

- Create query hooks using React Query
- Organize API requests in the `src/api` directory
- Follow naming conventions: `use-xxx-query.ts`, `use-xxx-mutation.ts`

### Main Process and Renderer Process Communication

- Use `ipcRenderer` and `ipcMain` for inter-process communication
- Safely expose APIs through `contextBridge`
- Validate and sanitize all data passed via IPC
