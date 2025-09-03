import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import App from '../App';
import LoginRedirect from '../components/auth/LoginRedirect';
import LandingPage from '../components/landing/LandingPage';

// Super Dupar Admin Components
import SuperDuparAdminLogin from '../components/superduparadmin/SuperDuparAdminLogin';
import SuperDuparAdminDashboard from '../components/superduparadmin/SuperDuparAdminDashboard';
import SuperDuparAdminUserManagement from '../components/superduparadmin/SuperAdminUserManagement';
import ProtectedSuperDuparAdminRoute from '../components/superduparadmin/ProtectedSuperDuparAdminRoute';

// Hospital Module Imports - Using new modular structure
import Dashboard from '../components/hospital/dashboard/Dashboard';
import PatientList from '../components/hospital/patients/PatientList';
import CreatePatient from '../components/hospital/patients/CreatePatient';
import PatientProfile from '../components/hospital/patients/PatientProfile';
import EditPatient from '../components/hospital/patients/EditPatient';
import EnhancedBillingSystem from '../components/hospital/billing/EnhancedBillingSystem';
import InventoryManagement from '../components/hospital/inventory/InventoryManagement';
import DoctorSchedule from '../components/hospital/doctors/DoctorSchedule';
import LabManagement from '../components/hospital/laboratory/LabManagement';
import BedManagement from '../components/hospital/facilities/BedManagement';
import NotificationCenter from '../components/hospital/notifications/NotificationCenter';
import SuperAdminDashboard from '../components/hospital/administration/SuperAdminDashboard';
import RoleManagement from '../components/hospital/administration/RoleManagement';
import RoleFieldsPage from '../components/hospital/administration/RoleFieldsPage';
import SuperAdminUserManagement from '../components/hospital/administration/SuperAdminUserManagement';
import CreateUser from '../components/hospital/administration/CreateUser';
import EditUser from '../components/hospital/administration/EditUser';
import ViewUser from '../components/hospital/administration/ViewUser';
import MastersManagement from '../components/hospital/administration/MastersManagement';
import SystemSettingsPage from '../components/hospital/administration/SystemSettingsPage';
import RoleBasedAccess from '../components/auth/RoleBasedAccess';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Medical Records Module Components
import MedicalRecordsList from '../components/hospital/medical/records/MedicalRecordsList';
import CreateMedicalRecord from '../components/hospital/medical/records/CreateMedicalRecord';
import ViewMedicalRecord from '../components/hospital/medical/records/ViewMedicalRecord';
import EditMedicalRecord from '../components/hospital/medical/records/EditMedicalRecord';
import AppointmentList from '@/components/hospital/appointments/AppointmentList';
import CreateAppointment from '@/components/hospital/appointments/CreateAppointment';
import AppointmentView from '@/components/hospital/appointments/AppointmentView';
import EditAppointment from '@/components/hospital/appointments/EditAppointment';

// Billing Components
import CreateBill from '@/components/hospital/billing/CreateBill';
import ViewBill from '@/components/hospital/billing/ViewBill';
import EditBill from '@/components/hospital/billing/EditBill';

// Lab Components
import CreateLabTest from '@/components/hospital/laboratory/CreateLabTest';
import CreateLabOrder from '@/components/hospital/laboratory/CreateLabOrder';
import ViewLabOrder from '@/components/hospital/laboratory/ViewLabOrder';
import EnterLabResults from '@/components/hospital/laboratory/EnterLabResults';

// Bed Components
import CreateBed from '@/components/hospital/facilities/CreateBed';
import EditBed from '@/components/hospital/facilities/EditBed';

// Inventory Components
import CreateInventoryItem from '@/components/hospital/inventory/CreateInventoryItem';
import EditInventoryItem from '@/components/hospital/inventory/EditInventoryItem';

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
            // Super Dupar Admin Routes
            {
                path: 'super-dupar-admin',
                children: [
                    {
                        path: 'login',
                        element: (
                            <ProtectedSuperDuparAdminRoute requireAuth={false}>
                                <SuperDuparAdminLogin />
                            </ProtectedSuperDuparAdminRoute>
                        )
                    },
                    {
                        path: 'dashboard',
                        element: (
                            <ProtectedSuperDuparAdminRoute>
                                <SuperDuparAdminDashboard />
                            </ProtectedSuperDuparAdminRoute>
                        )
                    },
                    {
                        path: 'manage-admins',
                        element: (
                            <ProtectedSuperDuparAdminRoute>
                                <SuperDuparAdminUserManagement />
                            </ProtectedSuperDuparAdminRoute>
                        )
                    }
                ]
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
                            <AppointmentList />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'appointments/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="appointments">
                            <CreateAppointment />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'appointments/:id',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="appointments">
                            <AppointmentView />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'appointments/:id/edit',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="appointments">
                            <EditAppointment />
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
                path: 'billing/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="billing">
                            <CreateBill />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'billing/:id',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="billing">
                            <ViewBill />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'billing/:id/edit',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="billing">
                            <EditBill />
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
                path: 'lab/tests/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="lab_tests">
                            <CreateLabTest />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'lab/orders/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="lab_tests">
                            <CreateLabOrder />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'lab/orders/:id',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="lab_tests">
                            <ViewLabOrder />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'lab/orders/:id/results',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="lab_tests">
                            <EnterLabResults />
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
                path: 'beds/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="beds">
                            <CreateBed />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'beds/:id/edit',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="beds">
                            <EditBed />
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
                path: 'inventory/create',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="inventory">
                            <CreateInventoryItem />
                        </RoleBasedAccess>
                    </ProtectedRoute>
                )
            },
            {
                path: 'inventory/:id/edit',
                element: (
                    <ProtectedRoute>
                        <RoleBasedAccess requiredModule="inventory">
                            <EditInventoryItem />
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
                path: 'users/create',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <CreateUser />
                    </ProtectedRoute>
                )
            },
            {
                path: 'users/:userId/edit',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <EditUser />
                    </ProtectedRoute>
                )
            },
            {
                path: 'users/:userId/view',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <ViewUser />
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
                path: 'admin/roles/:roleId/fields',
                element: (
                    <ProtectedRoute requiredRole="super_admin">
                        <RoleFieldsPage />
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
