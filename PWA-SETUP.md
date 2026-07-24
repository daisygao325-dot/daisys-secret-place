# 📱 AAA YVR 办事处 PWA Installation Guide

## What is a PWA?
A Progressive Web App (PWA) is a web app that works like a native app. You can install it on your iPhone home screen and use it offline!

## ✅ Setup Instructions

### Step 1: Start the Server

**Option A: Using Windows (Easiest)**
- Double-click `start-server.bat` in the folder
- The server will start on `http://localhost:3000`

**Option B: Using Command Prompt**
```bash
cd C:\Users\daisy\.gemini\antigravity\scratch\aaa-yvr-roommate
python -m http.server 3000
```

### Step 2: Open on Your iPhone

**On the same WiFi network:**

1. Find your computer's IP address from the server console (e.g., `192.168.1.100`)
2. On iPhone, open Safari
3. Go to: `http://YOUR-IP:3000` (example: `http://192.168.1.100:3000`)
4. The app should load and ask to save to home screen

**Or locally on computer:**
- Just open `http://localhost:3000` in your browser

### Step 3: Add to iPhone Home Screen

Once the app loads in Safari:

1. **Tap the Share button** (↗️ arrow icon at the bottom)
2. **Scroll down and tap "Add to Home Screen"**
3. **Customize the name** (already set to "AAA YVR")
4. **Tap "Add"**

The app will now appear on your home screen like a native app! 🎉

### Step 4: Use the App

- **Tap the icon** to open the app (runs in full screen like a native app)
- **Works offline** - Your data is saved locally in the browser
- **Fast loading** - The app caches files for instant opens
- **No internet needed** after first load

## 📋 Features

✅ Shared expense tracking  
✅ Chore management & reminders  
✅ Roommate status updates  
✅ Notice board  
✅ Offline support  
✅ Works on all devices (iPhone, iPad, Android, Desktop)  

## 🔧 Troubleshooting

**Can't find your computer's IP?**
- Windows: Run `ipconfig` in Command Prompt, look for "IPv4 Address" (usually starts with 192.168 or 10.0)
- Or just use `localhost` if on the same computer

**App not caching properly?**
- Hard refresh: Hold Shift + Click refresh button (desktop) or swipe down hard (iPhone)
- Clear Safari cache: Settings → Safari → Clear History and Website Data

**Service Worker not registering?**
- Make sure you're using HTTP (not file://)
- The server must be running

## 📲 Quick Tips for iPhone

- **Swipe left on home screen** to see your installed PWAs
- **Long press the app icon** to see options (Remove, Share, etc.)
- **Force quit** by swiping up from the bottom (or Command+Tab switching)
- **Data syncs** across devices using localStorage

## 🚀 For Future Updates

When you make changes to the files:
1. Stop the server (Ctrl+C)
2. Save your files
3. Restart the server
4. On iPhone: Swipe down hard in Safari to force refresh

Enjoy! 🎊
