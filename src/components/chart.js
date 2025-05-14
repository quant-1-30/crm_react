import React from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']


export const PiePlot = ( {data, datakey}) => {
   
  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={150}
        fill="#8884d8"
        dataKey={datakey}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

// export const Histogram = ({data, namekey}) => {
//     return (
//         <BarChart
//         width={600}
//         height={300}
//         data={data}
//         margin={{
//           top: 20, right: 30, left: 20, bottom: 5,
//         }}
//       >
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         <Bar dataKey={namekey} fill="#8884d8" />
//       </BarChart>
//     );
// };

// export default DisplayPieChart;


export const Histogram = ({ data, namekey }) => {
  
  const formatData = data.map(item => {
    const date = Object.keys(item)[0];
    return {
      date: date,
      value: item[date],
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formatData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          label={{ value: '日期', position: 'bottom' }}
        />
        <YAxis 
          label={{ value: '金额', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => [`${value} 元`, namekey]}
          labelFormatter={(label) => `日期: ${label}`}
        />
        <Legend />
        <Bar 
          dataKey="value" 
          name={namekey}
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
          label={{ 
            position: 'top',  // 修改这里：'middle' 改为 'top'
            fill: '#666',
            fontSize: 12
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};