plz mhe desc do repo kay liye 
# AI Behaviour-Twin Cyber SOC
## Day 1 aur Day 2 Learning Guide — Roman Urdu

Yeh document explain karta hai ke humara project asal mein kya kar raha hai, security event kahan se aata hai, system us event ke saath kya karta hai aur har stage ko kaunsi technology handle karti hai.

---

# 1. Project kya kar raha hai?

Project ka naam hai:

**AI Behaviour-Twin Cyber SOC & Endpoint Security Platform**

Yeh ek professional portfolio prototype hai jo Security Operations Centre yani SOC ka workflow demonstrate karta hai.

SOC ek organisation ki cybersecurity monitoring team hoti hai. SOC analysts computers, servers, users aur network ki security activities monitor karte hain. Suspicious activity milne par analyst:

- Security alert dekhta hai
- Event investigate karta hai
- Risk aur severity samajhta hai
- Related alerts ko incident mein group karta hai
- Response action recommend karta hai

Humara project isi workflow ko software ki form mein implement kar raha hai.

Project ka overall process:

1. Windows/Linux endpoint ya network ka event receive hota hai.
2. Backend event ki values aur JSON validate karta hai.
3. Event PostgreSQL database mein save hota hai.
4. Event ke network features Python ML service ko bheje jate hain.
5. XGBoost known malicious patterns check karta hai.
6. Isolation Forest unusual network behaviour check karta hai.
7. Behaviour Twin user/endpoint ke normal behaviour se deviation check karta hai.
8. Hybrid Risk Engine detection signals combine karta hai.
9. Final risk score aur severity calculate hoti hai.
10. Suspicious activity ke liye alert manage kiya jata hai.
11. Related alerts ko incident mein group kiya jata hai.
12. Future React dashboard par SOC analyst investigation manage karega.

Important honesty:

- XGBoost aur Isolation Forest real trained ML models hain.
- UNSW-NB15 real public cybersecurity dataset hai.
- Model evaluation results real hain.
- ASP.NET APIs, PostgreSQL, JWT aur RBAC real implementations hain.
- Behaviour Twin simulated endpoint history use karta hai.
- Real endpoint collector abhi implement nahi hua.
- Future SOAR actions safely simulated honge.
- Yeh enterprise production EDR ya SIEM hone ka claim nahi karta.

---

# 2. Practical security scenario

Maan lo organisation ka fictional Windows endpoint hai:

- Endpoint ID: WIN-EMP-042
- User ID: employee-042
- Normal login time: subah 8 se 10 baje
- Usual processes: chrome.exe, outlook.exe aur code.exe
- Failed logins: normally 0 ya 1
- Usual destination IPs: company services
- Outbound traffic: normally limited

Achanak raat 2 baje event generate hota hai:

- 8 failed login attempts
- powershell.exe execute hua
- Encoded PowerShell command use hui
- Bohat zyada files access hui
- Unusually high outbound network traffic hua
- New destination IP se connection bana
- Privilege event detect hua

Ab system ke andar following stages chalengi.

---

# 3. Event receive aur validate karna

Security event ASP.NET Core API par receive hota hai.

Is stage ko handle karne wali technologies:

- C#
- ASP.NET Core
- REST API
- DataAnnotations
- Explicit domain validation

Backend check karta hai:

- Endpoint ID present hai?
- Timestamp valid hai?
- Required fields present hain?
- Raw payload valid JSON hai?
- Numeric values valid range mein hain?
- Payload allowed size se bara to nahi?
- Enum value recognised hai?

Iski zaroorat kiu hai?

Security event external aur untrusted input hota hai. Galat, incomplete ya malicious data ko database aur ML model tak pohanchne se pehle reject karna zaroori hai.

Interview explanation:

> ASP.NET Core acts as the trusted API boundary. It validates untrusted event data before persistence or ML inference.

---

# 4. Event database mein save karna

Validated event PostgreSQL ke `security_events` table mein save hota hai.

Is stage ko handle karne wali technologies:

- PostgreSQL
- Entity Framework Core
- Npgsql
- EF Core migrations
- JSONB

PostgreSQL ka purpose:

- Security events permanently store karna
- Endpoints, alerts aur incidents ke relationships maintain karna
- Events search aur filter karna
- Investigation history preserve karna

