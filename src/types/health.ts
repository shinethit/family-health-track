export type UserRole = 'patient' | 'admin';

export type BloodPressureCategory = 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis' | string;
export type BloodSugarType = 'fasting' | 'before_meal' | 'post_meal_2h' | 'post_prandial' | 'bedtime' | 'random' | 'hba1c' | string;
export type GlucoseStatus = 'low' | 'normal' | 'pre_diabetic' | 'diabetic' | 'high' | 'high_danger' | 'critical' | string;
export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2' | string;

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  dateOfBirth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  waistCm?: number;
  bmi?: number;
  bloodType?: string;
  phone?: string;
  chronicConditions?: string[];
  allergies?: string[];
  emergencyContact?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BloodPressureRecord {
  id: string;
  userId: string;
  patientName?: string;
  patientEmail?: string;
  userEmail?: string;
  userName?: string;
  timestamp?: string;
  date?: string;
  recordedAt?: string;
  systolic: number;
  diastolic: number;
  pulseRate?: number;
  pulse?: number;
  arm?: 'left' | 'right';
  posture?: 'sitting' | 'standing' | 'lying';
  dietNotes?: string;
  foodIntake?: string;
  dietRecord?: string;
  notes?: string;
  category?: BloodPressureCategory;
  condition?: string;
  recordedBy?: string;
  createdAt?: string;
}

export interface BloodSugarRecord {
  id: string;
  userId: string;
  patientName?: string;
  patientEmail?: string;
  userEmail?: string;
  userName?: string;
  timestamp?: string;
  date?: string;
  recordedAt?: string;
  glucoseValue?: number;
  value?: number;
  timing?: BloodSugarType;
  type?: BloodSugarType;
  mealInfo?: string;
  dietNotes?: string;
  foodIntake?: string;
  dietRecord?: string;
  hba1c?: number;
  notes?: string;
  status?: GlucoseStatus;
  createdAt?: string;
}

export interface BMIRecord {
  id: string;
  userId: string;
  patientName?: string;
  patientEmail?: string;
  userEmail?: string;
  userName?: string;
  timestamp?: string;
  date?: string;
  recordedAt?: string;
  dateOfBirth?: string;
  ageYears?: number;
  ageMonths?: number;
  ageDays?: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  category: BMICategory;
  idealWeightRange?: { minKg?: number; maxKg?: number; min?: number; max?: number };
  waistCircumferenceCm?: number;
  waistCm?: number;
  notes?: string;
  createdAt?: string;
}

export interface CBCTest {
  hemoglobin?: number;       // g/dL (ref: 12 - 17)
  wbc?: number;              // /µL (ref: 4,000 - 11,000)
  platelets?: number;        // /µL (ref: 150,000 - 450,000)
  rbc?: number;              // 10^6/µL (ref: 4.0 - 5.9)
  pcv_hematocrit?: number;   // % (ref: 36 - 50)
  esr?: number;              // mm/1st hr (ref: 0 - 20)
  neutrophils?: number;      // % (ref: 40 - 75)
  lymphocytes?: number;      // % (ref: 20 - 45)
}

export interface GlucosePanelTest {
  fbs?: number;              // Fasting Blood Sugar, mg/dL (ref: 70 - 99)
  ppbs?: number;             // 2-hr Postprandial, mg/dL (ref: < 140)
  rbs?: number;              // Random Blood Sugar, mg/dL (ref: < 140)
  hba1c?: number;            // Glycated Hemoglobin, % (ref: < 5.7)
}

export interface LiverFunctionTest {
  alt?: number;
  alt_sgpt?: number;
  ast?: number;
  ast_sgot?: number;
  totalBilirubin?: number;
  directBilirubin?: number;
  alp?: number;
  albumin?: number;
  totalProtein?: number;
  globulin?: number;
}

export interface RenalAndUricTest {
  creatinine?: number;
  uricAcid?: number;
  bun?: number;
  egfr?: number;
  sodium?: number;           // Na+, mEq/L (ref: 135 - 145)
  potassium?: number;        // K+, mEq/L (ref: 3.5 - 5.0)
  chloride?: number;         // Cl-, mEq/L (ref: 96 - 106)
}

