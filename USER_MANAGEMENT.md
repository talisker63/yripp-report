# User Management & Settings System

## ✅ Implementation Complete

### Features Implemented

#### 1. **User Settings Page** (`/settings`)
- **Access:** Gear icon (⚙️) next to user name in reports header
- **Features:**
  - Update full name (saves immediately)
  - Update phone number (saves immediately)
  - Change email address (requires current password for security, signs out after change)
- **Location:** Accessible from reports page header
- **Password Reset:** Available via "Forgot password?" link on login page

#### 2. **Admin Panel** (`/admin`)
- **Access:** "Admin" button in header (only visible to admin users)
- **Features:**
  - **View All Users:** Table showing all users with their roles and contact info
  - **Edit User Roles:** Toggle user/staff/admin roles for any user
  - **Create New User:** Manual user creation with role assignment
  - **Bulk Upload:** CSV import for creating multiple users at once
  - **Delete Users:** Remove user accounts (cannot delete self)
  - **Sync Token:** Refresh custom claims after role changes

#### 3. **Enhanced Role System**
- **Multiple Roles:** Users can have multiple roles (user, staff, admin)
- **Role Storage:**
  - Primary role stored in Firebase Auth custom claims (for quick access)
  - Full roles array stored in Firestore `users` collection
- **Role Permissions:**
  - **User:** Can only see/edit their own reports
  - **Staff:** Can see and edit ALL reports (with edit reason required)
  - **Admin:** Can manage users but CANNOT see/edit reports (except their own)
  - **Staff + Admin:** Can do both (manage users AND see/edit all reports)

#### 4. **Report Access Control**
- **Users:** Only their own reports
- **Staff:** All reports (with edit history tracking)
- **Admin:** Only their own reports (cannot access others)
- **Staff + Admin:** All reports + user management

### CSV Upload Format

The CSV file should have the following columns:
- `email` (required)
- `name` or `full name` (required)
- `password` (required, minimum 6 characters)
- `role` or `roles` (optional, comma or pipe-separated: `staff|admin` or `staff,admin`)

**Example CSV:**
```csv
name,email,password,roles
John Doe,john@example.com,SecurePass123,staff
Jane Smith,jane@example.com,AnotherPass456,admin
Bob Johnson,bob@example.com,Pass789,"staff,admin"
Alice Brown,alice@example.com,TempPass2024,user
```

**Notes:**
- Column headers are case-insensitive
- Roles can be separated by commas (`,`) or pipes (`|`)
- If no roles specified, defaults to "user"
- Passwords must be at least 6 characters

### User Profile Structure

```typescript
{
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  roles: UserRole[];  // ["user"], ["staff"], ["admin"], ["staff", "admin"], etc.
  createdAt: string;
  updatedAt: string;
}
```

### Firestore Collections

#### `users/{userId}`
- Stores user profile information
- Accessible by:
  - User themselves (read/write own profile)
  - Admins (read/write all profiles)

#### `interviewReports/{reportId}`
- Accessible by:
  - Report owner (read/write own reports)
  - Staff users (read/write all reports)
  - Admin users (read/write only own reports)

### Cloud Functions

#### `setUserRole(userId, role)`
- **Access:** Admin only
- **Purpose:** Sets primary role in Firebase Auth custom claims
- **Note:** Full roles array managed in Firestore

#### `getUserRole(userId?)`
- **Purpose:** Retrieves user's primary role from custom claims

### Security Rules

- **Reports:** Only staff can access reports they don't own
- **Users Collection:** Admins can read/write all, users can read/write own
- **Role Checks:** Admin role verified from both custom claims and Firestore

### UI Components

1. **Settings Icon:** Gear icon in reports header
2. **Admin Button:** Visible only to admin users
3. **Role Badges:** Display all user roles in header
4. **User Management Table:** Full CRUD interface for admins

### Next Steps

1. **Set Initial Admin:**
   - Use Firebase Console → Authentication
   - Or use Cloud Function: `setUserRole(userId, "admin")`
   - Update Firestore: `users/{userId}` with `roles: ["admin"]`

2. **Test User Creation:**
   - Create test users via admin panel
   - Verify role assignments
   - Test CSV bulk upload

3. **Verify Permissions:**
   - Admin users should NOT see all reports
   - Staff users should see all reports
   - Users with both roles should have full access

---

**Deployment Status:** ✅ All features deployed and live
**URL:** https://yripp-report.web.app
