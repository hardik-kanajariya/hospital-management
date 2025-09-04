import { MultipartFile } from '@adonisjs/core/bodyparser'
import { DateTime } from 'luxon'
import PatientDocument from '#models/patient_document'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'fs/promises'
import path from 'path'
// TODO: Install sharp for image processing: npm install sharp
// import sharp from 'sharp'

interface DocumentUploadResult {
    document: PatientDocument
    url: string
    thumbnailUrl?: string
}

interface DocumentCategory {
    type: string
    subtype: string
    description: string
    requiredFields: string[]
    validExtensions: string[]
    maxSizeBytes: number
}

interface OCRResult {
    text: string
    confidence: number
    entities: Array<{
        type: 'date' | 'name' | 'id' | 'amount' | 'medication' | 'diagnosis'
        value: string
        confidence: number
        position: { x: number, y: number, width: number, height: number }
    }>
}

export default class DocumentService {
    private readonly STORAGE_PATH = app.makePath('storage/uploads/patient-documents')
    private readonly THUMBNAIL_PATH = app.makePath('storage/uploads/thumbnails')
    private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

    private readonly DOCUMENT_CATEGORIES: DocumentCategory[] = [
        {
            type: 'consent',
            subtype: 'treatment',
            description: 'Treatment consent forms',
            requiredFields: ['patient_signature', 'witness_signature'],
            validExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
            maxSizeBytes: 5 * 1024 * 1024
        },
        {
            type: 'insurance',
            subtype: 'card',
            description: 'Insurance card images',
            requiredFields: ['insurance_provider', 'policy_number'],
            validExtensions: ['.jpg', '.jpeg', '.png'],
            maxSizeBytes: 2 * 1024 * 1024
        },
        {
            type: 'id',
            subtype: 'government',
            description: 'Government issued ID',
            requiredFields: ['id_type', 'id_number'],
            validExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
            maxSizeBytes: 3 * 1024 * 1024
        },
        {
            type: 'medical',
            subtype: 'report',
            description: 'Medical reports and test results',
            requiredFields: ['report_date', 'provider_name'],
            validExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
            maxSizeBytes: 10 * 1024 * 1024
        }
    ]

    /**
     * Upload and process patient document
     */
    async uploadDocument(
        patientId: string,
        file: MultipartFile,
        metadata: {
            documentType: string
            documentName: string
            description?: string
            tags?: string[]
            uploadedBy: string
            customMetadata?: Record<string, any>
        }
    ): Promise<DocumentUploadResult> {
        // Validate file
        await this.validateFile(file, metadata.documentType)

        // Ensure storage directories exist
        await this.ensureStorageDirectories()

        // Generate unique filename
        const fileExtension = path.extname(file.clientName || '')
        const uniqueFilename = `${cuid()}_${Date.now()}${fileExtension}`
        const filePath = path.join(this.STORAGE_PATH, uniqueFilename)

        // Move file to storage
        await file.move(this.STORAGE_PATH, {
            name: uniqueFilename,
            overwrite: false
        })

        // Get file stats
        const stats = await fs.stat(filePath)

        // Generate thumbnail for images
        let thumbnailPath: string | undefined
        if (this.isImageFile(fileExtension)) {
            thumbnailPath = await this.generateThumbnail(filePath, uniqueFilename)
        }

        // Perform OCR if applicable
        let ocrResult: OCRResult | undefined
        if (this.shouldPerformOCR(fileExtension, metadata.documentType)) {
            ocrResult = await this.performOCR(filePath)
        }

        // Auto-categorize document
        const category = this.categorizeDocument(metadata.documentName, ocrResult?.text)

        // Compress and optimize if needed
        if (stats.size > 1024 * 1024) { // If larger than 1MB
            await this.optimizeDocument(filePath, fileExtension)
        }

        // Create database record
        const document = new PatientDocument()
        document.patientId = patientId
        document.documentType = metadata.documentType as any
        document.documentName = metadata.documentName
        document.filePath = `patient-documents/${uniqueFilename}`
        document.fileSize = stats.size
        document.mimeType = file.type || 'application/octet-stream'
        document.description = metadata.description || null
        document.uploadedBy = metadata.uploadedBy
        document.isVerified = false
        document.tags = metadata.tags || []
        document.metadata = {
            ...metadata.customMetadata,
            originalFilename: file.clientName,
            uploadDate: DateTime.now().toISO(),
            hasOCR: !!ocrResult,
            hasThumbnail: !!thumbnailPath,
            category: category,
            ...(ocrResult && { ocrData: ocrResult })
        }

        await document.save()

        return {
            document,
            url: `/api/documents/${document.id}`,
            thumbnailUrl: thumbnailPath ? `/api/documents/${document.id}/thumbnail` : undefined
        }
    }

