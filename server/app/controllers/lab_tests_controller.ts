import type { HttpContext } from '@adonisjs/core/http'
import LabTest from '#models/lab_test'
import Patient from '#models/patient'
import User from '#models/user'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { labTestValidator, updateLabTestValidator } from '#validators/lab_test'

export default class LabTestsController {
    /**
     * Get all lab tests with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const patientId = request.input('patientId', '')
            const doctorId = request.input('doctorId', '')
            const status = request.input('status', '')
            const testType = request.input('testType', '')

            let query = LabTest.query()
                .preload('patient')
                .preload('doctor')

            if (patientId) {
                query = query.where('patient_id', patientId)
            }

            if (doctorId) {
                query = query.where('doctor_id', doctorId)
            }

            if (status) {
                query = query.where('status', status)
            }

            if (testType) {
                query = query.where('test_type', 'like', `%${testType}%`)
            }

            const labTests = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: labTests,
                message: 'Lab tests retrieved successfully'
            })

        } catch (error) {
            console.error('Lab tests index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving lab tests'
            })
        }
    }

    /**
     * Get single lab test by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const labTest = await LabTest.query()
                .where('id', params.id)
                .preload('patient')
                .preload('doctor')
                .first()

            if (!labTest) {
                return response.status(404).json({
                    success: false,
                    message: 'Lab test not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: labTest,
                message: 'Lab test retrieved successfully'
            })

        } catch (error) {
            console.error('Lab test show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving lab test'
            })
        }
    }

    /**
     * Create new lab test
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(labTestValidator)

            // Verify patient and doctor exist
            const patient = await Patient.find(payload.patientId)
            const doctor = await User.find(payload.doctorId)

            if (!patient) {
                return response.status(400).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            if (!doctor) {
                return response.status(400).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            // Generate test ID
            const testCount = await LabTest.query().count('* as total')
            const testId = `LAB${String(Number(testCount[0].$extras.total) + 1).padStart(6, '0')}`

            const labTest = new LabTest()
            labTest.id = uuid()
            labTest.testId = testId
            labTest.patientId = payload.patientId
            labTest.doctorId = payload.doctorId
            labTest.testType = payload.testType
            labTest.testName = payload.testName
            labTest.category = payload.category
            labTest.description = payload.description || null
            labTest.orderedDate = payload.orderedDate ? DateTime.fromJSDate(payload.orderedDate) : DateTime.now()
            labTest.sampleCollectedDate = payload.sampleCollectedDate ? DateTime.fromJSDate(payload.sampleCollectedDate) : null
            labTest.status = payload.status || 'ordered'
            labTest.priority = payload.priority || 'normal'
            labTest.results = payload.results || {}
            labTest.referenceRanges = payload.referenceRanges || {}
            labTest.notes = payload.notes || null
            labTest.technicianId = payload.technicianId || null

            await labTest.save()

            // Load relationships
            await labTest.load('patient')
            await labTest.load('doctor')

            return response.status(201).json({
                success: true,
                data: labTest,
                message: 'Lab test created successfully'
            })

        } catch (error) {
            console.error('Lab test store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating lab test'
            })
        }
    }

    /**
     * Update lab test
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const labTest = await LabTest.find(params.id)

            if (!labTest) {
                return response.status(404).json({
                    success: false,
                    message: 'Lab test not found'
                })
            }

            const payload = await request.validateUsing(updateLabTestValidator)

            if (payload.testName !== undefined) labTest.testName = payload.testName
            if (payload.testType !== undefined) labTest.testType = payload.testType
            if (payload.category !== undefined) labTest.category = payload.category
            if (payload.description !== undefined) labTest.description = payload.description || null
            if (payload.orderedDate !== undefined) labTest.orderedDate = payload.orderedDate ? DateTime.fromJSDate(payload.orderedDate) : labTest.orderedDate
            if (payload.sampleCollectedDate !== undefined) labTest.sampleCollectedDate = payload.sampleCollectedDate ? DateTime.fromJSDate(payload.sampleCollectedDate) : null
            if (payload.resultDate !== undefined) labTest.resultDate = payload.resultDate ? DateTime.fromJSDate(payload.resultDate) : null
            if (payload.status !== undefined) labTest.status = payload.status
            if (payload.priority !== undefined) labTest.priority = payload.priority
            if (payload.results !== undefined) labTest.results = payload.results
            if (payload.referenceRanges !== undefined) labTest.referenceRanges = payload.referenceRanges
            if (payload.interpretation !== undefined) labTest.interpretation = payload.interpretation || null
            if (payload.notes !== undefined) labTest.notes = payload.notes || null
            if (payload.technicianId !== undefined) labTest.technicianId = payload.technicianId || null
            if (payload.verifiedBy !== undefined) labTest.verifiedBy = payload.verifiedBy || null
            if (payload.attachments !== undefined) labTest.attachments = payload.attachments

            await labTest.save()

            await labTest.load('patient')
            await labTest.load('doctor')

            return response.status(200).json({
                success: true,
                data: labTest,
                message: 'Lab test updated successfully'
            })

        } catch (error) {
            console.error('Lab test update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating lab test'
            })
        }
    }

    /**
     * Delete lab test
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const labTest = await LabTest.find(params.id)

            if (!labTest) {
                return response.status(404).json({
                    success: false,
                    message: 'Lab test not found'
                })
            }

            await labTest.delete()

            return response.status(200).json({
                success: true,
                message: 'Lab test deleted successfully'
            })

        } catch (error) {
            console.error('Lab test destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting lab test'
            })
        }
    }

    /**
     * Update lab test results
     */
    async updateResults({ params, request, response }: HttpContext) {
        try {
            const labTest = await LabTest.find(params.id)

            if (!labTest) {
                return response.status(404).json({
                    success: false,
                    message: 'Lab test not found'
                })
            }

            const results = request.input('results')
            const notes = request.input('notes', '')
            const technicianId = request.input('technicianId', '')

            if (!results || typeof results !== 'object') {
                return response.status(400).json({
                    success: false,
                    message: 'Valid test results are required'
                })
            }

            labTest.results = results
            labTest.status = 'completed'
            labTest.resultDate = DateTime.now()
            if (notes) labTest.notes = notes
            if (technicianId) labTest.technicianId = technicianId

            await labTest.save()

            await labTest.load('patient')
            await labTest.load('doctor')

            return response.status(200).json({
                success: true,
                data: labTest,
                message: 'Lab test results updated successfully'
            })

        } catch (error) {
            console.error('Lab test results update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating lab test results'
            })
        }
    }

    /**
     * Get pending lab tests
     */
    async pending({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)

            const pendingTests = await LabTest.query()
                .whereIn('status', ['ordered', 'in_progress'])
                .preload('patient')
                .preload('doctor')
                .orderBy('ordered_date', 'asc')
                .paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: pendingTests,
                message: 'Pending lab tests retrieved successfully'
            })

        } catch (error) {
            console.error('Pending lab tests error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving pending lab tests'
            })
        }
    }

    /**
     * Get patient's lab history
     */
    async patientHistory({ params, request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const testType = request.input('testType', '')

            let query = LabTest.query()
                .where('patient_id', params.patientId)
                .preload('doctor')

            if (testType) {
                query = query.where('test_type', 'like', `%${testType}%`)
            }

            query = query.orderBy('ordered_date', 'desc')

            const labTests = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: labTests,
                message: 'Patient lab history retrieved successfully'
            })

        } catch (error) {
            console.error('Patient lab history error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patient lab history'
            })
        }
    }

    /**
     * Get lab test summary/statistics
     */
    async summary({ request, response }: HttpContext) {
        try {
            const startDate = request.input('startDate')
            const endDate = request.input('endDate')

            let query = LabTest.query()

            if (startDate && endDate) {
                query = query.whereBetween('ordered_date', [startDate, endDate])
            }

            const totalTests = await query.clone().count('* as total')
            const completedTests = await query.clone().where('status', 'completed').count('* as total')
            const pendingTests = await query.clone().whereIn('status', ['ordered', 'in_progress']).count('* as total')
            const urgentTests = await query.clone().where('priority', 'urgent').count('* as total')

            const summary = {
                totalTests: totalTests[0].$extras.total,
                completedTests: completedTests[0].$extras.total,
                pendingTests: pendingTests[0].$extras.total,
                urgentTests: urgentTests[0].$extras.total,
                completionRate: totalTests[0].$extras.total > 0
                    ? ((completedTests[0].$extras.total / totalTests[0].$extras.total) * 100).toFixed(2)
                    : 0
            }

            return response.status(200).json({
                success: true,
                data: summary,
                message: 'Lab test summary retrieved successfully'
            })

        } catch (error) {
            console.error('Lab test summary error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving lab test summary'
            })
        }
    }
}