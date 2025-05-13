import React, { useState, useContext, useRef, useEffect } from 'react';
import { Form, Input, Button, Checkbox, message, Tabs} from 'antd';
import { useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css';
import axios from 'axios';
import { AuthContext } from '../components/context';

const LoginPage = () => {

  // const { login } = useAuth();
  const { login } = useContext(AuthContext);
  const { api_url } = useContext(AuthContext);

  const smsUrl = `${api_url}/component`;
  const homeUrl = `${api_url}/home`;

  const [activeTab, setActiveTab] = useState('login');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [form] = Form.useForm()

  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  // set 60s / 1000 ms = 1s
  useEffect(() => {
    // 当 countdown 从 1 开始，启动定时器
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(sec => {
          if (sec <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    }
    // 清理
    return () => clearInterval(timerRef.current);
  }, [countdown]);

  const onFinish = async (values) => {
    console.log('Success:', values);
    // backend
    try {
        // const response = await axios.post("http://localhost:8100/home/on_login", {
        const response = await axios.post(`${homeUrl}/on_login`, {
            name: values.username,
            passwd: values.password,
        });
        // debugger;
        if (response.status === 200 && response.data.status === 0 ) {
            console.log('Login successful: ', response.data);
            // JSON.stringify / JSON.parse 

            // localStorage.setItem('token', response.data.data)
            login(response.data.data)

            console.log("token", response.data.data)
            message.success('登陆成功');
            navigate("/dashboard"); // redirect to home
        } else {
            // console.error('login failed', response.data);
            message.error('用户名或者密码错误');
        }
    } catch (error) {
        console.error("Error during login:", error)
        message.error("登陆发生错误, 请稍后重试")
    }

  };

  const onFinishFailed = (errorInfo) => {
    message.error("Please check username and passwd");
    console.log('Failed:', errorInfo);
  };

  const OnSendVerifyCode = async () => {
    const phone = form.getFieldValue('phone');
    console.log("phone ", phone);
    if (countdown > 0) return;                   // 安全防护：倒计时中不能再发
    setIsSendingCode(true);
    // debugger;
    try {
        // const response = await axios.post("http://localhost:8100/component/on_sms",
        const response = await axios.post(`${smsUrl}/on_sms`,
            {"phone": phone}
        );
        console.log("send sms ", response)
        if (response.status === 200) {
            message.success('验证码发送成功');
            setCountdown(60);                         // ← 点击成功后启动 60s 倒计时
        } else {
            message.error("验证码发生错误");
        }
    } catch (error) {
        message.error("验证码发生错误, 稍后重试");
    }finally {
        setIsSendingCode(false);
    }
  };


  const onRegister = async (values) => {
    try {
        // const response = await axios.post("http://localhost:8100/home/on_register",
        const response = await axios.post(`${homeUrl}/on_register`,
            {name: values.username,
             passwd: values.password,
             phone: values.phone,
             verify_code: values.verify_code
            }
        );
        if (response.status === 200 && response.data.status === 0) {
            message.success('注册成功, 请登陆');
            setActiveTab('login')

        } else {
            message.error('用户名或者密码错误');
        }
    } catch (error) {
        message.error("登陆服务发生错误");
    }
  };
  
  const onReset = async (values) => {
    try {
        // const response = await axios.post("http://localhost:8100/home/on_reset",
        const response = await axios.post(`${homeUrl}/on_reset`,
            {
             passwd: values.password,
             phone: values.phone,
             verify_code: values.verify_code
            }
        );
        if (response.status === 200 && response.data.status === 0) {
            message.success('重置成功, 请登陆');
            setActiveTab('login')

        } else {
            message.error('用户名错误');
        }
    } catch (error) {
        message.error("重置服务发生错误");
    }
  };

  const items = [
    {
      key: "login",
      label: "登陆",
      children: (
        <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>记住我</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form> 
      ),
    },
    {
      key: "register",
      label: "注册",
      children: (
        <Form
        form={form}
        name='register'
        onFinish={onRegister}
    >
      <Form.Item
        label="用户名"
        name="username"
        rules={[{ required: true, message: '请输入用户名!' }]}
    >
      <input />
    </Form.Item>

     <Form.Item
      label='密码'
      name='password'
      rules={[{required: true, message: '请输入密码'}]}
    >
        <Input.Password />
    </Form.Item>

    <Form.Item
     label='手机号码'
     name='phone'
     rules={[{required: true, message: '请输入手机号码'}]}
     >
        <Input />
     </Form.Item>

     <Form.Item
      label='验证码'
      name='verify_code'
      rules={[{required: true, message: '请输入验证码'}]}
    >
        <Input addonAfter={
            <Button
             type='link'
            //  onClick={() => OnSendVerifyCode(Form.getFieldValue('phone'))}
             onClick={() => OnSendVerifyCode()}
             disabled={isSendingCode || countdown > 0}  // 倒计时或发送中禁用
             >
               {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
        </Button>
        }/>
    </Form.Item>

    <Form.Item>
        <Button type='primary' htmlType='submit'>
            注册
        </Button>
    </Form.Item>   
    </Form> 
      ),
    },
    {
      key: "reset",
      label: "重置",
      children: (
        <Form
        form={form}
        name='reset'
        onFinish={onReset}
    >

    <Form.Item
     label='手机号码'
     name='phone'
     rules={[{required: true, message: '请输入手机号码'}]}
     >
        <Input />
     </Form.Item>

     <Form.Item
      label='验证码'
      name='verify_code'
      rules={[{required: true, message: '请输入验证码'}]}
    >
        <Input addonAfter={
            <Button
             type='link'
             onClick={() => OnSendVerifyCode()}
             disabled={isSendingCode || countdown > 0}  // 倒计时或发送中禁用
             >
               {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
        </Button>
        }/>
    </Form.Item>
     
     <Form.Item
      label='重置密码'
      name='password'
      rules={[{required: true, message: '请输入密码'}]}
    >
        <Input.Password />
    </Form.Item>

    <Form.Item>
        <Button type='primary' htmlType='submit'>
            重置
        </Button>
    </Form.Item>   
    </Form> 
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '300px', margin: '100px auto' }}>
      <h2>丽怡会员管理平台</h2>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </div>
  );
};

export default LoginPage;
