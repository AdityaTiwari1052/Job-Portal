import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const JobSeekerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, setActive } = useSignIn();
  const { signUp } = useSignUp();
  const { openSignIn, openSignUp } = useClerk();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          navigate('/jobs');
        }
      } else {
        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName: name.split(' ')[0],
          lastName: name.split(' ')[1] || '',
        });
        if (result.status === 'complete') {
          await result.prepareEmailAddressVerification({ strategy: 'email_code' });
          navigate('/verify-email');
        }
      }
    } catch (error) {
      toast.error(error.errors?.[0]?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (strategy) => {
    const authMethod = isLogin ? openSignIn : openSignUp;
    authMethod({ strategy: `oauth_${strategy}`, redirectUrl: '/sso-callback' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['google', 'github'].map((provider) => (
            <Button
              key={provider}
              variant="outline"
              onClick={() => handleSocialAuth(provider)}
              className="flex items-center gap-2"
            >
              <span className="capitalize">{provider}</span>
            </Button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Input
                label="Full Name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <Input
              label="Email address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerAuth;
