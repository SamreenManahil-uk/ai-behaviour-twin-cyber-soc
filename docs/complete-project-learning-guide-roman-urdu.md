# AI Behaviour-Twin Cyber SOC — Complete Learning Guide

## 1. Project asal mein kya karta hai?

AI Behaviour-Twin Cyber SOC aik full-stack cyber security portfolio platform
hai. Iska purpose Security Operations Centre, yani SOC, ke analyst workflow ko
demonstrate karna hai.

Kisi organization mein computers aur network systems bohat se events generate
karte hain. Misal ke taur par:

- user login;
- failed login;
- process execution;
- PowerShell activity;
- file access;
- outbound network traffic;
- privilege change;
- unusual destination IP.

Real organization mein in events ki quantity bohat zyada hoti hai. Analyst har
event manually inspect nahi kar sakta. Is platform ka purpose events ko
analyse karna, suspicious behaviour identify karna, alert banana, risk
prioritise karna aur incident-response workflow demonstrate karna hai.

Yeh production SIEM ya EDR nahi hai. Network ML ke liye historical dataset use
hua hai aur endpoint Behaviour Twin ke liye controlled simulated events use
huay hain. Koi real laptop scan, monitoring, isolation ya process termination
nahi hoti.

## 2. Simple security scenario

Samjho aik fictional employee apne Windows endpoint par normally subah 9 baje
login karta hai. Woh Outlook, Chrome aur approved business applications use
karta hai. Uska outbound traffic aur file activity normally limited hota hai.

Aik suspicious event mein:

- login raat 2 baje hota hai;
- multiple login attempts fail hoti hain;
- encoded PowerShell command chalti hai;
- unusual process execute hota hai;
- unknown destination IP contact hoti hai;
- outbound traffic bohat high hota hai;
- privilege activity record hoti hai.

Platform is activity ko multiple approaches se assess kar sakta hai:

1. Deterministic rule engine known suspicious patterns check karta hai.
2. XGBoost labelled network examples se learned supervised threat score deta
   hai.
3. Isolation Forest benign network behaviour ke muqable mein unusualness
   calculate karta hai.
4. Behaviour Twin endpoint ke historical normal profile ke muqable mein
   deviation calculate karta hai.
5. Hybrid engine available signals ko explicit weights ke through combine
   karta hai.
6. Backend alert persist kar sakta hai.
7. SignalR connected analyst dashboard ko real-time notification de sakta hai.
8. Analyst simulated SOAR action request kar sakta hai.
9. Simulated action ka audit record PostgreSQL mein preserve hota hai.

## 3. Day 1 — Machine learning foundation

### Repository structure

Sabse pehle monorepo banaya gaya. Monorepo ka matlab backend, frontend, ML
service, infrastructure aur documentation aik hi Git repository mein organised
hain.

Main folders:

- `backend` ASP.NET Core application ke liye;
- `frontend` React interface ke liye;
- `ml-service` Python ML aur FastAPI ke liye;
- `infrastructure/docker` container orchestration ke liye;
- `docs` technical aur learning documentation ke liye;
- `scripts` repeatable operational commands ke liye.

Is structure ka purpose separation of concerns hai. Har layer ka clear role
hai, lekin sab aik complete platform ke taur par collaborate karti hain.

### Python environment

Python 3.12 virtual environment banaya gaya. Virtual environment dependencies
ko system Python se isolate karta hai.

Requirements files ka purpose:

- `requirements.txt` runtime libraries define karta hai;
- `requirements-dev.txt` testing aur linting tools define karta hai;
- `requirements.lock.txt` exact installed versions record karta hai.

XGBoost ko macOS par OpenMP library chahiye thi, isliye Homebrew se `libomp`
install hua. Isse native XGBoost library successfully load hui.

### UNSW-NB15 dataset

Network threat modelling ke liye official UNSW-NB15 training aur testing split
use hua.

Important boundaries:

- official training data fitting ke liye;
- official testing data final evaluation ke liye;
- test data model training ya threshold selection mein use nahi hua;
- `id` predictor nahi bana;
- `label` target tha;
- `attack_cat` descriptive analysis ke liye tha, predictor nahi.

Yeh separation data leakage prevent karti hai. Data leakage tab hoti hai jab
model ko training ke waqt aisi information mil jaye jo real prediction ke waqt
available nahi hogi.

### EDA

EDA ka matlab Exploratory Data Analysis hai. Is stage mein:

