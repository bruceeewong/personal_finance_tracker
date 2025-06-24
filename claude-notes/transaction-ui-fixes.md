# Transaction UI Fixes - 2025-06-24

## Fixed Issues
1. **Icon Display**: Categories now show specific icons or income/expense fallbacks (💰/💸)
2. **Layout**: Description as main title, category/account/date as subtitle

## Changes Made
**File**: `/frontend/src/pages/TransactionsPage.jsx`
- Enhanced `getCategoryIcon()` for better icon handling
- Updated transaction list layout: description → title, category → subtitle
- Improved information hierarchy in transaction history

## Result
✅ Transaction history shows appropriate icons per category type
✅ Better visual hierarchy with description as primary info