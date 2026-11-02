import React from 'react';
import {
  X,
  Activity,
  Droplets,
  Scale,
  Pill,
  FlaskConical,
  Syringe,
  Users,
} from 'lucide-react';
import { useHealthData, resolveCleanName } from '../../../context/HealthDataContext';
import { BloodPressureChart, BloodSugarChart } from '../../charts/HealthCharts';
import {
  calculateAge,
  calculateBMI,
  calculateBPCategory,
  calculateGlucoseStatus,
  parseDateToMs,
} from '../../../lib/medicalCalculations';
import {
  BloodPressureRecord,
  BloodSugarRecord,
  BMIRecord,
  LabTestRecord,
  Medication,
  UserProfile,
  VaccinationRecord,
} from '../../../types/health';

interface AdminPatientComparisonProps {
  patientIds: string[];
  onBack: () => void;
}

type Dated = { date?: string; timestamp?: string; createdAt?: string };

const dateMs = (r: Dated & { testDate?: string }): number =>
  parseDateToMs(r.date || r.timestamp || r.testDate || r.createdAt);

const sortAsc = <T extends Dated & { testDate?: string }>(arr: T[]): T[] =>
  [...arr].sort((a, b) => dateMs(a) - dateMs(b));

const sortDesc = <T extends Dated & { testDate?: string }>(arr: T[]): T[] =>
  [...arr].sort((a, b) => dateMs(b) - dateMs(a));

const fmtDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('my-MM');
};

const avg = (nums: number[]): number | null =>
  nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;

const gluValue = (r: BloodSugarRecord): number | undefined =>
  (typeof r.glucoseValue === 'number' ? r.glucoseValue : r.value);

interface PatientStats {
  patient: UserProfile;
  age: number | null;
  bp: BloodPressureRecord[];
  glu: BloodSugarRecord[];
  bmiRecs: BMIRecord[];
  labs: LabTestRecord[];
  meds: Medication[];
  vaccines: VaccinationRecord[];
  latestBP: BloodPressureRecord | null;
  latestGlu: BloodSugarRecord | null;
  latestBMI: BMIRecord | null;
  avgSys: number | null;
  avgDia: number | null;
  avgGlu: number | null;
}

