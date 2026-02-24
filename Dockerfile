FROM rust:1.83-bookworm

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install system dependencies required by Tauri (for cargo check)
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Tauri CLI
RUN cargo install tauri-cli --version "^2" --locked

WORKDIR /app
