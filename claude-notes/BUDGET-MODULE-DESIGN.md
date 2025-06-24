# Budget Module Design

## Overview
The budget module provides comprehensive budget management with two main types:
1. Monthly Category Budgets - Traditional monthly spending limits per category
2. Goal-Based Budgets - Dedicated savings for specific goals (travel, purchases)

## Core Features

### 1. Monthly Category Budgets
- Set spending limits for each expense category
- Real-time tracking with visual progress indicators
- Budget vs actual comparison
- Support for both zero-based and traditional budgeting

### 2. Goal-Based Budgets
- Create savings goals with target amounts and dates
- Track contributions and progress
- Multiple concurrent goals support
- Separate from operational budgets

## Database Schema

### budgets table
```sql
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'monthly' or 'goal'
    amount DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'completed'
    rollover_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### budget_categories table
```sql
CREATE TABLE budget_categories (
    id INTEGER PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    allocated_amount DECIMAL(10, 2) NOT NULL,
    alert_threshold_50 BOOLEAN DEFAULT TRUE,
    alert_threshold_75 BOOLEAN DEFAULT TRUE,
    alert_threshold_90 BOOLEAN DEFAULT TRUE,
    alert_threshold_100 BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(budget_id, category_id)
);
```

### budget_goals table
```sql
CREATE TABLE budget_goals (
    id INTEGER PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0,
    target_date DATE NOT NULL,
    auto_contribute_amount DECIMAL(10, 2),
    auto_contribute_frequency VARCHAR(20), -- 'weekly', 'monthly'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id)
);
```

## API Endpoints

### Budget Management
- `GET /api/budgets` - List all budgets for user
- `GET /api/budgets/:id` - Get specific budget details
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/current` - Get current month's active budget

### Budget Categories
- `GET /api/budgets/:id/categories` - Get budget categories with spending
- `POST /api/budgets/:id/categories` - Add/update category budgets
- `DELETE /api/budgets/:id/categories/:categoryId` - Remove category from budget

### Budget Goals
- `GET /api/budgets/:id/goals` - Get budget goals
- `POST /api/budgets/:id/goals` - Create new goal
- `PUT /api/budgets/:id/goals/:goalId` - Update goal
- `POST /api/budgets/:id/goals/:goalId/contribute` - Add contribution

### Budget Analytics
- `GET /api/budgets/:id/summary` - Get budget summary with spending
- `GET /api/budgets/:id/history` - Get historical budget performance
- `GET /api/budgets/insights` - Get budget recommendations

## UI Components

### BudgetsPage Layout
```
┌─────────────────────────────────────┐
│ Budget Overview - [Month Year]      │
│ ┌─────────────┬─────────────┐      │
│ │ Total Budget│ Spent       │      │
│ │ $5,000      │ $3,250 (65%)│      │
│ └─────────────┴─────────────┘      │
│                                     │
│ [Monthly Budgets] [Goals]           │
│                                     │
│ Category Budgets:                   │
│ ┌─────────────────────────────┐    │
│ │ Housing      ████████ 100%  │    │
│ │ Groceries    ██████░░ 75%   │    │
│ │ Transport    ████░░░░ 50%   │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Key UI Features
1. **Progress Visualization**
   - Color-coded progress bars (green/yellow/red)
   - Percentage indicators
   - Remaining daily spend calculation

2. **Quick Actions**
   - Create budget from template
   - Copy previous month
   - Quick edit amounts
   - Set alerts

3. **Budget Insights**
   - Overspending warnings
   - Suggested adjustments
   - Trend analysis
   - Comparison to previous months

## Implementation Priority

### Phase 1 - Core Functionality
1. Database schema creation
2. Basic CRUD API endpoints
3. Monthly category budgets UI
4. Simple progress tracking

### Phase 2 - Enhanced Features
1. Goal-based budgets
2. Budget templates
3. Alert system
4. Historical analysis

### Phase 3 - Advanced Features
1. AI-powered recommendations
2. Shared budgets for couples
3. Auto-categorization
4. Advanced reporting

## Technical Considerations

### Performance
- Cache budget calculations
- Optimize queries for spending summaries
- Real-time updates using WebSockets (future)

### Security
- User can only access own budgets
- Validate budget amounts and dates
- Audit trail for budget changes

### Scalability
- Design for multiple budget periods
- Support for different currencies (future)
- Flexible category mapping