export interface LipidProfileTest {
  totalCholesterol?: number;
  triglycerides?: number;
  hdl?: number;
  ldl?: number;
  vldl?: number;
}

export interface ThyroidFunctionTest {
  tsh?: number;        // Thyroid Stimulating Hormone (µIU/mL or mIU/L, ref: 0.4 - 4.0)
  ft4?: number;        // Free Thyroxine (ng/dL, ref: 0.8 - 1.8)
  ft3?: number;        // Free Triiodothyronine (pg/mL, ref: 2.3 - 4.2)
  totalT4?: number;    // Total T4 (µg/dL, ref: 4.5 - 12.0)
  totalT3?: number;    // Total T3 (ng/dL, ref: 80 - 200)
  antiTpo?: number;    // Anti-Thyroid Peroxidase (IU/mL, ref: < 35)
}

export interface UrineRoutineTest {
  protein?: string;          // Negative, Trace, 1+, 2+, 3+
  glucose?: string;          // Negative, Trace, 1+, 2+
  pusCells?: string;         // /HPF (ref: 0 - 5)
  rbc?: string;              // /HPF (ref: 0 - 2)
  epithelial?: string;       // /HPF (ref: 0 - 5)
  microalbumin?: number;     // mg/g Cr (ref: < 30)
}

export interface InflammatoryAndVitaminsTest {
  crp?: number;              // C-Reactive Protein, mg/L (ref: < 5.0)
  ferritin?: number;         // Serum Ferritin, ng/mL (ref: 20 - 250)
  vitaminD?: number;         // 25-OH Vit D, ng/mL (ref: 30 - 100)
  vitaminB12?: number;       // Vitamin B12, pg/mL (ref: 200 - 900)
}

export interface RecordedLabItem {
  id: string;                    // Test unique key (e.g. 'alt_sgpt', 'fbs')
  nameMm: string;                // Myanmar display name (e.g. 'SGPT / ALT (အသည်းအင်ဇိုင်း)')
  nameEn: string;                // English name (e.g. 'SGPT / ALT')
  category: string;              // Category code (e.g. 'liver', 'renal', 'cbc')
  categoryLabelMm: string;       // Category label in MM (e.g. 'အသည်းလုပ်ဆောင်ချက်')
  value: number;                 // Numeric test result
  unit: string;                  // Test unit (e.g. 'U/L', 'mg/dL')
  refMin?: number;               // Effective lower reference bound
  refMax?: number;               // Effective upper reference bound
  refRangeText?: string;         // Human-readable reference range (e.g. '7 - 56 U/L')
  isCustomRef?: boolean;         // True if user adjusted the reference range to match their lab
  status: 'normal' | 'low' | 'high' | 'critical';
  statusLabelMm: string;         // e.g. 'ပုံမှန်', 'များနေသည်', 'နည်းနေသည်', 'အလွန်မြင့်'
}

export interface LabTestRecord {
  id: string;
  userId: string;
  patientName?: string;
  patientEmail?: string;
  userEmail?: string;
  userName?: string;
  recordedAt?: string;
  testDate: string;
  labName: string;
  // Specific tests recorded (only the tests the user actually entered!)
  tests?: RecordedLabItem[];
  cbc?: CBCTest;
  glucose?: GlucosePanelTest;
  liver?: LiverFunctionTest;
  renal?: RenalAndUricTest;
  lipid?: LipidProfileTest;
  thyroid?: ThyroidFunctionTest;
  urine?: UrineRoutineTest;
  inflammatory?: InflammatoryAndVitaminsTest;
  notes?: string;
  doctorReview?: string;
  createdAt?: string;
}

export interface Medication {
  id: string;
  userId: string;
  patientName?: string;
  patientEmail?: string;
  userEmail?: string;
  userName?: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  timing: 'before_meal' | 'after_meal' | 'with_meal' | 'bedtime' | 'anytime';
  prescribedFor: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
  prescribingDoctor?: string;
  createdAt?: string;
}

export interface DoctorAdvice {
  id: string;
  userId: string;
  patientName: string;
  doctorEmail: string;
  doctorName: string;
  advice: string;
  dietRecommendation?: string;
  date: string;
  createdAt?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  chronicConditions: string[];
  avatarColor?: string;
  notes?: string;
}

