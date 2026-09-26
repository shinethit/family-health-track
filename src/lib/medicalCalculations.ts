import { BloodPressureCategory, BloodSugarType, GlucoseStatus, BMICategory } from '../types/health';

/**
 * Calculate exact Age from Date of Birth (DOB)
 */
export function calculateAge(dob: string | undefined): {
  years: number;
  months: number;
  days: number;
  formattedMm: string;
  formattedEn: string;
} | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return null;

  const formattedMm = months > 0 
    ? `${years} နှစ် ${months} လ`
    : `${years} နှစ်`;

  const formattedEn = months > 0
    ? `${years} yrs ${months} mos`
    : `${years} yrs`;

  return { years, months, days, formattedMm, formattedEn };
}

/**
 * Asian-Pacific & WHO Body Mass Index (BMI) Evaluation
 * For Asian populations, health risks begin at lower BMIs (>= 23 is overweight, >= 25 is obese).
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: BMICategory;
  labelMm: string;
  labelEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  riskMm: string;
  adviceMm: string;
  idealWeightRangeKg: { min: number; max: number };
  dailyWaterRequirementLiters: number;
} | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  // Ideal weight range for Asian criteria: 18.5 to 22.9 BMI
  const idealMin = Math.round(18.5 * (heightM * heightM) * 10) / 10;
  const idealMax = Math.round(22.9 * (heightM * heightM) * 10) / 10;

  // Daily water recommendation: weight in kg * 35 ml
  const dailyWaterLiters = Math.round((weightKg * 35 / 1000) * 10) / 10;

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'underweight',
      labelMm: 'ပိန်လွန်းသည် (Underweight)',
      labelEn: 'Underweight',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-300 dark:border-blue-800',
      riskMm: 'ကိုယ်ခံအားနည်းခြင်း၊ အရိုးပွခြင်းနှင့် အာဟာရချို့တဲ့ခြင်း ဖြစ်နိုင်ခြေရှိပါသည်။',
      adviceMm: 'အာဟာရပြည့်ဝသော အစားအစာ (ပရိုတင်း၊ ကြက်ဥ၊ နို့၊ အစေ့အဆန်) ပိုမိုစားသုံးပြီး ကြွက်သားတက်စေရန် လေ့ကျင့်ခန်းလုပ်ပါ။',
      idealWeightRangeKg: { min: idealMin, max: idealMax },
      dailyWaterRequirementLiters: dailyWaterLiters,
    };
  }

  if (bmi <= 22.9) {
    return {
      bmi,
      category: 'normal',
      labelMm: 'ပုံမှန် ကိုယ်အလေးချိန် (Normal Weight)',
      labelEn: 'Normal (Asian Criteria)',
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-300 dark:border-emerald-800',
      riskMm: 'ကျန်းမာရေးနှင့် ညီညွတ်သော ပုံမှန်အဆင့်ဖြစ်ပြီး ရောဂါဖြစ်နိုင်ခြေ နည်းပါးပါသည်။',
      adviceMm: 'လက်ရှိ မျှတသော အစားအသောက်နှင့် လမ်းလျှောက်ခြင်း၊ လေ့ကျင့်ခန်း ပုံမှန် အလေ့အကျင့်ကို ဆက်လက်ထိန်းသိမ်းပါ။',
      idealWeightRangeKg: { min: idealMin, max: idealMax },
      dailyWaterRequirementLiters: dailyWaterLiters,
    };
  }

  if (bmi <= 24.9) {
    return {
      bmi,
      category: 'overweight',
      labelMm: 'ကိုယ်အလေးချိန် အနည်းငယ်ပို (Overweight / Pre-obese)',
      labelEn: 'Overweight (Pre-obese)',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-300 dark:border-amber-800',
      riskMm: 'သွေးတိုး၊ သွေးတွင်းအဆီနှင့် ဆီးချို စတင်ဖြစ်ပွားနိုင်ခြေ အလယ်အလတ် ရှိလာပါသည်။',
      adviceMm: 'အချို၊ အဆီ၊ အကြော်အလှော်နှင့် ကစီဓာတ်လျှော့စားပါ၊ တစ်နေ့ မိနစ် ၃၀ ခန့် လမ်းသွက်သွက်လျှောက်ပါ။',
      idealWeightRangeKg: { min: idealMin, max: idealMax },
      dailyWaterRequirementLiters: dailyWaterLiters,
    };
  }

  if (bmi <= 29.9) {
    return {
      bmi,
      category: 'obese1',
      labelMm: 'အဝလွန် အဆင့် ၁ (Obese Class 1)',
      labelEn: 'Obese Class 1',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      borderColor: 'border-orange-300 dark:border-orange-800',
      riskMm: 'သွေးတိုး၊ ဆီးချို၊ အသည်းအဆီဖုံးနှင့် နှလုံးရောဂါဖြစ်နိုင်ခြေ သိသာစွာ မြင့်မားပါသည်။',
      adviceMm: 'ဆရာဝန် သို့မဟုတ် အာဟာရပညာရှင်နှင့် တိုင်ပင်၍ ကိုယ်အလေးချိန် ၅-၁၀% လျှော့ချရန် စနစ်တကျ အစီအစဉ်ဆွဲပါ။',
      idealWeightRangeKg: { min: idealMin, max: idealMax },
      dailyWaterRequirementLiters: dailyWaterLiters,
    };
  }

  return {
    bmi,
    category: 'obese2',
    labelMm: 'အဝလွန် အဆင့် ၂ / ပြင်းထန် (Obese Class 2 / Severe)',
    labelEn: 'Obese Class 2 (Severe)',
    color: 'text-rose-700 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-300 dark:border-rose-800',
    riskMm: 'နှလုံးသွေးကြောကျဉ်း၊ အဆစ်အမြစ်ပျက်စီးခြင်း၊ လေဖြတ်ခြင်းနှင့် ဆီးချိုရောဂါ အန္တရာယ် အလွန်မြင့်မားပါသည်။',
    adviceMm: 'အထူးကုဆရာဝန်နှင့် အမြန်ဆုံးပြသ၍ ဆေးကုသမှုနှင့် ကိုယ်အလေးချိန်ထိန်းသိမ်းမှု အစီအစဉ် ပြုလုပ်ပါ။',
    idealWeightRangeKg: { min: idealMin, max: idealMax },
    dailyWaterRequirementLiters: dailyWaterLiters,
  };
}

/**
 * Waist circumference evaluation (Central Obesity Risk)
 * Asian cutoff: Men > 90 cm (35.4 in), Women > 80 cm (31.5 in)
 */