- training aur testing shapes inspect huay;
- binary labels count huay;
- attack categories count hui;
- numeric percentiles calculate huay;
- training-only correlations inspect hui;
- figures aur strict JSON report generate hui.

Correlation model performance nahi hoti. Correlation sirf association describe
karti hai.

### Leakage-safe preprocessing

Categorical features par:

- most-frequent imputation;
- unknown-safe one-hot encoding.

Numeric features par:

- median imputation.

Median outliers ke against mean se zyada robust ho sakti hai. Transformer sirf
training rows par fit hota hai. Test rows ki category vocabulary ya imputation
statistics training mein use nahi hoti.

### XGBoost

XGBoost supervised model hai. Supervised ka matlab training examples ke saath
labels available thay.

Model network features se malicious versus normal classification seekhta hai.

Official test results:

- Accuracy: 0.8753461594519749
- Precision: 0.8234729831940524
- Recall: 0.9846907261978294
- F1: 0.8968946844955243
- ROC-AUC: 0.9840503006646459
- Average precision: 0.9883405461285941

High recall ka matlab test attacks ka large proportion identify hua. Lekin
false positives bhi thay, isliye sirf accuracy dekhna sufficient nahi.

XGBoost score ko calibrated probability claim nahi kiya gaya.

### Isolation Forest

Isolation Forest unsupervised anomaly detector hai. Is project mein model aur
preprocessor sirf training split ke `label=0` benign rows par fit huay.

Attack labels fitting ke liye use nahi huay.

Anomaly threshold benign training score distribution ke 95th percentile se
select hua. Test results threshold selection ke liye use nahi huay.

Official test results:

- Accuracy: 0.5780862847981344
- Precision: 0.845812389842679
- Recall: 0.2858245830759728
- F1: 0.4272641836078548
- ROC-AUC: 0.7700440310048864
- Average precision: 0.8031739458582527

Recall comparatively low hai. Yeh limitation honestly document hui. Anomaly
score attack probability nahi; yeh benign training reference ke muqable mein
unusualness hai.

### Behaviour Twin

Behaviour Twin aik simulated endpoint baseline hai.

Historical normal events se yeh learn karta hai:

- normal login hours;
- failed-login baseline;
- normal file-access count;
- normal outbound bytes;
- usual processes;
- usual destination IPs.

Login hours circular calculation use karte hain. Isliye 23:00 aur 01:00 ko
22-hour difference ke bajaye midnight ke across 2-hour difference samjha ja
sakta hai.

Numeric baselines median aur MAD use karte hain. MAD ka matlab Median Absolute
Deviation hai. Yeh robust method extreme values ke effect ko control karta hai.

Profile sirf historical events se banta hai. Current event profile fitting mein
include nahi hota. Profile score karte waqt mutate bhi nahi hota.

Behaviour deviation 0 se 1 aur risk score 0 se 100 hota hai. Yeh bhi attack
probability nahi hai.

### Hybrid risk engine

Hybrid engine multiple available signals ko explicit documented weights ke
saath combine karta hai.

Iska purpose analyst prioritisation hai. Explanation mein individual signals
alag rehte hain taa-ke analyst samajh sakay final score kis wajah se high hua.

Hybrid score calibrated probability claim nahi karta.

## 4. Day 2 — Secure backend and persistence

### ASP.NET Core API

C# aur ASP.NET Core backend application ki main responsibilities:

- requests receive karna;
- validation karna;
- authentication aur authorization enforce karna;
- business logic execute karna;
- PostgreSQL access karna;
- ML service se internal communication karna;
- safe responses return karna.

Controllers thin rakhe gaye. Complex rules focused services mein rakhe gaye.
Isse code testing aur maintenance ke liye behtar hota hai.

### PostgreSQL and Entity Framework Core

PostgreSQL persistent relational database hai. EF Core C# entities ko database
tables aur relationships ke saath map karta hai.

Main entities:

- User;
- Endpoint;
- SecurityEvent;
- Alert;
- Incident;
- Threat;
- SimulatedResponseAction.

Separate configuration classes table names, columns, indexes, relationships,
delete behaviour, enum strings, decimal precision aur constraints define karti
hain.

Important protections:

- unique normalized user email;
- unique endpoint hostname;
- one alert per security event;
- risk score 0 se 100;
- threat confidence 0 se 100;
- raw payload PostgreSQL `jsonb`;
- restrictive foreign-key deletion;
- UTC timestamps.

### Migrations

