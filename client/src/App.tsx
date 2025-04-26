import { Outlet } from 'react-router-dom';
import AppNavbar from './components/Navbar'; // 🔴 Import the Navbar

function App() {
  return (
    <>
      <AppNavbar /> {/* 🔴 Add the Navbar here */}
      <Outlet />
    </>
  );
}

export default App;
