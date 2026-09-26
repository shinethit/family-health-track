import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Smile, 
  Ear, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  FileText, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Info, 
  Glasses, 
  Activity,
  Award,
  ChevronRight,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

export interface DentalRecord {
  id: string;
  date: string;
  treatmentType: 'Checkup' | 'Cleaning' | 'Filling' | 'Extraction' | 'Root Canal' | 'Braces' | 'Other';
  toothNumber?: string;
  dentistName?: string;
  clinicName?: string;
  cost?: number;
  notes?: string;
  nextCheckupDate?: string;
}

export interface EyePrescription {
  id: string;
  date: string;
  odSphere: string; // Right eye
  odCylinder: string;
  odAxis: string;
  osSphere: string; // Left eye
  osCylinder: string;
  osAxis: string;
  pd: string; // Pupil distance
  optometristName?: string;
  glassesType?: 'Single Vision' | 'Bifocal' | 'Progressive' | 'Reading' | 'Contact Lens';
  notes?: string;
}

export interface HearingRecord {
  id: string;
  date: string;
  leftEarStatus: 'Normal' | 'Mild Loss' | 'Moderate Loss' | 'Severe Loss';
  rightEarStatus: 'Normal' | 'Mild Loss' | 'Moderate Loss' | 'Severe Loss';
  testedFrequencyHz?: number;
  tinnitusPresent: boolean;
  notes?: string;
  audiologist?: string;
}

