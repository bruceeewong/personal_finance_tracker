import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RegisterPage = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirm_password, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <DollarSign className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
          <p className="text-muted-foreground mt-2">
            Create your personal finance account
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={formErrors.first_name ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {formErrors.first_name && (
                    <p className="text-sm text-destructive">{formErrors.first_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={formErrors.last_name ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {formErrors.last_name && (
                    <p className="text-sm text-destructive">{formErrors.last_name}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={formErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={formErrors.confirm_password ? 'border-destructive pr-10' : 'pr-10'}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formErrors.confirm_password && (
                  <p className="text-sm text-destructive">{formErrors.confirm_password}</p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By creating an account, you agree to our terms of service</p>
          <p>Your data is encrypted and protected</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

