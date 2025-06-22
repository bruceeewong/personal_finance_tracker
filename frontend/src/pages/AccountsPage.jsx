import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
  Home,
  Building,
  Bitcoin
} from 'lucide-react';

const AccountTypeIcons = {
  1: CreditCard,  // Checking
  2: PiggyBank,   // Savings  
  3: CreditCard,  // Credit Card
  4: TrendingUp,  // Investment
  5: Building,    // Retirement
  6: Wallet,      // Cash
  7: Home,        // Loan
  8: Bitcoin,     // Crypto
};

const AccountsPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    account_type_id: '',
    balance: '',
    currency: 'USD'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsResponse, typesResponse] = await Promise.all([
        api.get('/accounts'),
        api.get('/account-types')
      ]);
      
      setAccounts(accountsResponse.data.accounts || []);
      setAccountTypes(typesResponse.data.account_types || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      account_type_id: '',
      balance: '',
      currency: 'USD'
    });
    setShowCreateForm(false);
    setEditingAccount(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        balance: formData.balance ? parseFloat(formData.balance) : 0,
        account_type_id: parseInt(formData.account_type_id)
      };

      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save account');
    }
  };

  const handleEdit = (account) => {
    setFormData({
      name: account.name,
      account_type_id: account.account_type_id.toString(),
      balance: account.balance.toString(),
      currency: account.currency
    });
    setEditingAccount(account);
    setShowCreateForm(true);
  };

  const handleDelete = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await api.delete(`/accounts/${accountId}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    }
  };

  const getAccountTypeName = (typeId) => {
    const type = accountTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

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
            Accounts
          </h1>
          <p className="text-muted-foreground">
            Manage your financial accounts and track balances
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Account Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold">{accounts.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Types</p>
              <p className="text-2xl font-bold">{new Set(accounts.map(a => a.account_type_id)).size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAccount ? 'Edit Account' : 'Create New Account'}
            </CardTitle>
            <CardDescription>
              {editingAccount ? 'Update account details' : 'Add a new financial account to track'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g., Main Checking"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="account_type_id">Account Type</Label>
                  <select
                    id="account_type_id"
                    value={formData.account_type_id}
                    onChange={(e) => setFormData(prev => ({...prev, account_type_id: e.target.value}))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select account type...</option>
                    {accountTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="balance">Initial Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({...prev, balance: e.target.value}))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({...prev, currency: e.target.value}))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => {
          const IconComponent = AccountTypeIcons[account.account_type_id] || Wallet;
          const typeName = getAccountTypeName(account.account_type_id);
          
          return (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{typeName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className={`text-xl font-bold ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {accounts.length === 0 && !showCreateForm && (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by adding your first financial account
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsPage;

