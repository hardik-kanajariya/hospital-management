import type { HttpContext } from '@adonisjs/core/http'
import Prescription from '#models/prescription'
import Patient from '#models/patient'
import User from '#models/user'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { prescriptionValidator, updatePrescriptionValidator } from '#validators/prescription'

export default class PrescriptionsController {
    /**
     * Get all prescriptions with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const patientId = request.input('patientId', '')
            const doctorId = request.input('doctorId', '')
            const status = request.input('status', '')

            let query = Prescription.query()
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

            query = query.orderBy('prescribed_date', 'desc')

            if (status) {
                query = query.where('status', status)
            }

            query = query.orderBy('prescription_date', 'desc')

            const prescriptions = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: prescriptions,
                message: 'Prescriptions retrieved successfully'
            })

        } catch (error) {
            console.error('Prescriptions index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving prescriptions'
            })
        }
    }

    /**
     * Get single prescription by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const prescription = await Prescription.query()
                .where('id', params.id)
                .preload('patient')
                .preload('doctor')
                .first()

            if (!prescription) {
                return response.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: prescription,
                message: 'Prescription retrieved successfully'
            })

        } catch (error) {
            console.error('Prescription show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving prescription'
            })
        }
    }

    /**
     * Create new prescription
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(prescriptionValidator)

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

            // Generate prescription ID
            const prescriptionCount = await Prescription.query().count('* as total')
            const prescriptionId = `RX${String(Number(prescriptionCount[0].$extras.total) + 1).padStart(6, '0')}`

            const prescription = new Prescription()
            prescription.id = uuid()
            prescription.prescriptionId = prescriptionId
            prescription.patientId = payload.patientId
            prescription.doctorId = payload.doctorId
            prescription.appointmentId = payload.appointmentId || null
            prescription.prescriptionDate = payload.prescriptionDate ? DateTime.fromJSDate(payload.prescriptionDate) : DateTime.now()
            prescription.medications = payload.medications
            prescription.instructions = payload.instructions || null
            prescription.diagnosis = payload.diagnosis
            prescription.status = payload.status || 'active'
            prescription.validUntil = payload.validUntil ? DateTime.fromJSDate(payload.validUntil) : null
            prescription.notes = payload.notes || null

            await prescription.save()

            // Load relationships
            await prescription.load('patient')
            await prescription.load('doctor')

            return response.status(201).json({
                success: true,
                data: prescription,
                message: 'Prescription created successfully'
            })

        } catch (error) {
            console.error('Prescription store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating prescription'
            })
        }
    }

    /**
     * Update prescription
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const prescription = await Prescription.find(params.id)

            if (!prescription) {
                return response.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                })
            }

            const payload = await request.validateUsing(updatePrescriptionValidator)

            if (payload.medications !== undefined) prescription.medications = payload.medications
            if (payload.diagnosis !== undefined) prescription.diagnosis = payload.diagnosis
            if (payload.instructions !== undefined) prescription.instructions = payload.instructions || null
            if (payload.notes !== undefined) prescription.notes = payload.notes || null
            if (payload.status !== undefined) prescription.status = payload.status
            if (payload.validUntil !== undefined) prescription.validUntil = payload.validUntil ? DateTime.fromJSDate(payload.validUntil) : null
            if (payload.dispensedBy !== undefined) prescription.dispensedBy = payload.dispensedBy || null

            await prescription.save()

            await prescription.load('patient')
            await prescription.load('doctor')

            return response.status(200).json({
                success: true,
                data: prescription,
                message: 'Prescription updated successfully'
            })

        } catch (error) {
            console.error('Prescription update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating prescription'
            })
        }
    }

    /**
     * Delete prescription
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const prescription = await Prescription.find(params.id)

            if (!prescription) {
                return response.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                })
            }

            await prescription.delete()

            return response.status(200).json({
                success: true,
                message: 'Prescription deleted successfully'
            })

        } catch (error) {
            console.error('Prescription destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting prescription'
            })
        }
    }

    /**
     * Dispense prescription
     */
    async dispense({ params, request, response }: HttpContext) {
        try {
            const prescription = await Prescription.find(params.id)

            if (!prescription) {
                return response.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                })
            }

