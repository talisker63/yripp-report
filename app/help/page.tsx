"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <HelpContent />
    </ProtectedRoute>
  );
}

function HelpContent() {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn how to use YRIPP",
      icon: "⚡",
      articles: 5,
      roles: ["user", "staff", "admin"],
    },
    {
      id: "reports",
      title: "Managing Reports",
      description: "Create, edit, and submit reports",
      icon: "📝",
      articles: 6,
      roles: ["user", "staff", "admin"],
    },
    {
      id: "staff-functions",
      title: "Staff Functions",
      description: "Editing and auditing reports",
      icon: "👥",
      articles: 4,
      roles: ["staff"],
    },
    {
      id: "admin-functions",
      title: "Admin Functions",
      description: "User management and system administration",
      icon: "⚙️",
      articles: 5,
      roles: ["admin"],
    },
    {
      id: "account",
      title: "Account Settings",
      description: "Manage your profile and preferences",
      icon: "👤",
      articles: 3,
      roles: ["user", "staff", "admin"],
    },
    {
      id: "architecture",
      title: "System Architecture",
      description: "Technical documentation and design",
      icon: "🏗️",
      articles: 4,
      roles: ["staff", "admin"],
    },
    {
      id: "faq",
      title: "Frequently Asked Questions",
      description: "Common questions and answers",
      icon: "❓",
      articles: 8,
      roles: ["user", "staff", "admin"],
    },
    {
      id: "future",
      title: "Future Development",
      description: "Planned features and roadmap",
      icon: "🚀",
      articles: 3,
      roles: ["staff", "admin"],
    },
  ];

  const userRoles: string[] = Array.isArray(user?.roles) && user.roles.length > 0 
    ? user.roles.map(r => String(r))
    : ["user"];

  const filteredCategories = categories.filter((cat) => {
    return cat.roles.some((role) => {
      const roleStr = String(role);
      return userRoles.includes(roleStr);
    });
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading help...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">YRIPP Help Center</h1>
            <p className="text-sm opacity-90">Advice and answers from the YRIPP Team</p>
          </div>
          <Link
            href="/reports"
            className="text-sm text-white hover:text-blue-200 px-3 py-1 border border-white/30 rounded hover:bg-white/10"
          >
            Back to Reports
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {!selectedCategory ? (
          <>
            {filteredCategories.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">
                  {user ? "Loading help categories..." : "No help categories available"}
                </p>
                <p className="text-sm text-gray-500">
                  User roles: {JSON.stringify(userRoles)}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        1 author • {category.articles} articles
                      </span>
                    </p>
                  </div>
                </div>
              </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <CategoryDetail
            categoryId={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            userRoles={userRoles}
          />
        )}

        <div className="mt-12 bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need more help?</h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Contact us and we&apos;ll get back to you.
          </p>
          <a
            href="mailto:andrew@asleight.com"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

function CategoryDetail({
  categoryId,
  onBack,
  userRoles,
}: {
  categoryId: string;
  onBack: () => void;
  userRoles: string[];
}) {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const content = getCategoryContent(categoryId, userRoles);

  if (selectedArticle) {
    const article = content.articles.find((a) => a.id === selectedArticle);
    if (article) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {content.title}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      );
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all categories
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{content.title}</h2>
        <p className="text-gray-600 mb-8">{content.description}</p>

        <div className="space-y-4">
          {content.articles.map((article) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article.id)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{article.title}</h3>
              <p className="text-sm text-gray-600">{article.summary}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getCategoryContent(categoryId: string, userRoles: string[]) {
  const isStaff = userRoles.includes("staff");
  const isAdmin = userRoles.includes("admin");

  switch (categoryId) {
    case "getting-started":
      return {
        title: "Getting Started",
        description: "Learn how to use the YRIPP Interview Report System",
        articles: [
          {
            id: "what-is-yripp",
            title: "What is YRIPP?",
            summary: "Overview of the Youth Referral and Independent Person Program",
            content: `
              <h2>What is YRIPP?</h2>
              <p>The Youth Referral and Independent Person Program (YRIPP) provides independent support to young people during police interviews. This system helps Independent Persons (IPs) document their observations and interactions during police interviews with young people.</p>
              <h3>Key Features</h3>
              <ul>
                <li><strong>Digital Report Creation:</strong> Create and save interview reports electronically</li>
                <li><strong>Draft Management:</strong> Save reports as drafts and continue editing before submission</li>
                <li><strong>Secure Storage:</strong> All reports are securely stored in Firebase Firestore</li>
                <li><strong>Role-Based Access:</strong> Different access levels for IPs, Staff, and Administrators</li>
                <li><strong>Audit Trail:</strong> Track all changes made to submitted reports</li>
              </ul>
            `,
          },
          {
            id: "first-login",
            title: "First Time Login",
            summary: "How to access the system for the first time",
            content: `
              <h2>First Time Login</h2>
              <p>To access the YRIPP system:</p>
              <ol>
                <li>Navigate to the YRIPP website</li>
                <li>Click <strong>"Create Account"</strong></li>
                <li>Enter your full name, email address, and create a secure password</li>
                <li>Alternatively, use <strong>"Sign in with Google"</strong> for quick access</li>
                <li>Once registered, you'll be directed to your reports dashboard</li>
              </ol>
              <h3>Account Types</h3>
              <ul>
                <li><strong>Independent Person (User):</strong> Can create and manage their own reports</li>
                <li><strong>Staff:</strong> Can view and edit all reports with audit tracking</li>
                <li><strong>Admin:</strong> Can manage users and system settings</li>
              </ul>
            `,
          },
          {
            id: "navigation",
            title: "Navigating the Interface",
            summary: "Understanding the YRIPP interface and navigation",
            content: `
              <h2>Navigating the Interface</h2>
              <h3>Main Dashboard</h3>
              <p>After logging in, you'll see your Reports Dashboard with:</p>
              <ul>
                <li><strong>Filter Tabs:</strong> View All Reports, Drafts, or Submitted reports</li>
                <li><strong>New Report Button:</strong> Start a new interview report</li>
                <li><strong>Report List:</strong> See all your reports with dates, status, and actions</li>
              </ul>
              <h3>Header Navigation</h3>
              <ul>
                <li><strong>Settings (⚙️):</strong> Update your name, email, and phone number</li>
                <li><strong>Admin (if applicable):</strong> Access user management</li>
                <li><strong>Help (?):</strong> Access this help system</li>
                <li><strong>Your Name:</strong> Shows your current user account</li>
                <li><strong>Role Badges:</strong> Displays your current roles (USER, STAFF, ADMIN)</li>
                <li><strong>Sign Out:</strong> Securely logout from the system</li>
              </ul>
            `,
          },
          {
            id: "password-reset",
            title: "Resetting Your Password",
            summary: "How to reset your password if you forget it",
            content: `
              <h2>Resetting Your Password</h2>
              <p>If you forget your password:</p>
              <ol>
                <li>Click <strong>"Sign In"</strong> on the homepage</li>
                <li>Click <strong>"Forgot password?"</strong> below the password field</li>
                <li>Enter your email address</li>
                <li>Check your email for a password reset link</li>
                <li>Click the link and follow the instructions to set a new password</li>
              </ol>
              <p><strong>Note:</strong> The password reset link expires after 1 hour for security reasons.</p>
            `,
          },
          {
            id: "security",
            title: "Security and Privacy",
            summary: "How your data is protected",
            content: `
              <h2>Security and Privacy</h2>
              <p>YRIPP takes security seriously. All data is protected with multiple layers of security:</p>
              <h3>Data Protection</h3>
              <ul>
                <li><strong>Encrypted Storage:</strong> All reports are stored in Google Firebase with enterprise-grade encryption</li>
                <li><strong>Secure Authentication:</strong> Firebase Authentication with industry-standard security</li>
                <li><strong>Role-Based Access:</strong> Users can only access reports they're authorized to see</li>
                <li><strong>Audit Trails:</strong> All changes to submitted reports are logged</li>
              </ul>
              <h3>Best Practices</h3>
              <ul>
                <li>Use a strong, unique password for your account</li>
                <li>Never share your login credentials with anyone</li>
                <li>Sign out when using shared computers</li>
                <li>Report any suspicious activity immediately</li>
              </ul>
            `,
          },
        ],
      };

    case "reports":
      return {
        title: "Managing Reports",
        description: "Everything you need to know about creating and managing interview reports",
        articles: [
          {
            id: "create-report",
            title: "Creating a New Report",
            summary: "Step-by-step guide to creating an interview report",
            content: `
              <h2>Creating a New Report</h2>
              <p>To create a new interview report:</p>
              <ol>
                <li>Click <strong>"New Report"</strong> from your dashboard</li>
                <li>Complete the report sections in order (A through F plus Office Use)</li>
                <li>Use the <strong>"Previous"</strong> and <strong>"Next"</strong> buttons to navigate</li>
                <li>Click section numbers to jump directly to a specific section</li>
                <li>Click <strong>"Save Draft"</strong> at any time to save your progress</li>
              </ol>
              <h3>Report Sections</h3>
              <ul>
                <li><strong>Section A:</strong> Call Out and Arrival details</li>
                <li><strong>Section B Part A:</strong> Young Person Information (demographics)</li>
                <li><strong>Section C:</strong> Independent Person Observations</li>
                <li><strong>Interview Section:</strong> Interview details and witnessed actions</li>
                <li><strong>Outcome:</strong> Interview outcome and bail hearing information</li>
                <li><strong>IP Concerns:</strong> Document any concerns</li>
                <li><strong>Section B Part B:</strong> Young Person Support Services</li>
                <li><strong>Section E:</strong> After Interview activities</li>
                <li><strong>Section F:</strong> Additional Notes</li>
                <li><strong>Office Use Only:</strong> Administrative information</li>
              </ul>
            `,
          },
          {
            id: "save-draft",
            title: "Saving Drafts",
            summary: "How to save your work and continue later",
            content: `
              <h2>Saving Drafts</h2>
              <p>You can save your report as a draft at any time:</p>
              <ol>
                <li>Click the <strong>"Save Draft"</strong> button at the bottom of any section</li>
                <li>Your progress will be saved to the cloud automatically</li>
                <li>You can close the browser and return later</li>
                <li>Access your drafts from the Reports page by clicking the "Drafts" tab</li>
              </ol>
              <h3>Important Notes</h3>
              <ul>
                <li>Drafts are saved with timestamps showing last update</li>
                <li>You can have multiple drafts in progress</li>
                <li>Drafts are private - only you can see your draft reports</li>
                <li>Once submitted, reports cannot be edited by you (only by Staff)</li>
              </ul>
            `,
          },
          {
            id: "submit-report",
            title: "Submitting a Report",
            summary: "How to finalize and submit your completed report",
            content: `
              <h2>Submitting a Report</h2>
              <p>When your report is complete:</p>
              <ol>
                <li>Review all sections to ensure completeness</li>
                <li>Click the <strong>"Submit Report"</strong> button</li>
                <li>Confirm your submission</li>
                <li>Your report status will change to "Submitted"</li>
              </ol>
              <h3>After Submission</h3>
              <p><strong>Important:</strong> Once a report is submitted, you cannot edit it. This ensures legal integrity of the document.</p>
              <ul>
                <li>Submitted reports are marked with a green "Submitted" badge</li>
                <li>You can still view submitted reports, but editing is disabled</li>
                <li>Only YRIPP Staff can make changes to submitted reports</li>
                <li>All staff edits are tracked with an audit trail</li>
              </ul>
            `,
          },
          {
            id: "view-reports",
            title: "Viewing Your Reports",
            summary: "How to find and view your reports",
            content: `
              <h2>Viewing Your Reports</h2>
              <p>Access all your reports from the Reports Dashboard:</p>
              <h3>Filtering Reports</h3>
              <ul>
                <li><strong>All Reports:</strong> View all your reports (drafts and submitted)</li>
                <li><strong>Drafts:</strong> View only reports in draft status</li>
                <li><strong>Submitted:</strong> View only completed reports</li>
              </ul>
              <h3>Report Information</h3>
              <p>Each report shows:</p>
              <ul>
                <li>Interview Date</li>
                <li>Independent Person Name</li>
                <li>Police Station</li>
                <li>Status (Draft or Submitted)</li>
                <li>Last Updated timestamp</li>
                <li>Actions (Edit or View)</li>
              </ul>
            `,
          },
          {
            id: "edit-draft",
            title: "Editing a Draft Report",
            summary: "How to continue working on a saved draft",
            content: `
              <h2>Editing a Draft Report</h2>
              <p>To continue working on a draft:</p>
              <ol>
                <li>Go to your Reports Dashboard</li>
                <li>Click the "Drafts" filter</li>
                <li>Click <strong>"Edit"</strong> on the report you want to continue</li>
                <li>Make your changes</li>
                <li>Click <strong>"Save Draft"</strong> to save progress</li>
                <li>When complete, click <strong>"Submit Report"</strong></li>
              </ol>
              <p><strong>Note:</strong> Draft reports can be edited unlimited times before submission.</p>
            `,
          },
          {
            id: "report-status",
            title: "Understanding Report Status",
            summary: "What different report statuses mean",
            content: `
              <h2>Understanding Report Status</h2>
              <h3>Draft Status (Yellow Badge)</h3>
              <p>A report is in draft status when:</p>
              <ul>
                <li>It has been saved but not yet submitted</li>
                <li>You can continue editing it</li>
                <li>It is only visible to you</li>
                <li>It can be deleted if no longer needed</li>
              </ul>
              <h3>Submitted Status (Green Badge)</h3>
              <p>A report is submitted when:</p>
              <ul>
                <li>You have clicked "Submit Report"</li>
                <li>It cannot be edited by you (for legal integrity)</li>
                <li>It is visible to YRIPP Staff</li>
                <li>Only Staff can make changes (with audit trail)</li>
              </ul>
            `,
          },
        ],
      };

    case "staff-functions":
      return {
        title: "Staff Functions",
        description: "Guide for YRIPP Staff members",
        articles: [
          {
            id: "staff-overview",
            title: "Staff Role Overview",
            summary: "Understanding your responsibilities as a Staff member",
            content: `
              <h2>Staff Role Overview</h2>
              <p>As a YRIPP Staff member, you have elevated privileges:</p>
              <h3>Your Capabilities</h3>
              <ul>
                <li><strong>View All Reports:</strong> Access all submitted and draft reports from all IPs</li>
                <li><strong>Edit Submitted Reports:</strong> Make corrections or additions to any submitted report</li>
                <li><strong>Audit Tracking:</strong> All your edits are tracked with reason, timestamp, and your name</li>
                <li><strong>Edit History Visibility:</strong> See the complete audit trail of report changes</li>
              </ul>
              <h3>Important Responsibilities</h3>
              <p>When editing reports:</p>
              <ul>
                <li>Always provide a clear reason for your edit</li>
                <li>Maintain the integrity of the original information</li>
                <li>Only make necessary corrections or additions</li>
                <li>Remember that all changes are permanently logged</li>
              </ul>
            `,
          },
          {
            id: "edit-submitted",
            title: "Editing Submitted Reports",
            summary: "How to edit reports that have been submitted",
            content: `
              <h2>Editing Submitted Reports</h2>
              <p>Staff members can edit any submitted report. Here's how:</p>
              <ol>
                <li>Navigate to the Reports Dashboard</li>
                <li>Find the report you need to edit</li>
                <li>Click <strong>"View"</strong> (or "Edit" if it's a draft)</li>
                <li>Make your changes to any section</li>
                <li>Click <strong>"Save Draft"</strong></li>
                <li>A modal will appear asking for an edit reason</li>
                <li>Enter a clear, detailed reason for the edit</li>
                <li>Click <strong>"Save"</strong> to confirm</li>
              </ol>
              <h3>Edit Reason Guidelines</h3>
              <p>Your edit reason should include:</p>
              <ul>
                <li>What was changed</li>
                <li>Why it was changed</li>
                <li>Who requested the change (if applicable)</li>
              </ul>
              <p><strong>Example:</strong> "Updated police station name from 'Melbourne Central' to 'Melbourne CBD' to correct administrative error - requested by IP on 11/01/2026"</p>
            `,
          },
          {
            id: "audit-trail",
            title: "Viewing Audit Trails",
            summary: "How to see the history of changes to a report",
            content: `
              <h2>Viewing Audit Trails</h2>
              <p>Every edit to a submitted report is tracked in the audit trail.</p>
              <h3>Accessing Edit History</h3>
              <ol>
                <li>In the Reports Dashboard, staff members see an "Edit History" column</li>
                <li>Reports with edits show the number of edits (e.g., "2 edit(s)")</li>
                <li>Click on a report to view it</li>
                <li>At the top, you'll see a yellow banner with complete edit history</li>
              </ol>
              <h3>Audit Information Includes</h3>
              <ul>
                <li>Who made the edit (name and role)</li>
                <li>When the edit was made (date and time)</li>
                <li>Why the edit was made (edit reason)</li>
              </ul>
              <p>This ensures full transparency and legal compliance.</p>
            `,
          },
          {
            id: "staff-best-practices",
            title: "Staff Best Practices",
            summary: "Guidelines for maintaining report integrity",
            content: `
              <h2>Staff Best Practices</h2>
              <h3>When to Edit Reports</h3>
              <p>Edit reports only when:</p>
              <ul>
                <li>There is a factual error that needs correction</li>
                <li>Additional information needs to be added</li>
                <li>An IP has requested an update</li>
                <li>Administrative corrections are required</li>
              </ul>
              <h3>When NOT to Edit Reports</h3>
              <ul>
                <li>To change the IP's observations or opinions</li>
                <li>To remove legitimate concerns raised</li>
                <li>Without a clear, documented reason</li>
              </ul>
              <h3>Documentation Standards</h3>
              <p>Always ensure your edit reasons are:</p>
              <ul>
                <li><strong>Clear:</strong> Easy to understand what was changed</li>
                <li><strong>Specific:</strong> Detailed enough for legal review</li>
                <li><strong>Professional:</strong> Using appropriate language</li>
                <li><strong>Accurate:</strong> Truthfully representing the reason for the change</li>
              </ul>
            `,
          },
        ],
      };

    case "admin-functions":
      return {
        title: "Admin Functions",
        description: "System administration and user management",
        articles: [
          {
            id: "admin-overview",
            title: "Administrator Role Overview",
            summary: "Understanding your responsibilities as an Administrator",
            content: `
              <h2>Administrator Role Overview</h2>
              <p>As an Administrator, you manage users and system access:</p>
              <h3>Your Capabilities</h3>
              <ul>
                <li><strong>User Management:</strong> View, create, edit, and manage all user accounts</li>
                <li><strong>Role Assignment:</strong> Assign Staff and Admin roles to users</li>
                <li><strong>Bulk Upload:</strong> Create multiple users from CSV files</li>
                <li><strong>Access Control:</strong> Control who can access the system</li>
              </ul>
              <h3>Important Notes</h3>
              <ul>
                <li>Admins cannot view or edit reports (except their own)</li>
                <li>Only Staff members can access all reports</li>
                <li>Users can have multiple roles (e.g., both Admin and Staff)</li>
              </ul>
            `,
          },
          {
            id: "manage-users",
            title: "Managing Users",
            summary: "How to view and edit user accounts",
            content: `
              <h2>Managing Users</h2>
              <p>Access the Admin Panel by clicking <strong>"Admin"</strong> in the header.</p>
              <h3>Viewing Users</h3>
              <p>The admin panel displays:</p>
              <ul>
                <li>User's full name</li>
                <li>Email address</li>
                <li>Assigned roles (User, Staff, Admin)</li>
                <li>Phone number (if provided)</li>
              </ul>
              <h3>Editing User Roles</h3>
              <ol>
                <li>Find the user in the list</li>
                <li>Click <strong>"Edit"</strong> next to their name</li>
                <li>Check or uncheck role boxes:
                  <ul>
                    <li><strong>User:</strong> Basic access (default)</li>
                    <li><strong>Staff:</strong> Can view and edit all reports</li>
                    <li><strong>Admin:</strong> Can manage users</li>
                  </ul>
                </li>
                <li>Update their name if needed</li>
                <li>Click <strong>"Save"</strong> to apply changes</li>
              </ol>
              <p><strong>Note:</strong> Users must sign out and sign back in for role changes to take effect.</p>
            `,
          },
          {
            id: "bulk-upload",
            title: "Bulk User Upload",
            summary: "How to create multiple users from a CSV file",
            content: `
              <h2>Bulk User Upload</h2>
              <p>Create multiple user accounts at once using a CSV file:</p>
              <h3>CSV File Format</h3>
              <p>Your CSV file must have these columns:</p>
              <ul>
                <li><strong>name:</strong> User's full name</li>
                <li><strong>email:</strong> User's email address (must be unique)</li>
                <li><strong>password:</strong> Initial password (min 6 characters)</li>
                <li><strong>roles:</strong> Comma-separated roles (e.g., "user,staff" or "admin")</li>
              </ul>
              <h3>Example CSV</h3>
              <pre>
name,email,password,roles
John Smith,john@example.com,SecurePass123,user
Jane Doe,jane@example.com,AnotherPass456,user,staff
Admin User,admin@example.com,AdminPass789,admin
              </pre>
              <h3>Upload Process</h3>
              <ol>
                <li>In the Admin Panel, click <strong>"Bulk Upload Users"</strong></li>
                <li>Click the file input to select your CSV file</li>
                <li>Click <strong>"Upload Users"</strong></li>
                <li>Wait for the process to complete</li>
                <li>The user list will refresh automatically</li>
              </ol>
              <p><strong>Note:</strong> Users created via bulk upload should change their password upon first login.</p>
            `,
          },
          {
            id: "role-combinations",
            title: "Understanding Role Combinations",
            summary: "How multiple roles work together",
            content: `
              <h2>Understanding Role Combinations</h2>
              <p>Users can have multiple roles simultaneously:</p>
              <h3>Common Role Combinations</h3>
              <ul>
                <li><strong>User only:</strong> Independent Persons who create reports</li>
                <li><strong>Staff only:</strong> YRIPP staff who review and edit reports but don't need admin access</li>
                <li><strong>Admin only:</strong> System administrators who manage users but don't need report access</li>
                <li><strong>Staff + Admin:</strong> Senior staff who both manage users and work with reports</li>
              </ul>
              <h3>Setting Multiple Roles</h3>
              <p>In the Admin Panel, simply check multiple role boxes for a user. For example, to create a senior staff member:</p>
              <ol>
                <li>Check <strong>"Staff"</strong> (to access all reports)</li>
                <li>Check <strong>"Admin"</strong> (to manage users)</li>
                <li>Optionally check <strong>"User"</strong> (if they also create reports)</li>
              </ol>
              <h3>In Firestore</h3>
              <p>Roles are stored as an array. To manually set roles in Firebase Console:</p>
              <pre>["admin", "staff"]</pre>
            `,
          },
          {
            id: "admin-security",
            title: "Admin Security Best Practices",
            summary: "Maintaining system security as an administrator",
            content: `
              <h2>Admin Security Best Practices</h2>
              <h3>User Account Management</h3>
              <ul>
                <li>Only grant Staff roles to authorized YRIPP personnel</li>
                <li>Only grant Admin roles to senior staff who need user management access</li>
                <li>Regularly review user accounts and remove inactive users</li>
                <li>Ensure all users have strong passwords</li>
              </ul>
              <h3>Role Assignment Guidelines</h3>
              <ul>
                <li><strong>Principle of Least Privilege:</strong> Only assign roles users need for their job</li>
                <li><strong>Separation of Duties:</strong> Consider whether users need both Admin and Staff roles</li>
                <li><strong>Regular Audits:</strong> Periodically review who has elevated permissions</li>
              </ul>
              <h3>When Issues Arise</h3>
              <p>If you suspect unauthorized access:</p>
              <ol>
                <li>Immediately remove the user's elevated roles</li>
                <li>Contact the YRIPP system administrator</li>
                <li>Document the incident</li>
                <li>Reset the affected user's password</li>
              </ol>
            `,
          },
        ],
      };

    case "account":
      return {
        title: "Account Settings",
        description: "Managing your profile and account preferences",
        articles: [
          {
            id: "update-profile",
            title: "Updating Your Profile",
            summary: "How to change your name, email, or phone number",
            content: `
              <h2>Updating Your Profile</h2>
              <p>To update your account information:</p>
              <ol>
                <li>Click the <strong>⚙️ Settings</strong> icon in the header</li>
                <li>Update any of the following:
                  <ul>
                    <li><strong>Full Name:</strong> Your display name in the system</li>
                    <li><strong>Email Address:</strong> Your login email</li>
                    <li><strong>Phone Number:</strong> Optional contact number</li>
                  </ul>
                </li>
                <li>Click <strong>"Update Profile"</strong> to save changes</li>
              </ol>
              <h3>Important Notes</h3>
              <ul>
                <li>Email changes will affect your login credentials</li>
                <li>You may need to verify your new email address</li>
                <li>Phone numbers are optional but recommended for contact purposes</li>
              </ul>
            `,
          },
          {
            id: "change-password",
            title: "Changing Your Password",
            summary: "How to update your password for security",
            content: `
              <h2>Changing Your Password</h2>
              <p>To change your password:</p>
              <ol>
                <li>Sign out of your account</li>
                <li>Go to the login page</li>
                <li>Click <strong>"Forgot password?"</strong></li>
                <li>Enter your email address</li>
                <li>Check your email for a reset link</li>
                <li>Follow the link and create a new password</li>
              </ol>
              <h3>Password Requirements</h3>
              <ul>
                <li>Minimum 6 characters</li>
                <li>Recommended: Mix of letters, numbers, and symbols</li>
                <li>Should be unique to this system</li>
              </ul>
            `,
          },
          {
            id: "account-security",
            title: "Account Security Settings",
            summary: "Keeping your account secure",
            content: `
              <h2>Account Security Settings</h2>
              <h3>Two Sign-In Options</h3>
              <ul>
                <li><strong>Email & Password:</strong> Traditional login with your email and password</li>
                <li><strong>Google Sign-In:</strong> Use your Google account for quick, secure access</li>
              </ul>
              <h3>Security Recommendations</h3>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication on your Google account if using Google sign-in</li>
                <li>Sign out when using shared computers</li>
                <li>Never share your login credentials</li>
                <li>Update your password periodically</li>
              </ul>
            `,
          },
        ],
      };

    case "architecture":
      return {
        title: "System Architecture",
        description: "Technical documentation for developers and system administrators",
        articles: [
          {
            id: "tech-stack",
            title: "Technology Stack",
            summary: "Overview of technologies used in YRIPP",
            content: `
              <h2>Technology Stack</h2>
              <h3>Frontend</h3>
              <ul>
                <li><strong>Next.js 14:</strong> React framework with App Router and static site generation</li>
                <li><strong>React 18:</strong> UI library with hooks and context</li>
                <li><strong>TypeScript:</strong> Type-safe JavaScript</li>
                <li><strong>Tailwind CSS:</strong> Utility-first CSS framework</li>
              </ul>
              <h3>Backend & Database</h3>
              <ul>
                <li><strong>Firebase Authentication:</strong> User authentication with OAuth support</li>
                <li><strong>Firebase Firestore:</strong> NoSQL cloud database</li>
                <li><strong>Firebase Cloud Functions:</strong> Serverless functions for role management</li>
                <li><strong>Firebase Hosting:</strong> Static site hosting with CDN</li>
              </ul>
              <h3>Development Tools</h3>
              <ul>
                <li><strong>npm:</strong> Package management</li>
                <li><strong>ESLint:</strong> Code linting</li>
                <li><strong>Git:</strong> Version control</li>
              </ul>
            `,
          },
          {
            id: "data-model",
            title: "Data Model & Schema",
            summary: "Understanding how data is structured",
            content: `
              <h2>Data Model & Schema</h2>
              <h3>Firestore Collections</h3>
              <h4>1. interviewReports</h4>
              <p>Stores all interview reports with sections A through F</p>
              <pre>
{
  id: string,
  sectionA: { ... },
  sectionBPartA: { ... },
  sectionC: { ... },
  interview: { ... },
  outcome: { ... },
  ipConcerns: { ... },
  sectionBPartB: { ... },
  sectionE: { ... },
  sectionF: { ... },
  officeUse: { ... },
  metadata: {
    createdAt: timestamp,
    updatedAt: timestamp,
    ipId: string,
    ipName: string,
    draft: boolean,
    submitted: boolean,
    editHistory: [{
      editedBy: string,
      editedByName: string,
      editedAt: string,
      editReason: string,
      role: string
    }]
  }
}
              </pre>
              <h4>2. users</h4>
              <p>Stores user profiles and roles</p>
              <pre>
{
  id: string,
  email: string,
  name: string,
  roles: ["user", "staff", "admin"],
  phoneNumber: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
              </pre>
            `,
          },
          {
            id: "security-rules",
            title: "Security Rules & Access Control",
            summary: "How permissions are enforced",
            content: `
              <h2>Security Rules & Access Control</h2>
              <h3>Firestore Security Rules</h3>
              <p>Access control is enforced at multiple levels:</p>
              <h4>Reports Access</h4>
              <ul>
                <li><strong>Create:</strong> Any authenticated user can create reports for themselves</li>
                <li><strong>Read:</strong> Users can read their own reports; Staff can read all reports</li>
                <li><strong>Update:</strong> 
                  <ul>
                    <li>Owners can update draft reports only</li>
                    <li>Owners cannot update submitted reports</li>
                    <li>Staff can update any report with audit trail</li>
                  </ul>
                </li>
                <li><strong>Delete:</strong> Owners can delete drafts; Admins can delete any report</li>
              </ul>
              <h4>User Access</h4>
              <ul>
                <li><strong>Read:</strong> Users can read their own profile; Admins can read all profiles</li>
                <li><strong>Create:</strong> Users can create their own profile during registration</li>
                <li><strong>Update:</strong> Users can update their name/phone; Admins can update roles</li>
              </ul>
              <h3>Custom Claims</h3>
              <p>User roles are stored in:</p>
              <ul>
                <li><strong>Firestore:</strong> Primary source of truth (users collection)</li>
                <li><strong>Custom Claims:</strong> Cached in Firebase Auth tokens (for Firestore rules)</li>
              </ul>
            `,
          },
          {
            id: "deployment",
            title: "Deployment & Environment",
            summary: "How the system is deployed and configured",
            content: `
              <h2>Deployment & Environment</h2>
              <h3>Hosting</h3>
              <p>The application is hosted on Firebase Hosting as a static export:</p>
              <ul>
                <li><strong>Build Command:</strong> <code>npm run build</code></li>
                <li><strong>Output:</strong> Static HTML/CSS/JS in the <code>out/</code> directory</li>
                <li><strong>Deploy Command:</strong> <code>firebase deploy --only hosting</code></li>
              </ul>
              <h3>Environment Variables</h3>
              <p>Required variables in <code>.env.local</code>:</p>
              <ul>
                <li><code>NEXT_PUBLIC_FIREBASE_API_KEY</code></li>
                <li><code>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code></li>
                <li><code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code></li>
                <li><code>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</code></li>
                <li><code>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</code></li>
                <li><code>NEXT_PUBLIC_FIREBASE_APP_ID</code></li>
              </ul>
              <h3>Cloud Functions</h3>
              <p>Serverless functions deployed separately:</p>
              <ul>
                <li><strong>setUserRole:</strong> Updates user roles and custom claims</li>
                <li><strong>getUserRole:</strong> Retrieves current user role</li>
              </ul>
            `,
          },
          {
            id: "api-reference",
            title: "API Reference",
            summary: "Key functions and their usage",
            content: `
              <h2>API Reference</h2>
              <h3>Authentication Context</h3>
              <pre>
const { 
  user,           // Current user object
  loading,        // Auth state loading
  signIn,         // Email/password sign in
  signUp,         // Create new account
  signOut,        // Sign out current user
  signInWithGoogle, // Google OAuth sign in
  hasRole         // Check if user has specific role(s)
} = useAuth();
              </pre>
              <h3>Reports API</h3>
              <pre>
// Create a new draft report
createDraftReport(data, userId, userName)

// Update an existing report
updateDraftReport(reportId, data, userId, roles, editReason, userName)

// Submit a report
submitReport(reportId, userId)

// Get reports for a user
getReportsByUser(userId, userRoles)

// Get a specific report
getReport(reportId)
              </pre>
              <h3>User Management API</h3>
              <pre>
// Get user profile
getUserProfile(userId)

// Update user profile
updateUserProfile(userId, { name, phoneNumber })

// Update user roles
updateUserRoles(userId, roles)

// Get all users (admin only)
getAllUsers()

// Create user profile
createUserProfile(userId, email, name, roles)
              </pre>
            `,
          },
        ],
      };

    case "faq":
      return {
        title: "Frequently Asked Questions",
        description: "Answers to common questions about YRIPP",
        articles: [
          {
            id: "who-uses",
            title: "Who uses the YRIPP system?",
            summary: "Understanding the different users of the system",
            content: `
              <h2>Who uses the YRIPP system?</h2>
              <p>The YRIPP system serves three main user groups:</p>
              <h3>Independent Persons (IPs)</h3>
              <p>Volunteers who attend police interviews with young people to ensure fair treatment. IPs use the system to:</p>
              <ul>
                <li>Document their observations during interviews</li>
                <li>Record information about the young person and interview process</li>
                <li>Submit formal reports about each interview attended</li>
              </ul>
              <h3>YRIPP Staff</h3>
              <p>Staff members who oversee the program. They use the system to:</p>
              <ul>
                <li>Review all submitted reports</li>
                <li>Make corrections or additions when necessary</li>
                <li>Monitor program activities and outcomes</li>
              </ul>
              <h3>System Administrators</h3>
              <p>Administrators who manage the system. They use the system to:</p>
              <ul>
                <li>Create and manage user accounts</li>
                <li>Assign appropriate roles to users</li>
                <li>Ensure system security and proper access control</li>
              </ul>
            `,
          },
          {
            id: "report-editable",
            title: "Can I edit a report after submitting it?",
            summary: "Understanding report immutability",
            content: `
              <h2>Can I edit a report after submitting it?</h2>
              <p><strong>No</strong> - Once you submit a report, you cannot edit it.</p>
              <h3>Why?</h3>
              <p>YRIPP interview reports are legal documents. After submission, they must remain unchanged to maintain their legal integrity and credibility.</p>
              <h3>What if there's an error?</h3>
              <p>If you discover an error after submission:</p>
              <ol>
                <li>Contact YRIPP Staff immediately</li>
                <li>Explain what needs to be corrected</li>
                <li>Staff members can make the correction with a documented audit trail</li>
                <li>The edit history will show who made the change, when, and why</li>
              </ol>
              <p><strong>Best Practice:</strong> Carefully review your report before submitting to minimize the need for corrections.</p>
            `,
          },
          {
            id: "draft-auto-save",
            title: "Are drafts automatically saved?",
            summary: "Understanding draft saving behavior",
            content: `
              <h2>Are drafts automatically saved?</h2>
              <p><strong>No</strong> - Drafts are not automatically saved. You must manually save your work.</p>
              <h3>How to Save</h3>
              <p>Click the <strong>"Save Draft"</strong> button at the bottom of the form to save your progress.</p>
              <h3>Best Practices</h3>
              <ul>
                <li>Save your work frequently as you complete each section</li>
                <li>Save before navigating away from the page</li>
                <li>Save before closing your browser</li>
                <li>Don't rely on browser back/forward buttons - use the form navigation</li>
              </ul>
              <p><strong>Tip:</strong> Get in the habit of clicking "Save Draft" after completing each section.</p>
            `,
          },
          {
            id: "multiple-roles",
            title: "Can I have multiple roles?",
            summary: "Understanding role combinations",
            content: `
              <h2>Can I have multiple roles?</h2>
              <p><strong>Yes</strong> - Users can have multiple roles assigned simultaneously.</p>
              <h3>Common Combinations</h3>
              <ul>
                <li><strong>User + Staff:</strong> IPs who also work as YRIPP staff</li>
                <li><strong>Admin + Staff:</strong> Senior staff who manage both users and reports</li>
                <li><strong>User + Staff + Admin:</strong> Senior staff who do everything</li>
              </ul>
              <h3>How It Works</h3>
              <p>When you have multiple roles:</p>
              <ul>
                <li>All role badges appear in the header</li>
                <li>You see all features available to any of your roles</li>
                <li>You can switch between different functions seamlessly</li>
              </ul>
              <p>Contact your system administrator if you need role changes.</p>
            `,
          },
          {
            id: "delete-draft",
            title: "Can I delete a draft report?",
            summary: "How to remove unwanted drafts",
            content: `
              <h2>Can I delete a draft report?</h2>
              <p><strong>Yes</strong> - You can delete your own draft reports.</p>
              <p><strong>Note:</strong> This feature may need to be added if not currently available in the UI. Contact support if you need to delete a draft.</p>
              <h3>What Cannot Be Deleted</h3>
              <ul>
                <li>Submitted reports cannot be deleted by regular users</li>
                <li>Only Administrators can delete submitted reports</li>
                <li>Deletion of submitted reports should be rare and documented</li>
              </ul>
            `,
          },
          {
            id: "mobile-access",
            title: "Can I use YRIPP on mobile devices?",
            summary: "Mobile and tablet compatibility",
            content: `
              <h2>Can I use YRIPP on mobile devices?</h2>
              <p><strong>Yes</strong> - The YRIPP system is responsive and works on mobile devices and tablets.</p>
              <h3>Recommended Usage</h3>
              <ul>
                <li><strong>Desktop/Laptop:</strong> Best for creating and editing reports</li>
                <li><strong>Tablet:</strong> Good for viewing and quick edits</li>
                <li><strong>Mobile Phone:</strong> Suitable for viewing reports and quick reference</li>
              </ul>
              <h3>Tips for Mobile Use</h3>
              <ul>
                <li>Use landscape orientation for better viewing on phones</li>
                <li>The form sections are optimized for mobile screens</li>
                <li>All features available on desktop are available on mobile</li>
              </ul>
            `,
          },
          {
            id: "data-export",
            title: "Can I export or print reports?",
            summary: "Exporting reports for external use",
            content: `
              <h2>Can I export or print reports?</h2>
              <p>Currently, reports can be viewed on screen. Print functionality can be added in future updates.</p>
              <h3>Current Workaround</h3>
              <p>To create a printable version:</p>
              <ol>
                <li>Open the report in view mode</li>
                <li>Use your browser's print function (Ctrl+P or Cmd+P)</li>
                <li>Select "Save as PDF" as your printer</li>
                <li>Save the PDF to your computer</li>
              </ol>
              <p><strong>Future Enhancement:</strong> A dedicated "Export to PDF" feature is planned.</p>
            `,
          },
          {
            id: "browser-support",
            title: "Which browsers are supported?",
            summary: "Compatible browsers and requirements",
            content: `
              <h2>Which browsers are supported?</h2>
              <p>YRIPP works best on modern, up-to-date browsers:</p>
              <h3>Fully Supported</h3>
              <ul>
                <li><strong>Google Chrome:</strong> Latest version recommended</li>
                <li><strong>Microsoft Edge:</strong> Latest version recommended</li>
                <li><strong>Mozilla Firefox:</strong> Latest version recommended</li>
                <li><strong>Safari:</strong> Latest version on macOS and iOS</li>
              </ul>
              <h3>Requirements</h3>
              <ul>
                <li>JavaScript must be enabled</li>
                <li>Cookies must be enabled for authentication</li>
                <li>Internet connection required (cloud-based system)</li>
              </ul>
            `,
          },
        ],
      };

    case "future":
      return {
        title: "Future Development",
        description: "Planned features and system roadmap",
        articles: [
          {
            id: "roadmap",
            title: "Product Roadmap",
            summary: "Upcoming features and improvements",
            content: `
              <h2>Product Roadmap</h2>
              <p>The YRIPP system is continuously evolving. Here are planned enhancements:</p>
              <h3>Short Term (Next 3-6 Months)</h3>
              <ul>
                <li><strong>PDF Export:</strong> Export reports as formatted PDF documents</li>
                <li><strong>Email Notifications:</strong> Notify staff when new reports are submitted</li>
                <li><strong>Advanced Search:</strong> Search reports by police station, date range, or keywords</li>
                <li><strong>Report Templates:</strong> Pre-fill common information to speed up report creation</li>
                <li><strong>Dark Mode:</strong> Optional dark theme for reduced eye strain</li>
              </ul>
              <h3>Medium Term (6-12 Months)</h3>
              <ul>
                <li><strong>Analytics Dashboard:</strong> Staff can view statistics and trends</li>
                <li><strong>Batch Operations:</strong> Staff can perform actions on multiple reports</li>
                <li><strong>Advanced Audit Logging:</strong> Enhanced tracking of all system activities</li>
                <li><strong>Report Scheduling:</strong> Schedule report creation for upcoming interviews</li>
                <li><strong>Mobile App:</strong> Dedicated iOS and Android applications</li>
              </ul>
              <h3>Long Term (12+ Months)</h3>
              <ul>
                <li><strong>Integration:</strong> Connect with police department systems</li>
                <li><strong>AI Assistance:</strong> Smart suggestions while filling out reports</li>
                <li><strong>Voice Input:</strong> Dictate report content</li>
                <li><strong>Multi-language Support:</strong> Support for languages other than English</li>
              </ul>
            `,
          },
          {
            id: "feature-requests",
            title: "Requesting New Features",
            summary: "How to suggest improvements",
            content: `
              <h2>Requesting New Features</h2>
              <p>We welcome feedback and feature suggestions from all users.</p>
              <h3>How to Submit a Request</h3>
              <ol>
                <li>Email your suggestion to <strong>andrew@asleight.com</strong></li>
                <li>Include:
                  <ul>
                    <li>Clear description of the feature</li>
                    <li>How it would help your work</li>
                    <li>Your role (IP, Staff, Admin)</li>
                    <li>Any examples or mockups</li>
                  </ul>
                </li>
              </ol>
              <h3>What Makes a Good Feature Request</h3>
              <ul>
                <li><strong>Specific:</strong> Clear description of what you need</li>
                <li><strong>Problem-Focused:</strong> Explain the problem you're trying to solve</li>
                <li><strong>Use Case:</strong> Describe when and how you'd use it</li>
                <li><strong>Impact:</strong> Explain how it would improve your workflow</li>
              </ul>
            `,
          },
          {
            id: "known-limitations",
            title: "Known Limitations",
            summary: "Current system constraints and workarounds",
            content: `
              <h2>Known Limitations</h2>
              <p>The following limitations are known and may be addressed in future updates:</p>
              <h3>Report Management</h3>
              <ul>
                <li><strong>No PDF Export:</strong> Currently no built-in PDF export (use browser print-to-PDF)</li>
                <li><strong>No Offline Mode:</strong> Internet connection required (cloud-based system)</li>
                <li><strong>Limited Search:</strong> Basic filtering only (advanced search coming)</li>
              </ul>
              <h3>User Management</h3>
              <ul>
                <li><strong>Manual Password Generation:</strong> Bulk upload requires pre-generated passwords</li>
                <li><strong>No Self-Service Role Requests:</strong> Users cannot request role changes in-app</li>
              </ul>
              <h3>Workarounds</h3>
              <ul>
                <li><strong>For PDF Export:</strong> Use Ctrl+P / Cmd+P and "Save as PDF"</li>
                <li><strong>For Offline Work:</strong> Draft your report in a text editor first, then copy into YRIPP when online</li>
                <li><strong>For Role Changes:</strong> Contact your administrator directly</li>
              </ul>
            `,
          },
        ],
      };

    default:
      return {
        title: "Help Categories",
        description: "Select a category to view articles",
        articles: [],
      };
  }
}
