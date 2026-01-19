# YRIPP User Guide - Administrators

## Welcome

This guide is for YRIPP Administrators who manage user accounts, assign roles, and maintain the system.

---

## Table of Contents

1. [Administrator Role Overview](#administrator-role-overview)
2. [Accessing the Admin Panel](#accessing-the-admin-panel)
3. [Managing Users](#managing-users)
4. [Understanding Roles](#understanding-roles)
5. [Bulk User Upload](#bulk-user-upload)
6. [Role Combinations](#role-combinations)
7. [Security Best Practices](#security-best-practices)
8. [User Support](#user-support)
9. [Troubleshooting](#troubleshooting)
10. [Getting Help](#getting-help)

---

## Administrator Role Overview

### Your Responsibilities

As an Administrator, you manage the YRIPP system users and access control:

**You Can:**
- ✅ View all user accounts
- ✅ Create new user accounts
- ✅ Edit user information (name, email)
- ✅ Assign and remove roles
- ✅ Bulk upload users from CSV files
- ✅ Delete user accounts (if necessary)
- ✅ Manage system access

**You Cannot:**
- ❌ View or edit interview reports (unless you also have Staff role)
- ❌ Access report data or content
- ❌ View report statistics (unless you also have Staff role)

**Important**: Admin role is about USER management, not REPORT management. If you need both, you should have both Admin and Staff roles.

### Understanding the Role System

YRIPP has three roles:

1. **User (Independent Person)**: Creates own interview reports
2. **Staff**: Views and edits all interview reports
3. **Admin**: Manages user accounts and roles (YOU)

Users can have multiple roles simultaneously.

---

## Accessing the Admin Panel

### Finding the Admin Panel

1. Sign in to YRIPP
2. Look for the **"Admin"** button in the header (top right)
3. Click "Admin" to enter the Admin Panel

**Note**: This button only appears if you have the Admin role.

### Admin Panel Overview

The Admin Panel contains:
- **User List**: All system users
- **Create User**: Add individual users
- **Bulk Upload**: Add multiple users from CSV
- **Edit Functions**: Modify user details and roles

---

## Managing Users

### Viewing All Users

The user list displays:

| Column | Description |
|--------|-------------|
| **Name** | User's full name |
| **Email** | User's email address (login) |
| **Roles** | Assigned roles (User, Staff, Admin) |
| **Phone** | Contact phone number (if provided) |
| **Actions** | Edit button for each user |

### Searching for Users

Currently, you can:
- Scroll through the list
- Use browser search (Ctrl+F / Cmd+F)
- Look for specific names or emails

**Future**: Built-in search and filtering will be added.

### Editing a User

1. **Find the user** in the list
2. **Click "Edit"** next to their name
3. **Edit modal appears** with:
   - Role checkboxes (User, Staff, Admin)
4. **Make your changes**:
   - Check/uncheck role boxes to assign or remove roles
   - At least one role must be selected (defaults to "user" if none selected)
5. **Changes save automatically** when you toggle roles
6. **Click "Close"** to dismiss the modal

**Note**: To update a user's name or phone number, they can do so in their Settings page. Email changes require password verification and are handled through the Settings page.

**Important**: Users should use the "Sync Token" button or sign out and sign back in for role changes to fully take effect.

### Role Checkboxes

When editing a user, you'll see three checkboxes:

- **☐ User**: Can create own interview reports
- **☐ Staff**: Can view and edit all reports
- **☐ Admin**: Can manage user accounts

Check any combination that applies to the user.

**Default**: If no boxes are checked, the user automatically gets "User" role.

---

## Understanding Roles

### User Role (Independent Person)

**Purpose**: Independent Persons who attend police interviews

**Permissions:**
- Create interview reports
- View own reports (drafts and submitted)
- Edit own draft reports
- Submit reports
- Cannot edit submitted reports
- Cannot view other IPs' reports
- Access settings page

**When to Assign:**
- All Independent Persons
- Anyone who needs to create interview reports
- Default role for most users

### Staff Role

**Purpose**: YRIPP staff members who review and manage reports

**Permissions:**
- Everything Users can do
- View ALL reports from ALL Independent Persons
- Edit ANY report (including submitted reports)
- View edit history
- Add audit trail entries
- Cannot manage user accounts (unless also Admin)

**When to Assign:**
- YRIPP coordinators
- Report reviewers
- Quality assurance staff
- Supervisors
- Anyone needing access to all reports

**When NOT to Assign:**
- Regular Independent Persons
- Users who only need report creation
- Anyone not trained in report review

### Admin Role

**Purpose**: System administrators and user managers

**Permissions:**
- View all user accounts
- Create/edit/delete users
- Assign roles
- Bulk upload users
- Manage system access
- Cannot view or edit reports (unless also Staff)

**When to Assign:**
- System administrators
- User coordinators
- Senior management
- Anyone managing user access

**When NOT to Assign:**
- Regular Independent Persons
- Staff who don't need user management
- Anyone not trained in administration

---

## Bulk User Upload

### When to Use Bulk Upload

Use bulk upload when:
- Onboarding multiple IPs at once
- Importing existing user lists
- Creating test accounts
- Annual renewals

### Preparing Your CSV File

#### Required Format

Your CSV file must have these columns (in any order):

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| **name** or **full name** | User's full name | Yes | "John Smith" |
| **email** | Email address (unique) | Yes | "john@example.com" |
| **password** | Initial password | Yes | "SecurePass123" |
| **role** or **roles** | Comma or pipe-separated roles | Optional | "user,staff" or "user\|staff" |

#### Example CSV

```csv
name,email,password,roles
John Smith,john@example.com,TempPass123,user
Jane Doe,jane@example.com,AnotherPass456,"user,staff"
Admin User,admin@example.com,AdminPass789,admin
Sarah Jones,sarah@example.com,Pass2024,"user,staff,admin"
```

**Notes:**
- Column headers are case-insensitive (e.g., "name" or "full name")
- Use quotes around values with commas
- Roles can be separated by commas (`,`) or pipes (`|`)
- Passwords should be strong (users should change them)
- Roles are optional (defaults to "user")
- Available roles: user, staff, admin

### Password Requirements

Passwords must:
- Be at least 6 characters
- **Recommended**:
  - Include uppercase and lowercase letters
  - Include numbers
  - Include special characters
  - Be unique and temporary

**Best Practice**: Generate temporary passwords and require users to change them on first login.

### Uploading the CSV

1. **Click "Bulk Upload Users"** in Admin Panel
2. **Click the file input** or drag & drop
3. **Select your CSV file**
4. **Click "Upload Users"**
5. **Wait** for processing (can take time for large files)
6. **Review results**: Shows success/error count
7. **User list refreshes** automatically

### Troubleshooting Bulk Upload

**Common Errors:**

❌ **"CSV must contain 'email' and 'name' columns"**
- Check your column headers
- Ensure headers are lowercase
- Check for typos in column names

❌ **"Email already exists"**
- User with that email already registered
- Remove duplicates from CSV
- Check existing user list

❌ **"Password too weak"**
- Passwords must be 6+ characters
- Update passwords in CSV

**Success Indicators:**
- ✅ "Upload complete: X users created, 0 errors"
- ✅ New users appear in list
- ✅ Users can sign in with provided credentials

---

## Role Combinations

### Common Combinations

Users can have multiple roles. Here are common combinations:

#### User Only
```
Roles: [user]
```
**For**: Regular Independent Persons
**Can**: Create own reports only

#### Staff Only
```
Roles: [staff]
```
**For**: Report reviewers who don't create reports
**Can**: View/edit all reports, cannot create own

#### User + Staff
```
Roles: [user, staff]
```
**For**: IPs who also review reports
**Can**: Create own reports AND review all reports

#### Admin Only
```
Roles: [admin]
```
**For**: User managers who don't need report access
**Can**: Manage users, cannot access reports

#### Admin + Staff
```
Roles: [admin, staff]
```
**For**: Senior staff with full system access
**Can**: Manage users AND access all reports

#### All Three
```
Roles: [user, staff, admin]
```
**For**: System coordinators
**Can**: Everything

### Setting Multiple Roles

**In the UI:**
1. Edit a user
2. Check multiple role boxes
3. Save

**In Firebase Console:**
Navigate to Firestore → users collection → user document → edit `roles` field:
```json
["admin", "staff"]
```

**In CSV Upload:**
```csv
name,email,password,roles
John Doe,john@example.com,Pass123,"user,staff,admin"
```

### Choosing the Right Roles

**Questions to Ask:**

1. **Does this person create interview reports?**
   - Yes → Include "user"
   - No → Don't include "user"

2. **Does this person need to review/edit all reports?**
   - Yes → Include "staff"
   - No → Don't include "staff"

3. **Does this person manage user accounts?**
   - Yes → Include "admin"
   - No → Don't include "admin"

**Examples:**

- **New IP, just creates reports**: user
- **Coordinator who reviews reports**: staff  
- **IP who also coordinates**: user, staff
- **HR person managing accounts**: admin
- **Program manager with full access**: user, staff, admin

---

## Security Best Practices

### Account Management

#### Strong Password Policy
- Require strong passwords (6+ characters minimum)
- Encourage complexity (mixed case, numbers, symbols)
- Temporary passwords for bulk uploads
- Require password changes on first login

#### Role Assignment Guidelines

**Principle of Least Privilege:**
- Only assign roles users actually need
- Don't give Staff role to IPs who don't review reports
- Don't give Admin role to users who don't manage accounts

**Separation of Duties:**
- Consider whether users need both Admin and Staff
- Some organizations separate user management from data access

**Regular Reviews:**
- Quarterly review of all user accounts
- Remove inactive users
- Audit role assignments
- Check for unnecessary elevated permissions

### Access Control

#### Creating Accounts
- ✅ Verify user identity before creating account
- ✅ Use official email addresses
- ✅ Document account creation
- ✅ Provide user training before granting access

#### Removing Access
- ✅ Promptly remove accounts for departed staff
- ✅ Change roles when responsibilities change
- ✅ Document access removal
- ✅ Follow organizational off-boarding procedures

#### Monitoring Activity
- 📊 Periodically review user list
- 📊 Check for inactive accounts
- 📊 Monitor for unusual activity
- 📊 Report security concerns immediately

### Incident Response

**If you suspect unauthorized access:**

1. **Immediately remove elevated roles** (Staff/Admin)
2. **Reset the user's password**
3. **Contact YRIPP system administrator**
4. **Document the incident**:
   - What happened
   - When you discovered it
   - Actions taken
   - Who was notified
5. **Follow organizational security protocols**

**If a user reports compromised account:**

1. **Immediately reset their password**
2. **Review their recent activity** (if possible)
3. **Check for unauthorized changes**
4. **Document the incident**
5. **Provide new secure credentials**

---

## User Support

### Helping Users Sign In

**Common Issues:**

1. **Forgot Password**
   - User can use "Forgot password?" link
   - Self-service password reset via email
   - You cannot reset passwords through Admin Panel

2. **Wrong Email**
   - Verify user is using correct email address
   - Check for typos
   - Check user list for their actual email

3. **Account Doesn't Exist**
   - Search user list to confirm
   - Create account if needed
   - Verify email address is correct

4. **Can't See Expected Features**
   - Check their roles in Admin Panel
   - They may need Staff or Admin role
   - Update roles and have them use "Sync Token" or sign out/in

### Training New Users

**For New IPs (User Role):**
1. Provide login credentials
2. Guide through first login
3. Show Reports Dashboard
4. Walk through creating a report
5. Emphasize saving drafts
6. Explain submission process
7. Point to Help system

**For New Staff:**
1. Everything above, plus:
2. Explain extended access (all reports)
3. Show Edit History column
4. Walk through editing process
5. Emphasize edit reason requirement
6. Explain audit trail importance
7. Review quality standards

**For New Admins:**
1. Show Admin Panel
2. Walk through user management
3. Explain role system
4. Cover security practices
5. Demonstrate bulk upload
6. Review support procedures

### Documentation for Users

Point users to:
- **Help System**: ? icon in header
- **User Guides**:
  - Independent Persons Guide
  - Staff Guide  
  - Admin Guide (this document)
- **Architecture Documentation**: For technical users

---

## Troubleshooting

### Common Admin Issues

#### Can't Access Admin Panel
- Check you have Admin role
- Look for "Admin" button in header
- Try clicking "Sync Token" button in Admin Panel (if visible)
- Sign out and sign back in
- Contact another admin if role missing

#### Changes Not Saving
- Check for error messages
- Ensure all required fields filled
- Try refreshing page
- Check internet connection

#### CSV Upload Fails
- Verify CSV format (name, email required)
- Check for duplicate emails
- Ensure passwords meet requirements
- Try smaller batch (if file is large)

#### User Can't Sign In After Creation
- Verify account was created (check list)
- Confirm email address is correct
- Check password was communicated
- Try password reset

### Firebase Console Access

For advanced administration, you may need Firebase Console access:

**URL**: https://console.firebase.google.com

**What You Can Do:**
- View all Firestore data
- Manually edit user records
- Set custom claims
- View system logs
- Manage security rules

**When to Use:**
- Admin Panel not sufficient
- Need to set specific custom claims
- Troubleshooting complex issues
- System configuration changes

**Caution**: Firebase Console is powerful. Changes here directly affect the database. Only use if trained.

---

## Getting Help

### Help System

Click **? Help** icon in header for:
- Admin-specific documentation
- User management guides
- Role assignment help
- System architecture

### Support

**Email**: andrew@asleight.com

**When to Contact:**
- Technical issues with Admin Panel
- Questions about role assignment
- Security concerns
- Feature requests
- Training needs

**Include:**
- Your name and role
- Description of issue
- What you were trying to do
- Error messages
- Screenshots if helpful

---

## Quick Reference Card

### Essential Admin Actions

| Action | How To |
|--------|--------|
| **Access Admin Panel** | Header → Admin button |
| **View All Users** | In Admin Panel user list |
| **Create User** | Admin Panel → Fill form → Save |
| **Edit User** | Find user → Edit → Make changes → Save |
| **Assign Role** | Edit user → Check role box → Save |
| **Remove Role** | Edit user → Uncheck role box → Save |
| **Bulk Upload** | Admin Panel → Bulk Upload → Select CSV → Upload |
| **Delete User** | Admin Panel → Find user → Delete → Confirm |
| **Sync Token** | Admin Panel → Sync Token button (refreshes role claims) |
| **Return to Reports** | Header → Reports button |

### Remember

- ✅ Only assign necessary roles
- ✅ Use strong temporary passwords
- ✅ Document account changes
- ✅ Review accounts regularly
- ✅ Remove inactive users
- ✅ Follow security best practices
- ⚠️ Users must sign out/in for role changes to apply

---

## Appendix A: CSV Template

Save this as a template for bulk uploads:

```csv
name,email,password,roles
John Smith,john.smith@example.com,TempPass123!,user
Jane Doe,jane.doe@example.com,SecurePass456!,"user,staff"
```

**Download Template**: Create a file named `user_template.csv` with the content above.

---

## Appendix B: Role Permission Matrix

| Permission | User | Staff | Admin |
|------------|------|-------|-------|
| Create own reports | ✅ | ✅* | ❌ |
| View own reports | ✅ | ✅* | ❌ |
| Edit own draft reports | ✅ | ✅* | ❌ |
| Submit own reports | ✅ | ✅* | ❌ |
| View all reports | ❌ | ✅ | ❌ |
| Edit any report | ❌ | ✅ | ❌ |
| View edit history | ❌ | ✅ | ❌ |
| View all users | ❌ | ❌ | ✅ |
| Create users | ❌ | ❌ | ✅ |
| Edit user roles | ❌ | ❌ | ✅ |
| Bulk upload users | ❌ | ❌ | ✅ |
| Access settings | ✅ | ✅ | ✅ |
| Access help | ✅ | ✅ | ✅ |

*Only if user also has User role

---

## Appendix C: Security Checklist

### Monthly Security Review

- [ ] Review all user accounts
- [ ] Check for inactive users (no login in 90+ days)
- [ ] Verify role assignments are appropriate
- [ ] Remove accounts for departed staff
- [ ] Check for suspicious activity
- [ ] Update any compromised passwords
- [ ] Review admin access list
- [ ] Document review in security log

### New User Checklist

- [ ] Verify user identity
- [ ] Confirm user should have access
- [ ] Determine appropriate roles
- [ ] Create account with secure temporary password
- [ ] Provide credentials securely
- [ ] Schedule training session
- [ ] Add to user documentation
- [ ] Notify relevant stakeholders

### User Departure Checklist

- [ ] Confirm departure date
- [ ] Remove all elevated roles
- [ ] OR delete account entirely
- [ ] Document removal
- [ ] Update user list/documentation
- [ ] Notify relevant stakeholders
- [ ] Verify account access removed

---

## Your Critical Role

As an Administrator, you ensure:
- System security
- Appropriate access control
- User support and onboarding
- Data protection
- Compliance with policies
- System integrity

**Thank you for keeping YRIPP secure!**

---

**Version 1.0 | January 2026**

For updates to this guide, check the Help system or contact YRIPP administration.