Migration database schema ka versioned record hoti hai.

Initial migration SOC tables create karti hai. Day 4 migration simulated SOAR
audit table add karti hai.

Migration files manually fabricate nahi hui; EF tooling se generate hui. Live
local PostgreSQL par schema validate hua.

### Authentication

Login endpoint credentials verify karta hai aur successful login par signed JWT
return karta hai.

Password database mein plain text store nahi hota; password hash use hota hai.

JWT mein identity aur role claims hotay hain. Protected request ke saath Bearer
token send hota hai.

Repository real signing key, default user ya real password store nahi karti.

### Authorization and RBAC

RBAC ka matlab Role-Based Access Control hai.

Main policies:

- `SocOperations` analyst aur admin ko operational access deti hai;
- `AdminOnly` sirf admin role ko sensitive creation/update access deti hai.

Unauthenticated request ko HTTP 401 milta hai.

Authenticated analyst agar Admin-only action request kare to HTTP 403 milta
hai. 401 aur 403 ka difference security interviews mein important hai.

### SOC REST APIs

Backend endpoints, security events, alerts, incidents aur threats ke APIs
provide karta hai.

Validation examples:

- pagination boundaries;
- known enum values;
- valid date ranges;
- unique hostname;
- valid IP address;
- valid domain;
- SHA-256 hash format;
- HTTP/HTTPS URL;
- JSON payload size and syntax;
- decimal score ranges;
- incident status and timestamp consistency.

Raw JSON execute nahi hota. Sirf untrusted data ke taur par parse aur store hota
hai.

### FastAPI integration

Python ML aur C# backend separate services hain.

ASP.NET Core internal HTTP client FastAPI ko network feature object bhejta hai.
FastAPI frozen model bundles se inference karta hai aur model results return
karta hai.

Timeouts aur upstream failures safe ProblemDetails responses mein translate
hotay hain. Raw features logs mein print karne se avoid kiya gaya.

Is separation ka benefit yeh hai ke ML Python ecosystem mein rehta hai aur main
business API .NET ecosystem mein.

## 5. Day 3 — Professional React frontend

Frontend React aur TypeScript se bana.

React reusable UI components aur state-based rendering provide karta hai.
TypeScript compile time par types check karke common errors reduce karta hai.

Implemented pages:

- SOC Overview;
- Security Events;
- Threat Alerts;
- Incidents;
- Endpoints;
- Threat Intelligence;
- MITRE ATT&CK;
- Analytics;
- System Health;
- Settings;
- Login;
- UI Kit;
- Not Found.

Professional UI features:

- responsive sidebar;
- mobile navigation;
- breadcrumbs;
- dark and light mode;
- KPI cards;
- line, bar and donut charts;
- threat carousel;
- interactive tables;
- search and filters;
- pagination;
- badges;
- modal and drawer interfaces;
- confirmation dialogs;
- skeleton loading;
- empty states;
- retryable error states;
- toast notifications;
- keyboard focus;
- protected routes;
- lazy route loading.

System Health page `/api/health` ko live check karti hai. Baqi dashboard records
primarily fictional demo data hain. Yeh distinction user interface mein
honestly communicate hoti hai.

Demo Analyst aur Demo Admin browser modes interface explore karne ke liye hain.
Yeh production database accounts nahi hain.

## 6. Day 4 — Detection, real-time alerts and simulated SOAR

### Deterministic rule engine

Machine learning ke saath transparent deterministic rules bhi add huay.

Example rules:

- encoded PowerShell;
- suspicious PowerShell activity;
- repeated failed logins;
- suspicious Windows utilities;
- privilege activity;
- high outbound bytes.

Rule engine ka benefit explainability hai. Analyst clearly dekh sakta hai ke
kis exact condition ne alert trigger kiya.

### MITRE ATT&CK references

Selected rules relevant technique references provide karte hain:

- PowerShell: T1059.001
- Brute Force: T1110
- System Binary Proxy Execution: T1218
- Exploitation for Privilege Escalation: T1068
- Exfiltration Over C2 Channel: T1041

Yeh complete MITRE coverage claim nahi hai.

### Alert creation transaction

Event creation aur rule-based alert persistence coordinated transaction mein
hoti hai. Agar database operation fail ho to partial state avoid hoti hai.

SignalR publication database commit ke baad hoti hai. Isse dashboard ko aisa
alert publish karne se avoid kiya jata hai jo database mein commit hi na hua ho.

### SignalR

