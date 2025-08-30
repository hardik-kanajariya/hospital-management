import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import LoginRedirect from '../components/auth/LoginRedirect';
import LandingPage from '../components/landing/LandingPage';
import Dashboard from '../components/hospital/Dashboard';
import PatientManagement from '../components/hospital/PatientManagement';
import AppointmentScheduling from '../components/hospital/AppointmentScheduling';
import MedicalRecords from '../components/hospital/MedicalRecords';
import EnhancedBillingSystem from '../components/hospital/EnhancedBillingSystem';
import InventoryManagement from '../components/hospital/InventoryManagement';
import DoctorSchedule from '../components/hospital/DoctorSchedule';
import LabManagement from '../components/hospital/LabManagement';
import BedManagement from '../components/hospital/BedManagement';
import NotificationCenter from '../components/hospital/NotificationCenter';
import SuperAdminDashboard from '../components/hospital/SuperAdminDashboard';
import RoleManagement from '../components/hospital/RoleManagement';
import SuperAdminUserManagement from '../components/hospital/SuperAdminUserManagement';
import RoleBasedAccess from '../components/auth/RoleBasedAccess';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Navigate to="/landing" replace />
            },
            {
                path: 'landing',
                element: <LandingPage />
            },
            {
                path: 'login',
                element: <LoginRedirect />
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'patients',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="patients">
                            <PatientManagement />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'appointments',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="appointments">
                            <AppointmentScheduling />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'records',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="medical_records">
                            <MedicalRecords />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'doctors',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="doctors">
                            <DoctorSchedule />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'lab',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="lab_tests">
                            <LabManagement />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'beds',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="beds">
                            <BedManagement />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'billing',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="billing">
                            <EnhancedBillingSystem />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'inventory',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="inventory">
                            <InventoryManagement />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'notifications',
                element: (
                    <ProtectedRoute>
                        <NotificationCenter />
                    </ProtectedRoute>
                )
            },
            {
                path: 'users',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <SuperAdminUserManagement />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <SuperAdminDashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/roles',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <RoleManagement />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);
