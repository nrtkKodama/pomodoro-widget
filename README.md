<div align="center">
  <img src="src-tauri/icons/icon.png" width="128" alt="Pomodoro Widget Logo" />
  
  # 🍅 Pomodoro Widget

  *A lightweight, elegant Pomodoro timer application built with **Tauri**, **React**, and **TypeScript**.*

  [![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

<div align="center">
  <blockquote>
    Designed for focus and simplicity, featuring customizable notification sounds, a clean glassmorphism UI, and nested subtasks. 
  </blockquote>
</div>

<br />

<div align="center">
  <img src="docs/images/preview.png" alt="Pomodoro Widget Preview" width="600" />
  <br />
  <i>(Note: Placeholder for preview image)</i>
</div>

<br />

## ✨ Features

- 🎯 **Customizable Timer**: Set your desired focus and break durations (coming soon).
- 🎵 **Multiple Notification Sounds**: Choose from Chime, Digital, Ring, or Nature sounds to signal the end of a session.
- ⚡ **Focus Mode**: A dedicated mode to minimize distractions during your Pomodoro sessions.
- 🗂️ **Nested Subtasks**: Break down tasks into smaller steps using drag-and-drop or right-click context menus.
- 💾 **Persistent Settings**: Your preferences and timer settings are saved automatically.
- 🚀 **Native Experience**: Lightweight desktop app with a native feel, thanks to Tauri.

## 🛠️ Prerequisites

- **Node.js**: v18 or later (v20+ recommended)
- **Rust**: Latest stable version
- **Cargo**: Included with Rust installation

## 🚀 Build & Setup

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

## 🏗️ Technologies Used

- **Frontend**: React, Vite, TypeScript, Vanilla CSS
- **Backend (Native)**: Rust, Tauri
- **State Management**: React Hooks, localStorage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
