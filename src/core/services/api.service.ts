import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * ApiError - consistent error wrapper returned by ApiService.
 */
export class ApiError extends Error {
  public status?: number;
  public data?: any;
  public original?: any;

  constructor(message: string, status?: number, data?: any, original?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.original = original;
  }
}

/**
 * Request options passed to ApiService methods
 */
export type ApiOptions = {
  /** Optional AbortSignal for cancellation */
  signal?: AbortSignal;

  /** Per-call header override (merged with defaults & Authorization header) */
  headers?: Record<string, string>;

  /** Per-call axios config override (merged deeply) */
  axiosConfig?: AxiosRequestConfig;

  /** Number of retry attempts on network/server errors (default: 0) */
  retry?: number;

  /** Base delay in ms for retry exponential backoff (default: 300ms) */
  retryDelay?: number;

  /** Whether to throw ApiError (default: true) */
  throwOnError?: boolean;
};

/**
 * ApiServiceConfig - provided to constructor
 *
 * NOTE:
 *  - For TMDB v3 with Bearer authentication, provide:
 *      tokenProvider: () => import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN
 *  - No api_key or defaultParams are required.
 */
export type ApiServiceConfig = {
  baseURL?: string;

  /** Default static headers (Authorization header is injected dynamically) */
  defaultHeaders?: Record<string, string>;

  /**
   * Default query params merged into all requests.
   *
   * For TMDB v3 + Bearer auth this should be `{}`.
   * api_key is NOT used when Authorization header is used.
   */
  defaultParams?: Record<string, string | number>;

  /**
   * Optional function returning a Bearer token or null.
   *
   * When present, ApiService automatically injects:
   *    Authorization: Bearer <token>
   * into every request.
   */
  tokenProvider?: () => string | null | Promise<string | null>;

  /**
   * Optional callback used when a 401 is received.
   * ApiService will retry the request once after refresh.
   */
  refreshTokenFn?: () => Promise<void>;

  /** Default timeout in ms */
  timeout?: number;
};

/**
 * ApiService - central axios wrapper.
 *
 * - Automatically injects Bearer token from tokenProvider()
 * - Has interceptors for unified error handling
 * - Provides apiGet(), apiPost(), apiPut(), apiDelete()
 * - apiRun() handles retries & cancellation logic
 *
 * Example:
 *   const api = new ApiService({
 *     baseURL: 'https://api.themoviedb.org/3',
 *     tokenProvider: () => import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN
 *   });
 *
 *   const movies = await api.apiGet<MovieListResponse>('/movie/popular');
 */
export class ApiService {
  private axios: AxiosInstance;
  private tokenProvider?: ApiServiceConfig['tokenProvider'];
  private refreshTokenFn?: ApiServiceConfig['refreshTokenFn'];

  constructor(private config: ApiServiceConfig = {}) {
    this.axios = axios.create({
      baseURL: config.baseURL ?? '',
      headers: {
        'Content-Type': 'application/json',
        ...(config.defaultHeaders ?? {}),
      },
      params: config.defaultParams ?? {},
      timeout: config.timeout ?? 15_000,
    });

    this.tokenProvider = config.tokenProvider;
    this.refreshTokenFn = config.refreshTokenFn;

    // attach interceptors
    this.axios.interceptors.request.use(this.onRequest.bind(this), this.onRequestError.bind(this));
    this.axios.interceptors.response.use(this.onResponse.bind(this), this.onResponseError.bind(this));
  }

  // --- Interceptor handlers ---
  private async onRequest(cfg: AxiosRequestConfig) {
    /**
     * Inject TMDB Bearer token automatically
     *
     * tokenProvider should return ONLY the raw token:
     *   e.g. "eyJhbGciOiJIUzI1NiJ9..."
     *
     * ApiService turns it into:
     *   Authorization: Bearer <token>
     */
    try {
      const token = this.tokenProvider ? await this.tokenProvider() : null;
      if (token) {
        cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
      }
    } catch {
      // If token retrieval fails, request still proceeds.
    }

    return cfg;
  }

