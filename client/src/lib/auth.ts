import { User } from "@shared/schema";

export interface AuthUser extends Omit<User, 'password'> {}

class AuthService {
  private currentUser: AuthUser | null = null;

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  setCurrentUser(user: AuthUser | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  async login(username: string, password: string): Promise<AuthUser> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const { user } = await response.json();
    this.setCurrentUser(user);
    return user;
  }

  async register(userData: any): Promise<AuthUser> {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const { user } = await response.json();
    this.setCurrentUser(user);
    return user;
  }

  logout() {
    this.setCurrentUser(null);
  }

  initialize() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }
}

export const authService = new AuthService();
