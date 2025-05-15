import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8100',  // 你的后端 API 地址

  timeout: 5000,

  //withCredentials: true  // 允许跨域请求携带凭证
  withCredentials: JSON.parse(process.env.REACT_APP_WITH_CREDENTIALS || 'false'), // 允许跨域请求携带凭证
  
  // 添加请求头
  headers: {
    'Content-Type': 'application/json',
  }
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
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 403 无权限
          console.error('403 无权限');
        //   window.location.href = '/403';
          break;
        case 404:
          // 404 未找到
          console.error('404 未找到');
        //   window.location.href = '/404';
          break;
        default:
          console.error('请求错误');
      }
    } else if (error.request) {
      // 请求没有响应
      console.error('请求没有响应');
    } else {
      // 其他错误
      console.error('其他错误, 配置错误');
    }
    return Promise.reject(error);
  }
);

export default instance;
