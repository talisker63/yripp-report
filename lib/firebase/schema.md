# Firestore Database Schema - YRIPP Interview Reports

## Collection Structure

### Collection: `interviewReports`

Each document represents a complete YRIPP Interview Report with the following structure:

```
interviewReports/
  {reportId}/
    sectionA: {
      independentPersonName: string
      policeStation: string
      interviewDate: Timestamp (stored as date)
      callTime: string
      policeContact: {
        rank: string
        name: string
        section: string
      }
      arrivalTime: string
      parentNotAttendingReason: string[]
      parentNotAttendingOther?: string
      custodyDuration: string
      mainOffenceTypes: {
        crimesAgainstPerson: string[]
        crimesAgainstPersonOther?: string
        drugs: string[]
        drugsOther?: string
        crimesAgainstProperty: string[]
        crimesAgainstPropertyOther?: string
        other: string[]
        otherOther?: string
      }
      offenceOccurredInDHHS: "yes" | "no" | ""
    }
    
    sectionBPartA: {
      preferredFirstName: string
      immediateNeeds: Array<{
        type: string
        required: boolean
        provided: boolean
        notProvided: boolean
        other?: string
      }>
      satisfiedWithPoliceTreatment: "yes" | "no" | ""
      policeTreatmentConcerns: string[]
      policeTreatmentConcernsOther?: string
      actionRequired: "yes" | "no" | ""
      actionDetails?: string
      injuries?: string
      gender: "male" | "female" | "other" | ""
      genderOther?: string
      age: string
      dateOfBirth: Timestamp (stored as date)
      livingArrangement: string
      countryOfBirth: string
      culturalIdentity: string
      isATSI: "yes" | "no" | ""
      valsContacted: "yes" | "no" | ""
      valsNotContactedReason?: string
      englishFirstLanguage: "yes" | "no" | ""
      otherLanguages: string
      previousPoliceInterviews: "yes" | "no" | ""
      ypConcernsAboutPoliceTreatment: string[]
      ypConcernsAboutPoliceTreatmentOther?: string
      ypActionWanted: string[]
      ypActionWantedOther?: string
    }
    
    sectionC: { ... }
    interview: { ... }
    outcome: { ... }
    ipConcerns: { ... }
    sectionBPartB: { ... }
    sectionE: { ... }
    sectionF: { ... }
    officeUse: { ... }
    
    metadata: {
      createdAt: Timestamp (server timestamp)
      updatedAt: Timestamp (server timestamp)
      submittedAt?: Timestamp (server timestamp)
      ipId: string (Firebase Auth UID)
      ipName?: string
      draft: boolean
      submitted: boolean
    }
```

## Security Rules

### Access Control

- **Independent Persons**: Can create and edit their own draft reports
- **YRIPP Staff**: Can read all submitted reports
- **Admins**: Full access (read, write, delete)
- **Submitted Reports**: Once submitted, reports cannot be edited (immutable for legal reasons)

### Key Rules

1. Only authenticated users can access reports
2. Drafts can only be edited by their creator (IP)
3. Submitted reports are read-only
4. Only admins can delete reports
5. Reports must have valid structure (validated on create)

## Indexes

### Composite Indexes

1. **User Drafts Query**
   - Fields: `metadata.ipId` (ASC), `metadata.submitted` (ASC), `metadata.updatedAt` (DESC)
   - Use: List all drafts for a specific IP

2. **Date Range Query**
   - Fields: `sectionA.interviewDate` (DESC), `metadata.submitted` (ASC)
   - Use: Find reports by date range

3. **Police Station Query**
   - Fields: `sectionA.policeStation` (ASC), `sectionA.interviewDate` (DESC)
   - Use: Find all reports from a specific police station

4. **Recent Submissions**
   - Fields: `metadata.submitted` (ASC), `metadata.createdAt` (DESC)
   - Use: Get recently submitted reports

5. **Reports with Concerns**
   - Fields: `ipConcerns.hasConcerns` (ASC), `metadata.submitted` (ASC), `sectionA.interviewDate` (DESC)
   - Use: Flag reports that have IP concerns for review

6. **Call ID Lookup**
   - Fields: `officeUse.callId` (ASC)
   - Use: Find report by call ID

7. **Outcome Analysis**
   - Fields: `outcome.interviewOutcome` (ASC), `sectionA.interviewDate` (DESC)
   - Use: Analyze outcomes over time

## Data Integrity

### Timestamps

- `createdAt`: Set once on creation (immutable)
- `updatedAt`: Updated on every save
- `submittedAt`: Set when report is submitted (immutable)
- `interviewDate`: Converted to Firestore Timestamp for date queries
- `dateOfBirth`: Converted to Firestore Timestamp for age calculations

### Validation

- Reports must have all required sections (A, B, C, etc.)
- Metadata must include: `createdAt`, `updatedAt`, `draft`, `submitted`
- Draft reports cannot be submitted without required fields
- Submitted reports cannot be modified

## Query Patterns

### Common Queries

1. **Get user's drafts**
   ```typescript
   getDraftsByUser(userId)
   ```

2. **Get reports by date range**
   ```typescript
   getReportsByDateRange(startDate, endDate, submittedOnly)
   ```

3. **Get reports by police station**
   ```typescript
   getReportsByPoliceStation(stationName, limit)
   ```

4. **Get reports with concerns**
   ```typescript
   getReportsWithConcerns(limit)
   ```

5. **Get recent submissions**
   ```typescript
   getRecentReports(limit)
   ```

## Privacy Considerations

- YP contact details (Section B Part B) only stored if permission given
- Confidential YRIPP information should not be in public sections
- Access logs should track who views submitted reports
- Data retention policies should be enforced

## Backup and Archival

- All submitted reports should be backed up regularly
- Drafts older than 30 days may be archived
- Deleted reports should be soft-deleted (archived) rather than permanently removed
- Consider implementing version history for audit trails
