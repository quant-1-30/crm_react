// src/pages/MembershipManager.js
import React, { useState, useEffect, useContext} from 'react';
import { Input, Button, message, Modal, Form, Tabs, Table} from 'antd';
import axios from 'axios';
import 'antd/dist/reset.css';
import FileUploader from '../components/upload';
import { AuthContext } from '../components/context';


const MembershipManager = () => {
  // 表单
  // const formref = useRef(null);
  const [registerForm] = Form.useForm();
  const [consumeForm] = Form.useForm();
  const [editForm] = Form.useForm();
  // // ref
  // const registerFormRef = useRef(null);
  // const consumeFormRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // unified Modavl
  const [modalType, setModalType] = useState(''); // 'register' 或 'update'


  const [members, setMembers] = useState([]);
  const [filterMemberInfo, setFilterMemberInfo] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState();

  const [chargeRecord, setChargeRecord] = useState();
  const [consumeRecord, setConsumeRecord] = useState(0);
  
  const [uploadRecords, setUploadRecords] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
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


  const onFinish = async (values) => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      // console.log("current", formref.current);
      // if (!formref.current) {
      //    formref.current.submit();
      // }
      message.success('表格提交成功 !');
      // formref.current=null;
    } catch (error) {
      message.error(error);
    } finally {
      setLoading(false);
    }
  };

  //  onsubmit and onFinish conflict   
  // const handleSubmit = (e) => {
  //     e.preventDefault(); // Prevent the default form submission behavior
  //     console.log('Form data submitted:', form.getFieldsValue());
  //     // Handle form submission, e.g., send data to an API
  //   };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    // if (! formref.current) {
    //     formref.current.submit();
    // }
    console.log('验证失败信息:', errorInfo);
    console.log('失败字段:', errorInfo.errorFields);
    // 显示具体错误信息
    errorInfo.errorFields.forEach(field => {
      console.log(`字段 ${field.name[0]} 错误:`, field.errors);
    });
    // message.error('Please check the form fields and try again.');
  };

  const fetchUnits = async () => {
      setLoading(true);
      try {
        // const response = await axios.get('http://localhost:8100/membership/list',
        const response = await axios.get(`${membershipUrl}/list`,
          {
            headers: header
          },
          cors
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

    useEffect(() => {

      fetchUnits();
      setUpdateSuccess(false); // Reset after fetching
      return () => {
        console.log("Cleanup: Component will unmount");
       //  setLoading(false);
      }
     }, [updateSuccess]);

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

          setFilterMemberInfo([members[index]]);
          console.log("fileredData ", members[index]);
      };
    } catch (error) {
      message.error(error);
      message.error('请求时发生错误，请稍后重试');
    }
  };

  const handleRegister = async () => {

    console.log("token ", token);
    console.log("form.getFieldsValue() ", registerForm.getFieldsValue());
    try {
      const createResponse = await axios.post(`${membershipUrl}/on_register`, 
      {
        name: registerForm.getFieldsValue().member_name,
        phone: registerForm.getFieldsValue().phone,
        birth: registerForm.getFieldsValue().birth,
      },
      {
        headers: header
      },
      cors
    );
      if (createResponse.status === 200 && createResponse.data.status === 0) {
        message.success('会员创建成功');
        const obj = await createResponse.data.data
        console.log("register MemberInfo", obj);
        // ...members means copy
        setMembers([...members, obj]);
        console.log("members", members);
        setFilterMemberInfo([obj]);
        setUpdateSuccess(true);
      } else {
        message.error('会员创建失败, 请检查手机号是否已存在');
      }
    } catch (error) {
      message.error('注册时发生错误，请稍后重试');
    } finally {
      setIsModalVisible(false);
      registerForm.resetFields();
      // formref.current = null;
    }
  };

  const handleUpdateMember = async () => {

    console.log("memberName", memberName);
    if (!memberName || memberName.trim() === '') {
      message.error('请输入会员名称');
      return;
    }
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
        message.info('会员不存在, 请切换到消费/充值管理 的会员查询');
      } else {
        // 如果会员存在，显示修改对话框
        setIsModalVisible(true);
        console.log("updateData ", members[index]);
        try {
          const response = await axios.post(`${membershipUrl}/on_update`, 
            {
              member_id: members[index].member_id,
              name: editForm.getFieldsValue().name,
              phone: editForm.getFieldsValue().phone,
              birth: editForm.getFieldsValue().birth,
            },
            {
              headers: header
            },
            cors
          );
  
          if (response.status === 200 && response.data.status === 0) {
            message.success('会员信息更新成功');
            setUpdateSuccess(true);
            // setIsEditModalVisible(false);
            editForm.resetFields();
          } else {
            message.error('会员信息更新失败');
          }
        } catch (error) {
          message.error('更新时发生错误，请稍后重试');
        }
    };

  };

  const handleModalAction = async () => {
    try {
      if (modalType === 'update') {
        await handleUpdateMember();
      } else {
        await handleRegister();
      }
    } catch (error) {
      message.error(error);
    }
  }

  const handleConsume = async () => {

    console.log("members ", members);
    console.log("form phone", consumeForm.getFieldsValue().phone);

    const index = members.findIndex(member =>
      parseInt(member.phone) === parseInt(consumeForm.getFieldsValue().phone));
    if (index === -1) {
      console.error("Member not found for the given phone number");
    }
    // console.log("hanleTransaction index ", index);
    if (consumeForm.getFieldsValue().charge < 0 && consumeForm.getFieldsValue().consume < 0) {
      message.error("充值和消费金额不能同时为负");
    }

    try {
        // const consume_resp = await axios.post("http://localhost:8100/membership/on_consume",
        const consume_resp = await axios.post(`${membershipUrl}/on_consume`, 
            {
              "member_id": members[index].member_id,
              "charge": parseInt(consumeForm.getFieldsValue().charge),
              "discount": parseInt(consumeForm.getFieldsValue().discount),
              "consume": parseInt(consumeForm.getFieldsValue().consume),
              // "balance": balance
            },
          {
            headers: header
          },
          cors
          );
  
        if (consume_resp.status === 200 && consume_resp.data.status === 0) {
          message.success('操作成功');
          setUpdateSuccess(true);
        }else{
          message.error('余额不足 ', consume_resp.data.data);
        }

    } catch (error) {
          message.error(error);
    }finally{
      consumeForm.resetFields();
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
      // setUpdateSuccess(true);
      setUploadRecords(data);
     };

    // 会员信息表格
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
      {
        title: "编辑",
        dataIndex: "action",
        key: "action",
        render: (text, record) => (
          <Button type="primary" onClick={() => handleUpdateMember(record)}>
            修改
          </Button>
        )
      }
    ]; 
  
  // 充值记录表格
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

  // 消费记录表格
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

  // 文件上传表格
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

  // 会员信息修改
  const member_update_columns = [
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

  // 渲染
  const items= [
    {
      key: "1",
      label: "消费/充值管理",
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
            {/* <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} ref={formref} onSubmit={handleSubmit}> */}
            {/* <Form form={registerForm} onFinish={onFinish} onFinishFailed={onFinishFailed} ref={registerFormRef}> */}
            <Form form={registerForm} onFinish={onFinish} onFinishFailed={onFinishFailed}>
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
                  {/* Submit */}
                  提交
                </Button>
              </Form.Item>
            </Form>
            <Button type="primary" onClick={handleRegister} style={{ display: 'block', marginBottom: '10px' }}>
                注册
            </Button>
          </Modal>



          <div>
          {/* <label> 充值/消费 </label> */}
          {/* <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} ref={formref} onSubmit={handleSubmit} style={{ marginTop: '40px' }}> */}
          {/* <Form onFinish={onFinish} onFinishFailed={onFinishFailed} ref={consumeFormRef} style={{ marginTop: '40px' }}> */}
          <Form form={consumeForm} onFinish={onFinish} onFinishFailed={onFinishFailed} style={{ marginTop: '40px' }}>
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
                {/* Submit */}
                提交
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
      label: "交易记录",
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
      label: "会员信息修改",
      children: (
        <>
          <Input
            placeholder="输入会员名称或者手机号"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            style={{ width: 200, marginRight: 10 }}
          />
          <Button type="primary" onClick={handleUpdateMember}>修改会员信息</Button>
          <Table 
            columns={member_update_columns}
            dataSource={members}
            rowKey={(record) => record.name}
            loading={loading}
            pagination={ {pagesize: 10, current: 1}}
          />
          <Modal
              title="修改会员信息"
              open={isModalVisible}
              onCancel={() => {
                setIsModalVisible(false);
                editForm.resetFields();
              }}
              footer={null}
            >
              <Form
                form={editForm}
                // onFinish={handleUpdateMember}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
              >
                <Form.Item
                  label="会员名称"
                  name="name"
                  rules={[{ required: true, message: '请输入会员名称!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="会员手机"
                  name="phone"
                  rules={[{ required: true, message: '请输入会员手机!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="会员生日"
                  name="birth"
                  rules={[{ required: true, message: '请输入会员生日!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" onClick={handleUpdateMember}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
        </>
      ),
    },
    {
      key: "4",
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
