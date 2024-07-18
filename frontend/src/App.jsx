import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignupPage'; 
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuth } from './context/AuthContext';

function App() {
const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar />}
    <Routes>
      <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
      <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
      <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
      <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
    </Routes>

      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
