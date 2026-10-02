# SpeakEasy 🗣️ — Free AI English Conversation Teacher

SpeakEasy is a free, modern web application that acts as your personal English conversation coach. Practice speaking and writing English in real time with an intelligent AI teacher powered by Google Gemini, the Web Speech Recognition API, and the Web SpeechSynthesis API.

---

## ✨ Features

- 💬 **Interactive Conversation**: Real-time chat with a friendly AI English teacher who understands what you mean, replies naturally, and keeps the conversation flowing.
- 🎓 **Instant Grammar & Phrasing Corrections**:
  - Automatically identifies grammar errors, improper tenses, and awkward phrasing.
  - Explains the grammatical reason in clear, beginner-friendly terms.
  - Suggests a natural, fluent version of your sentence.
  - Celebrates great English when your sentence is already natural and correct!
- 🎙️ **Voice Input (Speech-to-Text)**:
  - Powered by the native browser `SpeechRecognition` API.
  - Click the microphone button to dictate in English.
  - Words appear in the chat input so you can review and edit before sending.
  - Clear listening indicators with animated recording state.
- 🔊 **Voice Output (Text-to-Speech)**:
  - Powered by the native browser `SpeechSynthesis` API with natural English voices.
  - Listen to any teacher response aloud with the speaker button.
  - One-click stop/pause control.
  - Toggle **Auto-read replies** on or off.
  - Adjustable voice speed (Slow 0.8x, Natural 0.95x, Fast 1.1x).
- 🧭 **5 Focused Practice Modes**:
  1. ☕ **Casual Conversation**: Relaxed everyday chat about hobbies, food, movies, and stories.
  2. 💼 **Job Interview**: Professional workplace English, career questions, and behavioral interview coaching.
  3. 🛍️ **Daily English**: Practical everyday scenarios (ordering coffee, asking directions, shopping, commuting).
  4. ✈️ **Travel English**: Airport check-in, hotel bookings, transit, sightseeing, and dining abroad.
  5. 📖 **Grammar Practice**: Deep grammar coaching, verb tenses, prepositions, and sentence drills (including the classic *"I am go to market yesterday"*).
- 🛡️ **Zero API Key Exposure**: The Gemini API key is kept strictly on the server-side via a Vercel serverless function (`/api/chat`). No secrets are ever exposed in frontend client JavaScript.
- 📱 **Responsive & Accessible**:
  - Full mobile and desktop responsiveness.
  - Keyboard accessible (IME-safe Enter to send, Shift+Enter for new line).
  - High contrast and screen-reader friendly ARIA labels.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Backend**: [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) with model `gemini-3.8-flash`
- **Voice APIs**: Native Browser `webkitSpeechRecognition` / `SpeechRecognition` & `window.speechSynthesis`
- **Deployment**: [Vercel](https://vercel.com/) (SPA + Serverless Functions)

---

## 🚀 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended; v20+ verified)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com)

### 1. Clone or Open the Project

```bash
cd speakeasy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Your Gemini API Key

Copy the example environment template:

```bash
cp .env.example .env
```

Open `.env` and paste your free Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

> **Note**: If you don't provide an API key right away, SpeakEasy will start in **Educational Preview Mode** so you can preview the UI, test voice recognition, and explore sample corrections immediately!

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (preferably Google Chrome, Microsoft Edge, or Safari for complete Web Speech API voice support).

---

## 🔑 How to Get a Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com).
2. Sign in with your Google account.
3. Click on **"Get API key"** in the top navigation.
4. Click **"Create API key"** in a new or existing Google Cloud project.
5. Copy your key and paste it into `.env` as `GEMINI_API_KEY`.

Google AI Studio provides a generous free tier with zero credit card required.

---

## 🚢 Deploying to Vercel

SpeakEasy is pre-configured with `vercel.json` and a serverless API function at `api/chat.js`.

### Method A: Deploy via GitHub (Recommended)

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Initial commit of SpeakEasy English Teacher"
   git remote add origin https://github.com/<your-username>/speakeasy.git
   git branch -M main
   git push -u origin main
   ```
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **"Add New..."** → **"Project"**.
4. Import your `speakeasy` GitHub repository.
5. In the **Environment Variables** section, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `Your Gemini API Key from Google AI Studio`
6. Click **Deploy**. Vercel will build the Vite SPA and deploy the `/api/chat` serverless function automatically.

### Method B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
# When prompted, add your environment variable:
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## 📁 Project Structure

```text
speakeasy/
├── api/
│   └── chat.js                 # Vercel Serverless Function (secure Gemini AI interaction)
├── public/
│   └── favicon.svg             # Custom SVG favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header with voice indicators and controls
│   │   ├── ModeSelector.jsx    # Conversation mode switcher (5 practice modes)
│   │   ├── ChatArea.jsx        # Scrollable chat feed with auto-scroll
│   │   ├── MessageItem.jsx     # Message bubbles, grammar tips, and speech controls
│   │   ├── ChatInput.jsx       # IME-safe input form, mic toggle, and send button
│   │   └── QuickPrompts.jsx    # Contextual starter suggestions for each mode
│   ├── constants/
│   │   └── modes.js            # Mode descriptions, system prompts, and starters
│   ├── hooks/
│   │   ├── useSpeechRecognition.js # Browser Speech-to-Text hook
│   │   └── useSpeechSynthesis.js   # Browser Text-to-Speech hook
│   ├── App.jsx                 # Main application state and coordinator
│   ├── index.css               # Tailwind CSS directives & audio animations
│   └── main.jsx                # React DOM entrypoint
├── .env.example                # Example environment variable template
├── .gitignore                  # Prevents accidental commits of .env and node_modules
├── package.json
├── tailwind.config.js
├── vercel.json                 # Vercel deployment rewrites for API and SPA
├── vite.config.js              # Vite config with local dev server middleware for /api/chat
└── README.md
```

---

## 🔒 Security Best Practices

- `GEMINI_API_KEY` is **never** bundled into the client build.
- Vite dev server middleware securely handles `/api/chat` during local development (`npm run dev`).
- Vercel serverless function (`api/chat.js`) securely handles `/api/chat` in production.
- `.env` is listed in `.gitignore` to prevent secret leaks to public repositories.

---

## ♿ Accessibility (a11y)

- **Keyboard Support**:
  - Press `Enter` to send your message.
  - Press `Shift + Enter` to insert a new line.
  - Uses IME composition guards (`event.isComposing` and `keyCode === 229`) to prevent accidental submission while typing with multilingual input method editors.
- **Screen Reader Support**: Chat message list uses `role="log"` and `aria-live="polite"` so new teacher responses are announced properly.
- **Semantic HTML**: All buttons, inputs, and controls have descriptive `aria-label` attributes.

---

## 📄 License

MIT &bull; Free and open source for English learners worldwide!
