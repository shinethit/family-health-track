import React, { useState } from 'react';
import { 
  Scale, 
  Ruler, 
  Calendar, 
  Activity, 
  Plus, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { 
  calculateAge, 
  calculateBMI, 
  calculateWaistRisk, 
  ftInToCm, 
  cmToFtIn, 
  lbToKg, 
  kgToLb 
} from '../../lib/medicalCalculations';

export const BMIModule: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { bmiRecords, addBMIRecord, deleteBMIRecord, selectedPatient } = useHealthData();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenEditProfile, setIsOpenEditProfile] = useState(false);

  // Form states
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const [heightCmInput, setHeightCmInput] = useState<string>(() => profile?.heightCm ? String(profile.heightCm) : '');
  const [heightFeetInput, setHeightFeetInput] = useState<string>('');
  const [heightInchesInput, setHeightInchesInput] = useState<string>('');

  const [weightKgInput, setWeightKgInput] = useState<string>(() => profile?.weightKg ? String(profile.weightKg) : '');
  const [weightLbInput, setWeightLbInput] = useState<string>('');

  const [waistInput, setWaistInput] = useState<string>(() => profile?.waistCm ? String(profile.waistCm) : '');
  const [recordDate, setRecordDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Edit states (for Date of Birth & Age)
  const [editDob, setEditDob] = useState<string>(() => profile?.dateOfBirth || '');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>(() => profile?.gender || 'male');
  const [editBloodType, setEditBloodType] = useState<string>(() => profile?.bloodType || '');

  // Compute active user metrics
  const activeDOB = selectedPatient?.dateOfBirth || profile?.dateOfBirth;
  const activeAgeResult = calculateAge(activeDOB);
  const activeAgeYears = activeAgeResult ? activeAgeResult.years : (selectedPatient?.age || profile?.age || null);

  const activeHeight = selectedPatient?.heightCm || profile?.heightCm || null;
  const activeWeight = selectedPatient?.weightKg || profile?.weightKg || null;
  const activeWaist = selectedPatient?.waistCm || profile?.waistCm || null;

  const currentBMIResult = (activeWeight && activeHeight) ? calculateBMI(activeWeight, activeHeight) : null;
  const waistRisk = activeWaist ? calculateWaistRisk(activeWaist, (selectedPatient?.gender || profile?.gender || 'male')) : null;

  // Live calculator inside Modal
  const resolvedHeightCm = heightUnit === 'cm' 
    ? Number(heightCmInput) || 0 
    : ftInToCm(Number(heightFeetInput) || 0, Number(heightInchesInput) || 0);

  const resolvedWeightKg = weightUnit === 'kg' 
    ? Number(weightKgInput) || 0 
    : lbToKg(Number(weightLbInput) || 0);

  const liveModalBMI = calculateBMI(resolvedWeightKg, resolvedHeightCm);

  // Handle Save BMI Record
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedHeightCm || !resolvedWeightKg) return;

    setIsSubmitting(true);
    try {
      const calculated = calculateBMI(resolvedWeightKg, resolvedHeightCm);
      await addBMIRecord({
        userId: selectedPatient ? selectedPatient.id : (profile?.id || 'guest-user'),
        userName: selectedPatient ? selectedPatient.displayName : (profile?.displayName || 'အသုံးပြုသူ'),
        heightCm: resolvedHeightCm,
        weightKg: resolvedWeightKg,
        waistCm: waistInput ? Number(waistInput) : undefined,
        bmi: calculated ? calculated.bmi : 22,
        category: calculated ? calculated.category : 'normal',
        date: recordDate,
        notes: notes.trim() || undefined,
      });

      // Also update user's profile with latest height & weight if current user
      if (!selectedPatient) {
        await updateProfile({
          heightCm: resolvedHeightCm,
          weightKg: resolvedWeightKg,
          waistCm: waistInput ? Number(waistInput) : undefined,
          bmi: calculated?.bmi,
        });
      }

      setIsOpenAdd(false);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Profile / DOB update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const calculated = calculateAge(editDob);
    await updateProfile({
      dateOfBirth: editDob,
      age: calculated ? calculated.years : undefined,
      gender: editGender,
      bloodType: editBloodType,
    });
    setIsOpenEditProfile(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                BMI နှင့် ခန္ဓာကိုယ် ဖွဲ့စည်းမှု တွက်ချက်ခြင်း (Body Mass Index & Age)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                အရပ်အမောင်း၊ ကိုယ်အလေးချိန်၊ မွေးသက္ကရာဇ်မှ အသက်တွက်ချက်မှုနှင့် ကျန်းမာသော ကိုယ်အလေးချိန် အညွှန်းကိန်းများ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOpenEditProfile(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            မွေးသက္ကရာဇ် / အသက် ပြင်ဆင်မည်
          </button>

          <button
            onClick={() => setIsOpenAdd(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            BMI မှတ်တမ်းအသစ် ထည့်မည်
          </button>
        </div>
      </div>

      {/* Primary Vitals Cards: Age & BMI Current Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Age & Date of Birth */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-500" />
              တွက်ချက်ထားသော အသက် (Age)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
              အလိုအလျောက်
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {activeAgeYears !== null ? activeAgeYears : '--'}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {activeAgeYears !== null ? 'နှစ် (Years)' : 'နှစ်'}
              </span>
            </div>

            {activeAgeResult ? (
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mt-1">
                တိကျသောအသက်: {activeAgeResult.formattedMm}
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-400 mt-1">
                မွေးသက္ကရာဇ် ထည့်သွင်းတွက်ချက်ပါ
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>မွေးသက္ကရာဇ်:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {activeDOB || 'မထည့်သွင်းရသေးပါ'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Current BMI */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-500" />
              ခန္ဓာကိုယ်အညွှန်း (BMI)
            </span>
            {currentBMIResult && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${currentBMIResult.bgColor} ${currentBMIResult.color} ${currentBMIResult.borderColor}`}>
                {currentBMIResult.labelEn}
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {currentBMIResult ? currentBMIResult.bmi : '--'}
              </span>
              <span className="text-xs font-semibold text-slate-400">kg/m²</span>
            </div>

            <p className={`text-xs font-bold mt-1 ${currentBMIResult?.color || 'text-slate-500'}`}>
              {currentBMIResult ? currentBMIResult.labelMm : 'မှတ်တမ်း မရှိသေးပါ'}
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>စံသတ်မှတ်ချက်:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                အာရှပစိဖိတ် (Asian Criteria)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Height & Weight */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-sky-500" />
              အရပ် နှင့် ကိုယ်အလေးချိန်
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">အရပ်အမောင်း:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeHeight ? `${activeHeight} cm (${cmToFtIn(activeHeight).feet}' ${cmToFtIn(activeHeight).inches}")` : 'မထည့်ရသေးပါ'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">ကိုယ်အလေးချိန်:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeWeight ? `${activeWeight} kg (${kgToLb(activeWeight)} lb)` : 'မထည့်ရသေးပါ'}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>ခါးအတိုင်းအတာ:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {activeWaist ? `${activeWaist} cm` : 'မတိုင်းရသေးပါ'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Ideal Weight & Water Recommendation */}
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:to-cyan-950/40 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              သင့်တော်သော ပစ်မှတ်
            </span>
          </div>

          <div className="mt-2.5 space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                သင့်အရပ်အတွက် သင့်တော်သော ကိုယ်အလေးချိန်:
              </span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {currentBMIResult ? `${currentBMIResult.idealWeightRangeKg.min} kg ~ ${currentBMIResult.idealWeightRangeKg.max} kg` : '--'}
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-200/40 dark:border-emerald-800/40">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-cyan-500" />
                တစ်နေ့ သောက်သင့်သော ရေပမာဏ:
              </span>
              <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
                {currentBMIResult ? `${currentBMIResult.dailyWaterRequirementLiters} လီတာ (ခွက် ၈-၉ ခွက်)` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual BMI Gauge & Spectrum Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          အာရှ-ပစိဖိတ် BMI စံသတ်မှတ်ချက် တိုင်းတာပြကွက် (Asian BMI Classification Spectrum)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          အာရှလူမျိုးများတွင် ခန္ဓာကိုယ်အဆီဓာတ် ပိုမိုလွယ်ကူစွာ စုစည်းတတ်သဖြင့် WHO Asian Standard အရ BMI ၂၃ နှင့်အထက်တွင် ကျန်းမာရေးစောင့်ရှောက်မှု စတင်ရန် သတ်မှတ်ထားပါသည်
        </p>

        {/* Visual Multi-Color Bar */}
        <div className="relative pt-6 pb-2">
          {/* Current Marker Pin */}
          {currentBMIResult && (
            <div 
              className="absolute -top-1 transition-all duration-500 flex flex-col items-center -translate-x-1/2 z-10"
              style={{
                // Map BMI 15 -> 35 to percentage 0% -> 100%
                left: `${Math.min(Math.max(((currentBMIResult.bmi - 15) / (35 - 15)) * 100, 2), 98)}%`
              }}
            >
              <div className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold shadow-md whitespace-nowrap">
                သင့် BMI: {currentBMIResult.bmi}
              </div>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 dark:border-t-white" />
            </div>
          )}

          {/* Color Segments */}
          <div className="h-4 rounded-full overflow-hidden flex shadow-inner">
            {/* Underweight: < 18.5 */}
            <div className="w-[17.5%] bg-blue-400" title="< 18.5: ပိန်လွန်းသည်" />
            {/* Normal: 18.5 - 22.9 */}
            <div className="w-[22%] bg-emerald-500" title="18.5 - 22.9: ပုံမှန်" />
            {/* Overweight: 23.0 - 24.9 */}
            <div className="w-[10%] bg-amber-400" title="23.0 - 24.9: အနည်းငယ်ပို" />
            {/* Obese 1: 25.0 - 29.9 */}
            <div className="w-[25%] bg-orange-500" title="25.0 - 29.9: အဝလွန် အဆင့် ၁" />
            {/* Obese 2: >= 30.0 */}
            <div className="w-[25.5%] bg-rose-500" title=">= 30.0: အဝလွန် အဆင့် ၂" />
          </div>

          {/* Labels underneath */}
          <div className="grid grid-cols-5 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2 gap-1">
            <div>
              <span className="font-bold text-blue-600 dark:text-blue-400 block">&lt; 18.5</span>
              <span>ပိန်လွန်း</span>
            </div>
            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">18.5 - 22.9</span>
              <span>ပုံမှန်</span>
            </div>
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400 block">23 - 24.9</span>
              <span>အနည်းငယ်ပို</span>
            </div>
            <div>
              <span className="font-bold text-orange-600 dark:text-orange-400 block">25 - 29.9</span>
              <span>အဝလွန် (၁)</span>
            </div>
            <div>
              <span className="font-bold text-rose-600 dark:text-rose-400 block">≥ 30</span>
              <span>အဝလွန် (၂)</span>
            </div>
          </div>
        </div>

        {/* Current Assessment & Medical Advice */}
        {currentBMIResult && (
          <div className={`mt-5 p-4 rounded-2xl border text-xs ${currentBMIResult.bgColor} ${currentBMIResult.borderColor}`}>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${currentBMIResult.color}`} />
              <div className="space-y-1">
                <span className={`font-bold ${currentBMIResult.color}`}>
                  {currentBMIResult.labelMm} (အန္တရာယ်အဆင့် သုံးသပ်ချက်)
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {currentBMIResult.riskMm}
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                  💡 <strong>အကြံပြုချက်:</strong> {currentBMIResult.adviceMm}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Waist Risk Callout */}
        {waistRisk && (
          <div className={`mt-3 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            waistRisk.status === 'high_risk' 
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold block">{waistRisk.labelMm}</span>
              <span>{waistRisk.adviceMm}</span>
            </div>
          </div>
        )}
      </div>

      {/* BMI Log History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ကိုယ်အလေးချိန် နှင့် BMI မှတ်တမ်းများ (BMI History Log)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              အချိန်နှင့်အမျှ ကိုယ်အလေးချိန် အတက်အကျနှင့် ကျန်းမာရေး တိုးတက်မှု အခြေအနေ
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            စုစုပေါင်း: {bmiRecords.length} ခု
          </span>
        </div>

        {bmiRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              BMI မှတ်တမ်း မရှိသေးပါ (No BMI Records Yet)
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              သင်၏ အရပ်နှင့် ကိုယ်အလေးချိန်ကို နေ့စဉ် သို့မဟုတ် အပတ်စဉ် မှတ်သားခြင်းဖြင့် သွေးတိုးနှင့် ဆီးချိုရောဂါ ကာကွယ်မှု တိုးတက်စေနိုင်ပါသည်
            </p>
            <button
              onClick={() => setIsOpenAdd(true)}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              ပထမဆုံး BMI မှတ်တမ်း ထည့်သွင်းမည်
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">ရက်စွဲ</th>
                  <th className="py-3 px-4 font-semibold">အရပ် (Height)</th>
                  <th className="py-3 px-4 font-semibold">ကိုယ်အလေးချိန် (Weight)</th>
                  <th className="py-3 px-4 font-semibold">BMI တန်ဖိုး</th>
                  <th className="py-3 px-4 font-semibold">အဆင့်ခွဲခြားချက်</th>
                  <th className="py-3 px-4 font-semibold">ခါးအတိုင်းအတာ</th>
                  <th className="py-3 px-4 font-semibold">မှတ်ချက်</th>
                  <th className="py-3 px-4 font-semibold text-right">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bmiRecords.map((r) => {
                  const evalB = calculateBMI(r.weightKg, r.heightCm);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {r.date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {r.heightCm} cm
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {r.weightKg} kg <span className="font-normal text-slate-400 text-[11px]">({kgToLb(r.weightKg)} lb)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {r.bmi}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {evalB ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalB.bgColor} ${evalB.color} ${evalB.borderColor}`}>
                            {evalB.labelMm}
                          </span>
                        ) : (
                          r.category
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {r.waistCm ? `${r.waistCm} cm` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {r.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteBMIRecord(r.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="မှတ်တမ်းဖျက်မည်"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Add BMI Record */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    BMI နှင့် ကိုယ်အလေးချိန် မှတ်တမ်းအသစ်
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {selectedPatient ? selectedPatient.displayName : profile?.displayName} အတွက်
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpenAdd(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} className="mt-4 space-y-4">
              {/* Height input with unit switch */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-teal-600" />
                    အရပ်အမောင်း (Height)
                  </label>
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setHeightUnit('cm')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${heightUnit === 'cm' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      cm (စင်တီ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit('ft')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${heightUnit === 'ft' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      ft / in (ပေ/လက်မ)
                    </button>
                  </div>
                </div>

                {heightUnit === 'cm' ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={heightCmInput}
                      onChange={(e) => setHeightCmInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 168"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        max="7"
                        required
                        value={heightFeetInput}
                        onChange={(e) => setHeightFeetInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        placeholder="ပေ"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">feet (ပေ)</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        required
                        value={heightInchesInput}
                        onChange={(e) => setHeightInchesInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        placeholder="လက်မ"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">inches (လက်မ)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight input with unit switch */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    ကိုယ်အလေးချိန် (Weight)
                  </label>
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${weightUnit === 'kg' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      kg (ကီလို)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('lb')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${weightUnit === 'lb' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      lb (ပေါင်)
                    </button>
                  </div>
                </div>

                {weightUnit === 'kg' ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weightKgInput}
                      onChange={(e) => setWeightKgInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 65"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={weightLbInput}
                      onChange={(e) => setWeightLbInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 143"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">lb (ပေါင်)</span>
                  </div>
                )}
              </div>

              {/* Waist & Date in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ခါးအတိုင်းအတာ (Waist - cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    placeholder="e.g. 82 cm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ရက်စွဲ (Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Live BMI Calculation Box */}
              {liveModalBMI && (
                <div className={`p-4 rounded-2xl border text-xs ${liveModalBMI.bgColor} ${liveModalBMI.borderColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      တွက်ချက်ရရှိသော BMI:
                    </span>
                    <span className={`text-base font-extrabold ${liveModalBMI.color}`}>
                      {liveModalBMI.bmi} kg/m²
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    အဆင့်: {liveModalBMI.labelMm}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    သင့်တော်သော ကိုယ်အလေးချိန်: {liveModalBMI.idealWeightRangeKg.min} kg ~ {liveModalBMI.idealWeightRangeKg.max} kg
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  မှတ်ချက် (Notes)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  placeholder="e.g. နံနက်စာမစားမီ ချိန်တွယ်ခြင်း"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenAdd(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : 'မှတ်တမ်းသိမ်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Profile / Date of Birth / Age */}
      {isOpenEditProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    မွေးသက္ကရာဇ် နှင့် အသက် ပြင်ဆင်ခြင်း
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    အသက်ကို မွေးနေ့မှ အလိုအလျောက် တိကျစွာ တွက်ချက်ပေးပါသည်
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpenEditProfile(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  မွေးသက္ကရာဇ် (Date of Birth)
                </label>
                <input
                  type="date"
                  required
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Calculated preview */}
              {editDob && (
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs">
                  <span className="font-semibold text-teal-800 dark:text-teal-300 block">
                    တွက်ချက်ရရှိသော အသက်:
                  </span>
                  <div className="text-lg font-extrabold text-teal-900 dark:text-teal-200 mt-0.5">
                    {calculateAge(editDob)?.formattedMm || 'မွေးနေ့မှားယွင်းနေပါသည်'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ကျား/မ (Gender)
                  </label>
                  <select
                    value={editGender}
                    onChange={(e: any) => setEditGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="male">အမျိုးသား (Male)</option>
                    <option value="female">အမျိုးသမီး (Female)</option>
                    <option value="other">အခြား (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    သွေးအုပ်စု (Blood Type)
                  </label>
                  <select
                    value={editBloodType}
                    onChange={(e) => setEditBloodType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenEditProfile(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  အချက်အလက် အတည်ပြုမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