export function calculateWaistRisk(waistCm: number | undefined, gender: 'male' | 'female' | 'other' = 'male'): {
  status: 'normal' | 'high_risk';
  labelMm: string;
  adviceMm: string;
} | null {
  if (!waistCm || waistCm <= 0) return null;
  const threshold = gender === 'female' ? 80 : 90;
  if (waistCm > threshold) {
    return {
      status: 'high_risk',
      labelMm: `ဗိုက်အဆီစုခြင်း / ခါးအတိုင်းအတာ များနေသည် (> ${threshold} cm)`,
      adviceMm: 'ဝမ်းဗိုက်အဆီ (Visceral Fat) များခြင်းသည် အသည်းအဆီဖုံးနှင့် နှလုံးရောဂါဖြစ်နိုင်ခြေကို တိုက်ရိုက်မြင့်တက်စေပါသည်။',
    };
  }
  return {
    status: 'normal',
    labelMm: `ခါးအတိုင်းအတာ ပုံမှန် (≤ ${threshold} cm)`,
    adviceMm: 'ဝမ်းဗိုက်အဆီစုခြင်း မရှိဘဲ ပုံမှန်အကွာအဝေးအတွင်း ရှိနေပါသည်။',
  };
}

// Unit conversion helpers
export function ftInToCm(feet: number, inches: number): number {
  const totalInches = (feet || 0) * 12 + (inches || 0);
  return Math.round(totalInches * 2.54 * 10) / 10;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return { feet, inches };
}

