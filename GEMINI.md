# Project Context: Pomodoro Widget

## Build Environment Requirements

### Rust / Tauri Build
The build process requires Rust (`cargo`). If `cargo` is not in the system `PATH`, it should be added manually during the build command.

**Cargo Location:** `C:\Users\nkoda\.cargo\bin`

#### Build Command (PowerShell)
```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run tauri build
```

> [!IMPORTANT]
> **Build Troubleshooting**:
> 1. Ensure `tauri.conf.json` has `"beforeBuildCommand": "npm run build"` to include latest frontend changes.
> 2. If `npm run build` fails with `tsconfig.node.json` errors, ensure `"composite": true` is set and `"noEmit": true` is removed.

## Features
- **Finish Sound Setting**: Configurable notification sounds (Chime, Digital, Ring, Nature) with a preview button in the Settings menu.
- **Persistent Settings**: All timer and sound settings are preserved in `localStorage`.
