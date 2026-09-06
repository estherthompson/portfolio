import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import MusicNav from '../MusicNav';
import './index.scss';

const Layout = () => {
    const location = useLocation();
    
    // You can choose different color schemes for different pages
    // For example: Home and About use brown, Portfolio and Contact use cream
    const getColorScheme = () => {
        if (location.pathname === '/' || location.pathname === '/about') {
            return 'brown';
        } else {
            return 'cream';
        }
    };

    return (
    <div className='App'>
        <Navbar />
        <div className='page'>
            {/* <span className='tags top-tags'>&lt;body&gt;</span> */}
            <Outlet /> 
        </div>
        <MusicNav colorScheme={getColorScheme()} />
    </div>
    )
}
export default Layout