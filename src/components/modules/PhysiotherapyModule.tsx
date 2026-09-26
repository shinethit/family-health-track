import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Search, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Info, 
  HeartPulse, 
  Layers, 
  Target,
  ArrowLeft,
  Volume2,
  Calendar,
  Zap,
  Award,
  Filter
} from 'lucide-react';
import { PHYSIO_EXERCISES, PhysioExercise } from '../../data/physioExercises';
import { HEALTH_ARTICLES } from '../../data/healthArticles';
import { HealthArticle } from '../../types/health';

export const PhysiotherapyModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exercises' | 'body_map' | 'runner' | 'articles'>('exercises');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  // Exercise Runner state
  const [activeExercise, setActiveExercise] = useState<PhysioExercise | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [completedReps, setCompletedReps] = useState<number>(0);
  
  // Daily Progress & Streak Tracking
  const [completedTodayIds, setCompletedTodayIds] = useState<string[]>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`physio_completed_${today}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('physio_streak_count');
      return saved ? parseInt(saved, 10) : 3;
    } catch (e) {
      return 3;
    }
  });

  // Selected Article Modal
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(null);

  // Filter Exercises
  const filteredExercises = useMemo(() => {
    return PHYSIO_EXERCISES.filter(ex => {
      const matchCat = selectedCategory === 'all' || ex.category === selectedCategory;
      const matchBody = !selectedBodyPart || ex.bodyPart === selectedBodyPart || ex.bodyPart === 'full_body';
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        ex.titleMm.toLowerCase().includes(q) || 
        ex.titleEn.toLowerCase().includes(q) || 
        ex.purpose.toLowerCase().includes(q) ||
        ex.targetMuscles.some(m => m.toLowerCase().includes(q));

      return matchCat && matchBody && matchQuery;
    });
  }, [selectedCategory, selectedBodyPart, searchQuery]);

  // Physiotherapy Articles
  const physioArticles = useMemo(() => {
    return HEALTH_ARTICLES.filter(art => art.category === 'physio');
  }, []);

  // Audio Beep Cue when timer finishes
  const playTimerBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio fallback
    }
  };

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      playTimerBeep();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Start Exercise Runner
  const handleStartRunner = (ex: PhysioExercise) => {
    setActiveExercise(ex);
    setSecondsLeft(ex.durationSeconds || 30);
    setCompletedReps(0);
    setIsRunning(true);
    setActiveTab('runner');
  };

  // Mark Exercise as Completed Today
  const handleMarkCompleted = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (!completedTodayIds.includes(id)) {
      const updated = [...completedTodayIds, id];
      setCompletedTodayIds(updated);
      localStorage.setItem(`physio_completed_${today}`, JSON.stringify(updated));
    }
  };

  const CATEGORIES = [
    { id: 'all', label: 'အားလုံး' },
    { id: 'back_spine', label: 'ခါးနှင့် ကျောရိုး' },
    { id: 'neck_shoulder', label: 'ဇက်ကြောနှင့် ပခုံး' },
    { id: 'knee_joint', label: 'ဒူးဆစ်နှင့် အဆစ်' },
    { id: 'stroke_rehab', label: 'လေဖြတ် သန်စွမ်းရေး' },
    { id: 'office_syndrome', label: 'Office Syndrome' },
    { id: 'elderly_balance', label: 'သက်ကြီး ဟန်ချက်' }
  ];

  const BODY_PARTS = [
    { id: 'neck', nameMm: 'ဇက်ကြော / လည်ပင်း', icon: '🧠', desc: 'Chin tucks, Cervical Stretches' },
    { id: 'shoulder', nameMm: 'ပခုံး / လက်မောင်း', icon: '🦾', desc: 'Codman pendulum, Wall ladder' },
    { id: 'back', nameMm: 'ခါး / ကျောရိုး', icon: '🦿', desc: 'Cat-Cow, McKenzie, Bridging' },
    { id: 'knee', nameMm: 'ဒူးဆစ် / ပေါင်', icon: '🦵', desc: 'Quad extensions, Leg raises' },
    { id: 'arm', nameMm: 'လက်ဝါး / လက်ချောင်း', icon: '✋', desc: 'Grip ball rehab, Finger stretches' },
    { id: 'full_body', nameMm: 'ခန္ဓာကိုယ်အပြည့် / ဟန်ချက်', icon: '🚶', desc: 'Sit-to-stand, Tandem stance' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-8 opacity-10 text-white pointer-events-none">
          <Activity className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-medium mb-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Physiotherapy & Physical Rehabilitation</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              အရိုး၊ အကြောနှင့် ကာယကုထုံး လေ့ကျင့်ခန်းများ
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              ခါးနာ၊ ဇက်ကြောတက်၊ ဒူးနာ၊ ပခုံးအဆစ်ခဲခြင်းနှင့် လေဖြတ်ပြီးနောက် ပြန်လည်သန်စွမ်းရေးအတွက် ဆေးခန်းအဆင့် ကာယကုထုံး လမ်းညွှန်နှင့် တိုက်ရိုက် လေ့ကျင့်နိုင်သည့် စနစ်။
            </p>
          </div>

          {/* Daily Streak & Completion Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 min-w-[220px] flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-emerald-100 font-medium">ယနေ့ ပြုလုပ်ပြီးသမျှ</div>
              <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span>{completedTodayIds.length} / {PHYSIO_EXERCISES.length} ခု</span>
                <span className="text-xs font-normal text-emerald-200">ပြီးပါပြီ</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2.5 py-1.5 rounded-lg text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{streakCount} ရက် ဆက်တိုက်</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation inside Physiotherapy Module */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'exercises'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>လေ့ကျင့်ခန်းများ ({PHYSIO_EXERCISES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('body_map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'body_map'
                ? 'bg-teal-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>နာကျင်သည့်နေရာ ရှာရန်</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ကျန်းမာရေး ဆောင်းပါးများ ({physioArticles.length})</span>
          </button>

          {activeExercise && (
            <button
              onClick={() => setActiveTab('runner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer animate-bounce ${
                activeTab === 'runner'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <Zap className="w-4 h-4 text-rose-500" />
              <span>လက်ရှိ လေ့ကျင့်ခန်း (Timer)</span>
            </button>
          )}
        </div>

        {/* Safety Callout Modal Trigger / Note */}
        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>နာကျင်မှု ပြင်းထန်ပါက လေ့ကျင့်ခန်း မပြုလုပ်မီ ဆရာဝန်နှင့် တိုင်ပင်ပါ။</span>
        </div>
      </div>

      {/* TAB 1: EXERCISES LIST VIEW */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="လေ့ကျင့်ခန်း သို့မဟုတ် နာကျင်မှု ခေတ်စားပုံဖြင့် ရှာရန်..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selected Body Filter indicator */}
            {selectedBodyPart && (
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
                <span>ဇယားကွက်: {BODY_PARTS.find(b => b.id === selectedBodyPart)?.nameMm}</span>
                <button 
                  onClick={() => setSelectedBodyPart(null)}
                  className="font-bold hover:text-emerald-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Category Filter - Responsive Dropdown & Clean Wrap */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">အမျိုးအစားအလိုက် စစ်ထုတ်ရန်:</span>
            </div>

            {/* Mobile Dropdown Select */}
            <div className="sm:hidden w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Desktop / Tablet Clean Wrap */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(ex => {
              const isDoneToday = completedTodayIds.includes(ex.id);
              return (
                <div 
                  key={ex.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden hover:shadow-md ${
                    isDoneToday ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ex.badgeColor}`}>
                        {ex.category === 'back_spine' && 'ခါးနှင့် ကျောရိုး'}
                        {ex.category === 'neck_shoulder' && 'ဇက်ကြောနှင့် ပခုံး'}
                        {ex.category === 'knee_joint' && 'ဒူးဆစ်နှင့် အဆစ်'}
                        {ex.category === 'stroke_rehab' && 'လေဖြတ် သန်စွမ်းရေး'}
                        {ex.category === 'office_syndrome' && 'Office Syndrome'}
                        {ex.category === 'elderly_balance' && 'သက်ကြီး ဟန်ချက်'}
                      </span>

                      {isDoneToday && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ယနေ့ ပြီးပါပြီ</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {ex.titleMm}
                      </h3>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        {ex.titleEn}
                      </div>
                    </div>

                    {/* Purpose */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>အကျိုးကျေးဇူး:</strong> {ex.purpose}
                    </p>

                    {/* Targets & Reps */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{ex.recommendedReps}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {ex.difficulty === 'easy' ? 'လွယ်ကူ' : ex.difficulty === 'moderate' ? 'အလယ်အလတ်' : 'မြင့်မား'}
                      </span>
                    </div>

                    {/* Steps Preview */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-700">ပြုလုပ်နည်း အဆင့်များ:</div>
                      <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside pl-0.5">
                        {ex.steps.slice(0, 2).map((s, idx) => (
                          <li key={idx} className="line-clamp-1">{s}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleMarkCompleted(ex.id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        isDoneToday 
                          ? 'bg-emerald-100 text-emerald-800 font-bold' 
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {isDoneToday ? '✓ မှတ်တမ်းဝင်ပြီး' : 'ယနေ့ ပြီးစီးကြောင်း မှတ်ရန်'}
                    </button>

                    <button
                      onClick={() => handleStartRunner(ex)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>စတင်ရန်</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium text-sm">ရှာဖွေမှုနှင့် ကိုက်ညီသော လေ့ကျင့်ခန်း မတွေ့ပါ။</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedBodyPart(null); }}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
              >
                စစ်ထုတ်မှု အားလုံးကို ဖျက်မည်
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE BODY AREA PAIN SELECTOR */}
      {activeTab === 'body_map' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 text-center max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900">
              မိမိ ခန္ဓာကိုယ် နာကျင်နေသည့် နေရာကို နှိပ်၍ လေ့ကျင့်ခန်း ရွေးချယ်ပါ
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              လည်ပင်း၊ ပခုံး၊ ခါး၊ ဒူးဆစ် သို့မဟုတ် လေဖြတ်ပြန်လည်သန်စွမ်းရေးအတွက် သီးသန့် ကာယကုထုံးများကို တိုက်ရိုက် ကြည့်ရှုနိုင်ပါသည်။
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {BODY_PARTS.map(part => {
                const count = PHYSIO_EXERCISES.filter(ex => ex.bodyPart === part.id || ex.bodyPart === 'full_body').length;
                return (
                  <button
                    key={part.id}
                    onClick={() => {
                      setSelectedBodyPart(part.id);
                      setActiveTab('exercises');
                    }}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{part.icon}</div>
                      <div className="font-bold text-slate-800 text-sm">{part.nameMm}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{part.desc}</div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-600">
                      <span>{count} ခု ရှိပါသည်</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE EXERCISE RUNNER & TIMER */}
      {activeTab === 'runner' && activeExercise && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div>
              <button 
                onClick={() => setActiveTab('exercises')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>လေ့ကျင့်ခန်း စာရင်းသို့ ပြန်သွားမည်</span>
              </button>
              <h2 className="text-lg font-bold">{activeExercise.titleMm}</h2>
              <div className="text-xs text-emerald-400 font-medium">{activeExercise.titleEn}</div>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              {activeExercise.recommendedReps}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Countdown Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                စက္ကန့် တိုက်ရိုက် ရေတွက်စနစ် (Timer)
              </div>

              <div className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000"
                  style={{ 
                    width: activeExercise.durationSeconds 
                      ? `${((activeExercise.durationSeconds - secondsLeft) / activeExercise.durationSeconds) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer ${
                    isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isRunning ? 'ခေတ္တရပ်မည်' : 'စတင်မည်'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsRunning(false);
                    setSecondsLeft(activeExercise.durationSeconds || 30);
                  }}
                  className="p-2.5 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all cursor-pointer"
                  title="ပြန်စမည်"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reps Counter */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div>
                <div className="text-xs font-bold text-emerald-900">ပြုလုပ်ပြီးသမျှ အကြိမ်ရေ ရေတွက်ရန်:</div>
                <div className="text-2xl font-black text-emerald-700">{completedReps} ကြိမ်</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompletedReps(prev => Math.max(0, prev - 1))}
                  className="w-9 h-9 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-base flex items-center justify-center cursor-pointer hover:bg-emerald-100"
                >
                  -
                </button>
                <button
                  onClick={() => setCompletedReps(prev => prev + 1)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer hover:bg-emerald-700"
                >
                  <span>+ ၁ ကြိမ်</span>
                </button>
              </div>
            </div>

            {/* Step by Step Guide */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">အဆင့်ဆင့် ပြုလုပ်နည်း လမ်းညွှန်:</h3>
              <ol className="space-y-2">
                {activeExercise.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Precautions & Tips */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>သတိပြုရန် လိုက်နာရန် အချက်များ:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                {activeExercise.precautions.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            {/* Complete Action */}
            <button
              onClick={() => {
                handleMarkCompleted(activeExercise.id);
                setActiveTab('exercises');
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>လေ့ကျင့်ခန်း ပြီးစီးကြောင်း မှတ်တမ်းတင်မည်</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PHYSIOTHERAPY ARTICLES & GUIDES */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {physioArticles.map(art => (
              <div 
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                      {art.author}
                    </span>
                    <span>{art.readingTime}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>အပြည့်အစုံ ဖတ်ရှုရန်</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {selectedArticle.author}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedArticle.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                <div className="font-bold text-indigo-900 mb-1">အဓိက သော့ချက်များ (Key Takeaways):</div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {selectedArticle.keyTakeaways.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>

              {selectedArticle.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