export type NotificationType = 'medication' | 'vital_check' | 'abnormal_alert' | 'doctor_advice' | 'custom_reminder' | 'qa_answered';

export interface AppNotification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: {
    medicationId?: string;
    medicationName?: string;
    dosage?: string;
    scheduledTime?: string;
    vitalType?: 'bp' | 'glucose' | 'bmi';
    value?: string;
    actionUrl?: string;
    takenAt?: string;
    questionId?: string;
    userId?: string;
  };
}

export interface CustomReminder {
  id: string;
  userId?: string;
  title: string;
  category: 'medication' | 'bp' | 'glucose' | 'water' | 'exercise' | 'doctor' | 'other';
  time: string;
  daysOfWeek: number[];
  isActive: boolean;
  notes?: string;
  createdAt?: string;
}

export interface DoctorAnswer {
  answeredBy: string;
  answerText: string;
  recommendations: string[];
  suggestedAction?: string;
  answeredAt: string;
}

export interface DoctorQuestion {
  id: string;
  userId: string;
  patientName: string;
  patientEmail?: string;
  category: 'bp' | 'diabetes' | 'liver_kidney' | 'medication' | 'general' | 'emergency';
  title: string;
  questionDetails: string;
  duration?: string;
  recentBP?: string;
  recentSugar?: string;
  currentMedications?: string;
  urgency: 'routine' | 'moderate' | 'urgent';
  status: 'pending' | 'answered' | 'closed';
  doctorAnswer?: DoctorAnswer;
  createdAt: string;
  updatedAt?: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: 'bp' | 'diabetes' | 'liver' | 'kidney' | 'heart' | 'nutrition' | 'exercise' | 'general' | 'vaccine' | 'thyroid' | 'elderly' | string;
  summary: string;
  content: string[];
  readingTime: string;
  publishedDate: string;
  author?: string;
  tags: string[];
  keyTakeaways: string[];
  badgeColor?: string;
}

export interface VaccinationRecord {
  id: string;
  userId: string;
  patientName?: string;
  vaccineName: string;
  targetDisease: string;
  doseNumber: number;
  totalDoses: number;
  dateAdministered?: string;
  nextDueDate?: string;
  administeredBy?: string;
  batchNumber?: string;
  status: 'completed' | 'scheduled' | 'overdue';
  category: 'adult' | 'child' | 'travel';
  notes?: string;
  createdAt?: string;
}

export interface EmergencyProfile {
  id: string;
  userId: string;
  patientName: string;
  dateOfBirth?: string;
  bloodType: string; // A+, O+, etc.
  allergies: string[]; // Medication or food allergies
  chronicConditions: string[]; // Hypertension, Diabetes, Asthma, etc.
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactRelation: string;
  secondaryContactName?: string;
  secondaryContactPhone?: string;
  attendingDoctorName?: string;
  attendingDoctorPhone?: string;
  preferredHospital?: string;
  organDonor?: boolean;
  specialInstructions?: string;
  updatedAt?: string;
}

export interface OTCMedicine {
  id: string;
  nameMm: string;
  genericName: string;
  category: 'fever_pain' | 'stomach_gas' | 'allergy_cold' | 'diarrhea_ors' | 'firstaid_topical' | 'cough_phlegm' | string;
  categoryLabelMm: string;
  indications: string[];
  usage: string;
  minDose: string;
  maxDose: string;
  childDose?: string;
  sideEffects: string[];
  precautions: string[];
  drugInteractions: string[];
  foodInteractions: string[];
  badgeColor?: string;
}

export interface BroadcastTicker {
  id: string;
  message: string;
  isActive: boolean;
  type: 'info' | 'warning' | 'urgent';
  createdAt: string;
  createdBy?: string;
}

export interface DietRecommendation {
  category: 'hypertension' | 'diabetes' | 'kidney' | 'liver' | 'general';
  titleMm: string;
  subtitleMm: string;
  recommendedFoods: string[];
  foodsToAvoid: string[];
  myanmarMealTips: string[];
  recommendedHydrationLiters: number;
}

