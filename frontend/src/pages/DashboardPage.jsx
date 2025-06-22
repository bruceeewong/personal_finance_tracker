import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accounts');
      setAccounts(response.data.accounts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate real statistics from account data
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const checkingAccounts = accounts.filter(acc => acc.account_type_id === 1);
  const savingsAccounts = accounts.filter(acc => acc.account_type_id === 2);
  const investmentAccounts = accounts.filter(acc => acc.account_type_id === 4);
  
  const checkingBalance = checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsBalance = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const investmentBalance = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      change: '+0.0%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Checking Accounts',
      value: formatCurrency(checkingBalance),
      change: '+0.0%',
      changeType: 'positive',
      icon: CreditCard,
    },
    {
      title: 'Investments',
      value: formatCurrency(investmentBalance),
      change: '+0.0%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      title: 'Savings',
      value: formatCurrency(savingsBalance),
      change: '+0.0%',
      changeType: 'positive',
      icon: PiggyBank,
    },
  ];

  const recentTransactions = [
    { id: 1, description: 'Grocery Store', amount: -87.32, date: '2025-06-21', category: 'Food' },
    { id: 2, description: 'Salary Deposit', amount: 3500.00, date: '2025-06-20', category: 'Income' },
    { id: 3, description: 'Gas Station', amount: -45.67, date: '2025-06-19', category: 'Transportation' },
    { id: 4, description: 'Coffee Shop', amount: -12.50, date: '2025-06-19', category: 'Food' },
    { id: 5, description: 'Online Purchase', amount: -129.99, date: '2025-06-18', category: 'Shopping' },
  ];

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your financial status
          </p>
        </div>
        <Button className="sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account Summary */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>
              Overview of your active accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Type ID: {account.account_type_id} • {account.currency}
                    </p>
                  </div>
                  <div className={`text-sm font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.balance, account.currency)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category} • {transaction.date}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col">
                <Plus className="h-5 w-5 mb-2" />
                <span className="text-xs">Add Transaction</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <CreditCard className="h-5 w-5 mb-2" />
                <span className="text-xs">Add Account</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <TrendingUp className="h-5 w-5 mb-2" />
                <span className="text-xs">Track Investment</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <PiggyBank className="h-5 w-5 mb-2" />
                <span className="text-xs">Set Goal</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget Overview</CardTitle>
          <CardDescription>
            Track your spending against your budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: 'Food & Dining', spent: 487, budget: 600, color: 'bg-blue-500' },
              { category: 'Transportation', spent: 234, budget: 300, color: 'bg-green-500' },
              { category: 'Shopping', spent: 156, budget: 200, color: 'bg-yellow-500' },
              { category: 'Entertainment', spent: 89, budget: 150, color: 'bg-purple-500' },
            ].map((item, index) => {
              const percentage = (item.spent / item.budget) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">
                      ${item.spent} / ${item.budget}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Full Budget
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;