export class ApiClient {
  private static baseURL = '/api';
  private static isRefreshing = false;
  private static refreshSubscribers: ((token: string) => void)[] = [];

  private static subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private static onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  public static async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Set headers
    const headers = new Headers(options.headers || {});
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const mergedOptions = { ...options, headers };

    try {
      const response = await fetch(url, mergedOptions);
      
      // If 401, attempt refresh token rotation
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        return this.handleTokenRefresh(endpoint, options);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  private static async handleTokenRefresh(endpoint: string, options: RequestInit): Promise<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.clearSession();
      throw new Error('Session expired');
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh failed');
        }

        const data = await refreshResponse.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        this.isRefreshing = false;
        this.onRefreshed(data.accessToken);
      } catch (err) {
        this.isRefreshing = false;
        this.clearSession();
        throw new Error('Session expired');
      }
    }

    // Queue requests while refreshing
    return new Promise((resolve, reject) => {
      this.subscribeTokenRefresh(async (token: string) => {
        try {
          const headers = new Headers(options.headers || {});
          headers.set('Authorization', `Bearer ${token}`);
          if (!(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
          }
          const res = await fetch(`${this.baseURL}${endpoint}`, { ...options, headers });
          const data = await res.json();
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private static clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-session-expired'));
  }
}
