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
}

export interface RenalAndUricTest {
  creatinine?: number;
  uricAcid?: number;
  bun?: number;
  egfr?: number;
}

export interface LipidProfileTest {
  totalCholesterol?: number;
  triglycerides?: number;
  hdl?: number;
  ldl?: number;
}

export interface ThyroidFunctionTest {
  tsh?: number;        // Thyroid Stimulating Hormone (µIU/mL or mIU/L, ref: 0.4 - 4.0)
  ft4?: number;        // Free Thyroxine (ng/dL, ref: 0.8 - 1.8)
  ft3?: number;        // Free Triiodothyronine (pg/mL, ref: 2.3 - 4.2)
  totalT4?: number;    // Total T4 (µg/dL, ref: 4.5 - 12.0)
  totalT3?: number;    // Total T3 (ng/dL, ref: 80 - 200)
  antiTpo?: number;    // Anti-Thyroid Peroxidase (IU/mL, ref: < 35)
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
  liver?: LiverFunctionTest;
  renal?: RenalAndUricTest;
  lipid?: LipidProfileTest;
  thyroid?: ThyroidFunctionTest;
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
  author: string;
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

export interface DietRecommendation {
  category: 'hypertension' | 'diabetes' | 'kidney' | 'liver' | 'general';
  titleMm: string;
  subtitleMm: string;
  recommendedFoods: string[];
  foodsToAvoid: string[];
  myanmarMealTips: string[];
  recommendedHydrationLiters: number;
}

