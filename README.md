# ACME HR Policy AI — Angular Frontend

A modern, responsive, privacy-first Angular frontend application connecting to the **HR Policy RAG FastAPI backend** (`http://localhost:8001`).

---

## 🏛️ Structured Architecture

```
src/app/
│
├── core/                         # Core singleton services, models, & constants
│   ├── constants/
│   │   ├── api.constants.ts      # Backend URLs (http://localhost:8001) & timeout config
│   │   └── policy.constants.ts   # Policy categories, catalog meta, & starter questions
│   ├── models/
│   │   ├── chat.model.ts         # ChatMessage, QuestionRequest, AskResponse, PolicySource
│   │   └── policy.model.ts       # Category and Document metadata interfaces
│   └── services/
│       ├── hr-rag-api.service.ts # HttpClient calls to POST /ask and GET / (health check)
│       └── chat-state.service.ts # Angular Signals-based reactive chat state management
│
├── shared/                       # Reusable UI components & pipes
│   ├── components/
│   │   ├── header/               # Sticky header with navigation & live backend health chip
│   │   │   ├── header.component.html
│   │   │   ├── header.component.scss
│   │   │   ├── header.component.spec.ts
│   │   │   └── header.component.ts
│   │   ├── sidebar/              # Quick prompt chips & document shortcut pills
│   │   │   ├── sidebar.component.html
│   │   │   ├── sidebar.component.scss
│   │   │   ├── sidebar.component.spec.ts
│   │   │   └── sidebar.component.ts
│   │   └── source-badge/         # Citation badges with document icon & chunk ID
│   │       ├── source-badge.component.html
│   │       ├── source-badge.component.scss
│   │       ├── source-badge.component.spec.ts
│   │       └── source-badge.component.ts
│   └── pipes/
│       └── markdown-format.pipe.ts # Formats bold, italics, bullet points, and code tags
│
├── features/                     # Route-level feature pages
│   ├── chat/                     # Main interactive AI assistant chat feed
│   │   ├── chat.component.html
│   │   ├── chat.component.scss
│   │   ├── chat.component.spec.ts
│   │   └── chat.component.ts
│   ├── policy-explorer/          # Interactive 6-document policy library catalog
│   │   ├── policy-explorer.component.html
│   │   ├── policy-explorer.component.scss
│   │   ├── policy-explorer.component.spec.ts
│   │   └── policy-explorer.component.ts
│   └── architecture-view/        # Visual RAG lifecycle & design decisions table
│       ├── architecture-view.component.html
│       ├── architecture-view.component.scss
│       ├── architecture-view.component.spec.ts
│       └── architecture-view.component.ts
│
├── app.routes.ts                 # Route definitions (/chat, /explorer, /architecture)
├── app.config.ts                 # Angular providers (provideHttpClient(withFetch()), provideRouter())
├── app.html                      # Root app layout (Header + Sidebar + RouterOutlet)
├── app.scss
├── app.spec.ts
└── app.ts
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure the HR Policy FastAPI backend is running on port `8001`:
```powershell
# From HR Policy backend folder:
cd "C:\Local Disk D\Murugan Project\Projects\AI - Backend\HR Policy - Ask my documents\hr_policy_rag"
& "C:\Local Disk D\Murugan Project\Projects\AI - Backend\Ask My Documents\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8001
```

### 2. Start Angular Development Server
```powershell
cd "C:\Local Disk D\Murugan Project\Projects\AI - FrontEnd\hr-policy-frontend"
npm start
# or: ng serve --port 4200 --open
```

Open your browser at: **`http://localhost:4200`**

---

## 🌟 Key Features
1. **Live Backend Health Monitor**: Automatically pings `http://localhost:8001/` to display real-time connection status (Online/Offline) in the header.
2. **Instant Quick-Test Prompts**: One-click test queries covering Annual Leave, Vacation Days, WFH, Late Arrival, Notice Periods, and Unanswerable crypto questions.
3. **Interactive Source Badges**: Every verified answer displays interactive document badges indicating the exact PDF filename and chunk index used.
4. **Policy Document Catalog (`/explorer`)**: Visual cards for all 6 policy documents with highlights and direct *"Ask AI"* shortcuts.
5. **RAG Architecture Explorer (`/architecture`)**: Complete step-by-step visual diagram explaining the engineering rationale and technology comparison.
