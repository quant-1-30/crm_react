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
        title="欢迎来到会员卡系统"
      >
        <p>在这里，您可以管理您的会员卡，查看会员信息，以及更多功能。</p>
        <Button type="primary" onClick={handleViewMembership}>
          查看会员卡
        </Button>
        <p> 在这里, 你可以管理协议单位, 查看协议价格, 以及更多功能</p>
        <Button type="default" onClick={handleViewCoprate}>
          查看协议单位
        </Button>
        <p> 在这里， 查看统计数据， 以及更多功能</p>
        < Button type="dashed" onClick={handleViewStat}>
          查看分析结果
        </Button>
      </Card>
    </div>
  );
};

export default DashboardPage;