import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/currencyUtils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Copy,
  CheckCircle,
  AlertCircle,
  PiggyBank,
  Plane,
  Home,
  ShoppingCart,
  Car,
  Film,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatMonthDisplay, getCurrentMonth } from '../utils/dateUtils';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentBudget, setCurrentBudget] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly',
    amount: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    rollover_enabled: false,
    categories: [],
    goal: {
      goal_name: '',
      target_amount: '',
      target_date: '',
      auto_contribute_amount: '',
      auto_contribute_frequency: 'monthly'
    }
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes, currentRes] = await Promise.all([
        api.get(`/budgets?type=${activeTab}&status=active`),
        api.get('/categories'),
        api.get('/budgets/current')
      ]);
      
      setBudgets(budgetsRes.data.budgets || []);
      setCategories(categoriesRes.data.categories || []);
      setCurrentBudget(currentRes.data.budget);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetDetails = async (budgetId) => {
    try {
      const response = await api.get(`/budgets/${budgetId}`);
      return response.data.budget;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load budget details');
      return null;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'monthly',
      amount: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: '',
      rollover_enabled: false,
      categories: [],
      goal: {
        goal_name: '',
        target_amount: '',
        target_date: '',
        auto_contribute_amount: '',
        auto_contribute_frequency: 'monthly'
      }
    });
    setShowCreateForm(false);
    setEditingBudget(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        amount: parseFloat(formData.amount),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        rollover_enabled: formData.rollover_enabled
      };

      if (formData.type === 'monthly') {
        // Add categories with allocated amounts - convert allocation structure
        payload.categories = formData.categories
          .filter(cat => cat.allocated_amount > 0)
          .map(cat => ({
            category_id: cat.category_id,
            allocated_amount: cat.allocation_type === 'percentage' 
              ? (parseFloat(formData.amount) * cat.allocated_amount / 100)
              : cat.allocated_amount,
            alert_threshold_50: cat.alert_threshold_50,
            alert_threshold_75: cat.alert_threshold_75,
            alert_threshold_90: cat.alert_threshold_90,
            alert_threshold_100: cat.alert_threshold_100
          }));
      } else if (formData.type === 'goal') {
        // Add goal details
        payload.goal = {
          goal_name: formData.goal.goal_name,
          target_amount: parseFloat(formData.goal.target_amount),
          target_date: formData.goal.target_date,
          auto_contribute_amount: formData.goal.auto_contribute_amount ? parseFloat(formData.goal.auto_contribute_amount) : null,
          auto_contribute_frequency: formData.goal.auto_contribute_frequency
        };
      }

      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleEdit = async (budget) => {
    const detailedBudget = await fetchBudgetDetails(budget.id);
    if (!detailedBudget) return;

    const newFormData = {
      name: detailedBudget.name,
      type: detailedBudget.type,
      amount: detailedBudget.amount.toString(),
      start_date: detailedBudget.start_date,
      end_date: detailedBudget.end_date || '',
      rollover_enabled: detailedBudget.rollover_enabled,
      categories: [],
      goal: {
        goal_name: '',
        target_amount: '',
        target_date: '',
        auto_contribute_amount: '',
        auto_contribute_frequency: 'monthly'
      }
    };

    if (detailedBudget.type === 'monthly' && detailedBudget.categories) {
      // Map categories with allocations - convert to new allocation structure
      newFormData.categories = detailedBudget.categories
        .filter(bc => bc.allocated_amount > 0)
        .map(budgetCat => {
          const category = categories.find(cat => cat.id === budgetCat.category_id);
          return {
            id: budgetCat.id || Date.now() + Math.random(),
            category_id: budgetCat.category_id,
            category_name: category?.name || 'Unknown',
            allocated_amount: budgetCat.allocated_amount,
            allocation_type: 'fixed', // Default to fixed for existing allocations
            custom_name: category?.name || 'Unknown',
            alert_threshold_50: budgetCat.alert_threshold_50 !== false,
            alert_threshold_75: budgetCat.alert_threshold_75 !== false,
            alert_threshold_90: budgetCat.alert_threshold_90 !== false,
            alert_threshold_100: budgetCat.alert_threshold_100 !== false
          };
        });
    } else if (detailedBudget.type === 'goal' && detailedBudget.goals?.length > 0) {
      const goal = detailedBudget.goals[0];
      newFormData.goal = {
        goal_name: goal.goal_name,
        target_amount: goal.target_amount.toString(),
        target_date: goal.target_date,
        auto_contribute_amount: goal.auto_contribute_amount?.toString() || '',
        auto_contribute_frequency: goal.auto_contribute_frequency || 'monthly'
      };
    }

    setFormData(newFormData);
    setEditingBudget(detailedBudget);
    setShowCreateForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await api.delete(`/budgets/${budgetId}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete budget');
    }
  };

  const handleCopyBudget = async (budgetId) => {
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await api.post(`/budgets/copy/${budgetId}`, {
        name: `${formatMonthDisplay(nextMonth.toISOString().slice(0, 7))} Budget`,
        start_date: nextMonth.toISOString().slice(0, 10)
      });
      
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to copy budget');
    }
  };

  const handleContributeToGoal = async (budgetId, goalId, amount) => {
    try {
      await api.post(`/budgets/${budgetId}/goals/${goalId}/contribute`, { amount });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add contribution');
    }
  };


  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Housing': Home,
      'Groceries': ShoppingCart,
      'Transportation': Car,
      'Entertainment': Film,
      'Travel': Plane,
      'Savings': PiggyBank
    };
    return iconMap[categoryName] || DollarSign;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Allocation Management Components
  const AddAllocationForm = ({ categories, existingAllocations, onAdd, onCancel, totalBudget }) => {
    const [formData, setFormData] = useState({
      category_id: '',
      allocated_amount: '',
      allocation_type: 'fixed',
      custom_name: ''
    });

    const availableCategories = categories.filter(cat => 
      !existingAllocations.some(alloc => alloc.category_id === cat.id)
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category_id));
      const allocation = {
        id: Date.now(),
        category_id: parseInt(formData.category_id),
        category_name: selectedCategory?.name,
        allocated_amount: parseFloat(formData.allocated_amount),
        allocation_type: formData.allocation_type,
        custom_name: formData.custom_name || selectedCategory?.name,
        alert_threshold_50: true,
        alert_threshold_75: true,
        alert_threshold_90: true,
        alert_threshold_100: true
      };

      onAdd(allocation);
    };

    return (
      <Card className="p-4 border-dashed">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({...prev, category_id: e.target.value}))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select category...</option>
                {availableCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="custom_name">Custom Name (optional)</Label>
              <Input
                id="custom_name"
                value={formData.custom_name}
                onChange={(e) => setFormData(prev => ({...prev, custom_name: e.target.value}))}
                placeholder="e.g., Emergency Buffer, Fun Money"
              />
            </div>

            <div>
              <Label htmlFor="allocation_type">Allocation Type</Label>
              <select
                id="allocation_type"
                value={formData.allocation_type}
                onChange={(e) => setFormData(prev => ({...prev, allocation_type: e.target.value}))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage of Budget</option>
              </select>
            </div>

            <div>
              <Label htmlFor="allocated_amount">
                {formData.allocation_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              </Label>
              <Input
                id="allocated_amount"
                type="number"
                step={formData.allocation_type === 'percentage' ? '0.1' : '0.01'}
                min="0"
                max={formData.allocation_type === 'percentage' ? '100' : undefined}
                value={formData.allocated_amount}
                onChange={(e) => setFormData(prev => ({...prev, allocated_amount: e.target.value}))}
                placeholder={formData.allocation_type === 'percentage' ? '10.0' : '0.00'}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm">Add Allocation</Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  };

  const AllocationList = ({ allocations, categories, onUpdate, totalBudget }) => {
    const handleRemove = (allocationId) => {
      onUpdate(allocations.filter(alloc => alloc.id !== allocationId));
    };

    const handleAmountChange = (allocationId, newAmount) => {
      onUpdate(allocations.map(alloc => 
        alloc.id === allocationId 
          ? { ...alloc, allocated_amount: parseFloat(newAmount) || 0 }
          : alloc
      ));
    };

    const handleTypeChange = (allocationId, newType) => {
      onUpdate(allocations.map(alloc => 
        alloc.id === allocationId 
          ? { ...alloc, allocation_type: newType }
          : alloc
      ));
    };

    if (allocations.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <DollarSign className="h-8 w-8 mx-auto mb-2" />
          <p>No allocations yet. Click "Add Allocation" to start.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {allocations.map((allocation) => {
          const Icon = getCategoryIcon(allocation.category_name);
          const calculatedAmount = allocation.allocation_type === 'percentage' 
            ? (totalBudget * allocation.allocated_amount / 100)
            : allocation.allocated_amount;

          return (
            <div key={allocation.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{allocation.custom_name || allocation.category_name}</div>
                {allocation.allocation_type === 'percentage' && (
                  <div className="text-sm text-muted-foreground">
                    {allocation.allocated_amount}% = {formatCurrency(calculatedAmount)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={allocation.allocation_type}
                  onChange={(e) => handleTypeChange(allocation.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="fixed">$</option>
                  <option value="percentage">%</option>
                </select>

                <Input
                  type="number"
                  step={allocation.allocation_type === 'percentage' ? '0.1' : '0.01'}
                  min="0"
                  max={allocation.allocation_type === 'percentage' ? '100' : undefined}
                  value={allocation.allocated_amount}
                  onChange={(e) => handleAmountChange(allocation.id, e.target.value)}
                  className="w-20 text-right"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(allocation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const BudgetSummary = ({ allocations, totalBudget }) => {
    const totalAllocated = allocations.reduce((sum, alloc) => {
      return sum + (alloc.allocation_type === 'percentage' 
        ? (totalBudget * alloc.allocated_amount / 100)
        : alloc.allocated_amount);
    }, 0);

    const remaining = totalBudget - totalAllocated;
    const percentageAllocated = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

    return (
      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-lg font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Allocated</p>
            <p className={`text-lg font-bold ${totalAllocated > totalBudget ? 'text-red-600' : 'text-blue-600'}`}>
              {formatCurrency(totalAllocated)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        
        <Progress value={Math.min(percentageAllocated, 100)} className="mt-4" />
        
        {totalAllocated > totalBudget && (
          <p className="text-sm text-red-600 mt-2 text-center">
            ⚠️ Over budget by {formatCurrency(totalAllocated - totalBudget)}
          </p>
        )}
      </Card>
    );
  };

  const AllocationManager = ({ categories, allocations, onAllocationsChange, totalBudget }) => {
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddAllocation = (newAllocation) => {
      onAllocationsChange([...allocations, newAllocation]);
      setShowAddForm(false);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Budget Allocations</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={categories.length === allocations.length}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Allocation
          </Button>
        </div>

        <AllocationList 
          allocations={allocations}
          categories={categories}
          onUpdate={onAllocationsChange}
          totalBudget={totalBudget}
        />

        {showAddForm && (
          <AddAllocationForm
            categories={categories}
            existingAllocations={allocations}
            totalBudget={totalBudget}
            onAdd={handleAddAllocation}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <BudgetSummary 
          allocations={allocations} 
          totalBudget={parseFloat(totalBudget) || 0} 
        />
      </div>
    );
  };

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
            Budgets
          </h1>
          <p className="text-muted-foreground">
            Manage your spending and savings goals
          </p>
        </div>
        <Button 
          onClick={() => {
            setFormData(prev => ({ ...prev, type: activeTab }));
            setShowCreateForm(true);
          }}
          className="sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Current Month Budget Summary */}
      {currentBudget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Month Overview</span>
              <span className="text-sm font-normal text-muted-foreground">
                {formatMonthDisplay(getCurrentMonth())}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(currentBudget.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    currentBudget.categories?.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0) || 0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    currentBudget.amount - 
                    (currentBudget.categories?.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0) || 0)
                  )}
                </p>
              </div>
            </div>
            <Progress 
              value={
                ((currentBudget.categories?.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0) || 0) / 
                currentBudget.amount) * 100
              } 
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Monthly Budgets</TabsTrigger>
          <TabsTrigger value="goal">Savings Goals</TabsTrigger>
        </TabsList>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </CardTitle>
              <CardDescription>
                {formData.type === 'monthly' 
                  ? 'Set spending limits for each category'
                  : 'Create a savings goal with target amount and date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Budget Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder={formData.type === 'monthly' ? 'June 2024 Budget' : 'Europe Trip'}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">
                      {formData.type === 'monthly' ? 'Total Budget' : 'Target Amount'}
                    </Label>
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
                  </div>

                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">
                      {formData.type === 'monthly' ? 'End Date (optional)' : 'Target Date'}
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                      required={formData.type === 'goal'}
                    />
                  </div>
                </div>

                {/* Monthly Budget Categories */}
                {formData.type === 'monthly' && (
                  <AllocationManager
                    categories={categories}
                    allocations={formData.categories}
                    onAllocationsChange={(newAllocations) => {
                      setFormData(prev => ({ ...prev, categories: newAllocations }));
                    }}
                    totalBudget={parseFloat(formData.amount) || 0}
                  />
                )}

                {/* Goal Budget Details */}
                {formData.type === 'goal' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goal_name">Goal Name</Label>
                      <Input
                        id="goal_name"
                        value={formData.goal.goal_name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          goal: { ...prev.goal, goal_name: e.target.value }
                        }))}
                        placeholder="e.g., Europe Trip, Emergency Fund"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="auto_contribute_amount">
                          Auto-Contribute Amount (optional)
                        </Label>
                        <Input
                          id="auto_contribute_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.goal.auto_contribute_amount}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            goal: { ...prev.goal, auto_contribute_amount: e.target.value }
                          }))}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label htmlFor="auto_contribute_frequency">
                          Contribution Frequency
                        </Label>
                        <select
                          id="auto_contribute_frequency"
                          value={formData.goal.auto_contribute_frequency}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            goal: { ...prev.goal, auto_contribute_frequency: e.target.value }
                          }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingBudget ? 'Update Budget' : 'Create Budget'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Monthly Budgets Tab */}
        <TabsContent value="monthly" className="space-y-4">
          {budgets.filter(b => b.type === 'monthly').length > 0 ? (
            budgets.filter(b => b.type === 'monthly').map(budget => (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{budget.name}</CardTitle>
                      <CardDescription>
                        {formatCurrency(budget.amount)} total budget
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyBudget(budget.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    Period: {new Date(budget.start_date).toLocaleDateString()} - 
                    {budget.end_date ? new Date(budget.end_date).toLocaleDateString() : 'Ongoing'}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No monthly budgets yet</h3>
                <p className="text-muted-foreground">
                  Create your first monthly budget to start tracking expenses
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goal" className="space-y-4">
          {budgets.filter(b => b.type === 'goal').length > 0 ? (
            budgets.filter(b => b.type === 'goal').map(budget => (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{budget.name}</CardTitle>
                      <CardDescription>
                        Target: {formatCurrency(budget.amount)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={50} className="h-3 mb-2" />
                  <div className="text-sm text-muted-foreground">
                    50% complete • {formatCurrency(budget.amount / 2)} saved
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No savings goals yet</h3>
                <p className="text-muted-foreground">
                  Create a savings goal to track your progress
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetsPage;