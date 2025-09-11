sequenceDiagram
    participant User
    participant Frontend
    participant AuthAPI
    participant DB
    participant SessionAPI
    participant Redux

    User->>Frontend: Enter email & password
    Frontend->>AuthAPI: POST /login
    AuthAPI->>DB: Find user by email
    DB-->>AuthAPI: Return user or null

    alt User not found
        AuthAPI-->>Frontend: Error "Invalid credentials"
    else User found
        AuthAPI->>AuthAPI: Compare password (bcrypt)
        alt Password mismatch
            AuthAPI-->>Frontend: Error "Invalid credentials"
        else Password match
            AuthAPI->>DB: Check active login for 'user' role
            alt Already logged in elsewhere
                AuthAPI->>DB: Log failed attempt
                AuthAPI-->>Frontend: Error "Already logged in on another device"
            else No active session
                AuthAPI->>DB: Create login log (isLoggedIn: true)
                AuthAPI->>AuthAPI: Generate JWT token
                AuthAPI-->>Frontend: Return token + user
                Frontend->>Redux: Dispatch setCredentials(token, user)
                Frontend->>Frontend: Redirect based on role
            end
        end
    end

    Note over Frontend, Redux: On all protected pages
    Frontend->>Redux: Check posSessionId
    alt posSessionId missing
        Frontend->>SessionAPI: GET /pos-session
        alt Session exists
            SessionAPI-->>Frontend: Return sessionId
            Frontend->>Redux: Dispatch setPosSessionId
            Frontend->>Frontend: Navigate to /pos
        else 404 Not Found
            Frontend->>User: Prompt "Start Session?"
            User->>Frontend: Click start session
            Frontend->>SessionAPI: POST /start-session
            SessionAPI-->>Frontend: Return sessionId
            Frontend->>Redux: Dispatch setPosSessionId
            Frontend->>Frontend: Navigate to /pos
        end
    else Session exists
        Frontend->>Frontend: Continue with POS page
    end





    sequenceDiagram
    participant Client
    participant Express
    participant Prisma
    participant Bcrypt
    participant JWT
    participant Session

    Client->>Express: POST /login (email, password)
    Express->>Prisma: findUnique({ email })
    alt User not found
        Express-->>Client: 400 BadRequest ("Invalid email or password")
    else User found
        Express->>Bcrypt: compare(password, user.password)
        alt Password invalid
            Express-->>Client: 400 BadRequest ("Invalid email or password")
        else Password valid
            alt Role is "user"
                Express->>Prisma: findFirst({ isLoggedIn: true, userId })
                alt Active session exists
                    Express->>Prisma: create userLoginAttempt (FAILED_ACTIVE_SESSION)
                    Express-->>Client: 400 BadRequest ("Already logged in")
                else No active session
                    Express->>Prisma: create userLoginLog (isLoggedIn = true)
                end
            else Role is not "user"
                Express->>Prisma: create userLoginLog (isLoggedIn = true)
            end

            Express->>JWT: sign({ email, username, role })
            JWT-->>Express: token

            Express->>Session: req.session = { jwt: token }
            Express->>Session: req.currentUser = { user }

            Express-->>Client: 200 OK (message, token, user)
        end
    end




flowchart TD
    A[Start: POST /login] --> B[Extract email & password]
    B --> C[Find user by email]

    C -->|User not found| E1[Throw "Invalid email or password"]
    C -->|User found| D[Compare password with hashed]

    D -->|Invalid password| E2[Throw "Invalid email or password"]
    D -->|Valid password| F[Check user role]

    F -->|role == 'user'| G[Check active login session]
    G -->|Session exists| H[Log failed attempt with IP & agent]
    H --> I[Throw "Already logged in from another device"]
    G -->|No active session| J[Proceed to login]

    F -->|role != 'user'| J[Proceed to login]

    J --> K[Create new userLoginLog (loginTime, isLoggedIn = true)]
    K --> L[Build JWT payload]

    L --> M[Generate JWT token]
    M --> N[Store token in req.session]
    N --> O[Set req.currentUser]

    O --> P[Return 200 OK with token & user info]

    style E1 fill:#ffdddd,stroke:#aa0000
    style E2 fill:#ffdddd,stroke:#aa0000
    style H fill:#ffe6cc,stroke:#cc8400
    style P fill:#ccffcc,stroke:#00aa00
