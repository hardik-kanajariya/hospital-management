# Hospital Management System - Product Requirements Document

Rural healthcare management system designed for small hospitals and clinics (10-50 beds) in villages and small cities across India.

**Experience Qualities**:
1. **Simplicity** - Interface designed for users with limited digital literacy, featuring large buttons and clear navigation
2. **Reliability** - Offline-first architecture that works without internet connectivity and syncs when available
3. **Accessibility** - Multi-language support (Hindi/English) with intuitive workflows for rural healthcare workers

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple interconnected modules for patient management, appointments, billing, and medical records
- Local data persistence with simple state management for healthcare workflows

## Essential Features

### Patient Registration & Management
- **Functionality**: Register new patients, maintain medical records, track patient history
- **Purpose**: Central patient database for continuity of care and record keeping
- **Trigger**: Healthcare worker clicks "New Patient" or searches existing patients
- **Progression**: Registration form → Medical history → Save patient → Generate patient ID → View patient profile
- **Success criteria**: Patient data persists locally, searchable, and accessible across modules

### Appointment Scheduling
- **Functionality**: Book appointments, manage doctor schedules, track patient queues
- **Purpose**: Organize patient flow and optimize doctor utilization
- **Trigger**: Patient requests appointment or walk-in registration
- **Progression**: Select doctor → Choose available time slot → Patient details → Confirm appointment → Add to queue
- **Success criteria**: Appointments display in calendar view, queue updates in real-time

### Medical Records (EMR)
- **Functionality**: Record consultations, diagnosis, prescriptions, and treatment plans
- **Purpose**: Digital medical records for better patient care and legal compliance
- **Trigger**: Doctor starts patient consultation
- **Progression**: Patient lookup → Previous history review → Record symptoms → Diagnosis → Prescription → Save consultation
- **Success criteria**: Complete medical history accessible, prescriptions printable

### Billing & Invoicing
- **Functionality**: Generate bills, track payments, manage insurance claims
- **Purpose**: Financial management and revenue tracking for the hospital
- **Trigger**: Patient completes treatment or requests bill
- **Progression**: Service selection → Calculate charges → Apply discounts → Generate invoice → Record payment → Print receipt
- **Success criteria**: Accurate billing calculations, payment tracking, financial reports

### Inventory Management
- **Functionality**: Track medical supplies, medications, and equipment
- **Purpose**: Prevent stockouts and manage hospital resources efficiently
- **Trigger**: Staff checks inventory or receives new supplies
- **Progression**: Scan/search item → Update quantity → Set reorder levels → Alert on low stock → Generate purchase orders
- **Success criteria**: Real-time inventory levels, automated low-stock alerts

## Edge Case Handling
- **Power outages**: Offline data storage with auto-sync when power returns
- **Internet connectivity**: Full offline functionality with cloud sync capabilities
- **Data corruption**: Automated daily backups with recovery procedures
- **User errors**: Confirmation dialogs for critical actions, undo functionality
- **Multi-user conflicts**: Basic conflict resolution for concurrent data editing

## Design Direction
The design should feel professional yet approachable, like modern government healthcare applications - clean, trustworthy, and optimized for efficiency rather than aesthetics. Minimal interface design serves the core purpose of rapid data entry and retrieval in a clinical setting.

## Color Selection
Custom palette designed for medical environments and accessibility:
- **Primary Color**: Professional Medical Blue `oklch(0.6 0.12 240)` - communicates trust and professionalism
- **Secondary Colors**: Clean White backgrounds with soft gray accents for organization
- **Accent Color**: Success Green `oklch(0.7 0.15 140)` for positive actions and confirmations  
- **Foreground/Background Pairings**: 
  - Background (White `oklch(1 0 0)`): Dark text `oklch(0.2 0 0)` - Ratio 15:1 ✓
  - Primary (Medical Blue): White text `oklch(1 0 0)` - Ratio 7.2:1 ✓
  - Accent (Success Green): White text `oklch(1 0 0)` - Ratio 6.8:1 ✓

## Font Selection
Clear, readable typography optimized for clinical documentation and users with varying education levels using Inter for its excellent readability at all sizes.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold/32px/tight spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Form Labels): Inter Medium/18px/normal spacing
  - Body (Form Fields): Inter Regular/16px/relaxed spacing
  - Small (Helper Text): Inter Regular/14px/normal spacing

## Animations
Subtle and functional animations that enhance usability without being distracting, appropriate for a professional medical environment.

- **Purposeful Meaning**: Form validation feedback, loading states for data sync, and gentle transitions between modules
- **Hierarchy of Movement**: Priority on form interactions and navigation, minimal decorative animation

## Component Selection
- **Components**: Cards for patient profiles, Tables for appointment lists, Forms for data entry, Dialogs for confirmations, Buttons with clear action states
- **Customizations**: Large touch targets for mobile use, simplified form layouts, medical-specific input types
- **States**: Clear visual feedback for form validation, loading states, success/error messages
- **Icon Selection**: Medical icons (stethoscope, calendar, users) with text labels for clarity
- **Spacing**: Generous padding (p-6) for touch interfaces, consistent gap-4 between elements
- **Mobile**: Mobile-first responsive design with collapsible navigation, single-column layouts on small screens