// src/pages/WelcomePage.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, DatePicker, message} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  ShoppingCartOutlined,
} from '@ant-design/icons';
// import axios from 'axios';
import axios from '../utils/axios';


const Dashboard = () => {

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCompanies: 0,
    totalCharges: 0,
    totalBalance: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState(null);
  
  // pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  // set pagination
  const handlePageChange = (pagination, filters, sorter) => {
    console.log("handlePageChange filters ", filters);
    console.log("handlePageChange sorter ", sorter);
 
    setPagination({
      ...pagination,
      total: pagination.total
    });
  };


  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    // dateRange 没选择, 默认为空
    try {
      setLoading(true);
      // 获取统计数据
      const statsResponse = await axios.get('/dashboard/snapshot', 
    );
      // debugger;
      if (statsResponse.data.status === 0) {
          console.log("statsResponse.data", statsResponse.data.data);
          setStats(statsResponse.data.data);
      } else {
        message.error('获取快照数据失败');
      }

      // 获取最近活动
      const activitiesResponse = await axios.get('/dashboard/activity', 
        {
          params: {
            startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
            endDate: dateRange?.[1]?.format('YYYY-MM-DD')
          },
        });
      if (activitiesResponse.data.status === 0) {
        setRecentActivities(activitiesResponse.data.data);
        // set pagination
        setPagination( prev => ({
          ...prev,
          total: activitiesResponse.data.data.length
        }));
      } else {
        message.error('获取最近活动失败');
      }
    } catch (error) {
      console.error('获取仪表盘接口失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const activityColumns = [
    {
      title: '会员',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '充值',
      dataIndex: 'charge',
      key: 'charge',
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  return (
    <div>
      {/* [horizontal, vertical] */}
      <Row gutter={[16, 16]}>
        {/* 会员总数 */}
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="会员总数"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
              // suffix={
              //   <span style={{ fontSize: '14px', color: stats.memberGrowth >= 0 ? '#3f8600' : '#cf1322' }}>
              //     {stats.memberGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              //     {Math.abs(stats.memberGrowth)}%
              //   </span>
              // }
            />
          </Card>
        </Col>

        {/* 协议总数 */}
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="协议总数"
              value={stats.totalCompanies}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        {/* 总收入 */}
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="总收入"
              value={stats.totalCharges}
              prefix={<DollarOutlined />}
              suffix="元"
              precision={2}
            />
          </Card>
        </Col>

        {/* 总消费次数 */}
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="总余额"
              value={stats.totalBalance}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <div style={{ marginBottom: 16, marginTop: 16 }}>
        <RangePicker 
          onChange={setDateRange}
          style={{ width: 300 }}
        />
      </div>
      <Card 
        title="最近充值" 
        style={{ marginTop: 16 }}
        loading={loading}
      >
        <Table 
          columns={activityColumns}
          dataSource={recentActivities}
          rowKey="id"
          // pagination={false}
          pagination={ {
            pagesize: pagination.pageSize, 
            current: pagination.current,
            total: recentActivities.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            onChange: handlePageChange,
            }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;