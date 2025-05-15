import React, {useState} from 'react';
import { message, DatePicker, Select, Button, Typography, Row, Col, Card, Space} from 'antd';
import { Histogram } from '../components/chart';
import 'antd/dist/reset.css';
import { CalendarOutlined, BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
// import axios from 'axios';
import axios from '../utils/axios';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const styles = {
  container: {
    padding: '24px',
  },
  card: {
    marginBottom: '24px',
  },
  filterSection: {
    marginBottom: '24px',
    padding: '16px',
    background: '#fafafa',
    borderRadius: '8px',
  },
  chartSection: {
    marginTop: '24px',
  },
  chartCard: {
    height: '100%',
  }
};


const DisplayChart = () => {

  const [dateRange, setDateRange] = useState([]);

  const [selectedValue, setSelectedValue]  = useState( []);
  const [chargeunits, setChargeUnits] = useState([]);
  const [consumeunits, setConsumeUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnits = async () => {

    if (!dateRange[0] || !dateRange[1]) {
      message.error('请选择日期范围');
      return;
    }   
    
    setLoading(true);
    try {
      const response = await axios.post('/analyzer/stats',
        {
          // start_date: Math.floor(dateRange[0].valueOf() / 1000), // timestamp
          startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
          endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
          frequency: selectedValue
        },
      );
      if (response.data.status === 0) {
          console.log("response ", response.data.data);
          setChargeUnits(response.data.data.charge);
          setConsumeUnits(response.data.data.consume);
      } else {
        message.error('获取统计数据发生错误');
      }
    } catch (error) {
      message.error('统计接口发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleFreqChange = (value) => {
    setSelectedValue(value);
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <Title level={4}>统计分析</Title>
        
        {/* 筛选条件区域 */}
        <div style={styles.filterSection}>
          <Space size="large">
            <Space>
              <CalendarOutlined />
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY/MM/DD"
                allowClear={false}
              />
            </Space>

            <Space>
              <BarChartOutlined />
              <Select
                style={{ width: 120 }}
                placeholder="选择统计周期"
                onChange={handleFreqChange}
                value={selectedValue}
              >
                <Option value="day">按天</Option>
                <Option value="week">按周</Option>
              </Select>
            </Space>

            <Button 
              type="primary" 
              onClick={fetchUnits}
              loading={loading}
              icon={<ReloadOutlined />}
            >
              计算
            </Button>
          </Space>
        </div>

        {/* 图表区域 */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title="充值分析" 
              style={styles.chartCard}
              loading={loading}
            >
              <Histogram 
                data={chargeunits} 
                xField="name" 
                yField="value" 
                namekey="充值" 
              />
            </Card>
          </Col>
          
          <Col span={24}>
            <Card 
              title="消费分析" 
              style={styles.chartCard}
              loading={loading}
            >
              <Histogram 
                data={consumeunits} 
                xField="name" 
                yField="value" 
                namekey="消费" 
              />

            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
export default DisplayChart;
