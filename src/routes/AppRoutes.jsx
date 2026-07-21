import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import PrivateRoute from '../components/Layout/PrivateRoute';
import PublicRoute from '../components/Layout/PublicRoute';

// Import Pages
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Employees from '../pages/Employees/Employees';
import Projects from '../pages/Projects/Projects';
import Timesheets from '../pages/Timesheets/Timesheets';
import Attendance from '../pages/Attendance/Attendance';
import Leave from '../pages/Leave/Leave';
import Tasks from '../pages/Tasks/Tasks';
import Calendar from '../pages/Calendar/Calendar';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';
import Profile from '../pages/Profile/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Private (Protected) Routes */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/employees" 
        element={
          <PrivateRoute>
            <Layout><Employees /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <PrivateRoute>
            <Layout><Projects /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/timesheets" 
        element={
          <PrivateRoute>
            <Layout><Timesheets /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/attendance" 
        element={
          <PrivateRoute>
            <Layout><Attendance /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/leave" 
        element={
          <PrivateRoute>
            <Layout><Leave /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <PrivateRoute>
            <Layout><Tasks /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <PrivateRoute>
            <Layout><Calendar /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <PrivateRoute>
            <Layout><Reports /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PrivateRoute>
            <Layout><Settings /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Layout><Profile /></Layout>
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}
