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
 * For patients under 18, adult cutoffs are NOT applied; clinical pediatric guidance is required.
 */
export function calculateBMI(weightKg: number, heightCm: number, age?: number): {
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
  isPediatric?: boolean;
  sourceMm: string;
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

  // Pediatric safety guard (Age < 18)
  if (age !== undefined && age < 18) {
    return {
      bmi,
      category: 'normal',
      labelMm: 'ကလေး/ဆယ်ကျော်သက် (BMI-for-age ဇယားဖြင့် ဆရာဝန်သာ သတ်မှတ်ရန်)',
      labelEn: 'Pediatric (Requires WHO Growth Percentile Chart)',
      color: 'text-indigo-700 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-300 dark:border-indigo-800',
      riskMm: 'အသက် ၁၈ နှစ်အောက် ကလေးနှင့် ဆယ်ကျော်သက်များအတွက် လူကြီးစံနှုန်း BMI သတ်မှတ်ချက်များကို အသုံးမပြုရပါ။',
      adviceMm: 'ကလေးငယ်များ၏ ကြီးထွားဖွံ့ဖြိုးမှုကို အသက်၊ လနှင့် ကျား/မ အလိုက် WHO BMI-for-age Percentile ဇယားဖြင့် ကလေးအထူးကုဆရာဝန်နှင့်သာ စစ်ဆေးအကဲဖြတ်သင့်ပါသည်။',
      idealWeightRangeKg: { min: idealMin, max: idealMax },
      dailyWaterRequirementLiters: dailyWaterLiters,
      isPediatric: true,
      sourceMm: 'ရင်းမြစ်: WHO Child Growth Standards (5-19 years)',
    };
  }

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
      sourceMm: 'ရင်းမြစ်: Asian BMI criteria (WHO WPRO) & WHO',
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
      sourceMm: 'ရင်းမြစ်: Asian BMI criteria (WHO WPRO)',
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
      sourceMm: 'ရင်းမြစ်: Asian BMI criteria (WHO WPRO)',
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
      sourceMm: 'ရင်းမြစ်: Asian BMI criteria (WHO WPRO)',
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
    sourceMm: 'ရင်းမြစ်: Asian BMI criteria (WHO WPRO)',
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

export function calculateBPCategory(
  systolic: number, 
  diastolic: number,
  age?: number,
  isPregnant?: boolean
): {
  category: BloodPressureCategory;
  labelMm: string;
  labelEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  advice: string;
  isPediatric?: boolean;
  isPregnancyAlert?: boolean;
  sourceMm: string;
} {
  // 1. Pregnancy Safety Guard
  if (isPregnant) {
    if (systolic >= 140 || diastolic >= 90) {
      return {
        category: 'stage2',
        labelMm: '⚠️ ကိုယ်ဝန်ဆောင် သွေးတိုး သတိပေးချက် (≥ 140/90 mmHg)',
        labelEn: 'Gestational Hypertension / Preeclampsia Alert',
        color: 'text-rose-700 dark:text-rose-400 font-extrabold',
        bgColor: 'bg-rose-50 dark:bg-rose-950/50',
        borderColor: 'border-rose-400 dark:border-rose-700',
        advice: 'ကိုယ်ဝန်ဆောင်ချိန်အတွင်း သွေးပေါင်ချိန် ၁၄၀/၉၀ mmHg နှင့် အထက်သည် ကိုယ်ဝန်ဆိပ်တက်ခြင်း (Preeclampsia) သို့မဟုတ် ကိုယ်ဝန်ဆောင် သွေးတိုးရောဂါ လက္ခဏာဖြစ်နိုင်သဖြင့် သားဖွားမီးယပ် အထူးကုဆရာဝန်နှင့် အမြန်ဆုံး ချက်ချင်း ပြသတိုင်ပင်ပါ။',
        isPregnancyAlert: true,
        sourceMm: 'ရင်းမြစ်: ACOG (American College of Obstetricians and Gynecologists) & WHO Guidelines',
      };
    }
  }

  // 2. Pediatric Safety Guard (Age < 18)
  if (age !== undefined && age < 18) {
    return {
      category: 'normal',
      labelMm: 'ကလေး/ဆယ်ကျော်သက် (ကလေးဆရာဝန်နှင့် သီးသန့်စစ်ဆေးရန်)',
      labelEn: 'Pediatric Blood Pressure (Clinical Assessment Required)',
      color: 'text-indigo-700 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-300 dark:border-indigo-800',
      advice: 'အသက် ၁၈ နှစ်အောက် ကလေးနှင့် ဆယ်ကျော်သက်များ၏ သွေးပေါင်ချိန် ပုံမှန်သတ်မှတ်ချက်သည် အသက်၊ အရပ်နှင့် ကျား/မ အလိုက် ရာခိုင်နှုန်းဇယား (Percentiles) ဖြင့်သာ တိကျစွာ ခွဲခြားနိုင်သဖြင့် လူကြီးစံနှုန်းဖြင့် မသတ်မှတ်ဘဲ ကလေးအထူးကုဆရာဝန်နှင့် တိုင်ပင်ဆွေးနွေးရန် လိုအပ်ပါသည်။',
      isPediatric: true,
      sourceMm: 'ရင်းမြစ်: AAP (American Academy of Pediatrics) Clinical Practice Guideline',
    };
  }

  // 3. Adult Classification (ACC/AHA 2017)
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'crisis',
      labelMm: 'အရေးပေါ် သွေးတိုးလွန်ခြင်း (Hypertensive Crisis)',
      labelEn: 'Hypertensive Crisis',
      color: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-300 dark:border-rose-800',
      advice: 'ချက်ချင်း အရေးပေါ် ဆေးကုသမှု ခံယူပါ သို့မဟုတ် ဆရာဝန်ထံ ပြသပါ။',
      sourceMm: 'ရင်းမြစ်: ACC/AHA 2017 Blood Pressure Guidelines',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'stage2',
      labelMm: 'အဆင့် ၂ သွေးတိုး (Hypertension Stage 2)',
      labelEn: 'Hypertension Stage 2',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/40',
      borderColor: 'border-red-300 dark:border-red-800',
      advice: 'ဆရာဝန်နှင့် ပြသ၍ ဆေးသောက်ရန်နှင့် အငန်လျှော့စားရန် လိုအပ်ပါသည်။',
      sourceMm: 'ရင်းမြစ်: ACC/AHA 2017 Blood Pressure Guidelines',
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'stage1',
      labelMm: 'အဆင့် ၁ သွေးတိုး (Hypertension Stage 1)',
      labelEn: 'Hypertension Stage 1',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-300 dark:border-amber-800',
      advice: 'နေထိုင်စားသောက်မှုပုံစံ ပြုပြင်ပြောင်းလဲရန်နှင့် သွေးပေါင်ပုံမှန်တိုင်းပါ။',
      sourceMm: 'ရင်းမြစ်: ACC/AHA 2017 Blood Pressure Guidelines',
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'elevated',
      labelMm: 'အနည်းငယ်မြင့်နေသော သွေးပေါင် (Elevated)',
      labelEn: 'Elevated BP',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
      borderColor: 'border-yellow-300 dark:border-yellow-800',
      advice: 'ကိုယ်လက်လှုပ်ရှားမှုပြုလုပ်ပါ၊ အငန်လျှော့စားပါ။',
      sourceMm: 'ရင်းမြစ်: ACC/AHA 2017 Blood Pressure Guidelines',
    };
  }
  return {
    category: 'normal',
    labelMm: 'ပုံမှန်သွေးပေါင် (Normal BP)',
    labelEn: 'Normal BP',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
    advice: 'သွေးပေါင်ချိန် ပုံမှန်အခြေအနေကောင်းတွင် ရှိနေပါသည်။',
    sourceMm: 'ရင်းမြစ်: ACC/AHA 2017 Blood Pressure Guidelines',
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
  sourceMm: string;
} {
  const source = 'ရင်းမြစ်: ADA (American Diabetes Association) Standards of Care';

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
        sourceMm: source,
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
        sourceMm: source,
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
      sourceMm: source,
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
        sourceMm: source,
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
        sourceMm: source,
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
        sourceMm: source,
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
      sourceMm: source,
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
      sourceMm: source,
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
      sourceMm: source,
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
      sourceMm: source,
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
    sourceMm: source,
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
    // Complete Blood Count (CBC)
    case 'hemoglobin':
      if (value < 8.0) return { status: 'critical', labelMm: 'ပြင်းထန်သွေးအားနည်း (Severe Anemia)', labelEn: 'Severe Anemia', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '12 - 17 g/dL' };
      if (value < 12.0) return { status: 'low', labelMm: 'သွေးအားနည်းသည် (Mild/Mod Anemia)', labelEn: 'Low Hb (Anemia)', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '12 - 17 g/dL' };
      if (value > 17.5) return { status: 'high', labelMm: 'သွေးပျစ်/မြင့်သည် (Polycythemia)', labelEn: 'High Hb', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '12 - 17 g/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal Hb', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '12 - 17 g/dL' };

    case 'wbc':
      if (value > 15000) return { status: 'critical', labelMm: 'အလွန်မြင့် (ပြင်းထန်ပိုးဝင်ခြင်း)', labelEn: 'High Leukocytosis', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '4,000 - 11,000 /µL' };
      if (value > 11000) return { status: 'high', labelMm: 'မြင့်သည် (ပိုးဝင်/ရောင်ရမ်းမှု)', labelEn: 'Elevated WBC', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '4,000 - 11,000 /µL' };
      if (value < 4000) return { status: 'low', labelMm: 'နည်းသည် (ခုခံအားနည်း)', labelEn: 'Low WBC (Leukopenia)', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '4,000 - 11,000 /µL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal WBC', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '4,000 - 11,000 /µL' };

    case 'platelets':
      if (value < 50000) return { status: 'critical', labelMm: 'အလွန်နည်း (သွေးယိုစိမ့်မှုသတိပြု)', labelEn: 'Critical Thrombocytopenia', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '150,000 - 450,000 /µL' };
      if (value < 150000) return { status: 'low', labelMm: 'နည်းနေသည် (သွေးလွန်တုပ်ကွေးစစ်ဆေး)', labelEn: 'Low Platelets', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '150,000 - 450,000 /µL' };
      if (value > 450000) return { status: 'high', labelMm: 'မြင့်နေသည် (Thrombocytosis)', labelEn: 'High Platelets', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '150,000 - 450,000 /µL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal Platelets', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '150,000 - 450,000 /µL' };

    case 'rbc':
      if (value < 4.0) return { status: 'low', labelMm: 'နည်းသည်', labelEn: 'Low RBC', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '4.0 - 5.9 10^6/µL' };
      if (value > 5.9) return { status: 'high', labelMm: 'မြင့်သည်', labelEn: 'High RBC', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '4.0 - 5.9 10^6/µL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '4.0 - 5.9 10^6/µL' };

    case 'pcv_hematocrit':
      if (value < 36) return { status: 'low', labelMm: 'နည်းသည်', labelEn: 'Low PCV', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '36 - 50 %' };
      if (value > 50) return { status: 'high', labelMm: 'မြင့်သည် (သွေးပျစ်)', labelEn: 'High PCV', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '36 - 50 %' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '36 - 50 %' };

    case 'esr':
      if (value > 50) return { status: 'critical', labelMm: 'အလွန်မြင့် (ရောင်ရမ်းမှု/ပိုးဝင်)', labelEn: 'High ESR', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '0 - 20 mm/hr' };
      if (value > 20) return { status: 'high', labelMm: 'မြင့်နေသည် (Elevated)', labelEn: 'Elevated ESR', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '0 - 20 mm/hr' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal ESR', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '0 - 20 mm/hr' };

    // Blood Glucose & HbA1c Panel
    case 'fbs':
      if (value >= 126) return { status: 'critical', labelMm: 'ဆီးချိုအဆင့် (Diabetes)', labelEn: 'Diabetic Range', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '70 - 99 mg/dL' };
      if (value >= 100) return { status: 'high', labelMm: 'ဆီးချိုမဖြစ်မီ (Prediabetes)', labelEn: 'Prediabetes (Impaired)', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '70 - 99 mg/dL' };
      if (value < 70) return { status: 'low', labelMm: 'သကြားဓာတ်နည်း (Hypoglycemia)', labelEn: 'Low Sugar', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '70 - 99 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal FBS', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '70 - 99 mg/dL' };

    case 'ppbs':
    case 'rbs':
      if (value >= 200) return { status: 'critical', labelMm: 'ဆီးချိုအဆင့် (Diabetes)', labelEn: 'Diabetic Range', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 140 mg/dL' };
      if (value >= 140) return { status: 'high', labelMm: 'အနည်းငယ်မြင့် (Impaired)', labelEn: 'Elevated Glucose', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 140 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal Glucose', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 140 mg/dL' };

    case 'hba1c':
      if (value >= 8.0) return { status: 'critical', labelMm: 'ထိန်းချုပ်မှုမကောင်း (Poor Control)', labelEn: 'Poorly Controlled', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 5.7 %' };
      if (value >= 6.5) return { status: 'high', labelMm: 'ဆီးချိုရောဂါ (Diabetes)', labelEn: 'Diabetes', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 5.7 %' };
      if (value >= 5.7) return { status: 'high', labelMm: 'ဆီးချိုမဖြစ်မီ (Prediabetes)', labelEn: 'Prediabetes', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 5.7 %' };
      return { status: 'normal', labelMm: 'ပုံမှန် ကောင်းမွန် (Normal)', labelEn: 'Optimal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 5.7 %' };

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

    case 'directBilirubin':
      if (value > 0.3) return { status: 'high', labelMm: 'မြင့်နေသည် (သည်းခြေပြွန်သတိပြု)', labelEn: 'Elevated', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '0.0 - 0.3 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '0.0 - 0.3 mg/dL' };

    case 'alp':
      if (value > 147) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '44 - 147 U/L' };
      if (value < 44) return { status: 'low', labelMm: 'နည်းသည်', labelEn: 'Low', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '44 - 147 U/L' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '44 - 147 U/L' };

    case 'albumin':
      if (value < 3.5) return { status: 'low', labelMm: 'နည်းသည် (အသည်း/အာဟာရ)', labelEn: 'Low Albumin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '3.5 - 5.0 g/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Albumin', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '3.5 - 5.0 g/dL' };

    case 'totalProtein':
      if (value < 6.0) return { status: 'low', labelMm: 'နည်းသည်', labelEn: 'Low Protein', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '6.0 - 8.3 g/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Protein', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '6.0 - 8.3 g/dL' };

    case 'globulin':
      if (value > 3.5) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High Globulin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '2.0 - 3.5 g/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '2.0 - 3.5 g/dL' };

    // Renal & Electrolytes
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

    case 'egfr':
      if (value < 60) return { status: 'critical', labelMm: 'ကျောက်ကပ်လုပ်ဆောင်မှု ကျဆင်း (CKD)', labelEn: 'Low eGFR (<60)', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '> 90 mL/min' };
      if (value < 90) return { status: 'high', labelMm: 'အနည်းငယ်ကျဆင်းနေသည်', labelEn: 'Mildly Decreased', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '> 90 mL/min' };
      return { status: 'normal', labelMm: 'ကောင်းမွန် (Optimal)', labelEn: 'Normal eGFR', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '> 90 mL/min' };

    case 'sodium':
      if (value < 135) return { status: 'low', labelMm: 'ဆိုဒီယမ်နည်း (Hyponatremia)', labelEn: 'Low Sodium', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '135 - 145 mEq/L' };
      if (value > 145) return { status: 'high', labelMm: 'ဆိုဒီယမ်များ (Hypernatremia)', labelEn: 'High Sodium', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '135 - 145 mEq/L' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Sodium', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '135 - 145 mEq/L' };

    case 'potassium':
      if (value < 3.5) return { status: 'low', labelMm: 'ပိုတက်စီယမ်နည်း (Hypokalemia)', labelEn: 'Low Potassium', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '3.5 - 5.0 mEq/L' };
      if (value > 5.0) return { status: 'critical', labelMm: 'ပိုတက်စီယမ်များ (နှလုံးခုန်သတိပြု)', labelEn: 'High Potassium (Critical)', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '3.5 - 5.0 mEq/L' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal Potassium', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '3.5 - 5.0 mEq/L' };

    case 'chloride':
      if (value < 96) return { status: 'low', labelMm: 'နည်းသည်', labelEn: 'Low Chloride', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', refRange: '96 - 106 mEq/L' };
      if (value > 106) return { status: 'high', labelMm: 'များနေသည်', labelEn: 'High Chloride', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '96 - 106 mEq/L' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '96 - 106 mEq/L' };

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

    case 'vldl':
      if (value > 30) return { status: 'high', labelMm: 'မြင့်နေသည်', labelEn: 'High VLDL', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 30 mg/dL' };
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Normal VLDL', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 30 mg/dL' };

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

    // Inflammatory Markers & Vitamins
    case 'crp':
      if (value > 10.0) return { status: 'critical', labelMm: 'ရောင်ရမ်းမှု အလွန်မြင့်မား (High Inflammation)', labelEn: 'High CRP', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 5.0 mg/L' };
      if (value > 5.0) return { status: 'high', labelMm: 'ရောင်ရမ်းမှု အနည်းငယ်ရှိ (Elevated)', labelEn: 'Elevated CRP', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 5.0 mg/L' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal CRP', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 5.0 mg/L' };

    case 'ferritin':
      if (value < 20) return { status: 'low', labelMm: 'သံဓာတ်သိုလှောင်မှုနည်း (Iron Deficiency)', labelEn: 'Low Ferritin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '20 - 250 ng/mL' };
      if (value > 300) return { status: 'high', labelMm: 'သံဓာတ်များနေသည် (Elevated)', labelEn: 'High Ferritin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '20 - 250 ng/mL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal Ferritin', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '20 - 250 ng/mL' };

    case 'vitaminD':
      if (value < 20) return { status: 'critical', labelMm: 'ဗီတာမင် D ချို့တဲ့ (Deficient)', labelEn: 'Vitamin D Deficiency', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '30 - 100 ng/mL' };
      if (value < 30) return { status: 'low', labelMm: 'ဗီတာမင် D မလုံလောက် (Insufficient)', labelEn: 'Insufficient', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '30 - 100 ng/mL' };
      return { status: 'normal', labelMm: 'လုံလောက် ကောင်းမွန် (Sufficient)', labelEn: 'Optimal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '30 - 100 ng/mL' };

    case 'vitaminB12':
      if (value < 200) return { status: 'low', labelMm: 'ဗီတာမင် B12 နည်း (အာရုံကြော/သွေး)', labelEn: 'Low B12', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '200 - 900 pg/mL' };
      return { status: 'normal', labelMm: 'ပုံမှန် (Normal)', labelEn: 'Normal B12', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '200 - 900 pg/mL' };

    case 'microalbumin':
      if (value >= 300) return { status: 'critical', labelMm: 'ကျောက်ကပ်သိသာစွာထိခိုက် (Macroalbuminuria)', labelEn: 'Macroalbuminuria', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', refRange: '< 30 mg/g' };
      if (value >= 30) return { status: 'high', labelMm: 'ကနဦး ကျောက်ကပ်ထိခိုက် (Microalbuminuria)', labelEn: 'Microalbuminuria', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', refRange: '< 30 mg/g' };
      return { status: 'normal', labelMm: 'ပုံမှန် ကောင်းမွန် (Normal)', labelEn: 'Normal', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', refRange: '< 30 mg/g' };

    default:
      return { status: 'normal', labelMm: 'ပုံမှန်', labelEn: 'Recorded', badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', refRange: '-' };
  }
}

/**
 * Dynamically evaluate a lab value against custom lab reference bounds or standard bounds.
 * Allows user-adjusted lab ranges to immediately reflect in clinical status evaluation.
 */
export function evaluateCustomLabValue(
  value: number,
  refMin?: number,
  refMax?: number,
  fallbackParamKey?: string
): LabParamEvaluation {
  // If user provided custom bounds
  if (refMin !== undefined && refMax !== undefined) {
    if (value < refMin) {
      const isSevere = value < refMin * 0.7;
      return {
        status: isSevere ? 'critical' : 'low',
        labelMm: isSevere ? `အလွန်နည်း (< ${refMin})` : `နည်းနေသည် (< ${refMin})`,
        labelEn: isSevere ? `Very Low (< ${refMin})` : `Low (< ${refMin})`,
        badgeClass: isSevere 
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' 
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        refRange: `${refMin} - ${refMax}`
      };
    }
    if (value > refMax) {
      const isSevere = value >= refMax * 1.4;
      return {
        status: isSevere ? 'critical' : 'high',
        labelMm: isSevere ? `အလွန်မြင့် (> ${refMax})` : `များနေသည် (> ${refMax})`,
        labelEn: isSevere ? `Very High (> ${refMax})` : `High (> ${refMax})`,
        badgeClass: isSevere 
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' 
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        refRange: `${refMin} - ${refMax}`
      };
    }
    return {
      status: 'normal',
      labelMm: 'ပုံမှန် (Normal)',
      labelEn: 'Normal',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      refRange: `${refMin} - ${refMax}`
    };
  }

  if (refMax !== undefined) {
    if (value > refMax) {
      const isSevere = value >= refMax * 1.5;
      return {
        status: isSevere ? 'critical' : 'high',
        labelMm: isSevere ? `အလွန်မြင့် (> ${refMax})` : `များနေသည် (> ${refMax})`,
        labelEn: isSevere ? `Very High (> ${refMax})` : `High (> ${refMax})`,
        badgeClass: isSevere 
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' 
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        refRange: `< ${refMax}`
      };
    }
    return {
      status: 'normal',
      labelMm: 'ပုံမှန် (Normal)',
      labelEn: 'Normal',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      refRange: `< ${refMax}`
    };
  }

  if (refMin !== undefined) {
    if (value < refMin) {
      const isSevere = value < refMin * 0.7;
      return {
        status: isSevere ? 'critical' : 'low',
        labelMm: isSevere ? `အလွန်နည်း (< ${refMin})` : `နည်းနေသည် (< ${refMin})`,
        labelEn: isSevere ? `Very Low (< ${refMin})` : `Low (< ${refMin})`,
        badgeClass: isSevere 
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' 
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        refRange: `> ${refMin}`
      };
    }
    return {
      status: 'normal',
      labelMm: 'ပုံမှန် (Normal)',
      labelEn: 'Normal',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      refRange: `> ${refMin}`
    };
  }

  // Fallback to built-in dictionary
  if (fallbackParamKey) {
    return evaluateLabParam(fallbackParamKey, value);
  }

  return {
    status: 'normal',
    labelMm: 'စံနှုန်းမှတ်တမ်းတင်ထားသည်',
    labelEn: 'Recorded',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    refRange: '-'
  };
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

/**
 * Parse any date string or number into epoch milliseconds reliably.
 * Supports ISO, YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, etc.
 */
export function parseDateToMs(dateStr?: string | number): number {
  if (!dateStr) return 0;
  if (typeof dateStr === 'number') return dateStr;
  
  const str = String(dateStr).trim();
  if (!str) return 0;

  // Standard ISO / JS Date format test first
  const parsedDirect = new Date(str).getTime();
  if (!isNaN(parsedDirect)) return parsedDirect;

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const mins = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const secs = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const dt = new Date(year, month, day, hours, mins, secs);
    if (!isNaN(dt.getTime())) return dt.getTime();
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const hours = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
    const mins = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
    const secs = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;
    const dt = new Date(year, month, day, hours, mins, secs);
    if (!isNaN(dt.getTime())) return dt.getTime();
  }

  return 0;
}

/**
 * Format date string into user-friendly DD-MM-YYYY format
 */
export function formatDateLabel(dateStr?: string | number): { date: string; time: string } {
  const ms = parseDateToMs(dateStr);
  if (!ms) {
    return { date: String(dateStr || ''), time: '' };
  }
  const dt = new Date(ms);
  const day = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const year = dt.getFullYear();
  const hours = String(dt.getHours()).padStart(2, '0');
  const mins = String(dt.getMinutes()).padStart(2, '0');

  return {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${mins}`
  };
}

