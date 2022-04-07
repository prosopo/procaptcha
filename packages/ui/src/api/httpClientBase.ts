import axios, { AxiosInstance, AxiosResponse } from "axios";

class HttpClientBase {
  protected readonly instance: AxiosInstance;

  constructor(baseURL: string, prefix = "/v1/prosopo") {
    baseURL = baseURL + prefix;
    this.instance = axios.create({
      baseURL
    });

    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  };

  private _handleResponse = ({ data }: AxiosResponse) => data;

  protected _handleError = (error: any) => Promise.reject(error.response);
}

export default HttpClientBase;
