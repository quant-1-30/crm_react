// src/pages/WelcomePage.js
import React from 'react';
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleViewMembership = () => {
    navigate('/membership');
  };

  const handleViewCoprate = () => {
    navigate('/coporate');
  }

  const handleViewStat = () => {
    navigate('/stats');
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card
        style={{ width: 400, textAlign: 'center' }}
        title="欢迎来到丽怡会员系统"
      >
        <p> 在这里，可以查看会员，办理充值消费, 以及更多功能</p>
        <Button type="primary" onClick={handleViewMembership}>
          查看会员卡
        </Button>
        <p> 在这里, 可以管理协议单位, 以及更多功能</p>
        <Button type="default" onClick={handleViewCoprate}>
          查看协议单位
        </Button>
        <p> 在这里, 可以查看统计数据, 以及更多功能</p>
        < Button type="dashed" onClick={handleViewStat}>
          查看分析结果
        </Button>
      </Card>
    </div>
  );
};

export default DashboardPage;