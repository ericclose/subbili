# SubBili

A premium, high-performance UserScript for downloading Bilibili subtitles in SRT and BCC formats. Built with a modern tech stack and featuring a smart diagnosis system to bypass Bilibili's latest anti-scraping measures.

## ✨ Features

- **SRT & BCC Support**: Export subtitles in standard SRT or Bilibili's native BCC JSON format.
- **Sleek Glassmorphism UI**: A modern, interactive interface that blends seamlessly with Bilibili's design.
- **Smart Diagnosis**: Built-in diagnostic panel to monitor network requests and help troubleshoot download failures.
- **Bangumi Support**: Works on both standard videos and Bangumi (anime/shows) pages.
- **Anti-Redirection Logic**: Advanced header handling to bypass Bilibili's latest "Referer-based" redirection protection.
- **Vite-Powered**: Built using Vite and TypeScript for maximum stability and performance.

## 🚀 Installation

1. Install a UserScript manager like [ScriptCat](https://docs.scriptcat.org/) or [Tampermonkey](https://www.tampermonkey.net/).
2. Copy the content of `dist/subbili.user.js`.
3. Create a new script in your manager and paste the code.
4. Save and refresh Bilibili.

## 🛠 Technical Highlights

### Bilibili Anti-Hotlinking Bypass
Bilibili's asset servers (`aisubtitle.hdslb.com`) have implemented a strict policy that redirects subtitle requests to the video detail page if they detect a Referer containing the specific video path. 

This script implements a **Domain-Aware Referer Strategy**:
- **Standard Referer**: Uses `https://www.bilibili.com/` (root) for legacy domains like `i0.hdslb.com` to satisfy hotlinking requirements.
- **No-Referer Policy**: Dynamically strips Referer headers for `aisubtitle` domains to prevent 302 redirections.
- **Signature Protection**: Avoids adding cache-busters (`_t`) that would invalidate Bilibili's URL signatures (`auth_key`).

### Tech Stack
- **TypeScript**: Type-safe development.
- **Vite**: Ultra-fast build tool.
- **vite-plugin-monkey**: Seamless integration for UserScript generation.
- **GM_xmlhttpRequest**: Used for cross-origin requests to bypass browser CSP and Referer restrictions.

## 💻 Development

### Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🐞 Diagnostic Panel
If a download fails, click the **Bug icon (🐞)** in the bottom-right corner. It will show real-time logs of the sniffing and download process. You can use the **Copy** button to share the diagnostic report for troubleshooting.

## 📜 License
MIT
