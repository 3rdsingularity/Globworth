# GlobeWorth Database Schema

This document describes the Firestore database structure for GlobeWorth.

## Overview

GlobeWorth uses a nested collection structure under each user document:

```
users/{userId}/
├── (user document)
├── assets/{assetId}
├── liabilities/{liabilityId}
├── snapshots/{snapshotId}
└── settings/preferences
```

## Collections

### 1. Users Collection

**Path:** `users/{userId}`

**Purpose:** Stores user profile information

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `email` | string | User's email address |
| `displayName` | string | User's display name |
| `photoURL` | string | Profile photo URL |
| `createdAt` | timestamp | Account creation date |
| `lastLoginAt` | timestamp | Last login timestamp |

**Example:**
```json
{
  "uid": "abc123def456",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-06-20T14:22:00Z"
}
```

---

### 2. Assets Collection

**Path:** `users/{userId}/assets/{assetId}`

**Purpose:** Stores user's assets and investments

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique asset ID |
| `name` | string | Asset name |
| `type` | string | Asset type (stock, mutual_fund, etf, etc.) |
| `category` | string | Geographic category (india, germany, other) |
| `units` | number | Number of units/shares |
| `purchasePrice` | number | Price per unit at purchase |
| `currentPrice` | number | Current price per unit |
| `currentValue` | number | Calculated: units × currentPrice |
| `investmentAmount` | number | Calculated: units × purchasePrice |
| `currency` | string | Currency code (USD, EUR, INR, etc.) |
| `notes` | string | Optional notes |
| `isin` | string | ISIN code (for securities) |
| `platform` | string | Platform/broker (Zerodha, N26, etc.) |
| `autoUpdate` | boolean | Whether to auto-fetch prices |
| `createdAt` | timestamp | Creation date |
| `updatedAt` | timestamp | Last update date |
| `userId` | string | Owner's user ID |

**Asset Types:**
- `mutual_fund` - Mutual funds
- `stock` - Individual stocks
- `etf` - Exchange-traded funds
- `cash` - Cash holdings
- `crypto` - Cryptocurrency
- `real_estate` - Real estate investments
- `gold` - Gold holdings
- `fixed_deposit` - Fixed/term deposits
- `ppf` - Public Provident Fund (India)
- `epf` - Employee Provident Fund (India)
- `bank_account` - Bank accounts
- `emergency_fund` - Emergency savings
- `other` - Other assets

**Example:**
```json
{
  "id": "asset_123",
  "name": "Apple Inc.",
  "type": "stock",
  "category": "other",
  "units": 10,
  "purchasePrice": 150.00,
  "currentPrice": 175.50,
  "currentValue": 1755.00,
  "investmentAmount": 1500.00,
  "currency": "USD",
  "notes": "Long term investment",
  "isin": "US0378331005",
  "platform": "N26",
  "autoUpdate": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-06-20T14:22:00Z",
  "userId": "abc123def456"
}
```

---

### 3. Liabilities Collection

**Path:** `users/{userId}/liabilities/{liabilityId}`

**Purpose:** Stores user's debts and loans

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique liability ID |
| `name` | string | Liability name |
| `type` | string | Liability type |
| `outstandingAmount` | number | Current outstanding balance |
| `interestRate` | number | Annual interest rate (%) |
| `emi` | number | Monthly EMI (optional) |
| `currency` | string | Currency code |
| `dueDate` | timestamp | Next due date (optional) |
| `notes` | string | Optional notes |
| `lender` | string | Lender/bank name |
| `createdAt` | timestamp | Creation date |
| `updatedAt` | timestamp | Last update date |
| `userId` | string | Owner's user ID |

**Liability Types:**
- `education_loan` - Student/education loans
- `personal_loan` - Personal loans
- `credit_card` - Credit card debt
- `mortgage` - Home loans
- `car_loan` - Vehicle loans
- `other` - Other liabilities

**Example:**
```json
{
  "id": "liab_456",
  "name": "Home Loan",
  "type": "mortgage",
  "outstandingAmount": 250000.00,
  "interestRate": 6.5,
  "emi": 1800.00,
  "currency": "EUR",
  "dueDate": "2024-07-01T00:00:00Z",
  "notes": "20 year tenure",
  "lender": "Deutsche Bank",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-06-20T14:22:00Z",
  "userId": "abc123def456"
}
```

---

### 4. Snapshots Collection

