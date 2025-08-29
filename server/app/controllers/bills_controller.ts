import type { HttpContext } from '@adonisjs/core/http'
import Bill from '#models/bill'
import Patient from '#models/patient'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { billValidator, updateBillValidator } from '#validators/bill'

export default class BillsController {
    /**
     * Get all bills with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const patientId = request.input('patientId', '')
            const status = request.input('status', '')

            let query = Bill.query()
                .preload('patient')

            if (patientId) {
                query = query.where('patient_id', patientId)
            }

            if (status) {
                query = query.where('status', status)
            }

            query = query.orderBy('bill_date', 'desc')

            const bills = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: bills,
                message: 'Bills retrieved successfully'
            })

        } catch (error) {
            console.error('Bills index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving bills'
            })
        }
    }

    /**
     * Get single bill by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const bill = await Bill.query()
                .where('id', params.id)
                .preload('patient')
                .first()

            if (!bill) {
                return response.status(404).json({
                    success: false,
                    message: 'Bill not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: bill,
                message: 'Bill retrieved successfully'
            })

        } catch (error) {
            console.error('Bill show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving bill'
            })
        }
    }

    /**
     * Create new bill
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(billValidator)

            // Verify patient exists
            const patient = await Patient.find(payload.patientId)

            if (!patient) {
                return response.status(400).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            // Generate bill ID
            const billCount = await Bill.query().count('* as total')
            const billId = `BILL${String(Number(billCount[0].$extras.total) + 1).padStart(6, '0')}`

            const bill = new Bill()
            bill.id = uuid()
            bill.billId = billId
            bill.patientId = payload.patientId
            bill.appointmentId = payload.appointmentId || null
            bill.billDate = payload.billDate ? DateTime.fromJSDate(payload.billDate) : DateTime.now()
            bill.dueDate = DateTime.fromJSDate(payload.dueDate)
            bill.services = payload.services || []
            bill.medications = payload.medications || []
            bill.subtotal = payload.subtotal || 0
            bill.taxAmount = payload.taxAmount || 0
            bill.discountAmount = payload.discountAmount || 0
            bill.totalAmount = payload.totalAmount
            bill.paidAmount = payload.paidAmount || 0
            bill.outstandingAmount = payload.totalAmount - (payload.paidAmount || 0)
            bill.status = payload.status || 'pending'
            bill.paymentMethod = payload.paymentMethod || null
            bill.insuranceDetails = payload.insuranceDetails || {}
            bill.notes = payload.notes || null

            await bill.save()

            // Load relationships
            await bill.load('patient')

            return response.status(201).json({
                success: true,
                data: bill,
                message: 'Bill created successfully'
            })

        } catch (error) {
            console.error('Bill store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating bill'
            })
        }
    }

    /**
     * Update bill
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const bill = await Bill.find(params.id)

            if (!bill) {
                return response.status(404).json({
                    success: false,
                    message: 'Bill not found'
                })
            }

            const payload = await request.validateUsing(updateBillValidator)

            if (payload.dueDate !== undefined) bill.dueDate = payload.dueDate ? DateTime.fromJSDate(payload.dueDate) : bill.dueDate
            if (payload.services !== undefined) bill.services = payload.services
            if (payload.medications !== undefined) bill.medications = payload.medications
            if (payload.subtotal !== undefined) bill.subtotal = payload.subtotal
            if (payload.taxAmount !== undefined) bill.taxAmount = payload.taxAmount
            if (payload.discountAmount !== undefined) bill.discountAmount = payload.discountAmount
            if (payload.totalAmount !== undefined) bill.totalAmount = payload.totalAmount
            if (payload.paidAmount !== undefined) bill.paidAmount = payload.paidAmount
            if (payload.status !== undefined) bill.status = payload.status
            if (payload.paymentMethod !== undefined) bill.paymentMethod = payload.paymentMethod || null
            if (payload.insuranceDetails !== undefined) bill.insuranceDetails = payload.insuranceDetails
            if (payload.notes !== undefined) bill.notes = payload.notes || null

            // Recalculate outstanding amount
            bill.outstandingAmount = bill.totalAmount - bill.paidAmount

            await bill.save()

            await bill.load('patient')

            return response.status(200).json({
                success: true,
                data: bill,
                message: 'Bill updated successfully'
            })

        } catch (error) {
            console.error('Bill update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating bill'
            })
        }
    }

    /**
     * Delete bill
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const bill = await Bill.find(params.id)

            if (!bill) {
                return response.status(404).json({
                    success: false,
                    message: 'Bill not found'
                })
            }

            await bill.delete()

            return response.status(200).json({
                success: true,
                message: 'Bill deleted successfully'
            })

        } catch (error) {
            console.error('Bill destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting bill'
            })
        }
    }

    /**
     * Pay bill
     */
    async pay({ params, request, response }: HttpContext) {
        try {
            const bill = await Bill.find(params.id)

            if (!bill) {
                return response.status(404).json({
                    success: false,
                    message: 'Bill not found'
                })
            }

            const amount = request.input('amount')
            const paymentMethod = request.input('paymentMethod')

            if (!amount || amount <= 0) {
                return response.status(400).json({
                    success: false,
                    message: 'Valid payment amount is required'
                })
            }

            const newPaidAmount = bill.paidAmount + amount

            if (newPaidAmount > bill.totalAmount) {
                return response.status(400).json({
                    success: false,
                    message: 'Payment amount exceeds total bill amount'
                })
            }

            bill.paidAmount = newPaidAmount
            bill.paymentMethod = paymentMethod || bill.paymentMethod
            bill.outstandingAmount = bill.totalAmount - newPaidAmount

            // Update status based on payment
            if (newPaidAmount >= bill.totalAmount) {
                bill.status = 'paid'
            } else if (newPaidAmount > 0) {
                bill.status = 'partial'
            }

            await bill.save()
            await bill.load('patient')

            return response.status(200).json({
                success: true,
                data: bill,
                message: 'Payment processed successfully'
            })

        } catch (error) {
            console.error('Bill payment error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while processing payment'
            })
        }
    }

    /**
     * Get bill summary/statistics
     */
    async summary({ request, response }: HttpContext) {
        try {
            const startDate = request.input('startDate')
            const endDate = request.input('endDate')

            let query = Bill.query()

            if (startDate && endDate) {
                query = query.whereBetween('bill_date', [startDate, endDate])
            }

            const totalBills = await query.clone().count('* as total')
            const totalAmount = await query.clone().sum('total_amount as amount')
            const totalPaid = await query.clone().sum('paid_amount as amount')
            const pendingBills = await query.clone().where('status', 'pending').count('* as total')
            const overdueBills = await query.clone()
                .where('status', '!=', 'paid')
                .where('due_date', '<', DateTime.now().toSQLDate())
                .count('* as total')

            const summary = {
                totalBills: totalBills[0].$extras.total,
                totalAmount: totalAmount[0].$extras.amount || 0,
                totalPaid: totalPaid[0].$extras.amount || 0,
                pendingBills: pendingBills[0].$extras.total,
                overdueBills: overdueBills[0].$extras.total,
                outstandingAmount: (totalAmount[0].$extras.amount || 0) - (totalPaid[0].$extras.amount || 0)
            }

            return response.status(200).json({
                success: true,
                data: summary,
                message: 'Bill summary retrieved successfully'
            })

        } catch (error) {
            console.error('Bill summary error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving bill summary'
            })
        }
    }
}