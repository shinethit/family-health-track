import React, { useState } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { LabTestRecord } from '../../types/health';
import { evaluateLabParam } from '../../lib/medicalCalculations';

export const LabTestModule: React.FC = () => {
  const { labRecords, addLabRecord, deleteLabRecord, selectedPatient, selectedFamilyMember } = useHealthData();
  const { profile } = useAuth();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(() => 
    labRecords.length > 0 ? labRecords[0].id : null
  );

  // Form states
  const [testDate, setTestDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState<string>('အထူးကု ဆေးဓာတ်ခွဲခန်း');
  const [notes, setNotes] = useState<string>('');
  const [doctorReview, setDoctorReview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'liver' | 'renal' | 'lipid'>('liver');

  // Liver Function Test inputs
  const [ast_sgot, setAstSgot] = useState<string>('35');
  const [alt_sgpt, setAltSgpt] = useState<string>('42');
  const [totalBilirubin, setTotalBilirubin] = useState<string>('0.8');
  const [directBilirubin, setDirectBilirubin] = useState<string>('0.2');
  const [alp, setAlp] = useState<string>('85');
  const [albumin, setAlbumin] = useState<string>('4.2');
  const [totalProtein, setTotalProtein] = useState<string>('7.1');

  // Renal & Uric Acid inputs
  const [creatinine, setCreatinine] = useState<string>('1.0');
  const [uricAcid, setUricAcid] = useState<string>('6.5');
  const [bun, setBun] = useState<string>('15');
  const [egfr, setEgfr] = useState<string>('85');

  // Lipid Profile inputs
  const [totalCholesterol, setTotalCholesterol] = useState<string>('210');
  const [triglycerides, setTriglycerides] = useState<string>('175');
  const [hdl, setHdl] = useState<string>('44');
  const [ldl, setLdl] = useState<string>('131');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current selected test details
  const activeRecord = labRecords.find(r => r.id === selectedRecordId) || (labRecords.length > 0 ? labRecords[0] : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

    try {
      await addLabRecord({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        userName: selectedPatient ? selectedPatient.displayName : (selectedFamilyMember ? selectedFamilyMember.name : profile.displayName),
        testDate,
        labName,
        liver: {
          ast_sgot: ast_sgot ? Number(ast_sgot) : undefined,
          alt_sgpt: alt_sgpt ? Number(alt_sgpt) : undefined,
          totalBilirubin: totalBilirubin ? Number(totalBilirubin) : undefined,
          directBilirubin: directBilirubin ? Number(directBilirubin) : undefined,
          alp: alp ? Number(alp) : undefined,
          albumin: albumin ? Number(albumin) : undefined,
          totalProtein: totalProtein ? Number(totalProtein) : undefined,
        },
        renal: {
          creatinine: creatinine ? Number(creatinine) : undefined,
          uricAcid: uricAcid ? Number(uricAcid) : undefined,
          bun: bun ? Number(bun) : undefined,
          egfr: egfr ? Number(egfr) : undefined,
        },
        lipid: {
          totalCholesterol: totalCholesterol ? Number(totalCholesterol) : undefined,
          triglycerides: triglycerides ? Number(triglycerides) : undefined,
          hdl: hdl ? Number(hdl) : undefined,
          ldl: ldl ? Number(ldl) : undefined,
        },
        notes,
        doctorReview,
      });

      setIsOpenAdd(false);
      setNotes('');
      setDoctorReview('');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              ? `လူနာ ${selectedPatient.displayName} ၏ အသည်း၊ ကျောက်ကပ်၊ ယူရစ်အက်စစ်နှင့် သွေးတွင်းအဆီဓာတ်များ`
              : 'Liver Function (LFT), Renal Function & Uric Acid, Lipid Profile စစ်ဆေးချက်မှတ်တမ်းများ'}
          </p>
        </div>

        <button
          onClick={() => setIsOpenAdd(true)}
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
            အထက်ပါခလုတ်ကိုနှိပ်၍ LFT, Creatinine, Uric Acid သို့မဟုတ် Lipid Profile စစ်ဆေးချက်အသစ် ထည့်သွင်းပါ။
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Lab Tests */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                စစ်ဆေးခဲ့သော ရက်စွဲများ ({labRecords.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {labRecords.map((lab) => {
                const isSelected = activeRecord?.id === lab.id;
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

                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{lab.labName}</span>
                    </div>

                    {/* Snapshot summary tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {lab.liver?.alt_sgpt && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          ALT: {lab.liver.alt_sgpt}
                        </span>
                      )}
                      {lab.renal?.creatinine && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Cr: {lab.renal.creatinine}
                        </span>
                      )}
                      {lab.renal?.uricAcid && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Uric: {lab.renal.uricAcid}
                        </span>
                      )}
                      {lab.lipid?.totalCholesterol && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Chol: {lab.lipid.totalCholesterol}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed View of Selected Lab Report */}
          {activeRecord && (
            <div className="lg:col-span-8 space-y-6">
              {/* Header Box */}
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
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">စစ်ဆေးသည့်ရက်စွဲ</span>
                    <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {activeRecord.testDate}
                    </span>
                  </div>
                </div>

                {activeRecord.notes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">လူနာမှတ်ချက်: </span>
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

              {/* Panel 1: Liver Function Test (LFT) */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs">
                      LFT
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        အသည်းလုပ်ဆောင်ချက် စစ်ဆေးခြင်း (Liver Function Test)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        အသည်းရောင်ခြင်း၊ အဆီဖုံးခြင်းနှင့် အသားဝါခြင်း စောင့်ကြည့်စစ်ဆေးချက်
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'alt_sgpt', name: 'SGPT / ALT', val: activeRecord.liver?.alt_sgpt, unit: 'U/L' },
                    { key: 'ast_sgot', name: 'SGOT / AST', val: activeRecord.liver?.ast_sgot, unit: 'U/L' },
                    { key: 'totalBilirubin', name: 'Total Bilirubin', val: activeRecord.liver?.totalBilirubin, unit: 'mg/dL' },
                    { key: 'directBilirubin', name: 'Direct Bilirubin', val: activeRecord.liver?.directBilirubin, unit: 'mg/dL' },
                    { key: 'alp', name: 'ALP (Alk. Phosphatase)', val: activeRecord.liver?.alp, unit: 'U/L' },
                    { key: 'albumin', name: 'Albumin', val: activeRecord.liver?.albumin, unit: 'g/dL' },
                    { key: 'totalProtein', name: 'Total Protein', val: activeRecord.liver?.totalProtein, unit: 'g/dL' },
                  ].map((param) => {
                    if (param.val === undefined || param.val === null) return null;
                    const evalInfo = evaluateLabParam(param.key, param.val);
                    return (
                      <div key={param.key} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{param.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${evalInfo.badgeClass}`}>
                            {evalInfo.labelMm}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                            {param.val}
                          </span>
                          <span className="text-[10px] text-slate-400">{param.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                          Ref: {evalInfo.refRange}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel 2: Renal Function & Uric Acid */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
                      RFT
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        ကျောက်ကပ်လုပ်ဆောင်ချက်နှင့် ယူရစ်အက်စစ် (Renal & Uric Acid)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Creatinine, eGFR ကျောက်ကပ်စစ်ဆေးချက်နှင့် ဂေါက်ရောဂါ ယူရစ်အက်စစ်
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'creatinine', name: 'Creatinine', val: activeRecord.renal?.creatinine, unit: 'mg/dL' },
                    { key: 'uricAcid', name: 'Uric Acid', val: activeRecord.renal?.uricAcid, unit: 'mg/dL' },
                    { key: 'bun', name: 'BUN (Blood Urea)', val: activeRecord.renal?.bun, unit: 'mg/dL' },
                    { key: 'egfr', name: 'eGFR (ကျောက်ကပ်နှုန်း)', val: activeRecord.renal?.egfr, unit: 'mL/min' },
                  ].map((param) => {
                    if (param.val === undefined || param.val === null) return null;
                    const evalInfo = evaluateLabParam(param.key, param.val);
                    return (
                      <div key={param.key} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{param.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${evalInfo.badgeClass}`}>
                            {evalInfo.labelMm}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                            {param.val}
                          </span>
                          <span className="text-[10px] text-slate-400">{param.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                          Ref: {evalInfo.refRange}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel 3: Lipid Profile */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold text-xs">
                      LIPID
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        သွေးတွင်းအဆီဓာတ်စစ်ဆေးခြင်း (Lipid Profile)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ကိုလက်စထရော၊ ထရိုင်ဂလစ်စရိုက်နှင့် ကောင်းသော/မကောင်းသောအဆီများ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'totalCholesterol', name: 'Total Cholesterol', val: activeRecord.lipid?.totalCholesterol, unit: 'mg/dL' },
                    { key: 'triglycerides', name: 'Triglycerides', val: activeRecord.lipid?.triglycerides, unit: 'mg/dL' },
                    { key: 'hdl', name: 'HDL (ကောင်းသောအဆီ)', val: activeRecord.lipid?.hdl, unit: 'mg/dL' },
                    { key: 'ldl', name: 'LDL (မကောင်းသောအဆီ)', val: activeRecord.lipid?.ldl, unit: 'mg/dL' },
                  ].map((param) => {
                    if (param.val === undefined || param.val === null) return null;
                    const evalInfo = evaluateLabParam(param.key, param.val);
                    return (
                      <div key={param.key} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{param.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${evalInfo.badgeClass}`}>
                            {evalInfo.labelMm}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                            {param.val}
                          </span>
                          <span className="text-[10px] text-slate-400">{param.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                          Ref: {evalInfo.refRange}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Comprehensive Lab Record Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                ဓာတ်ခွဲခန်းစစ်ဆေးချက် အသစ်ထည့်သွင်းခြင်း
              </h3>
              <button
                onClick={() => setIsOpenAdd(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              {/* Lab Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    စစ်ဆေးသည့် ရက်စွဲ *
                  </label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆေးရုံ / ဆေးခန်း / ဓာတ်ခွဲခန်း အမည် *
                  </label>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    required
                    placeholder="ဥပမာ- ပန်းလှိုင်၊ ဆာကူရာ၊ ဗဟိုဓာတ်ခွဲခန်း"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Sub-tabs for Form Inputs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('liver')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'liver'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ၁။ အသည်းလုပ်ဆောင်ချက် (LFT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('renal')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'renal'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ၂။ ကျောက်ကပ်နှင့် ယူရစ်အက်စစ်
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lipid')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'lipid'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ၃။ သွေးတွင်းအဆီဓာတ် (Lipid)
                </button>
              </div>

              {/* Tab 1: Liver Function */}
              {activeTab === 'liver' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      SGPT / ALT (7 - 56 U/L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={alt_sgpt}
                      onChange={(e) => setAltSgpt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      SGOT / AST (10 - 40 U/L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ast_sgot}
                      onChange={(e) => setAstSgot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Total Bilirubin (0.2 - 1.2 mg/dL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={totalBilirubin}
                      onChange={(e) => setTotalBilirubin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Direct Bilirubin (0.0 - 0.3 mg/dL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={directBilirubin}
                      onChange={(e) => setDirectBilirubin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ALP (44 - 147 U/L)
                    </label>
                    <input
                      type="number"
                      value={alp}
                      onChange={(e) => setAlp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Albumin (3.5 - 5.0 g/dL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={albumin}
                      onChange={(e) => setAlbumin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Renal & Uric */}
              {activeTab === 'renal' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Serum Creatinine (0.6 - 1.2 mg/dL) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={creatinine}
                      onChange={(e) => setCreatinine(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Uric Acid (3.5 - 7.2 mg/dL) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={uricAcid}
                      onChange={(e) => setUricAcid(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      BUN (7 - 20 mg/dL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bun}
                      onChange={(e) => setBun(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      eGFR (&gt; 90 mL/min)
                    </label>
                    <input
                      type="number"
                      value={egfr}
                      onChange={(e) => setEgfr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Lipid Profile */}
              {activeTab === 'lipid' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Total Cholesterol (&lt; 200 mg/dL)
                    </label>
                    <input
                      type="number"
                      value={totalCholesterol}
                      onChange={(e) => setTotalCholesterol(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Triglycerides (&lt; 150 mg/dL)
                    </label>
                    <input
                      type="number"
                      value={triglycerides}
                      onChange={(e) => setTriglycerides(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      HDL ကောင်းသောအဆီ (&gt; 40-50 mg/dL)
                    </label>
                    <input
                      type="number"
                      value={hdl}
                      onChange={(e) => setHdl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      LDL မကောင်းသောအဆီ (&lt; 100 mg/dL)
                    </label>
                    <input
                      type="number"
                      value={ldl}
                      onChange={(e) => setLdl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Notes & Doctor Remarks */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဓာတ်ခွဲခန်း မှတ်ချက် (Notes)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ဥပမာ- ဆီးချိုနှင့် အသည်းပုံမှန်စစ်ဆေးခြင်း"
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
                    placeholder="ဥပမာ- Triglycerides မြင့်သဖြင့် အဆီလျှော့စားရန်နှင့် Atorvastatin သောက်ရန်"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpenAdd(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : 'Lab မှတ်တမ်းသိမ်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
