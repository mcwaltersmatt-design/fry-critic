# 🍟 Fry Critic

A personal French fry review app. Runs as a PWA — add it to your iPhone home screen for a native app feel.

---

## Deploy in 10 minutes (free)

### Step 1 — Install Node.js
Download from https://nodejs.org (click "LTS"). Install it.

### Step 2 — Create a GitHub account
Go to https://github.com and sign up (free).

### Step 3 — Upload this project to GitHub
1. Go to https://github.com/new
2. Name it `fry-critic`, click **Create repository**
3. On the next page, click **uploading an existing file**
4. Drag the entire `fry-critic` folder contents in and click **Commit changes**

### Step 4 — Deploy to Vercel (free)
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `fry-critic` repo
4. Click **Deploy** — that's it

Vercel will give you a URL like `fry-critic.vercel.app` in about 60 seconds.

---

## Add to your iPhone home screen

1. Open your Vercel URL in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow at the bottom)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

It will appear as an icon on your home screen, open fullscreen with no browser bar, and work offline.

---

## Run locally (optional)

```bash
cd fry-critic
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Notes
- All data is stored in your browser's localStorage — it persists across sessions on the same device/browser
- Images are stored as base64, so keep them under 4MB each
- To back up your data: open browser DevTools → Application → Local Storage → copy the `fry-critic-v3` value
