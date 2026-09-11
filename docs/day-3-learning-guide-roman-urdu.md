

## 1. Day 3 ka overall purpose

Day 3 mein humne AI Behaviour-Twin Cyber SOC ka professional frontend banaya.

Is frontend ka purpose security analyst ko aik central interface dena hai jahan woh:

- security events monitor kar sake
- threat alerts investigate kar sake
- incidents manage kar sake
- endpoints ki security posture dekh sake
- threat intelligence indicators inspect kar sake
- MITRE ATT&CK techniques samajh sake
- AI aur anomaly detection signals review kar sake
- system health check kar sake
- apni UI preferences manage kar sake

Ye sirf decorative dashboard nahi hai. Is mein reusable components, routing,
authentication boundary, validation, filters, pagination, charts, drawers,
modals, loading states, error states aur automated tests implement kiye gaye hain.

Important honesty boundary:

- Dashboard ke bohat se SOC records abhi fictional demo data hain.
- Ye data UI workflows demonstrate karta hai.
- System Health page ASP.NET Core ke real `/api/health` endpoint ko call karti hai.
- Authentication client real backend login endpoint ke liye prepared hai.
- Backend band ho to health page honest unavailable state show karti hai.
- Koi real endpoint scan, process termination, IP blocking ya machine isolation nahi hoti.
- Koi simulated SOAR action real computer par execute nahi hota.

---

## 2. Frontend technology stack

### React

React component-based user interfaces banane ke liye use hua.

Humne dashboard ko aik bari file mein banane ke bajaye chote reusable components
mein divide kiya, jaise:

- Sidebar
- Header
- MetricCard
- Button
- Modal
- Drawer
- Pagination
- SearchInput
- SeverityBadge
- charts
- alert details panel

Faida ye hai ke aik component ko multiple pages par consistently reuse kiya ja
sakta hai.

Interview explanation:

“React allowed me to create a component-based SOC dashboard where shared
interface elements such as severity badges, tables, drawers and navigation are
reusable and maintainable.”

### TypeScript

TypeScript JavaScript mein static type safety add karta hai.

Is project mein TypeScript se:

- component properties validate hoti hain
- SOC record structures clearly define hote hain
- invalid severity ya unexpected values jaldi detect hoti hain
- API request aur response contracts document hote hain
- production build ke waqt coding mistakes catch hoti hain

Interview explanation:

“I used TypeScript to create explicit types for alerts, events, incidents,
endpoints and API responses. This reduces runtime mistakes and makes frontend
contracts easier to maintain.”

### Vite

Vite frontend development aur production bundling tool hai.

Is se:

- development server bohat jaldi start hota hai
- code changes browser mein immediately update hoti hain
- TypeScript production build generate hoti hai
- environment variables `VITE_` prefix ke through access hoti hain
- local `/api` calls ASP.NET backend ki taraf proxy hoti hain

Development URL:

`http://127.0.0.1:5173`

### Tailwind CSS

Tailwind CSS utility classes ke through styling provide karta hai.

Is project mein Tailwind se:

- responsive layouts
- consistent spacing
- professional cards
- tables
- buttons
- typography
- dark/light themes
- mobile navigation
- hover and focus states

implement kiye gaye.

### React Router

React Router single-page application ke different pages aur URLs manage karta hai.

Implemented routes:

- `/` — SOC Overview
- `/events` — Security Events
- `/alerts` — Threat Alerts
- `/incidents` — Incident Management
- `/endpoints` — Endpoint Monitoring
- `/threats` — Threat Intelligence
- `/mitre-attack` — MITRE ATT&CK
- `/analytics` — Security Analytics
- `/system-health` — Platform Health
- `/settings` — Analyst Settings
- `/ui-kit` — Reusable Component Preview
- `/login` — Authentication
- unknown route — Professional 404 page

Protected routes ka purpose ye hai ke unauthenticated user ko secure SOC
workspace directly access na mile.

### Axios and Fetch

Axios authentication aur future backend API communication ke liye client layer
mein use hua.

System Health page browser `fetch` ke through real backend health endpoint call
karti hai.

Frontend ko directly har component mein raw API code dene ke bajaye service
files use ki gayi hain:

- `apiClient.ts`
- `authService.ts`
- `socService.ts`

Ye separation maintainability aur testing improve karti hai.

### Recharts

Recharts professional dashboard charts ke liye use hua:

- threat activity chart
- severity distribution
- endpoint/security analytics
- trend visualisation

