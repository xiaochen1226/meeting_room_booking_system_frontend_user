import { Link, Outlet } from "react-router-dom";
import { UserOutlined } from '@ant-design/icons';
import './index.css'

export function Index() {
    return <div id="index-container">
        <div className="header">
            <h1><Link to={"/"} >会议室预定系统</Link></h1>
            <Link to={'/update_info'}><UserOutlined className='icon' /></Link>
        </div>
        <div className="body">
            <Outlet></Outlet>
        </div>
    </div>
}