    /**
     * Get document with version history
     */
    async getDocumentWithVersions(documentId: string): Promise<{
        document: PatientDocument
        versions: PatientDocument[]
        currentVersion: number
    }> {
        const document = await PatientDocument.findOrFail(documentId)

        // Find all versions of this document
        const versions = await PatientDocument.query()
            .where('patient_id', document.patientId)
            .where('document_name', document.documentName)
            .orderBy('created_at', 'asc')

        const currentVersionIndex = versions.findIndex(v => v.id === document.id)

        return {
            document,
            versions,
            currentVersion: currentVersionIndex + 1
        }
    }

    /**
     * Create new version of existing document
     */
    async createDocumentVersion(
        originalDocumentId: string,
        file: MultipartFile,
        metadata: { uploadedBy: string, versionNotes?: string }
    ): Promise<DocumentUploadResult> {
        const originalDocument = await PatientDocument.findOrFail(originalDocumentId)

        // Archive the current version
        originalDocument.metadata = {
            ...originalDocument.metadata,
            archivedAt: DateTime.now().toISO(),
            replacedBy: 'pending'
        }
        await originalDocument.save()

        // Upload new version
        const result = await this.uploadDocument(
            originalDocument.patientId,
            file,
            {
                documentType: originalDocument.documentType,
                documentName: originalDocument.documentName,
                description: originalDocument.description || undefined,
                tags: originalDocument.tags,
                uploadedBy: metadata.uploadedBy,
                customMetadata: {
                    ...originalDocument.metadata,
                    versionOf: originalDocumentId,
                    versionNotes: metadata.versionNotes,
                    previousVersion: originalDocument.id
                }
            }
        )

        // Update the archived document to reference the new version
        originalDocument.metadata = {
            ...originalDocument.metadata,
            replacedBy: result.document.id
        }
        await originalDocument.save()

        return result
    }

    /**
     * Perform OCR on document
     */
    async performOCR(filePath: string): Promise<OCRResult> {
        // This is a simplified OCR implementation
        // In a real application, you would use services like:
        // - Google Cloud Vision API
        // - Amazon Textract
        // - Microsoft Cognitive Services
        // - Tesseract.js for local processing

        try {
            // Simulate OCR processing
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Mock OCR result based on file name patterns
            const filename = path.basename(filePath).toLowerCase()
            let mockText = 'Document text could not be extracted'
            const entities: OCRResult['entities'] = []

            if (filename.includes('insurance')) {
                mockText = 'INSURANCE CARD\nPolicy Number: INS123456789\nGroup Number: GRP001\nMember Name: John Doe\nEffective Date: 01/01/2024'
                entities.push(
                    { type: 'id', value: 'INS123456789', confidence: 0.95, position: { x: 100, y: 50, width: 150, height: 20 } },
                    { type: 'name', value: 'John Doe', confidence: 0.98, position: { x: 100, y: 80, width: 100, height: 20 } },
                    { type: 'date', value: '01/01/2024', confidence: 0.92, position: { x: 100, y: 110, width: 80, height: 20 } }
                )
            } else if (filename.includes('prescription') || filename.includes('rx')) {
                mockText = 'PRESCRIPTION\nPatient: John Doe\nMedication: Lisinopril 10mg\nQuantity: 30 tablets\nRefills: 2\nPrescriber: Dr. Smith'
                entities.push(
                    { type: 'medication', value: 'Lisinopril 10mg', confidence: 0.96, position: { x: 100, y: 60, width: 120, height: 20 } },
                    { type: 'name', value: 'Dr. Smith', confidence: 0.94, position: { x: 100, y: 120, width: 80, height: 20 } }
                )
            } else if (filename.includes('lab') || filename.includes('test')) {
                mockText = 'LAB RESULTS\nPatient: John Doe\nTest Date: 03/15/2024\nGlucose: 95 mg/dL\nCholesterol: 180 mg/dL\nHemoglobin A1C: 5.2%'
                entities.push(
                    { type: 'date', value: '03/15/2024', confidence: 0.97, position: { x: 100, y: 40, width: 80, height: 20 } }
                )
            }

            return {
                text: mockText,
                confidence: 0.95,
                entities
            }
        } catch (error) {
            console.error('OCR processing failed:', error)
            return {
                text: '',
                confidence: 0,
                entities: []
            }
        }
    }

