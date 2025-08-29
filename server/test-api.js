import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Test login and get token
async function login() {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@medcare.com',
                password: 'admin123'
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('✅ Login successful');
            return data.data.token;
        } else {
            console.log('❌ Login failed:', data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return null;
    }
}

// Test doctors endpoint
async function testDoctors(token) {
    try {
        const response = await fetch(`${BASE_URL}/api/doctors`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            console.log('✅ Doctors API working:', data.data.doctors.length, 'doctors found');
        } else {
            console.log('❌ Doctors API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Doctors API error:', error.message);
    }
}

// Test appointments endpoint
async function testAppointments(token) {
    try {
        const response = await fetch(`${BASE_URL}/api/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            console.log('✅ Appointments API working:', data.data.appointments.length, 'appointments found');
        } else {
            console.log('❌ Appointments API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Appointments API error:', error.message);
    }
}

// Test patients endpoint
async function testPatients(token) {
    try {
        const response = await fetch(`${BASE_URL}/api/patients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            console.log('✅ Patients API working:', data.data.patients.length, 'patients found');
        } else {
            console.log('❌ Patients API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Patients API error:', error.message);
    }
}

// Test notifications endpoint
async function testNotifications(token) {
    try {
        const response = await fetch(`${BASE_URL}/api/notifications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            console.log('✅ Notifications API working:', data.data.notifications.length, 'notifications found');
        } else {
            console.log('❌ Notifications API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Notifications API error:', error.message);
    }
}

// Run all tests
async function runTests() {
    console.log('🧪 Testing Hospital Management System API...\n');

    const token = await login();
    if (!token) {
        console.log('Cannot proceed without authentication token');
        return;
    }

    console.log('\n📋 Testing API endpoints:');
    await testDoctors(token);
    await testAppointments(token);
    await testPatients(token);
    await testNotifications(token);

    console.log('\n🎉 API tests completed!');
}

runTests();