export const SpecialtyCareModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dental' | 'eye' | 'ear'>('dental');

  // --- DENTAL STATE ---
  const [dentalRecords, setDentalRecords] = useState<DentalRecord[]>(() => {
    const saved = localStorage.getItem('fht_dental_records');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        date: '2025-11-15',
        treatmentType: 'Cleaning',
        dentistName: 'ဒေါက်တာထွန်းထွန်း (သွားဆရာဝန်)',
        clinicName: 'Grace Dental Clinic',
        notes: '၆ လတစ်ကြိမ် သွားကျောက်ရှင်းခြင်း ပြုလုပ်ခဲ့သည်။ မေးရိုးအံသွား ပုံမှန်ရှိသည်။',
        nextCheckupDate: '2026-05-15'
      }
    ];
  });
  const [showAddDentalModal, setShowAddDentalModal] = useState(false);
  const [newDental, setNewDental] = useState<Partial<DentalRecord>>({
    date: new Date().toISOString().split('T')[0],
    treatmentType: 'Checkup',
    notes: ''
  });

  // Tooth selector chart (32 teeth)
  const [selectedTeeth, setSelectedTeeth] = useState<Record<number, 'Healthy' | 'Cavity' | 'Filled' | 'Missing'>>(() => {
    const saved = localStorage.getItem('fht_selected_teeth');
    return saved ? JSON.parse(saved) : { 16: 'Filled', 26: 'Cavity' };
  });
  const [activeToothNum, setActiveToothNum] = useState<number | null>(null);

  // Dental Brushing Timer
  const [brushTimer, setBrushTimer] = useState<number>(120);
  const [isBrushing, setIsBrushing] = useState<boolean>(false);
  const [quadrant, setQuadrant] = useState<string>('အပေါ်ညာဘက် သွားများ');

  // --- EYE STATE ---
  const [eyePrescriptions, setEyePrescriptions] = useState<EyePrescription[]>(() => {
    const saved = localStorage.getItem('fht_eye_prescriptions');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        date: '2025-10-10',
        odSphere: '-1.25',
        odCylinder: '-0.50',
        odAxis: '180',
        osSphere: '-1.50',
        osCylinder: '-0.25',
        osAxis: '175',
        pd: '63',
        glassesType: 'Single Vision',
        optometristName: 'ဒေါက်တာမြတ်နိုး (မျက်စိအထူးကု)',
        notes: 'ကွန်ပျူတာကြည့်ချိန် Blue Light Filter မှန်ဘီလူး တပ်ရန် အကြံပြုထားသည်။'
      }
    ];
  });
  const [showAddEyeModal, setShowAddEyeModal] = useState(false);
  const [newEye, setNewEye] = useState<Partial<EyePrescription>>({
    date: new Date().toISOString().split('T')[0],
    odSphere: '0.00',
    odCylinder: '0.00',
    odAxis: '0',
    osSphere: '0.00',
    osCylinder: '0.00',
    osAxis: '0',
    pd: '62',
    glassesType: 'Single Vision'
  });

  // Interactive Snellen Eye Screening Test
  const [snellenLevel, setSnellenLevel] = useState<number>(0);
  const [snellenScore, setSnellenScore] = useState<string>('');
  const snellenLines = [
    { vision: '20/200 (6/60)', size: 'text-7xl', letters: 'E' },
    { vision: '20/100 (6/30)', size: 'text-5xl', letters: 'F P' },
    { vision: '20/70 (6/20)', size: 'text-4xl', letters: 'T O Z' },
    { vision: '20/50 (6/15)', size: 'text-3xl', letters: 'L P E D' },
    { vision: '20/30 (6/9)', size: 'text-2xl', letters: 'P E C F D' },
    { vision: '20/20 (6/6 - Normal)', size: 'text-xl', letters: 'E D F C Z P' }
  ];

  // Ishihara Color Blindness Test
  const [ishiharaIndex, setIshiharaIndex] = useState<number>(0);
  const [ishiharaUserAnswer, setIshiharaUserAnswer] = useState<string>('');
  const [ishiharaScore, setIshiharaScore] = useState<number>(0);
  const [ishiharaFinished, setIshiharaFinished] = useState<boolean>(false);

  const ishiharaPlates = [
    { number: '12', description: 'လူတိုင်း ရှင်းလင်းစွာ မြင်နိုင်သော ထိန်းချုပ်နမူနာပုံ', circleBg: 'bg-gradient-to-tr from-amber-400 via-rose-400 to-orange-500' },
    { number: '8', description: 'အစိမ်း/အနီ အရောင်ခွဲခြားနိုင်စွမ်း စစ်ဆေးမှု', circleBg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-red-400' },
    { number: '29', description: 'အရောင်မခွဲနိုင်သူများ ၇0 သို့မဟုတ် အခြားကိန်းဂဏန်း မြင်တတ်သည်', circleBg: 'bg-gradient-to-tr from-pink-400 via-purple-400 to-emerald-400' },
    { number: '5', description: 'အစိမ်းရောင်နှင့် အနီရောင် ကာလာဘလိုင်းနက် စစ်ဆေးမှု', circleBg: 'bg-gradient-to-bl from-green-500 via-orange-400 to-red-500' }
  ];

  // --- EAR STATE ---
  const [hearingRecords, setHearingRecords] = useState<HearingRecord[]>(() => {
    const saved = localStorage.getItem('fht_hearing_records');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        date: '2025-12-01',
        leftEarStatus: 'Normal',
        rightEarStatus: 'Normal',
        tinnitusPresent: false,
        notes: 'အကြားအာရုံ စစ်ဆေးမှု ပုံမှန်ရှိသည်။ နားကြပ်ကျယ်ကျယ် နားမထောင်ရန် သတိပေးထားသည်။'
      }
    ];
  });
  const [playingFrequency, setPlayingFrequency] = useState<number | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Local storage save triggers
  useEffect(() => {
    localStorage.setItem('fht_dental_records', JSON.stringify(dentalRecords));
  }, [dentalRecords]);

  useEffect(() => {
    localStorage.setItem('fht_selected_teeth', JSON.stringify(selectedTeeth));
  }, [selectedTeeth]);

  useEffect(() => {
    localStorage.setItem('fht_eye_prescriptions', JSON.stringify(eyePrescriptions));
  }, [eyePrescriptions]);

  useEffect(() => {
    localStorage.setItem('fht_hearing_records', JSON.stringify(hearingRecords));
  }, [hearingRecords]);

  // Brushing timer logic
  useEffect(() => {
    let interval: any = null;
    if (isBrushing && brushTimer > 0) {
      interval = setInterval(() => {
        setBrushTimer(prev => prev - 1);
      }, 1000);
    } else if (brushTimer === 0) {
      setIsBrushing(false);
      setQuadrant('ပြီးပါပြီ! သွားများ စင်ကြယ်သွားပါပြီ ✨');
    }
    return () => clearInterval(interval);
  }, [isBrushing, brushTimer]);

  useEffect(() => {
    if (brushTimer > 90) setQuadrant('၁။ အပေါ် ညာဘက် သွားများ (Top Right)');
    else if (brushTimer > 60) setQuadrant('၂။ အပေါ် ဘယ်ဘက် သွားများ (Top Left)');
    else if (brushTimer > 30) setQuadrant('၃။ အောက် ညာဘက် သွားများ (Bottom Right)');
    else if (brushTimer > 0) setQuadrant('၄။ အောက် ဘယ်ဘက် သွားများ (Bottom Left)');
  }, [brushTimer]);

  // Tone Generator function using Web Audio API
  const playTone = (freqHz: number) => {
    try {
      if (playingFrequency === freqHz) {
        stopTone();
        return;
      }
      stopTone();
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqHz, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAudioCtx(ctx);
      setPlayingFrequency(freqHz);
    } catch (e) {
      console.error(e);
    }
  };

  const stopTone = () => {
    if (audioCtx) {
      audioCtx.close();
      setAudioCtx(null);
    }
    setPlayingFrequency(null);
  };

  // Dental Record Handlers
  const handleAddDental = (e: React.FormEvent) => {
    e.preventDefault();
    const record: DentalRecord = {
      id: Date.now().toString(),
      date: newDental.date || new Date().toISOString().split('T')[0],
      treatmentType: (newDental.treatmentType as any) || 'Checkup',
      toothNumber: newDental.toothNumber,
      dentistName: newDental.dentistName,
      clinicName: newDental.clinicName,
      cost: newDental.cost ? Number(newDental.cost) : undefined,
      notes: newDental.notes,
      nextCheckupDate: newDental.nextCheckupDate
    };
    setDentalRecords([record, ...dentalRecords]);
    setShowAddDentalModal(false);
    setNewDental({ date: new Date().toISOString().split('T')[0], treatmentType: 'Checkup', notes: '' });
  };

  const deleteDentalRecord = (id: string) => {
    setDentalRecords(dentalRecords.filter(r => r.id !== id));
  };

  // Eye Prescription Handlers
  const handleAddEye = (e: React.FormEvent) => {
    e.preventDefault();
    const record: EyePrescription = {
      id: Date.now().toString(),
      date: newEye.date || new Date().toISOString().split('T')[0],
      odSphere: newEye.odSphere || '0.00',
      odCylinder: newEye.odCylinder || '0.00',
      odAxis: newEye.odAxis || '0',
      osSphere: newEye.osSphere || '0.00',
      osCylinder: newEye.osCylinder || '0.00',
      osAxis: newEye.osAxis || '0',
      pd: newEye.pd || '62',
      glassesType: (newEye.glassesType as any) || 'Single Vision',
      optometristName: newEye.optometristName,
      notes: newEye.notes
    };
    setEyePrescriptions([record, ...eyePrescriptions]);
    setShowAddEyeModal(false);
  };

  const deleteEyePrescription = (id: string) => {
    setEyePrescriptions(eyePrescriptions.filter(r => r.id !== id));
  };

  // Tooth condition toggle
  const cycleToothStatus = (num: number) => {
    const current = selectedTeeth[num] || 'Healthy';
    const nextMap: Record<string, 'Healthy' | 'Cavity' | 'Filled' | 'Missing'> = {
      'Healthy': 'Cavity',
      'Cavity': 'Filled',
      'Filled': 'Missing',
      'Missing': 'Healthy'
    };
    setSelectedTeeth({ ...selectedTeeth, [num]: nextMap[current] });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Specialty Care Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-xs font-bold border border-teal-300/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Specialities Care & Self-Tests
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              သွား၊ မျက်စိ နှင့် နား/အကြားအာရုံ အထူးကု မှတ်တမ်းနှင့် စစ်ဆေးမှုများ
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl">
              သွားကျန်းမာရေးနှင့် သွားပြကြိုး၊ မျက်စိအမြင်အာရုံ စစ်ဆေးမှု Snellen/Ishihara ကာလာဘလိုင်းနက် စစ်ဆေးမှုနှင့် နားကြားအာရုံ အသံကြိမ်နှုန်းစစ်စနစ်များ။
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('dental')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dental' ? 'bg-white text-teal-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <Smile className="w-4 h-4 text-emerald-500" /> သွားနှင့် ခံတွင်း
            </button>
            <button
              onClick={() => setActiveTab('eye')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'eye' ? 'bg-white text-teal-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <Eye className="w-4 h-4 text-cyan-500" /> မျက်စိနှင့် အမြင်
            </button>
            <button
              onClick={() => setActiveTab('ear')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ear' ? 'bg-white text-teal-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <Ear className="w-4 h-4 text-amber-400" /> နားနှင့် အကြား
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DENTAL CARE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'dental' && (
        <div className="space-y-6">
          {/* Brushing Timer & Interactive Teeth Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 2-Min Brushing Coach */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">၂ မိနစ် သွားတိုက် နာရီစနစ် (Brushing Coach)</h3>
                      <p className="text-slate-500 text-[11px]">ခံတွင်းသန့်ရှင်းရေး အကောင်းဆုံး ရရှိရန်</p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200/80 my-3">
                  <div className="text-4xl font-extrabold text-emerald-700 font-mono tracking-wider">
                    {Math.floor(brushTimer / 60)}:{(brushTimer % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-2">{quadrant}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  {!isBrushing ? (
                    <button
                      onClick={() => {
                        setIsBrushing(true);
                        if (brushTimer === 0) setBrushTimer(120);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-4 h-4" /> စတင်တိုက်မည်
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsBrushing(false)}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      ခဏရပ်မည်
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsBrushing(false);
                      setBrushTimer(120);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  * နေ့စဉ် မနက်/ည ၂ ကြိမ်၊ ၂ မိနစ်စီ ဖလူအိုရိုက် ပါသော သွားတိုက်ဆေးဖြင့် တိုက်ပေးပါ။
                </p>
              </div>
            </div>

            {/* Interactive Teeth Map (Adult 32 Teeth) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-emerald-600" /> သွားအခြေအနေ ပြကွက် (Interactive Teeth Chart)
                  </h3>
                  <p className="text-slate-500 text-xs">သွားနံပါတ်တစ်ခုစီကို နှိပ်၍ အခြေအနေပြောင်းလဲမှတ်တမ်းတင်ပါ</p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ကျန်းမာ</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> ပိုးစား</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> ဖိထည့်/ဖာထား</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> နှုတ်ပြီး</span>
                </div>
              </div>

              {/* Teeth Display Grid */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Upper Jaw (Teeth 1 to 16) */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 text-center mb-1">အပေါ် မေးရိုး သွားများ (Upper Arch)</div>
                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map(num => {
                      const st = selectedTeeth[num] || 'Healthy';
                      const colorMap = {
                        'Healthy': 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50',
                        'Cavity': 'bg-rose-500 text-white border-rose-600',
                        'Filled': 'bg-sky-500 text-white border-sky-600',
                        'Missing': 'bg-slate-200 text-slate-400 line-through border-slate-300'
                      };
                      return (
                        <button
                          key={num}
                          onClick={() => cycleToothStatus(num)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${colorMap[st]}`}
                          title={`Tooth #${num}: ${st}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lower Jaw (Teeth 17 to 32) */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 text-center mb-1">အောက် မေးရိုး သွားများ (Lower Arch)</div>
                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center">
                    {Array.from({ length: 16 }, (_, i) => 32 - i).map(num => {
                      const st = selectedTeeth[num] || 'Healthy';
                      const colorMap = {
                        'Healthy': 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50',
                        'Cavity': 'bg-rose-500 text-white border-rose-600',
                        'Filled': 'bg-sky-500 text-white border-sky-600',
                        'Missing': 'bg-slate-200 text-slate-400 line-through border-slate-300'
                      };
                      return (
                        <button
                          key={num}
                          onClick={() => cycleToothStatus(num)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${colorMap[st]}`}
                          title={`Tooth #${num}: ${st}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>နှိပ်လိုက်ပါက <strong>ကျန်းမာ → ပိုးစား → ဖာထား → နှုတ်ပြီး</strong> အစီအစဉ်အတိုင်း ပြောင်းပါမည်။</span>
              </div>
            </div>
          </div>

          {/* Dental History Records List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> သွားကျန်းမာရေး ပြသမှု မှတ်တမ်းများ
                </h3>
                <p className="text-slate-500 text-xs">သွားဆေးခန်းပြသခဲ့သည့် ရက်စွဲနှင့် ဆေးကုသမှု အမျိုးအစားများ</p>
              </div>

              <button
                onClick={() => setShowAddDentalModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> မှတ်တမ်းအသစ် ထည့်မည်
              </button>
            </div>

            {dentalRecords.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Smile className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">သွားဆေးခန်း ပြသမှု မှတ်တမ်း မရှိသေးပါ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dentalRecords.map(rec => (
                  <div key={rec.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {rec.treatmentType === 'Checkup' ? 'ပုံမှန်စစ်ဆေးခြင်း' :
                           rec.treatmentType === 'Cleaning' ? 'သွားကျောက်ရှင်းခြင်း' :
                           rec.treatmentType === 'Filling' ? 'သွားဖာခြင်း' :
                           rec.treatmentType === 'Extraction' ? 'သွားနှုတ်ခြင်း' :
                           rec.treatmentType === 'Root Canal' ? 'အမြစ်ကုသခြင်း' : 'အခြား'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {rec.date}
                        </span>
                      </div>

                      {rec.dentistName && (
                        <p className="text-xs font-bold text-slate-800">
                          {rec.dentistName} {rec.clinicName ? `(${rec.clinicName})` : ''}
                        </p>
                      )}
                      {rec.notes && <p className="text-xs text-slate-600">{rec.notes}</p>}
                      {rec.nextCheckupDate && (
                        <p className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit">
                          နောက်တစ်ကြိမ် ပြသရမည့်ရက်: {rec.nextCheckupDate}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteDentalRecord(rec.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-center cursor-pointer"
                      title="ဖျက်မည်"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EYE & VISION TAB */}
      {/* ========================================================================= */}
      {activeTab === 'eye' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Interactive Snellen Visual Acuity Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">အမြင်အာရုံ စစ်ဆေးမှု (Snellen Vision Screening)</h3>
                      <p className="text-slate-500 text-[11px]">ဖုန်း/ကွန်ပျူတာမှ ၂ ပေအကွာတွင် တည်ရှိ၍ စစ်ဆေးပါ</p>
                    </div>
                  </div>
                </div>

                {/* Snellen Board Display */}
                <div className="bg-white p-6 rounded-xl border border-slate-300 text-center my-4 min-h-[160px] flex flex-col items-center justify-center shadow-inner">
                  <div className={`font-mono font-black tracking-widest text-slate-900 ${snellenLines[snellenLevel].size}`}>
                    {snellenLines[snellenLevel].letters}
                  </div>
                  <div className="mt-3 text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">
                    အဆင့်: {snellenLines[snellenLevel].vision}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    disabled={snellenLevel === 0}
                    onClick={() => setSnellenLevel(prev => Math.max(0, prev - 1))}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs disabled:opacity-40 cursor-pointer"
                  >
                    ← စာလုံးကြီးမည်
                  </button>
                  <button
                    disabled={snellenLevel === snellenLines.length - 1}
                    onClick={() => setSnellenLevel(prev => Math.min(snellenLines.length - 1, prev + 1))}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs disabled:opacity-40 cursor-pointer"
                  >
                    စာလုံးသေးမည် →
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  * မျက်မှန် တပ်ဆင်ထားသူဖြစ်ပါက မျက်မှန်တပ်လျက် တစ်ဖက်စီ ပိတ်၍ စစ်ဆေးနိုင်ပါသည်။
                </p>
              </div>
            </div>

            {/* Ishihara Color Vision Test */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">အရောင်ခွဲခြားနိုင်စွမ်း စစ်ဆေးမှု (Color Vision Test)</h3>
                      <p className="text-slate-500 text-[11px]">Ishihara Plate ရောင်စုံ စစ်ဆေးရေးကတ်</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {ishiharaIndex + 1} / {ishiharaPlates.length}
                  </span>
                </div>

                {!ishiharaFinished ? (
                  <div className="flex flex-col items-center py-4">
                    <div className={`w-36 h-36 rounded-full ${ishiharaPlates[ishiharaIndex].circleBg} flex items-center justify-center shadow-md relative`}>
                      <span className="text-4xl font-extrabold text-slate-800/80 drop-shadow-sm select-none font-mono">
                        {ishiharaPlates[ishiharaIndex].number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-3 text-center max-w-xs">
                      {ishiharaPlates[ishiharaIndex].description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 w-full max-w-xs">
                      <input
                        type="text"
                        placeholder="မြင်တွေ့ရသည့် ကိန်းဂဏန်း..."
                        value={ishiharaUserAnswer}
                        onChange={(e) => setIshiharaUserAnswer(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => {
                          if (ishiharaUserAnswer.trim() === ishiharaPlates[ishiharaIndex].number) {
                            setIshiharaScore(prev => prev + 1);
                          }
                          setIshiharaUserAnswer('');
                          if (ishiharaIndex < ishiharaPlates.length - 1) {
                            setIshiharaIndex(prev => prev + 1);
                          } else {
                            setIshiharaFinished(true);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                      >
                        ရှေ့သို့
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <Award className="w-12 h-12 text-purple-600 mx-auto" />
                    <h4 className="font-extrabold text-slate-900 text-base">စစ်ဆေးမှု ပြီးဆုံးပါပြီ!</h4>
                    <p className="text-xs text-slate-600">
                      ရမှတ်: <strong>{ishiharaScore} / {ishiharaPlates.length}</strong> Correct
                    </p>
                    <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg max-w-xs mx-auto">
                      {ishiharaScore === ishiharaPlates.length ? 'သင်၏ အရောင်ခွဲခြားနိုင်စွမ်း အလွန်ကောင်းမွန်ပါသည်။' : 'အချို့သော အရောင်များတွင် ခွဲခြားရခက်ခဲမှု ရှိနိုင်ပါသည်။'}
                    </p>
                    <button
                      onClick={() => {
                        setIshiharaIndex(0);
                        setIshiharaScore(0);
                        setIshiharaFinished(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      ပြန်လည်စစ်ဆေးမည်
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Eye Prescription Records List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Glasses className="w-5 h-5 text-cyan-600" /> မျက်မှန်/မျက်စိ ပါဝါ မှတ်တမ်းများ (Prescription Records)
                </h3>
                <p className="text-slate-500 text-xs">ညာဘက် (OD) နှင့် ဘယ်ဘက် (OS) ပါဝါ တန်ဖိုးများ</p>
              </div>

              <button
                onClick={() => setShowAddEyeModal(true)}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> ပါဝါအသစ် ထည့်မည်
              </button>
            </div>

            {eyePrescriptions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Glasses className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">မျက်မှန်ပါဝါ မှတ်တမ်း မရှိသေးပါ</p>
              </div>
            ) : (
              <div className="space-y-4">
                {eyePrescriptions.map(ep => (
                  <div key={ep.id} className="p-4 rounded-xl border border-slate-200 hover:border-cyan-300 transition-all bg-white">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                          {ep.glassesType || 'Single Vision'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ep.date}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteEyePrescription(ep.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 font-sans">ညာဘက် မျက်လုံး (OD - Right Eye):</p>
                        <p className="text-slate-600">Sphere (SPH): <strong className="text-cyan-700">{ep.odSphere}</strong></p>
                        <p className="text-slate-600">Cylinder (CYL): <strong>{ep.odCylinder}</strong> | Axis: <strong>{ep.odAxis}°</strong></p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 font-sans">ဘယ်ဘက် မျက်လုံး (OS - Left Eye):</p>
                        <p className="text-slate-600">Sphere (SPH): <strong className="text-cyan-700">{ep.osSphere}</strong></p>
                        <p className="text-slate-600">Cylinder (CYL): <strong>{ep.osCylinder}</strong> | Axis: <strong>{ep.osAxis}°</strong></p>
                      </div>
                    </div>

                    {ep.pd && <p className="text-xs text-slate-600 mt-2">Pupillary Distance (PD): <strong>{ep.pd} mm</strong></p>}
                    {ep.notes && <p className="text-xs text-slate-500 mt-1">{ep.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EAR & HEARING TAB */}
      {/* ========================================================================= */}
      {activeTab === 'ear' && (
        <div className="space-y-6">
          {/* Tone Generator & Hearing Test */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-amber-500" /> အသံကြိမ်နှုန်း စစ်ဆေးစနစ် (Pure Tone Frequency Test)
                  </h3>
                  <p className="text-slate-500 text-xs">နားကြပ်တပ်ဆင်၍ အသံကြိမ်နှုန်း (Hz) တစ်ခုစီကို နှိပ်၍ အသံကြားရခြင်း ရှိမရှိ စမ်းသပ်ပါ</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
                {[
                  { freq: 250, label: '250 Hz (Low Pitch)', desc: 'အသံသြသြ' },
                  { freq: 500, label: '500 Hz (Mid-Low)', desc: 'စကားပြောသံ' },
                  { freq: 1000, label: '1000 Hz (1 kHz Standard)', desc: 'အခြေခံ အသံ' },
                  { freq: 2000, label: '2000 Hz (2 kHz)', desc: 'အလယ်အလတ်' },
                  { freq: 4000, label: '4000 Hz (4 kHz High)', desc: 'စူးစူးဝါးဝါး' },
                  { freq: 8000, label: '8000 Hz (8 kHz High Pitch)', desc: 'အသံစူးစူး' }
                ].map(item => {
                  const isPlaying = playingFrequency === item.freq;
                  return (
                    <button
                      key={item.freq}
                      onClick={() => playTone(item.freq)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isPlaying 
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]' 
                          : 'bg-slate-50 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm">{item.label}</span>
                          {isPlaying ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                        </div>
                        <p className={`text-[11px] mt-1 ${isPlaying ? 'text-amber-100' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>

                      <span className={`text-[10px] font-bold mt-2 inline-block px-2 py-0.5 rounded ${
                        isPlaying ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {isPlaying ? 'အသံထွက်နေသည်...' : 'စမ်းသပ်ရန် နှိပ်ပါ'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  အကယ်၍ 4000Hz သို့မဟုတ် 8000Hz ကဲ့သို့သော ကြိမ်နှုန်းမြင့် အသံများကို မကြားရပါက သို့မဟုတ် နားထဲတွင် တစီစီမြည်သံ (Tinnitus) ခံစားနေရပါက နား၊ နှာခေါင်း၊ လည်ပင်း (ENT) အထူးကုနှင့် ပြသသင့်ပါသည်။
                </span>
              </div>
            </div>

            {/* Ear Hygiene & Decibel Safety Guide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-3">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> အကြားအာရုံ ကာကွယ်ရေး လမ်းညွှန်
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">၆၀/၆၀ နားကြပ်စည်းမျဉ်း (60/60 Rule):</p>
                    <p className="text-slate-600">နားကြပ်အသံပမာဏကို ၆၀% ထက် ပိုမကျယ်ပါနှင့်။ တစ်ဆက်တည်း မိနစ် ၆၀ ထက် ပိုမနားထောင်ပါနှင့်။</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">နားဖိုခဲ သန့်ရှင်းရေး သတိပေးချက်:</p>
                    <p className="text-slate-600">နားကပ်ကပ် (Cotton Swabs) ဖြင့် နားအတွင်းသို့ အတင်းထိုးမတုတ်ပါနှင့်။ နားစည်ပေါက်ပြဲနိုင်ပြီး နားဖိုခဲများ အတွင်းသို့ ပိုမိုစုပြုံသွားစေပါသည်။</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-4 text-center">
                * အကြားအာရုံချို့ယွင်းမှုသည် အစပိုင်းတွင် မသိသာဘဲ တဖြည်းဖြည်း သတိမမူမိဘဲ ဖြစ်ပွားတတ်ပါသည်။
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Add Dental Record --- */}
      {showAddDentalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">သွားဆေးခန်း ပြသမှု မှတ်တမ်းအသစ်</h3>
            
            <form onSubmit={handleAddDental} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ရက်စွဲ</label>
                <input
                  type="date"
                  required
                  value={newDental.date}
                  onChange={(e) => setNewDental({ ...newDental, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ဆေးကုသမှု အမျိုးအစား</label>
                <select
                  value={newDental.treatmentType}
                  onChange={(e) => setNewDental({ ...newDental, treatmentType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Checkup">ပုံမှန်စစ်ဆေးခြင်း (Checkup)</option>
                  <option value="Cleaning">သွားကျောက်ရှင်းခြင်း (Cleaning)</option>
                  <option value="Filling">သွားဖာခြင်း (Filling)</option>
                  <option value="Extraction">သွားနှုတ်ခြင်း (Extraction)</option>
                  <option value="Root Canal">အမြစ်ကုသခြင်း (Root Canal)</option>
                  <option value="Braces">သွားပြကြိုးတပ်ခြင်း (Braces)</option>
                  <option value="Other">အခြား</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">သွားဆရာဝန် / ဆေးခန်းအမည်</label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ဒေါက်တာကျော်ဇင် (Grace Dental)"
                  value={newDental.dentistName || ''}
                  onChange={(e) => setNewDental({ ...newDental, dentistName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">မှတ်ချက် / ကုသမှုအသေးစိတ်</label>
                <textarea
                  rows={2}
                  placeholder="အံသွားဖာထားသည်..."
                  value={newDental.notes || ''}
                  onChange={(e) => setNewDental({ ...newDental, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDentalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add Eye Prescription --- */}
      {showAddEyeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">မျက်မှန်ပါဝါ မှတ်တမ်းအသစ် ထည့်သွင်းမည်</h3>
            
            <form onSubmit={handleAddEye} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ရက်စွဲ</label>
                <input
                  type="date"
                  required
                  value={newEye.date}
                  onChange={(e) => setNewEye({ ...newEye, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <p className="font-bold text-cyan-800">ညာဘက် မျက်လုံး (OD)</p>
                  <input
                    type="text"
                    placeholder="Sphere (SPH) e.g. -1.50"
                    value={newEye.odSphere}
                    onChange={(e) => setNewEye({ ...newEye, odSphere: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Cylinder (CYL) e.g. -0.50"
                    value={newEye.odCylinder}
                    onChange={(e) => setNewEye({ ...newEye, odCylinder: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Axis e.g. 180"
                    value={newEye.odAxis}
                    onChange={(e) => setNewEye({ ...newEye, odAxis: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-cyan-800">ဘယ်ဘက် မျက်လုံး (OS)</p>
                  <input
                    type="text"
                    placeholder="Sphere (SPH) e.g. -1.75"
                    value={newEye.osSphere}
                    onChange={(e) => setNewEye({ ...newEye, osSphere: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Cylinder (CYL) e.g. -0.25"
                    value={newEye.osCylinder}
                    onChange={(e) => setNewEye({ ...newEye, osCylinder: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Axis e.g. 175"
                    value={newEye.osAxis}
                    onChange={(e) => setNewEye({ ...newEye, osAxis: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pupillary Distance (PD mm)</label>
                <input
                  type="text"
                  placeholder="e.g. 63"
                  value={newEye.pd}
                  onChange={(e) => setNewEye({ ...newEye, pd: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEyeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white font-bold"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
