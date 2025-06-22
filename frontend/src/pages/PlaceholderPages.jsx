import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';

export const AccountsPage = () => (
  <div className="p-4 lg:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Accounts</h1>
        <p className="text-muted-foreground">Manage your financial accounts</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Account
      </Button>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Account Management
        </CardTitle>
        <CardDescription>
          Track balances across checking, savings, credit cards, and crypto wallets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This feature will allow you to manage multiple account types including:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Checking and savings accounts</li>
          <li>• Credit cards with balance tracking</li>
          <li>• Cryptocurrency wallets</li>
          <li>• Investment accounts</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export const TransactionsPage = () => (
  <div className="p-4 lg:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Track income and expenses</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Transaction Management</CardTitle>
        <CardDescription>
          Record and categorize all your financial transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Features include:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Shared expense tracking with your partner</li>
          <li>• Automatic categorization</li>
          <li>• Historical data and trends</li>
          <li>• Monthly and annual summaries</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export const InvestmentsPage = () => (
  <div className="p-4 lg:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Investments</h1>
        <p className="text-muted-foreground">Track your investment portfolio</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Investment
      </Button>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Management</CardTitle>
        <CardDescription>
          Monitor your investments and track performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Investment tracking features:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Real-time portfolio valuation</li>
          <li>• Profit/loss calculations</li>
          <li>• Trading fee tracking</li>
          <li>• Performance analytics</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export const BudgetsPage = () => (
  <div className="p-4 lg:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Budgets</h1>
        <p className="text-muted-foreground">Plan and track your spending</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Create Budget
      </Button>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Budget Planning</CardTitle>
        <CardDescription>
          Set spending limits and track progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Budget management includes:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Category-based budgeting</li>
          <li>• Monthly and annual planning</li>
          <li>• Spending alerts</li>
          <li>• Budget vs actual analysis</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export const GoalsPage = () => (
  <div className="p-4 lg:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Goals</h1>
        <p className="text-muted-foreground">Set and track financial goals</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Goal
      </Button>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Financial Goals</CardTitle>
        <CardDescription>
          Track progress towards your financial objectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Goal tracking features:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Savings goals with target dates</li>
          <li>• Progress visualization</li>
          <li>• Automatic contribution tracking</li>
          <li>• Goal achievement celebrations</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export const SettingsPage = () => (
  <div className="p-4 lg:p-8 space-y-6">
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Manage your account and preferences</p>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Update your profile and application preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Settings include:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Profile information</li>
          <li>• Partner invitation and management</li>
          <li>• Security settings</li>
          <li>• Data export and backup</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