Charts ka current data demo hai aur isay real measured production telemetry
claim nahi kiya gaya.

### Lucide React

Lucide React consistent SVG icons provide karta hai.

Security dashboard mein icons visual scanning improve karte hain, lekin important
information sirf icon par depend nahi karti. Text labels bhi diye gaye hain.

### Vitest and React Testing Library

Vitest frontend automated test runner hai.

React Testing Library UI ko user ke perspective se test karti hai.

Current tests cover:

- Button interaction
- disabled button behaviour
- severity badge rendering
- settings navigation
- settings local-storage persistence
- live health success state
- health API error state
- accessible route-loading state

Final result:

- 5 test files passed
- 11 tests passed
- 0 failed

---

## 3. Professional design system

Humne aik consistent SOC design system banaya.

Design system mein ye cheezein centralised hain:

- background colours
- surface colours
- border colours
- heading colours
- muted text
- accent colour
- success colour
- warning colour
- danger colour
- spacing
- border radius
- shadows
- typography

Is approach ka faida ye hai ke har page alag aur inconsistent nahi lagta.

Dark aur light mode theme provider ke through manage hota hai. User ka selected
theme browser storage mein preserve ho sakta hai.

Fonts:

- Inter normal interface text ke liye
- JetBrains Mono technical values aur security identifiers ke liye

Interview explanation:

“I created a reusable design system using CSS variables and Tailwind utilities.
This ensures consistent colours, typography, spacing and component states across
both dark and light themes.”

---

## 4. Application shell

Application shell frontend ka common structure hai.

Is mein:

- responsive sidebar
- mobile navigation drawer
- top header
- breadcrumbs
- profile display
- command/search trigger
- notifications indicator
- sign-out action
- main page outlet

include hain.

Desktop par sidebar permanently visible rehti hai. Mobile par woh drawer ban
jati hai taake screen space properly use ho.

Breadcrumbs analyst ko batate hain ke woh dashboard ke kis section mein hai.

Sidebar ki service wording ko honest banaya gaya:

- “SOC workspace active”
- “Open System Health for live service status”

Is se demo interface live backend availability ka false claim nahi karta.

---

## 5. Reusable UI components

### Button

Button different visual variants aur states support karta hai.

Examples:

- primary action
- secondary action
- destructive confirmation
- disabled state
- loading interaction

### Badge and SeverityBadge

Badge small status label show karta hai.

SeverityBadge cyber-security severity ko consistent colour ke saath represent
karta hai:

- Critical
- High
- Medium
- Low

Severity sirf colour se communicate nahi hoti; text bhi visible hota hai.

### Modal

Modal focused action ya form ke liye screen ke centre mein controlled dialog
show karta hai.

### Drawer

Drawer alert, incident ya endpoint details side panel mein show karta hai.
Is se analyst current page lose kiye baghair details investigate kar sakta hai.

### ConfirmDialog

Potentially destructive ya important simulated action se pehle confirmation
leta hai.

### Toast notification

Toast short success ya failure feedback provide karta hai.

Example:

- preferences saved
- incident updated
- simulated action completed
- request failed

### Skeleton

Skeleton API loading ke waqt blank screen ya simple spinner ke bajaye expected
content structure show karta hai.

### EmptyState

Data available na ho to blank page ke bajaye:

- clear message
- icon
- possible next action

show hota hai.

### ErrorState

API failure ki surat mein:

- safe error message
- retry action
- system boundary explanation

show hoti hai.

### SearchInput, Select and Pagination

Large SOC data ke liye:

- keyword search
- severity/status filter
- clear filtering
- controlled pagination

provide ki gayi.

Interview explanation:

“I designed reusable UI primitives so features share the same accessibility,
error handling and styling instead of duplicating markup across every page.”

---

## 6. SOC Overview page

Overview main analyst dashboard hai.

Is page par:

- security score
- analysed events
- critical threats
- protected endpoints
- security posture gauge
- threat activity chart
- severity donut chart
- endpoint health
- recent alerts
- live activity feed
- automatically changing threat carousel

show hote hain.

Carousel sirf decoration ke liye nahi hai. Is ka purpose high-priority threat
context ko compact space mein rotate karna hai.

Current numbers demo data hain. Inhen real organisation statistics claim nahi
karna chahiye.

SOC scenario:

Analyst shift start karta hai. Overview par woh overall risk, critical alerts,
endpoint health aur recent detections quickly review karta hai. Phir relevant
alert ya incident page par investigation continue karta hai.

