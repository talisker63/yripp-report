# YRIPP System Architecture

## Overview

The Youth Referral and Independent Person Program (YRIPP) Interview Report System is a modern web application built to facilitate the creation, management, and auditing of interview reports by Independent Persons who attend police interviews with young people.

## Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router for building server-rendered and statically generated applications
- **React 18**: UI library providing component-based architecture and hooks
- **TypeScript**: Type-safe superset of JavaScript for improved developer experience and code reliability
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### Backend Services
- **Firebase Authentication**: Complete authentication solution supporting:
  - Email/password authentication
  - Google OAuth 2.0
  - Password reset functionality
  - Session management
  
- **Firebase Firestore**: NoSQL cloud database providing:
  - Real-time data synchronization
  - Offline persistence
  - Scalable document-based storage
  - Advanced querying capabilities

- **Firebase Cloud Functions**: Serverless functions for:
  - Managing user roles via custom claims
  - Backend business logic
  - Automated tasks

- **Firebase Hosting**: Production hosting with:
  - Global CDN distribution
  - SSL/TLS certificates
  - Custom domain support
  - Static asset optimization

### Development Tools
- **npm**: Package management and dependency resolution
- **ESLint**: Code quality and consistency checking
- **Git**: Version control system

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js App (Static Export)                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Pages    │  │ Components │  │   Contexts │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Services Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Firebase   │  │   Firebase   │  │   Firebase   │    │
│  │     Auth     │  │   Firestore  │  │   Functions  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Firestore Collections

#### 1. `users` Collection
Stores user profiles and role assignments.

```typescript
{
  id: string,                    // Document ID (matches Firebase Auth UID)
  email: string,                 // User's email address
  name: string,                  // User's full name
  roles: UserRole[],             // Array: ["user", "staff", "admin"]
  phoneNumber?: string | null,   // Optional contact number
  createdAt: Timestamp,          // Account creation timestamp
  updatedAt: Timestamp           // Last profile update timestamp
}
```

**Indexes:**
- `email` (for lookups)
- `roles` (array-contains for role-based queries)

#### 2. `interviewReports` Collection
Stores all interview report data with comprehensive sections.

```typescript
{
  id: string,                    // Document ID (auto-generated)
  
  // Form Sections (A-F)
  sectionA: {
    independentPersonName: string,
    policeStation: string,
    interviewDate: string,
    callTime: string,
    arrivalTime: string,
    // ... additional fields
  },
  
  sectionBPartA: {
    preferredFirstName: string,
    immediateNeeds: ImmediateNeed[],
    // ... additional fields
  },
  
  sectionC: { /* IP observations */ },
  interview: { /* Interview details */ },
  outcome: { /* Interview outcome */ },
  ipConcerns: { /* IP concerns */ },
  sectionBPartB: { /* Support services */ },
  sectionE: { /* After interview */ },
  sectionF: { /* Additional notes */ },
  
  officeUse: {
    callId: string,
    relatedCallId: string,
    // ... administrative fields
  },
  
  metadata: {
    createdAt: string,           // ISO timestamp
    updatedAt: string,           // ISO timestamp
    ipId: string,                // Creator's user ID
    ipName: string,              // Creator's name
    draft: boolean,              // Draft status
    submitted: boolean,          // Submission status
    submittedAt?: string,        // Submission timestamp
    editHistory?: [{             // Audit trail
      editedBy: string,          // Editor's user ID
      editedByName: string,      // Editor's name
      editedAt: string,          // Edit timestamp
      editReason: string,        // Reason for edit
      role: "admin" | "staff"    // Editor's role
    }]
  }
}
```

