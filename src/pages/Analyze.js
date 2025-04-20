import React, {useState, useContext} from 'react';
import axios from 'axios';
import { message, DatePicker, Select, Button} from 'antd';
import { Histogram } from '../components/chart';
import 'antd/dist/reset.css';
// import DatePicker from 'react-datepicker';
import { AuthContext } from '../components/auth';




const cors = {withCredential: true};

const { Option } = Select;

const DisplayPieChart = () => {
  const { token } = useContext(AuthContext);

  const header = {
    'Content-Type': 'application/json',
    'Authorization':  `Bearer ${token}`
  };

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [chargeunits, setChargeUnits] = useState([]);
  const [consumeunits, setConsumeUnits] = useState([]);
  const [selectedValue, setSelectedValue]  = useState( []);
//   const [loading, setLoading] = useState(false);

  const fetchUnits = async () => {
    console.log("startdate ", startDate.valueOf());
    console.log("endDate ", endDate.valueOf());
    console.log("freq", selectedValue);
    // setLoading(true);
    try {
      const response = await axios.post('http://localhost:8100/stats/aggregate',
        {
          start_date: Math.floor(startDate.valueOf() / 1000),
          end_date: Math.floor(endDate.valueOf() / 1000),
          freq: selectedValue
        },
        {
          headers: header
        },
        cors
      );
      console.log("response ", response.data.data);
      setChargeUnits(response.data.data.charge);
      setConsumeUnits(response.data.data.consume);
    } catch (error) {
      message.error('获取统计数据发生错误');
    } finally {
    //   setLoading(false);
    }
  };

  // const onChange = (date, dateString) => {
  //   setDate(date);
  //   console.log(dateString);
  // };
  const handleFreqChange = (value) => {
    setSelectedValue(value);
  };
  
  return (
    <div>
         <h2> 统计范围 </h2>
         <div style={{ display: 'flex', gap: '10px' }}>
           <DatePicker
             selected={startDate}
             onChange={(date) => setStartDate(date)}
             selectsStart
             startDate={startDate}
             endDate={endDate}
             dateFormat="yyyy/MM/dd"
           />
           <DatePicker
             selected={endDate}
             onChange={(date) => setEndDate(date)}
             selectsEnd
             startDate={startDate}
             endDate={endDate}
             minDate={startDate}
             dateFormat="yyyy/MM/dd"
           />
           <Select
            style={{ width: 200 }}
            placeholder="Select an option"
            onChange={handleFreqChange}
            value={selectedValue}
          >
            <Option value="day"></Option>
            <Option value="week"></Option>
          </Select>
          <Button type="primary" onClick={fetchUnits}>
            计算
         </Button>
         </div>

      <h2>  直方图 </h2>
      <h3> 充值 </h3>
        <Histogram
          data={chargeunits} />
      {/* <h3> Histogram Consume</h3> */}
      <h3> 消费 </h3>
        <Histogram
          data={consumeunits} />
    </div>
  );
};

export default DisplayPieChart;
