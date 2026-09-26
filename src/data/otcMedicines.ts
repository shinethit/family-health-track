import { OTCMedicine } from '../types/health';

export const OTC_MEDICINES_DATA: OTCMedicine[] = [
  {
    id: 'otc-01',
    nameMm: 'ပါရာစီတမော (Paracetamol / Acetaminophen)',
    genericName: 'Paracetamol 500mg',
    category: 'fever_pain',
    categoryLabelMm: 'အဖျားနှင့် အကိုက်အခဲပျောက်ဆေး',
    indications: [
      'အဖျားတက်ခြင်း (Fever)',
      'ခေါင်းကိုက်ခြင်း၊ သွားကိုက်ခြင်း၊ ကြွက်သားကိုက်ခဲခြင်း',
      'တုပ်ကွေးနှင့် ကိုယ်လက်လေးလံခြင်း',
      'ရာသီသွေးလာစဉ် ကိုက်ခဲခြင်း'
    ],
    usage: 'အစာစားပြီးမှ ရေအပြည့်ဖြင့် သောက်သုံးရန်။ တစ်ကြိမ်သောက်ပြီးပါက နောက်တစ်ကြိမ်သောက်ရန် အနည်းဆုံး ၄ နာရီမှ ၆ နာရီ ခြားရပါမည်။',
    minDose: 'လူကြီး: ၁ ပြား (500mg) မှ ၂ ပြား (1000mg)',
    maxDose: '၁ ရက်လျှင် ၄၀၀၀ မီလီဂရမ် (၈ ပြား) ထက် ပိုမသောက်ရ။ (အသည်း ထိခိုက်နိုင်သည်)',
    childDose: 'ကလေးများ: 10 - 15 mg/kg per dose (ဆရက်ရည် သို့မဟုတ် ကလေးဆေးပြား)',
    sideEffects: [
      'ဆေးပမာဏ အလွန်အကျွံ သောက်မိပါက အသည်းပျက်စီးခြင်း (Hepatotoxicity)',
      'အရေပြား အဖုအပိန့် ထွက်ခြင်း (ဓာတ်မတည့်ပါက)',
      'ဗိုက်အနည်းငယ် ရောဂါရခြင်း'
    ],
    precautions: [
      'နာတာရှည် အသည်းရောဂါ၊ အသည်းရောင် ဘီပိုး/စီပိုး ရှိသူများ ဆရာဝန်နှင့် မတိုင်ပင်ဘဲ မသောက်ရ။',
      'အရက်သောက်သုံးထားသူများ ပါရာစီတမော မသောက်ရ။',
      'အခြား အဖျားပျောက် စပ်ဆေးများတွင် ပါရာစီတမော ပါဝင်ပြီးဖြစ်ပါက ထပ်မံမသောက်ရ။'
    ],
    drugInteractions: [
      'သွေးပါးဆေး Warfarin (ပါရာစီတမော ရေရှည်သောက်ပါက သွေးထွက်လွယ်စေသည်)',
      'အခြား ပါရာစီတမော ပါဝင်သော တုပ်ကွေးစပ်ဆေးများ (Overdose မဖြစ်စေရန်)',
      'အတက်ဆေး Phenytoin, Carbamazepine'
    ],
    foodInteractions: [
      'အရက် / ဘီယာ / သေရည်သောက်စားခြင်း (အသည်းအဆိပ်တက်နိုင်ခြေ အလွန်မြင့်မားသည်)',
      'ကော်ဖီ / ကာဖိန်းပါသော အဖျော်ယမကာများ (ရင်တုန်ခြင်း ဖြစ်စေနိုင်သည်)'
    ],
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    id: 'otc-02',
    nameMm: 'ဓာတ်ဆားရည် (Oral Rehydration Salts - ORS)',
    genericName: 'ORS (WHO Formula)',
    category: 'diarrhea_ors',
    categoryLabelMm: 'ဝမ်းလျှောနှင့် ဓာတ်ဆားဖြည့်ဆေး',
    indications: [
      'ဝမ်းလျှော ဝမ်းပျက်ခြင်း (Diarrhea)',
      'အန်ခြင်းနှင့် ရေဓာတ်ခမ်းခြောက်ခြင်း (Dehydration)',
      'မိုးပူထဲ သွားလာ၍ ချွေးထွက်လွန်ခြင်း',
      'ကိုယ်လက် မောပန်းနွမ်းနယ်ခြင်း'
    ],
    usage: 'ဓာတ်ဆားထုတ်တစ်ထုတ်ကို သန့်ရှင်းသော ရေကျက်အေး ၁ လီတာ (သို့မဟုတ် ထုတ်ပိုးပါ လမ်းညွှန်အတိုင်း ရေပမာဏ) တွင် သန့်ရှင်းစွာ ဖျော်စပ်၍ တစ်နေ့လုံး နည်းနည်းစီ ခဏခဏ သောက်ပေးပါ။ ဖျော်ပြီး ၂၄ နာရီကျော်ပါက သွန်ပစ်ပါ။',
    minDose: 'လူကြီး: ဝမ်းသွားသည့်အကြိမ်တိုင်း သို့မဟုတ် လိုအပ်သလို အကန့်အသတ်မရှိ သောက်နိုင်ပါသည်။',
    maxDose: 'ပမာဏ အကန့်အသတ်မရှိ (ပုံမှန် ရေဓာတ်ပြည့်ဝသည်အထိ သောက်ပါ)',
    childDose: 'ကလေးငယ်များ: ဝမ်းတစ်ကြိမ်သွားလျှင် ဖန်ခွက်ဝက်မှ ၁ ခွက် (100 - 200ml) တိုက်ပါ',
    sideEffects: [
      'ရေပမာဏ မမှန်ဘဲ ပြင်းအားလွန်အောင် ဖျော်ပါက ပျို့အန်ခြင်း ဖြစ်နိုင်သည်',
      'ကျောက်ကပ်ရောဂါရှိသူများ ပိုတက်စီယမ် တက်နိုင်သည်'
    ],
    precautions: [
      'ရေနွေး သို့မဟုတ် သီးစုံဖျော်ရည်များဖြင့် မဖျော်ရပါ။ ရေကျက်အေးဖြင့်သာ ဖျော်ပါ။',
      'ပြင်းထန် ကျောက်ကပ်ရောဂါ သို့မဟုတ် နှလုံးပျက်စီးသူများ သတိပြုပါ။',
      'ဝမ်းထဲ သွေးပါပါက သို့မဟုတ် ၂၄ နာရီအတွင်း မသက်သာပါက ဆေးရုံ/ဆေးခန်း သွားပါ။'
    ],
    drugInteractions: [
      'ACE inhibitors / ARBs သွေးတိုးဆေးများ (ပိုတက်စီယမ်ဓာတ် မြင့်မားနိုင်သည်)'
    ],
    foodInteractions: [
      'သကြား အလွန်များသော အဖျော်ယမကာများနှင့် တွဲမသောက်ရ (ဝမ်းပိုလျှောစေသည်)'
    ],
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200'
  },
  {
    id: 'otc-03',
    nameMm: 'လေနိုင်ဆေး / အစာအိမ် အချဉ်ပေါက်ပျောက်ဆေး (Antacid / Dimethicone / Aluminum Hydroxide)',
    genericName: 'Antacid Chewable Tablet / Liquid Gel',
    category: 'stomach_gas',
    categoryLabelMm: 'အစာအိမ်နှင့် လေဆေး',
    indications: [
      'အစာအိမ် အချဉ်ပေါက်ခြင်း (Heartburn / GERD)',
      'ဗိုက်အောင့်ခြင်း၊ လေထခြင်း၊ ရင်ပြည့်ရင်ကယ်ဖြစ်ခြင်း',
      'အစာမကြေခြင်း (Indigestion)',
      'အစာအိမ် ရောင်ရမ်းခြင်း'
    ],
    usage: 'ဆေးပြားဖြစ်ပါက သေချာစွာ ဝါးစားပြီးမှ ရေ သောက်ပါ။ အစာစားပြီး ၁ နာရီအကြာ သို့မဟုတ် ဗိုက်အောင့်ချိန်/အိပ်ရာဝင်ချိန်တွင် သောက်ပါ။',
    minDose: 'လူကြီး: ၁ ပြား မှ ၂ ပြား (ဝါးစားရန်) သို့မဟုတ် ဆေးရည် စပန်းဇွန်း ၁ ဇွန်း',
    maxDose: '၁ ရက်လျှင် စုစုပေါင်း ၆-၈ ပြား ထက် ပိုမသောက်ရ',
    childDose: 'ကလေးများ: အသက် ၁၂ နှစ်အထက်သာ သောက်ရန် သို့မဟုတ် ဆရာဝန် ညွှန်ကြားချက်အတိုင်း',
    sideEffects: [
      'အလူမီနီယမ်ပါသော ဆေးများ ဝမ်းချုပ်စေနိုင်သည်',
      'မဂ္ဂနီစီယမ်ပါသော ဆေးများ ဝမ်းသွားစေနိုင်သည်'
    ],
    precautions: [
      'အခြား သောက်ဆေးများနှင့် အနည်းဆုံး ၂ နာရီခြားပြီးမှ သောက်ပါ။ (အခြားဆေး စုပ်ယူမှုကို ဟန့်တားသည်)',
      'ကျောက်ကပ်ရောဂါသည်များ ရေရှည် မသောက်သင့်ပါ။'
    ],
    drugInteractions: [
      'ပဋိဇီဝဆေး Tetracycline, Ciprofloxacin, Levofloxacin (စုပ်ယူမှု လျော့ကျစေသည်)',
      'သံဓာတ်အားဆေး Iron supplements',
      'Digoxin နှလုံးဆေး'
    ],
    foodInteractions: [
      'ချဉ်သော သစ်သီးဖျော်ရည်များ (အက်ဆစ်ပိုထွက်စေသည်)',
      'စူးစပ်စပိုင်စီ အစားအစာများ'
    ],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'otc-04',
    nameMm: 'စတီရီဇင်း (Cetirizine / Allergy & Cold Medicine)',
    genericName: 'Cetirizine Hydrochloride 10mg',
    category: 'allergy_cold',
    categoryLabelMm: 'အာလဂျီနှင့် နှာစေးဆေး',
    indications: [
      'နှာစေးခြင်း၊ နှာချေခြင်း၊ စိတ်ရည်ယိုခြင်း',
      'အရေပြား အယားပြင်ထခြင်း၊ အမှိုက်/ဝတ်မှောင် ဓာတ်မတည့်ခြင်း',
      'ယားယံသော ယက်ဖုများ၊ အင်းဆက်ကိုက်ခံရခြင်း'
    ],
    usage: 'ညဘက် အိပ်ရာမဝင်မီ ၁ ပြား သောက်သုံးရန် သင့်တော်သည်။ ရေဖြင့် မျိုချပါ။',
    minDose: 'လူကြီး: ၁ ပြား (10mg) ၁ ရက် ၁ ကြိမ်',
    maxDose: '၁ ရက်လျှင် ၁၀ မီလီဂရမ် (၁ ပြား) ထက် ပိုမသောက်ရ။',
    childDose: 'အသက် ၆-၁၂ နှစ် ကလေး: 5mg (ပြားဝက်) ၁ ရက် ၁ ကြိမ်',
    sideEffects: [
      'ငိုက်မျဉ်းခြင်း၊ ခေါင်းနောက်ခြင်း',
      'ခံတွင်း ခြောက်သွေ့ခြင်း',
      'အနည်းငယ် မောပန်းခြင်း'
    ],
    precautions: [
      'ဆေးသောက်ပြီးပါက ကားမောင်းခြင်း၊ စက်ပစ္စည်းကိုင်တွယ်ခြင်း မပြုလုပ်ရပါ။',
      'အရက်နှင့် တွဲဖက်မသောက်ရပါ။',
      'ကျောက်ကပ် လုပ်ဆောင်ချက် မကောင်းသူများ ပမာဏ လျှော့သောက်ရမည်။'
    ],
    drugInteractions: [
      'အိပ်ဆေး၊ စိတ်ငြိမ်ဆေးများ (အိပ်ငိုက်ခြင်း အလွန်ပြင်းထန်စေသည်)',
      'အခြား Antihistamines အာလဂျီဆေးများ'
    ],
    foodInteractions: [
      'အရက် / ဘီယာ (အိပ်ငိုက်ခြင်းနှင့် သတိလွတ်ခြင်း ပိုမိုပြင်းထန်စေသည်)'
    ],
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'otc-05',
    nameMm: 'ဒွန်ပါရီဒုန်း (Domperidone / Anti-nausea Medicine)',
    genericName: 'Domperidone 10mg',
    category: 'stomach_gas',
    categoryLabelMm: 'ပျို့အန် ပျောက်ဆေး',
    indications: [
      'အန်ချင် ပျို့အန်ခြင်း (Nausea & Vomiting)',
      'အစာအိမ် လေပွခြင်း၊ ရင်ပြည့်ခြင်း',
      'အစာအိမ်လှုပ်ရှားမှု အားနည်းခြင်း'
    ],
    usage: 'အစာမစားမီ မိနစ် ၁၅ မှ ၃၀ အလိုတွင် သောက်ပါ။ (အစာစားပြီးမှသောက်ပါက အာနိသင်လျော့သည်)',
    minDose: 'လူကြီး: ၁ ပြား (10mg) မနက်/နေ့/ည အစာမစားမီ',
    maxDose: '၁ ရက်လျှင် မီလီဂရမ် ၃၀ (၃ ပြား) ထက် ပိုမသောက်ရ။ အများဆုံး ၇ ရက်သာ သောက်ရန်။',
    childDose: 'ကလေးငယ်များ ဆရာဝန် မညွှန်ကြားဘဲ မတိုက်ရပါ။',
    sideEffects: [
      'ခံတွင်းခြောက်ခြင်း',
      'ခေါင်းကိုက်ခြင်း၊ ဝမ်းလျှောခြင်း',
      'နှလုံးခုန်နှုန်း မမှန်ခြင်း (ပမာဏများပါက)'
    ],
    precautions: [
      'နှလုံးရောဂါရှိသူများ၊ နှလုံးခုန်မမှန်သူများ လုံးဝ မသောက်ရ။',
      'အစာအိမ်/အူလမ်းကြောင်း သွေးထွက်နေသူများ သောက်ရန် မသင့်ပါ။'
    ],
    drugInteractions: [
      'Erythromycin, Ketoconazole (နှလုံးခုန်နှုန်း ပုံမှန်မဟုတ် ဖြစ်စေနိုင်သည်)',
      'အသက်ရှူလမ်းကြောင်းနှင့် မှိုပိုးသတ်ဆေးများ'
    ],
    foodInteractions: [
      'အစာနှင့် တွဲသောက်ပါက စုပ်ယူမှု နှေးကွေးသဖြင့် အစာမစားမီ သောက်ပါ။'
    ],
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    id: 'otc-06',
    nameMm: 'အိုင်အိုဒင်း အနာသန့်ဆေးရည် (Povidone Iodine Antiseptic Solution)',
    genericName: 'Povidone-Iodine 10%',
    category: 'firstaid_topical',
    categoryLabelMm: 'အနာကပ်နှင့် ပွန်းပဲ့ထိခိုက် လိမ်းဆေး',
    indications: [
      'ထိခိုက် ပွန်းပဲ့ဒဏ်ရာများ (Minor Cuts & Abrasions)',
      'ဒဏ်ရာ ပိုးမဝင်အောင် ကာကွယ်ခြင်း',
      'ခွဲစိတ်ဒဏ်ရာနှင့် မီးလောင်ဒဏ်ရာငယ်များ'
    ],
    usage: 'ဒဏ်ရာကို သန့်ရှင်းသော ရေ သို့မဟုတ် Normal Saline ဖြင့် အရင် ဆေးကြောပါ။ ထို့နောက် ဂွမ်း သို့မဟုတ် ပတ်တီးစဖြင့် ဆေးရည် တို့တို့ပေးပါ။',
    minDose: 'ဒဏ်ရာပေါ်တွင် ၁ နေ့လျှင် ၁ ကြိမ်မှ ၂ ကြိမ် လိမ်းပေးရန်',
    maxDose: 'ကျယ်ပြန့်သော ဒဏ်ရာကြီးများတွင် အလွန်အကျွံ မလိမ်းရ',
    sideEffects: [
      'အရေပြား အနည်းငယ် စပ်ဖျင်းဖျင်းဖြစ်ခြင်း',
      'အိုင်အိုဒင်း ဓာတ်မတည့်ပါက နီရဲအဖုထခြင်း'
    ],
    precautions: [
      'မျက်လုံးထဲသို့ မဝင်ပါစေနှင့်။',
      'သိုင်းရွိုက်ရောဂါရှိသူများ ခန္ဓာကိုယ် နေရာအကျယ်ကြီးတွင် ရေရှည် မလိမ်းရ။',
      'နက်ရှိုင်းသော သံစူးဒဏ်ရာများနှင့် တိရစ္ဆာန်ကိုက်ဒဏ်ရာများတွင် ဆရာဝန်ပြပါ။'
    ],
    drugInteractions: [
      'ပြဒါး (Mercury) ပါသော အနာလိမ်းဆေးများနှင့် မတွဲရပါ'
    ],
    foodInteractions: ['မရှိပါ (ပြင်ပလိမ်းဆေးဖြစ်သည်)'],
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  {
    id: 'otc-07',
    nameMm: 'ဘရွမ်ဟက်ဇင်း သလိပ်ပျော် ချောင်းဆိုးဆေး (Bromhexine Hydrochloride)',
    genericName: 'Bromhexine 8mg / Syrup',
    category: 'cough_phlegm',
    categoryLabelMm: 'ချောင်းဆိုးနှင့် သလိပ်ပျော်ဆေး',
    indications: [
      'သလိပ်ပါသော ချောင်းဆိုးခြင်း (Wet / Productive Cough)',
      'အသက်ရှူလမ်းကြောင်း လေပြွန်ရောင်ခြင်း',
      'သလိပ်ပျစ်ခဲ၍ ထွက်ရခက်ခြင်း'
    ],
    usage: 'အစာစားပြီးမှ သောက်သုံးပါ။ ရေများများ သောက်ပေးခြင်းဖြင့် သလိပ် ပိုမိုကျလွယ်စေသည်။',
    minDose: 'လူကြီး: ၁ ပြား (8mg) ၁ ရက် ၃ ကြိမ်',
    maxDose: '၁ ရက်လျှင် ၄၈ မီလီဂရမ် (၆ ပြား) ထက် ပိုမသောက်ရ',
    childDose: 'ကလေးများ: ဆရက်ရည် (2mg/5ml) ကလေးအသက်အလိုက် ဇွန်းငယ် ၁ ဇွန်း',
    sideEffects: [
      'အစာအိမ် မအီမသာဖြစ်ခြင်း',
      'ခေါင်းမူးခြင်း၊ ချွေးထွက်ခြင်း',
      'အရေပြား အဖုအပိန့်ထခြင်း'
    ],
    precautions: [
      'အစာအိမ် အနာရှိသူများ သတိထား၍ သောက်ရန်။',
      'သလိပ်မပါဘဲ ချောင်းခြောက်ဆိုးသူများအတွက် မလိုအပ်ပါ။'
    ],
    drugInteractions: [
      'Amoxicillin, Doxycycline ပဋိဇီဝဆေးများ (အသက်ရှူလမ်းကြောင်းသို့ ပဋိဇီဝဆေး ရောက်ရှိမှု ပိုများစေသည်)'
    ],
    foodInteractions: [
      'ရေနွေးများများ သောက်ပေးရန် အထူးအကြံပြုပါသည်'
    ],
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'otc-08',
    nameMm: 'ဒဏ်ကြေလိမ်းဆေး / မဲသိုလ် နာကျင်မှုပြေပျောက် လိမ်းဆေး (Analgesic Balm / Menthol)',
    genericName: 'Methyl Salicylate + Menthol Balm',
    category: 'firstaid_topical',
    categoryLabelMm: 'ဒဏ်ကြေ အကိုက်အခဲ လိမ်းဆေး',
    indications: [
      'ဇက်ကြောတက်ခြင်း၊ ခါးနာခြင်း၊ ပခုံးနာခြင်း',
      'ကြွက်သား ညောင်းညာခြင်းနှင့် အဆစ်အမြစ် ကိုက်ခဲခြင်း',
      'တင်းအားကြောင့် ခေါင်းကိုက်ခြင်း'
    ],
    usage: 'နာကျင်သော နေရာတွင် အနည်းငယ် တို့ယူ၍ ဖြည်းညင်းစွာ ပွတ်လိမ်းပေးပါ။',
    minDose: '၁ ရက်လျှင် ၃ ကြိမ်မှ ၄ ကြိမ် လိမ်းနိုင်ပါသည်',
    maxDose: 'ဒဏ်ရာအဖွင့် သို့မဟုတ် ပွန်းပဲ့နေသော အသားပေါ် မလိမ်းရ',
    sideEffects: [
      'အရေပြား ပူစပ်ပူလောင် ဖြစ်ခြင်း',
      'နီရဲ၍ ယားယံခြင်း'
    ],
    precautions: [
      'မျက်လုံး၊ ပါးစပ်နှင့် ချွဲမြှေးပါသော နေရာများကို မထိမိပါစေနှင့်။',
      'လိမ်းပြီးပါက ပတ်တီး စီးနှောင်ထားခြင်း သို့မဟုတ် အပူအိတ် ကပ်ခြင်း မပြုလုပ်ရ (အပူလောင်နိုင်သည်)။',
      'ကလေးငယ်များ လက်လှမ်းမမီသော နေရာတွင် ထားပါ။'
    ],
    drugInteractions: ['မရှိပါ (ပြင်ပလိမ်းဆေးဖြစ်သည်)'],
    foodInteractions: ['မရှိပါ'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'otc-12',
    nameMm: 'ကလိုဖီနာရက် (Diclofenac - Pain)',
    genericName: 'Diclofenac Sodium 50mg',
    category: 'fever_pain',
    categoryLabelMm: 'အကိုက်အခဲပျောက်ဆေး',
    indications: ['အရိုးအဆစ်ကိုက်ခဲခြင်း', 'ခွဲစိတ်ပြီးနောက် နာကျင်ခြင်း'],
    usage: 'အစာစားပြီး သောက်ပါ။',
    minDose: '၅၀ မီလီဂရမ်',
    maxDose: '၁၅၀ မီလီဂရမ်',
    childDose: 'မသောက်ရ',
    sideEffects: ['ဗိုက်အောင့်ခြင်း'],
    precautions: ['အစာအိမ်အနာရှိသူများ ရှောင်ပါ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    id: 'otc-13',
    nameMm: 'ကလိုဖီနာရက် လိမ်းဆေး (Diclofenac Gel)',
    genericName: 'Diclofenac 1%',
    category: 'firstaid_topical',
    categoryLabelMm: 'ဒဏ်ကြေလိမ်းဆေး',
    indications: ['ကြွက်သားနာကျင်ခြင်း', 'အဆစ်ရောင်ခြင်း'],
    usage: 'နာကျင်သောနေရာကို နေ့စဉ် ၃-၄ ကြိမ် လိမ်းပါ',
    minDose: 'လိုအပ်သလောက်',
    maxDose: '၄ ကြိမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ယားယံခြင်း'],
    precautions: ['အနာဖွင့်ပေါ်မလိမ်းရ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'otc-14',
    nameMm: 'ကလိုဖီနာရမင်း (Chlorpheniramine)',
    genericName: 'Chlorpheniramine 4mg',
    category: 'allergy_cold',
    categoryLabelMm: 'အာလဂျီဆေး',
    indications: ['နှာစေး', 'ယားယံခြင်း'],
    usage: 'တစ်နေ့ ၃ ကြိမ် သောက်ပါ',
    minDose: '၄ မီလီဂရမ်',
    maxDose: '၂၄ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['အိပ်ငိုက်ခြင်း'],
    precautions: ['ကားမောင်းသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'otc-15',
    nameMm: 'ဆာလ်ဘူတမော (Salbutamol - Inhaler)',
    genericName: 'Salbutamol 100mcg',
    category: 'allergy_cold',
    categoryLabelMm: 'ပန်းနာရင်ကြပ်ဆေး',
    indications: ['ပန်းနာရင်ကြပ်', 'အသက်ရှူကျပ်ခြင်း'],
    usage: 'အသက်ရှူကျပ်ချိန် ရှူပါ',
    minDose: '၁-၂ ရှူ',
    maxDose: '၈ ရှူ',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ရင်တုန်ခြင်း'],
    precautions: ['နှလုံးရောဂါရှိသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'otc-16',
    nameMm: 'မက်ဖော်မင် (Metformin - Diabetes)',
    genericName: 'Metformin 500mg',
    category: 'stomach_gas',
    categoryLabelMm: 'ဆီးချိုဆေး',
    indications: ['ဆီးချိုရောဂါ'],
    usage: 'အစာစားပြီး သောက်ပါ',
    minDose: '၅၀၀ မီလီဂရမ်',
    maxDose: '၂၀၀၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ပျို့အန်ခြင်း', 'ဝမ်းလျှောခြင်း'],
    precautions: ['ကျောက်ကပ်ရောဂါရှိသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  {
    id: 'otc-17',
    nameMm: 'အက်စပရင် (Aspirin)',
    genericName: 'Aspirin 75mg',
    category: 'fever_pain',
    categoryLabelMm: 'သွေးပါးဆေး',
    indications: ['နှလုံးရောဂါကာကွယ်ခြင်း', 'သွေးခဲခြင်း'],
    usage: 'နေ့စဉ် ၁ ကြိမ် သောက်ပါ',
    minDose: '၇၅ မီလီဂရမ်',
    maxDose: '၃၀၀ မီလီဂရမ်',
    childDose: 'မသောက်ရ',
    sideEffects: ['အစာအိမ်သွေးယိုခြင်း'],
    precautions: ['အစာအိမ်ရောဂါရှိသူများ သတိပြု'],
    drugInteractions: ['အခြားသွေးပါးဆေးများ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    id: 'otc-18',
    nameMm: 'ဗီတာမင်စီ (Vitamin C)',
    genericName: 'Ascorbic Acid 500mg',
    category: 'fever_pain',
    categoryLabelMm: 'ဗီတာမင်ဖြည့်စွက်ဆေး',
    indications: ['ကိုယ်ခံအားတိုးမြှင့်ခြင်း', 'ဗီတာမင်စီချို့တဲ့ခြင်း'],
    usage: 'နေ့စဉ် ၁ ပြား',
    minDose: '၅၀၀ မီလီဂရမ်',
    maxDose: '၂၀၀၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ဝမ်းသွားခြင်း'],
    precautions: ['ကျောက်ကပ်တွင် ကျောက်တည်ခြင်းရှိသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'otc-19',
    nameMm: 'ကလ်စီယမ် (Calcium)',
    genericName: 'Calcium Carbonate 500mg',
    category: 'fever_pain',
    categoryLabelMm: 'အရိုးအားဆေး',
    indications: ['အရိုးပါးရောဂါ', 'ကယ်လ်စီယမ်ချို့တဲ့ခြင်း'],
    usage: 'အစာစားပြီး သောက်ပါ',
    minDose: '၅၀၀ မီလီဂရမ်',
    maxDose: '၁၅၀၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ဝမ်းချုပ်ခြင်း'],
    precautions: ['ကျောက်ကပ်ရောဂါရှိသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'otc-20',
    nameMm: 'သွေးအားနည်းဆေး (Ferrous Sulfate)',
    genericName: 'Ferrous Sulfate 200mg',
    category: 'fever_pain',
    categoryLabelMm: 'သွေးအားဆေး',
    indications: ['သွေးအားနည်းရောဂါ'],
    usage: 'အစာစားပြီး သောက်ပါ',
    minDose: '၂၀၀ မီလီဂရမ်',
    maxDose: '၆၀၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ဝမ်းမည်းသွားခြင်း', 'ဝမ်းချုပ်ခြင်း'],
    precautions: ['အစာအိမ်ရောဂါရှိသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-red-50 text-red-800 border-red-200'
  },
  {
    id: 'otc-21',
    nameMm: 'ဆာလ်ဖာဆေး (Sulfamethoxazole + Trimethoprim)',
    genericName: 'Co-trimoxazole',
    category: 'fever_pain',
    categoryLabelMm: 'ပိုးသတ်ဆေး',
    indications: ['ဆီးလမ်းကြောင်းပိုးဝင်ခြင်း', 'အသက်ရှူလမ်းကြောင်းပိုးဝင်ခြင်း'],
    usage: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    minDose: '၂ ပြား',
    maxDose: '၄ ပြား',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ဓာတ်မတည့်ခြင်း', 'ပျို့အန်ခြင်း'],
    precautions: ['ဓာတ်မတည့်သူများ မသောက်ရ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-red-50 text-red-800 border-red-200'
  },
  {
    id: 'otc-22',
    nameMm: 'ဒက်ဇာမက်သဇုန်း (Dexamethasone)',
    genericName: 'Dexamethasone 0.5mg',
    category: 'allergy_cold',
    categoryLabelMm: 'ဓာတ်မတည့်ပျောက်ဆေး',
    indications: ['ပြင်းထန်ဓာတ်မတည့်ခြင်း', 'ရောင်ရမ်းခြင်း'],
    usage: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    minDose: '၀.၅ မီလီဂရမ်',
    maxDose: '၃ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ကိုယ်အလေးချိန်တိုးခြင်း', 'အစာအိမ်နာခြင်း'],
    precautions: ['ရေရှည်မသောက်ရ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'otc-23',
    nameMm: 'မီတိုကလိုပရာမိုက် (Metoclopramide)',
    genericName: 'Metoclopramide 10mg',
    category: 'stomach_gas',
    categoryLabelMm: 'ပျို့အန်ပျောက်ဆေး',
    indications: ['ပျို့အန်ခြင်း'],
    usage: 'အစာမစားမီ သောက်ပါ',
    minDose: '၁၀ မီလီဂရမ်',
    maxDose: '၃၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['အိပ်ငိုက်ခြင်း'],
    precautions: ['အတက်ရောဂါရှိသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    id: 'otc-24',
    nameMm: 'ဆင်နာ (Senna)',
    genericName: 'Senna 7.5mg',
    category: 'stomach_gas',
    categoryLabelMm: 'ဝမ်းနှုတ်ဆေး',
    indications: ['ဝမ်းချုပ်ခြင်း'],
    usage: 'ညဘက် သောက်ပါ',
    minDose: '၇.၅ မီလီဂရမ်',
    maxDose: '၃၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ဗိုက်အောင့်ခြင်း'],
    precautions: ['ရေရှည်မသောက်ရ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  {
    id: 'otc-25',
    nameMm: 'အိုင်ဗူပရိုဖန် (Ibuprofen)',
    genericName: 'Ibuprofen 400mg',
    category: 'fever_pain',
    categoryLabelMm: 'အကိုက်အခဲပျောက်ဆေး',
    indications: ['အဖျား', 'ကိုက်ခဲခြင်း'],
    usage: 'အစာစားပြီး သောက်ပါ',
    minDose: '၄၀၀ မီလီဂရမ်',
    maxDose: '၁၂၀၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['အစာအိမ်နာခြင်း'],
    precautions: ['အစာအိမ်ရောဂါရှိသူများ ရှောင်ပါ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    id: 'otc-26',
    nameMm: 'လိုရာတာဒင်း (Loratadine)',
    genericName: 'Loratadine 10mg',
    category: 'allergy_cold',
    categoryLabelMm: 'အာလဂျီဆေး',
    indications: ['နှာစေး', 'ယားယံခြင်း'],
    usage: 'နေ့စဉ် ၁ ကြိမ်',
    minDose: '၁၀ မီလီဂရမ်',
    maxDose: '၁၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ခေါင်းကိုက်ခြင်း'],
    precautions: ['မရှိ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'otc-27',
    nameMm: 'မက်ဂနီစီယမ် ဟိုက်ဒရောဆိုဒ် (Magnesium Hydroxide)',
    genericName: 'Magnesium Hydroxide',
    category: 'stomach_gas',
    categoryLabelMm: 'အစာအိမ်ဆေး',
    indications: ['အစာအိမ်အချဉ်ပေါက်ခြင်း'],
    usage: 'လိုအပ်ပါက သောက်ပါ',
    minDose: '၅ မီလီလီတာ',
    maxDose: '၃၀ မီလီလီတာ',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ဝမ်းလျှောခြင်း'],
    precautions: ['ကျောက်ကပ်ရောဂါရှိသူများ သတိပြု'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  {
    id: 'otc-28',
    nameMm: 'ဟိုင်ဒရိုကော့တီဇုန်း (Hydrocortisone Cream)',
    genericName: 'Hydrocortisone 1%',
    category: 'firstaid_topical',
    categoryLabelMm: 'အသားအရေလိမ်းဆေး',
    indications: ['ယားယံခြင်း', 'အဖုအပိန့်များ'],
    usage: 'ပါးပါးလိမ်းပါ',
    minDose: 'လိုအပ်သလောက်',
    maxDose: 'တစ်နေ့ ၄ ကြိမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['အသားအရေပါးခြင်း'],
    precautions: ['မျက်နှာပေါ်တွင် ရေရှည်မလိမ်းရ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'otc-29',
    nameMm: 'ဘီပလက်စ် (B-Complex)',
    genericName: 'Vitamin B1, B6, B12',
    category: 'fever_pain',
    categoryLabelMm: 'ဗီတာမင်ဖြည့်စွက်ဆေး',
    indications: ['အာရုံကြောအားနည်းခြင်း'],
    usage: 'နေ့စဉ် ၁ ပြား',
    minDose: '၁ ပြား',
    maxDose: '၃ ပြား',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['မရှိ'],
    precautions: ['မရှိ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'otc-30',
    nameMm: 'ဇင့် (Zinc)',
    genericName: 'Zinc 50mg',
    category: 'fever_pain',
    categoryLabelMm: 'ဗီတာမင်ဖြည့်စွက်ဆေး',
    indications: ['ကိုယ်ခံအားတိုးမြှင့်ခြင်း'],
    usage: 'နေ့စဉ် ၁ ကြိမ်',
    minDose: '၅၀ မီလီဂရမ်',
    maxDose: '၅၀ မီလီဂရမ်',
    childDose: 'ဆရာဝန်ညွှန်ကြားချက်အတိုင်း',
    sideEffects: ['ပျို့အန်ခြင်း'],
    precautions: ['အစာစားပြီးမှ သောက်ပါ'],
    drugInteractions: ['မရှိ'],
    foodInteractions: ['မရှိ'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }
];

