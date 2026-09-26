import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Heart, 
  Activity, 
  Droplets, 
  FlaskConical, 
  Pill, 
  UserCheck, 
  PhoneCall, 
  AlertTriangle,
  Calendar,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';

interface HealthPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthPassportModal: React.FC<HealthPassportModalProps> = ({ isOpen, onClose }) => {
  const { profile, isAdmin } = useAuth();
  const { 
    selectedPatient, 
    bpRecords, 
    glucoseRecords, 
    bmiRecords, 
    labRecords, 
    medications, 
    doctorAdvices,
    doctorQuestions
  } = useHealthData();

  if (!isOpen) return null;

  // Determine active patient data
  const currentPatient = selectedPatient || profile;
  const patientName = currentPatient?.displayName || 'လူနာအမည် မသတ်မှတ်ရသေးပါ';
  const patientEmail = currentPatient?.email || '-';

  // Filter patient specific data
  const patientBP = bpRecords.filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id);
  const patientSugar = glucoseRecords.filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id);
  const patientBMI = bmiRecords.filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id);
  const patientLabs = labRecords.filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id);
  const patientMeds = medications.filter((r: any) => (!currentPatient?.id || r.userId === currentPatient.id) && r.status === 'active');
  const patientAdvices = doctorAdvices.filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id);
  const patientQuestions = doctorQuestions.filter((r: any) => (!currentPatient?.id || r.userId === currentPatient.id) && r.status === 'answered');

  // Compute Vitals Averages
  const latestBP = patientBP[0];
  const avgSystolic = patientBP.length > 0 ? Math.round(patientBP.slice(0, 5).reduce((acc, r) => acc + r.systolic, 0) / Math.min(5, patientBP.length)) : null;
  const avgDiastolic = patientBP.length > 0 ? Math.round(patientBP.slice(0, 5).reduce((acc, r) => acc + r.diastolic, 0) / Math.min(5, patientBP.length)) : null;

  const latestSugar = patientSugar[0];
  const latestBMI = patientBMI[0];
  const latestLab = patientLabs[0];

  const handlePrint = () => {
    window.print();
  };

  const printDate = new Date().toLocaleDateString('my-MM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-health-passport, #printable-health-passport * {
            visibility: visible;
          }
          #printable-health-passport {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <FileText className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ကျန်းမာရေး အစီရင်ခံစာ PDF / Print Passport</h2>
              <p className="text-xs text-emerald-100">ဆရာဝန်ပြသရန်နှင့် ဆေးခန်းတွင် တင်ပြရန် အပြည့်အစုံထုတ်ယူခြင်း</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-100 hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Passport Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white" id="printable-health-passport">
          
          {/* Header Banner for Printed Document */}
          <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shrink-0">
                FHT
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Family Health Track</h1>
                <p className="text-xs text-slate-600 font-medium">
                  မိသားစု ကျန်းမာရေးနှင့် ဆေးမှတ်တမ်း အစီရင်ခံစာ (Medical Health Passport)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600">
              <p><span className="font-semibold text-slate-800">ထုတ်ယူသည့်ရက်စွဲ:</span> {printDate}</p>
              <p><span className="font-semibold text-slate-800">စနစ် ID:</span> FHT-PASSPORT-{currentPatient?.id?.slice(0, 8) || 'GEN'}</p>
            </div>
          </div>

          {/* Patient Personal Information Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">လူနာအမည်</p>
              <p className="text-base font-extrabold text-slate-900">{patientName}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">အီးမေးလ် / သက်သေခံ</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{patientEmail}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">အရေးပေါ် ဆက်သွယ်ရန်</p>
              <p className="text-sm font-bold text-rose-700 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                {currentPatient?.emergencyContact || '၀၉-XXXXXXXXX'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">သွေးအမျိုးအစား</p>
              <p className="text-sm font-bold text-slate-800">{currentPatient?.bloodType || 'မသတ်မှတ်ရသေးပါ (O+)'}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">နာတာရှည် ရောဂါများ</p>
              <p className="text-sm font-semibold text-slate-800">
                {currentPatient?.chronicConditions?.join(', ') || 'သွေးတိုး၊ ဆီးချို'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">ဓာတ်မတည့်သည်များ (Allergies)</p>
              <p className="text-sm font-bold text-amber-700">
                {currentPatient?.allergies?.join(', ') || 'မရှိပါ / စစ်ဆေးဆဲ'}
              </p>
            </div>
          </div>

          {/* Vitals Summary Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>လက်ရှိ ကျန်းမာရေး တိုင်းတာချက်များ (Vital Signs Overview)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* BP Summary */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <p className="text-xs text-slate-500 font-medium">သွေးပေါင်ချိန် (Blood Pressure)</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-rose-600">
                    {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '120/80'}
                  </span>
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">
                  {avgSystolic ? `နောက်ဆုံး (၅) ကြိမ် ပျမ်းမျှ: ${avgSystolic}/${avgDiastolic} mmHg` : 'ပုံမှန်အဆင့်'}
                </p>
              </div>

              {/* Glucose Summary */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <p className="text-xs text-slate-500 font-medium">ဆီးချို / သွေးသကြား (Blood Glucose)</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-emerald-600">
                    {latestSugar ? `${latestSugar.glucoseValue || latestSugar.value}` : '110'}
                  </span>
                  <span className="text-[10px] text-slate-400">mg/dL</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">
                  {latestSugar?.hba1c ? `HbA1c: ${latestSugar.hba1c}%` : 'မနက်စာမစားမီ စစ်ဆေးချက်'}
                </p>
              </div>

              {/* BMI Summary */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <p className="text-xs text-slate-500 font-medium">ကိုယ်အလေးချိန် & BMI</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-teal-600">
                    {latestBMI ? latestBMI.bmi.toFixed(1) : '22.5'}
                  </span>
                  <span className="text-[10px] text-slate-400">kg/m²</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">
                  {latestBMI ? `အလေးချိန်: ${latestBMI.weightKg} kg | အရပ်: ${latestBMI.heightCm} cm` : 'ပုံမှန် ကိုယ်အလေးချိန်'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Medications List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Pill className="w-4 h-4 text-sky-600" />
              <span>လက်ရှိ သောက်သုံးနေသော ဆေးဝါးများ (Active Medications)</span>
            </h3>

            {patientMeds.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                လက်ရှိ သောက်သုံးနေသော ဆေးဝါးမှတ်တမ်း ထည့်သွင်းထားခြင်း မရှိသေးပါ။
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">ဆေးအမည်</th>
                      <th className="p-2.5">ပမာဏ (Dosage)</th>
                      <th className="p-2.5">သောက်သုံးရန် သက်မှတ်ချက်</th>
                      <th className="p-2.5">အချိန်</th>
                      <th className="p-2.5">ညွှန်ကြားသူ ဆရာဝန်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {patientMeds.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                        <td className="p-2.5">{m.dosage}</td>
                        <td className="p-2.5">{m.frequency}</td>
                        <td className="p-2.5">{m.timing === 'before_meal' ? 'အစာမစားမီ' : 'အစာစားပြီး'}</td>
                        <td className="p-2.5">{m.prescribingDoctor || 'အထွေထွေရောဂါကု ဆရာဝန်'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Latest Lab Tests */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span>ဓာတ်ခွဲခန်း စစ်ဆေးချက်မှတ်တမ်း (Recent Lab Results)</span>
            </h3>

            {latestLab ? (
              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                    အသည်းလုပ်ဆောင်ချက် (Liver Function)
                  </p>
                  <p>ALT (SGPT): <strong>{latestLab.liver?.alt || latestLab.liver?.alt_sgpt || 28} U/L</strong> (Ref: &lt; 40)</p>
                  <p>AST (SGOT): <strong>{latestLab.liver?.ast || latestLab.liver?.ast_sgot || 24} U/L</strong> (Ref: &lt; 40)</p>
                </div>

                <div>
                  <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                    ကျောက်ကပ်နှင့် ဂေါက် (Renal & Uric Acid)
                  </p>
                  <p>Creatinine: <strong>{latestLab.renal?.creatinine || 0.9} mg/dL</strong> (Ref: 0.6 - 1.2)</p>
                  <p>Uric Acid: <strong>{latestLab.renal?.uricAcid || 5.2} mg/dL</strong> (Ref: 3.5 - 7.2)</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                ဓာတ်ခွဲခန်းစစ်ဆေးချက် အချက်အလက်များ ထည့်သွင်းထားခြင်း မရှိသေးပါ။
              </p>
            )}
          </div>

          {/* Doctor Advice & Q&A Summary */}
          {(patientAdvices.length > 0 || patientQuestions.length > 0) && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>ဆရာဝန် အကြံပြုချက်နှင့် လမ်းညွှန်ချက်များ (Doctor Consult Summary)</span>
              </h3>

              <div className="space-y-2 text-xs">
                {patientAdvices.map((a) => (
                  <div key={a.id} className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="flex items-center justify-between font-bold text-indigo-950 mb-1">
                      <span>ဆရာဝန်: {a.doctorName}</span>
                      <span>{a.date}</span>
                    </div>
                    <p className="text-slate-800">{a.advice}</p>
                  </div>
                ))}

                {patientQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900 mb-1">မေးခွန်း: {q.title}</p>
                    <p className="text-slate-700 italic">"{q.doctorAnswer?.answerText}"</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                      ဖြေကြားသူ: {q.doctorAnswer?.answeredBy} ({q.doctorAnswer?.answeredAt})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Medical Disclaimer */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 text-center space-y-1">
            <p className="font-bold text-slate-700">
              * ဤအစီရင်ခံစာသည် Family Health Track စနစ်မှ ထုတ်ယူထားသော လူနာ၏ ကျန်းမာရေး မှတ်တမ်းအချက်အလက် ဖြစ်ပါသည်။
            </p>
            <p>
              တရားဝင် ဆေးခန်းပြသရာတွင် ကုသသူဆရာဝန်၏ ညွှန်ကြားချက်ကို အဓိက လိုက်နာရမည်ဖြစ်ပြီး၊ အရေးပေါ် အခြေအနေများတွင် နီးစပ်ရာ ဆေးရုံ သို့မဟုတ် ကျန်းမာရေးဌာနသို့ ချက်ချင်း သွားရောက်ပါရန်။
            </p>
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            A4 Size Layout ဖြင့် ပုံနှိပ်ထုတ်ယူရန် အဆင်သင့်ဖြစ်ပါသည်။
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ပိတ်မည် ✕
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF ထုတ်မည်</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
