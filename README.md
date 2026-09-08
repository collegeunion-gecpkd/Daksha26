# Daksha'26 — Arts Fest | GEC Palakkad

This is the official web application for **Daksha'26**, the annual Arts and Cultural Fest of Government Engineering College, Palakkad, presented by the Secular College Union.

## 🚀 Technologies

This project is built using a modern frontend stack:
- **React 19**
- **Vite** (Build Tool & Dev Server)
- **React Router** (Routing)
- **SCSS** (Styling)
- **Google Apps Script** (Backend / Live API integration for Leaderboards & Registrations)

## ✨ Features

- **Dynamic Landing Page**: Custom animations and fluid scrolling for an engaging entry point.
- **Live Leaderboard**: Real-time polling to display current batch standings, synced with Google Sheets.
- **Events Explorer & Registration**: Search, filter, and register for events natively inside the web app.
- **PWA Ready**: Offline caching implemented via a Service Worker (`worker.js`) to cache the UI shell and assets.
- **Responsive Design**: Designed Mobile-First with comprehensive SCSS components.

## 🛠️ Setup & Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env` and fill in your Google Apps Script URLs for the backend:
   ```env
   VITE_APPS_SCRIPT_READ_URL=your_google_script_read_url
   VITE_APPS_SCRIPT_REGISTRATION_URL=your_google_script_registration_url
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📜 License
Internal use for GEC Palakkad Secular College Union.
