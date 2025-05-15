// src/pages/AgreementUnits.js
import React, { useState, useEffect } from 'react';
import { Input, Table, message, Button, Select, Card, Row, Col, Space, Typography } from 'antd';

import 'antd/dist/reset.css';
import FileUploader from '../components/upload';
// import { tr } from 'date-fns/locale';
// import axios from 'axios';
import axios from '../utils/axios';

const { Option } = Select;
const {Title} = Typography;

const styles = {
  container: {
    padding: '24px',
  },
  card: {
    marginBottom: '24px',
  },
  searchSection: {
    marginBottom: '20px',
  },
  tableSection: {
    marginTop: '20px',
  },
  uploadSection: {
    marginTop: '24px',
  }
};

const CoporateManager = () => {

  // pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [filteredInfoUnits, setFilteredInfoUnits] = useState([]);

  const [coporateName, setCoporateName]  = useState( []);
  const [selectedValue, setSelectedValue]  = useState( []);
  const [loading, setLoading] = useState(false);
  
  // flag for useEffect
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/coporate/list');

        if (response.data.status === 0) {
            console.log("response ", response.data.data);
            setUnits(response.data.data);
            setFilteredUnits(response.data.data)
        } else{
          message.error("协议单位数据为空");
        }
      } catch (error) {
        message.error('获取协议数据时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
    setUpdateSuccess(false);
    return () => {
      // setUnits([])
      console.log("Cleanup: Component will unmount");
    }
  }, [updateSuccess]);

  const handlePageChange = (pagination, filters, sorter) => {
    console.log("handlePageChange filters ", filters);
    console.log("handlePageChange sorter ", sorter);
 
    setPagination({
      ...pagination,
      total: pagination.total
    });
  };

  const handleChange = (value) => {
    const table = value === '协议单位' ? 'coporate' : 'coporate_info';
    setSelectedValue(table);
  };

  const handleSearch = async () => {
      const index = units.findIndex(unit =>
        // unit.name.toLowerCase().includes(coporateName));
        // unit.name.includes(coporateName));
        // unit.name.localeCompare(coporateName, 'zh-CN', { sensitivity: 'base' }) === 0);
        new RegExp(coporateName, 'i').test(unit.name));
      console.log("index ", index);
      if (index === -1) {
        message.error("协议单位数据为空");
      } else{
        setFilteredUnits([units[index]]);
        console.log("handleSearch ", units[index]);
  
        try {
          const response = await axios.get('/coporate/detail',
            {
              params: {
                name: units[index].name
              },
            },
          );
          if (response.data.data) {
            setFilteredInfoUnits(response.data.data)
            console.log("detail response ", response.data.data);
            // set pagination
            setPagination( prev => ({
              ...prev,
              total: response.data.data.length
            }));

          } else{
            message.error("协议单位价格数据为空");
          }
        } catch (error) {
          message.error('获取协议单位价格数据时发生错误');
        } finally {
          setLoading(false);
        } 
      }
    };

  // upload
  const onUpload = (data) => {
    console.log("upload success ", data);
    setUpdateSuccess(true)
  };

  const processInput = (value) => {
    // processed = processed.replace(/['"]/g, ''); // Remove quotes if you don't want them
    let processed = value.trim();
    return processed;
  };

  const coporate_columns = [
    {
      title: '单位名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
    },
  ];

  const info_columns = [
    {
      title: '单位名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '房型',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
  ];

  return (
      <div style={styles.container}>
        <Row gutter={[24, 24]}>
          {/* 协议单位列表 */}
          <Col span={24}>
            <Card 
              title={<Title level={5}>协议单位列表</Title>}
              style={styles.card}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space style={styles.searchSection}>
                  <Input 
                    placeholder="搜索协议单位"
                    onChange={(e) => setCoporateName(processInput(e.target.value))}
                    style={{ width: 300 }}
                  />
                  <Button type="primary" onClick={handleSearch}>查询</Button>
                </Space>
  
                <Table
                  columns={coporate_columns}
                  dataSource={filteredUnits}
                  loading={loading}
                  rowKey={(record) => record.name}
                  pagination={false}
                />
              </Space>
            </Card>
          </Col>

        {/* 折扣信息 */}
        <Col span={24}>
          <Card 
            title={<Title level={5}>折扣信息</Title>}
            style={styles.card}
          >
            <Table
              columns={info_columns}
              dataSource={filteredInfoUnits}
              loading={loading}
              rowKey={(record) => `${record.name}-${record.price}`}
              pagination={{ 
                pagesize: pagination.pageSize, 
                current: pagination.current,
                total: filteredInfoUnits.length || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                // pageSize must in pageSizeOptions and be all set 
                pageSizeOptions: ['5', '10', '20', '50'],
                onChange: handlePageChange,
              }}
            />
          </Card> 
        </Col>

        {/* 文件上传 */}
        <Col span={24}>
          <Card 
            title={<Title level={4}>文件上传</Title>}
            style={styles.card}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Select
                  style={{ width: 200 }}
                  placeholder="选择上传类型"
                  onChange={handleChange}
                  value={selectedValue}
                >
                  <Option value="协议单位">协议单位</Option>
                  <Option value="协议单位价格">协议单位价格</Option>
                </Select>
              </Space>

              <FileUploader
                // uploadUrl={uploadUrl}
                table={selectedValue}
                onUploadSuccess={onUpload}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CoporateManager;