Raw payload `jsonb` format mein store hota hai.

JSONB kiu use kiya?

Security tools different structures ke events bhej sakte hain. JSONB flexible raw event information store kar sakta hai jab ke important common values normal database columns mein rehti hain.

Raw JSON sirf parse aur store hota hai. Isko execute nahi kiya jata.

Interview explanation:

> PostgreSQL stores structured SOC records while JSONB preserves flexible untrusted event payloads without executing them.

---

# 5. Event ML service ko bhejna

ASP.NET Core validated network features Python FastAPI service ko HTTP request mein bhejta hai.

Is stage ko handle karne wali technologies:

- ASP.NET Core typed HttpClient
- REST
- JSON
- Python FastAPI
- Pydantic

ASP.NET aur Python separate kiu hain?

ASP.NET Core handle karta hai:

- Authentication
- Authorization
- Database
- Business logic
- Alerts
- Incidents
- Threat intelligence

Python FastAPI handle karta hai:

- ML model loading
- Preprocessing
- XGBoost prediction
- Isolation Forest scoring
- Behaviour Twin scoring
- Hybrid risk calculation

Python ML ecosystem ke liye strong hai. ASP.NET Core enterprise backend aur strongly typed business APIs ke liye strong hai.

Interview explanation:

> I separated the enterprise API and ML inference responsibilities. ASP.NET Core handles business workflows while FastAPI serves the Python models.

---

# 6. XGBoost known threat detection

XGBoost current event ko labelled training data se seekhe gaye patterns ke against analyse karta hai.

XGBoost ka sawal:

> Kya current network event known malicious traffic pattern se match karta hai?

Possible response:

- Classification: malicious
- Predicted malicious: true
- Supervised threat score: 0.88

XGBoost supervised learning model hai.

Supervised learning ka matlab:

Training ke waqt model ko network features ke saath correct labels bhi diye gaye:

- 0 = normal
- 1 = attack

Model features aur correct result ka relationship learn karta hai.

XGBoost kiu use kiya?

- Tabular data par strong performance
- Non-linear relationships learn karta hai
- Complex feature interactions handle karta hai
- Efficient training aur prediction
- Cybersecurity network-flow classification ke liye suitable

Important:

XGBoost score ko guaranteed attack probability nahi kehna. Yeh model score hai.

---

# 7. Isolation Forest anomaly detection

Isolation Forest current event ko benign training behaviour ke against analyse karta hai.

Isolation Forest ka sawal:

> Kya current event normal network behaviour ke comparison mein unusual hai?

Possible output:

- Predicted anomaly: true ya false
- Anomaly score: 0 se 1
- Anomaly risk score: 0 se 100

Isolation Forest unsupervised anomaly detector hai.

Training ke waqt:

- Sirf benign training rows use hui
- Attack rows fitting mein use nahi hui
- Test rows fitting mein use nahi hui
- Test results threshold select karne mein use nahi hue

Anomaly score ka meaning:

- 0 ke paas: normal behaviour ke zyada similar
- 1 ke paas: zyada unusual

Anomaly score attack probability nahi hai.

Isolation Forest kiu add kiya?

XGBoost known labelled attack patterns identify karta hai. Isolation Forest unusual patterns detect karne mein help karta hai jo known labelled attack se match na bhi karein.

Interview explanation:

> Isolation Forest complements XGBoost by identifying unusual behaviour relative to benign training data.

---

# 8. Behaviour Twin analysis

Behaviour Twin ek specific endpoint aur user ka historical normal profile banata hai.

Profile following behaviour learn karta hai:

- Normal login time
- Failed login baseline
- File access baseline
- Outbound network traffic baseline
- Usual process names
- Usual destination IP addresses
- PowerShell usage pattern

Behaviour Twin current event ke liye check karta hai:

- Login time unusual hai?
- Failed logins excessive hain?
- Process unusual hai?
- PowerShell rare hai?
- Encoded command use hui?
- File activity abnormal hai?
- Outbound traffic abnormal hai?
- Destination IP new hai?
- Privilege event hua?

Possible output:

- Behaviour deviation: 0 se 1
- Behaviour risk score: 0 se 100
- Per-signal scores
- Human-readable evidence

Example evidence:

- Unusual login time
- Excessive failed logins
- Encoded PowerShell command
- New destination IP
- Abnormal outbound network traffic
- Privilege activity detected