---

## 7. Security Events page

Security Events page SIEM-style event monitoring represent karti hai.

Features:

- event table
- search
- event-type filters
- severity indicators
- timestamps
- endpoint information
- process/network context
- pagination
- details inspection
- raw JSON-style payload representation

Raw payload ko untrusted text/data treat kiya jata hai. Frontend usay execute
nahi karta.

SIEM concept:

SIEM multiple security sources se events central location par collect, normalise,
search aur analyse karta hai.

Current frontend Wazuh/Elastic-style workflow demonstrate karta hai, lekin ye
production Wazuh ya Elastic deployment ka claim nahi karta.

---

## 8. Threat Alerts page

Alert aik security event se higher-level detection hota hai.

Alert page par:

- severity
- risk score
- detection source
- status
- endpoint
- MITRE mapping
- evidence
- AI signals
- investigation details
- status actions
- simulated response controls

show hote hain.

Detection sources conceptually include:

- Rule
- XGBoost
- Isolation Forest
- Behaviour Twin
- Hybrid

Alert details drawer analyst ko aik alert ka complete context show karta hai
bina main list chhoray.

SOAR-related buttons abhi simulated interface hain. Ye real IP block, process
kill ya endpoint isolation execute nahi karte.

---

## 9. Incident Management page

Incident multiple related alerts ko aik investigation case mein group karta hai.

Incident page features:

- incident search
- severity/status filters
- assigned analyst
- alert count
- incident timeline
- evidence
- status management
- details drawer
- confirmation actions

SOC scenario:

Agar aik endpoint se encoded PowerShell, suspicious network connection aur
privilege escalation alerts milen, analyst in alerts ko aik incident mein group
kar sakta hai.

Incident status workflow:

- Open
- Investigating
- Contained
- Resolved
- Closed

Current actions frontend demonstration hain. Actual database updates backend API
integration ke through perform honge.

---

## 10. Endpoint Monitoring page

Endpoint page EDR-style visibility represent karti hai.

It displays:

- hostname
- operating system
- health/status
- associated user
- last-seen time
- risk score
- alert count
- endpoint details
- behavioural information

EDR concept:

Endpoint Detection and Response endpoint behaviour, processes, file activity,
login activity aur network behaviour monitor karta hai.

Important limitation:

Ye project real agent install nahi karta aur Mac/Windows/Linux machine se live
telemetry collect nahi karta. Endpoint records fictional demo records hain.

---

## 11. Threat Intelligence page

Threat Intelligence page known indicators represent karti hai.

Supported conceptual indicator types:

- IP address
- domain
- URL
- SHA-256 file hash
- process name

Page features:

- indicator search
- type filter
- confidence score
- active/inactive state
- threat source
- first/last seen information
- detailed intelligence view

Threat intelligence ka purpose current security event ke indicator ko known
malicious ya suspicious intelligence ke saath compare karna hai.

Current indicator records safe fictional demo data hain.

---

## 12. MITRE ATT&CK page

MITRE ATT&CK attacker tactics aur techniques ki recognised knowledge base hai.

Frontend MITRE page:

- tactics
- techniques
- technique identifiers
- detection counts
- severity/activity context
- coverage view

represent karti hai.

Example concepts:

- PowerShell
- Command and Scripting Interpreter
- Credential Access
- Privilege Escalation
- Command and Control

MITRE mapping analyst ko ye samajhne mein madad karti hai ke detection attacker
ke kis behaviour ko represent karti hai.

Current mapping UI demonstration hai; automatic backend MITRE mapping future
integration ka part hai.

---

## 13. Security Analytics page

Analytics page SOC trends ko charts aur comparison cards mein show karti hai.

Examples:

- detection volume trend
- severity distribution
- detection source breakdown
- endpoint risk
- alert resolution trend
- model contribution

Current chart data demo hai. Ye actual business production measurement nahi hai.

Analytics ka purpose raw records ko decision-support information mein convert
karna hai.

---

## 14. Authentication UI

Login page professional authentication experience provide karti hai.

Frontend authentication architecture mein:

- login form
- form validation
- authentication service
- API client
- auth context
- auth provider
- protected route
- sign-out action
- user/role representation

include hain.

JWT concept:

Backend successful login ke baad signed access token return karta hai. Frontend
token ko authorized API requests ke saath Bearer token ke form mein send karta
hai.

RBAC concept:

