<p align="center">
    <img src="./docs/logo.png" alt="XBuddy Logo" />
</p>

![Electron](https://img.shields.io/badge/Electron-Latest-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)
![NodeJS](https://img.shields.io/badge/NodeJS-18.x+-339933?logo=node.js&logoColor=white)

# 📖 About the Project <a name="about-the-project"></a>

**XBuddy** is a desktop pet application, and this repository contains its frontend implementation (based on Electron and React). The application provides user interfaces for news feeds, phishing link detection, Twitter/token analysis, AI chat, chat content recognition, and emotion reminders.

## 🔑 Key Features <a name="key-features"></a>

- 📰 News Feed - Automatically fetches the latest information
- 🎣 Phishing Link Detection - Protects users' online security
- 🤖 AI Chat - Intelligent conversation and sentiment analysis
- 📊 Data Analysis - Twitter/token trend tracking

## 💻 Getting Started <a name="getting-started"></a>

### Setup <a name="setup"></a>

1. Clone the repository
   ```sh
   git clone https://github.com/yourusername/xbuddy-desktop.git
   ```
2. Navigate to the project directory
   ```sh
   cd xbuddy-desktop
   ```
3. Install dependencies
   ```bash
   pnpm install
   ```

### Usage <a name="usage"></a>

Start the development server with hot reload support:

```bash
pnpm start
```

### Deployment <a name="deployment"></a>

Package the application:

```bash
pnpm package
```

Generate distributable installer:

```bash
pnpm make
```

## 📂 Project Structure <a name="project-structure"></a>

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


## 📄 License <a name="license"></a>

This project is licensed under the [CC BY-NC](./LICENSE) License (Creative Commons Attribution-NonCommercial).