Behaviour deviation attack probability nahi hai.

Behaviour Twin ki technologies/methods:

- Custom Python component
- Median
- MAD: Median Absolute Deviation
- Circular-hour handling
- Frequency-based process learning
- Frequency-based destination-IP learning
- Strict JSON profile persistence

Circular-hour handling kiu?

Raat 11 baje aur raat 1 baje mathematically sirf 2 hours apart hain. Normal subtraction inko 22 hours apart samajh sakti hai. Circular calculation midnight boundary ko correctly handle karti hai.

Median/MAD kiu?

Security data mein extreme values ho sakti hain. Median aur MAD outliers ke against mean aur standard deviation se zyada robust hote hain.

Important limitation:

Behaviour Twin simulated historical endpoint events par tested hai. Isko real enterprise endpoint telemetry par validate nahi kiya gaya.

---

# 9. Hybrid Risk Engine

Hybrid Risk Engine multiple detection signals combine karta hai.

Possible signals:

- XGBoost supervised threat score
- Isolation Forest anomaly score
- Behaviour Twin deviation
- Future rule-based detection signal

Hybrid engine kiu banaya?

Koi single model perfect nahi hota.

Example:

- XGBoost known attack pattern identify karta hai.
- Isolation Forest unusual network behaviour identify karta hai.
- Behaviour Twin user ke personal normal pattern se deviation identify karta hai.
- Rule engine encoded PowerShell jaisa explicit indicator identify kar sakta hai.

Multiple independent signals agree karein to event ka final risk zyada ho sakta hai.

Possible output:

- Hybrid risk: 85.9/100
- Severity: Critical
- Explanation: kaun se signals ne score increase kiya

Hybrid risk calibrated attack probability nahi. Yeh SOC triage aur prioritisation score hai.

---

# 10. Alert aur incident workflow

Suspicious event se security alert create ya manage kiya ja sakta hai.

Alert example:

- Threat: Suspicious PowerShell Execution
- Severity: Critical
- Risk Score: 94
- Endpoint: WIN-EMP-042
- Detection Source: Hybrid
- Status: New

Alert ka purpose:

Raw event ko analyst ke liye actionable security finding mein convert karna.

Incident example:

- Title: Possible Windows Endpoint Compromise
- Severity: Critical
- Status: Investigating
- Related alerts:
  - Encoded PowerShell
  - New destination IP
  - Privilege escalation

Incident ka purpose:

Multiple related alerts ko ek investigation case mein group karna.

Is workflow ko handle karne wali technologies:

- ASP.NET Core services
- PostgreSQL
- Entity Framework Core
- Database transactions
- JWT authentication
- RBAC

Transaction kiu use hoti hai?

Incident create karte waqt multiple alerts attach ho sakte hain. Transaction ensure karti hai:

- Ya complete operation successful ho
- Ya complete operation rollback ho

Half-created incident database mein nahi rehta.

---

# 11. Day 1 ka main purpose

Day 1 mein humne project ka AI/ML threat-detection engine banaya.

Day 1 ke important tasks:

- Professional folder structure
- Python virtual environment
- Cybersecurity dataset
- Data inspection
- Leakage prevention
- EDA
- Preprocessing pipeline
- XGBoost training
- Isolation Forest training
- Behaviour Twin
- Hybrid Risk Engine
- Evaluation
- Model persistence
- Automated tests

---

# 12. Professional monorepo structure

Project folders:

- `backend/`: ASP.NET Core API
- `ml-service/`: Python ML service
- `frontend/`: React dashboard
- `infrastructure/`: Docker configuration
- `docs/`: project documentation
- `scripts/`: automation utilities
- `.github/`: future CI/CD workflows

Kiu?

Different responsibilities ko separate rakhne se project:

- Maintainable hota hai
- Testable hota hai
- Deploy karna asaan hota hai
- Interview mein professional lagta hai

---

# 13. Python environment

Python version:

- Python 3.12

Virtual environment:

- `ml-service/.venv`

Virtual environment kiu?

Project dependencies ko Mac ki global Python installation aur doosre projects se separate rakhta hai.

Important libraries:

