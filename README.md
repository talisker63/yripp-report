# YRIPP

A modern web application for the Youth Referral and Independent Person Program (YRIPP), designed to help Independent Persons document their observations during police interviews with young people.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Storage**: Firebase (Firestore, Auth, Functions, Hosting)
- **Email**: Resend
- **Authentication**: Firebase Auth with OAuth support

## Features

- **Role-Based Access Control**: Three-tier system (User, Staff, Admin)
- **Interview Report Management**: Create, edit, submit, and review reports
- **Draft System**: Save work in progress and continue later
- **Audit Trail**: Track all changes to submitted reports
- **User Management**: Admin panel for user and role management
- **Bulk Upload**: CSV import for multiple users
- **Help System**: Comprehensive in-app help with role-specific content
- **Secure Authentication**: Email/password and Google OAuth

## Documentation

### User Guides
- **[Independent Persons Guide](./GUIDE_INDEPENDENT_PERSONS.md)**: Complete guide for IPs creating interview reports
- **[Staff Guide](./GUIDE_STAFF.md)**: Guide for YRIPP staff reviewing and editing reports
- **[Admin Guide](./GUIDE_ADMIN.md)**: Administrator guide for user and role management

### Technical Documentation
- **[System Architecture](./ARCHITECTURE.md)**: Comprehensive technical architecture documentation
- **[Future Directions](./FUTURE_DIRECTIONS.md)**: Roadmap and planned features
- **[Deployment Guide](./DEPLOYMENT.md)**: Deployment instructions and procedures
- **[User Management](./USER_MANAGEMENT.md)**: Detailed user management documentation

### In-App Help
Access the help system by clicking the **?** icon in the application header after logging in.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp env.example .env.local
```

3. Fill in your environment variables in `.env.local`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Building for Production

```bash
npm run build
```

This creates a static export in the `out/` directory.

## Deployment

```bash
firebase deploy --only hosting
```

For Cloud Functions:
```bash
firebase deploy --only functions
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
├── app/              # Next.js app router pages
│   ├── admin/        # Admin panel
│   ├── help/         # Help system
│   ├── interview-report/  # Report creation and editing
│   ├── login/        # Authentication
│   ├── reports/      # Reports dashboard
│   └── settings/     # User settings
├── components/       # React components
│   ├── auth/         # Authentication components
│   ├── forms/        # Form components and sections
│   └── ui/           # Reusable UI components
├── lib/             # Library configurations and utilities
│   ├── auth/        # Authentication utilities
│   ├── firebase/    # Firebase configuration and operations
│   └── types/       # TypeScript type definitions
├── functions/       # Firebase Cloud Functions
└── public/          # Static assets
```

## User Roles

### User (Independent Person)
- Create and manage own interview reports
- Save drafts and submit reports
- View own reports
- Cannot edit submitted reports

### Staff
- All User permissions
- View and edit ALL reports from all IPs
- Edit submitted reports with audit trail
- View edit history

### Admin
- Manage user accounts
- Assign and remove roles
- Bulk user creation from CSV
- Cannot access reports (unless also Staff)

**Note**: Users can have multiple roles (e.g., both Admin and Staff).

## Key Features

### Interview Report System
- Multi-section form (Sections A-F plus Office Use)
- Draft saving and resumption
- One-click submission
- Read-only view of submitted reports

### Audit Trail
- All staff edits tracked with:
  - Who made the edit
  - When it was made
  - Why it was made
- Full transparency for legal compliance

### User Management
- Individual user creation
- CSV bulk upload
- Flexible role assignment
- User profile management

### Help System
- Role-specific help content
- Searchable articles
- Categories: Getting Started, Reports, Staff Functions, Admin Functions, FAQ, Architecture, Future Directions
- Accessible via ? icon in header

## Security

- **Authentication**: Firebase Auth with custom claims
- **Authorization**: Firestore security rules enforcing RBAC
- **Data Protection**: Encrypted at rest and in transit
- **Audit Logging**: Complete change history for submitted reports
- **Privacy**: Role-based data access

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed security information.

## Support

- **In-App Help**: Click ? icon in the application header
- **Email**: andrew@asleight.com
- **Documentation**: See guides linked above

## Contributing

This is a private project for YRIPP. For feature requests or bug reports, contact andrew@asleight.com.

## License

Private and proprietary. All rights reserved.

## Version

**Current Version**: 1.0 (January 2026)

**Recent Updates**:
- ✅ Complete RBAC system with multi-role support
- ✅ Comprehensive help system
- ✅ Admin panel with bulk upload
- ✅ Full documentation suite
- ✅ Audit trail for report edits
- ✅ User settings management

See [FUTURE_DIRECTIONS.md](./FUTURE_DIRECTIONS.md) for upcoming features.

