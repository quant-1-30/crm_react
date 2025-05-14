import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8100',  // 你的后端 API 地址
  timeout: 5000,
  //withCredentials: true  // 允许跨域请求携带凭证
  withCredentials: JSON.parse(process.env.REACT_APP_WITH_CREDENTIALS || 'false')  // 允许跨域请求携带凭证
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 处理 401 未授权错误
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