SignalR backend aur frontend ke darmiyan real-time communication demonstrate
karta hai.

Jab alert publish hota hai to connected authenticated client ko notification
mil sakti hai. Hub authentication protected hai.

Demo mode mein real token nahi hota, isliye interface honestly realtime paused
show kar sakti hai.

### Simulated SOAR

SOAR ka matlab Security Orchestration, Automation and Response hai.

Project mein following simulated actions hain:

- Isolate Endpoint;
- Block IP Address;
- Terminate Process;
- Disable Account;
- Collect Forensics.

Har request:

- authentication require karti hai;
- Admin role require karti hai;
- explicit confirmation leti hai;
- reason record karti hai;
- audit entry preserve karti hai;
- `is_simulation=true` enforce karti hai.

Koi real operating-system, endpoint, process, firewall ya account command
execute nahi hota.

## 7. Day 5 — DevSecOps, Docker and final delivery

### GitHub Actions CI

CI ka matlab Continuous Integration hai.

GitHub Actions workflow backend, ML aur frontend ko parallel jobs mein validate
karta hai.

Backend job:

- restore;
- Release build;
- warnings as errors;
- tests;
- format verification.

ML job:

- Python 3.12;
- dependencies;
- pip check;
- Ruff;
- pytest.

Frontend job:

- Node;
- clean `npm ci`;
- security audit;
- tests;
- lint;
- production build.

CI models train nahi karti, Docker services start nahi karti, migrations apply
nahi karti aur production credentials use nahi karti.

### Docker images

Backend Docker image multi-stage build use karti hai. SDK build stage mein
compile hota hai aur final runtime image mein sirf published application hoti
hai.

ML image Python dependencies aur source contain karti hai. Model files image
mein bake nahi hoti; local Compose stack unhein read-only mount karta hai.

Frontend image Node stage mein production build banati hai. Final image Nginx
se static React assets serve karti hai.

Application containers non-root users use karte hain.

### Docker Compose

Docker Compose services ko aik reproducible local stack mein connect karta hai:

- PostgreSQL;
- migration runner;
- ML service;
- backend;
- frontend.

Dependency order ensure karta hai:

- database healthy;
- migration successful;
- ML healthy;
- backend healthy;
- frontend ready.

Host ports sirf `127.0.0.1` par bind hain. PostgreSQL host port 5433 use karta
hai taa-ke unrelated local PostgreSQL ke port 5432 se conflict na ho.

Real local values ignored `.env` mein rehti hain. `.env.example` sirf safe
examples provide karti hai.

### Nginx

Nginx compiled React frontend serve karta hai.

`/api` requests backend container ko proxy hoti hain.

`/hubs` requests aur WebSocket upgrade SignalR backend ko proxy hotay hain.

SPA fallback ki wajah se React routes direct browser refresh par bhi
`index.html` receive karte hain.

### Operational scripts

Start:

    ./scripts/start-local-stack.sh --open

Validate:

    ./scripts/check-local-stack.sh

Security check:

    ./scripts/security-check.sh

Stop:

    ./scripts/stop-local-stack.sh

Stop script containers stop karti hai lekin PostgreSQL named volume delete nahi
karti.

## 8. Testing ka purpose

Tests ka purpose sirf line coverage increase karna nahi. Tests expected security
boundaries ko executable form mein record karte hain.

Final validation covered:

- 128 backend tests;
- 133 Python tests;
- 16 frontend tests;
- warnings-as-errors build;
- backend formatting;
- Python Ruff;
- frontend lint;
- production build;
- dependency checks;
- Docker health checks;
- authentication boundary;
- localhost-only binding;
- model and raw-data hashes;
- ignored local secrets;
- migration completion.

PostgreSQL-specific behaviour pehle live local database ke saath validate hua.
In-memory substitute ko PostgreSQL proof claim nahi kiya gaya.

## 9. Security decisions

Important security decisions:

- real secrets Git mein nahi;
- local `.env` ignored aur mode 600;
- JWT signing material externally supplied;
- plain-text passwords store nahi hotay;
- PostgreSQL application user non-superuser;
- protected routes authentication require karti hain;
- sensitive operations Admin role require karti hain;
- raw JSON execute nahi hota;
- containers non-root users use karte hain;
- services localhost-only hain;
- model artifacts read-only mount hotay hain;
- SOAR database constraint simulation-only enforce karta hai;
- no real endpoint executor exists.

## 10. Project ki limitations

