import React from 'react';
import ReactDOM from 'react-dom/client';
// 如果 App.tsx 或 App.jsx 文件不存在，需要创建该文件
// 或者检查文件路径是否正确（可能是相对路径问题）
// 临时解决方案：使用 require 或添加文件扩展名
import App from './App.tsx'; // 或 './App.jsx' 根据实际文件类型
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