  private onRequestError(error: any) {
    return Promise.reject(error);
  }

  private onResponse(response: AxiosResponse) {
    return response;
  }

  private async onResponseError(error: any) {
    /**
     * If a 401 occurs and refreshTokenFn is provided, attempt once to refresh.
     */
    const originalRequest = error?.config;

    if (error?.response?.status === 401 && this.refreshTokenFn && !originalRequest?._retry) {
      try {
        originalRequest._retry = true;
        await this.refreshTokenFn();
        return this.axios(originalRequest);
      } catch {
        // If refresh fails, fall through
      }
    }

    return Promise.reject(error);
  }

  // --- Centralized runner ---
  public async apiRun<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    opts: ApiOptions = {},
  ): Promise<T> {
    const { signal, headers = {}, axiosConfig = {}, retry = 0, retryDelay = 300, throwOnError = true } = opts;

    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        ...(axiosConfig.headers ?? {}),
        ...headers,
      },
      data,
      signal,
      ...axiosConfig,
    };

    let attempt = 0;

    while (true) {
      try {
        const response = await this.axios.request<T>(config);
        return response.data as T;
      } catch (err: any) {
        attempt++;

        // Handle cancellation
        if (axios.isCancel && axios.isCancel(err)) {
          const cancelErr = new ApiError('Request cancelled', undefined, undefined, err);
          if (throwOnError) throw cancelErr;
          return Promise.reject(cancelErr);
        }

        const status = err?.response?.status;
        const respData = err?.response?.data;

        const isNetworkError = !err?.response;
        const shouldRetry = attempt <= retry && (isNetworkError || (status >= 500 && status < 600) || status === 429);

        if (shouldRetry) {
          const delayMs = retryDelay * Math.pow(2, attempt - 1);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }

        const message = err?.message ?? 'API request failed';
        const apiErr = new ApiError(message, status, respData, err);

        if (throwOnError) throw apiErr;
        return Promise.reject(apiErr);
      }
    }
  }

  // --- Convenience helpers ---
  public apiGet<T = any>(url: string, opts?: ApiOptions & { params?: Record<string, any> }): Promise<T> {
    const { params, ...rest } = opts ?? {};
    const axiosConfig = params ? { params } : undefined;
    return this.apiRun<T>('get', url, undefined, { ...(rest as ApiOptions), axiosConfig });
  }

  public apiPost<T = any>(url: string, body?: any, opts?: ApiOptions): Promise<T> {
    return this.apiRun<T>('post', url, body, opts);
  }

  public apiPut<T = any>(url: string, body?: any, opts?: ApiOptions): Promise<T> {
    return this.apiRun<T>('put', url, body, opts);
  }

  public apiDelete<T = any>(url: string, opts?: ApiOptions & { params?: Record<string, any> }): Promise<T> {
    const { params, ...rest } = opts ?? {};
    const axiosConfig = params ? { params } : undefined;
    return this.apiRun<T>('delete', url, undefined, { ...(rest as ApiOptions), axiosConfig });
  }

  // --- Runtime config ---
  public setTokenProvider(fn?: ApiServiceConfig['tokenProvider']) {
    this.tokenProvider = fn;
  }

  public setRefreshTokenFn(fn?: ApiServiceConfig['refreshTokenFn']) {
    this.refreshTokenFn = fn;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axios;
  }
}

/**
 * Example TMDB v3 client using Bearer (v4 Read Access Token)
 *
 * - Bearer token is visible in network requests (client-side)
 * - No api_key is used
 * - All TMDB v3 endpoints accept Bearer token
 */
export const tmdbApi = new ApiService({
  baseURL: 'https://api.themoviedb.org/3',
  defaultParams: {}, // Not used for TMDB v3 + Bearer authentication
  timeout: 15_000,
});
