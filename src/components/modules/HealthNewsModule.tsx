import React, { useState, useMemo } from 'react';
import { 
  Newspaper, 
  Search, 
  Bookmark, 
  Share2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Heart, 
  Activity, 
  Droplets, 
  Apple, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  X,
  BookOpen,
  Info,
  Syringe,
  Check
} from 'lucide-react';
import { HealthArticle } from '../../types/health';
import { HEALTH_ARTICLES } from '../../data/healthArticles';

export const HealthNewsModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const filteredArticles = useMemo(() => {
    return HEALTH_ARTICLES.filter(art => {
      const matchCat = selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'bookmarked' 
        ? bookmarkedIds.includes(art.id)
        : art.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        art.title.toLowerCase().includes(q) || 
        art.summary.toLowerCase().includes(q) || 
        art.tags.some(t => t.toLowerCase().includes(q)) ||
        art.author.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery, bookmarkedIds]);

  const handleShare = (article: HealthArticle) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title}\n\n${article.summary}\n\n- Family Health Track Medical Tips`);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

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

  const CATEGORIES = [
    { id: 'all', label: `အားလုံး (${HEALTH_ARTICLES.length} ပုဒ်)` },
    { id: 'physio', label: `🏃 ကာယကုထုံး (${physioCount})` },
    { id: 'pediatrics', label: `👶 ကလေးကျန်းမာရေး (${pediatricsCount})` },
    { id: 'vaccine', label: `💉 ကာကွယ်ဆေးများ (${vaccineCount})` },
    { id: 'thyroid', label: `သိုင်းရွိုက် (${thyroidCount})` },
    { id: 'bp', label: `သွေးတိုး (${bpCount})` },
    { id: 'diabetes', label: `ဆီးချို (${diabetesCount})` },
    { id: 'heart', label: 'နှလုံး' },
    { id: 'liver', label: `အသည်း (${liverCount})` },
    { id: 'kidney', label: `ကျောက်ကပ် (${kidneyCount})` },
    { id: 'nutrition', label: `အာဟာရ (${nutritionCount})` },
    { id: 'elderly', label: `သက်ကြီး (${elderlyCount})` },
  ];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
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
      case 'pediatrics': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'vaccine': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
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

      {/* Top Banner - Bright, Clean & Modern Medical Theme */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-sky-50 border border-emerald-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ယုံကြည်စိတ်ချရသော ဆေးပညာ ဗဟုသုတများ (စုစုပေါင်း {HEALTH_ARTICLES.length} ပုဒ်)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ကျန်းမာရေး သတင်း & ဆေးပညာ ဗဟုသုတများ
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              ကာကွယ်ဆေးများ၊ သိုင်းရွိုက်၊ သွေးတိုး၊ ဆီးချို၊ အသည်း၊ ကျောက်ကပ်၊ ယူရစ်အက်စစ်နှင့် သက်ကြီးကျန်းမာရေးအတွက် အထူးကုဆရာဝန်ကြီးများ၏ လက်တွေ့ကျ လမ်းညွှန်ချက်များ
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedCategory('bookmarked')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                selectedCategory === 'bookmarked'
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
              placeholder="ဆောင်းပါး၊ ရောဂါအမည် (ကာကွယ်ဆေး၊ သိုင်းရွိုက်၊ သွေးတိုး၊ ဆီးချို)... ရှာရန်"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-emerald-200/90 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                  selectedCategory === cat.id
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

      {/* Articles Grid - Bright, Clean White Cards */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">ဆောင်းပါး ရှာမတွေ့ပါ</h3>
          <p className="text-xs text-slate-500">ရှာဖွေမှု စကားလုံးကို ပြောင်းလဲရိုက်ထည့်ကြည့်ပါ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => {
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

      {/* Article Detail Modal - Crisp Bright Clinical Design */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getCategoryBadgeColor(activeArticle.category)}`}>
                    {getCategoryLabel(activeArticle.category)}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {activeArticle.publishedDate}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-emerald-700 font-semibold">
                  ရေးသားသူ: {activeArticle.author}
                </p>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Takeaways Box */}
            <div className="my-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>အဓိက လိုက်နာဆောင်ရွက်ရန် အချက်များ (Key Action Points):</span>
              </div>
              <ul className="space-y-1.5 text-slate-700">
                {activeArticle.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Article Content */}
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-80 overflow-y-auto pr-2">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(activeArticle.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    bookmarkedIds.includes(activeArticle.id)
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeArticle.id) ? 'fill-current' : ''}`} />
                  <span>{bookmarkedIds.includes(activeArticle.id) ? 'မှတ်သားပြီး' : 'မှတ်သားမည်'}</span>
                </button>
                <button
                  onClick={() => handleShare(activeArticle)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>မျှဝေမည်</span>
                </button>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
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