- Pandas: dataset read aur transform
- NumPy: numerical calculations
- Scikit-learn: preprocessing, metrics aur Isolation Forest
- XGBoost: supervised threat classifier
- Joblib: trained models save/load
- Matplotlib: charts
- Pytest: automated testing
- Ruff: linting
- FastAPI: ML REST service
- Pydantic: request validation
- Uvicorn: API server

Mac par XGBoost ke liye Homebrew `libomp` runtime bhi install hua.

---

# 14. UNSW-NB15 dataset

Humne UNSW-NB15 cybersecurity dataset use kiya.

Official dataset split:

- Training: 175,341 rows
- Testing: 82,332 rows

Attack categories:

- Analysis
- Backdoor
- DoS
- Exploits
- Fuzzers
- Generic
- Reconnaissance
- Shellcode
- Worms
- Normal

Dataset kiu use kiya?

- Free public dataset
- Cybersecurity-focused
- Normal aur attack traffic dono
- Multiple attack categories
- Official train/test split
- Portfolio project ke liye recognised benchmark

Limitation:

UNSW-NB15 historical laboratory dataset hai. Yeh modern production network ka exact representation nahi.

---

# 15. Data leakage prevention

Model predictors se remove kiya:

- `id`
- `label`
- `attack_cat`

`label` correct answer hai.

`attack_cat` attack category reveal karta hai.

`id` sirf row identifier hai.

Agar model ko target-related information input mein mil jaye to model genuine network behaviour seekhne ke bajaye answer dekh leta hai. Isko data leakage kehte hain.

Interview explanation:

> I removed identifier and target-related columns to prevent data leakage and obtain a more honest evaluation.

---

# 16. Exploratory Data Analysis

EDA mein inspect kiya:

- Dataset shape
- Train/test schemas
- Normal aur malicious distribution
- Attack category counts
- Missing values
- Infinite values
- Numeric statistics
- Percentiles
- Training-only correlations
- Distribution charts

Strong descriptive associations mein:

- `sttl`
- `ct_state_ttl`
- `dload`

Important:

Correlation model performance nahi. Yeh sirf do variables ke relationship ko describe karti hai.

---

# 17. Leakage-safe preprocessing

Categorical features ke liye:

- Mode imputation
- One-hot encoding
- Unknown category handling

Numeric features ke liye:

- Median imputation
- Infinite value rejection

Preprocessing sirf training data par fit hui.

Test data se medians ya categories learn nahi ki gayin.

Median kiu use ki?

Network traffic mein extreme values ho sakti hain. Median outliers se comparatively kam affect hoti hai.

One-hot encoding kiu?

ML models `tcp`, `udp` ya service names jaisi strings directly process nahi karte. One-hot encoding categories ko numerical columns mein convert karti hai.

---

# 18. XGBoost results

XGBoost test metrics:

- Accuracy: 0.875346
- Precision: 0.823473
- Recall: 0.984691
- F1-score: 0.896895
- ROC-AUC: 0.984050
- Average precision: 0.988341

Confusion matrix:

- Normal correctly detected: 27,431
- Normal incorrectly flagged: 9,569
- Attacks missed: 694
- Attacks correctly detected: 44,638

Cybersecurity interpretation:

Recall approximately 98.47 percent hai. Iska matlab model ne most attacks detect kar liye.

Lekin 9,569 false positives hain. Isse real SOC environment mein alert fatigue ho sakti hai.

Isliye hum sirf accuracy show nahi karte. Precision, recall, F1, ROC-AUC aur confusion matrix bhi report karte hain.

---

# 19. Isolation Forest results

Isolation Forest test metrics:

- Accuracy: 0.578086
- Precision: 0.845812
- Recall: 0.285825
- F1-score: 0.427264
- ROC-AUC: 0.770044
- Average precision: 0.803174
- Normal-row false-positive rate: 0.063838
- Benign training rows: 56,000

Interpretation:

Precision achhi hai lekin recall low hai. Har malicious event statistically unusual nahi hota.

Isliye Isolation Forest XGBoost ka replacement nahi. Yeh complementary anomaly signal hai.

---

# 20. Model artifacts

Saved trained models:

- `ml-service/models/xgboost-network-v1.joblib`
- `ml-service/models/isolation-forest-network-v1.joblib`

Model bundles contain:

- Fitted preprocessor
- Trained model
- Expected feature names
- Model version
- Training metadata
- Package versions
- Threshold/reference information

