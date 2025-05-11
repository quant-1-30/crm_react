// src/pages/MembershipManager.js
import React, { useState, useEffect, useRef, useContext} from 'react';
import { Input, Button, message, Modal, Form, Tabs, Table} from 'antd';
import axios from 'axios';
import 'antd/dist/reset.css';
import FileUploader from '../components/upload';
import { AuthContext } from '../components/context';


const MembershipManager = () => {
  const formref = useRef(null);
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState( {});

  const [members, setMembers] = useState([]);
  const [filterMemberInfo, setFilterMemberInfo] = useState([]);
  const [memberName, setMemberName] = useState('');
  // const [memberBalance, setMemberBalance] = useState(0);
  const [memberPhone, setMemberPhone] = useState();
  const [chargeRecord, setChargeRecord] = useState();
  const [consumeRecord, setConsumeRecord] = useState(0);
  
  const [uploadRecords, setUploadRecords] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // const token = localStorage.getItem('token')
  const { token} = useContext(AuthContext);
  const { api_url } = useContext(AuthContext);
  const membershipUrl = `${api_url}/membership`;
  
  const header = {
    'Content-Type': 'application/json',
    'Authorization':  `Bearer ${token}`
  };

  const cors = {withCredential: true};

  const onFinish = (values) => {
    console.log(' onFinish Form values:', values);
    console.log("current", formref.current);
    if (!formref.current) {
       formref.current.submit();
    }
    setFormValues(values);
    message.success('Form submitted successfully!');
    // You can handle form submission here, such as sending data to an API
    //formref.current=null;
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    if (! formref.current) {
        formref.current.submit();
    }
    // message.error('Please check the form fields and try again.');
  };

  const fetchUnits = async () => {
      setLoading(true);
      try {
        // const response = await axios.get('http://localhost:8100/membership/list',
        const response = await axios.get(`${membershipUrl}/list`,
          // {
          //   headers: header
          // },
          // cors
        );
        console.log("fetchUnits data ", response.data.data)
        setMembers(response.data.data);
        // setFilteredMember(response.data.data);
      } catch (error) {
        message.error(error);
        message.error('获取会员数据时发生错误');
      } finally {
        setLoading(false);
      }
    };

  const handleSubmit = (e) => {
      e.preventDefault(); // Prevent the default form submission behavior
      console.log('Form data submitted:', formValues);
      // Handle form submission, e.g., send data to an API
    };

  const fetchMemberBalance = async (memberId) => {
    try {
          const balance_resp = await axios.get(`${membershipUrl}/on_balance`, 
            {
              params: {
                "member_id": memberId,
              },
            },
            {
              headers: header
            },
          cors
          );
          console.log("balance", balance_resp.data.data);
          if (balance_resp.status !== 200) {
            message.error('查询余额失败');
            }
          return balance_resp.data.data;
    } catch (error) {
      message.error(error);
      message.error('查询余额时发生错误');
    }
  };
  
  const checkMember = async () => {
    console.log("memberName", memberName);
    if (!memberName || memberName.trim() === '') {
      message.error('请输入会员名称');
      return;
    }
    try {
      // 查询会员是否存在
      console.log("members ", members);
      // some return bool / filter return new array
      const index = members.findIndex(member =>
           member.name.toLowerCase() === memberName.toLowerCase() || 
           member.phone.toString().toLowerCase() === memberName.toString().toLowerCase());
      console.log("index ", index);
      if (index === -1) 
        {
          // 如果会员不存在，显示注册对话框
          setIsModalVisible(true);
        } else {
          message.info('会员已存在');

          const balance = await fetchMemberBalance(members[index].member_id);
          const filteredData = { ...members[index], "balance": balance};
          setFilterMemberInfo([filteredData]);
          console.log("fileredData ", [filteredData]);
      };
    } catch (error) {
      message.error(error);
      message.error('请求时发生错误，请稍后重试');
    }
  };

  const handleRegister = async () => {

    // if (!formref.current) {
    //   formref.current.submit();
    // };

    console.log("token ", token);
    setMemberName(formValues.member_name);
    console.log("handleRegister formValues", formValues);
    console.log("member_name ", memberName);
    try {
      // 创建新会员
      // const createResponse = await axios.post('http://localhost:8100/membership/on_register', 
      const createResponse = await axios.post(`${membershipUrl}/on_register`, 
      {
        //name: memberName,
        name: formValues.member_name,
        phone: formValues.phone,
        birth: formValues.birth,
      },
      {
        headers: header
      },
      cors
    );
      if (createResponse.status === 200) {
        message.success('会员创建成功');
        // ...members means copy
        const obj = await createResponse.data.data
        // console.log("response ", obj[0]);
        // setMembers([...members, obj[0]]);
        setMembers([...members, obj]);
        // setUnits([...units, obj[0]]);
        console.log("members", members);
        const filteredData = {...obj, "balance": 0};
        setFilterMemberInfo([filteredData]);
        console.log("register MemberInfo", filteredData);
        setUpdateSuccess(true);
      } else {
        message.error('会员创建失败');
      }
    } catch (error) {
      message.error('注册时发生错误，请稍后重试');
    } finally {
      setIsModalVisible(false);
      form.resetFields();
      // formref.current = null;
    }
  };

  const handleConsume = async () => {

    console.log("members ", members);
    console.log("form phone", formValues.phone);

    const index = members.findIndex(member =>
      parseInt(member.phone) === parseInt(formValues.phone));
    if (index === -1) {
      console.error("Member not found for the given phone number");
    }
    console.log("hanleTransaction index ", index);
    if (formValues.charge < 0 && formValues.consume < 0) {
      message.error("充值和消费金额不能同时为负");
    }

    const balance = await fetchMemberBalance(members[index].member_id);
    const newBalance = balance + parseInt(formValues.charge) - parseInt(formValues.consume)

    try {
      // if (parseInt(formValues.consume) > (balance + parseInt(formValues.charge))) {
      if (newBalance < 0) {
          message.error("消费金额余额不足");        
      } else {
        // const consume_resp = await axios.post("http://localhost:8100/membership/on_consume",
        const consume_resp = await axios.post(`${membershipUrl}/on_consume`, 
            {
              "member_id": members[index].member_id,
              "charge": parseInt(formValues.charge),
              "discount": parseInt(formValues.discount),
              "consume": parseInt(formValues.consume),
              "balance": newBalance
            },
          {
            headers: header
          },
          cors
          );
  
        if (consume_resp.status === 200) {
          message.success('操作成功');
            }else{
            message.error('操作失败');
            }
        }

    } catch (error) {
          message.error(error);
    }
    };

    const handleSearch = async () => {
      // debugger;

      try {
        const index = members.findIndex(member =>
          parseInt(member.phone) === parseInt(memberPhone));
        console.log("ConsumeSearch index ", index);
        if (index !== -1){
          
          // const charge_resp = await axios.get('http://localhost:8100/membership/charge_detail',
          const charge_resp = await axios.get(`${membershipUrl}/charge_detail`,
            { 
              params: {
                member_id: members[index].member_id
              }
            },
            {
              headers: header
            },
            cors
          );
          const charge_records = charge_resp.data.data;
          setChargeRecord(charge_records);

          // const consume_resp = await axios.get('http://localhost:8100/membership/consume_detail',
          const consume_resp = await axios.get(`${membershipUrl}/consume_detail`,
            { 
              params: {
                member_id: members[index].member_id
              },
            }, 
            {
              headers: header
            },
            cors
          );
          const consume_records = consume_resp.data.data;
          setConsumeRecord(consume_records);
        }
      } catch (error) {
        message.error(error);
        message.error('获取消费数据时发生错误');
      } finally {
        setLoading(false);
      }
    };
  
    const onUpload = (data) => {
    console.log("upload success ", data);
    setUpdateSuccess(true);
    setUploadRecords(data);
  };

    const member_columns = [
      {
        title: "会员名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "会员手机",
        dataIndex: "phone",
        key: "phone"
      },
      {
        title: "会员生日",
        dataIndex: "birth",
        key: "birth"
      },
      {
        title: "会员余额",
        dataIndex: "balance",
        key: "balance"
      },
    ]; 
  
  const charge_record_columns = [
    {
      title: "会员名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "充值记录",
      dataIndex: "charge",
      key: "charge"
    },
    {
      title: "折扣记录",
      dataIndex: "discount",
      key: "discount"
    },
    {
      title: "时间",
      dataIndex: "created_at",
      key: "created_at"
    },
    {
      title: "操作员",
      dataIndex: "operator",
      key: "operator"
    },
  ];

  const consume_record_columns = [
    {
      title: "会员名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "消费记录",
      dataIndex: "consume",
      key: "consume"
    },
    {
      title: "时间",
      dataIndex: "created_at",
      key: "created_at"
    },
    {
      title: "操作员",
      dataIndex: "operator",
      key: "operator"
    }
  ];

  const upload_columns = [
    {
      title: "会员名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "会员手机",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "会员生日",
      dataIndex: "birth",
      key: "birth"
    },
  ]; 

  useEffect(() => {
   fetchUnits();
   setUpdateSuccess(false); // Reset after fetching

   return () => {
     console.log("Cleanup: Component will unmount");
   }
  }, [updateSuccess]);

  const items= [
    {
      key: "1",
      label: "会员信息",
      children: (
        <>
          <Input
            placeholder="输入会员名称或者手机号"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            style={{ width: 200, marginRight: 10 }}
          />
          <Button type="primary" onClick={checkMember}>查询会员</Button>
          <Table 
            columns={member_columns}
            dataSource={filterMemberInfo}
            rowKey={(record) => record.name}
            // loading={loading}
            // pagination={ {pagesize: 10, current: 1}}
            pagination = {false}
            // key={(record) => record.member_id}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          />
          <Modal
            title="注册新会员"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} ref={formref} onSubmit={handleSubmit}>
              <Form.Item
                label="会员名称"
                name="member_name"
                rules={[{ required: true, message: '请输入会员名称!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="电话号码"
                name="phone"
                rules={[{ required: true, message: '请输入电话号码!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="生日"
                name="birth"
                rules={[{ required: true, message: '请输入会员生日!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
            <Button type="primary" onClick={handleRegister} style={{ display: 'block', marginBottom: '10px' }}>
                注册
            </Button>
          </Modal>

          <div>
          {/* <label> 充值/消费 </label> */}
          <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} ref={formref} onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
            <Form.Item
              label="手机号码"
              name="phone"
              rules={[{ required: true, message: '请输入会员手机号码!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="充值"
              name="charge"
              rules={[{ required: true, message: '请输入充值金额' }]}
              initialValue={0}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="折扣"
              name="discount"
              rules={[{ required: true, message: '请输入折扣金额' }]}
              initialValue={0}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="消费"
              name="consume"
              rules={[{ required: true, message: '请输入消费金额' }]}
              initialValue={0}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Button type="primary" onClick={handleConsume}>
              生效
          </Button>
        </div>
        </>
      ),
    },
    {
      key: "2",
      label: "交易流水",
      children: (
        <>
          <Input
            placeholder='输入手机号码'
            onChange={(e) => setMemberPhone(e.target.value)}
            style={ { marginBottom: 20, width: 300} }
          />
          <Button type="primary" onClick={handleSearch}>查询记录</Button>
          <Table 
            columns={charge_record_columns}
            dataSource={chargeRecord}
            rowKey={(record) => record.created_at}
            loading={loading}
            pagination={ {pagesize: 10, current: 1}}
          />
          {/* <Input
            placeholder='输入手机号码'
            onChange={(e) => setMemberPhone(e.target.value)}
            style={ { marginBottom: 20, width: 300} }
          />
          <Button type="primary" onClick={handleConsumeSearch}>消费记录</Button> */}
          <Table 
            columns={consume_record_columns}
            dataSource={consumeRecord}
            rowKey={(record) => record.created_at}
            loading={loading}
            pagination={ {pagesize: 10, current: 1}}
          />

        </>
      ),
    },
    {
      key: "3",
      label: "文件上传",
      children: (
        <>
          <FileUploader
            uploadUrl="http://localhost:8100/component/upload"
            table="membership"
            onUploadSuccess={onUpload}
          />
          <Table 
            columns={upload_columns}
            dataSource={uploadRecords}
            rowKey={(record) => record.phone}
            loading={loading}
            pagination={ {pagesize: 10, current: 1}}
          />
        </>

      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>会员管理</h2>
      <Tabs defaultActiveKey='1' items={items} />
    </div>
  );
};

export default MembershipManager;