export function lbToKg(lb: number): number {
  return Math.round(lb * 0.45359237 * 10) / 10;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function calculateBPCategory(systolic: number, diastolic: number): {
  category: BloodPressureCategory;
  labelMm: string;
  labelEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  advice: string;
} {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'crisis',
      labelMm: 'အရေးပေါ် သွေးတိုးလွန်ခြင်း',
      labelEn: 'Hypertensive Crisis',
      color: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-300 dark:border-rose-800',
      advice: 'ချက်ချင်း အရေးပေါ် ဆေးကုသမှု ခံယူပါ သို့မဟုတ် ဆရာဝန်ထံ ပြသပါ။',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'stage2',
      labelMm: 'အဆင့် ၂ သွေးတိုး',
      labelEn: 'Hypertension Stage 2',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/40',
      borderColor: 'border-red-300 dark:border-red-800',
      advice: 'ဆရာဝန်နှင့် ပြသ၍ ဆေးသောက်ရန်နှင့် အငန်လျှော့စားရန် လိုအပ်ပါသည်။',
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'stage1',
      labelMm: 'အဆင့် ၁ သွေးတိုး',
      labelEn: 'Hypertension Stage 1',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-300 dark:border-amber-800',
      advice: 'နေထိုင်စားသောက်မှုပုံစံ ပြုပြင်ပြောင်းလဲရန်နှင့် သွေးပေါင်ပုံမှန်တိုင်းပါ။',
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'elevated',
      labelMm: 'အနည်းငယ်မြင့်နေသော သွေးပေါင်',
      labelEn: 'Elevated BP',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
      borderColor: 'border-yellow-300 dark:border-yellow-800',
      advice: 'ကိုယ်လက်လှုပ်ရှားမှုပြုလုပ်ပါ၊ အငန်လျှော့စားပါ။',
    };
  }
  return {
    category: 'normal',
    labelMm: 'ပုံမှန်သွေးပေါင်',
    labelEn: 'Normal BP',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
    advice: 'သွေးပေါင်ချိန် ပုံမှန်အခြေအနေကောင်းတွင် ရှိနေပါသည်။',
  };
}