**Indexes:**
- `metadata.ipId` (for user's own reports)
- `metadata.submitted` (for filtering by status)
- Compound: `metadata.ipId` + `metadata.submitted`

## Security Architecture

### Authentication Flow

```
User Login
    │
    ├──> Email/Password ──┐
    │                     │
    └──> Google OAuth ────┤
                          │
                          ▼
                  Firebase Auth
                          │
                          ├──> Generate ID Token
                          │    (contains custom claims)
                          │
                          ▼
                  Load User Profile
                  (from Firestore)
                          │
                          ▼
                  Update Auth Context
                          │
                          ▼
                  Redirect to /reports
```

### Role-Based Access Control (RBAC)

The system implements a flexible multi-role system:

**Roles:**
1. **user** (Independent Person): 
   - Create and manage own reports
   - View own reports (drafts and submitted)
   - Cannot edit submitted reports

2. **staff** (YRIPP Staff):
   - View all reports from all users
   - Edit any report (with audit trail)
   - Access edit history

3. **admin** (Administrator):
   - Manage user accounts
   - Assign/remove roles
   - Bulk user creation
   - Cannot access reports (unless also staff)

**Role Combinations:**
Users can have multiple roles simultaneously (e.g., `["admin", "staff"]`).

### Firestore Security Rules

Security is enforced at the database level through Firestore Security Rules:

```javascript
// Reports Access
match /interviewReports/{reportId} {
  // Anyone authenticated can create
  allow create: if isAuthenticated();
  
  // Read: Owner OR Staff
  allow read: if isReportOwner(reportId) || isYRIPPStaff();
  
  // Update: 
  // - Owner can update ONLY drafts
  // - Staff can update ANY report (with audit)
  allow update: if (isReportOwner(reportId) && !isSubmitted(reportId))
                || (isYRIPPStaff() && hasAuditTrail());
  
  // Delete: Owner (drafts) OR Admin
  allow delete: if (isReportOwner(reportId) && !isSubmitted(reportId))
                || isAdmin();
}

// Users Access
match /users/{userId} {
  // Read: Self OR Admin
  allow read: if request.auth.uid == userId || isAdmin();
  
  // Create: Self (during registration)
  allow create: if request.auth.uid == userId;
  
  // Update: Self (limited fields) OR Admin (any field)
  allow update: if (request.auth.uid == userId && onlyUpdatingOwnFields())
                || isAdmin();
}
```

### Custom Claims

User roles are stored in two places:
1. **Firestore** (`users` collection): Primary source of truth
2. **Firebase Auth Custom Claims**: Cached for Firestore rules

Custom claims are set via Cloud Functions to ensure security. The system includes:
- `setUserRole`: Sets primary role and full roles array in custom claims
- `syncMyClaims`: Allows users to refresh their claims after role changes
- Automatic claim synchronization when roles are updated

```typescript
admin.auth().setCustomUserClaims(userId, {
  role: "admin",  // Primary role
  roles: ["user", "staff", "admin"]  // Full roles array
});
```

## Application Structure

### Directory Layout

```
yripp/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Homepage (login prompt)
│   ├── login/                 # Login page
│   ├── signup/                # Registration page
│   ├── forgot-password/       # Password reset
│   ├── reports/               # Reports dashboard
│   ├── interview-report/      # New report creation
│   │   └── edit/             # Edit existing report
│   ├── settings/              # User profile settings
│   ├── admin/                 # Admin panel
│   ├── help/                  # Help system
│   └── layout.tsx             # Root layout
│
├── components/                 # React components
│   ├── auth/
│   │   └── ProtectedRoute.tsx # Route protection wrapper
│   ├── forms/
│   │   ├── InterviewReportForm.tsx
│   │   └── [Sections...]      # Form section components
│   └── ui/                    # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── [Others...]
│
├── lib/                        # Core library code
│   ├── auth/
│   │   ├── context.tsx        # Auth context provider
│   │   ├── types.ts           # Auth type definitions
│   │   └── utils.ts           # Auth utilities
│   ├── firebase/
│   │   ├── config.ts          # Firebase initialization
│   │   ├── reports.ts         # Report CRUD operations
│   │   └── users.ts           # User CRUD operations
│   └── types/
│       └── yripp-form.ts      # Form type definitions
│
├── functions/                  # Firebase Cloud Functions
│   └── src/
│       └── index.ts           # Role management functions
│
├── public/                     # Static assets
├── out/                        # Build output (static export)
└── [Config files]
```

### Key Components

#### Auth Context (`lib/auth/context.tsx`)
Central authentication state management using React Context API:
- Manages user authentication state
- Provides auth methods (signIn, signOut, etc.)
- Loads user profiles from Firestore
- Handles role-based access checks

#### Protected Route (`components/auth/ProtectedRoute.tsx`)
Higher-order component for route protection:
- Checks authentication status
- Validates user roles
- Redirects unauthorized users
- Shows loading states

#### Report Management (`lib/firebase/reports.ts`)
Comprehensive report CRUD operations:
- `createDraftReport()`: Create new report
- `updateDraftReport()`: Update existing report
- `submitReport()`: Finalize report submission
- `getReport()`: Fetch single report
- `getReportsByUser()`: Fetch user's reports with role-based filtering

#### User Management (`lib/firebase/users.ts`)
User profile and role management:
- `createUserProfile()`: Create user profile
- `getUserProfile()`: Fetch user profile
- `updateUserProfile()`: Update profile data (name, phone, email)
- `updateUserRoles()`: Update user roles (calls Cloud Function)
- `getAllUsers()`: Fetch all users (admin only)

#### Cloud Functions (`functions/src/index.ts`)
Serverless functions for secure operations:
- `setUserRole`: Updates user roles and custom claims (admin only)
- `getUserRole`: Retrieves user role from custom claims
- `adminCreateUser`: Creates new user account with roles (admin only)
- `adminDeleteUser`: Deletes user account (admin only, cannot delete self)
- `syncMyClaims`: Refreshes user's custom claims after role changes

## Build and Deployment

### Build Process

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build (static export)
npm run build
# Output: /out directory with static HTML/CSS/JS

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Static Site Generation

The application uses Next.js static export:
- All pages are pre-rendered at build time
- Client-side hydration for interactivity
- Dynamic data fetched client-side via Firebase SDK
- No server-side rendering required

**Configuration:**
```javascript
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
};
```

### Environment Variables

Required environment variables (`.env.local`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### Deployment Architecture

```
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    │ manual deploy
    ▼
Build Process (local)
    │
    │ npm run build
    ▼
Static Files (/out)
    │
    │ firebase deploy
    ▼
Firebase Hosting
    │
    ├──> Global CDN
    ├──> SSL/TLS
    └──> Custom Domain
```

## Performance Considerations

### Optimization Strategies

1. **Static Export**: Pre-rendered pages for fast initial load
2. **Code Splitting**: Automatic by Next.js for smaller bundles
3. **Lazy Loading**: Components loaded on demand
4. **Firestore Indexing**: Optimized queries for fast data retrieval
5. **CDN Distribution**: Firebase Hosting global CDN

### Bundle Sizes

```
First Load JS shared by all:     87.4 kB
Individual pages:
  - /login                        3.57 kB
  - /reports                      2.43 kB
  - /interview-report/edit        1.76 kB
  - /admin                        7.94 kB
  - /help                        15.3 kB
```

## Scalability

### Current Limits
- **Firestore**: 1 million concurrent connections
- **Firebase Auth**: Unlimited users (pay-as-you-go)
- **Hosting**: 360GB/month bandwidth (free tier)

### Scaling Strategies
1. **Horizontal Scaling**: Firebase auto-scales
2. **Caching**: Firebase CDN caching for static assets
3. **Indexing**: Composite indexes for complex queries
4. **Pagination**: Implement for large report lists

## Monitoring and Logging

### Firebase Console
- Authentication metrics
- Firestore usage statistics
- Hosting traffic analytics
- Function execution logs

### Error Handling
- Client-side error boundaries
- Try-catch blocks in async operations
- User-friendly error messages
- Console logging for debugging

## Security Best Practices

1. **Authentication**:
   - Secure password requirements (min 6 chars)
   - OAuth 2.0 for Google sign-in
   - Session management via Firebase

2. **Authorization**:
   - Multi-layered: Client + Firestore rules
   - Principle of least privilege
   - Role-based access control

3. **Data Protection**:
   - Encrypted at rest (Firebase)
   - Encrypted in transit (HTTPS/TLS)
   - Audit trails for sensitive changes

4. **Code Security**:
   - TypeScript for type safety
   - ESLint for code quality
   - No hardcoded secrets
   - Environment variables for configuration

## Maintenance and Updates

### Regular Maintenance
- Dependency updates (npm outdated)
- Security patches (npm audit)
- Firebase SDK updates
- Next.js version updates

### Backup Strategy
- Firestore automatic backups (24hr retention)
- Export data periodically
- Version control for code (Git)

## Future Enhancements

See [FUTURE_DIRECTIONS.md](./FUTURE_DIRECTIONS.md) for planned features and roadmap.

## Troubleshooting

### Common Issues

1. **Build Errors**: Check Node.js version (14+)
2. **Auth Issues**: Verify environment variables
3. **Firestore Rules**: Test in Firebase Console
4. **Deploy Failures**: Check Firebase CLI version

### Support

For technical issues:
- Email: andrew@asleight.com
- Check help system: `/help`
- Review documentation files
