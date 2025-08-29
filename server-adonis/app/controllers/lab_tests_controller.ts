import type { HttpContext } from '@adonisjs/core/http'
import LabTest from '#models/lab_test'
import Patient from '#models/patient'
import Doctor from '#models/doctor'
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

      query = query.orderBy('test_date', 'desc')

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
      const doctor = await Doctor.find(payload.doctorId)

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
      labTest.description = payload.description
      labTest.instructions = payload.instructions
      labTest.testDate = payload.testDate || DateTime.now()
      labTest.sampleCollectionDate = payload.sampleCollectionDate
      labTest.status = payload.status || 'ordered'
      labTest.priority = payload.priority || 'normal'
      labTest.cost = payload.cost
      labTest.results = payload.results || {}
      labTest.normalRange = payload.normalRange || {}
      labTest.notes = payload.notes
      labTest.technician = payload.technician

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

      labTest.merge(payload)
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
      const technician = request.input('technician', '')

      if (!results || typeof results !== 'object') {
        return response.status(400).json({
          success: false,
          message: 'Valid test results are required'
        })
      }

      labTest.results = results
      labTest.status = 'completed'
      labTest.completedAt = DateTime.now()
      if (notes) labTest.notes = notes
      if (technician) labTest.technician = technician

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
        .orderBy('test_date', 'asc')
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

      query = query.orderBy('test_date', 'desc')

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
        query = query.whereBetween('test_date', [startDate, endDate])
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