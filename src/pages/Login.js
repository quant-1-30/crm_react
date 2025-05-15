import React, { useState, useContext, useRef, useEffect, useLocation} from 'react';
import { Form, Input, Button, Checkbox, message, Tabs, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css';
import { AuthContext } from '../components/context';
// import axios from 'axios';
import axios from '../utils/axios';

const { Title } = Typography;

const LoginPage = () => {

  const navigate = useNavigate();
  const location = useLocation();

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
        const response = await axios.post(`${homeUrl}/on_login`, 
        {
            name: values.username,
            passwd: values.password,
        });
        // debugger;
        if (response.data.status === 0 ) {
            console.log('Login successful: ', response.data);
            // JSON.stringify / JSON.parse 
            login(response.data.data)
            message.success('登陆成功');
            // ?. 安全防护 null 或 undefined 属性 避免通过if判断
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from); // redirect to home
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

  // 添加样式对象
  const styles = {
    // 页面容器样式
    container: {                                       // 弹性布局
      display: 'flex',                                 // 弹性布局
      justifyContent: 'center',                        // 水平居中
      alignItems: 'center',                            // 垂直居中
      minHeight: '100vh',                              // 最小高度
      background: '#f0f2f5',                          // 背景颜色
    },
    // 卡片样式
    card: {
      width: '100%',                                    // 宽度
      maxWidth: '400px',                               // 最大宽度
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',        // 阴影
      borderRadius: '8px',                              // 圆角
    },
    // 标题样式
    header: {
      textAlign: 'center',                              // 文本居中
      marginBottom: '24px',                            // 下边距
    },
    // 表单样式
    form: {
      maxWidth: '300px',                                // 最大宽度
      margin: '0 auto',                                 // 自动居中
    },
    // 表单项样式
    formItem: {
      marginBottom: '24px',                             // 下边距
    },
    // 按钮样式
    button: {
      width: '100%',                                    // 宽度
      height: '40px',                                   // 高度
      fontSize: '16px',                                 // 字体大小
    },
    // 标签页样式
    tabs: {
      width: '100%',                                    // 宽度
    },
    // 输入框样式
    input: {
      height: '40px',                                   // 高度
    },
    // 验证码样式
    verifyCode: {
      display: 'flex',                                  // 弹性布局
      gap: '8px',                                      // 间距
    },
    // 验证码输入框样式
    verifyCodeInput: {
      flex: 1,                                         // 弹性布局
    },
    // 验证码按钮样式
    verifyCodeButton: {
      width: '120px',                                   // 宽度
    },
  };

  const items = [
    {
      key: "login",
      label: "登录",
      children: (
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          style={styles.form}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
            style={styles.formItem}
          >
            <Input 
              placeholder="用户名" 
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
            style={styles.formItem}
          >
            <Input.Password 
              placeholder="密码" 
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={styles.formItem}>
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={styles.button}>
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
          style={styles.form}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
            style={styles.formItem}
          >
            <Input 
              placeholder="用户名" 
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            style={styles.formItem}
          >
            <Input.Password 
              placeholder="密码" 
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: '请输入手机号码' }]}
            style={styles.formItem}
          >
            <Input 
              placeholder="手机号码" 
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="verify_code"
            rules={[{ required: true, message: '请输入验证码' }]}
            style={styles.formItem}
          >
            <div style={styles.verifyCode}>
              <Input 
                placeholder="验证码" 
                size="large"
                style={styles.verifyCodeInput}
              />
              <Button
                type="primary"
                onClick={OnSendVerifyCode}
                disabled={isSendingCode || countdown > 0}
                style={styles.verifyCodeButton}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={styles.button}>
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "reset",
      label: "重置密码",
      children: (
        <Form
          form={form}
          name='reset'
          onFinish={onReset}
          style={styles.form}
        >
          <Form.Item
            name="phone"
            rules={[{ required: true, message: '请输入手机号码' }]}
            style={styles.formItem}
          >
            <Input 
              placeholder="手机号码" 
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="verify_code"
            rules={[{ required: true, message: '请输入验证码' }]}
            style={styles.formItem}
          >
            <div style={styles.verifyCode}>
              <Input 
                placeholder="验证码" 
                size="large"
                style={styles.verifyCodeInput}
              />
              <Button
                type="primary"
                onClick={OnSendVerifyCode}
                disabled={isSendingCode || countdown > 0}
                style={styles.verifyCodeButton}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            style={styles.formItem}
          >
            <Input.Password 
              placeholder="新密码" 
              size="large"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={styles.button}>
              重置密码
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <div style={styles.header}>
          <Title level={2}>丽怡会员管理平台</Title>
        </div>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items} 
          style={styles.tabs}
          size="large"
        />
      </Card>
    </div>
  );
};

export default LoginPage;