export const AdminPatientComparison: React.FC<AdminPatientComparisonProps> = ({
  patientIds,
  onBack,
}) => {
  const {
    patientsList,
    familyMembers,
    allBPRecords,
    allGlucoseRecords,
    allBMIRecords,
    allLabRecords,
    allMedicationRecords,
    allVaccineRecords,
  } = useHealthData();

  const ids = patientIds.slice(0, 4);
  const patients = ids
    .map((id) => patientsList.find((p) => p.id === id))
    .filter((p): p is UserProfile => !!p);

  const stats: PatientStats[] = patients.map((patient) => {
    // Include records filed under the patient's family members too, like
    // the filtered views do — a family member's doc id is their userId.
    const scope = new Set<string>([
      patient.id,
      ...familyMembers
        .filter((f) => (f as any).userId === patient.id)
        .map((f) => f.id),
    ]);
    const bp = sortAsc(allBPRecords.filter((r) => scope.has(r.userId)));
    const glu = sortAsc(allGlucoseRecords.filter((r) => scope.has(r.userId)));
    const bmiRecs = sortAsc(allBMIRecords.filter((r) => scope.has(r.userId)));
    const labs = sortDesc(allLabRecords.filter((r) => scope.has(r.userId)));
    const meds = allMedicationRecords.filter((r) => scope.has(r.userId));
    const vaccines = allVaccineRecords.filter((r) => scope.has(r.userId));
    return {
      patient,
      age: (() => {
        const ageObj = calculateAge(patient.dateOfBirth);
        return ageObj ? ageObj.years : (patient.age || null);
      })(),
      bp,
      glu,
      bmiRecs,
      labs,
      meds,
      vaccines,
      latestBP: bp.length > 0 ? bp[bp.length - 1] : null,
      latestGlu: glu.length > 0 ? glu[glu.length - 1] : null,
      latestBMI: bmiRecs.length > 0 ? bmiRecs[bmiRecs.length - 1] : null,
      avgSys: avg(bp.map((r) => r.systolic).filter((n) => typeof n === 'number')),
      avgDia: avg(bp.map((r) => r.diastolic).filter((n) => typeof n === 'number')),
      avgGlu: avg(glu.map(gluValue).filter((n): n is number => typeof n === 'number')),
    };
  });

  const resolveName = (p: UserProfile): string =>
    resolveCleanName(p.displayName, p.email, p.phone);

  const bmiFor = (s: PatientStats): { text: string; label: string | null } => {
    if (s.latestBMI) {
      return { text: `${s.latestBMI.bmi}`, label: null };
    }
    if (s.patient.weightKg && s.patient.heightCm) {
      const calc = calculateBMI(s.patient.weightKg, s.patient.heightCm);
      if (!calc) return { text: 'မရှိသေးပါ', label: null };
      return { text: `${calc.bmi}`, label: calc.labelMm };
    }
    return { text: 'မရှိသေးပါ', label: null };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည်"
            aria-label="အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည်"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>အသုံးပြုသူများ နှိုင်းယှဉ်ခြင်း ({patients.length} ဦး)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ရွေးချယ်ထားသော အသုံးပြုသူများ၏ သွေးပေါင်၊ သွေးချို၊ BMI၊ ဆေးနှင့် ဓာတ်ခွဲမှတ်တမ်းများကို ဘေးချင်းယှဉ် ကြည့်ရှုနိုင်ပါသည်
            </p>
            {patientIds.length > 4 && (
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                တစ်ကြိမ်လျှင် ၄ ဦးအထိသာ နှိုင်းယှဉ်နိုင်သဖြင့် ပထမ ၄ ဦးကိုသာ ပြထားသည်
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
        >
          အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည်
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs text-center text-xs text-slate-500">
          နှိုင်းယှဉ်ရန် အသုံးပြုသူ ရွေးချယ်ထားခြင်း မရှိပါ။
        </div>
      ) : (
        <>
          {/* Comparison Table */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left font-bold text-slate-500 p-2.5 w-[140px]">အချက်</th>
                    {stats.map((s) => (
                      <th key={s.patient.id} className="text-left font-extrabold text-slate-900 dark:text-white p-2.5 min-w-[180px]">
                        {resolveName(s.patient)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Name / Age / Gender */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">အမည် / အသက် / ကျား-မ</td>
                    {stats.map((s) => (
                      <td key={s.patient.id} className="p-2.5 text-slate-800 dark:text-slate-200">
                        <div className="font-bold">{resolveName(s.patient)}</div>
                        <div className="text-slate-500">
                          {s.age !== null ? `${s.age} နှစ်` : 'အသက် မထည့်ရသေးပါ'}
                          {' • '}
                          {s.patient.gender === 'female' ? 'မ' : s.patient.gender === 'male' ? 'ကျား' : '—'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Latest BP */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">
                      <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-rose-500" /> နောက်ဆုံး သွေးပေါင်</span>
                    </td>
                    {stats.map((s) => {
                      const r = s.latestBP;
                      if (!r) return <td key={s.patient.id} className="p-2.5 text-slate-400">မရှိသေးပါ</td>;
                      const cat = calculateBPCategory(r.systolic, r.diastolic);
                      return (
                        <td key={s.patient.id} className="p-2.5">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {r.systolic}/{r.diastolic} <span className="text-[11px] font-semibold text-slate-400">mmHg</span>
                          </div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.bgColor} ${cat.color} ${cat.borderColor}`}>
                            {cat.labelMm}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">{fmtDate(r.date || r.timestamp || r.createdAt)}</div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Average BP */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">ပျမ်းမျှ သွေးပေါင်</td>
                    {stats.map((s) => (
                      <td key={s.patient.id} className="p-2.5 text-slate-800 dark:text-slate-200">
                        {s.avgSys !== null && s.avgDia !== null ? (
                          <div>
                            <span className="font-bold">{s.avgSys}/{s.avgDia} mmHg</span>
                            <span className="text-slate-400"> ({s.bp.length} ကြိမ်)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">မရှိသေးပါ</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Latest Glucose */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">
                      <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-emerald-500" /> နောက်ဆုံး သွေးချို</span>
                    </td>
                    {stats.map((s) => {
                      const r = s.latestGlu;
                      const v = r ? gluValue(r) : undefined;
                      if (!r || v === undefined) return <td key={s.patient.id} className="p-2.5 text-slate-400">မရှိသေးပါ</td>;
                      const status = calculateGlucoseStatus(v, (r.type || r.timing || 'fasting') as never);
                      return (
                        <td key={s.patient.id} className="p-2.5">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {v} <span className="text-[11px] font-semibold text-slate-400">mg/dL</span>
                          </div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                            {status.labelMm}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">{fmtDate(r.date || r.timestamp || r.createdAt)}</div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Average Glucose */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">ပျမ်းမျှ သွေးချို</td>
                    {stats.map((s) => (
                      <td key={s.patient.id} className="p-2.5 text-slate-800 dark:text-slate-200">
                        {s.avgGlu !== null ? (
                          <div>
                            <span className="font-bold">{s.avgGlu} mg/dL</span>
                            <span className="text-slate-400"> ({s.glu.length} ကြိမ်)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">မရှိသေးပါ</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* BMI */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">
                      <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-indigo-500" /> BMI</span>
                    </td>
                    {stats.map((s) => {
                      const b = bmiFor(s);
                      return (
                        <td key={s.patient.id} className="p-2.5 text-slate-800 dark:text-slate-200">
                          {b.text === 'မရှိသေးပါ' ? (
                            <span className="text-slate-400">မရှိသေးပါ</span>
                          ) : (
                            <div>
                              <span className="font-bold">{b.text}</span>
                              {b.label && <span className="text-slate-400"> ({b.label})</span>}
                              {s.latestBMI && (
                                <div className="text-[11px] text-slate-400 mt-1">{fmtDate(s.latestBMI.date || s.latestBMI.timestamp || s.latestBMI.createdAt)}</div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Chronic conditions */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">ရောဂါအခံ</td>
                    {stats.map((s) => (
                      <td key={s.patient.id} className="p-2.5">
                        {s.patient.chronicConditions && s.patient.chronicConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.patient.chronicConditions.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">မထည့်ရသေးပါ</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Medications */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">
                      <span className="flex items-center gap-1.5"><Pill className="w-4 h-4 text-violet-500" /> ဆေးများ</span>
                    </td>
                    {stats.map((s) => (
                      <td key={s.patient.id} className="p-2.5 text-slate-800 dark:text-slate-200">
                        {s.meds.length > 0 ? (
                          <div>
                            <span className="font-bold">{s.meds.length} မျိုး</span>
                            <div className="text-slate-500 mt-0.5">
                              {s.meds.slice(0, 3).map((m) => m.name).join(', ')}
                              {s.meds.length > 3 ? ` +${s.meds.length - 3} မျိုး` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">မရှိသေးပါ</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Labs */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="font-semibold text-slate-500 p-2.5">
                      <span className="flex items-center gap-1.5"><FlaskConical className="w-4 h-4 text-sky-500" /> ဓာတ်ခွဲစစ်ဆေးမှု</span>
                    </td>
                    {stats.map((s) => (
                      <td key={s.patient.id} className="p-2.5 text-slate-800 dark:text-slate-200">
                        {s.labs.length > 0 ? (
                          <div>
                            <span className="font-bold">{s.labs.length} ကြိမ်</span>
                            <div className="text-[11px] text-slate-400 mt-1">
                              နောက်ဆုံး: {fmtDate(s.labs[0].testDate || s.labs[0].recordedAt || s.labs[0].createdAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">မရှိသေးပါ</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Vaccines */}
                  <tr>
                    <td className="font-semibold text-slate-500 p-2.5">
                      <span className="flex items-center gap-1.5"><Syringe className="w-4 h-4 text-teal-500" /> ကာကွယ်ဆေး</span>
                    </td>
                    {stats.map((s) => (
                      <td key={s.patient.id} className="p-2.5 text-slate-800 dark:text-slate-200">
                        {s.vaccines.length > 0 ? (
                          <div>
                            <span className="font-bold">{s.vaccines.length} ကြိမ်</span>
                            <div className="text-slate-500 mt-0.5">
                              {s.vaccines.slice(0, 2).map((v) => v.vaccineName).join(', ')}
                              {s.vaccines.length > 2 ? ` +${s.vaccines.length - 2} ကြိမ်` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">မရှိသေးပါ</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-patient charts */}
          {stats.map((s) => (
            <div key={s.patient.id} className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>{resolveName(s.patient)} — ပြောင်းလဲမှု ဂရပ်</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>သွေးပေါင်ချိန် ပြောင်းလဲမှု ဂရပ်</span>
                  </h4>
                  <BloodPressureChart records={s.bp} />
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-emerald-500" />
                    <span>သွေးချို ပြောင်းလဲမှု ဂရပ်</span>
                  </h4>
                  <BloodSugarChart records={s.glu} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AdminPatientComparison;
