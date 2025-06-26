import React from 'react';

const CategorySelector = ({ 
  categories = [], 
  value = '', 
  onChange, 
  placeholder = "Select category...",
  filterType = null, // 'income', 'expense', or null for all
  showIcons = true,
  className = "",
  required = false,
  id = "category"
}) => {
  const getCategoryIcon = (category) => {
    // Use category's specific icon if available, otherwise use type-based icons
    if (category?.icon) {
      return category.icon;
    }
    return category?.type === 'income' ? '💰' : '💸';
  };

  const filteredCategories = filterType 
    ? categories.filter(c => c.type === filterType)
    : categories;

  const groupedCategories = {
    income: categories.filter(c => c.type === 'income'),
    expense: categories.filter(c => c.type === 'expense'),
    transfer: categories.filter(c => c.type === 'transfer')
  };

  const baseClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // If filtering by type, use simple structure
  if (filterType) {
    return (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${baseClassName} ${className}`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {filteredCategories.map(category => (
          <option key={category.id} value={category.id}>
            {showIcons && getCategoryIcon(category)} {category.name}
          </option>
        ))}
      </select>
    );
  }

  // Use optgroups for full category selector
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${baseClassName} ${className}`}
      required={required}
    >
      <option value="">{placeholder}</option>
      
      {groupedCategories.income.length > 0 && (
        <optgroup label="Income">
          {groupedCategories.income.map(category => (
            <option key={category.id} value={category.id}>
              {showIcons && getCategoryIcon(category)} {category.name}
            </option>
          ))}
        </optgroup>
      )}
      
      {groupedCategories.expense.length > 0 && (
        <optgroup label="Expenses">
          {groupedCategories.expense.map(category => (
            <option key={category.id} value={category.id}>
              {showIcons && getCategoryIcon(category)} {category.name}
            </option>
          ))}
        </optgroup>
      )}
      
      {groupedCategories.transfer.length > 0 && (
        <optgroup label="Transfers">
          {groupedCategories.transfer.map(category => (
            <option key={category.id} value={category.id}>
              {showIcons && getCategoryIcon(category)} {category.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
};

export default CategorySelector;