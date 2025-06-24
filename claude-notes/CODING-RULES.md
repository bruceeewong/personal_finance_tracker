# Coding Rules & Best Practices

## Rule 1: DRY Principle - Don't Repeat Yourself

**When editing the same code pattern twice or more across different files, refactor into a shared utility function.**

### Examples to Watch For:
- Date formatting logic (month display, date parsing)
- API error handling patterns
- Form validation logic
- Currency formatting
- Month navigation logic
- State management patterns

### Refactoring Strategy:
1. **Identify Pattern**: If editing similar code in 2+ files
2. **Create Utility**: Place in appropriate shared location:
   - `/frontend/src/utils/` for general utilities
   - `/frontend/src/components/common/` for reusable components
   - `/frontend/src/hooks/` for custom hooks
3. **Import & Replace**: Update all instances to use shared function
4. **Test**: Ensure all usages work correctly

### Current Refactoring Opportunities:
- **Month formatting**: Used in Dashboard & TransactionsPage
- **Month navigation logic**: Duplicated in both pages
- **Currency formatting**: Present in multiple components
- **API error handling**: Repeated patterns across pages

## Rule 2: Consistent Patterns

- Follow established code patterns in the project
- Use existing UI components and styling
- Maintain consistent error handling
- Keep similar file structures across pages

## Rule 3: Git Workflow

**CRITICAL: Always check and add ALL modified files before committing**

### Pre-commit Checklist:
1. **Check all changes**: `git status` to see all modified files
2. **Add frontend files**: Especially check `/frontend/src/` changes
3. **Add backend files**: Check `/backend/src/` changes  
4. **Add documentation**: Any `.md` files updated
5. **Verify staging**: `git diff --staged` to confirm what's being committed

### Common Missed Files:
- Frontend React components (`/frontend/src/pages/`, `/frontend/src/components/`)
- Utility functions (`/frontend/src/utils/`)
- Backend routes and models (`/backend/src/`)
- Configuration files

## Rule 4: Memory Management

- Always update `COMPLETED-FEATURES.md` after major changes
- Create brief memory dumps for complex fixes
- Clean up temporary note files after consolidation