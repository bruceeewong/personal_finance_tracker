import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
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

  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Balance',
      value: '$12,345.67',
      change: '+2.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Monthly Expenses',
      value: '$2,847.32',
      change: '-5.2%',
      changeType: 'negative',
      icon: CreditCard,
    },
    {
      title: 'Investments',
      value: '$8,921.45',
      change: '+12.3%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      title: 'Savings Goals',
      value: '$5,432.10',
      change: '+8.7%',
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

