import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Droplets,
  Activity,
  Heart,
  FileText,
  RotateCcw,
  TestTube2,
  Dna,
  Edit3,
  Search,
  Check,
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { LabTestRecord, RecordedLabItem } from '../../types/health';
import { evaluateCustomLabValue, evaluateThyroidFunction } from '../../lib/medicalCalculations';

export type LabCategory = 'all' | 'cbc' | 'glucose' | 'liver' | 'renal' | 'lipid' | 'thyroid' | 'urine' | 'inflammatory';

export interface LabTestDef {
  id: string;
  nameMm: string;
  nameEn: string;
  category: 'cbc' | 'glucose' | 'liver' | 'renal' | 'lipid' | 'thyroid' | 'urine' | 'inflammatory';
  categoryLabelMm: string;
  unit: string;
  defaultMin?: number;
  defaultMax?: number;
  defaultRefText: string;
  step?: string;
  descriptionMm?: string;
}

// Master standard catalog of clinical lab tests
export const MASTER_LAB_TESTS: LabTestDef[] = [
  // 1. Complete Blood Count (CBC)
  {
    id: 'hemoglobin',
    nameMm: 'ဟေမိုဂလိုဘင် (Hb သွေးအား)',
    nameEn: 'Hemoglobin (Hb)',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: 'g/dL',
    defaultMin: 12.0,
    defaultMax: 17.0,
    defaultRefText: '12 - 17 g/dL',
    step: '0.1',
    descriptionMm: 'သွေးအားနည်းရောဂါ ရှိမရှိ အဓိက စစ်ဆေးချက်'
  },
  {
    id: 'wbc',
    nameMm: 'သွေးဖြူဥ စုစုပေါင်း (Total WBC)',
    nameEn: 'Total WBC Count',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: '/µL',
    defaultMin: 4000,
    defaultMax: 11000,
    defaultRefText: '4,000 - 11,000 /µL',
    step: '100',
    descriptionMm: 'ပိုးဝင်ခြင်းနှင့် ရောင်ရမ်းမှု အခြေအနေ'
  },
  {
    id: 'platelets',
    nameMm: 'သွေးဥမွှား (Platelets)',
    nameEn: 'Platelet Count',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: '/µL',
    defaultMin: 150000,
    defaultMax: 450000,
    defaultRefText: '150,000 - 450,000 /µL',
    step: '1000',
    descriptionMm: 'သွေးခဲစနစ်နှင့် သွေးလွန်တုပ်ကွေး စောင့်ကြည့်ရန်'
  },
  {
    id: 'rbc',
    nameMm: 'သွေးနီဥ အရေအတွက် (RBC)',
    nameEn: 'Red Blood Cells (RBC)',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: '10^6/µL',
    defaultMin: 4.0,
    defaultMax: 5.9,
    defaultRefText: '4.0 - 5.9 10^6/µL',
    step: '0.01',
    descriptionMm: 'အောက်ဆီဂျင် သယ်ယူနိုင်စွမ်း'
  },
  {
    id: 'pcv_hematocrit',
    nameMm: 'PCV / Hematocrit (%)',
    nameEn: 'Hematocrit (PCV)',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: '%',
    defaultMin: 36.0,
    defaultMax: 50.0,
    defaultRefText: '36 - 50 %',
    step: '0.1',
    descriptionMm: 'သွေးဆဲလ် ပျစ်ခဲမှု ရာခိုင်နှုန်း'
  },
  {
    id: 'esr',
    nameMm: 'ESR (၁ နာရီ သွေးကျနှုန်း)',
    nameEn: 'ESR (1st Hour)',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: 'mm/hr',
    defaultMin: 0,
    defaultMax: 20,
    defaultRefText: '0 - 20 mm/hr',
    step: '1',
    descriptionMm: 'ခန္ဓာကိုယ်တွင်း ရောင်ရမ်းမှု စစ်ဆေးချက်'
  },
  {
    id: 'neutrophils',
    nameMm: 'Neutrophils (%)',
    nameEn: 'Neutrophils',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: '%',
    defaultMin: 40,
    defaultMax: 75,
    defaultRefText: '40 - 75 %',
    step: '1',
    descriptionMm: 'ဘက်တီးရီးယား ပိုးဝင်မှု တုံ့ပြန်ဆဲလ်'
  },
  {
    id: 'lymphocytes',
    nameMm: 'Lymphocytes (%)',
    nameEn: 'Lymphocytes',
    category: 'cbc',
    categoryLabelMm: 'သွေးဆဲလ်အစုံ (CBC)',
    unit: '%',
    defaultMin: 20,
    defaultMax: 45,
    defaultRefText: '20 - 45 %',
    step: '1',
    descriptionMm: 'ဗိုင်းရပ်စ် ခုခံအားဆဲလ်'
  },

  // 2. Glucose & Diabetes
  {
    id: 'fbs',
    nameMm: 'အစာမစားမီ သကြားဓာတ် (FBS)',
    nameEn: 'Fasting Blood Sugar (FBS)',
    category: 'glucose',
    categoryLabelMm: 'ဆီးချို/သကြားဓာတ်',
    unit: 'mg/dL',
    defaultMin: 70,
    defaultMax: 99,
    defaultRefText: '70 - 99 mg/dL',
    step: '1',
    descriptionMm: 'အနည်းဆုံး ၈ နာရီ အစာငတ်ပြီး စစ်ဆေးချက်'
  },
  {
    id: 'ppbs',
    nameMm: 'အစာစားပြီး ၂ နာရီ သကြား (PPBS)',
    nameEn: '2-Hour Postprandial (PPBS)',
    category: 'glucose',
    categoryLabelMm: 'ဆီးချို/သကြားဓာတ်',
    unit: 'mg/dL',
    defaultMin: 70,
    defaultMax: 140,
    defaultRefText: '< 140 mg/dL',
    step: '1',
    descriptionMm: 'အစားစားပြီး ခန္ဓာကိုယ်၏ သကြားထိန်းနိုင်စွမ်း'
  },
  {
    id: 'rbs',
    nameMm: 'ကျပန်း သကြားဓာတ် (RBS)',
    nameEn: 'Random Blood Sugar (RBS)',
    category: 'glucose',
    categoryLabelMm: 'ဆီးချို/သကြားဓာတ်',
    unit: 'mg/dL',
    defaultMin: 70,
    defaultMax: 140,
    defaultRefText: '< 140 mg/dL',
    step: '1',
    descriptionMm: 'အချိန်မရွေး စစ်ဆေးသော သွေးတွင်းသကြား'
  },
  {
    id: 'hba1c',
    nameMm: '၃ လပတ် သွေးချိုပမာဏ (HbA1c)',
    nameEn: 'HbA1c (Glycated Hb)',
    category: 'glucose',
    categoryLabelMm: 'ဆီးချို/သကြားဓာတ်',
    unit: '%',
    defaultMin: 4.0,
    defaultMax: 5.7,
    defaultRefText: '< 5.7 %',
    step: '0.1',
    descriptionMm: 'လွန်ခဲ့သော ၃ လအတွင်း ပျမ်းမျှ သွေးချိုထိန်းချုပ်မှု'
  },

  // 3. Liver Function Test (LFT)
  {
    id: 'alt_sgpt',
    nameMm: 'SGPT / ALT (အသည်းအင်ဇိုင်း)',
    nameEn: 'SGPT / ALT',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'U/L',
    defaultMin: 7,
    defaultMax: 56,
    defaultRefText: '7 - 56 U/L',
    step: '0.1',
    descriptionMm: 'အသည်းရောင်ခြင်း၊ အဆီဖုံးခြင်း တိုက်ရိုက်အညွှန်း'
  },
  {
    id: 'ast_sgot',
    nameMm: 'SGOT / AST (အသည်းအင်ဇိုင်း)',
    nameEn: 'SGOT / AST',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'U/L',
    defaultMin: 10,
    defaultMax: 40,
    defaultRefText: '10 - 40 U/L',
    step: '0.1',
    descriptionMm: 'အသည်းနှင့် နှလုံးကြွက်သား အင်ဇိုင်း'
  },
  {
    id: 'totalBilirubin',
    nameMm: 'Total Bilirubin (အဝါဓာတ် စုစုပေါင်း)',
    nameEn: 'Total Bilirubin',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'mg/dL',
    defaultMin: 0.2,
    defaultMax: 1.2,
    defaultRefText: '0.2 - 1.2 mg/dL',
    step: '0.01',
    descriptionMm: 'အသားဝါ၊ မျက်လုံးဝါခြင်း စစ်ဆေးချက်'
  },
  {
    id: 'directBilirubin',
    nameMm: 'Direct Bilirubin (တိုက်ရိုက်အဝါဓာတ်)',
    nameEn: 'Direct Bilirubin',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'mg/dL',
    defaultMin: 0.0,
    defaultMax: 0.3,
    defaultRefText: '0.0 - 0.3 mg/dL',
    step: '0.01',
    descriptionMm: 'သည်းခြေလမ်းကြောင်း ပိတ်ဆို့မှု စစ်ဆေးချက်'
  },
  {
    id: 'alp',
    nameMm: 'ALP (Alkaline Phosphatase)',
    nameEn: 'Alkaline Phosphatase (ALP)',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'U/L',
    defaultMin: 44,
    defaultMax: 147,
    defaultRefText: '44 - 147 U/L',
    step: '1',
    descriptionMm: 'သည်းခြေပြွန်နှင့် အရိုးကျန်းမာရေး'
  },
  {
    id: 'albumin',
    nameMm: 'Albumin (အယ်လ်ဘူမင် ပရိုတင်း)',
    nameEn: 'Albumin',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'g/dL',
    defaultMin: 3.5,
    defaultMax: 5.0,
    defaultRefText: '3.5 - 5.0 g/dL',
    step: '0.1',
    descriptionMm: 'အသည်းမှ ထုတ်လုပ်သော အဓိက ပရိုတင်း'
  },
  {
    id: 'totalProtein',
    nameMm: 'Total Protein (ပရိုတင်း စုစုပေါင်း)',
    nameEn: 'Total Protein',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'g/dL',
    defaultMin: 6.0,
    defaultMax: 8.3,
    defaultRefText: '6.0 - 8.3 g/dL',
    step: '0.1',
    descriptionMm: 'သွေးတွင်း စုစုပေါင်း ပရိုတင်းဓာတ်'
  },
  {
    id: 'globulin',
    nameMm: 'Globulin (ဂလိုဗျူလင် ပရိုတင်း)',
    nameEn: 'Globulin',
    category: 'liver',
    categoryLabelMm: 'အသည်း (LFT)',
    unit: 'g/dL',
    defaultMin: 2.0,
    defaultMax: 3.5,
    defaultRefText: '2.0 - 3.5 g/dL',
    step: '0.1',
    descriptionMm: 'ကိုယ်ခံစွမ်းအားဆိုင်ရာ ပရိုတင်း'
  },

  // 4. Renal Function & Electrolytes (RFT)
  {
    id: 'creatinine',
    nameMm: 'Serum Creatinine (ကျောက်ကပ်စစ်ဆေးချက်)',
    nameEn: 'Serum Creatinine',
    category: 'renal',
    categoryLabelMm: 'ကျောက်ကပ် (RFT)',
    unit: 'mg/dL',
    defaultMin: 0.6,
    defaultMax: 1.2,
    defaultRefText: '0.6 - 1.2 mg/dL',
    step: '0.01',
    descriptionMm: 'ကျောက်ကပ် စွန့်ထုတ်နိုင်စွမ်း အဓိကစစ်ဆေးချက်'
  },
  {
    id: 'uricAcid',
    nameMm: 'Uric Acid (ဂေါက်ရောဂါ ယူရစ်အက်စစ်)',
    nameEn: 'Uric Acid',
    category: 'renal',
    categoryLabelMm: 'ကျောက်ကပ် (RFT)',
    unit: 'mg/dL',
    defaultMin: 3.5,
    defaultMax: 7.2,
    defaultRefText: '3.5 - 7.2 mg/dL',
    step: '0.1',
    descriptionMm: 'ဂေါက်အဆစ်ရောင်ရောဂါနှင့် ကျောက်တည်ခြင်း'
  },
  {
    id: 'bun',
    nameMm: 'BUN (Blood Urea Nitrogen)',
    nameEn: 'Blood Urea Nitrogen (BUN)',
    category: 'renal',
    categoryLabelMm: 'ကျောက်ကပ် (RFT)',
    unit: 'mg/dL',
    defaultMin: 7,
    defaultMax: 20,
    defaultRefText: '7 - 20 mg/dL',
    step: '0.1',
    descriptionMm: 'ကျောက်ကပ်မှ စွန့်ထုတ်သော ယူရီးယား'
  },
  {
    id: 'egfr',
    nameMm: 'eGFR (ကျောက်ကပ် စစ်ထုတ်နှုန်း)',
    nameEn: 'eGFR (Filtration Rate)',
    category: 'renal',
    categoryLabelMm: 'ကျောက်ကပ် (RFT)',
    unit: 'mL/min',
    defaultMin: 90,
    defaultMax: 150,
    defaultRefText: '> 90 mL/min',
    step: '1',
    descriptionMm: 'ကျောက်ကပ် အလုပ်လုပ်နိုင်မှု ရာခိုင်နှုန်း'
  },
  {
    id: 'sodium',
    nameMm: 'ဆိုဒီယမ် (Sodium Na+)',
    nameEn: 'Sodium (Na+)',
    category: 'renal',
    categoryLabelMm: 'ကျောက်ကပ် (RFT)',
    unit: 'mEq/L',
    defaultMin: 135,
    defaultMax: 145,
    defaultRefText: '135 - 145 mEq/L',
    step: '1',
    descriptionMm: 'သွေးတွင်းရေဓာတ်နှင့် ဆားဓာတ်ညီမျှမှု'
  },
  {
    id: 'potassium',
    nameMm: 'ပိုတက်စီယမ် (Potassium K+)',
    nameEn: 'Potassium (K+)',
    category: 'renal',
    categoryLabelMm: 'ကျောက်ကပ် (RFT)',
    unit: 'mEq/L',
    defaultMin: 3.5,
    defaultMax: 5.0,
    defaultRefText: '3.5 - 5.0 mEq/L',
    step: '0.1',
    descriptionMm: 'နှလုံးခုန်နှုန်းနှင့် ကြွက်သားလုပ်ဆောင်ချက်'
  },
  {
    id: 'chloride',
    nameMm: 'ကလိုရိုက် (Chloride Cl-)',
    nameEn: 'Chloride (Cl-)',
    category: 'renal',
    categoryLabelMm: 'ကျောက်ကပ် (RFT)',
    unit: 'mEq/L',
    defaultMin: 96,
    defaultMax: 106,
    defaultRefText: '96 - 106 mEq/L',
    step: '1',
    descriptionMm: 'သွေးတွင်း အက်စစ်/အယ်ကာလီ ညီမျှမှု'
  },

  // 5. Lipid Profile
  {
    id: 'totalCholesterol',
    nameMm: 'Total Cholesterol (စုစုပေါင်း ကိုလက်စထရော)',
    nameEn: 'Total Cholesterol',
    category: 'lipid',
    categoryLabelMm: 'သွေးတွင်းအဆီဓာတ်',
    unit: 'mg/dL',
    defaultMin: 100,
    defaultMax: 200,
    defaultRefText: '< 200 mg/dL',
    step: '1',
    descriptionMm: 'နှလုံးနှင့် သွေးကြောကျဉ်းရောဂါ ဖြစ်နိုင်ခြေ'
  },
  {
    id: 'triglycerides',
    nameMm: 'Triglycerides (ထရိုင်ဂလစ်စရိုက်)',
    nameEn: 'Triglycerides',
    category: 'lipid',
    categoryLabelMm: 'သွေးတွင်းအဆီဓာတ်',
    unit: 'mg/dL',
    defaultMin: 50,
    defaultMax: 150,
    defaultRefText: '< 150 mg/dL',
    step: '1',
    descriptionMm: 'အချိုနှင့် ကစီဓာတ်များရာမှ ဖြစ်ပေါ်သော အဆီ'
  },
  {
    id: 'hdl',
    nameMm: 'HDL (ကောင်းသော အဆီဓာတ်)',
    nameEn: 'HDL Cholesterol',
    category: 'lipid',
    categoryLabelMm: 'သွေးတွင်းအဆီဓာတ်',
    unit: 'mg/dL',
    defaultMin: 40,
    defaultMax: 100,
    defaultRefText: '> 40 - 50 mg/dL',
    step: '1',
    descriptionMm: 'နှလုံးသွေးကြောကို အကာအကွယ်ပေးသော အဆီ'
  },
  {
    id: 'ldl',
    nameMm: 'LDL (မကောင်းသော အဆီဓာတ်)',
    nameEn: 'LDL Cholesterol',
    category: 'lipid',
    categoryLabelMm: 'သွေးတွင်းအဆီဓာတ်',
    unit: 'mg/dL',
    defaultMin: 50,
    defaultMax: 100,
    defaultRefText: '< 100 mg/dL',
    step: '1',
    descriptionMm: 'သွေးကြောနံရံများတွင် ပိတ်ဆို့စေသော အဆီ'
  },
  {
    id: 'vldl',
    nameMm: 'VLDL အဆီဓာတ်',
    nameEn: 'VLDL Cholesterol',
    category: 'lipid',
    categoryLabelMm: 'သွေးတွင်းအဆီဓာတ်',
    unit: 'mg/dL',
    defaultMin: 5,
    defaultMax: 30,
    defaultRefText: '< 30 mg/dL',
    step: '1',
    descriptionMm: 'အသည်းမှ ထုတ်လုပ်သော အလွန်သိပ်သည်းမှုနည်း အဆီ'
  },

  // 6. Thyroid Function Test (TFT)
  {
    id: 'tsh',
    nameMm: 'TSH (သိုင်းရွိုက်နှိုးဆွဟော်မုန်း)',
    nameEn: 'TSH (Thyroid Stimulating)',
    category: 'thyroid',
    categoryLabelMm: 'သိုင်းရွိုက် (TFT)',
    unit: 'µIU/mL',
    defaultMin: 0.4,
    defaultMax: 4.0,
    defaultRefText: '0.4 - 4.0 µIU/mL',
    step: '0.01',
    descriptionMm: 'ဦးနှောက်မှ သိုင်းရွိုက်ဂလင်းကို ထိန်းညှိသော ဟော်မုန်း'
  },
  {
    id: 'ft4',
    nameMm: 'Free T4 (လွတ်လပ် T4 ဟော်မုန်း)',
    nameEn: 'Free T4 (Thyroxine)',
    category: 'thyroid',
    categoryLabelMm: 'သိုင်းရွိုက် (TFT)',
    unit: 'ng/dL',
    defaultMin: 0.8,
    defaultMax: 1.8,
    defaultRefText: '0.8 - 1.8 ng/dL',
    step: '0.01',
    descriptionMm: 'ခန္ဓာကိုယ် ဇီဝကမ္မဖြစ်စဉ်ကို တိုက်ရိုက်လည်ပတ်စေသော ဟော်မုန်း'
  },
  {
    id: 'ft3',
    nameMm: 'Free T3 (လွတ်လပ် T3 ဟော်မုန်း)',
    nameEn: 'Free T3 (Triiodothyronine)',
    category: 'thyroid',
    categoryLabelMm: 'သိုင်းရွိုက် (TFT)',
    unit: 'pg/mL',
    defaultMin: 2.3,
    defaultMax: 4.2,
    defaultRefText: '2.3 - 4.2 pg/mL',
    step: '0.01',
    descriptionMm: 'တက်ကြွသော သိုင်းရွိုက်ဟော်မုန်း'
  },
  {
    id: 'totalT4',
    nameMm: 'Total T4 (စုစုပေါင်း T4)',
    nameEn: 'Total T4',
    category: 'thyroid',
    categoryLabelMm: 'သိုင်းရွိုက် (TFT)',
    unit: 'µg/dL',
    defaultMin: 4.5,
    defaultMax: 12.0,
    defaultRefText: '4.5 - 12.0 µg/dL',
    step: '0.1',
    descriptionMm: 'ပရိုတင်းနှင့် ပေါင်းစပ်နေသော T4 အပါအဝင်'
  },
  {
    id: 'totalT3',
    nameMm: 'Total T3 (စုစုပေါင်း T3)',
    nameEn: 'Total T3',
    category: 'thyroid',
    categoryLabelMm: 'သိုင်းရွိုက် (TFT)',
    unit: 'ng/dL',
    defaultMin: 80,
    defaultMax: 200,
    defaultRefText: '80 - 200 ng/dL',
    step: '1',
    descriptionMm: 'စုစုပေါင်း သွေးတွင်း T3 ပမာဏ'
  },
  {
    id: 'antiTpo',
    nameMm: 'Anti-TPO (သိုင်းရွိုက် ပဋိပစ္စည်း)',
    nameEn: 'Anti-TPO Antibodies',
    category: 'thyroid',
    categoryLabelMm: 'သိုင်းရွိုက် (TFT)',
    unit: 'IU/mL',
    defaultMin: 0,
    defaultMax: 35,
    defaultRefText: '< 35 IU/mL',
    step: '0.1',
    descriptionMm: 'Autoimmune သိုင်းရွိုက်ရောင်ရမ်းမှု စစ်ဆေးချက်'
  },

  // 7. Urine Routine & Microalbumin
  {
    id: 'urineMicroalbumin',
    nameMm: 'ဆီးတွင်း မိုက်ခရိုအယ်ဘူမင် (Microalbumin)',
    nameEn: 'Urine Microalbumin',
    category: 'urine',
    categoryLabelMm: 'ဆီးစစ်ဆေးချက်',
    unit: 'mg/g',
    defaultMin: 0,
    defaultMax: 30,
    defaultRefText: '< 30 mg/g',
    step: '0.1',
    descriptionMm: 'ဆီးချို/သွေးတိုးကြောင့် ကျောက်ကပ်စောစီးစွာ ထိခိုက်မှု ရှာဖွေခြင်း'
  },
  {
    id: 'urinePusCells',
    nameMm: 'Pus Cells (ဆီးတွင်း သွေးဖြူဥ)',
    nameEn: 'Urine Pus Cells (WBC)',
    category: 'urine',
    categoryLabelMm: 'ဆီးစစ်ဆေးချက်',
    unit: '/HPF',
    defaultMin: 0,
    defaultMax: 5,
    defaultRefText: '0 - 5 /HPF',
    step: '1',
    descriptionMm: 'ဆီးလမ်းကြောင်း ပိုးဝင်ခြင်း (UTI) စစ်ဆေးချက်'
  },
  {
    id: 'urineRbc',
    nameMm: 'Red Blood Cells (ဆီးတွင်း သွေးနီဥ)',
    nameEn: 'Urine RBC',
    category: 'urine',
    categoryLabelMm: 'ဆီးစစ်ဆေးချက်',
    unit: '/HPF',
    defaultMin: 0,
    defaultMax: 2,
    defaultRefText: '0 - 2 /HPF',
    step: '1',
    descriptionMm: 'ဆီးထဲသွေးပါခြင်း သို့မဟုတ် ကျောက်တည်ခြင်း'
  },

  // 8. Inflammatory & Vitamins
  {
    id: 'crp',
    nameMm: 'CRP (C-Reactive Protein ရောင်ရမ်းမှု)',
    nameEn: 'C-Reactive Protein (CRP)',
    category: 'inflammatory',
    categoryLabelMm: 'ရောင်ရမ်းမှု/ဗီတာမင်',
    unit: 'mg/L',
    defaultMin: 0,
    defaultMax: 5.0,
    defaultRefText: '< 5.0 mg/L',
    step: '0.1',
    descriptionMm: 'ပြင်းထန်ပိုးဝင်ခြင်းနှင့် ရောင်ရမ်းမှု အဆင့်'
  },
  {
    id: 'ferritin',
    nameMm: 'Serum Ferritin (သံဓာတ်သိုလှောင်မှု)',
    nameEn: 'Serum Ferritin',
    category: 'inflammatory',
    categoryLabelMm: 'ရောင်ရမ်းမှု/ဗီတာမင်',
    unit: 'ng/mL',
    defaultMin: 20,
    defaultMax: 250,
    defaultRefText: '20 - 250 ng/mL',
    step: '1',
    descriptionMm: 'ခန္ဓာကိုယ်တွင်း သံဓာတ်သိုလှောင်ထားနိုင်မှု'
  },
  {
    id: 'vitaminD',
    nameMm: 'ဗီတာမင် D (25-OH Vitamin D)',
    nameEn: '25-OH Vitamin D',
    category: 'inflammatory',
    categoryLabelMm: 'ရောင်ရမ်းမှု/ဗီတာမင်',
    unit: 'ng/mL',
    defaultMin: 30,
    defaultMax: 100,
    defaultRefText: '30 - 100 ng/mL',
    step: '0.1',
    descriptionMm: 'အရိုးနှင့် ကိုယ်ခံအား စွမ်းဆောင်ရည်'
  },
  {
    id: 'vitaminB12',
    nameMm: 'ဗီတာမင် B12 (Vitamin B12)',
    nameEn: 'Vitamin B12',
    category: 'inflammatory',
    categoryLabelMm: 'ရောင်ရမ်းမှု/ဗီတာမင်',
    unit: 'pg/mL',
    defaultMin: 200,
    defaultMax: 900,
    defaultRefText: '200 - 900 pg/mL',
    step: '1',
    descriptionMm: 'အာရုံကြောနှင့် သွေးနီဥ တည်ဆောက်မှု'
  },
];

