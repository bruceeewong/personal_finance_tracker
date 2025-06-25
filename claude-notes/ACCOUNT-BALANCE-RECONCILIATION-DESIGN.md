# Account Balance Reconciliation Design

## Overview
Design for automatic account balance management using weekly batch reconciliation instead of real-time balance updates per transaction.

## Core Concept
- **Real-time**: Show calculated balance (last reconciled balance + recent transactions)
- **Weekly batch**: Every Sunday night, reconcile all accounts and update stored balances
- **Performance**: No balance updates during transaction operations

## Implementation Strategy

### 1. Balance Calculation Logic
```python
def get_current_balance(account_id, as_of_date=None):
    """Calculate current balance from last reconciled balance + recent transactions"""
    account = Account.query.get(account_id)
    
    # Get last reconciled balance (last Sunday)
    last_reconciliation = AccountBalanceHistory.query.filter_by(
        account_id=account_id,
        change_type='weekly_reconciliation'
    ).order_by(AccountBalanceHistory.recorded_at.desc()).first()
    
    base_balance = last_reconciliation.balance if last_reconciliation else account.balance
    base_date = last_reconciliation.recorded_at if last_reconciliation else account.created_at
    
    # Calculate transactions since last reconciliation
    if as_of_date is None:
        as_of_date = datetime.utcnow()
        
    recent_transactions = Transaction.query.filter(
        Transaction.account_id == account_id,
        Transaction.transaction_date > base_date,
        Transaction.transaction_date <= as_of_date
    ).all()
    
    transaction_sum = sum(t.amount for t in recent_transactions)
    
    return {
        'calculated_balance': base_balance + transaction_sum,
        'base_balance': base_balance,
        'base_date': base_date,
        'transaction_sum': transaction_sum,
        'transaction_count': len(recent_transactions),
        'is_reconciled': (as_of_date - base_date).days < 7
    }
```

### 2. Weekly Reconciliation Cron Job
```python
def weekly_reconciliation():
    """Run every Sunday night to reconcile all account balances"""
    print(f"Starting weekly reconciliation at {datetime.utcnow()}")
    
    accounts = Account.query.filter_by(is_active=True).all()
    reconciliation_date = datetime.utcnow()
    
    with db.session.begin():
        for account in accounts:
            try:
                # Calculate final balance for the week
                balance_info = get_current_balance(account.id, reconciliation_date)
                final_balance = balance_info['calculated_balance']
                
                # Update account balance
                account.balance = final_balance
                
                # Create reconciliation history record
                history = AccountBalanceHistory(
                    account_id=account.id,
                    balance=final_balance,
                    change_type='weekly_reconciliation',
                    previous_balance=balance_info['base_balance'],
                    change_amount=balance_info['transaction_sum'],
                    recorded_at=reconciliation_date,
                    metadata={
                        'transactions_processed': balance_info['transaction_count'],
                        'period_start': balance_info['base_date'].isoformat(),
                        'period_end': reconciliation_date.isoformat()
                    }
                )
                db.session.add(history)
                
            except Exception as e:
                print(f"Error reconciling account {account.id}: {e}")
                # Continue with other accounts
                
        db.session.commit()
```

### 3. Enhanced Balance History Model
```python
class AccountBalanceHistory(db.Model):
    __tablename__ = 'account_balance_history'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    change_type = db.Column(db.String(20))  # 'weekly_reconciliation', 'manual', etc.
    previous_balance = db.Column(db.Float)
    change_amount = db.Column(db.Float)  # Net change from transactions
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    metadata = db.Column(db.JSON)  # Store additional reconciliation info
```

### 4. Transaction Amount Convention
```python
# Transaction amount conventions:
# - Positive amounts: Income, deposits, credits (increase balance)
# - Negative amounts: Expenses, withdrawals, debits (decrease balance)

# Examples:
# Salary: +3000 (increases account balance)
# Grocery: -150 (decreases account balance)  
# Transfer in: +500 (increases this account)
# Transfer out: -500 (decreases this account)
```

### 5. Frontend Display
```jsx
const AccountBalance = ({ account }) => {
  const [balanceInfo, setBalanceInfo] = useState(null);
  
  useEffect(() => {
    api.get(`/accounts/${account.id}/current-balance`)
      .then(res => setBalanceInfo(res.data));
  }, [account.id]);
  
  return (
    <div>
      <div className="text-2xl font-bold">
        {formatCurrency(balanceInfo?.calculated_balance)}
      </div>
      {!balanceInfo?.is_reconciled && (
        <div className="text-xs text-muted-foreground">
          Pending reconciliation ({balanceInfo?.transaction_count} new transactions)
        </div>
      )}
    </div>
  );
};
```

## Pros and Cons

### Pros
✅ **Performance**: Faster transaction operations (no balance calculations during txn creation)
✅ **Scalability**: Can handle high transaction volumes without blocking
✅ **Data Integrity**: Single source of truth - balance calculated from transactions
✅ **Reliability**: No partial balance updates if transactions fail
✅ **Audit Trail**: Clear weekly balance snapshots for reporting
✅ **Simplicity**: Cleaner transaction creation/update/delete logic

### Cons
❌ **User Experience**: Users see "calculated" vs "actual" balance
❌ **Complexity**: More complex balance calculation logic
❌ **Dependency**: System relies on cron job running successfully
❌ **Performance for Heavy Users**: Many transactions = slower balance calculations
❌ **Delayed Finalization**: Balance not "final" until Sunday reconciliation

## Risk Mitigation

### 1. Cron Job Reliability
```python
def safe_weekly_reconciliation():
    try:
        weekly_reconciliation()
        send_reconciliation_success_notification()
    except Exception as e:
        send_reconciliation_failure_alert(str(e))
        # Optionally retry once
        time.sleep(300)
        weekly_reconciliation()
```

### 2. Performance Optimization
```python
# Use database aggregation for accounts with many transactions
def get_current_balance_optimized(account_id):
    base_info = get_last_reconciliation(account_id)
    
    transaction_sum = db.session.query(
        db.func.sum(Transaction.amount)
    ).filter(
        Transaction.account_id == account_id,
        Transaction.transaction_date > base_info['date']
    ).scalar() or 0
    
    return base_info['balance'] + transaction_sum
```

### 3. Manual Reconciliation Option
```python
@account_bp.route('/accounts/<int:account_id>/reconcile', methods=['POST'])
@jwt_required()
def manual_reconciliation(account_id):
    """Allow manual reconciliation if needed"""
    # Useful if cron job fails or user needs immediate update
```

## Implementation Steps

1. **Enhance AccountBalanceHistory model** with new fields
2. **Create balance calculation functions** in account model
3. **Add API endpoint** for current balance calculation
4. **Set up cron job** for weekly reconciliation
5. **Update frontend** to show calculated balances
6. **Add monitoring** for reconciliation job success/failure
7. **Create manual reconciliation endpoint** as backup

## Best Suited For
- Users who check balances daily/weekly rather than after every transaction
- Applications prioritizing transaction performance over real-time balance accuracy
- Systems with moderate transaction volume (not thousands per day per account)
- Financial apps where weekly summaries are natural business cycles

## Not Suitable For
- Banking applications requiring immediate balance updates
- High-frequency trading systems
- Applications where users expect real-time balance changes
- Systems with very few transactions per account (overhead not worth it)