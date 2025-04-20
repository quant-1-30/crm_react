// src/pages/AgreementUnits.js
import React, { useState, useEffect, useContext } from 'react';
import { Input, Table, message, Button, Select } from 'antd';
import axios from 'axios';
import 'antd/dist/reset.css';
import FileUploader from '../components/upload';
import { AuthContext } from '../components/auth';

const { Option } = Select;

const CoporateManager = () => {

  const { token } = useContext(AuthContext);

  const header = {
    'Content-Type': 'application/json',
    'Authorization':  `Bearer ${token}`
  };

  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [filteredInfoUnits, setFilteredInfoUnits] = useState([]);

  const [coporateName, setCoporateName]  = useState( []);
  const [selectedValue, setSelectedValue]  = useState( []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8100/coporate/list'
        );
        console.log("response ", response.data.data);
        setUnits(response.data.data);
        setFilteredUnits(response.data.data)
      } catch (error) {
        message.error('获取协议单位数据时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
    return () => {
      // setUnits([])
      console.log("Cleanup: Component will unmount");
    }
  }, []);

  const handleChange = (value) => {
    setSelectedValue(value);
  };

  // input 
  const handleSearch = async () => {

      // const filteredData = units.filter(unit =>
      //   unit.name.toLowerCase().includes(coporateName) 
      // );
      // setFilteredUnits(filteredData);

      const index = units.findIndex(unit =>
        unit.name.toLowerCase().includes(coporateName));
      if (index === -1) {
        message.error("数据为空");
      } else{
        setFilteredUnits([units[index]]);
        console.log("handleSearch ", units[index]);
  
        try {
          const response = await axios.get('http://localhost:8100/coporate/detail',
            {
              params: {
                name: units[index].name
              },
            },
            {
              headers: header
            },
          );
          if (response.data.data) {
            setFilteredInfoUnits(response.data.data)
            console.log("detail response ", response.data.data);
          } else{
            message.error("数据为空");
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
    <div style={{ padding: '20px' }}>
      <h2>协议单位列表</h2>
      <Input 
        placeholder="搜索协议单位"
        // onMouseEnter={setUnits}
        onChange={(e) => setCoporateName(e.target.value)}
        style={ {marginBottom: 20, width: 300 }}
      />
      <Button type="primary" onClick={handleSearch}>查询</Button>
      <Table
        columns={coporate_columns}
        dataSource={filteredUnits}
        loading={loading}
        rowKey={(record) => record.name}
        pagination = {false}
        style={{ marginBottom: 20 }}
      />
    <h2>折扣信息</h2>
      {/* <Input 
        placeholder="搜索协议单位"
        // onMouseEnter={setUnits}
        onChange={(e) => setCoporateName(e.target.value)}
        style={ {marginBottom: 20, width: 300 }}
      />
      <Button type="primary" onClick={handleSearch}>查询</Button>  */}
      <Table
        columns={info_columns}
        dataSource={filteredInfoUnits}
        loading={loading}
        rowKey={(record) => `${record.name}-${record.price}`}
        pagination={ {pagesize: 10, current: 1}}
      />
      <h2>文件上传示例</h2>
      <Select
        style={{ width: 200 }}
        placeholder="Select an option"
        onChange={handleChange}
        value={selectedValue}
      >
        <Option value="coporate"></Option>
        <Option value="coporate_info"></Option>
      </Select>

      <FileUploader
        uploadUrl="http://localhost:8100/component/upload"
        table={selectedValue}
        onUploadSuccess={onUpload}
      />
    </div>
  );
};

export default CoporateManager;