Role-Based Access Control user ke role ke mutabiq permissions restrict karta hai.

Project roles:

- Admin
- SOC Analyst

Actual database login ke liye ASP.NET backend, PostgreSQL aur valid user record
required hoga. Day 2 mein intentionally real credentials seed nahi kiye gaye.

Agar demo access available hai to woh portfolio UI demonstration hai, production
authentication nahi.

Security limitations:

- production mein HTTPS required hai
- long-term token storage security carefully design karni hogi
- refresh-token system future improvement hai
- token revocation future improvement hai
- account lockout/rate limiting future improvement hai

---

## 15. System Health page

System Health page real ASP.NET Core health endpoint call karti hai:

`GET /api/health`

Vite development proxy request ko forward karta hai:

Frontend:

`http://127.0.0.1:5173/api/health`

Backend:

`http://127.0.0.1:5080/api/health`

Agar backend running ho:

- HTTP 200
- Operational
- service name
- version

show hota hai.

Agar backend band ho:

- `ECONNREFUSED`
- Attention
- API unavailable
- Retry button

show hota hai.

Ye graceful error handling hai, frontend failure nahi.

FastAPI aur PostgreSQL ke liye “Configured” status architecture mein integration
represent karta hai. Sirf ASP.NET health status live verify hota hai.

Interview explanation:

“I implemented graceful health monitoring. The interface distinguishes a live
verified API result from services that are only configured, avoiding misleading
operational claims.”

---

## 16. Settings page

Settings page mein:

- analyst profile section
- dashboard preferences
- security information
- accessible toggles
- local save feedback

include hain.

Preferences browser `localStorage` mein save hoti hain.

Current preferences frontend-only hain; organisation-wide settings backend mein
persist nahi hotin.

Security section JWT, RBAC, password hashing aur production HTTPS expectations
explain karti hai.

---

## 17. Responsive design

Dashboard mobile, tablet aur desktop layouts support karta hai.

Responsive features:

- desktop sidebar
- mobile drawer navigation
- flexible cards
- responsive chart containers
- horizontally manageable tables
- stacked mobile filters
- adaptive spacing
- touch-friendly controls

Responsive design important hai kyun ke analysts different screen sizes aur
operations environments mein dashboard access kar sakte hain.

---

## 18. Accessibility

Implemented accessibility considerations:

- semantic buttons
- accessible labels
- visible focus states
- keyboard-accessible settings navigation
- dialog/drawer controls
- status text with icons
- screen-reader loading announcement
- severity text in addition to colour
- readable colour contrast
- meaningful headings

Route loader `role="status"` aur `aria-live="polite"` use karta hai, jis se
assistive technology ko page loading ka pata chalta hai.

---

## 19. Loading, empty and error states

Professional application sirf successful data state design nahi karti.

Humne teen important states banaye:

### Loading state

Skeleton UI expected content structure show karti hai.

### Empty state

Data na ho to message aur possible action show hota hai.

### Error state

API fail ho to safe explanation aur Retry control show hota hai.

Ye production-quality UX ka important part hai.

---

## 20. Performance optimisation

Initially complete application aik large JavaScript bundle mein build ho rahi thi.

Initial bundle approximately:

- 896 KB JavaScript

Humne React `lazy()` aur `Suspense` ke through route-level code splitting add ki.

Optimised output:

- main application bundle approximately 342 KB
- chart library approximately 357 KB separate lazy chunk
- each SOC page separate smaller chunk
- loading ke liye RouteLoader component

Is ka matlab user initial visit par tamam pages ka JavaScript aik saath download
nahi karta. Required page navigation par load hota hai.

Interview explanation:

“I reduced the initial bundle by implementing route-level lazy loading. Heavy
chart functionality is now separated from the application shell and loaded only
when a relevant page is requested.”

---

## 21. Automated frontend testing

Testing stack:

- Vitest
- React Testing Library
- Testing Library user-event
- jsdom

Tests user-visible behaviour verify karte hain, internal implementation details
nahi.

Validated areas:

1. Button click execute hota hai.
2. Disabled button action execute nahi karta.
3. Four severity badges render hote hain.
4. Settings preference localStorage mein save hoti hai.
5. Settings navigation accessible button se work karti hai.
6. Successful API response Operational state show karta hai.
7. Failed API request safe Retry state show karti hai.
8. Lazy route loader assistive technology ko loading announce karta hai.

Results:

- 5 test files
- 11 tests
- all passed
- no skipped tests
- no failed tests
