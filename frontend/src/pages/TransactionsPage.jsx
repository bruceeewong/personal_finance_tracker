import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0 });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, categoriesRes, accountsRes, summaryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories'),
        api.get('/accounts'),
        api.get(`/transactions/summary?month=${selectedMonth}`)
      ]);
      
      setTransactions(transactionsRes.data.transactions || []);
      setCategories(categoriesRes.data.categories || []);
      setAccounts(accountsRes.data.accounts || []);
      setSummary(summaryRes.data.summary || { total_income: 0, total_expense: 0 });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_id: '',
      category_id: '',
      amount: '',
      description: '',
      transaction_date: new Date().toISOString().slice(0, 10)
    });
    setShowCreateForm(false);
    setEditingTransaction(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find the selected category to determine if it's income or expense
      const selectedCategory = categories.find(c => c.id === parseInt(formData.category_id));
      const isExpense = selectedCategory?.type === 'expense';
      
      // Convert amount to appropriate sign: negative for expenses, positive for income
      const amount = parseFloat(formData.amount);
      const finalAmount = isExpense ? -Math.abs(amount) : Math.abs(amount);
      
      const payload = {
        ...formData,
        amount: finalAmount,
        account_id: parseInt(formData.account_id),
        category_id: parseInt(formData.category_id)
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      account_id: transaction.account_id.toString(),
      category_id: transaction.category_id.toString(),
      amount: Math.abs(transaction.amount).toString(),
      description: transaction.description || '',
      transaction_date: transaction.transaction_date.slice(0, 10)
    });
    setEditingTransaction(transaction);
    setShowCreateForm(true);
  };

  const handleDelete = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await api.delete(`/transactions/${transactionId}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete transaction');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    // Use category's specific icon if available, otherwise use type-based icons
    if (category?.icon) {
      return category.icon;
    }
    return category?.type === 'income' ? '💰' : '💸';
  };

  const changeMonth = (direction) => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + direction);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || transaction.category_id === parseInt(selectedCategory);
    const matchesAccount = !selectedAccount || transaction.account_id === parseInt(selectedAccount);
    const matchesMonth = transaction.transaction_date.startsWith(selectedMonth);
    
    return matchesSearch && matchesCategory && matchesAccount && matchesMonth;
  });

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
              Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_income || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.total_expense || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-primary" />
              Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${
              (summary.total_income - summary.total_expense) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.total_income - summary.total_expense)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Categories</option>
              <optgroup label="Income">
                {categories.filter(c => c.type === 'income').map(category => (
                  <option key={category.id} value={category.id}>
                    {getCategoryIcon(category)} {category.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Expenses">
                {categories.filter(c => c.type === 'expense').map(category => (
                  <option key={category.id} value={category.id}>
                    {getCategoryIcon(category)} {category.name}
                  </option>
                ))}
              </optgroup>
            </select>

            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            {(searchTerm || selectedCategory || selectedAccount) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedAccount('');
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTransaction ? 'Edit Transaction' : 'Create New Transaction'}
            </CardTitle>
            <CardDescription>
              {editingTransaction ? 'Update transaction details' : 'Add a new income or expense'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_id">Account</Label>
                  <select
                    id="account_id"
                    value={formData.account_id}
                    onChange={(e) => setFormData(prev => ({...prev, account_id: e.target.value}))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select account...</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({formatCurrency(account.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({...prev, category_id: e.target.value}))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select category...</option>
                    <optgroup label="Income">
                      {categories.filter(c => c.type === 'income').map(category => (
                        <option key={category.id} value={category.id}>
                          {getCategoryIcon(category)} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Expenses">
                      {categories.filter(c => c.type === 'expense').map(category => (
                        <option key={category.id} value={category.id}>
                          {getCategoryIcon(category)} {category.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter positive amount (expenses will be automatically marked as negative)
                  </p>
                </div>

                <div>
                  <Label htmlFor="transaction_date">Date</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData(prev => ({...prev, transaction_date: e.target.value}))}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="e.g., Grocery shopping at Whole Foods"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Transaction History
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.description || transaction.category?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.category?.name} • {transaction.account?.name} • {formatDate(transaction.transaction_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {showCreateForm ? 'Fill out the form above to add your first transaction' : 'Click "Add Transaction" to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;