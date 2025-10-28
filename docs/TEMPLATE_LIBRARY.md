# 📚 Template Library for Common Patterns

## Purpose
This library provides the agent with reusable, tested templates for common application patterns, reducing errors and speeding up development.

---

## 🎯 Template Categories

### **1. Authentication Templates**
### **2. Database CRUD Templates**
### **3. Admin Panel Templates**
### **4. E-commerce Templates**
### **5. Dashboard Templates**
### **6. Form Templates**
### **7. UI Component Templates**

---

## 🔐 1. Authentication Templates

### **Template 1.1: Basic Login Page**

**Files Required:**
- `lib/supabase/client.ts`
- `app/login/page.tsx`

**Estimated Creation Time:** 2 minutes

**File Structure:**
```typescript
// lib/supabase/client.ts
"use client";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// app/login/page.tsx
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
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Dependencies:**
- Supabase client
- UI components (Button, Input)

---

### **Template 1.2: Basic Signup Page**

**Files Required:**
- `lib/supabase/client.ts` (reuse from 1.1)
- `app/signup/page.tsx`

**Estimated Creation Time:** 2 minutes

**File Structure:**
```typescript
// app/signup/page.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

### **Template 1.3: OAuth Login (Google/GitHub)**

**Files Required:**
- `lib/supabase/client.ts` (reuse from 1.1)
- `lib/supabase/server.ts` (new - for server-side auth)
- `app/login/page.tsx` (enhanced with OAuth)
- `app/auth/callback/route.ts` (new - OAuth callback)

**Estimated Creation Time:** 5 minutes

**File Structure:**

```typescript
// lib/supabase/server.ts (NEW - Server-side client)
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

// app/login/page.tsx (ENHANCED with OAuth)
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
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setError(error.message);
    }
  };

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleGoogleLogin} 
            className="w-full" 
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <Button 
            onClick={handleGitHubLogin} 
            className="w-full" 
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
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
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Login with Email
          </Button>
        </form>
      </div>
    </div>
  );
}

// app/auth/callback/route.ts (NEW - OAuth callback handler)
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

**Dependencies:**
- `@supabase/ssr` package (for server-side auth)
- Supabase OAuth provider configured in dashboard
- Redirect URLs configured in Supabase

**Setup Required:**
1. Enable OAuth provider in Supabase Dashboard
2. Add redirect URL: `http://localhost:3000/auth/callback`
3. Install: `npm install @supabase/ssr`

---

### **Template 1.4: Authentication State Management**

**Purpose:** Show/hide UI elements based on login state

