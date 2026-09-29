import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Bookmark, 
  Share2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  X,
  BookOpen,
  Waves,
  Check,
  ChevronDown
} from 'lucide-react';
import { HealthArticle } from '../../types/health';
import { HEALTH_ARTICLES } from '../../data/healthArticles';

export const HealthNewsModule: React.FC = () => {
  // Main section toggle: 'flood' for 8 flood articles, 'general' for other medical categories
  const [activeSection, setActiveSection] = useState<'flood' | 'general'>('flood');
  const [floodFilter, setFloodFilter] = useState<string>('all');
  const [generalCategory, setGeneralCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<HealthArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarked_articles');
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedNotification, setCopiedNotification] = useState(false);

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(b => b !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('bookmarked_articles', JSON.stringify(updated));
  };

  const handleShare = (article: HealthArticle) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title}\n\n${article.summary}\n\n- Family Health Track Medical Tips`);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  // Counts
  const floodArticles = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'flood_disaster'), []);
  const generalArticles = useMemo(() => HEALTH_ARTICLES.filter(a => a.category !== 'flood_disaster'), []);

  const pediatricsCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'pediatrics').length, []);
  const vaccineCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'vaccine').length, []);
  const physioCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'physio').length, []);
  const thyroidCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'thyroid').length, []);
  const bpCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'bp').length, []);
  const diabetesCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'diabetes').length, []);
  const liverCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'liver').length, []);
  const kidneyCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'kidney').length, []);
  const nutritionCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'nutrition').length, []);
  const elderlyCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'elderly').length, []);
  const dentalCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'specialty_dental').length, []);
  const eyeCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'specialty_eye').length, []);
  const entCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'specialty_ent').length, []);
  const dermaCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'specialty_derma').length, []);
  const orthoCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'specialty_ortho').length, []);
  const neuroCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'specialty_neuro').length, []);
  const mosquitoCount = useMemo(() => HEALTH_ARTICLES.filter(a => a.category === 'mosquito_borne').length, []);

  // General Categories (strictly non-flood)
  const GENERAL_CATEGORIES = [
    { id: 'all', label: `အားလုံး (${generalArticles.length} ပုဒ်)` },
    { id: 'thyroid', label: `သိုင်းရွိုက် (${thyroidCount})` },
    { id: 'bp', label: `သွေးတိုး (${bpCount})` },
    { id: 'diabetes', label: `ဆီးချို (${diabetesCount})` },
    { id: 'heart', label: 'နှလုံး' },
    { id: 'liver', label: `အသည်း (${liverCount})` },
    { id: 'kidney', label: `ကျောက်ကပ် (${kidneyCount})` },
    { id: 'specialty_eye', label: `👁️ မျက်စိ (${eyeCount})` },
    { id: 'specialty_dental', label: `🦷 သွား (${dentalCount})` },
    { id: 'specialty_ent', label: `👂 နား၊ နှာ၊ လည် (${entCount})` },
    { id: 'specialty_derma', label: `✨ အရေပြား (${dermaCount})` },
    { id: 'specialty_ortho', label: `🦴 အရိုးအဆစ် (${orthoCount})` },
    { id: 'specialty_neuro', label: `🧠 အာရုံကြော (${neuroCount})` },
    { id: 'physio', label: `🏃 ကာယကုထုံး (${physioCount})` },
    { id: 'pediatrics', label: `👶 ကလေးကျန်းမာရေး (${pediatricsCount})` },
    { id: 'vaccine', label: `💉 ကာကွယ်ဆေး (${vaccineCount})` },
    { id: 'mosquito_borne', label: `🦟 ခြင်မှကူးစက် (${mosquitoCount})` },
    { id: 'nutrition', label: `အာဟာရ (${nutritionCount})` },
    { id: 'elderly', label: `သက်ကြီး (${elderlyCount})` },
  ];

  // Flood Subtopic Filters
  const FLOOD_FILTERS = [
    { id: 'all', label: `ရေဘေးဆောင်းပါး အားလုံး (${floodArticles.length} ပုဒ်)` },
    { id: 'safety', label: 'ဆောင်ရန်/ရှောင်ရန် & လမ်းညွှန်', keywords: ['ဆောင်ရန်', 'ရှောင်ရန်', 'Go Bag', 'အိတ်'] },
    { id: 'diseases', label: 'ကူးစက်ရောဂါ & ကြွက်ဖျား', keywords: ['ကြွက်ဖျား', 'ဝမ်းပျက်', 'ရောဂါ', 'Leptospirosis'] },
    { id: 'firstaid', label: 'CPR & ရှေးဦးပြုစုနည်း', keywords: ['ရှေးဦး', 'CPR', 'ရေနစ်', 'မြွေကိုက်', 'ဓာတ်လိုက်'] },
    { id: 'water', label: 'သောက်ရေသန့် & ရေတွင်းဆေးခတ်', keywords: ['သောက်ရေသန့်', 'ရေတွင်း', 'ကလိုရင်း', 'Aquatabs'] },
    { id: 'vulnerable', label: 'ကိုယ်ဝန်ဆောင်၊ ကလေး၊ နာတာရှည်', keywords: ['ကိုယ်ဝန်ဆောင်', 'ကလေး', 'သက်ကြီး', 'အင်ဆူလင်'] },
    { id: 'recovery', label: 'အိမ်သန့်ရှင်းရေး & မှိုသတ်နည်း', keywords: ['ပြန်လည်ထူထောင်', 'မှို', 'သန့်ရှင်းရေး', 'အိမ်ပြန်'] },
  ];

  // Filtered articles calculation
  const displayedArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (activeSection === 'flood') {
      return floodArticles.filter(art => {
        let matchFilter = true;
        if (floodFilter !== 'all') {
          const selectedSub = FLOOD_FILTERS.find(f => f.id === floodFilter);
          if (selectedSub && selectedSub.keywords) {
            matchFilter = selectedSub.keywords.some(kw => 
              art.title.toLowerCase().includes(kw.toLowerCase()) ||
              art.summary.toLowerCase().includes(kw.toLowerCase()) ||
              art.tags.some(t => t.toLowerCase().includes(kw.toLowerCase()))
            );
          }
        }

        const matchQuery = !q || 
          art.title.toLowerCase().includes(q) || 
          art.summary.toLowerCase().includes(q) || 
          art.tags.some(t => t.toLowerCase().includes(q)) ||
          art.author.toLowerCase().includes(q);

        return matchFilter && matchQuery;
      });
    } else {
      return generalArticles.filter(art => {
        const matchCat = generalCategory === 'all'
          ? true
          : generalCategory === 'bookmarked'
          ? bookmarkedIds.includes(art.id)
          : art.category === generalCategory;

        const matchQuery = !q || 
          art.title.toLowerCase().includes(q) || 
          art.summary.toLowerCase().includes(q) || 
          art.tags.some(t => t.toLowerCase().includes(q)) ||
          art.author.toLowerCase().includes(q);

        return matchCat && matchQuery;
      });
    }
  }, [activeSection, floodFilter, generalCategory, searchQuery, bookmarkedIds, floodArticles, generalArticles]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'flood_disaster': return '🌊 ရေဘေးနှင့် ရေကြီးမှု ကျန်းမာရေး';
      case 'mosquito_borne': return '🦟 ခြင်မှကူးစက်ရောဂါများ';
      case 'specialty_dental': return 'သွားနှင့် ခံတွင်း';
      case 'specialty_eye': return '👁️ မျက်စိနှင့် အမြင်အာရုံ';
      case 'specialty_ent': return 'နား၊ နှာခေါင်း၊ လည်ချောင်း';
      case 'specialty_derma': return 'အရေပြားနှင့် အလှအပ';
      case 'specialty_ortho': return 'အရိုးနှင့် အဆစ်';
      case 'specialty_neuro': return 'အာရုံကြော';
      case 'physio': return 'ကာယကုထုံး';
      case 'pediatrics': return 'ကလေးကျန်းမာရေး';
      case 'vaccine': return 'ကာကွယ်ဆေး';
      case 'thyroid': return 'သိုင်းရွိုက်';
      case 'bp': return 'သွေးတိုး';
      case 'diabetes': return 'ဆီးချို';
      case 'heart': return 'နှလုံး';
      case 'liver': return 'အသည်း';
      case 'kidney': return 'ကျောက်ကပ်';
      case 'nutrition': return 'အာဟာရ';
      case 'elderly': return 'သက်ကြီး';
      default: return 'ကျန်းမာရေး';
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'flood_disaster': return 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
      case 'mosquito_borne': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'specialty_dental': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'specialty_eye': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'specialty_ent': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'specialty_derma': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'specialty_ortho': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'specialty_neuro': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'pediatrics': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'vaccine': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'thyroid': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'bp': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'diabetes': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'heart': return 'bg-red-50 text-red-700 border-red-200';
      case 'liver': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'kidney': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-20 right-6 z-50 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>ဆောင်းပါး အချက်အလက်များကို ကူးယူပြီးပါပြီ!</span>
        </div>
      )}

      {/* Primary Section Switcher Tabs: Flood Emergency vs General Medical Knowledge */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => {
            setActiveSection('flood');
            setSearchQuery('');
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeSection === 'flood'
              ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-sky-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Waves className="w-4 h-4 shrink-0" />
          <span>🌊 ရေဘေး အရေးပေါ် ကျန်းမာရေး လမ်းညွှန်များ ({floodArticles.length} ပုဒ် သီးသန့်)</span>
          {activeSection === 'flood' && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
              လက်ရှိ ရေဘေးကဏ္ဍ
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSection('general');
            setSearchQuery('');
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeSection === 'general'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>📚 အထွေထွေ ဆေးပညာ & ရောဂါများ ဗဟုသုတ ({generalArticles.length} ပုဒ်)</span>
          {activeSection === 'general' && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
              သိုင်းရွိုက်/သွေးတိုး/ဆီးချို...
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: FLOOD EMERGENCY SECTION */}
      {activeSection === 'flood' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Flood Emergency Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border-2 border-sky-300 shadow-xs relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-700 text-white text-xs font-bold shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>🌊 လက်ရှိ ရေကြီးရေဘေး ကာလ အရေးပေါ် ကျန်းမာရေးနှင့် အသက်ကယ် လမ်းညွှန် (၈ ပုဒ် စုစည်းမှု)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                ရေဘေးကာလ အသက်ကယ် ဆောင်ရန်/ရှောင်ရန်နှင့် အရေးပေါ် ကျန်းမာရေး လမ်းညွှန်
              </h2>
              <p className="text-xs text-slate-700 max-w-3xl leading-relaxed">
                • <strong>မကြီးမီ:</strong> အရေးပေါ်အိတ် (Go Bag)၊ သောက်ရေသန့်၊ နာတာရှည်ဆေးများ | • <strong>ကြီးနေစဉ်:</strong> လျှပ်စစ်မိန်းပိတ်ရန်၊ ရေစီးထဲမဆင်းရန်၊ မြွေသတိပြုရန် | • <strong>ရောဂါများ:</strong> ကြွက်ဖျား (Leptospirosis)၊ ကာလဝမ်း၊ မျက်စိနာ | • <strong>အရေးပေါ်:</strong> ရေနစ်သူ CPR၊ SOS အချက်ပြ၊ လှေစီးနင်းမှု | • <strong>ကြီးပြီး:</strong> ရေတွင်းဆေးခတ်၊ မှိုသတ်၊ ကိုယ်ဝန်ဆောင်/နာတာရှည်လူနာ စောင့်ရှောက်မှု
              </p>
              <div className="pt-2 text-[11px] text-sky-800 font-semibold bg-white/70 p-2.5 rounded-xl border border-sky-200 inline-block">
                ℹ️ ဤကဏ္ဍတွင် လက်ရှိ ရေကြီးရေလျှံမှုနှင့် သဘာဝဘေးအန္တရာယ် ကာကွယ်ရေး ဆောင်းပါး ၈ ပုဒ်သာ သီးသန့် ပါဝင်ပါသည်။ (အခြား သိုင်းရွိုက်၊ သွေးတိုး၊ ဆီးချို စသည့် ဆေးပညာဆောင်းပါးများကို အပေါ်ရှိ <strong>"အထွေထွေ ဆေးပညာ & ရောဂါများ ဗဟုသုတ"</strong> Tab တွင် ကြည့်ရှုနိုင်ပါသည်)
              </div>
            </div>
          </div>

          {/* Flood Search & Subtopic Filters */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ရေဘေး၊ ဆောင်ရန်ရှောင်ရန်၊ ကြွက်ဖျား၊ ကာလဝမ်း၊ ရေနစ် CPR၊ သောက်ရေသန့်၊ မြွေကိုက်... ရှာရန်"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>

            {/* Quick subtopic filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {FLOOD_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFloodFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    floodFilter === f.id
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: GENERAL MEDICAL KNOWLEDGE SECTION */}
      {activeSection === 'general' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* General Medical Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-sky-50 border border-emerald-200/80 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ယုံကြည်စိတ်ချရသော ဆေးပညာ ဗဟုသုတများ (စုစုပေါင်း {generalArticles.length} ပုဒ်)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  ကျန်းမာရေး သတင်း & ဆေးပညာ ဗဟုသုတများ
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  ကာကွယ်ဆေးများ၊ သိုင်းရွိုက်၊ သွေးတိုး၊ ဆီးချို၊ နှလုံး၊ အသည်း၊ ကျောက်ကပ်၊ ကလေးနှင့် သက်ကြီးကျန်းမာရေးအတွက် အထူးကုဆရာဝန်ကြီးများ၏ လက်တွေ့ကျ လမ်းညွှန်ချက်များ
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setGeneralCategory('bookmarked')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    generalCategory === 'bookmarked'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white hover:bg-slate-50 text-amber-700 border border-amber-300'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedIds.length > 0 ? 'fill-current' : ''}`} />
                  <span>မှတ်သားထားသည်များ ({bookmarkedIds.length})</span>
                </button>
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ဆောင်းပါး၊ ရောဂါအမည် (သွေးတိုး၊ ဆီးချို၊ သိုင်းရွိုက်၊ မျက်စိ၊ သွား)... ရှာရန်"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-emerald-200/90 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 shadow-xs"
                />
              </div>

              {/* Mobile Category Dropdown Selector */}
              <div className="md:hidden relative w-full">
                <select
                  value={generalCategory}
                  onChange={(e) => setGeneralCategory(e.target.value)}
                  className="w-full bg-white border border-emerald-300 text-slate-900 text-xs font-bold rounded-2xl pl-3.5 pr-8 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-xs cursor-pointer"
                >
                  {GENERAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Desktop/Tablet Category Pills */}
              <div className="hidden md:flex flex-wrap items-center gap-1.5 text-xs">
                {GENERAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setGeneralCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                      generalCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Category Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            {activeSection === 'flood' ? (
              <span className="text-sky-900">
                🌊 ရေဘေး အရေးပေါ် ကျန်းမာရေး ဆောင်းပါးများ ({displayedArticles.length} ပုဒ်)
              </span>
            ) : generalCategory === 'all' ? (
              <span>
                အထွေထွေ ကျန်းမာရေး ဆောင်းပါးများ ({displayedArticles.length} ပုဒ်)
              </span>
            ) : (
              <span>
                {getCategoryLabel(generalCategory)} ကဏ္ဍ ဆောင်းပါးများ ({displayedArticles.length} ပုဒ်)
              </span>
            )}
          </h3>
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            ရှာဖွေမှု ရှင်းလင်းမည်
          </button>
        )}
      </div>

      {/* Articles Grid - Bright, Clean White Cards */}
      {displayedArticles.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">ဆောင်းပါး ရှာမတွေ့ပါ</h3>
          <p className="text-xs text-slate-500">ရှာဖွေမှု စကားလုံးကို ပြောင်းလဲရိုက်ထည့်ကြည့်ပါ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedArticles.map((article) => {
            const isBookmarked = bookmarkedIds.includes(article.id);
            return (
              <div 
                key={article.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getCategoryBadgeColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked 
                            ? 'text-amber-500 bg-amber-50' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title="မှတ်သားထားမည်"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleShare(article)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="မျှဝေမည်"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 
                    onClick={() => setActiveArticle(article)}
                    className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug cursor-pointer line-clamp-2"
                  >
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{article.readingTime}</span>
                  </div>

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-transform group-hover:translate-x-0.5"
                  >
                    <span>အပြည့်အစုံဖတ်ရန်</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Article Detail Modal - Smooth Responsive Mobile & Desktop Scrolling with Momentum Touch */}
      {activeArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveArticle(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Fixed Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getCategoryBadgeColor(activeArticle.category)}`}>
                    {getCategoryLabel(activeArticle.category)}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {activeArticle.publishedDate}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {activeArticle.readingTime}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-emerald-700 font-semibold">
                  ရေးသားသူ: {activeArticle.author}
                </p>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors shrink-0 shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body (Key Takeaways + Full Article) with Native Momentum Touch Scrolling */}
            <div 
              className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-5 overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Key Takeaways Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs shadow-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>အဓိက လိုက်နာဆောင်ရွက်ရန် အချက်များ (Key Action Points):</span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  {activeArticle.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Article Content */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
                {activeArticle.content.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed whitespace-pre-line bg-white rounded-xl">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                {activeArticle.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Fixed Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(activeArticle.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    bookmarkedIds.includes(activeArticle.id)
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeArticle.id) ? 'fill-current' : ''}`} />
                  <span>{bookmarkedIds.includes(activeArticle.id) ? 'မှတ်သားပြီး' : 'မှတ်သားမည်'}</span>
                </button>
                <button
                  onClick={() => handleShare(activeArticle)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>မျှဝေမည်</span>
                </button>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
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