Model files Git-ignored hain.

Security point:

Joblib/Pickle files executable deserialization risk rakh sakti hain. Sirf trusted locally generated model bundles load karne chahiye. Unknown downloaded Joblib file load nahi karni chahiye.

---

# 21. Day 2 ka main purpose

Day 2 mein Day 1 ML engine ko secure SOC backend service mein convert kiya.

Day 2 ke tasks:

- ASP.NET Core API
- Swagger/OpenAPI
- PostgreSQL
- EF Core entities
- Initial migration
- Docker PostgreSQL
- JWT authentication
- Password hashing
- RBAC
- SOC REST APIs
- Input validation
- Incident business rules
- FastAPI ML microservice
- ASP.NET-to-FastAPI integration
- Automated tests
- Security validation

---

# 22. ASP.NET Core backend

Main business backend C# aur ASP.NET Core mein bana.

ASP.NET Core kiu use kiya?

- Strongly typed language
- Enterprise backend ecosystem
- Dependency injection
- Built-in authentication/authorization
- Professional API architecture
- EF Core integration
- Excellent automated testing support

Health route:

- `GET /api/health`

Health endpoint check karta hai ke application alive hai.

---

# 23. Swagger aur OpenAPI

Swagger URL in Development:

- `http://localhost:5080/swagger/index.html`

Swagger show karta hai:

- Available routes
- Request models
- Response models
- Validation requirements
- Bearer token authentication

OpenAPI machine-readable API specification hai. Swagger us specification ka interactive interface hai.

---

# 24. PostgreSQL database entities

## User

Stores:

- User identity
- Email
- Password hash
- Role
- Account status
- Timestamps

Password plain text mein store nahi hota.

## Endpoint

Stores:

- Hostname
- Operating system
- Status
- Last-seen time
- Created/updated time

Hostname unique configured hai.

## Security Event

Stores:

- Endpoint reference
- Event type
- Severity
- Source
- Event timestamp
- Raw JSON payload
- Ingestion timestamp

## Alert

Stores:

- Related security event
- Endpoint
- Title
- Description
- Severity
- Status
- Risk score
- Detection source
- Future MITRE fields
- Incident relationship

## Incident

Stores:

- Title
- Description
- Severity
- Status
- Assigned analyst
- Related alerts
- Resolution timestamp

## Threat

Stores threat-intelligence indicators:

- IP address
- Domain
- File hash
- URL
- Process name
- Confidence score
- Source
- First/last-seen time
- Active status

---

# 25. Entity Framework Core

EF Core C# entities ko PostgreSQL tables ke saath map karta hai.

Configured features:

- Snake_case tables and columns
- Primary keys
- Foreign keys
- Unique constraints
- String maximum lengths
- Decimal precision
- Check constraints
- UTC timestamps
- Enum values as readable strings
- Restrictive delete behaviours
- JSONB payload

Restrict delete kiu?

User, endpoint ya incident delete hone se historical security records automatically delete nahi hone chahiye.

---

# 26. Database migration

Initial migration:

- `InitialSocSchema`

Migration database schema ka version-controlled blueprint hai.

Migration PostgreSQL par exactly once apply ki gayi.

Verified tables:

- users
- endpoints
- security_events
- alerts
- incidents
- threats
- __EFMigrationsHistory

---

# 27. Docker PostgreSQL

PostgreSQL container mapping:

- Host: `127.0.0.1:5433`
- Container: `5432`

Port 5433 kiu?

Mac par unrelated `ai-support-postgres` container already port 5432 use kar raha tha. Usko stop ya modify kiye baghair Cyber SOC database ko host port 5433 diya.

`127.0.0.1` kiu?

Database ko sirf local computer tak restrict karne ke liye.

Docker volume kiu?

Container stop hone ke baad bhi database files preserve hoti hain.

Credentials:

- Real credentials ignored `.env` file mein
- Safe template `.env.example` mein
- Password Git mein nahi

---

# 28. JWT authentication

Routes:

- `POST /api/auth/login`
- `GET /api/auth/me`

Successful login JWT access token deta hai.

JWT identify karta hai:

- User
- Email
- Role
- Issuer
- Audience
- Expiration

Protected requests mein:

- `Authorization: Bearer TOKEN`