**Path:** `users/{userId}/snapshots/{snapshotId}`

**Purpose:** Stores historical net worth snapshots

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique snapshot ID |
| `date` | timestamp | Snapshot date |
| `netWorth` | number | Net worth at snapshot time |
| `totalAssets` | number | Total assets value |
| `totalLiabilities` | number | Total liabilities value |
| `debtRatio` | number | Debt ratio percentage |
| `displayCurrency` | string | Currency used for display |
| `exchangeRates` | map | FX rates at snapshot time |
| `assetBreakdown` | map | Asset values by type |
| `userId` | string | Owner's user ID |

**Example:**
```json
{
  "id": "snap_789",
  "date": "2024-06-01T00:00:00Z",
  "netWorth": 150000.00,
  "totalAssets": 200000.00,
  "totalLiabilities": 50000.00,
  "debtRatio": 25.0,
  "displayCurrency": "EUR",
  "exchangeRates": {
    "USD": 1.0,
    "EUR": 0.92,
    "INR": 83.5
  },
  "assetBreakdown": {
    "stock": 50000.00,
    "mutual_fund": 80000.00,
    "cash": 20000.00,
    "real_estate": 50000.00
  },
  "userId": "abc123def456"
}
```

---

### 5. Settings Document

**Path:** `users/{userId}/settings/preferences`

**Purpose:** Stores user preferences and app settings

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Owner's user ID |
| `displayCurrency` | string | Preferred display currency |
| `darkMode` | boolean | Dark mode enabled |
| `livePriceFetching` | boolean | Auto-fetch live prices |
| `roundingFormat` | string | Number format preference |
| `emailSummary` | boolean | Monthly email summary |
| `createdAt` | timestamp | Settings creation date |
| `updatedAt` | timestamp | Last update date |

**Example:**
```json
{
  "userId": "abc123def456",
  "displayCurrency": "EUR",
  "darkMode": false,
  "livePriceFetching": true,
  "roundingFormat": "decimal",
  "emailSummary": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-06-20T14:22:00Z"
}
```

---

## Indexes

### Required Firestore Indexes

Create these composite indexes for optimal query performance:

**assets collection:**
```
Collection: assets
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**liabilities collection:**
```
Collection: liabilities
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**snapshots collection:**
```
Collection: snapshots
Fields:
  - userId (Ascending)
  - date (Descending)
```

---

## Data Relationships

```
User (1)
├── Assets (N)
├── Liabilities (N)
├── Snapshots (N)
└── Settings (1)
```

---

## Security Rules

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Assets subcollection
      match /assets/{assetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Liabilities subcollection
      match /liabilities/{liabilityId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Snapshots subcollection
      match /snapshots/{snapshotId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Settings subcollection
      match /settings/{settingsId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Backup Strategy

### Manual Export

Users can export their data from the Settings page:
- JSON format
- Includes all assets, liabilities, settings, and snapshots

### Automated Backups

For production, consider:
1. **Firebase Extensions**: Use "Backup Firestore" extension
2. **Cloud Functions**: Scheduled exports to Cloud Storage
3. **Google Drive**: Future integration for user-managed backups

---

## Migration Guide

### Adding New Fields

1. Update TypeScript types in `src/types/index.ts`
2. Update store actions in `src/store/index.ts`
3. Run migration script (if needed)
4. Update UI components

### Example Migration Script

```typescript
// migrations/v1_to_v2.ts
import { db } from './firebase';
import { collection, getDocs, updateDoc } from 'firebase/firestore';

async function migrateV1ToV2() {
  const assetsSnapshot = await getDocs(collection(db, 'users', userId, 'assets'));
  
  assetsSnapshot.docs.forEach(async (doc) => {
    const data = doc.data();
    if (!data.newField) {
      await updateDoc(doc.ref, {
        newField: defaultValue,
      });
    }
  });
}
```

---

## Performance Considerations

1. **Pagination**: Implement for large asset/liability lists
2. **Caching**: Use Zustand persist for offline access
3. **Indexing**: Create composite indexes for common queries
4. **Batch Writes**: Use batched writes for bulk operations
5. **Lazy Loading**: Load charts and heavy data on demand

---

## Data Validation

Client-side validation in `src/store/index.ts`:
- Required fields
- Numeric ranges
- Currency codes
- Date formats

Server-side validation via Firestore rules:
- Type checking
- Range validation
- User ownership

---

For questions or issues, refer to the main README or create an issue on GitHub.
