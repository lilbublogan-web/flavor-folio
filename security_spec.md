# Maison Cook Security Specification

## Data Invariants
1. **Recipe Ownership:** Every recipe must have an `authorId` that exactly matches the UID of the user who created it.
2. **User Isolation:** All user-specific data (UserProfile, ShoppingList) must be strictly accessible only by the respective user.
3. **Immutability:** `createdAt` timestamps and `authorId` fields must remain unchanged after creation.
4. **Subscription Integrity:** The `isPremium` field in `UserProfile` is a protected field. Users cannot upgrade themselves via the client SDK.

## The Dirty Dozen (Logic Leaks to Block)
1. **Identity Spoofing:** Attempting to create a recipe with `authorId: 'other_user'`.
2. **Privilege Escalation:** Sending `isPremium: true` in a `UserProfile` update.
3. **Data Poisoning:** Injecting a 2MB string into a recipe `title`.
4. **PII Leak:** An authenticated user attempting to `get` another user's `UserProfile` document.
5. **Relational Orphan:** Creating a shopping item under a `userId` that doesn't match the current user.
6. **Timestamp Spoofing:** Providing a manual `createdAt` in the past.
7. **Schema Drift:** Adding a `admin: true` field to a `UserProfile`.
8. **Sub-resource Scraping:** Attempting to `list` all `shoppingList` items across all users.
9. **Terminal State Bypass:** (N/A for this app currently).
10. **Shadow Updates:** Updating a recipe but sneaking in a change to `authorId`.
11. **Type Injection:** Setting `ingredients` to a string instead of a list.
12. **ID Exhausion:** Using a 10KB string as a document ID.

## Test Runner (firestore.rules.test.ts placeholder)
We will verify these rules using the Firebase Security Rules Emulator.