export function calculateGlucoseStatus(value: number, type: BloodSugarType): {
  status: GlucoseStatus;
  labelMm: string;
  labelEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  advice: string;
} {
  if (type === 'hba1c') {
    if (value < 5.7) {
      return {
        status: 'normal',
        labelMm: 'ပုံမှန် (Normal HbA1c)',
        labelEn: 'Normal HbA1c',
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        advice: '၃ လပတ် သွေးတွင်းသကြားဓာတ် ပုံမှန်ရှိပါသည်။',
      };
    }
    if (value <= 6.4) {
      return {
        status: 'pre_diabetic',
        labelMm: 'ဆီးချိုအကြိုအဆင့် (Pre-diabetes)',
        labelEn: 'Pre-diabetes',
        color: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        borderColor: 'border-amber-300 dark:border-amber-800',
        advice: 'ဆီးချိုမဖြစ်အောင် အချိုလျှော့စားပြီး လေ့ကျင့်ခန်းလုပ်ပါ။',
      };
    }
    return {
      status: 'high',
      labelMm: 'ဆီးချိုအဆင့် (Diabetic)',
      labelEn: 'Diabetes range',
      color: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-300 dark:border-rose-800',
      advice: 'ဆရာဝန်နှင့်တိုင်ပင်၍ ဆေးသောက်ရန်နှင့် စနစ်တကျ ထိန်းသိမ်းရန် လိုအပ်ပါသည်။',
    };
  }

  // Fasting Blood Sugar
  if (type === 'fasting') {
    if (value < 70) {
      return {
        status: 'low',
        labelMm: 'သကြားဓာတ်အလွန်နည်း (Hypoglycemia)',
        labelEn: 'Hypoglycemia',
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/40',
        borderColor: 'border-blue-300 dark:border-blue-800',
        advice: 'သကြားဓာတ်ထိုးကျနေသဖြင့် အချိုရည် (သို့) သကြားလုံး ချက်ချင်းစားသုံးပါ။',
      };
    }
    if (value <= 99) {
      return {
        status: 'normal',
        labelMm: 'ပုံမှန် (Normal Fasting)',
        labelEn: 'Normal Fasting',
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        advice: 'အစာမစားမီ သကြားဓာတ် ပုံမှန်ကောင်းမွန်ပါသည်။',
      };
    }
    if (value <= 125) {
      return {
        status: 'pre_diabetic',
        labelMm: 'ဆီးချိုအကြိုအဆင့် (Pre-diabetes)',
        labelEn: 'Impaired Fasting Glucose',
        color: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        borderColor: 'border-amber-300 dark:border-amber-800',
        advice: 'အချိုနှင့် ကာဗိုဟိုက်ဒရိတ် လျှော့စားပါ၊ ကိုယ်လက်လှုပ်ရှားမှု တိုးမြှင့်ပါ။',
      };
    }
    return {
      status: 'high',
      labelMm: 'သကြားဓာတ်မြင့်နေသည် (High Glucose)',
      labelEn: 'Diabetes range',
      color: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-300 dark:border-rose-800',
      advice: 'ဆရာဝန်နှင့် တွေ့ဆုံ၍ ဆီးချိုဆေးဝါးချိန်ညှိမှု ပြုလုပ်ပါ။',
    };
  }

  // Random or Post-prandial
  if (value < 70) {
    return {
      status: 'low',
      labelMm: 'သကြားဓာတ်နည်းနေသည် (Hypoglycemia)',
      labelEn: 'Low Glucose',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-300 dark:border-blue-800',
      advice: 'သကြားဓာတ်ထိုးကျခြင်း သတိပြုပါ။',
    };
  }
  if (value <= 139) {
    return {
      status: 'normal',
      labelMm: 'ပုံမှန် (Normal)',
      labelEn: 'Normal',
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-300 dark:border-emerald-800',
      advice: 'သကြားဓာတ် ပုံမှန်အကွာအဝေးအတွင်း ရှိပါသည်။',
    };
  }
  if (value <= 199) {
    return {
      status: 'pre_diabetic',
      labelMm: 'အနည်းငယ်မြင့်နေသည် (Elevated)',
      labelEn: 'Impaired Glucose Tolerance',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-300 dark:border-amber-800',
      advice: 'အစားအသောက် စနစ်တကျ ထိန်းသိမ်းရန် လိုအပ်ပါသည်။',
    };
  }
  return {
    status: 'critical',
    labelMm: 'အလွန်မြင့်နေသည် (High Glucose)',
    labelEn: 'High Glucose',
    color: 'text-rose-700 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-300 dark:border-rose-800',
    advice: 'ဆရာဝန်ထံ ပြသ၍ သွေးတွင်းသကြားဓာတ် လျှော့ချရန် ဆေးဝါးသုံးစွဲပါ။',
  };
}

export interface LabParamEvaluation {
  status: 'normal' | 'low' | 'high' | 'critical';
  labelMm: string;
  labelEn: string;
  badgeClass: string;
  refRange: string;
}

