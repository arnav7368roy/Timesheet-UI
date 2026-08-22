const API_BASE = 'https://timesheet-2-e5cr.onrender.com/api/v1';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, success = false) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(success);
    }
  });
  failedQueue = [];
};

export async function apiRequest(endpoint, method = 'GET', body = null, isRetry = false) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      result = {};
    }

    const isLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login');
    const isAuthExemptEndpoint = endpoint === '/auth/refresh' || endpoint === '/auth/login';

    // Handle 401 Unauthorized (Expired Access Token) only when logged in on app pages
    if (response.status === 401 && !isRetry && !isLoginPage && !isAuthExemptEndpoint) {
      if (isRefreshing) {
        // Queue the request until refreshing completes
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return await apiRequest(endpoint, method, body, true);
        } catch (queueErr) {
          return {
            ok: false,
            status: 401,
            data: result,
          };
        }
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        let refreshData = {};
        try {
          refreshData = await refreshRes.json();
        } catch (e) {
          refreshData = {};
        }

        if (refreshRes.ok && refreshData.status) {
          processQueue(null, true);
          isRefreshing = false;
          // Retry the original request
          return await apiRequest(endpoint, method, body, true);
        } else {
          processQueue(new Error('Token refresh failed'), false);
          isRefreshing = false;
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return {
            ok: false,
            status: 401,
            data: result,
          };
        }
      } catch (refreshErr) {
        processQueue(refreshErr, false);
        isRefreshing = false;
        return {
          ok: false,
          status: 401,
          data: result,
        };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data: result,
    };
  } catch (error) {
    console.error('API connection error:', error);
    return {
      ok: false,
      status: 500,
      data: { message: 'Server connection failed.' },
    };
  }
}
