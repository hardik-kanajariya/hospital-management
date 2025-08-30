import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import LoginRedirect from '../components/auth/LoginRedirect';
import LandingPage from '../components/landing/LandingPage';

// Hospital Module Imports - Using new modular structure
import Dashboard from '../components/hospital/dashboard/Dashboard';
import PatientList from '../components/hospital/patients/PatientList';
import CreatePatient from '../components/hospital/patients/CreatePatient';
import PatientProfile from '../components/hospital/patients/PatientProfile';
import EditPatient from '../components/hospital/patients/EditPatient';
import AppointmentScheduling from '../components/hospital/appointments/AppointmentScheduling';
import MedicalRecords from '../components/hospital/medical/MedicalRecords';
import EnhancedBillingSystem from '../components/hospital/billing/EnhancedBillingSystem';
import InventoryManagement from '../components/hospital/inventory/InventoryManagement';
import DoctorSchedule from '../components/hospital/doctors/DoctorSchedule';
import LabManagement from '../components/hospital/laboratory/LabManagement';
import BedManagement from '../components/hospital/facilities/BedManagement';
import NotificationCenter from '../components/hospital/notifications/NotificationCenter';
import SuperAdminDashboard from '../components/hospital/administration/SuperAdminDashboard';
import RoleManagement from '../components/hospital/administration/RoleManagement';
import SuperAdminUserManagement from '../components/hospital/administration/SuperAdminUserManagement';
import MastersManagement from '../components/hospital/administration/MastersManagement';
import SystemSettingsPage from '../components/hospital/administration/SystemSettingsPage';
import RoleBasedAccess from '../components/auth/RoleBasedAccess';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Medical Records Module Components
import MedicalRecordsList from '../components/hospital/medical/records/MedicalRecordsList';
import CreateMedicalRecord from '../components/hospital/medical/records/CreateMedicalRecord';
import ViewMedicalRecord from '../components/hospital/medical/records/ViewMedicalRecord';
import EditMedicalRecord from '../components/hospital/medical/records/EditMedicalRecord';

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
                            <PatientList />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'patients/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="patients">
                            <CreatePatient />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'patients/:id',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="patients">
                            <PatientProfile />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'patients/:id/edit',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="patients">
                            <EditPatient />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'patients/:id/medical-records',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="medical_records">
                            <MedicalRecordsList />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'patients/:patientId/medical-records/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="medical_records">
                            <CreateMedicalRecord />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'medical-records',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="medical_records">
                            <MedicalRecordsList />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'medical-records/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="medical_records">
                            <CreateMedicalRecord />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'medical-records/:id',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="medical_records">
                            <ViewMedicalRecord />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'medical-records/:id/edit',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="medical_records">
                            <EditMedicalRecord />
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
                            <MedicalRecordsList />
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
            },
            {
                path: 'admin/masters',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <MastersManagement />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/settings',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <SystemSettingsPage />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);