export function evaluateLabParam(param: string, value: number): LabParamEvaluation {
  switch (param) {
    // Liver
    case 'ast_sgot':
      if (value > 80) return { status: 'critical', labelMm: 'အလွန်မြင့်', labelEn: 'Very High', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '10 - 40 U/L' };
      if (value > 40) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '10 - 40 U/L' };
      if (value < 10) return { status: 'low', labelMm: 'နည်းသည်', labelEn: 'Low', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '10 - 40 U/L' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '10 - 40 U/L' };

    case 'alt_sgpt':
      if (value > 100) return { status: 'critical', labelMm: 'အလွန်မြင့် (အသည်းရောင်/အဆီဖုံး)', labelEn: 'Significantly High', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '7 - 56 U/L' };
      if (value > 56) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '7 - 56 U/L' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '7 - 56 U/L' };

    case 'totalBilirubin':
      if (value > 2.0) return { status: 'critical', labelMm: 'အသားဝါနိုင်ခြေရှိ', labelEn: 'Jaundice Risk', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '0.2 - 1.2 mg/dL' };
      if (value > 1.2) return { status: 'high', labelMm: 'အနည်းငယ်မြင့်', labelEn: 'Elevated', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '0.2 - 1.2 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '0.2 - 1.2 mg/dL' };

    case 'alp':
      if (value > 147) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '44 - 147 U/L' };
      if (value < 44) return { status: 'low', labelMm: 'နည်းသည်', labelEn: 'Low', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '44 - 147 U/L' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '44 - 147 U/L' };

    // Renal
    case 'creatinine':
      if (value > 2.0) return { status: 'critical', labelMm: 'ကျောက်ကပ်ထိခိုက်မှု သတိပြု', labelEn: 'Critical Renal Impairment', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '0.6 - 1.2 mg/dL' };
      if (value > 1.2) return { status: 'high', labelMm: 'မြင့်နေသည် (သတိပြုရန်)', labelEn: 'Elevated Creatinine', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '0.6 - 1.2 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '0.6 - 1.2 mg/dL' };

    case 'uricAcid':
      if (value > 8.5) return { status: 'critical', labelMm: 'အလွန်မြင့် (ဂေါက်ရောဂါ/အဆစ်ရောင်)', labelEn: 'High Gout Risk', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '3.5 - 7.2 mg/dL' };
      if (value > 7.2) return { status: 'high', labelMm: 'မြင့်နေသည် (Hyperuricemia)', labelEn: 'Elevated Uric Acid', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '3.5 - 7.2 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '3.5 - 7.2 mg/dL' };

    case 'bun':
      if (value > 20) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High BUN', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '7 - 20 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '7 - 20 mg/dL' };

    // Lipid
    case 'totalCholesterol':
      if (value >= 240) return { status: 'critical', labelMm: 'အလွန်မြင့် (နှလုံးသွေးကြောသတိပြု)', labelEn: 'High Risk', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 200 mg/dL' };
      if (value >= 200) return { status: 'high', labelMm: 'အနည်းငယ်မြင့် (Borderline)', labelEn: 'Borderline High', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 200 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Desirable)', labelEn: 'Desirable', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 200 mg/dL' };

    case 'triglycerides':
      if (value >= 200) return { status: 'critical', labelMm: 'အလွန်မြင့်', labelEn: 'High Triglycerides', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 150 mg/dL' };
      if (value >= 150) return { status: 'high', labelMm: 'အနည်းငယ်မြင့်', labelEn: 'Borderline', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 150 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 150 mg/dL' };

    case 'ldl':
      if (value >= 160) return { status: 'critical', labelMm: 'မကောင်းသောအဆီများနေသည်', labelEn: 'High LDL', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 100 mg/dL' };
      if (value >= 100) return { status: 'high', labelMm: 'အသင့်အတင့်မြင့်', labelEn: 'Above Optimal', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 100 mg/dL' };
      return { status: 'normal', labelMm: 'အကောင်းဆုံးအဆင့်', labelEn: 'Optimal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 100 mg/dL' };

    case 'hdl':
      if (value < 40) return { status: 'low', labelMm: 'ကောင်းသောအဆီနည်းနေသည်', labelEn: 'Low HDL (Need > 40)', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '> 40 - 50 mg/dL' };
      return { status: 'normal', labelMm: 'ကောင်းမွန်သည်', labelEn: 'Good HDL', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '> 40 - 50 mg/dL' };

    // Thyroid Function Test (TFT)
    case 'tsh':
      if (value < 0.1) return { status: 'critical', labelMm: 'အလွန်နိမ့် (သိုင်းရွိုက်အဆိပ်သင့်နိုင်ခြေ)', labelEn: 'Significantly Low TSH', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '0.4 - 4.0 µIU/mL' };
      if (value < 0.4) return { status: 'low', labelMm: 'နိမ့်နေသည် (Hyperthyroid သတိပြု)', labelEn: 'Suppressed TSH', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '0.4 - 4.0 µIU/mL' };
      if (value > 10.0) return { status: 'critical', labelMm: 'အလွန်မြင့် (သိုင်းရွိုက်ဟော်မုန်း အားနည်း)', labelEn: 'Significantly High TSH', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '0.4 - 4.0 µIU/mL' };
      if (value > 4.0) return { status: 'high', labelMm: 'မြင့်နေသည် (Hypothyroid သတိပြု)', labelEn: 'Elevated TSH', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '0.4 - 4.0 µIU/mL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Euthyroid)', labelEn: 'Normal TSH', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '0.4 - 4.0 µIU/mL' };

    case 'ft4':
      if (value > 1.8) return { status: 'high', labelMm: 'မြင့်နေသည် (Hyperthyroid)', labelEn: 'High Free T4', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '0.8 - 1.8 ng/dL' };
      if (value < 0.8) return { status: 'low', labelMm: 'နည်းနေသည် (Hypothyroid)', labelEn: 'Low Free T4', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '0.8 - 1.8 ng/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Free T4', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '0.8 - 1.8 ng/dL' };

    case 'ft3':
      if (value > 4.2) return { status: 'high', labelMm: 'မြင့်နေသည် (T3 Toxicosis)', labelEn: 'High Free T3', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '2.3 - 4.2 pg/mL' };
      if (value < 2.3) return { status: 'low', labelMm: 'နည်းနေသည်', labelEn: 'Low Free T3', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '2.3 - 4.2 pg/mL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Free T3', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '2.3 - 4.2 pg/mL' };

    case 'totalT4':
      if (value > 12.0) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High Total T4', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '4.5 - 12.0 µg/dL' };
      if (value < 4.5) return { status: 'low', labelMm: 'နည်းနေသည်', labelEn: 'Low Total T4', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '4.5 - 12.0 µg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Total T4', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '4.5 - 12.0 µg/dL' };

    case 'totalT3':
      if (value > 200) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High Total T3', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '80 - 200 ng/dL' };
      if (value < 80) return { status: 'low', labelMm: 'နည်းနေသည်', labelEn: 'Low Total T3', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '80 - 200 ng/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Total T3', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '80 - 200 ng/dL' };

    case 'antiTpo':
      if (value >= 35) return { status: 'high', labelMm: 'ပိုးတွေ့ရှိ (Autoimmune Risk)', labelEn: 'Positive Antibodies', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', refRange: '< 35 IU/mL' };
      return { status: 'normal', labelMm: 'အနုတ်လက္ခဏာ (Negative)', labelEn: 'Normal / Negative', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 35 IU/mL' };

    default:
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Recorded', badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', refRange: '-' };
  }
}

export interface ThyroidEvaluation {
  category: 'normal' | 'hyperthyroid' | 'hypothyroid' | 'subclinical_hyper' | 'subclinical_hypo' | 'indeterminate';
  labelMm: string;
  labelEn: string;
  badgeClass: string;
  descriptionMm: string;
  clinicalAdviceMm: string;
  symptomsMm: string[];
}

export function evaluateThyroidFunction(tsh?: number, ft4?: number, ft3?: number): ThyroidEvaluation | null {
  if (tsh === undefined && ft4 === undefined && ft3 === undefined) return null;

  // Primary Hyperthyroidism: Low TSH and High FT4 / FT3
  if (tsh !== undefined && tsh < 0.4 && ((ft4 !== undefined && ft4 > 1.8) || (ft3 !== undefined && ft3 > 4.2))) {
    return {
      category: 'hyperthyroid',
      labelMm: 'သိုင်းရွိုက်ဟော်မုန်း အဆိပ်သင့်ခြင်း (Overt Hyperthyroidism)',
      labelEn: 'Hyperthyroidism',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-800',
      descriptionMm: 'သိုင်းရွိုက်ဂလင်းမှ ဟော်မုန်းထုတ်လုပ်မှု လွန်ကဲနေပြီး ခန္ဓာကိုယ်၏ ဇီဝကမ္မဖြစ်စဉ်များ အလွန်အမင်း မြန်ဆန်နေပါသည်။',
      clinicalAdviceMm: 'ဆီးချိုနှင့် ဟော်မုန်းအထူးကု (Endocrinologist) နှင့် အမြန်ပြသပြီး သိုင်းရွိုက်ကျဆေး (Anti-thyroid drugs - Carbimazole/PTU) သောက်သုံးရန် လိုအပ်ပါသည်။ အိုင်အိုဒင်းပါဝင်မှုများသော အစားအစာများကို ဆရာဝန်ညွှန်ကြားချက်အတိုင်း ထိန်းညှိပါ။',
      symptomsMm: ['ရင်တုန်ခြင်း၊ နှလုံးခုန်မြန်ခြင်း', 'အစားစားသော်လည်း ကိုယ်အလေးချိန် လျင်မြန်စွာ ကျဆင်းခြင်း', 'ချွေးထွက်လွန်ခြင်း၊ အပူမခံနိုင်ခြင်း', 'လက်တုန်ခြင်း၊ စိတ်ဂနာမငြိမ်ဖြစ်ခြင်း', 'အိပ်မပျော်ခြင်း၊ နုံးခွေခြင်း']
    };
  }

  // Subclinical Hyperthyroidism: Low TSH but Normal FT4 & FT3
  if (tsh !== undefined && tsh < 0.4 && (ft4 === undefined || (ft4 >= 0.8 && ft4 <= 1.8)) && (ft3 === undefined || (ft3 >= 2.3 && ft3 <= 4.2))) {
    return {
      category: 'subclinical_hyper',
      labelMm: 'ကနဦး သိုင်းရွိုက်ဟော်မုန်း မြင့်တက်ခြင်း (Subclinical Hyperthyroidism)',
      labelEn: 'Subclinical Hyperthyroidism',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800',
      descriptionMm: 'TSH ဟော်မုန်း နည်းပါးနေသော်လည်း သွေးတွင်း FT4/FT3 ပမာဏ ပုံမှန်အဆင့်တွင် ရှိနေဆဲ ဖြစ်ပါသည်။',
      clinicalAdviceMm: 'နှလုံးခုန်မမှန်ခြင်း (Arrhythmia) နှင့် အရိုးပွခြင်းတို့ မဖြစ်စေရန် ၂ လမှ ၃ လအကြာတွင် TFT စစ်ဆေးချက် ပြန်လည်စစ်ဆေးသင့်ပါသည်။',
      symptomsMm: ['အနည်းငယ် ရင်တုန်လွယ်ခြင်း', 'စိတ်ပူပန်လွယ်ခြင်း', 'သွေးပေါင်အနည်းငယ်တက်ခြင်း']
    };
  }

  // Primary Hypothyroidism: High TSH and Low FT4 / FT3
  if (tsh !== undefined && tsh > 4.0 && ((ft4 !== undefined && ft4 < 0.8) || (ft3 !== undefined && ft3 < 2.3))) {
    return {
      category: 'hypothyroid',
      labelMm: 'သိုင်းရွိုက်ဟော်မုန်း အားနည်း/ချို့တဲ့ခြင်း (Overt Hypothyroidism)',
      labelEn: 'Hypothyroidism',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800',
      descriptionMm: 'သိုင်းရွိုက်ဂလင်းမှ လုံလောက်သော ဟော်မုန်းမထုတ်လုပ်နိုင်သဖြင့် ခန္ဓာကိုယ် ဇီဝကမ္မဖြစ်စဉ်များ နှေးကွေးလေးလံနေပါသည်။',
      clinicalAdviceMm: 'သိုင်းရွိုက်ဟော်မုန်း အစားထိုးဆေး (Levothyroxine) ကို မနက်စောစော ဗိုက်ဗလာချိန်တွင် သောက်သုံးရန် လိုအပ်ပါသည်။ ဆရာဝန်နှင့် ပြသ၍ ဆေးပမာဏ ချိန်ညှိပါ။',
      symptomsMm: ['အမြဲတစေ မောပန်းနွမ်းနယ်ပြီး အိပ်ငိုက်ခြင်း', 'အစာနည်းနည်းစားသော်လည်း ကိုယ်အလေးချိန်တက်လာခြင်း', 'အအေးဒဏ် လုံးဝမခံနိုင်ခြင်း', 'အသားအရေ ခြောက်သွေ့ခြင်း၊ ဆံပင်ကျွတ်ခြင်း', 'ဝမ်းချုပ်ခြင်း၊ မျက်နှာဖောသွပ်ခြင်း']
    };
  }

  // Subclinical Hypothyroidism: High TSH but Normal FT4 & FT3
  if (tsh !== undefined && tsh > 4.0 && (ft4 === undefined || (ft4 >= 0.8 && ft4 <= 1.8)) && (ft3 === undefined || (ft3 >= 2.3 && ft3 <= 4.2))) {
    return {
      category: 'subclinical_hypo',
      labelMm: 'ကနဦး သိုင်းရွိုက်ဟော်မုန်း လျော့နည်းခြင်း (Subclinical Hypothyroidism)',
      labelEn: 'Subclinical Hypothyroidism',
      badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-300 dark:border-sky-800',
      descriptionMm: 'သိုင်းရွိုက်အားနည်းခြင်း ကနဦးအဆင့်ဖြစ်ပြီး သွေးတွင်း ကိုလက်စထရော တက်ခြင်းကို တွဲဖက်စစ်ဆေးရန် လိုအပ်ပါသည်။',
      clinicalAdviceMm: 'TSH ပမာဏ > 10 µIU/mL ကျော်ပါက သို့မဟုတ် လက္ခဏာများရှိပါက ဆရာဝန်ထံ ပြသ၍ သိုင်းရွိုက်ဟော်မုန်းဆေး စတင်သောက်သုံးရန် စဉ်းစားရပါမည်။',
      symptomsMm: ['မကြာခဏ မောပန်းနွမ်းနယ်ခြင်း', 'သွေးတွင်းကိုလက်စထရော အနည်းငယ်မြင့်တက်ခြင်း', 'စိတ်ဓာတ်ကျလွယ်ခြင်း']
    };
  }

  // Normal Euthyroid
  if ((tsh === undefined || (tsh >= 0.4 && tsh <= 4.0)) && 
      (ft4 === undefined || (ft4 >= 0.8 && ft4 <= 1.8)) && 
      (ft3 === undefined || (ft3 >= 2.3 && ft3 <= 4.2))) {
    return {
      category: 'normal',
      labelMm: 'သိုင်းရွိုက်ဟော်မုန်း အခြေအနေ ကောင်းမွန်သည် (Normal Euthyroid)',
      labelEn: 'Euthyroid (Normal)',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800',
      descriptionMm: 'TSH နှင့် Free T4/T3 စစ်ဆေးချက်များ ပုံမှန်အဆင့်အတွင်း ရှိနေပါသည်။ သိုင်းရွိုက်ဂလင်း၏ လုပ်ငန်းဆောင်တာများ ကောင်းမွန်မျှတစွာ အလုပ်လုပ်နေပါသည်။',
      clinicalAdviceMm: 'ကျန်းမာရေးနှင့် ညီညွတ်သော နေထိုင်မှုပုံစံကို ဆက်လက်ထိန်းသိမ်းပါ။ တစ်နှစ်လျှင် တစ်ကြိမ် ပုံမှန်စစ်ဆေးပေးပါ။',
      symptomsMm: ['ပုံမှန် ဇီဝကမ္မဖြစ်စဉ်နှင့် လန်းဆန်းတက်ကြွမှု ရှိသည်']
    };
  }

  return {
    category: 'indeterminate',
    labelMm: 'သိုင်းရွိုက် စစ်ဆေးချက် ရလဒ်များ',
    labelEn: 'Thyroid Results Recorded',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    descriptionMm: 'စစ်ဆေးချက်တန်ဖိုးများကို မှတ်တမ်းတင်ထားပါသည်။ တိကျသော ရောဂါအဖြေအတွက် ဆရာဝန်နှင့် ပြသတိုင်ပင်ပါ။',
    clinicalAdviceMm: 'ဓာတ်ခွဲခန်းရလဒ် အဖြေလွှာအား ဆရာဝန်ထံ ပြသပါ။',
    symptomsMm: []
  };
}