Interview mein limitations honestly batana strength hoti hai.

Current limitations:

- network dataset historical benchmark hai;
- modern production traffic representativeness validate nahi hui;
- dataset overlap ka complete audit pending hai;
- model scores calibrated attack probabilities nahi;
- exhaustive hyperparameter optimisation nahi hui;
- Isolation Forest recall low hai;
- Behaviour Twin events simulated hain;
- frontend ka majority dashboard data fictional hai;
- no live endpoint collector;
- no production SIEM ingestion pipeline;
- no real SOAR execution;
- no token revocation or refresh workflow;
- no managed cloud secrets;
- no production TLS deployment;
- no formal penetration test;
- no production monitoring or backup strategy.

## 11. Interview explanation

### Tell me about this project

I built a full-stack AI Behaviour-Twin Cyber SOC portfolio platform. It combines
supervised XGBoost classification, benign-only Isolation Forest anomaly
detection, simulated endpoint behaviour profiling and explainable hybrid risk
scoring. A FastAPI service exposes frozen model inference, while an ASP.NET Core
API handles authentication, SOC workflows, PostgreSQL persistence, rule
detection, SignalR alerts and simulated SOAR audit actions. The React and
TypeScript frontend provides a professional analyst dashboard. The complete
stack runs through Docker Compose and is validated through automated tests and
GitHub Actions.

### Why did you use both XGBoost and Isolation Forest?

XGBoost learns from labelled normal and attack examples, while Isolation Forest
learns only from benign training behaviour. They answer different questions.
XGBoost asks whether activity resembles labelled attacks. Isolation Forest asks
whether activity is unusual compared with the benign reference. I keep their
scores separate and do not describe either as a guaranteed attack probability.

### What is Behaviour Twin?

Behaviour Twin is a frozen profile of normal simulated endpoint and user
activity. It learns usual login hours, numeric activity baselines, processes
and destination IPs. A new event is compared with that historical profile to
produce explainable deviation signals. It does not collect real endpoint data.

### How did you prevent ML leakage?

I used the official train and test files without mixing them. Preprocessing
statistics and categorical vocabularies were fitted only on training rows.
Identifier, target and descriptive attack-category columns were excluded from
predictors. Isolation Forest fitting and threshold selection used only benign
training rows. Test labels were used only for final evaluation.

### Why separate Python ML and .NET backend?

Python provides mature ML libraries such as scikit-learn and XGBoost. ASP.NET
Core provides structured APIs, authentication, authorization and business
services. Separating them allows each technology to handle the responsibility
it is strongest at and keeps model inference independently testable.

### Why PostgreSQL?

The SOC domain has strongly related entities such as endpoints, events, alerts,
incidents, users and audit actions. PostgreSQL provides transactions,
constraints, indexes, JSONB and reliable relational integrity.

### Why SignalR?

SignalR demonstrates how committed alerts can reach authenticated analyst
interfaces without repeated polling. Publication occurs after database commit
to reduce the chance of showing an alert that was not persisted.

### Is the SOAR real?

No. It is deliberately simulation-only. It demonstrates RBAC, confirmation,
reason capture, policy checks and immutable-style audit history. There is no
code capable of isolating a real endpoint, stopping a process or blocking an
IP.

### What was the biggest challenge?

The main challenge was maintaining honest boundaries while integrating multiple
technologies. ML preprocessing had to avoid leakage, model artifacts had to
remain frozen, backend authorization had to distinguish 401 from 403, database
operations required consistent constraints, and Docker services needed secure
configuration without committing secrets.

### What would you improve next?

I would add securely provisioned real test accounts, richer integration tests
against disposable PostgreSQL, TLS termination, managed secrets, token
revocation, rate limiting, structured observability, background event
processing, model monitoring and a carefully governed endpoint telemetry
connector.

## 12. Final summary

Is project ka strongest point sirf AI model nahi hai. Strong point yeh hai ke
ML ko aik complete software and security workflow mein integrate kiya gaya:

- data preparation;
- model training and evaluation;
- frozen inference;
- secure APIs;
- relational persistence;
- authentication and RBAC;
- analyst interface;
- realtime notifications;
- simulated response audit;
- automated testing;
- Docker orchestration;
- CI validation;
- honest documentation.

Yeh project demonstrate karta hai ke main Python ML, .NET backend, PostgreSQL,
React frontend, Docker aur security engineering concepts ko aik organised
full-stack solution mein combine kar sakti hoon.