            if (prescription.status !== 'active') {
                return response.status(400).json({
                    success: false,
                    message: 'Only active prescriptions can be dispensed'
                })
            }

            const pharmacistId = request.input('pharmacistId')
            const dispensedQuantities = request.input('dispensedQuantities', {})

            if (!pharmacistId) {
                return response.status(400).json({
                    success: false,
                    message: 'Pharmacist ID is required'
                })
            }

            prescription.status = 'dispensed'
            prescription.dispensedAt = DateTime.now()
            prescription.dispensedBy = pharmacistId

            // Update medications with dispensed quantities
            if (Object.keys(dispensedQuantities).length > 0) {
                const updatedMedications = prescription.medications.map((med: any) => ({
                    ...med,
                    dispensedQuantity: dispensedQuantities[med.name] || med.quantity
                }))
                prescription.medications = updatedMedications
            }

            await prescription.save()

            await prescription.load('patient')
            await prescription.load('doctor')

            return response.status(200).json({
                success: true,
                data: prescription,
                message: 'Prescription dispensed successfully'
            })

        } catch (error) {
            console.error('Prescription dispense error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while dispensing prescription'
            })
        }
    }

    /**
     * Get patient's prescription history
     */
    async patientHistory({ params, request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const status = request.input('status', '')

            let query = Prescription.query()
                .where('patient_id', params.patientId)
                .preload('doctor')

            if (status) {
                query = query.where('status', status)
            }

            query = query.orderBy('prescription_date', 'desc')

            const prescriptions = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: prescriptions,
                message: 'Patient prescription history retrieved successfully'
            })

        } catch (error) {
            console.error('Patient prescription history error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patient prescription history'
            })
        }
    }

    /**
     * Get active prescriptions
     */
    async active({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)

            const activePrescriptions = await Prescription.query()
                .where('status', 'active')
                .where('valid_until', '>', DateTime.now().toSQLDate()!)
                .preload('patient')
                .preload('doctor')
                .orderBy('prescription_date', 'desc')
                .paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: activePrescriptions,
                message: 'Active prescriptions retrieved successfully'
            })

        } catch (error) {
            console.error('Active prescriptions error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving active prescriptions'
            })
        }
    }

    /**
     * Get prescription summary/statistics
     */
    async summary({ request, response }: HttpContext) {
        try {
            const startDate = request.input('startDate')
            const endDate = request.input('endDate')

            let query = Prescription.query()

            if (startDate && endDate) {
                query = query.whereBetween('prescription_date', [startDate, endDate])
            }

            const totalPrescriptions = await query.clone().count('* as total')
            const activePrescriptions = await query.clone().where('status', 'active').count('* as total')
            const dispensedPrescriptions = await query.clone().where('status', 'dispensed').count('* as total')
            const expiredPrescriptions = await query.clone()
                .where('valid_until', '<', DateTime.now().toSQLDate()!)
                .count('* as total')

            const summary = {
                totalPrescriptions: totalPrescriptions[0].$extras.total,
                activePrescriptions: activePrescriptions[0].$extras.total,
                dispensedPrescriptions: dispensedPrescriptions[0].$extras.total,
                expiredPrescriptions: expiredPrescriptions[0].$extras.total,
                dispensingRate: totalPrescriptions[0].$extras.total > 0
                    ? ((dispensedPrescriptions[0].$extras.total / totalPrescriptions[0].$extras.total) * 100).toFixed(2)
                    : 0
            }

            return response.status(200).json({
                success: true,
                data: summary,
                message: 'Prescription summary retrieved successfully'
            })

        } catch (error) {
            console.error('Prescription summary error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving prescription summary'
            })
        }
    }
}