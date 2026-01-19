# YRIPP Documentation Index

Welcome to the YRIPP Interview Report System documentation. This index provides quick access to all available documentation resources.

---

## Quick Start

- **New Independent Person?** Start with [Independent Persons Guide](./GUIDE_INDEPENDENT_PERSONS.md)
- **YRIPP Staff Member?** Read the [Staff Guide](./GUIDE_STAFF.md)
- **System Administrator?** Check the [Admin Guide](./GUIDE_ADMIN.md)
- **Need In-App Help?** Click the **?** icon in the application header

---

## User Guides

### [Independent Persons Guide](./GUIDE_INDEPENDENT_PERSONS.md)
**For**: Independent Persons creating interview reports

**Covers**:
- Getting started with YRIPP
- Creating your first report
- Understanding report sections
- Saving drafts and submitting reports
- Managing your reports
- Account settings
- Tips and best practices

### [Staff Guide](./GUIDE_STAFF.md)
**For**: YRIPP Staff members who review and edit reports

**Covers**:
- Staff role overview and responsibilities
- Viewing all reports across all IPs
- Editing submitted reports
- Managing audit trails
- Best practices for report review
- Quality assurance guidelines
- Report analysis

### [Admin Guide](./GUIDE_ADMIN.md)
**For**: System administrators managing users and access

**Covers**:
- Administrator role overview
- Managing user accounts
- Understanding and assigning roles
- Bulk user upload from CSV
- Role combinations
- Security best practices
- User support procedures

---

## Technical Documentation

### [System Architecture](./ARCHITECTURE.md)
**For**: Developers, technical staff, and system architects

**Covers**:
- Technology stack overview
- System architecture and design
- Data model and Firestore schema
- Security architecture and RBAC
- Authentication and authorization
- Application structure and components
- Build and deployment processes
- Performance and scalability
- Maintenance and troubleshooting

### [Future Directions](./FUTURE_DIRECTIONS.md)
**For**: Stakeholders, planners, and decision makers

**Covers**:
- Product vision and principles
- Short-term roadmap (3-6 months)
- Medium-term plans (6-12 months)
- Long-term vision (12+ months)
- Feature request process
- Known limitations and solutions
- Version history

### [Deployment Guide](./DEPLOYMENT.md)
**For**: Developers and system administrators

**Covers**:
- Pre-deployment checklist
- Environment setup
- Firebase configuration
- Build and deployment commands
- Troubleshooting deployment issues

### [User Management](./USER_MANAGEMENT.md)
**For**: Administrators and system managers

**Covers**:
- User lifecycle management
- Role assignment procedures
- Custom claims configuration
- Firestore rules for access control

---

## In-App Help System

Access comprehensive help within the application:

1. **Log in to YRIPP**
2. **Click the ? icon** in the header (next to settings)
3. **Browse help categories**:
   - Getting Started
   - Managing Reports
   - Staff Functions (staff only)
   - Admin Functions (admin only)
   - Account Settings
   - System Architecture
   - Frequently Asked Questions
   - Future Development

The help system provides role-specific content based on your access level.

---

## Quick Reference

### By Role

| Your Role | Start Here | Also See |
|-----------|------------|----------|
| **Independent Person** | [IP Guide](./GUIDE_INDEPENDENT_PERSONS.md) | In-App Help |
| **YRIPP Staff** | [Staff Guide](./GUIDE_STAFF.md) | [IP Guide](./GUIDE_INDEPENDENT_PERSONS.md) |
| **Administrator** | [Admin Guide](./GUIDE_ADMIN.md) | [User Management](./USER_MANAGEMENT.md) |
| **Developer** | [Architecture](./ARCHITECTURE.md) | [Deployment](./DEPLOYMENT.md) |
| **Stakeholder** | [Future Directions](./FUTURE_DIRECTIONS.md) | [Architecture](./ARCHITECTURE.md) |

### By Task

