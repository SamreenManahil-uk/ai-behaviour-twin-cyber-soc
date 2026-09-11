# Day 4 Learning Guide — Realtime Detection aur Simulated SOAR

## 1. Day 4 ka main purpose

Day 4 mein hum ne project ko static SOC application se realtime detection
workflow ki taraf move kiya.

Ab system simulated endpoint event receive kar sakta hai, usay deterministic
security rules se inspect kar sakta hai, zaroorat par alert create kar sakta
hai aur connected frontend ko SignalR ke through update bhej sakta hai.

Hum ne simulated SOAR workflow bhi banaya. Yeh analyst ko response process
demonstrate karta hai, lekin kisi real computer, firewall, process, account ya
network ko modify nahi karta.

## 2. SignalR kya hai aur kyun use hua?

Normal REST API mein frontend ko baar baar server se poochna padta hai ke koi
naya alert aya hai ya nahi. Isay polling kehte hain.

SignalR server ko allow karta hai ke woh connected frontend ko khud realtime
message bhej de.

Project scenario:

1. Simulated security event backend mein aata hai.
2. Detection rule suspicious behaviour identify karta hai.
3. Event aur alert PostgreSQL transaction mein save hote hain.
4. Transaction successfully commit hone ke baad SignalR `AlertCreated`
   message publish karta hai.
5. Frontend analyst ko realtime notification show karta hai.

SignalR hub:

`/hubs/alerts`

Hub protected hai aur `SocOperations` policy require karta hai. Anonymous
connection accept nahi hota.

## 3. SignalR security

JWT access token normally HTTP Authorization header mein jata hai. WebSocket
clients kuch environments mein token query string ke through bhejte hain.

Backend sirf `/hubs/alerts` path ke liye `access_token` accept karta hai.
Dusre paths par query-string token accept nahi hota.

Detailed SignalR errors disable hain aur raw security-event payload realtime
message mein include nahi hota.

## 4. Realtime frontend behavior

Frontend Microsoft SignalR client use karta hai.

Real authenticated session mein client hub se connect hota hai. Temporary
network failure par bounded automatic reconnect hota hai.

Demo login mein realtime connection intentionally pause rehta hai kyun ke demo
user ke paas real JWT token nahi hota.

Frontend connection states clearly show karta hai:

- Connected
- Reconnecting
- Disconnected
- Demo mode / realtime paused

Is se portfolio app fake live connection claim nahi karti.

## 5. Rule detection engine

Rule engine strict JSON payload ko data ke taur par parse karta hai. Payload
kabhi execute nahi hota.

Implemented deterministic rules:

- Encoded PowerShell command
- PowerShell usage
- Repeated failed logins
- Suspicious living-off-the-land processes
- Privilege activity
- Abnormally large outbound transfer

Har matched rule fixed weight contribute karta hai. Total score 0 se 100 ke
andar cap hota hai.

Yeh score heuristic risk score hai, attack probability nahi.

## 6. MITRE ATT&CK mapping

Relevant rules ko MITRE identifiers diye gaye:

- T1059.001 — PowerShell
- T1110 — Brute Force
- T1218 — Signed Binary Proxy Execution
- T1068 — Exploitation for Privilege Escalation
- T1041 — Exfiltration Over C2 Channel

MITRE mapping analyst ko batati hai ke suspicious behavior known attacker
technique se kis tarah relate karta hai. Yeh automatic proof of attack nahi.

## 7. Event se alert ka workflow

EventService pehle endpoint existence verify karta hai.

Phir:

1. Server event identity aur ingestion timestamp banata hai.
2. RawPayload strict JSON ke taur par inspect hota hai.
3. Rule engine deterministic evaluation karta hai.
4. Benign event ke liye sirf event save hota hai.
5. Matched rule ke liye event aur alert aik database transaction mein save
   hote hain.
6. Successful commit ke baad SignalR broadcast hota hai.

Database transaction ka purpose consistency hai. Agar save fail ho jaye to
aadha event/alert state persist nahi hota.

SignalR publication best-effort hai. Database commit primary source of truth
hai. Production system mein reliable outbox pattern behtar hoga.

## 8. Simulated SOAR kya hai?

SOAR ka full form Security Orchestration, Automation and Response hai.

