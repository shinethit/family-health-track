import React, { useState } from 'react';
import { 
  MessageSquareHeart, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Stethoscope, 
  Sparkles, 
  HelpCircle, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  ShieldCheck,
  Calendar,
  Activity,
  Droplets,
  Pill,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { DoctorQuestion } from '../../types/health';

const FAQ_ITEMS = [
  {
    q: 'သွေးပေါင်ချိန် ဘယ်အချိန် တိုင်းတာတာ အကောင်းဆုံး ဖြစ်မလဲ?',
    a: 'မနက် အိပ်ရာထပြီး ဆီးသွားပြီးစအချိန် (သို့မဟုတ်) ညအိပ်ရာမဝင်မီ အချိန်တို့တွင် တိုင်းတာခြင်းသည် အကောင်းဆုံး ဖြစ်ပါသည်။ တိုင်းတာခါနီး မိနစ် ၃၀ အတွင်း ကော်ဖီ၊ လက်ဖက်ရည် မသောက်ရပါ။ ဆေးလိပ် မသောက်ရပါ။ တိုင်းတာသည့်အခါ ၅ မိနစ်ခန့် ငြိမ်သက်စွာ ထိုင်ပြီးမှ လက်မောင်းကို နှလုံးနှင့် တစ်ပြေးညီထား၍ တိုင်းပါ။'
  },
  {
    q: 'ဆီးချိုသမားတွေ အစာစားပြီး ၂ နာရီ သွေးချို (Post-meal Blood Sugar) ပမာဏ ဘယ်လောက်ရှိသင့်လဲ?',
    a: 'အစာစားပြီး ၂ နာရီ သွေးတွင်းသကြားဓာတ်သည် ၁၄၀ mg/dL မှ ၁၈၀ mg/dL အောက် ရှိသင့်ပါသည်။ အကယ်၍ ၂၀၀ mg/dL ထက် ကျော်လွန်နေပါက အစားအသောက် ကစီဓာတ်လျှော့ချရန်နှင့် ဆေးပမာဏ ချိန်ညှိရန် ဆရာဝန်နှင့် ပြသတိုင်ပင်သင့်ပါသည်။'
  },
  {
    q: 'အသည်းအဆီဖုံးခြင်းရှိသူတွေ ဥ ကြက်ဥ စားလို့ရပါသလား?',
    a: 'စားသုံးနိုင်ပါသည်။ သို့သော် ကြော်လှော်စားသုံးခြင်းထက် ပြုတ်စားခြင်း သို့မဟုတ် ပေါင်းစားခြင်းကို အကြံပြုပါသည်။ တစ်နေ့လျှင် ကြက်ဥအကာ ၂ လုံး သို့မဟုတ် ကြက်ဥအလုံးလိုက် ၁ လုံးခန့် စားသုံးနိုင်ပါသည်။'
  },
  {
    q: 'သွေးတိုးကျဆေးကို သွေးပေါင်ကျသွားတဲ့နေ့တွေမှာ ရပ်ထားလို့ ရပါသလား?',
    a: 'ဆရာဝန်၏ ညွှန်ကြားချက်မပါဘဲ သွေးတိုးကျဆေးကို မိမိသဘောဖြင့် လုံးဝ မရပ်သင့်ပါ။ သွေးပေါင် ပုံမှန်ဖြစ်နေခြင်းသည် ဆေး၏ အာနိသင်ကြောင့်ဖြစ်ပြီး ရုတ်တရက် ဆေးဖြတ်လိုက်ပါက Rebound Hypertension (သွေးပေါင် ရုတ်တရက် ဆောင့်တက်ခြင်း) ဖြစ်ကာ လေဖြတ်နိုင်ခြေ မြင့်တက်စေပါသည်။'
  }
];

export const DoctorQnAModule: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const { 
    doctorQuestions, 
    addDoctorQuestion, 
    answerDoctorQuestion, 
    deleteDoctorQuestion,
    bpRecords,
    glucoseRecords,
    medications
  } = useHealthData();

  const [activeTab, setActiveTab] = useState<'my_questions' | 'ask_new' | 'faq'>('my_questions');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  
  // New Question Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DoctorQuestion['category']>('general');
  const [questionDetails, setQuestionDetails] = useState('');
  const [duration, setDuration] = useState('');
  const [urgency, setUrgency] = useState<DoctorQuestion['urgency']>('routine');
  const [includeLatestVitals, setIncludeLatestVitals] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Admin Answer Modal/State
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [recommendationsInput, setRecommendationsInput] = useState('');
  const [suggestedAction, setSuggestedAction] = useState('');

  // Latest stats for auto-fill preview
  const latestBP = bpRecords[0];
  const latestSugar = glucoseRecords[0];
  const activeMeds = medications.filter(m => m.status === 'active').map(m => m.name).join(', ');

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !questionDetails.trim()) return;

    setSubmitting(true);
    try {
      await addDoctorQuestion({
        userId: profile?.id || 'current-user',
        patientName: profile?.displayName || 'လူနာ',
        patientEmail: profile?.email || '',
        category,
        title: title.trim(),
        questionDetails: questionDetails.trim(),
        duration: duration.trim() || undefined,
        urgency,
        recentBP: includeLatestVitals && latestBP ? `${latestBP.systolic}/${latestBP.diastolic} mmHg` : undefined,
        recentSugar: includeLatestVitals && latestSugar ? `${latestSugar.glucoseValue} mg/dL (${latestSugar.timing})` : undefined,
        currentMedications: includeLatestVitals && activeMeds ? activeMeds : undefined,
      });

      // Reset form
      setTitle('');
      setQuestionDetails('');
      setDuration('');
      setSuccessMessage('မေးခွန်းကို ဆရာဝန်ထံ အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။ ဆရာဝန်မှ မကြာမီ ပြန်လည်ဖြေကြားပေးပါမည်။');
      setActiveTab('my_questions');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminAnswer = async (qId: string) => {
    if (!answerText.trim()) return;
    const recs = recommendationsInput
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    await answerDoctorQuestion(qId, {
      answeredBy: profile?.displayName || 'Admin (ရှိုင်းသစ်)',
      answerText: answerText.trim(),
      recommendations: recs.length > 0 ? recs : ['ဆရာဝန် ညွှန်ကြားချက်အတိုင်း ဆေးကို ဆက်လက်သောက်သုံးပါ'],
      suggestedAction: suggestedAction.trim() || undefined,
      answeredAt: new Date().toISOString(),
    });

    setAnsweringQuestionId(null);
    setAnswerText('');
    setRecommendationsInput('');
    setSuggestedAction('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-slate-900 border border-indigo-500/20 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
              <span>ဆရာဝန်နှင့် ကျန်းမာရေး အမေး-အဖြေ စနစ်</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ဆရာဝန်ထံ မေးမြန်းချက်များ (Doctor Q&A)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              သွေးတိုး၊ ဆီးချို၊ ဆေးဝါးသောက်သုံးမှုနှင့် ကျန်းမာရေးခံစားချက်များကို အထူးကုဆရာဝန်ထံ အချိန်မရွေး တိုက်ရိုက် မေးမြန်းတိုင်ပင်နိုင်ပါသည်
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ask_new')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>မေးခွန်းအသစ် မေးမည်</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-2 border-b border-slate-800/80 pb-1 text-xs">
          <button
            onClick={() => setActiveTab('my_questions')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'my_questions'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>မေးမြန်းထားသော မေးခွန်းများ ({doctorQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ask_new')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ask_new'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>မေးခွန်း မေးရန် ဖောင်</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>အမေးများသော မေးခွန်းများ (FAQ)</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Tab Content 1: My Questions */}
      {activeTab === 'my_questions' && (
        <div className="space-y-4">
          {doctorQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
              <MessageSquareHeart className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">မေးမြန်းထားသော မေးခွန်း မရှိသေးပါ</p>
              <p className="text-xs text-slate-500 mt-1">
                ကျန်းမာရေးနှင့် ပတ်သက်၍ သိလိုသည်များကို ဆရာဝန်ထံ အချိန်မရွေး မေးမြန်းနိုင်ပါသည်
              </p>
              <button
                onClick={() => setActiveTab('ask_new')}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>မေးခွန်း စတင်မေးမြန်းမည်</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {doctorQuestions.map((q) => {
                const isAnswered = q.status === 'answered' && q.doctorAnswer;
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 transition-all hover:border-slate-700"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAnswered 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isAnswered ? '✅ ဆရာဝန် ဖြေကြားပြီး' : '⏳ စစ်ဆေးဖြေကြားရန် စောင့်ဆိုင်းနေသည်'}
                          </span>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                            {q.category === 'bp' ? 'သွေးတိုး' :
                             q.category === 'diabetes' ? 'ဆီးချို' :
                             q.category === 'liver_kidney' ? 'အသည်း/ကျောက်ကပ်' :
                             q.category === 'medication' ? 'ဆေးဝါး' : 'အထွေထွေ'}
                          </span>

                          {q.urgency === 'urgent' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              အရေးကြီး
                            </span>
                          )}

                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(q.createdAt).toLocaleDateString('my-MM', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {q.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          မေးမြန်းသူ: <strong className="text-slate-300">{q.patientName}</strong>
                          {q.duration && ` • ဖြစ်ပွားသည့်ကြာချိန်: ${q.duration}`}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteDoctorQuestion(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="ဖျက်မည်"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Details */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                      {q.questionDetails}
                    </div>

                    {/* Attached Vitals / Meds */}
                    {(q.recentBP || q.recentSugar || q.currentMedications) && (
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {q.recentBP && (
                          <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-1.5">
                            <Activity className="w-3 h-3" />
                            <span>သွေးပေါင်ချိန်: {q.recentBP}</span>
                          </div>
                        )}
                        {q.recentSugar && (
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                            <Droplets className="w-3 h-3" />
                            <span>သွေးချို: {q.recentSugar}</span>
                          </div>
                        )}
                        {q.currentMedications && (
                          <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1.5">
                            <Pill className="w-3 h-3" />
                            <span>သောက်ဆေးများ: {q.currentMedications}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Doctor's Answer Section */}
                    {isAnswered && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                              <Stethoscope className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {q.doctorAnswer?.answeredBy || 'ဆရာဝန်'} ၏ အကြံပြုအဖြေ
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {q.doctorAnswer?.answeredAt ? new Date(q.doctorAnswer.answeredAt).toLocaleString('my-MM') : ''}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            Verified Advice
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                          {q.doctorAnswer?.answerText}
                        </p>

                        {q.doctorAnswer?.recommendations && q.doctorAnswer.recommendations.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[11px] font-bold text-emerald-300 block">
                              လိုက်နာရန် ညွှန်ကြားချက်များ:
                            </span>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {q.doctorAnswer.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {q.doctorAnswer?.suggestedAction && (
                          <div className="p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-500/20 text-xs text-emerald-200">
                            <strong>နောက်ထပ်လုပ်ဆောင်ရန်:</strong> {q.doctorAnswer.suggestedAction}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Answer Action (if user is admin and question is not answered) */}
                    {isAdmin && (
                      <div className="pt-2">
                        {answeringQuestionId === q.id ? (
                          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3">
                            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4" />
                              <span>လူနာထံ ဆေးပညာ အကြံပြုချက် ပြန်လည်ဖြေကြားမည်</span>
                            </h4>
                            <textarea
                              rows={3}
                              placeholder="ဆရာဝန်၏ အဖြေနှင့် အကြံပြုချက်ကို အသေးစိတ် ရေးသားပါ..."
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                လိုက်နာရန် အချက်များ (တစ်ကြောင်းလျှင် တစ်ခု စာရိုက်ထည့်ပါ)
                              </label>
                              <textarea
                                rows={2}
                                placeholder="ဥပမာ- ရေများများသောက်ပါ&#10;ဆားလျှော့စားပါ"
                                value={recommendationsInput}
                                onChange={(e) => setRecommendationsInput(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setAnsweringQuestionId(null)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                              >
                                ပယ်ဖျက်မည်
                              </button>
                              <button
                                onClick={() => handleAdminAnswer(q.id)}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>အဖြေ ပေးပို့မည်</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAnsweringQuestionId(q.id);
                              setAnswerText(q.doctorAnswer?.answerText || '');
                              setRecommendationsInput(q.doctorAnswer?.recommendations?.join('\n') || '');
                              setSuggestedAction(q.doctorAnswer?.suggestedAction || '');
                            }}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Stethoscope className="w-4 h-4" />
                            <span>{isAnswered ? 'အဖြေကို ပြန်လည်ပြင်ဆင်မည်' : 'ဆရာဝန်အဖြစ် ဖြေကြားမည်'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Ask New Question Form */}
      {activeTab === 'ask_new' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                ဆရာဝန်ထံ ကျန်းမာရေး မေးခွန်း ပေးပို့ရန်
              </h3>
              <p className="text-xs text-slate-400">
                မိမိ ခံစားနေရသော လက္ခဏာများနှင့် သိလိုသည်များကို အသေးစိတ် ဖြည့်သွင်းပါ
              </p>
            </div>
          </div>

          <form onSubmit={handleAskQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                မေးခွန်း ခေါင်းစဉ် (Question Title) *
              </label>
              <input
                type="text"
                required
                placeholder="ဥပမာ- သွေးပေါင် ၁၅၀/၉၅ ဖြစ်နေပြီး ခေါင်းနောက်နေပါသည်"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  သက်ဆိုင်ရာ ဌာန / အမျိုးအစား
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="general">အထွေထွေ ကျန်းမာရေး</option>
                  <option value="bp">သွေးတိုး / နှလုံး</option>
                  <option value="diabetes">ဆီးချို / သကြားဓာတ်</option>
                  <option value="liver_kidney">အသည်း / ကျောက်ကပ်</option>
                  <option value="medication">ဆေးဝါးနှင့် ဘေးထွက်ဆိုးကျိုး</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ဖြစ်ပွားသည့် ကြာချိန်
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ၃ ရက်ခန့်၊ ၁ ပတ်"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                မေးခွန်း အသေးစိတ် / ခံစားရသော လက္ခဏာများ *
              </label>
              <textarea
                required
                rows={4}
                placeholder="ဘယ်လို ခံစားနေရပါသလဲ? အရင်က ဒီလိုဖြစ်ဖူးပါသလား? အသေးစိတ် ရေးသားပေးပါ..."
                value={questionDetails}
                onChange={(e) => setQuestionDetails(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Auto-attach current health profile stats */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={includeLatestVitals}
                  onChange={(e) => setIncludeLatestVitals(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>မိမိ၏ နောက်ဆုံး သွေးပေါင်ချိန်၊ သွေးချိုနှင့် လက်ရှိသောက်ဆေးများကို ပူးတွဲပေးပို့မည်</span>
              </label>

              {includeLatestVitals && (
                <div className="pl-6 text-[11px] text-slate-400 space-y-1">
                  <p>• နောက်ဆုံး သွေးပေါင်ချိန်: <strong className="text-slate-200">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic} mmHg` : 'မှတ်တမ်းမရှိသေး'}</strong></p>
                  <p>• နောက်ဆုံး သွေးချို: <strong className="text-slate-200">{latestSugar ? `${latestSugar.glucoseValue} mg/dL` : 'မှတ်တမ်းမရှိသေး'}</strong></p>
                  <p>• သောက်နေသောဆေးများ: <strong className="text-slate-200">{activeMeds || 'မရှိသေး'}</strong></p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('my_questions')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                မေးမြန်းမှုများ စာရင်းသို့ ပြန်သွားမည်
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ဆရာဝန်ထံ မေးခွန်း ပေးပို့မည်</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>လူနာများ အမေးအများဆုံး ကျန်းမာရေး သိကောင်းစရာများနှင့် ဆရာဝန်များ၏ အဖြေများ</span>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-indigo-300 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      {item.q}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
