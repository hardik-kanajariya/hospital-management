import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import Bed from './bed.js'
import User from './user.js'
import UserRoleData from './user_role_data.js'
import AdmissionCharge from './admission_charge.js'
import { v4 as uuid } from 'uuid'

export default class Admission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'admission_number' })
  declare admissionNumber: string

  @column({ columnName: 'patient_id' })
  declare patientId: string

  @column({ columnName: 'bed_id' })
  declare bedId: string

  @column({ columnName: 'admitting_doctor_id' })
  declare admittingDoctorId: string

  @column.dateTime({ columnName: 'admission_date' })
  declare admissionDate: DateTime

  @column.dateTime({ columnName: 'expected_discharge_date' })
  declare expectedDischargeDate: DateTime | null

  @column.dateTime({ columnName: 'actual_discharge_date' })
  declare actualDischargeDate: DateTime | null

  @column()
  declare status: 'active' | 'discharged' | 'transferred'

  @column({ columnName: 'chief_complaint' })
  declare chiefComplaint: string | null

  @column()
  declare diagnosis: string | null

  @column({ columnName: 'admission_notes' })
  declare admissionNotes: string | null

  @column({ columnName: 'discharge_notes' })
  declare dischargeNotes: string | null

  @column({ columnName: 'discharge_type' })
  declare dischargeType: string | null

  @column({ columnName: 'transferred_to_bed_id' })
  declare transferredToBedId: string | null

  @column({ columnName: 'created_by' })
  declare createdBy: string

  @column({ columnName: 'updated_by' })
  declare updatedBy: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @belongsTo(() => Bed)
  declare bed: BelongsTo<typeof Bed>

  @belongsTo(() => UserRoleData, {
    foreignKey: 'admittingDoctorId',
  })
  declare admittingDoctor: BelongsTo<typeof UserRoleData>

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updatedBy',
  })
  declare updater: BelongsTo<typeof User>

  @hasMany(() => AdmissionCharge)
  declare charges: HasMany<typeof AdmissionCharge>

  @computed()
  get lengthOfStay() {
    const endDate = this.actualDischargeDate || DateTime.now()
    return Math.ceil(endDate.diff(this.admissionDate, 'days').days)
  }

  @computed()
  get totalCharges() {
    if (!this.charges) return 0
    return this.charges.reduce((sum, charge) => sum + Number(charge.totalAmount), 0)
  }

  @beforeCreate()
  static async generateAdmissionNumber(admission: Admission) {
    // Generate UUID for primary key
    admission.id = uuid()
    
    // Generate admission number
    const year = DateTime.now().year
    const lastAdmission = await Admission.query()
      .where('admission_number', 'like', `ADM${year}%`)
      .orderBy('created_at', 'desc')
      .first()

    let nextNumber = 1
    if (lastAdmission) {
      const lastNumber = parseInt(lastAdmission.admissionNumber.replace(`ADM${year}`, ''))
      nextNumber = lastNumber + 1
    }

    admission.admissionNumber = `ADM${year}${nextNumber.toString().padStart(6, '0')}`
  }

  async discharge(dischargeNotes: string, dischargeType: string, userId: string) {
    this.actualDischargeDate = DateTime.now()
    this.dischargeNotes = dischargeNotes
    this.dischargeType = dischargeType
    this.status = 'discharged'
    this.updatedBy = userId
    await this.save()

    // Mark bed as available
    const bed = await Bed.find(this.bedId)
    if (bed) {
      await bed.markAsAvailable()
    }
  }

  async transfer(newBedId: string, userId: string) {
    const oldBed = await Bed.find(this.bedId)
    
    this.transferredToBedId = this.bedId
    this.bedId = newBedId
    this.status = 'transferred'
    this.updatedBy = userId
    await this.save()

    // Update old bed
    if (oldBed) {
      await oldBed.markAsAvailable()
    }

    // Update new bed
    const newBed = await Bed.find(newBedId)
    if (newBed) {
      await newBed.markAsOccupied(this.patientId, this.admissionDate, this.expectedDischargeDate || undefined)
    }

    // Create new admission for the new bed
    const newAdmission = await Admission.create({
      patientId: this.patientId,
      bedId: newBedId,
      admittingDoctorId: this.admittingDoctorId,
      admissionDate: DateTime.now(),
      expectedDischargeDate: this.expectedDischargeDate,
      status: 'active',
      chiefComplaint: this.chiefComplaint,
      diagnosis: this.diagnosis,
      admissionNotes: `Transferred from bed ${oldBed?.bedNumber}. ${this.admissionNotes || ''}`,
      createdBy: userId,
    })

    return newAdmission
  }

  async addCharge(chargeData: Partial<AdmissionCharge>) {
    return await AdmissionCharge.create({
      ...chargeData,
      admissionId: this.id,
    })
  }

  async calculateDailyRoomCharges() {
    const bed = await Bed.query()
      .where('id', this.bedId)
      .preload('room')
      .first()

    const days = this.lengthOfStay
    const dailyRate = bed?.room?.dailyRate || bed?.dailyRate || 0
    const totalRoomCharges = days * dailyRate

    // Check if room charge for today already exists
    const today = DateTime.now().toFormat('yyyy-MM-dd')
    const existingCharge = await AdmissionCharge.query()
      .where('admission_id', this.id)
      .where('charge_type', 'room')
      .where('charge_date', today)
      .first()

    if (!existingCharge) {
      await this.addCharge({
        chargeType: 'room',
        description: `Room charges for ${days} day(s)`,
        amount: dailyRate,
        quantity: days,
        totalAmount: totalRoomCharges,
        chargeDate: DateTime.now(),
        isBillable: true,
        createdBy: this.createdBy,
      })
    }

    return totalRoomCharges
  }
}
