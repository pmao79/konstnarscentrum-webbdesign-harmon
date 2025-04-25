
import { useState } from 'react';

// Mock user data (in a real app, this would come from your auth provider)
interface User {
  id: string;
  name: string;
  image?: string;
  email: string;
}

export function useAuth() {
  // In a real application, this would fetch the authenticated user
  // from your authentication provider (e.g., Supabase, Auth0, etc.)
  const [user] = useState<User | null>({
    id: '1',
    name: 'Admin User',
    image: undefined,
    email: 'admin@example.com',
  });

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    // In a real app, you would implement these functions:
    // login: () => {},
    // logout: () => {},
    // signup: () => {},
  };
}