**Pattern:**
```typescript
// components/Navbar.tsx or app/layout.tsx
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Logo
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-gray-700">Welcome, {user.email}</span>
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

**Key Features:**
- Checks authentication state on mount
- Listens for auth changes (login/logout)
- Shows user email when logged in
- Conditionally renders login/logout buttons
- Cleans up listener on unmount

---

## 💾 2. Database CRUD Templates

### **Template 2.1: Fetch Data (READ)**

**Pattern:**
```typescript
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DataListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    
    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Items</h1>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 border rounded">
            {/* Render item details */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### **Template 2.2: Create Data (CREATE)**

**Pattern:**
```typescript
"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateItemPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('table_name')
      .insert([formData]);
    
    if (!error) {
      alert('Item created successfully!');
      setFormData({ name: '', description: '' });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}
```

---

### **Template 2.3: Update Data (UPDATE)**

**Pattern:**
```typescript
const handleUpdate = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('table_name')
    .update(updates)
    .eq('id', id);
  
  if (!error) {
    alert('Updated successfully!');
    fetchItems(); // Refresh data
  }
};
```

---

### **Template 2.4: Delete Data (DELETE)**

**Pattern:**
```typescript
const handleDelete = async (id: string) => {
  const confirmed = confirm('Are you sure?');
  if (!confirmed) return;
  
  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id);
  
  if (!error) {
    alert('Deleted successfully!');
    fetchItems(); // Refresh data
  }
};
```

---

## 👑 3. Admin Panel Templates

### **Template 3.1: Admin Dashboard**

**Files Required:**
- `lib/types.ts`
- `app/admin/page.tsx`
- `components/admin/StatCard.tsx`

**File Structure:**
```typescript
// lib/types.ts
export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
}

// components/admin/StatCard.tsx
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </div>
  );
}

// app/admin/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import StatCard from '@/components/admin/StatCard';
import { Users, ShoppingCart, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Fetch statistics from database
    const { data: users } = await supabase.from('users').select('*', { count: 'exact' });
    const { data: orders } = await supabase.from('orders').select('*', { count: 'exact' });
    
    setStats({
      totalUsers: users?.length || 0,
      totalOrders: orders?.length || 0,
      totalRevenue: 0, // Calculate from orders
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart />} />
        <StatCard title="Revenue" value={`$${stats.totalRevenue}`} icon={<DollarSign />} />
      </div>
    </div>
  );
}
```

---

## 🛒 4. E-commerce Templates

### **Template 4.1: Product Card Component**

```typescript
// components/ProductCard.tsx
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  onAddToCart: (id: string) => void;
}

export default function ProductCard({ id, name, price, onAddToCart }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <div className="aspect-square bg-gray-200 rounded mb-4"></div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-gray-600 mt-2">${price.toFixed(2)}</p>
      <Button 
        onClick={() => onAddToCart(id)} 
        className="w-full mt-4"
      >
        Add to Cart
      </Button>
    </div>
  );
}
```

---

### **Template 4.2: Shopping Cart**

```typescript
// app/cart/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="text-right">
            <p className="text-2xl font-bold">Total: ${total.toFixed(2)}</p>
            <Button className="mt-4">Proceed to Checkout</Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 5. Dashboard Templates

### **Template 5.1: User Dashboard**

```typescript
// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="text-red-500">
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}</h2>
        <p className="text-gray-600">Your dashboard content here</p>
      </div>
    </div>
  );
}
```

---

## 📝 6. Form Templates

### **Template 6.1: Contact Form**

```typescript
// app/contact/page.tsx
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (e.g., save to database)
    console.log('Form data:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      {submitted && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
          Thank you! We'll get back to you soon.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Textarea
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          required
        />
        <Button type="submit" className="w-full">
          Send Message
        </Button>
      </form>
    </div>
  );
}
```

---

## 🎨 7. UI Component Templates

### **Template 7.1: Navigation Bar**

```typescript
// components/Navbar.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Logo
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-blue-500">
            Home
          </Link>
          <Link href="/products" className="hover:text-blue-500">
            Products
          </Link>
          <Link href="/about" className="hover:text-blue-500">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-500">
            Contact
          </Link>
          <Button>Login</Button>
        </div>
      </div>
    </nav>
  );
}
```

---

## 📦 Template Usage Guide

### **How to Use These Templates:**

1. **Identify the Pattern:**
   - Does the user need authentication? → Use Template 1.1 & 1.2
   - Does the user need CRUD? → Use Template 2.1-2.4
   - Does the user need admin panel? → Use Template 3.1
   - Does the user need e-commerce? → Use Template 4.1 & 4.2

2. **Customize for User's Needs:**
   - Replace `table_name` with actual table name
   - Update types/interfaces for specific data
   - Adjust styling to match requirements
   - Add additional fields as needed

3. **Follow Dependency Order:**
   - Create lib files first (types, Supabase client)
   - Create components next
   - Create pages last

4. **Test Each Template:**
   - Verify authentication works
   - Test CRUD operations
   - Check routing
   - Validate UI renders correctly

---

## 🎯 Template Selection Matrix

| User Request | Templates to Use | Files Needed | Complexity |
|-------------|------------------|--------------|-----------|
| "Add login" | 1.1, 1.2 | 3 files | Low |
| "CRUD for products" | 2.1-2.4 | 4-5 files | Medium |
| "Admin dashboard" | 3.1, 2.1 | 6-8 files | High |
| "E-commerce site" | 1.1, 1.2, 4.1, 4.2, 2.1-2.4 | 15+ files | Very High |
| "User dashboard" | 1.1, 5.1 | 3-4 files | Medium |
| "Contact form" | 6.1, 2.2 | 2-3 files | Low |

---

## ✅ Benefits of Template Library

**For the Agent:**
- Faster code generation
- Tested, working patterns
- Reduced errors
- Consistent quality

**For the User:**
- Reliable functionality
- Best practices built-in
- Faster development
- Production-ready code

---

**Use these templates to quickly generate common patterns with confidence!**
