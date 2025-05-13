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
  // flag for useEffect
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // unified Modav
  const [modalType, setModalType] = useState(''); // 'register' 或 'update'
  const [isModalVisible, setIsModalVisible] = useState(false);

  // members 
  const [members, setMembers] = useState([]);
  const [memberInfo, setMemberInfo] = useState('');
  const [filterMemberInfo, setFilterMemberInfo] = useState([]);
  // chargeRecord
  const [chargeRecord, setChargeRecord] = useState([]);
  // consumeRecord
  const [consumeRecord, setConsumeRecord] = useState([]);
  // uploadRecords
  const [uploadRecords, setUploadRecords] = useState([]);

  // pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  // const token = localStorage.getItem('token')
  const { token} = useContext(AuthContext);
  const { api_url } = useContext(AuthContext);
  const membershipUrl = `${api_url}/membership`;
  
  const header = {
    'Content-Type': 'application/json',
    'Authorization':  `Bearer ${token}`
  };

  const cors = {withCredential: true};

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

  // set pagination
  const handlePageChange = (pagination, filters, sorter) => {
    console.log("handlePageChange filters ", filters);
    console.log("handlePageChange sorter ", sorter);
 
    // // 处理排序
    // let sortedData = [...chargeRecord]; // 创建数据副本
    // if (sorter.field && sorter.order) {
    //   sortedData.sort((a, b) => {
    //     const field = sorter.field;
    //     const order = sorter.order;
        
    //     if (order === 'ascend') {
    //       return a[field] > b[field] ? 1 : -1;
    //     } else {
    //       return a[field] < b[field] ? 1 : -1;
    //     }
    setPagination({
      ...pagination,
      total: pagination.total
    });
  };

  const fetchUnits = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${membershipUrl}/list`,
          {
            headers: header
          },
          cors
        );
        console.log("fetchUnits data ", response.data.data)
        setMembers(response.data.data);
        // set pagination
        setPagination( prev => ({
          ...prev,
          total: response.data.data.length
        }));
        
      } catch (error) {
        message.error(error);
        message.error('获取会员数据时发生错误');

        setMembers([]);
        setPagination( prev => ({
          ...prev,
          total: 0
        }));
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

     const resetForm = (form) => {
      if (form) {
        form.resetFields();
      }
    };  

  const checkMember = async () => {
    console.log("check memberInfo", memberInfo);
    if (!memberInfo || memberInfo.trim() === '') {
      message.error('请输入会员信息');
      return;
    }
    try {
      // 查询会员是否存在
      console.log("check members ", members);
      // some return bool / filter return new array
      const index = members.findIndex(member =>
           member.name.toLowerCase() === memberInfo.toLowerCase() || 
           member.phone.toString().toLowerCase() === memberInfo.toString().toLowerCase());
      console.log("check index ", index);
      if (index === -1) 
        {
          // reset registerForm
          resetForm(registerForm);

          // 如果会员不存在，显示注册对话框
          setModalType('register');
          setIsModalVisible(true);
        } else {
          // duration
          message.info('会员已存在', 1);
          setFilterMemberInfo([members[index]]);
      };
    } catch (error) {
      message.error(error);
      message.error('请求时发生错误，请稍后重试');
    }
  };

  const handleUpdateMember = async (record) => {

    if (!record) {
      message.error('请选择会员');
      return;
    }
    // record is current row / member_index change ,but record is not change
    console.log("需要更新的会员 record  ", record);

    // reset editForm
    resetForm(editForm);
    // set original data
    editForm.setFieldsValue({
      name: record.name,
      phone: record.phone,
      birth: record.birth,
    });
        
    setFilterMemberInfo([record]);
    // 如果会员存在，显示修改对话框
    setModalType('update');
    setIsModalVisible(true);
  };

  // unified Modal组件
  const renderModal = () => {
     const modalConfig =  {
      register: {
        title: '注册新会员',
        form: registerForm,
        formItms: [
          {
            label: "会员名称",
            name: "name",
            rules: [{ required: true, message: '请输入会员名称!' }],
          },
          {
            label: "电话号码",
            name: "phone",
            rules: [{ required: true, message: '请输入电话号码!' }],
          },
          {
            label: "会员生日",
            name: "birth",
            rules: [{ required: true, message: '请输入会员生日!' }],
          }
        ]
      },
      update: {
        title: '编辑会员信息',
        form: editForm,
        formItms: [
          {
            label: "会员名称",
            name: "name",
            rules: [{ required: true, message: '请输入会员名称!' }],
          },
          {
            label: "电话号码",
            name: "phone",
            rules: [{ required: true, message: '请输入电话号码!' }],
          },
          {
            label: "会员生日",
            name: "birth",
            rules: [{ required: true, message: '请输入会员生日!' }],
          }
        ]
      }
     }
     // 添加检查，确保 modalType 有效
     if (!modalType || !modalConfig[modalType]) {
         return null;
     }

     const config = modalConfig[modalType];
     return (
      <Modal
        title={config.title}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm(config.form);
        }}
        footer={null}
      >
        <Form 
          form={config.form} 
          onFinish={handleModalAction}
          onFinishFailed={onFinishFailed}
          // initialValues={config.initialValues}
        >
          {config.formItms.map((item) => (
            <Form.Item 
              label={item.label}
              name={item.name}
              rules={item.rules}
            >
              <Input />
            </Form.Item>
          ))}
          <Form.Item>
            {/* <Button type="primary" htmlType="submit" onClick={handleModalAction}> */}
            <Button type="primary" htmlType="submit">
              {modalType === 'register' ? '注册' : '保存'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
     );
    };

    const handleModalAction = async (values) => {
      console.log("handleModalAction values ", values);
      try {
        if (modalType === 'update') {
            setMemberInfo(values.phone);
            const createResponse = await axios.post(`${membershipUrl}/on_update`, 
            {
              member_id: filterMemberInfo[0].member_id,
              name: values.name,
              phone: values.phone,
              birth: values.birth,
            },
            {
              headers: header
            },
            cors
          );
            if (createResponse.status === 200 && createResponse.data.status === 0) {
              message.success('会员信息更新成功');
              const obj = await createResponse.data.data
              console.log("update MemberInfo", obj);
              setFilterMemberInfo([obj]);
              setUpdateSuccess(true);
            } else {
              message.error('会员创建失败, 请检查手机号是否已存在');
            }
        } 
        else if (modalType === 'register') {
            // const formData = registerForm.getFieldsValue();
            // console.log("registerForm ", formData);
            const createResponse = await axios.post(`${membershipUrl}/on_register`, 
            {
              name: values.name,
              phone: values.phone,
              birth: values.birth,
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
        }
        // reset form
        setIsModalVisible(false);
        if (modalType === 'update') {
          resetForm(registerForm);
        } else {
          resetForm(editForm);
        }
        // formref.current = null;
      } catch (error) {
        if (error.errorFields) {
          error.errorFields.forEach(field => {
            console.log(`字段 ${field.name[0]} 错误:`, field.errors);
          });
        }else{
          message.error("请求时发生错误，请稍后重试");
        }
      }
    };


    const handleConsume = async (values) => {

        // const formData = consumeForm.getFieldsValue();
        setLoading(true);
        console.log("formData ", values);
        if (values.charge < 0 || values.consume < 0 || values.discount < 0) {
          message.error('充值、消费和折扣金额不能为负');
          return;
        }
        message.success('表格提交成功 !');

        const index = members.findIndex(member =>
          parseInt(member.phone) === parseInt(values.phone));
        if (index === -1) {
          console.error("Member not found for the given phone number");
        }

        try {
            const consume_resp = await axios.post(`${membershipUrl}/on_consume`, 
                {
                  "member_id": members[index].member_id,
                  "charge": parseInt(values.charge),
                  "discount": parseInt(values.discount),
                  "consume": parseInt(values.consume),
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
            setLoading(false);
        }
    };

    const handleSearch = async () => {
      // debugger;

      try {
        const index = members.findIndex(member =>
             member.name.toLowerCase() === memberInfo.toLowerCase() || 
             member.phone.toString().toLowerCase() === memberInfo.toString().toLowerCase());
        console.log("handleSearch index ", index);
        if (index !== -1){
          
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
          // set pagination
          setPagination( prev => ({
            ...prev,
            total: charge_records.length
          }));

          // consume_detail
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
          // set pagination
          setPagination( prev => ({
            ...prev,
            total: consume_records.length
          }));
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
        // dataIndex: "action",
        key: "action",
        render: (_, record) => (
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
      key: "created_at",
    //   // small by front and large by backend
    //   sorter: (a, b) => {
    //     return new Date(a.created_at) - new Date(b.created_at);
    //   },
    //   sortDirections: ['descend', 'ascend'],
    // 
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

  // 渲染
  const items= [
    {
      key: "1",
      label: "支付管理",
      children: (
        <>
          <Input
            placeholder="输入会员名称或者手机号"
            value={memberInfo}
            onChange={(e) => setMemberInfo(e.target.value)}
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

          <div>
          {/* <label> 充值/消费 </label> */}
          {/* <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} ref={formref} onSubmit={handleSubmit} style={{ marginTop: '40px' }}> */}
          {/* <Form onFinish={onFinish} onFinishFailed={onFinishFailed} ref={consumeFormRef} style={{ marginTop: '40px' }}> */}
          {/* when Button is moved to Form and onFinish can be replaced  handleConsume */}
          <Form 
            form={consumeForm} 
            onFinish={handleConsume} 
            onFinishFailed={onFinishFailed} 
            style={{ marginTop: '40px' }}>
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
              rules={[
                { required: true, message: '请输入充值金额' },
                { validator: (rule, value, callback) => {
                  if (value < 0) {
                    callback('充值金额不能为负');
                  }
                  callback();
                }}
              ]}
              initialValue={0}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="折扣"
              name="discount"
              rules={[
                { required: true, message: '请输入折扣金额' },
                { validator: (rule, value, callback) => {
                  if (value < 0) {
                    callback('折扣金额不能为负');
                  }
                  callback();
                }}
              ]}
              initialValue={0}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="消费"
              name="consume"
              rules={[
                { required: true, message: '请输入消费金额' },
                { validator: (rule, value, callback) => {
                  if (value < 0) {
                    callback('消费金额不能为负');
                  }
                  // pass
                  callback();
                }}
              ]}
              initialValue={0}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              {/* when Button is moved to Form and onFinish can be replaced  handleConsume */}
              <Button type="primary" htmlType="submit">
                {/* Submit */}
                提交
              </Button>
            </Form.Item>
          </Form>
          {/* <Button type="primary" onClick={handleConsume}>
              生效
          </Button> */}
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
            placeholder='输入手机号码或者名字'
            onChange={(e) => setMemberInfo(e.target.value)}
            style={ { marginBottom: 20, width: 300} }
          />
          <Button type="primary" onClick={handleSearch}>查询记录</Button>
          <Table 
            columns={charge_record_columns}
            dataSource={chargeRecord}
            rowKey={(record) => record.created_at}
            loading={loading}
            pagination={ {
              pagesize: pagination.pageSize, 
              current: pagination.current,
              total: chargeRecord.length || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              // pageSize must in pageSizeOptions and be all set 
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: handlePageChange,
            }}
          />
          <Table 
            columns={consume_record_columns}
            dataSource={consumeRecord}
            rowKey={(record) => record.created_at}
            loading={loading}
            pagination={ {
              pagesize: pagination.pageSize, 
              current: pagination.current,
              total: consumeRecord.length || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: handlePageChange,
            }}
          />

        </>
      ),
    },
    {
      key: "3",
      label: "批量上传",
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
            pagination={ {
              pagesize: pagination.pageSize, 
              current: pagination.current,
              total: uploadRecords.length || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: handlePageChange,
            }}
          />
        </>

      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>会员管理</h2>
      <Tabs defaultActiveKey='1' items={items} />
      {renderModal()}
    </div>
  );
};

export default MembershipManager;