    /**
     * Auto-categorize document based on content
     */
    categorizeDocument(filename: string, ocrText?: string): string {
        const content = `${filename} ${ocrText || ''}`.toLowerCase()

        if (content.includes('insurance') || content.includes('policy')) {
            return 'insurance_card'
        } else if (content.includes('prescription') || content.includes('medication')) {
            return 'prescription'
        } else if (content.includes('lab') || content.includes('test') || content.includes('result')) {
            return 'lab_result'
        } else if (content.includes('consent') || content.includes('agreement')) {
            return 'consent_form'
        } else if (content.includes('id') || content.includes('license') || content.includes('passport')) {
            return 'identification'
        } else if (content.includes('discharge') || content.includes('summary')) {
            return 'discharge_summary'
        } else if (content.includes('imaging') || content.includes('xray') || content.includes('mri')) {
            return 'imaging_report'
        }

        return 'general_document'
    }

    /**
     * Generate thumbnail for image files
     */
    private async generateThumbnail(filePath: string, filename: string): Promise<string> {
        const thumbnailFilename = `thumb_${filename}`
        const thumbnailPath = path.join(this.THUMBNAIL_PATH, thumbnailFilename)

        try {
            // TODO: Implement thumbnail generation when sharp is installed
            // await sharp(filePath)
            //     .resize(200, 200, {
            //         fit: 'inside',
            //         withoutEnlargement: true
            //     })
            //     .jpeg({ quality: 80 })
            //     .toFile(thumbnailPath)

            // For now, just copy the original file as thumbnail
            await fs.copyFile(filePath, thumbnailPath)

            return `thumbnails/${thumbnailFilename}`
        } catch (error) {
            console.error('Thumbnail generation failed:', error)
            throw new Error('Failed to generate thumbnail')
        }
    }

    /**
     * Optimize document size
     */
    private async optimizeDocument(_filePath: string, extension: string): Promise<void> {
        if (this.isImageFile(extension)) {
            try {
                // TODO: Implement image optimization when sharp is installed
                // await sharp(filePath)
                //     .jpeg({ quality: 85, progressive: true })
                //     .toFile(`${filePath}.optimized`)

                // Replace original with optimized version
                // await fs.rename(`${filePath}.optimized`, filePath)

                console.log('Image optimization skipped - sharp not installed')
            } catch (error) {
                console.error('Image optimization failed:', error)
            }
        }
        // For PDFs and other documents, you could use tools like:
        // - Ghostscript for PDF compression
        // - ImageMagick for various formats
    }

    /**
     * Validate uploaded file
     */
    private async validateFile(file: MultipartFile, documentType: string): Promise<void> {
        if (!file) {
            throw new Error('No file provided')
        }

        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`)
        }

        // Check file extension
        const extension = path.extname(file.clientName || '').toLowerCase()
        const category = this.DOCUMENT_CATEGORIES.find(c => c.type === documentType)

        if (category && !category.validExtensions.includes(extension)) {
            throw new Error(`Invalid file type. Allowed extensions: ${category.validExtensions.join(', ')}`)
        }

        // Check MIME type
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]

        if (file.type && !allowedMimeTypes.includes(file.type)) {
            throw new Error(`Invalid MIME type: ${file.type}`)
        }
    }

    /**
     * Ensure storage directories exist
     */
    private async ensureStorageDirectories(): Promise<void> {
        try {
            await fs.mkdir(this.STORAGE_PATH, { recursive: true })
            await fs.mkdir(this.THUMBNAIL_PATH, { recursive: true })
        } catch (error) {
            console.error('Failed to create storage directories:', error)
            throw new Error('Storage initialization failed')
        }
    }

    /**
     * Check if file is an image
     */
    private isImageFile(extension: string): boolean {
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension.toLowerCase())
    }

    /**
     * Check if OCR should be performed
     */
    private shouldPerformOCR(extension: string, documentType: string): boolean {
        const ocrExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.tiff']
        const ocrDocumentTypes = ['insurance', 'id', 'medical', 'consent']

        return ocrExtensions.includes(extension.toLowerCase()) &&
            ocrDocumentTypes.includes(documentType)
    }

    /**
     * Track document expiry and send alerts
     */
    async checkExpiringDocuments(daysBeforeExpiry: number = 30): Promise<PatientDocument[]> {
        const expiryDate = DateTime.now().plus({ days: daysBeforeExpiry })

        return PatientDocument.query()
            .whereNotNull('expiry_date')
            .where('expiry_date', '<=', expiryDate.toJSDate())
            .where('is_verified', true)
            .preload('patient')
    }

    /**
     * Bulk document operations
     */
    async bulkUpdateDocuments(
        documentIds: string[],
        updates: { isVerified?: boolean, tags?: string[], metadata?: Record<string, any> }
    ): Promise<void> {
        await PatientDocument.query()
            .whereIn('id', documentIds)
            .update(updates)
    }
}
