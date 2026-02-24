# Pomodoro Widget

A lightweight, elegant Pomodoro timer application built with **Tauri**, **React**, and **TypeScript**. Designed for focus and simplicity, featuring customizable notification sounds and a clean, modern UI.

![Pomodoro Widget Preview](docs/images/preview.png) *(Note: Placeholder for preview image)*

## Features

- **Customizable Timer**: Set your desired focus and break durations (coming soon).
- **Multiple Notification Sounds**: Choose from Chime, Digital, Ring, or Nature sounds to signal the end of a session.
- **Focus Mode**: A dedicated mode to minimize distractions during your Pomodoro sessions.
- **Persistent Settings**: Your preferences and timer settings are saved automatically.
- **Native Experience**: Lightweight desktop app with a native feel, thanks to Tauri.

## Prerequisites

- **Node.js**: v18 or later (v20+ recommended)
- **Rust**: Latest stable version
- **Cargo**: Included with Rust installation

## Build & Setup

### 1. Clone the repository
```bash
git clone https://github.com/nrtkKodama/pomodoro-widget.git
cd pomodoro-widget
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the application (Windows)

The build process requires Rust (`cargo`). If `cargo` is not in your system `PATH`, you may need to add it manually or use the following PowerShell command:

```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run tauri build
```

> [!TIP]
> **Cargo Location**: On Windows, Cargo is typically located at `C:\Users\<YourUsername>\.cargo\bin`.

### 4. Run in Development Mode
```bash
npm run tauri dev
```

## Technologies Used

- **Frontend**: React, Vite, TypeScript, Vanilla CSS
- **Backend (Native)**: Rust, Tauri
- **State Management**: React Hooks, localStorage

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
