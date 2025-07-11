import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/currencyUtils';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMonthDisplay, navigateMonth, getCurrentMonth, isAtOrBeyondCurrentMonth } from '../utils/dateUtils';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    net: 0,
    previousMonthExpenses: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate previous month for comparison
      const [year, month] = selectedMonth.split('-').map(Number);
      const prevDate = new Date(year, month - 2, 1); // month - 2 because month is 1-indexed
      const previousMonth = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Fetch all data in parallel
      const [accountsRes, transactionsRes, currentMonthRes, previousMonthRes, budgetRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
        api.get(`/transactions/summary?month=${selectedMonth}`),
        api.get(`/transactions/summary?month=${previousMonth}`),
        api.get('/budgets/current').catch(() => ({ data: { budget: null } })) // Don't fail if no budget
      ]);

      setAccounts(accountsRes.data.accounts || []);
      setTransactions(transactionsRes.data.transactions || []);
      setCurrentBudget(budgetRes.data.budget);
      
      const currentSummary = currentMonthRes.data.summary || { total_income: 0, total_expense: 0 };
      const previousSummary = previousMonthRes.data.summary || { total_income: 0, total_expense: 0 };
      
      setMonthlyData({
        income: currentSummary.total_income,
        expenses: currentSummary.total_expense,
        net: currentSummary.total_income - currentSummary.total_expense,
        previousMonthExpenses: previousSummary.total_expense
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate total balance from all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);


  // Calculate expense change percentage
  const expenseChange = monthlyData.previousMonthExpenses > 0 
    ? ((monthlyData.expenses - monthlyData.previousMonthExpenses) / monthlyData.previousMonthExpenses * 100).toFixed(1)
    : 0;

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
    .slice(0, 5);

  // Month navigation function
  const changeMonth = (direction) => {
    setSelectedMonth(navigateMonth(selectedMonth, direction));
  };

  // Get real budget data with spending calculations
  const getBudgetData = () => {
    if (!currentBudget || !currentBudget.categories) {
      return [];
    }

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-purple-500', 'bg-pink-500'];
    
    return currentBudget.categories.map((budgetCategory, index) => ({
      category: budgetCategory.category?.name || 'Unknown',
      spent: budgetCategory.spent_amount || 0,
      budget: budgetCategory.allocated_amount || 0,
      remaining: budgetCategory.remaining_amount || 0,
      percentage: budgetCategory.percentage_used || 0,
      color: colors[index % colors.length],
      isOverBudget: (budgetCategory.spent_amount || 0) > (budgetCategory.allocated_amount || 0)
    }));
  };

  const budgetData = getBudgetData();

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      change: '+2.5%', // This would need historical data to calculate
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(monthlyData.income),
      change: '+8.2%', // This would need historical data to calculate
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(monthlyData.expenses),
      change: `${expenseChange > 0 ? '+' : ''}${expenseChange}%`,
      changeType: expenseChange > 0 ? 'negative' : 'positive',
      icon: TrendingDown,
    },
    {
      title: 'Net This Month',
      value: formatCurrency(monthlyData.net),
      change: monthlyData.net >= 0 ? 'Surplus' : 'Deficit',
      changeType: monthlyData.net >= 0 ? 'positive' : 'negative',
      icon: PiggyBank,
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
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
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Month Switcher */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {formatMonthDisplay(selectedMonth)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth(1)}
              disabled={isAtOrBeyondCurrentMonth(selectedMonth)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Link to="/transactions">
            <Button className="sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

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
                  {stat.title !== 'Net This Month' && (stat.changeType === 'positive' ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  ))}
                  <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  {stat.title === 'Monthly Expenses' && (
                    <span className="ml-1">from last month</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {transaction.description || transaction.category?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category?.name} • {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No transactions yet. Add your first transaction to get started!
                </p>
              )}
            </div>
            <Link to="/transactions">
              <Button variant="outline" className="w-full mt-4">
                View All Transactions
              </Button>
            </Link>
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
              <Link to="/transactions">
                <Button variant="outline" className="h-20 w-full flex flex-col">
                  <Plus className="h-5 w-5 mb-2" />
                  <span className="text-xs">Add Transaction</span>
                </Button>
              </Link>
              <Link to="/accounts">
                <Button variant="outline" className="h-20 w-full flex flex-col">
                  <CreditCard className="h-5 w-5 mb-2" />
                  <span className="text-xs">Add Account</span>
                </Button>
              </Link>
              <Link to="/investments">
                <Button variant="outline" className="h-20 w-full flex flex-col">
                  <TrendingUp className="h-5 w-5 mb-2" />
                  <span className="text-xs">Track Investment</span>
                </Button>
              </Link>
              <Link to="/goals">
                <Button variant="outline" className="h-20 w-full flex flex-col">
                  <PiggyBank className="h-5 w-5 mb-2" />
                  <span className="text-xs">Set Goal</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Monthly Budget Overview
          </CardTitle>
          <CardDescription>
            Track your spending against your budget for {formatMonthDisplay(selectedMonth, { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetData.length > 0 ? (
            <div className="space-y-4">
              {budgetData.map((item, index) => {
                const percentage = (item.spent / item.budget) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
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
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No expense data yet for this month. Start tracking your expenses!
            </p>
          )}
          <Link to="/budgets">
            <Button variant="outline" className="w-full mt-4">
              View Full Budget
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;