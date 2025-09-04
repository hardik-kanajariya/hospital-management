import type { HttpContext } from '@adonisjs/core/http'
import Admission from '#models/admission'
import AdmissionCharge from '#models/admission_charge'
import Bed from '#models/bed'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class AdmissionsController {
    /**
     * Get all admissions with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                status,
                patient_id,
                doctor_id,
                bed_id,
                from_date,
                to_date
            } = request.qs()

            const query = Admission.query()
                .preload('patient')
                .preload('bed', (bedQuery: any) => {
                    bedQuery.preload('room')
                })
                .preload('admittingDoctor', (doctorQuery: any) => {
                    doctorQuery.preload('user')
                })
                .preload('charges')

            if (search) {
                query.whereHas('patient', (patientQuery: any) => {
                    patientQuery.where('first_name', 'like', `%${search}%`)
                        .orWhere('last_name', 'like', `%${search}%`)
                        .orWhere('patient_id', 'like', `%${search}%`)
                }).orWhere('admission_number', 'like', `%${search}%`)
            }

            if (status) {
                query.where('status', status)
            }

            if (patient_id) {
                query.where('patient_id', patient_id)
            }

            if (doctor_id) {
                query.where('admitting_doctor_id', doctor_id)
            }

            if (bed_id) {
                query.where('bed_id', bed_id)
            }

            if (from_date) {
                query.where('admission_date', '>=', from_date)
            }

            if (to_date) {
                query.where('admission_date', '<=', to_date)
            }

            const admissions = await query
                .orderBy('admission_date', 'desc')
                .paginate(page, limit)

            // Add computed properties
            const admissionsData = admissions.toJSON()
            admissionsData.data = admissionsData.data.map((admission: any) => ({
                ...admission,
                length_of_stay: this.calculateLengthOfStay(admission.admission_date, admission.actual_discharge_date),
                total_charges: admission.charges?.reduce((sum: number, charge: any) => sum + Number(charge.total_amount), 0) || 0
            }))

            return response.ok({
                success: true,
                data: admissionsData,
                message: 'Admissions fetched successfully'
            })

        } catch (error) {
            console.error('Admissions index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving admissions'
            })
        }
    }

    /**
     * Get admission details by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const admission = await Admission.query()
                .where('id', params.id)
                .preload('patient')
                .preload('bed', (bedQuery: any) => {
                    bedQuery.preload('room')
                })
                .preload('admittingDoctor', (doctorQuery: any) => {
                    doctorQuery.preload('user')
                })
                .preload('charges')
                .preload('creator')
                .preload('updater')
                .firstOrFail()

            const admissionData = admission.toJSON()
            admissionData.length_of_stay = this.calculateLengthOfStay(
                admission.admissionDate.toISO() || admission.admissionDate.toString(),
                admission.actualDischargeDate?.toISO() || undefined
            )
            admissionData.total_charges = admission.charges?.reduce((sum, charge) => sum + Number(charge.totalAmount), 0) || 0

            return response.ok({
                success: true,
                data: admissionData,
                message: 'Admission details fetched successfully'
            })

        } catch (error) {
            console.error('Admission show error:', error)
            return response.status(404).json({
                success: false,
                message: 'Admission not found'
            })
        }
    }

    /**
     * Create a new admission
     */
    async store({ request, response, auth }: HttpContext) {
        try {
            const payload = request.all()
            const userId = auth.user!.id

            // Start transaction
            const trx = await Database.transaction()

            try {
                // Check if patient is already admitted
                const existingAdmission = await Admission.query({ client: trx })
                    .where('patient_id', payload.patient_id)
                    .where('status', 'active')
                    .first()

                if (existingAdmission) {
                    await trx.rollback()
                    return response.badRequest({
                        success: false,
                        message: 'Patient is already admitted'
                    })
                }

                // Check if bed is available
                const bed = await Bed.query({ client: trx })
                    .where('id', payload.bed_id)
                    .first()

                if (!bed) {
                    await trx.rollback()
                    return response.badRequest({
                        success: false,
                        message: 'Bed not found'
                    })
                }

                if (bed.status !== 'available') {
                    await trx.rollback()
                    return response.badRequest({
                        success: false,
                        message: 'Bed is not available'
                    })
                }

                // Create admission
                const admission = await Admission.create({
                    patientId: payload.patient_id,
                    bedId: payload.bed_id,
                    admittingDoctorId: payload.admitting_doctor_id,
                    admissionDate: DateTime.fromISO(payload.admission_date) || DateTime.now(),
                    expectedDischargeDate: payload.expected_discharge_date ? DateTime.fromISO(payload.expected_discharge_date) : null,
                    status: 'active',
                    chiefComplaint: payload.chief_complaint,
                    diagnosis: payload.diagnosis,
                    admissionNotes: payload.admission_notes,
                    createdBy: userId,
                }, { client: trx })

                // Update bed status
                await bed.merge({
                    status: 'occupied',
                    currentPatientId: payload.patient_id,
                    admissionDate: admission.admissionDate,
                    expectedDischargeDate: admission.expectedDischargeDate,
                })
                await bed.save()

                // Create initial room charge
                const dailyRate = bed.dailyRate
                await AdmissionCharge.create({
                    admissionId: admission.id,
                    chargeType: 'room',
                    description: 'Room charges - Day 1',
                    amount: dailyRate,
                    quantity: 1,
                    totalAmount: dailyRate,
                    chargeDate: admission.admissionDate,
                    isBillable: true,
                    createdBy: userId,
                }, { client: trx })

                await trx.commit()

                // Load relationships for response
                await admission.load('patient')
                await admission.load('bed', (bedQuery: any) => {
                    bedQuery.preload('room')
                })
                await admission.load('admittingDoctor', (doctorQuery: any) => {
                    doctorQuery.preload('user')
                })

                return response.created({
                    success: true,
                    data: admission,
                    message: 'Patient admitted successfully'
                })

            } catch (error) {
                await trx.rollback()
                throw error
            }

        } catch (error) {
            console.error('Admission store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error creating admission'
            })
        }
    }

    /**
     * Update admission details
     */
    async update({ params, request, response, auth }: HttpContext) {
        try {
            const admission = await Admission.findOrFail(params.id)
            const payload = request.all()
            const userId = auth.user!.id

            if (admission.status !== 'active') {
                return response.badRequest({
                    success: false,
                    message: 'Cannot update non-active admission'
                })
            }

            admission.merge({
                expectedDischargeDate: payload.expected_discharge_date ? DateTime.fromISO(payload.expected_discharge_date) : admission.expectedDischargeDate,
                chiefComplaint: payload.chief_complaint || admission.chiefComplaint,
                diagnosis: payload.diagnosis || admission.diagnosis,
                admissionNotes: payload.admission_notes || admission.admissionNotes,
                updatedBy: userId,
            })
            await admission.save()

            // Update bed's expected discharge date if changed
            if (payload.expected_discharge_date) {
                const bed = await Bed.find(admission.bedId)
                if (bed) {
                    bed.expectedDischargeDate = admission.expectedDischargeDate
                    await bed.save()
                }
            }

            await admission.load('patient')
            await admission.load('bed', (bedQuery: any) => {
                bedQuery.preload('room')
            })
            await admission.load('admittingDoctor', (doctorQuery: any) => {
                doctorQuery.preload('user')
            })

            return response.ok({
                success: true,
                data: admission,
                message: 'Admission updated successfully'
            })

        } catch (error) {
            console.error('Admission update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error updating admission'
            })
        }
    }

    /**
     * Discharge patient
     */
    async discharge({ params, request, response, auth }: HttpContext) {
        try {
            const admission = await Admission.findOrFail(params.id)
            const payload = request.all()
            const userId = auth.user!.id

            if (admission.status !== 'active') {
                return response.badRequest({
                    success: false,
                    message: 'Admission is not active'
                })
            }

            // Check if there are unpaid bills
            const unpaidCharges = await AdmissionCharge.query()
                .where('admission_id', admission.id)
                .where('is_billable', true)
                .whereNull('bill_id')
                .first()

            if (unpaidCharges && !payload.force) {
                return response.badRequest({
                    success: false,
                    message: 'Cannot discharge patient with unpaid charges. Use force=true to override.',
                    unpaid_charges_exist: true
                })
            }

            // Discharge patient
            await admission.discharge(
                payload.discharge_notes,
                payload.discharge_type,
                userId
            )

            await admission.load('patient')
            await admission.load('bed', (bedQuery: any) => {
                bedQuery.preload('room')
            })

            return response.ok({
                success: true,
                data: admission,
                message: 'Patient discharged successfully'
            })

        } catch (error) {
            console.error('Admission discharge error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error discharging patient'
            })
        }
    }

    /**
     * Transfer patient to another bed
     */
    async transfer({ params, request, response, auth }: HttpContext) {
        try {
            const admission = await Admission.findOrFail(params.id)
            const payload = request.all()
            const userId = auth.user!.id

            if (admission.status !== 'active') {
                return response.badRequest({
                    success: false,
                    message: 'Admission is not active'
                })
            }

            // Check if new bed is available
            const newBed = await Bed.findOrFail(payload.new_bed_id)
            if (newBed.status !== 'available') {
                return response.badRequest({
                    success: false,
                    message: 'Target bed is not available'
                })
            }

            // Transfer patient
            const newAdmission = await admission.transfer(payload.new_bed_id, userId)

            await newAdmission.load('patient')
            await newAdmission.load('bed', (bedQuery: any) => {
                bedQuery.preload('room')
            })

            return response.ok({
                success: true,
                data: {
                    old_admission: admission,
                    new_admission: newAdmission
                },
                message: 'Patient transferred successfully'
            })

        } catch (error) {
            console.error('Admission transfer error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error transferring patient'
            })
        }
    }

    /**
     * Add charge to admission
     */
    async addCharge({ params, request, response, auth }: HttpContext) {
        try {
            const admission = await Admission.findOrFail(params.id)
            const payload = request.all()
            const userId = auth.user!.id

            if (admission.status !== 'active') {
                return response.badRequest({
                    success: false,
                    message: 'Cannot add charges to non-active admission'
                })
            }

            const charge = await admission.addCharge({
                chargeType: payload.charge_type,
                description: payload.description,
                amount: payload.amount,
                quantity: payload.quantity || 1,
                chargeDate: payload.charge_date ? DateTime.fromISO(payload.charge_date) : DateTime.now(),
                isBillable: payload.is_billable !== false,
                createdBy: userId,
            })

            return response.created({
                success: true,
                data: charge,
                message: 'Charge added successfully'
            })

        } catch (error) {
            console.error('Add charge error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error adding charge'
            })
        }
    }

    /**
     * Get bill summary for admission
     */
    async billSummary({ params, response }: HttpContext) {
        try {
            const admission = await Admission.query()
                .where('id', params.id)
                .preload('charges')
                .firstOrFail()

            const summary = {
                admission_number: admission.admissionNumber,
                patient_id: admission.patientId,
                admission_date: admission.admissionDate,
                discharge_date: admission.actualDischargeDate,
                length_of_stay: this.calculateLengthOfStay(
                    admission.admissionDate.toISO() || admission.admissionDate.toString(),
                    admission.actualDischargeDate?.toISO() || undefined
                ),
                total_charges: 0,
                paid_amount: 0,
                pending_amount: 0,
                charges_by_type: {} as any
            }

            // Calculate charges by type
            for (const charge of admission.charges) {
                summary.total_charges += Number(charge.totalAmount)

                if (!summary.charges_by_type[charge.chargeType]) {
                    summary.charges_by_type[charge.chargeType] = 0
                }
                summary.charges_by_type[charge.chargeType] += Number(charge.totalAmount)
            }

            // Calculate paid amount from bills (if implemented)
            // This would need to be connected to the billing system
            summary.pending_amount = summary.total_charges - summary.paid_amount

            return response.ok({
                success: true,
                data: summary,
                message: 'Bill summary fetched successfully'
            })

        } catch (error) {
            console.error('Bill summary error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error fetching bill summary'
            })
        }
    }

    /**
     * Get admission statistics
     */
    async statistics({ request, response }: HttpContext) {
        try {
            const { from_date, to_date } = request.qs()

            const baseQuery = Admission.query()

            if (from_date) {
                baseQuery.where('admission_date', '>=', from_date)
            }

            if (to_date) {
                baseQuery.where('admission_date', '<=', to_date)
            }

            // Get admission statistics
            const totalAdmissions = await baseQuery.clone().count('* as total')
            const activeAdmissions = await baseQuery.clone().where('status', 'active').count('* as total')
            const dischargedAdmissions = await baseQuery.clone().where('status', 'discharged').count('* as total')

            // Average length of stay for discharged patients
            const avgLengthOfStayResult = await Database
                .query()
                .select(Database.raw('AVG(DATEDIFF(actual_discharge_date, admission_date)) as avg_length'))
                .from('admissions')
                .where('status', 'discharged')
                .if(from_date, (query) => query.where('admission_date', '>=', from_date))
                .if(to_date, (query) => query.where('admission_date', '<=', to_date))
                .first()

            const avgLengthOfStay = Math.round(Number(avgLengthOfStayResult?.avg_length) || 0)

            // Department-wise admissions
            const departmentStats = await Database
                .from('admissions as a')
                .join('beds as b', 'a.bed_id', 'b.id')
                .join('rooms as r', 'b.room_id', 'r.id')
                .join('master_data as md', 'r.department_id', 'md.id')
                .select('md.name as department_name')
                .count('a.id as admission_count')
                .if(from_date, (query) => query.where('a.admission_date', '>=', from_date))
                .if(to_date, (query) => query.where('a.admission_date', '<=', to_date))
                .groupBy('md.id', 'md.name')

            return response.ok({
                success: true,
                data: {
                    total_admissions: Number(totalAdmissions[0].$extras.total),
                    active_admissions: Number(activeAdmissions[0].$extras.total),
                    discharged_admissions: Number(dischargedAdmissions[0].$extras.total),
                    average_length_of_stay: avgLengthOfStay,
                    department_wise_admissions: departmentStats
                },
                message: 'Admission statistics fetched successfully'
            })

        } catch (error) {
            console.error('Admission statistics error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error fetching admission statistics'
            })
        }
    }

    /**
     * Calculate length of stay in days
     */
    private calculateLengthOfStay(admissionDate: string, dischargeDate?: string): number {
        const start = DateTime.fromISO(admissionDate)
        const end = dischargeDate ? DateTime.fromISO(dischargeDate) : DateTime.now()
        return Math.ceil(end.diff(start, 'days').days)
    }
}
