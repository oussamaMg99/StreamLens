import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * ApiError - consistent error wrapper returned by ApiService.
 */
export class ApiError extends Error {
  public status?: number;
  /** The response body, if the server sent one. Its shape depends on the API: narrow before use. */
  public data?: unknown;
  /** The underlying error (an AxiosError, a cancellation…). */
  public original?: unknown;

  constructor(message: string, status?: number, data?: unknown, original?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.original = original;
  }
}

/** Query-string parameters; undefined values are left out of the URL by axios. */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/** A request config that remembers it has already been retried after a token refresh. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

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
  private readonly axios: AxiosInstance;
  private tokenProvider: ApiServiceConfig['tokenProvider'];
  private refreshTokenFn: ApiServiceConfig['refreshTokenFn'];

  constructor(private readonly config: ApiServiceConfig = {}) {
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
  // Interceptors get axios's resolved config (InternalAxiosRequestConfig), where `headers`
  // is always an AxiosHeaders instance — not the public AxiosRequestConfig, where it's optional.
  private async onRequest(cfg: InternalAxiosRequestConfig) {
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
        cfg.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // If token retrieval fails, request still proceeds.
    }

    return cfg;
  }

  private onRequestError(error: unknown) {
    return Promise.reject(error);
  }

  private onResponse(response: AxiosResponse) {
    return response;
  }

  private async onResponseError(error: unknown) {
    /**
     * If a 401 occurs and refreshTokenFn is provided, attempt once to refresh.
     */
    const originalRequest = axios.isAxiosError(error) ? (error.config as RetriableConfig | undefined) : undefined;

    if (axios.isAxiosError(error) && error.response?.status === 401 && this.refreshTokenFn && originalRequest && !originalRequest._retry) {
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
  public async apiRun<T = unknown>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: unknown,
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
      } catch (err: unknown) {
        attempt++;

        // Handle cancellation
        if (axios.isCancel(err)) {
          const cancelErr = new ApiError('Request cancelled', undefined, undefined, err);
          if (throwOnError) throw cancelErr;
          return Promise.reject(cancelErr);
        }

        // Only an AxiosError carries a response; anything else is treated as a network error.
        const response = axios.isAxiosError(err) ? err.response : undefined;
        const status = response?.status;
        const respData: unknown = response?.data;

        const isNetworkError = !response;
        const isServerError = status !== undefined && status >= 500 && status < 600;
        const shouldRetry = attempt <= retry && (isNetworkError || isServerError || status === 429);

        if (shouldRetry) {
          const delayMs = retryDelay * Math.pow(2, attempt - 1);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }

        const message = err instanceof Error ? err.message : 'API request failed';
        const apiErr = new ApiError(message, status, respData, err);

        if (throwOnError) throw apiErr;
        return Promise.reject(apiErr);
      }
    }
  }

  // --- Convenience helpers ---
  public apiGet<T = unknown>(url: string, opts?: ApiOptions & { params?: QueryParams }): Promise<T> {
    const { params, ...rest } = opts ?? {};
    const axiosConfig = params ? { params } : undefined;
    return this.apiRun<T>('get', url, undefined, { ...(rest as ApiOptions), axiosConfig });
  }

  public apiPost<T = unknown>(url: string, body?: unknown, opts?: ApiOptions): Promise<T> {
    return this.apiRun<T>('post', url, body, opts);
  }

  public apiPut<T = unknown>(url: string, body?: unknown, opts?: ApiOptions): Promise<T> {
    return this.apiRun<T>('put', url, body, opts);
  }

  public apiDelete<T = unknown>(url: string, opts?: ApiOptions & { params?: QueryParams }): Promise<T> {
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