export const LabTestModule: React.FC = () => {
  const { labRecords, addLabRecord, deleteLabRecord, selectedPatient, selectedFamilyMember } = useHealthData();
  const { profile } = useAuth();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(() => 
    labRecords.length > 0 ? labRecords[0].id : null
  );

  // Form base states - CLEAN SLATE (No prefilled numbers)
  const [testDate, setTestDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [doctorReview, setDoctorReview] = useState<string>('');
  
  // Search & Filter state in Add Modal
  const [activeCategory, setActiveCategory] = useState<LabCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Values entered by user: { [testId]: string }
  const [testValues, setTestValues] = useState<Record<string, string>>({});

  // Custom reference ranges adjusted by user: { [testId]: { min?: string; max?: string; isEditing?: boolean } }
  const [customRefRanges, setCustomRefRanges] = useState<Record<string, { min?: string; max?: string; isEditing?: boolean }>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset entire form
  const resetForm = () => {
    setLabName('');
    setNotes('');
    setDoctorReview('');
    setTestDate(new Date().toISOString().split('T')[0]);
    setTestValues({});
    setCustomRefRanges({});
    setSearchQuery('');
  };

  // Toggle edit reference range for a test
  const toggleEditRef = (testId: string) => {
    setCustomRefRanges(prev => {
      const current = prev[testId] || {};
      const def = MASTER_LAB_TESTS.find(t => t.id === testId);
      return {
        ...prev,
        [testId]: {
          min: current.min !== undefined ? current.min : (def?.defaultMin !== undefined ? String(def.defaultMin) : ''),
          max: current.max !== undefined ? current.max : (def?.defaultMax !== undefined ? String(def.defaultMax) : ''),
          isEditing: !current.isEditing
        }
      };
    });
  };

  const handleUpdateCustomRefMin = (testId: string, val: string) => {
    setCustomRefRanges(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        min: val,
        isEditing: true
      }
    }));
  };

  const handleUpdateCustomRefMax = (testId: string, val: string) => {
    setCustomRefRanges(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        max: val,
        isEditing: true
      }
    }));
  };

  const handleResetToDefaultRef = (testId: string) => {
    setCustomRefRanges(prev => {
      const copy = { ...prev };
      delete copy[testId];
      return copy;
    });
  };

  // Calculate live filled count
  const filledCount = useMemo(() => {
    return Object.values(testValues).filter(v => v !== undefined && v.trim() !== '' && !isNaN(Number(v))).length;
  }, [testValues]);

  // Filtered test definitions for the modal
  const filteredDefs = useMemo(() => {
    return MASTER_LAB_TESTS.filter(test => {
      const matchesCat = activeCategory === 'all' || test.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery = !query || 
        test.nameMm.toLowerCase().includes(query) || 
        test.nameEn.toLowerCase().includes(query) ||
        test.id.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  // Active lab record currently selected
  const activeRecord = labRecords.find(r => r.id === selectedRecordId) || (labRecords.length > 0 ? labRecords[0] : null);

  // Extract recorded items list for display (supporting both new .tests array and backwards compatibility)
  const displayItems = useMemo<RecordedLabItem[]>(() => {
    if (!activeRecord) return [];
    if (activeRecord.tests && activeRecord.tests.length > 0) {
      return activeRecord.tests;
    }

    // Backwards compatibility: construct from legacy nested objects
    const items: RecordedLabItem[] = [];

    // CBC
    if (activeRecord.cbc) {
      if (activeRecord.cbc.hemoglobin != null) items.push(buildLegacyItem('hemoglobin', activeRecord.cbc.hemoglobin));
      if (activeRecord.cbc.wbc != null) items.push(buildLegacyItem('wbc', activeRecord.cbc.wbc));
      if (activeRecord.cbc.platelets != null) items.push(buildLegacyItem('platelets', activeRecord.cbc.platelets));
      if (activeRecord.cbc.rbc != null) items.push(buildLegacyItem('rbc', activeRecord.cbc.rbc));
      if (activeRecord.cbc.pcv_hematocrit != null) items.push(buildLegacyItem('pcv_hematocrit', activeRecord.cbc.pcv_hematocrit));
      if (activeRecord.cbc.esr != null) items.push(buildLegacyItem('esr', activeRecord.cbc.esr));
      if (activeRecord.cbc.neutrophils != null) items.push(buildLegacyItem('neutrophils', activeRecord.cbc.neutrophils));
      if (activeRecord.cbc.lymphocytes != null) items.push(buildLegacyItem('lymphocytes', activeRecord.cbc.lymphocytes));
    }

    // Glucose
    if (activeRecord.glucose) {
      if (activeRecord.glucose.fbs != null) items.push(buildLegacyItem('fbs', activeRecord.glucose.fbs));
      if (activeRecord.glucose.ppbs != null) items.push(buildLegacyItem('ppbs', activeRecord.glucose.ppbs));
      if (activeRecord.glucose.rbs != null) items.push(buildLegacyItem('rbs', activeRecord.glucose.rbs));
      if (activeRecord.glucose.hba1c != null) items.push(buildLegacyItem('hba1c', activeRecord.glucose.hba1c));
    }

    // Liver
    if (activeRecord.liver) {
      const alt = activeRecord.liver.alt_sgpt ?? activeRecord.liver.alt;
      if (alt != null) items.push(buildLegacyItem('alt_sgpt', alt));
      const ast = activeRecord.liver.ast_sgot ?? activeRecord.liver.ast;
      if (ast != null) items.push(buildLegacyItem('ast_sgot', ast));
      if (activeRecord.liver.totalBilirubin != null) items.push(buildLegacyItem('totalBilirubin', activeRecord.liver.totalBilirubin));
      if (activeRecord.liver.directBilirubin != null) items.push(buildLegacyItem('directBilirubin', activeRecord.liver.directBilirubin));
      if (activeRecord.liver.alp != null) items.push(buildLegacyItem('alp', activeRecord.liver.alp));
      if (activeRecord.liver.albumin != null) items.push(buildLegacyItem('albumin', activeRecord.liver.albumin));
      if (activeRecord.liver.totalProtein != null) items.push(buildLegacyItem('totalProtein', activeRecord.liver.totalProtein));
      if (activeRecord.liver.globulin != null) items.push(buildLegacyItem('globulin', activeRecord.liver.globulin));
    }

    // Renal
    if (activeRecord.renal) {
      if (activeRecord.renal.creatinine != null) items.push(buildLegacyItem('creatinine', activeRecord.renal.creatinine));
      if (activeRecord.renal.uricAcid != null) items.push(buildLegacyItem('uricAcid', activeRecord.renal.uricAcid));
      if (activeRecord.renal.bun != null) items.push(buildLegacyItem('bun', activeRecord.renal.bun));
      if (activeRecord.renal.egfr != null) items.push(buildLegacyItem('egfr', activeRecord.renal.egfr));
      if (activeRecord.renal.sodium != null) items.push(buildLegacyItem('sodium', activeRecord.renal.sodium));
      if (activeRecord.renal.potassium != null) items.push(buildLegacyItem('potassium', activeRecord.renal.potassium));
      if (activeRecord.renal.chloride != null) items.push(buildLegacyItem('chloride', activeRecord.renal.chloride));
    }

    // Lipid
    if (activeRecord.lipid) {
      if (activeRecord.lipid.totalCholesterol != null) items.push(buildLegacyItem('totalCholesterol', activeRecord.lipid.totalCholesterol));
      if (activeRecord.lipid.triglycerides != null) items.push(buildLegacyItem('triglycerides', activeRecord.lipid.triglycerides));
      if (activeRecord.lipid.hdl != null) items.push(buildLegacyItem('hdl', activeRecord.lipid.hdl));
      if (activeRecord.lipid.ldl != null) items.push(buildLegacyItem('ldl', activeRecord.lipid.ldl));
      if (activeRecord.lipid.vldl != null) items.push(buildLegacyItem('vldl', activeRecord.lipid.vldl));
    }

    // Thyroid
    if (activeRecord.thyroid) {
      if (activeRecord.thyroid.tsh != null) items.push(buildLegacyItem('tsh', activeRecord.thyroid.tsh));
      if (activeRecord.thyroid.ft4 != null) items.push(buildLegacyItem('ft4', activeRecord.thyroid.ft4));
      if (activeRecord.thyroid.ft3 != null) items.push(buildLegacyItem('ft3', activeRecord.thyroid.ft3));
      if (activeRecord.thyroid.totalT4 != null) items.push(buildLegacyItem('totalT4', activeRecord.thyroid.totalT4));
      if (activeRecord.thyroid.totalT3 != null) items.push(buildLegacyItem('totalT3', activeRecord.thyroid.totalT3));
      if (activeRecord.thyroid.antiTpo != null) items.push(buildLegacyItem('antiTpo', activeRecord.thyroid.antiTpo));
    }

    // Urine
    if (activeRecord.urine) {
      if (activeRecord.urine.microalbumin != null) items.push(buildLegacyItem('urineMicroalbumin', activeRecord.urine.microalbumin));
    }

    // Inflammatory
    if (activeRecord.inflammatory) {
      if (activeRecord.inflammatory.crp != null) items.push(buildLegacyItem('crp', activeRecord.inflammatory.crp));
      if (activeRecord.inflammatory.ferritin != null) items.push(buildLegacyItem('ferritin', activeRecord.inflammatory.ferritin));
      if (activeRecord.inflammatory.vitaminD != null) items.push(buildLegacyItem('vitaminD', activeRecord.inflammatory.vitaminD));
      if (activeRecord.inflammatory.vitaminB12 != null) items.push(buildLegacyItem('vitaminB12', activeRecord.inflammatory.vitaminB12));
    }

    return items;
  }, [activeRecord]);

  function buildLegacyItem(id: string, value: number): RecordedLabItem {
    const def = MASTER_LAB_TESTS.find(t => t.id === id);
    const evalResult = evaluateCustomLabValue(value, def?.defaultMin, def?.defaultMax, id);
    return {
      id,
      nameMm: def?.nameMm || id,
      nameEn: def?.nameEn || id,
      category: def?.category || 'general',
      categoryLabelMm: def?.categoryLabelMm || 'စစ်ဆေးချက်',
      value,
      unit: def?.unit || '',
      refMin: def?.defaultMin,
      refMax: def?.defaultMax,
      refRangeText: def?.defaultRefText || '-',
      isCustomRef: false,
      status: evalResult.status,
      statusLabelMm: evalResult.labelMm
    };
  }

  // Submit and save ONLY the tests the user actually filled in!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (filledCount === 0) {
      alert('ကျေးဇူးပြု၍ စစ်ဆေးထားသော ဓာတ်ခွဲအဖြေ အနည်းဆုံး တစ်ခု ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }

    setIsSubmitting(true);

    try {
      const recordedTests: RecordedLabItem[] = [];

      // Collect ONLY the tests where user entered a valid number
      MASTER_LAB_TESTS.forEach(def => {
        const rawVal = testValues[def.id];
        if (rawVal !== undefined && rawVal.trim() !== '') {
          const numVal = Number(rawVal.trim());
          if (!isNaN(numVal)) {
            const custom = customRefRanges[def.id];
            const customMinNum = custom?.min !== undefined && custom.min.trim() !== '' ? Number(custom.min) : undefined;
            const customMaxNum = custom?.max !== undefined && custom.max.trim() !== '' ? Number(custom.max) : undefined;

            const effectiveMin = customMinNum !== undefined ? customMinNum : def.defaultMin;
            const effectiveMax = customMaxNum !== undefined ? customMaxNum : def.defaultMax;
            const isCustom = customMinNum !== undefined || customMaxNum !== undefined;

            const evalInfo = evaluateCustomLabValue(numVal, effectiveMin, effectiveMax, def.id);

            let customRefText = def.defaultRefText;
            if (isCustom) {
              if (effectiveMin !== undefined && effectiveMax !== undefined) customRefText = `${effectiveMin} - ${effectiveMax} ${def.unit}`;
              else if (effectiveMax !== undefined) customRefText = `< ${effectiveMax} ${def.unit}`;
              else if (effectiveMin !== undefined) customRefText = `> ${effectiveMin} ${def.unit}`;
            }

            recordedTests.push({
              id: def.id,
              nameMm: def.nameMm,
              nameEn: def.nameEn,
              category: def.category,
              categoryLabelMm: def.categoryLabelMm,
              value: numVal,
              unit: def.unit,
              refMin: effectiveMin,
              refMax: effectiveMax,
              refRangeText: customRefText,
              isCustomRef: isCustom,
              status: evalInfo.status,
              statusLabelMm: evalInfo.labelMm
            });
          }
        }
      });

      // Also build backwards-compatible structures for any tests entered
      const getNum = (id: string) => {
        const v = testValues[id];
        return v && v.trim() !== '' && !isNaN(Number(v)) ? Number(v.trim()) : undefined;
      };

      const cbcObj = {
        hemoglobin: getNum('hemoglobin'),
        wbc: getNum('wbc'),
        platelets: getNum('platelets'),
        rbc: getNum('rbc'),
        pcv_hematocrit: getNum('pcv_hematocrit'),
        esr: getNum('esr'),
        neutrophils: getNum('neutrophils'),
        lymphocytes: getNum('lymphocytes')
      };
      const hasCbc = Object.values(cbcObj).some(v => v !== undefined);

      const gluObj = {
        fbs: getNum('fbs'),
        ppbs: getNum('ppbs'),
        rbs: getNum('rbs'),
        hba1c: getNum('hba1c')
      };
      const hasGlu = Object.values(gluObj).some(v => v !== undefined);

      const liverObj = {
        alt_sgpt: getNum('alt_sgpt'),
        ast_sgot: getNum('ast_sgot'),
        totalBilirubin: getNum('totalBilirubin'),
        directBilirubin: getNum('directBilirubin'),
        alp: getNum('alp'),
        albumin: getNum('albumin'),
        totalProtein: getNum('totalProtein'),
        globulin: getNum('globulin')
      };
      const hasLiver = Object.values(liverObj).some(v => v !== undefined);

      const renalObj = {
        creatinine: getNum('creatinine'),
        uricAcid: getNum('uricAcid'),
        bun: getNum('bun'),
        egfr: getNum('egfr'),
        sodium: getNum('sodium'),
        potassium: getNum('potassium'),
        chloride: getNum('chloride')
      };
      const hasRenal = Object.values(renalObj).some(v => v !== undefined);

      const lipidObj = {
        totalCholesterol: getNum('totalCholesterol'),
        triglycerides: getNum('triglycerides'),
        hdl: getNum('hdl'),
        ldl: getNum('ldl'),
        vldl: getNum('vldl')
      };
      const hasLipid = Object.values(lipidObj).some(v => v !== undefined);

      const thyroidObj = {
        tsh: getNum('tsh'),
        ft4: getNum('ft4'),
        ft3: getNum('ft3'),
        totalT4: getNum('totalT4'),
        totalT3: getNum('totalT3'),
        antiTpo: getNum('antiTpo')
      };
      const hasThyroid = Object.values(thyroidObj).some(v => v !== undefined);

      const urineObj = {
        microalbumin: getNum('urineMicroalbumin'),
        pusCells: testValues['urinePusCells']?.trim() || undefined,
        rbc: testValues['urineRbc']?.trim() || undefined
      };
      const hasUrine = Object.values(urineObj).some(v => v !== undefined);

      const inflObj = {
        crp: getNum('crp'),
        ferritin: getNum('ferritin'),
        vitaminD: getNum('vitaminD'),
        vitaminB12: getNum('vitaminB12')
      };
      const hasInfl = Object.values(inflObj).some(v => v !== undefined);

      await addLabRecord({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        userName: selectedPatient ? selectedPatient.displayName : (selectedFamilyMember ? selectedFamilyMember.name : profile.displayName),
        testDate,
        labName: labName.trim() || 'ဆေးဓာတ်ခွဲခန်း',
        tests: recordedTests,
        cbc: hasCbc ? cbcObj : undefined,
        glucose: hasGlu ? gluObj : undefined,
        liver: hasLiver ? liverObj : undefined,
        renal: hasRenal ? renalObj : undefined,
        lipid: hasLipid ? lipidObj : undefined,
        thyroid: hasThyroid ? thyroidObj : undefined,
        urine: hasUrine ? urineObj : undefined,
        inflammatory: hasInfl ? inflObj : undefined,
        notes: notes.trim() || undefined,
        doctorReview: doctorReview.trim() || undefined
      });

      resetForm();
      setIsOpenAdd(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList: { id: LabCategory; label: string; icon: any }[] = [
    { id: 'all', label: 'စစ်ဆေးချက် အားလုံး', icon: FlaskConical },
    { id: 'cbc', label: 'သွေးဆဲလ် (CBC)', icon: Activity },
    { id: 'glucose', label: 'ဆီးချို/သကြား (Glucose)', icon: Droplets },
    { id: 'liver', label: 'အသည်း (LFT)', icon: FlaskConical },
    { id: 'renal', label: 'ကျောက်ကပ် (RFT/Uric)', icon: TestTube2 },
    { id: 'lipid', label: 'သွေးတွင်းအဆီ (Lipid)', icon: Heart },
    { id: 'thyroid', label: 'သိုင်းရွိုက် (TFT)', icon: Dna },
    { id: 'urine', label: 'ဆီးစစ်ဆေးချက် (Urine)', icon: FileText },
    { id: 'inflammatory', label: 'ရောင်ရမ်းမှု/ဗီတာမင်', icon: Sparkles }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ဓာတ်ခွဲခန်းစစ်ဆေးချက်များ (Comprehensive Lab Tests)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedPatient 
              ? `အသုံးပြုသူ ${selectedPatient.displayName} ၏ ဓာတ်ခွဲစစ်ဆေးချက် မှတ်တမ်းများ`
              : 'စစ်ဆေးခဲ့သော ဓာတ်ခွဲအဖြေများကို ဓာတ်ခွဲခန်းစံနှုန်းများနှင့် ယှဉ်ပြပြီး တိကျစွာ မှတ်တမ်းတင်နိုင်ပါသည်'}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsOpenAdd(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          Lab စစ်ဆေးချက် အသစ်ထည့်မည်
        </button>
      </div>

      {labRecords.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <FlaskConical className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">ဓာတ်ခွဲခန်းစစ်ဆေးချက် မရှိသေးပါ</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            အထက်ပါခလုတ်ကိုနှိပ်၍ မိမိစစ်ဆေးခဲ့သော စစ်ဆေးချက်များကို ရွေးချယ်ထည့်သွင်းပါ။ (စစ်ဆေးခဲ့သည့် အကွက်များကိုသာ သိမ်းဆည်းပေးမည်ဖြစ်ပါသည်)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: History List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                စစ်ဆေးခဲ့သော ရက်စွဲများ ({labRecords.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {labRecords.map((lab) => {
                const isSelected = activeRecord?.id === lab.id;
                // Count of tests recorded
                const count = lab.tests ? lab.tests.length : (
                  (lab.cbc?.hemoglobin != null ? 1 : 0) +
                  (lab.glucose?.fbs != null ? 1 : 0) +
                  (lab.liver?.alt_sgpt != null || lab.liver?.alt != null ? 1 : 0) +
                  (lab.renal?.creatinine != null ? 1 : 0) +
                  (lab.renal?.uricAcid != null ? 1 : 0) +
                  (lab.lipid?.totalCholesterol != null ? 1 : 0) +
                  (lab.thyroid?.tsh != null ? 1 : 0)
                );

                return (
                  <div
                    key={lab.id}
                    onClick={() => setSelectedRecordId(lab.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-xs ring-1 ring-purple-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        {lab.testDate}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLabRecord(lab.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        title="ဖျက်မည်"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{lab.labName}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                        {count} မျိုး
                      </span>
                    </div>

                    {/* Snapshot of recorded items */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {lab.tests && lab.tests.length > 0 ? (
                        lab.tests.slice(0, 4).map(t => (
                          <span key={t.id} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.nameEn.split(' ')[0]}: {t.value}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400">စစ်ဆေးချက် အနှစ်ချုပ် ကြည့်ရှုရန် နှိပ်ပါ</span>
                      )}
                      {lab.tests && lab.tests.length > 4 && (
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold self-center">
                          +{lab.tests.length - 4} ပို
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Clean 1-Row-Per-Test View */}
          {activeRecord && (
            <div className="lg:col-span-8 space-y-5">
              {/* Header Details */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      ဓာတ်ခွဲခန်းစစ်ဆေးမှု ရလဒ်လွှာ
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeRecord.labName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">စစ်ဆေးသည့်ရက်စွဲ</span>
                      <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {activeRecord.testDate}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                      {displayItems.length} မျိုး စစ်ဆေးခဲ့သည်
                    </div>
                  </div>
                </div>

                {activeRecord.notes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">အသုံးပြုသူမှတ်ချက်: </span>
                    {activeRecord.notes}
                  </div>
                )}

                {activeRecord.doctorReview && (
                  <div className="mt-2.5 p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-xs text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <span className="font-semibold">ဆရာဝန်၏ သုံးသပ်ချက်: </span>
                    {activeRecord.doctorReview}
                  </div>
                )}
              </div>

              {/* Thyroid Clinical Evaluation if TFT was recorded */}
              {(() => {
                const tshItem = displayItems.find(i => i.id === 'tsh');
                const ft4Item = displayItems.find(i => i.id === 'ft4');
                const ft3Item = displayItems.find(i => i.id === 'ft3');
                if (!tshItem && !ft4Item && !ft3Item) return null;

                const thyroidEval = evaluateThyroidFunction(tshItem?.value, ft4Item?.value, ft3Item?.value);
                if (!thyroidEval) return null;

                return (
                  <div className="p-4 rounded-3xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        သိုင်းရွိုက် ဆေးပညာ သုံးသပ်ချက် အဖြေ:
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${thyroidEval.badgeClass}`}>
                        {thyroidEval.labelMm}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                      {thyroidEval.descriptionMm}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-purple-700 dark:text-purple-300">ဆရာဝန် လမ်းညွှန်ချက်: </span>
                      {thyroidEval.clinicalAdviceMm}
                    </div>
                  </div>
                );
              })()}

              {/* ONE TEST PER LINE (စာတကြောင်းကို Test ၁ ခုပဲပြသခြင်း) */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>စစ်ဆေးခဲ့သော ရလဒ်များ (၁ ကြောင်းလျှင် ၁ မျိုးစီ တိကျစွာ ဖော်ပြချက်)</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    စုစုပေါင်း: <strong className="text-purple-600 font-bold">{displayItems.length}</strong> မျိုး
                  </span>
                </div>

                {displayItems.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    ဤရက်စွဲတွင် စစ်ဆေးချက်တန်ဖိုးများ မတွေ့ရှိပါ။
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {displayItems.map((item, idx) => {
                      return (
                        <div 
                          key={item.id || idx}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-purple-200 transition-all"
                        >
                          {/* Left: Name and Category */}
                          <div className="md:w-5/12 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                                {item.categoryLabelMm}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.nameMm}
                              </h5>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                              {item.nameEn}
                            </span>
                          </div>

                          {/* Center: Value */}
                          <div className="md:w-3/12 flex items-baseline gap-1.5">
                            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                              {item.value.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {item.unit}
                            </span>
                          </div>

                          {/* Center-Right: Reference Range */}
                          <div className="md:w-4/12 flex flex-col justify-center text-xs">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              စံနှုန်း (Ref): <strong className="font-mono text-slate-700 dark:text-slate-200">{item.refRangeText}</strong>
                            </span>
                            {item.isCustomRef && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                * ဓာတ်ခွဲခန်းစံနှုန်းအတိုင်း ချိန်ညှိထားသည်
                              </span>
                            )}
                          </div>

                          {/* Right: Status Indicator Badge */}
                          <div className="shrink-0 flex items-center md:justify-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === 'normal' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                : item.status === 'critical'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                                : item.status === 'low'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                            }`}>
                              {item.statusLabelMm}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add New Lab Tests Modal (1 ROW PER TEST with LIVE COMPARISON & EDITABLE REF RANGE) */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-4 max-h-[94vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    ဓာတ်ခွဲခန်းစစ်ဆေးချက် အသစ်ထည့်သွင်းခြင်း (Lab Test Entry)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    မိမိစစ်ဆေးခဲ့သော ဓာတ်ခွဲအဖြေကိုသာ ရိုက်ထည့်ပါ (မထည့်သော စစ်ဆေးချက်များ အလိုအလျောက် ပယ်ဖျက်ပါမည်)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                  title="အကွက်အားလုံး ရှင်းလင်းမည်"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">အကုန်ရှင်းမည်</span>
                </button>
                <button
                  onClick={() => setIsOpenAdd(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 space-y-4 overflow-y-auto pr-1 flex-1">
              
              {/* Date & Lab Name Header Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    စစ်ဆေးသည့် ရက်စွဲ *
                  </label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆေးရုံ / ဆေးခန်း / ဓာတ်ခွဲခန်း အမည်
                  </label>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    placeholder="ဥပမာ- ပန်းလှိုင်၊ ဆာကူရာ၊ အထူးကုဓာတ်ခွဲခန်း"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Category Filter Dropdown & Search Bar (No Horizontal Scroll) */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Category Dropdown */}
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      ကဏ္ဍ:
                    </label>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value as LabCategory)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full sm:w-56 shrink-0">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="စစ်ဆေးချက် ရှာရန်..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Banner counter */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">
                    ပြသထားသော စစ်ဆေးချက်များ: <strong className="text-slate-800 dark:text-slate-200">{filteredDefs.length}</strong> ခု
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    ဖြည့်သွင်းထားသော စစ်ဆေးချက်: {filledCount} ခု (ဖြည့်ထားသည်များသာ သိမ်းပါမည်)
                  </span>
                </div>
              </div>

              {/* ONE ROW PER TEST LIST (စာတကြောင်းကို Test ၁ ခုပဲ သပ်ရပ်စွာ ပြသခြင်း) */}
              <div className="space-y-2.5">
                {filteredDefs.map(def => {
                  const rawVal = testValues[def.id] || '';
                  const hasVal = rawVal.trim() !== '' && !isNaN(Number(rawVal));
                  const numVal = hasVal ? Number(rawVal.trim()) : 0;

                  // Custom reference bounds
                  const custom = customRefRanges[def.id];
                  const isEditingRef = custom?.isEditing;
                  const customMinNum = custom?.min !== undefined && custom.min.trim() !== '' ? Number(custom.min) : undefined;
                  const customMaxNum = custom?.max !== undefined && custom.max.trim() !== '' ? Number(custom.max) : undefined;

                  const effectiveMin = customMinNum !== undefined ? customMinNum : def.defaultMin;
                  const effectiveMax = customMaxNum !== undefined ? customMaxNum : def.defaultMax;
                  const isCustom = customMinNum !== undefined || customMaxNum !== undefined;

                  // Live evaluation against current effective bounds
                  const evalInfo = hasVal ? evaluateCustomLabValue(numVal, effectiveMin, effectiveMax, def.id) : null;

                  // Formatted reference range text
                  let displayRefRange = def.defaultRefText;
                  if (isCustom) {
                    if (effectiveMin !== undefined && effectiveMax !== undefined) displayRefRange = `${effectiveMin} - ${effectiveMax} ${def.unit}`;
                    else if (effectiveMax !== undefined) displayRefRange = `< ${effectiveMax} ${def.unit}`;
                    else if (effectiveMin !== undefined) displayRefRange = `> ${effectiveMin} ${def.unit}`;
                  }

                  return (
                    <div 
                      key={def.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        hasVal 
                          ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800 shadow-xs' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        
                        {/* 1. Test Name & Category */}
                        <div className="md:w-4/12 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {def.categoryLabelMm}
                            </span>
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {def.nameMm}
                            </h5>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                            {def.nameEn}
                          </span>
                        </div>

                        {/* 2. Value Input + Unit */}
                        <div className="md:w-3/12 flex items-center gap-2">
                          <div className="relative w-full max-w-[170px]">
                            <input
                              type="number"
                              step={def.step || 'any'}
                              placeholder="ရလဒ်ထည့်ပါ"
                              value={rawVal}
                              onChange={(e) => setTestValues({ ...testValues, [def.id]: e.target.value })}
                              className="w-full pr-12 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:border-purple-500 focus:outline-hidden"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-semibold pointer-events-none">
                              {def.unit}
                            </span>
                          </div>
                        </div>

                        {/* 3. Reference Value Display & Edit Button (ဘေးမှာ ယှဉ်ပြထားပြီး Ref Value မတူရင် ပြင်လို့ရခြင်း) */}
                        <div className="md:w-3/12 flex flex-col justify-center text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">
                              စံနှုန်း: <strong className="font-mono text-slate-900 dark:text-white">{displayRefRange}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleEditRef(def.id)}
                              className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                isCustom 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                              title="မိမိဓာတ်ခွဲခန်းမှ စံနှုန်းနှင့် ချိန်ညှိရန်"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>{isEditingRef ? 'ပြီးပြီ' : isCustom ? 'စံနှုန်းပြင်ထားသည်' : 'စံနှုန်းပြင်မည်'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 4. Live Evaluation Status Indicator (Ref Value နဲ့ ချိန်ပြီး များတာ/နည်းတာ တခါတည်းပြခြင်း) */}
                        <div className="md:w-2/12 flex items-center md:justify-end">
                          {hasVal && evalInfo ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${evalInfo.badgeClass}`}>
                              {evalInfo.labelMm}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              - အကွက်ဗလာ -
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Custom Ref Range Editor */}
                      {isEditingRef && (
                        <div className="mt-2.5 pt-2.5 border-t border-purple-100 dark:border-purple-900/50 flex flex-wrap items-center gap-2 text-xs bg-purple-50/60 dark:bg-purple-950/40 p-2.5 rounded-xl">
                          <span className="font-bold text-purple-900 dark:text-purple-200 text-[11px]">
                            ဓာတ်ခွဲခန်းစံနှုန်း ချိန်ညှိရန်:
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">အနည်းဆုံး (Min):</span>
                            <input
                              type="number"
                              step="any"
                              placeholder={def.defaultMin !== undefined ? String(def.defaultMin) : 'Min'}
                              value={custom?.min ?? ''}
                              onChange={(e) => handleUpdateCustomRefMin(def.id, e.target.value)}
                              className="w-16 px-2 py-1 text-xs font-mono rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">အများဆုံး (Max):</span>
                            <input
                              type="number"
                              step="any"
                              placeholder={def.defaultMax !== undefined ? String(def.defaultMax) : 'Max'}
                              value={custom?.max ?? ''}
                              onChange={(e) => handleUpdateCustomRefMax(def.id, e.target.value)}
                              className="w-16 px-2 py-1 text-xs font-mono rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>

                          <span className="text-[11px] font-mono text-purple-800 dark:text-purple-300">
                            {def.unit}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleResetToDefaultRef(def.id)}
                            className="ml-auto text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                          >
                            မူလစံနှုန်းအတိုင်း ပြန်ထားမည်
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notes & Doctor Review */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဓာတ်ခွဲခန်း မှတ်ချက် (Notes)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ဥပမာ- ဆီးချိုနှင့် အသည်း/ကျောက်ကပ် ပုံမှန်စစ်ဆေးချက်"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆရာဝန်၏ သုံးသပ်ချက် / ညွှန်ကြားချက် (Doctor's Review)
                  </label>
                  <input
                    type="text"
                    value={doctorReview}
                    onChange={(e) => setDoctorReview(e.target.value)}
                    placeholder="ဥပမာ- သွေးတွင်းသကြားဓာတ် ပုံမှန်ဖြစ်သဖြင့် လက်ရှိဆေးပမာဏအတိုင်း ဆက်လက်သောက်သုံးရန်"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>အကွက်အားလုံး ရှင်းလင်းမည်</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenAdd(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    မလုပ်တော့ပါ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || filledCount === 0}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting 
                        ? 'သိမ်းဆည်းနေသည်...' 
                        : `ရွေးချယ်ထားသော (${filledCount}) ခု သိမ်းမည်`}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