Security validation:

- Signing key minimum required length
- Valid issuer
- Valid audience
- Valid lifetime
- Token signature
- Token expiration

Tests ke logs mein invalid JWT configuration errors intentionally aaye thay. Woh negative security tests thay jo prove karte hain ke insecure settings ke saath application start nahi hoti.

---

# 29. RBAC

Roles:

- Admin
- SocAnalyst

Policies:

- AdminOnly
- SocOperations

Difference:

- 401: User authenticated nahi
- 403: User authenticated hai lekin required permission nahi

Example:

SOC Analyst events aur alerts dekh sakta hai. Endpoint ya threat configuration ke Admin-only operation par usko 403 milta hai.

---

# 30. SOC REST API routes

Authentication:

- POST `/api/auth/login`
- GET `/api/auth/me`

Endpoints:

- GET `/api/endpoints`
- GET `/api/endpoints/{id}`
- POST `/api/endpoints`
- PATCH `/api/endpoints/{id}`

Security events:

- GET `/api/security-events`
- GET `/api/security-events/{id}`
- POST `/api/security-events`

Alerts:

- GET `/api/alerts`
- GET `/api/alerts/{id}`
- PATCH `/api/alerts/{id}`

Incidents:

- GET `/api/incidents`
- GET `/api/incidents/{id}`
- POST `/api/incidents`
- PATCH `/api/incidents/{id}`

Threat intelligence:

- GET `/api/threats`
- GET `/api/threats/{id}`
- POST `/api/threats`
- PATCH `/api/threats/{id}`

ML prediction:

- POST `/api/predict`

---

# 31. Backend validation rules

Implemented validation examples:

- Duplicate hostname reject
- Missing endpoint reject
- Invalid IP address reject
- Invalid domain reject
- Invalid SHA-256 hash reject
- Invalid URL reject
- Risk/confidence score outside 0–100 reject
- Invalid date range reject
- Unknown enum reject
- Invalid or oversized JSON reject
- Duplicate active threat indicator reject
- Incident with missing alert reject
- Already assigned alert reject
- Server-side timestamps
- Correct resolved/reopened timestamps

Purpose:

Client se receive hone wale data par blindly trust nahi karna.

---

# 32. FastAPI ML service

FastAPI routes:

- `GET /health`
- `POST /v1/predict/network`
- `POST /v1/risk/hybrid`
- `POST /v1/behaviour/score`

FastAPI trained Python models ko REST API ke through available karta hai.

Pydantic:

- Input schema validate karta hai
- Incorrect types reject karta hai
- Non-finite numbers reject karta hai
- Structured responses generate karta hai

Uvicorn:

FastAPI application ko HTTP server ki form mein run karta hai.

---

# 33. ASP.NET to FastAPI integration

Complete request flow:

1. Client ASP.NET `/api/predict` call karta hai.
2. ASP.NET authentication check karta hai.
3. ASP.NET feature payload validate karta hai.
4. Typed HttpClient FastAPI ko request bhejta hai.
5. FastAPI XGBoost aur Isolation Forest load karta hai.
6. Models prediction produce karte hain.
7. FastAPI structured JSON return karta hai.
8. ASP.NET safe response client ko return karta hai.

Typed HttpClient features:

- Configurable base URL
- Timeout
- JSON serialization
- Cancellation
- Dependency injection
- Central error handling
- Automated testing

Agar FastAPI unavailable ho:

ASP.NET safe `503 Service Unavailable` ProblemDetails response de sakta hai.

Raw event features logs mein print nahi kiye jate.

---

# 34. Real integration result

Real tested flow:

- ASP.NET Core
- FastAPI
- XGBoost model
- Isolation Forest model
- Response back to ASP.NET

Result:

- HTTP status: 200
- Classification: malicious
- XGBoost score: 0.880842
- Isolation Forest anomaly score: 0.801571
- Hybrid risk: 85.919
- Severity: Critical

Official test row ka true label normal tha.

Isliye yeh result false positive tha.

Professional point:

Humne false positive hide nahi kiya. Honest ML evaluation mein successful aur incorrect predictions dono document karne chahiye.

---

# 35. Automated testing

Final Day 2 validation:

