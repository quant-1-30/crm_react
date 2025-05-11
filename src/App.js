// src/App.js
import React  from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import { Layout} from "antd";

import Layout from "./pages/Layout";
import MembershipManager from "./pages/Membership";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import CoporateManager from "./pages/Coprate";
import DisplayPieChart from "./pages/Analyze";
import { ProtectedRoute, AuthProvider } from "./components/context";

// const { Header, Content } = Layout;

function App() {
  // 初始会员数据
  // const [members, setMembers] = useState([
  //   { id: 1, name: "Alice", email: "alice@example.com", status: "active" },
  //   { id: 2, name: "Bob", email: "bob@example.com", status: "inactive" },
  // ]);

  //return (
    //<Router>
      //<Layout>
        //<Header>
          //<Menu theme="dark" mode="horizontal" defaultSelectedKeys={["home"]}>
            //<Menu.Item key="home">
              //<Link to="/">会员系统</Link>
            //</Menu.Item>
          //</Menu>
        //</Header>
        //<Content style={{ padding: "20px" }}>
          //<Routes>
            //<Route
              //path="/"
              //element={<Home members={members} setMembers={setMembers} />}
            ///>
            //<Route
              //path="/member/:id"
              //element={<MemberDetail members={members} />}
            ///>
          //</Routes>
        //</Content>
      //</Layout>
    //</Router>
  //);

// return (
//   <div>
//     <LoginPage/>
//   </div>
// );

return (
<Router>
  <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membership" element={<MembershipManager />} />
          <Route path="/coporate" element={<CoporateManager />} />
          <Route path="/stats" element={<DisplayPieChart />} />
        </Route>
      </Routes>
  </AuthProvider>
</Router>
)

}


export default App;