Is portfolio mein supported simulations:

- Isolate endpoint
- Block IP address
- Terminate process
- Disable account
- Collect forensics

Yeh actions sirf demonstrate karte hain ke analyst confirmation, RBAC,
validation aur audit trail kaise work karega.

`SimulatedSoarExecutor` sirf explanatory text return karta hai. Is mein shell,
process-control, firewall, SSH, directory service, remote management ya
endpoint agent integration nahi.

## 9. SOAR audit trail

Har simulation ke saath yeh information database mein store hoti hai:

- Alert ID
- Endpoint ID
- Authenticated requester ID
- Allow-listed action type
- Validated target
- Analyst reason
- Simulation status
- Transparent result summary
- Request and completion UTC timestamps
- `IsSimulation = true`

Database check constraint ensure karta hai ke record simulation-only rahe.

HTTP API update aur delete routes expose nahi karti. Is liye response history
API boundary par append-only hai.

## 10. SOAR RBAC

Response history read karna:

`SocOperations`

Simulation create karna:

`AdminOnly`

Is ka matlab:

- Anonymous request: HTTP 401
- Authenticated SOC Analyst creation attempt: HTTP 403
- Authenticated Admin: simulation audit create kar sakta hai

## 11. Frontend SOAR UX

Alert drawer mein professional response area add hua:

- Five allow-listed action buttons
- Simulation safety warning
- Confirmation modal
- Mandatory analyst reason
- Loading state
- Error state
- Success toast
- Audit history
- Admin and analyst permissions
- Demo and real API modes ka clear difference

Demo Admin action browser memory mein record hota hai aur clearly
`Browser-only demo` show hota hai. Usay PostgreSQL record claim nahi kiya
jata.

Real Admin aur real UUID-backed alert backend API use karte hain.

## 12. Database migration

`AddSimulatedSoarAudit` migration nayi
`simulated_response_actions` table create karti hai.

Migration manually fabricate nahi ki gayi; EF Core tooling ne current model se
generate ki.

Relationships restrictive delete behavior use karti hain taa-ke user, alert
ya endpoint history accidentally cascade delete na ho.

## 13. Testing

Backend tests verify karte hain:

- SignalR hub authentication
- Safe realtime mapping
- Rule determinism
- MITRE mapping
- Rule alert creation
- Event/alert transaction boundary
- SOAR allow-list
- Target validation
- Simulation-only result
- EF metadata
- Restrictive foreign keys
- Database simulation constraint
- Existing authentication, persistence aur API behavior

Frontend tests verify karte hain:

- Realtime reconnect utilities
- Demo Admin confirmation workflow
- Analyst action restriction
- Browser-only audit record
- Existing buttons, badges, settings and health behavior

## 14. Important limitations

Yeh production EDR ya enterprise SIEM nahi.

Current limitations:

- Endpoint telemetry simulated hai.
- SOAR actions simulated hain.
- SignalR delivery ke liye durable outbox nahi.
- Rule configuration code-based hai.
- Demo alerts PostgreSQL alerts nahi.
- No real endpoint agent.
- No real firewall integration.
- No real process termination.
- No real account disablement.
- No real forensic collection.
- No production secret manager.
- No production-scale load or penetration testing.

## 15. Interview explanation

Interview mein short explanation:

“Day 4 mein maine secured SignalR realtime alert delivery implement ki.
Simulated endpoint events deterministic rules se evaluate hote hain aur MITRE
ATT&CK context ke saath alerts create kar sakte hain. Event aur alert aik EF
Core transaction mein persist hote hain, aur commit ke baad frontend ko
best-effort realtime update milta hai. Maine simulation-only SOAR workflow bhi
banaya jisme Admin confirmation, strict target validation aur immutable audit
records hain. System kisi real endpoint action ko execute nahi karta.”

## 16. Day 4 outcome

Day 4 ke end par project mein:

- Secured realtime SignalR hub
- Realtime frontend client
- Automatic reconnect behavior
- Deterministic rule detection
- MITRE ATT&CK mapping
- Transactional event-to-alert workflow
- Simulation-only SOAR API
- Immutable response audit model
- EF Core migration
- Professional confirmation UI
- RBAC-aware frontend controls
- Automated backend and frontend tests

available hain.