- .NET tests: 96 passed
- Python/FastAPI tests: 133 passed
- Ruff: passed
- Dotnet formatting: passed
- Git diff validation: passed
- Live ASP.NET-to-FastAPI integration: passed
- Model hashes unchanged
- Credentials Git-ignored
- Ports 8001 aur 5080 safely closed

Database smoke test:

1. Fictional endpoint/event transaction mein insert hua.
2. Database se read-back verify hua.
3. Transaction rollback hui.
4. Confirm hua ke test rows remain nahi kartin.

Koi real endpoint, real user password, malware ya destructive endpoint action use nahi hua.

---

# 36. Technology responsibility summary

| Technology | Project mein kaam |
|---|---|
| Python | ML training aur inference |
| Pandas | Dataset processing |
| NumPy | Numerical calculations |
| Scikit-learn | Preprocessing, metrics aur anomaly detection |
| XGBoost | Supervised threat classification |
| Joblib | Trusted local model bundles |
| FastAPI | Python ML REST API |
| Pydantic | ML input/output validation |
| Uvicorn | FastAPI server |
| C# | Backend business logic |
| ASP.NET Core | Secure SOC REST APIs |
| EF Core | C# entities aur database mapping |
| Npgsql | PostgreSQL provider |
| PostgreSQL | Persistent SOC data |
| JSONB | Flexible raw event storage |
| Docker | Local PostgreSQL container |
| JWT | Authentication tokens |
| RBAC | Admin/Analyst permissions |
| Swagger/OpenAPI | API documentation |
| Pytest | Python tests |
| xUnit | .NET tests |
| Ruff | Python code quality |
| Git | Version control |

---

# 37. Interview explanation

> I developed an AI-powered Cyber SOC platform using a hybrid architecture. Python and FastAPI provide XGBoost classification, benign-only Isolation Forest anomaly detection, Behaviour Twin deviation scoring and explainable hybrid risk scoring. ASP.NET Core provides PostgreSQL persistence, JWT authentication, role-based access control and SOC workflows for endpoints, security events, alerts, incidents and threat intelligence.

> I used the official UNSW-NB15 train and test split and implemented leakage-safe preprocessing. XGBoost achieved approximately 98.47 percent recall and 98.41 percent ROC-AUC. I also documented the model's false positives and the limitations of using a historical laboratory dataset.

> The ASP.NET backend communicates with the private Python ML service through a typed HTTP client. The complete integration was tested from ASP.NET to FastAPI and the frozen model artifacts. I clearly distinguish real model predictions from simulated endpoint telemetry and future simulated SOAR actions.

---

# 38. Real aur simulated functionality

| Component | Status |
|---|---|
| UNSW-NB15 dataset | Real public dataset |
| XGBoost model | Real trained model |
| Isolation Forest | Real trained anomaly model |
| Model evaluation | Real official test split |
| PostgreSQL | Real local database |
| ASP.NET APIs | Real implementation |
| FastAPI API | Real implementation |
| JWT/RBAC | Real implementation |
| ASP.NET-FastAPI integration | Real tested integration |
| Behaviour Twin history | Safely simulated |
| Real endpoint collector | Abhi implement nahi hua |
| MITRE ATT&CK mapping | Future stage |
| SOAR actions | Future simulated actions |
| Enterprise EDR/SIEM | Claim nahi karna |

---

# 39. Current limitations

- UNSW-NB15 historical laboratory dataset hai.
- Model modern production network par independently validate nahi hua.
- XGBoost false positives SOC alert fatigue create kar sakte hain.
- Model scores calibrated attack probabilities nahi.
- Behaviour Twin simulated history use karta hai.
- Real endpoint collection agent abhi implement nahi hua.
- MITRE ATT&CK mapping pending hai.
- SOAR actions future mein safely simulated hongi.
- Token revocation aur refresh tokens abhi implement nahi hue.
- Rate limiting future security step hai.
- Production deployment ke liye HTTPS aur external secrets manager required hoga.
- Real enterprise SIEM/EDR hone ka claim nahi karna.

---

# 40. Portfolio description

Developed an AI-powered Security Operations Centre platform combining machine-learning threat detection, benign-only anomaly detection, endpoint Behaviour Twin analysis, PostgreSQL security-event storage, JWT/RBAC-protected ASP.NET Core APIs and a Python FastAPI inference service, supported by automated testing and Docker-based infrastructure.
