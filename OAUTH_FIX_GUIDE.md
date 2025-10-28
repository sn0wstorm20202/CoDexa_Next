# 🔧 OAuth & Authentication State Fix Guide

## Your Current Issues

1. ❌ No Google OAuth button on login page
2. ❌ Login/Signup buttons still show after authentication
3. ❌ No user details displayed when logged in
4. ❌ Missing OAuth callback handler

---

## ✅ Complete Fix - Step by Step

### **Step 1: Install Required Package**

Open your terminal in the **generated project directory** (not CoDexa_Next root) and run:

```bash
npm install @supabase/ssr
```

---

### **Step 2: Create Server Supabase Client**

Create file: `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

---

### **Step 3: Create OAuth Callback Route**

Create file: `app/auth/callback/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // Redirect to dashboard after successful auth
  return NextResponse.redirect(requestUrl.origin + '/dashboard');
}
```

---

### **Step 4: Update Login Page with OAuth**

Find your `app/login/page.tsx` file and **replace it** with:

```typescript
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Note: Page will redirect to Google, so we don't set loading to false
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        
        {/* Google OAuth Button */}
        <div className="space-y-3">
          <Button 
            onClick={handleGoogleLogin} 
            className="w-full" 
            variant="outline"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Loading...' : 'Continue with Google'}
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Login with Email'}
          </Button>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

### **Step 5: Create Authentication State Component**

Create file: `components/AuthProvider.tsx`

```typescript
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

### **Step 6: Update Layout to Use AuthProvider**

Find your `app/layout.tsx` and wrap the children with AuthProvider:

```typescript
import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### **Step 7: Create/Update Navbar with Auth State**

Create file: `components/Navbar.tsx` (or update if exists)

```typescript
"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Your App
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-gray-700">
                {user.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

---

### **Step 8: Add Navbar to Pages**

Add the Navbar component to your homepage or layout. For example in `app/page.tsx`:

```typescript
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Rest of your page content */}
    </>
  );
}
```

---

### **Step 9: Configure Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **URL Configuration**
3. Add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3001/auth/callback` (if using different port)
   - Add your production URL when deploying

4. Navigate to **Authentication** > **Providers**
5. Enable **Google** provider
6. Add your Google OAuth credentials (Client ID & Secret)

---

## ✅ Testing the Fix

### **Test 1: Google OAuth Login**
1. Go to `/login` page
2. Click "Continue with Google" button
3. Should redirect to Google login
4. After Google auth, should redirect to Supabase
5. Then redirect back to `/dashboard`
6. ✅ User email should show in navbar
7. ✅ Login/Signup buttons should be hidden
8. ✅ Logout button should appear

### **Test 2: Email/Password Login**
1. Go to `/login` page
2. Enter email and password
3. Click "Login with Email"
4. Should redirect to `/dashboard`
5. ✅ User email should show in navbar

### **Test 3: Authentication State Persistence**
1. Log in (Google or email)
2. Refresh the page
3. ✅ Should still be logged in
4. ✅ User details should persist
5. ✅ Navbar should show user email

### **Test 4: Logout**
1. Click "Logout" button
2. ✅ Should redirect to homepage
3. ✅ Login/Signup buttons should reappear
4. ✅ User email should disappear

---

## 🔍 Troubleshooting

### **Issue: "Module not found: @supabase/ssr"**
**Fix:** Run `npm install @supabase/ssr` in your project directory

### **Issue: Google OAuth redirects but doesn't log in**
**Fix:** 
1. Check Supabase redirect URLs include your callback URL
2. Verify Google OAuth credentials in Supabase dashboard
3. Check browser console for errors

### **Issue: User details don't show after login**
**Fix:**
1. Verify AuthProvider is wrapping your app in layout.tsx
2. Check that Navbar is using `useAuth()` hook
3. Open browser console and check for errors

### **Issue: "Redirect URL not allowed"**
**Fix:**
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add `http://localhost:3000/auth/callback` to redirect URLs
3. Save and try again

---

## 📋 Files Created/Modified

**New Files:**
- ✅ `lib/supabase/server.ts`
- ✅ `app/auth/callback/route.ts`
- ✅ `components/AuthProvider.tsx`
- ✅ `components/Navbar.tsx`

**Modified Files:**
- ✅ `app/login/page.tsx` (added OAuth button)
- ✅ `app/layout.tsx` (added AuthProvider)
- ✅ `app/page.tsx` (added Navbar)

---

## ✅ Success Checklist

- [ ] Installed `@supabase/ssr` package
- [ ] Created `lib/supabase/server.ts`
- [ ] Created `app/auth/callback/route.ts`
- [ ] Updated `app/login/page.tsx` with Google OAuth
- [ ] Created `components/AuthProvider.tsx`
- [ ] Updated `app/layout.tsx` with AuthProvider
- [ ] Created `components/Navbar.tsx`
- [ ] Added Navbar to pages
- [ ] Configured redirect URLs in Supabase
- [ ] Tested Google OAuth login
- [ ] Tested email/password login
- [ ] Verified user details show after login
- [ ] Verified logout works

---

**Once all steps are complete, your authentication should work perfectly!** 🎉