| What You Need to Do | Documentation |
|---------------------|---------------|
| Create a report | [IP Guide - Creating Reports](./GUIDE_INDEPENDENT_PERSONS.md#creating-your-first-report) |
| Edit a submitted report | [Staff Guide - Editing Reports](./GUIDE_STAFF.md#editing-reports) |
| Add a new user | [Admin Guide - Managing Users](./GUIDE_ADMIN.md#managing-users) |
| Bulk upload users | [Admin Guide - Bulk Upload](./GUIDE_ADMIN.md#bulk-user-upload) |
| Assign roles | [Admin Guide - Role Combinations](./GUIDE_ADMIN.md#role-combinations) |
| Deploy the system | [Deployment Guide](./DEPLOYMENT.md) |
| Understand security | [Architecture - Security](./ARCHITECTURE.md#security-architecture) |
| Request a feature | [Future Directions - Feature Requests](./FUTURE_DIRECTIONS.md#feature-request-process) |

---

## File Organization

### Repository Root
```
YRIPP/
├── README.md                          # Project overview and quick start
├── DOCUMENTATION_INDEX.md             # This file
├── GUIDE_INDEPENDENT_PERSONS.md       # User guide for IPs
├── GUIDE_STAFF.md                     # User guide for Staff
├── GUIDE_ADMIN.md                     # User guide for Admins
├── ARCHITECTURE.md                    # Technical architecture
├── FUTURE_DIRECTIONS.md               # Roadmap and planned features
├── DEPLOYMENT.md                      # Deployment instructions
└── USER_MANAGEMENT.md                 # User management details
```

### Application Structure
```
app/
├── help/                              # In-app help system
│   └── page.tsx                       # Help page with all categories
├── reports/                           # Reports dashboard
├── admin/                             # Admin panel
├── settings/                          # User settings
└── interview-report/                  # Report creation/editing
```

---

## Support and Contact

### Getting Help

1. **In-App Help**: Click ? icon in application header
2. **Documentation**: Review guides relevant to your role
3. **Email Support**: andrew@asleight.com

### What to Include in Support Requests

- Your name and role
- Description of the issue
- What you were trying to do
- Error messages (if any)
- Screenshots (if helpful)
- Browser and device information

### Response Times

- **Critical Issues**: Within 24 hours
- **General Questions**: Within 2 business days
- **Feature Requests**: Acknowledged within 1 week

---

## Documentation Updates

This documentation is maintained as part of the YRIPP system. 

**Last Updated**: January 2026  
**Version**: 1.0  
**Next Review**: April 2026

### Recent Documentation Updates

- ✅ Updated all guides with current feature set
- ✅ Added CSV upload format details (comma/pipe separators)
- ✅ Documented user deletion functionality
- ✅ Updated settings page capabilities
- ✅ Clarified password reset process
- ✅ Added token sync information

### Requesting Documentation Updates

If you find errors or have suggestions for improving documentation:

1. Email: andrew@asleight.com
2. Subject: "YRIPP Documentation: [Brief Description]"
3. Include:
   - Which document needs updating
   - What should be changed
   - Why the change is needed

---

## Glossary

### Common Terms

- **IP**: Independent Person - volunteer who attends police interviews with young people
- **YRIPP**: Youth Referral and Independent Person Program
- **RBAC**: Role-Based Access Control - system for managing user permissions
- **Draft**: Unsaved or incomplete report that can still be edited
- **Submitted**: Finalized report that cannot be edited by creator
- **Audit Trail**: Record of all changes made to a submitted report
- **Firebase**: Google's cloud platform used for database, auth, and hosting
- **Firestore**: Firebase's NoSQL cloud database
- **Custom Claims**: Firebase Auth mechanism for storing user roles

### User Roles

- **User**: Basic role for Independent Persons who create reports
- **Staff**: Elevated role for YRIPP staff who review and edit all reports
- **Admin**: Administrative role for managing user accounts and access

### Technical Terms

- **Static Export**: Building the app as static HTML/CSS/JS files
- **Cloud Functions**: Serverless backend functions
- **OAuth**: Open authentication standard (used for Google sign-in)
- **Next.js**: React framework used to build YRIPP
- **TypeScript**: Programming language (typed JavaScript)
- **Tailwind CSS**: Utility-first CSS framework for styling

---

## Training Resources

### For Independent Persons

**Getting Started Training** (30 minutes):
1. System overview and login
2. Dashboard navigation
3. Creating your first report
4. Saving drafts
5. Submitting reports
6. Viewing submitted reports

**Materials**: [Independent Persons Guide](./GUIDE_INDEPENDENT_PERSONS.md) + In-App Help

### For Staff Members

**Staff Training** (1 hour):
1. Everything in IP training
2. Viewing all reports
3. Understanding edit history
4. Editing reports with audit trail
5. Best practices and quality standards

**Materials**: [Staff Guide](./GUIDE_STAFF.md) + [IP Guide](./GUIDE_INDEPENDENT_PERSONS.md)

### For Administrators

**Admin Training** (45 minutes):
1. System overview
2. User management interface
3. Creating individual users
4. Bulk CSV upload
5. Role assignment
6. Security best practices

**Materials**: [Admin Guide](./GUIDE_ADMIN.md) + [User Management](./USER_MANAGEMENT.md)

### For Developers

**Developer Onboarding** (2-3 hours):
1. Architecture overview
2. Technology stack
3. Development environment setup
4. Code structure
5. Deployment process
6. Security considerations

**Materials**: [Architecture](./ARCHITECTURE.md) + [Deployment](./DEPLOYMENT.md) + code comments

---

## Feedback

We welcome feedback on all documentation. Your input helps us improve the YRIPP system for everyone.

**Ways to Provide Feedback**:
- Email: andrew@asleight.com
- During training sessions
- Through your supervisor or coordinator
- Via feature request process

**We're Particularly Interested In**:
- Documentation that's unclear or confusing
- Missing information or gaps
- Suggestions for additional guides or tutorials
- Real-world examples to include
- Common questions not addressed

---

## Version History

### Version 1.0 (January 2026)
**Initial Documentation Release**

Created comprehensive documentation suite including:
- Three user guides (IP, Staff, Admin)
- Technical architecture documentation
- Future directions and roadmap
- In-app help system with 8 categories
- This documentation index

**Documentation Statistics**:
- 4 user-facing guides
- 4 technical documents
- 8 in-app help categories
- 50+ help articles
- 200+ pages of documentation

---

**Thank you for using YRIPP!**

This system is designed to support the important work of Independent Persons in ensuring fair treatment of young people during police interviews. We're committed to providing excellent documentation and support to help you do this critical work effectively.

---

*For the latest version of this documentation, see the YRIPP repository or contact andrew@asleight.com*
