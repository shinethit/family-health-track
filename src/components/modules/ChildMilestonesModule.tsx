import React, { useState } from 'react';
import { 
  Baby, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Heart, 
  Activity, 
  HelpCircle, 
  Lightbulb, 
  ChevronRight,
  RotateCcw,
  Smile,
  ShieldAlert,
  Award
} from 'lucide-react';

interface MilestoneItem {
  id: string;
  category: 'social' | 'language' | 'cognitive' | 'movement';
  textMm: string;
}

interface AgeMilestoneData {
  ageId: string;
  ageTitleMm: string;
  ageSubtitleMm: string;
  badge: string;
  milestones: MilestoneItem[];
  redFlagsMm: string[];
  parentTipsMm: string[];
}

const MILESTONES_DATA: AgeMilestoneData[] = [
  {
    ageId: '2_months',
    ageTitleMm: 'အသက် ၂ လအရွယ် (2 Months)',
    ageSubtitleMm: 'လူကို စတင်ပြုံးပြခြင်း၊ ခေါင်းမော့ကြည့်ခြင်းနှင့် အသံပြုခြင်း',
    badge: '၂ လ',
    milestones: [
      { id: 'm2_1', category: 'social', textMm: 'လူကို မြင်လျှင် သို့မဟုတ် စကားပြောလျှင် အပြုံးဖြင့် စတင်တုံ့ပြန်ပြုံးပြသည် (Social Smile)' },
      { id: 'm2_2', category: 'social', textMm: 'လက်ချောင်းလေးများကို စို့ပြီး မိမိကိုယ်တိုင် စိတ်ငြိမ်အောင် ပြုလုပ်တတ်သည်' },
      { id: 'm2_3', category: 'language', textMm: 'အူး... အူး... အား... အား... အသံစတင် ပြုလုပ်မြည်တွန်သည် (Coos & Gurgling)' },
      { id: 'm2_4', category: 'language', textMm: 'အသံကြားရာဘက်သို့ ဦးခေါင်းကို လှည့်ကြည့်တတ်သည်' },
      { id: 'm2_5', category: 'cognitive', textMm: 'လူမျက်နှာများကို စိုက်ကြည့်ပြီး ရွေ့လျားသွားသောအရာများကို မျက်လုံးဖြင့် လိုက်ကြည့်သည်' },
      { id: 'm2_6', category: 'movement', textMm: 'မှောက်ထားချိန်တွင် ဦးခေါင်းကို မော့တင်နိုင်ပြီး လည်ပင်းစတင် ခိုင်လာသည်' },
      { id: 'm2_7', category: 'movement', textMm: 'လက်နှင့် ခြေထောက်များကို ပိုမို ချောမွေ့စွာ လှုပ်ရှားကန်ကျောက်တတ်သည်' }
    ],
    redFlagsMm: [
      'ကျယ်လောင်သောအသံများကို လုံးဝတုံ့ပြန်မှု မရှိခြင်း',
      'ရွေ့လျားနေသော အရာဝတ္ထုများကို မျက်လုံးဖြင့် လိုက်မကြည့်ခြင်း',
      'လူများကို လုံးဝပြန်မပြုံးပြခြင်း',
      'လက်ကို ပါးစပ်သို့ မရောက်နိုင်ခြင်း',
      'မှောက်ထားချိန်တွင် ခေါင်းကို အနည်းငယ်မျှ မမော့နိုင်ခြင်း'
    ],
    parentTipsMm: [
      'ကလေးနှင့် မျက်လုံးချင်းဆုံ၍ စကားများများ ပြောပေးပါ၊ ပြုံးပြပါ၊ သီချင်းဆိုပြပါ',
      'နေ့စဉ် ကလေးနိုးနေချိန်တွင် မိနစ်အနည်းငယ် မှောက်ပေးထားပါ (Tummy Time) - လည်ပင်းနှင့် ပခုံးကြွက်သားများ သန်မာစေရန်',
      'ကလေး အသံပြုတိုင်း နွေးထွေးစွာ ပြန်လည်အသံတုံ့ပြန်ပေးပါ'
    ]
  },
  {
    ageId: '4_months',
    ageTitleMm: 'အသက် ၄ လအရွယ် (4 Months)',
    ageSubtitleMm: 'အသံထွက်ရယ်မောခြင်း၊ ပစ္စည်းလှမ်းယူခြင်းနှင့် မှောက်လှန်လေ့ကျင့်ခြင်း',
    badge: '၄ လ',
    milestones: [
      { id: 'm4_1', category: 'social', textMm: 'အလိုအလျောက် ရယ်ပြုံးပြီး လူများနှင့် ကစားရသည်ကို ပျော်ရွှင်သည်' },
      { id: 'm4_2', category: 'social', textMm: 'ငိုခြင်းအပြင် အခြားသော နည်းလမ်းများဖြင့် စိတ်ခံစားချက်ကို ဖော်ပြတတ်သည်' },
      { id: 'm4_3', category: 'language', textMm: 'အသံထွက်၍ တခစ်ခစ် ကျယ်လောင်စွာ ရယ်မောတတ်သည် (Giggle & Laugh)' },
      { id: 'm4_4', category: 'language', textMm: 'ကြားရသော အသံများကို အတုခိုး၍ အသံပြန်ပြုတတ်သည်' },
      { id: 'm4_5', category: 'cognitive', textMm: 'ကစားစရာ အရုပ်များကို မြင်လျှင် လှမ်းယူချင်စိတ် ပြသသည်' },
      { id: 'm4_6', category: 'cognitive', textMm: 'လက်နှင့် မျက်လုံး ပူးပေါင်းလုပ်ဆောင်မှု (Hand-eye coordination) တိုးတက်လာသည်' },
      { id: 'm4_7', category: 'movement', textMm: 'ပက်လက်မှ မှောက်ခုံသို့ စတင် လူးလိမ့်လှန်တတ်လာသည် (Rolls over)' },
      { id: 'm4_8', category: 'movement', textMm: 'မှောက်ထားချိန်တွင် တံတောင်ဆစ်ဖြင့် အားပြု၍ ရင်ဘတ်ကို ကြွနိုင်သည်' }
    ],
    redFlagsMm: [
      'ရွေ့လျားသောအရာများကို မျက်လုံးဖြင့် လိုက်မကြည့်နိုင်ခြင်း',
      'အသံထွက် မရယ်မောခြင်း သို့မဟုတ် အသံမပြုခြင်း',
      'ခေါင်းမခိုင်ဘဲ ယိုင်နဲ့နေခြင်း (Head lag)',
      'ပစ္စည်းများကို လှမ်းမကိုင်ခြင်း သို့မဟုတ် ပါးစပ်သို့ မထည့်ခြင်း',
      'ခြေထောက်ကို ကြမ်းပြင်ပေါ်ထောက်ပေးသော်လည်း တွန်းကန်အား မရှိခြင်း'
    ],
    parentTipsMm: [
      'ရောင်စုံကစားစရာအရုပ်များကို ကလေးရှေ့တွင် လှုပ်ရှားပြပြီး လှမ်းယူစေပါ',
      'ကလေး၏ အသံများကို ပြန်တုပ၍ စကားပြောဆိုမှု အလေ့အကျင့် ပြုလုပ်ပါ',
      'ဘေးကင်းသော နေရာတွင် လွတ်လပ်စွာ လူးလိမ့်လှုပ်ရှားခွင့် ပေးပါ'
    ]
  },
  {
    ageId: '6_months',
    ageTitleMm: 'အသက် ၆ လအရွယ် (6 Months)',
    ageSubtitleMm: 'အမှီမပါဘဲ စတင်ထိုင်နိုင်ခြင်း၊ အသံစုံထွက်ခြင်းနှင့် မှန်ထဲကြည့်ရယ်ခြင်း',
    badge: '၆ လ',
    milestones: [
      { id: 'm6_1', category: 'social', textMm: 'ရင်းနှီးသော မျက်နှာများကို မှတ်မိပြီး သူစိမ်းများကို စတင်ကြောက်တတ်သည်' },
      { id: 'm6_2', category: 'social', textMm: 'မှန်ထဲတွင် မိမိပုံရိပ်ကို ကြည့်၍ ပြုံးရယ်တတ်သည်' },
      { id: 'm6_3', category: 'language', textMm: 'ဗျည်းသံများကို စတင်ရွတ်ဆိုသည် (ဥပမာ- ဘာဘာ၊ မာမာ၊ ဒါဒါ - Babbling)' },
      { id: 'm6_4', category: 'language', textMm: 'မိမိနာမည် ခေါ်လျှင် တုံ့ပြန် လှည့်ကြည့်တတ်သည်' },
      { id: 'm6_5', category: 'cognitive', textMm: 'အနီးအနားရှိ ပစ္စည်းများကို လှမ်းယူပြီး လက်တစ်ဖက်မှ အခြားတစ်ဖက်သို့ ပြောင်းကိုင်တတ်သည်' },
      { id: 'm6_6', category: 'cognitive', textMm: 'ပစ္စည်းများ ပြုတ်ကျသွားပါက အောက်သို့ ငုံ့ကြည့်တတ်သည်' },
      { id: 'm6_7', category: 'movement', textMm: 'အမှီအနည်းငယ်ဖြင့် သို့မဟုတ် အမှီမပါဘဲ ခေတ္တ ထိုင်နိုင်သည်' },
      { id: 'm6_8', category: 'movement', textMm: 'ပက်လက်မှ မှောက်၊ မှောက်ရာမှ ပက်လက် နှစ်ဖက်စလုံး လူးလိမ့်နိုင်သည်' }
    ],
    redFlagsMm: [
      'အရာဝတ္ထုများကို လှမ်းယူရန် ကြိုးစားမှု လုံးဝမရှိခြင်း',
      'မိဘ/ပြုစုသူအပေါ် ချစ်ခင်နှစ်သက်မှု မပြသခြင်း',
      'ပတ်ဝန်းကျင်မှ အသံများကို တုံ့ပြန်မှု မရှိခြင်း',
      'အကူအညီမပါဘဲ လုံးဝ လူးလိမ့်၍ မရခြင်း',
      'ရယ်မောသံ သို့မဟုတ် အသံထွက် မြည်တွန်သံများ မရှိခြင်း'
    ],
    parentTipsMm: [
      'ကလေးထိုင်နိုင်ရန် ဘေးတွင် ခေါင်းအုံးခံပေးပြီး ထိုင်ခိုင်းလေ့ကျင့်ပေးပါ',
      'မျက်နှာဖုံးကွယ်ပြီး "ဗျူး... ဝှက်" (Peek-a-boo) ကစားပေးပါ',
      'အာဟာရပြည့်ဝသော ဖြည့်စွက်စာများကို စတင်ကျွေးမွေးပါ'
    ]
  },
  {
    ageId: '9_months',
    ageTitleMm: 'အသက် ၉ လအရွယ် (9 Months)',
    ageSubtitleMm: 'လေးဘက်ထောက်တွားသွားခြင်း၊ မတ်တပ်ရပ်ရန် ဆွဲထူခြင်းနှင့် လက်ညှိုးညွှန်ခြင်း',
    badge: '၉ လ',
    milestones: [
      { id: 'm9_1', category: 'social', textMm: 'သူစိမ်းများကို ကြောက်ရွံ့တတ်ပြီး မိဘနှင့် ခွဲခွာရမည်ကို စိုးရိမ်တတ်သည် (Separation Anxiety)' },
      { id: 'm9_2', category: 'social', textMm: 'အကြိုက်ဆုံး ကစားစရာအရုပ် သီးသန့် ရှိလာသည်' },
      { id: 'm9_3', category: 'language', textMm: '"မာမာ"၊ "ပါပါ" စသော အသံများကို အဓိပ္ပာယ်စတင် နားလည်လာသည်' },
      { id: 'm9_4', category: 'language', textMm: '"ဟင့်အင်း / မလုပ်နဲ့" ဟု ပြောလျှင် ခေတ္တ ရပ်တန့်နားထောင်သည်' },
      { id: 'm9_5', category: 'cognitive', textMm: 'ဖွက်ထားသော ပစ္စည်းများကို ရှာဖွေတတ်သည် (Object Permanence)' },
      { id: 'm9_6', category: 'cognitive', textMm: 'လက်မနှင့် လက်ညှိုးဖြင့် ပစ္စည်းငယ်များကို ကောက်ယူနိုင်သည် (Pincer Grasp)' },
      { id: 'm9_7', category: 'movement', textMm: 'လေးဘက်ထောက်၍ လျင်မြန်စွာ တွားသွားတတ်သည်' },
      { id: 'm9_8', category: 'movement', textMm: 'ကုလားထိုင်၊ စားပွဲများကို ကိုင်ဆွဲ၍ မတ်တပ်ရပ်ရန် ကြိုးစားသည် (Pulls to stand)' }
    ],
    redFlagsMm: [
      'အမှီမပါဘဲ လုံးဝ မထိုင်နိုင်ခြင်း',
      'ခြေထောက်ပေါ်သို့ ကိုယ်အလေးချိန် မခံနိုင်ခြင်း',
      'နာမည်ခေါ်သော်လည်း လုံးဝလှည့်မကြည့်ခြင်း',
      '"မာမာ/ပါပါ" စသော ဗျည်းသံများ မထွက်ခြင်း',
      'လက်တစ်ဖက်မှ အခြားတစ်ဖက်သို့ ပစ္စည်းမပြောင်းကိုင်နိုင်ခြင်း'
    ],
    parentTipsMm: [
      'အိမ်တွင်း အန္တရာယ်ရှိသော ပစ္စည်းများ၊ လျှပ်စစ်ပလပ်ပေါက်များကို လုံခြုံအောင် ပိတ်ဆို့ပါ (Baby-proofing)',
      'ပစ္စည်းများကို ပုဝါအောက် ဖွက်ပြပြီး ရှာဖွေခိုင်းပါ',
      'လက်ချောင်းကလေးများဖြင့် ကောက်ယူစားနိုင်သော အစာနူးနူးများ ကျွေးပါ'
    ]
  },
  {
    ageId: '12_months',
    ageTitleMm: 'အသက် ၁၂ လ / ၁ နှစ်အရွယ် (1 Year)',
    ageSubtitleMm: 'ပထမဆုံး ခြေလှမ်းများ၊ အဓိပ္ပာယ်ရှိသော စကားလုံးနှင့် လက်ပြနှုတ်ဆက်ခြင်း',
    badge: '၁ နှစ်',
    milestones: [
      { id: 'm12_1', category: 'social', textMm: 'လူကြီးလုပ်သမျှ အမူအရာများကို အတုခိုးလုပ်တတ်သည်' },
      { id: 'm12_2', category: 'social', textMm: 'လက်ပြနှုတ်ဆက်ခြင်း (Bye-bye)၊ လက်ခုပ်တီးခြင်း (Clapping) ပြုလုပ်သည်' },
      { id: 'm12_3', category: 'language', textMm: 'အဓိပ္ပာယ်ရှိသော စကားလုံး ၁ လုံး သို့မဟုတ် ၂ လုံး စတင်ပြောတတ်သည် (ဥပမာ- မေမေ၊ ဖေဖေ)' },
      { id: 'm12_4', category: 'language', textMm: 'ရိုးရှင်းသော အမိန့်များကို နားလည်သည် (ဥပမာ- "ဒီကိုလာ", "ပေးပါ")' },
      { id: 'm12_5', category: 'cognitive', textMm: 'ခွက်ထဲသို့ ပစ္စည်းထည့်ခြင်း၊ ပစ္စည်းတစ်ခုနှင့်တစ်ခု ရိုက်ခတ်မြည်စေခြင်း' },
      { id: 'm12_6', category: 'cognitive', textMm: 'လိုချင်သောအရာကို လက်ညှိုးဖြင့် ထိုးပြတတ်သည် (Pointing)' },
      { id: 'm12_7', category: 'movement', textMm: 'ပစ္စည်းများကို ကိုင်တွယ်တွန်းလျက် လမ်းစတင်လျှောက်နိုင်သည် သို့မဟုတ် တစ်ယောက်တည်း လမ်းလျှောက်သည်' },
      { id: 'm12_8', category: 'movement', textMm: 'အကူအညီမပါဘဲ မတ်တပ်ရပ်နိုင်သည်' }
    ],
    redFlagsMm: [
      'လေးဘက်ထောက် မတွားသွားနိုင်ခြင်း',
      'အမှီကိုင်၍ မတ်တပ်မရပ်နိုင်ခြင်း',
      'ဖွက်ထားသော ပစ္စည်းကို လုံးဝမရှာဖွေခြင်း',
      'စကားလုံးတစ်လုံးမျှ မပြောတတ်သေးခြင်း',
      'လက်ပြနှုတ်ဆက်ခြင်း သို့မဟုတ် လက်ညှိုးထိုးပြခြင်း လုံးဝမလုပ်တတ်ခြင်း'
    ],
    parentTipsMm: [
      'ကလေးနှင့်အတူ ရုပ်ပုံစာအုပ်များ ကြည့်ရှုပြီး အမည်များကို ပြောပြပါ',
      'လမ်းလျှောက်ရန် လက်ကို တွဲကူပေးပါ သို့မဟုတ် လမ်းလျှောက်တွန်းလှည်း အသုံးပြုစေပါ',
      'ကလေး၏ လက်ညှိုးထိုးပြမှုများကို အမည်တပ်၍ ရှင်းပြပေးပါ'
    ]
  },
  {
    ageId: '18_months',
    ageTitleMm: 'အသက် ၁၈ လ / ၁ နှစ်ခွဲ (18 Months)',
    ageSubtitleMm: 'တစ်ယောက်တည်း လမ်းလျှောက်ခြင်း၊ ဇွန်းကိုင်စားခြင်းနှင့် စကားလုံး ၁၀ လုံးခန့် ပြောနိုင်ခြင်း',
    badge: '၁.၅ နှစ်',
    milestones: [
      { id: 'm18_1', category: 'social', textMm: 'အခြားကလေးများနှင့် အတူတကွ နီးကပ်စွာ ဆော့ကစားတတ်သည် (Parallel Play)' },
      { id: 'm18_2', category: 'social', textMm: 'မိမိစိတ်ကြိုက်မဖြစ်ပါက ဂျီကျဒေါသထွက်တတ်သည် (Temper Tantrums)' },
      { id: 'm18_3', category: 'language', textMm: 'စကားလုံး အနည်းဆုံး ၆ လုံး မှ ၁၀ လုံးခန့် တိကျစွာ ပြောဆိုနိုင်သည်' },
      { id: 'm18_4', category: 'language', textMm: 'ခန္ဓာကိုယ်အစိတ်အပိုင်းများကို ညွှန်ပြတတ်သည် (ဥပမာ- နှာခေါင်း၊ မျက်လုံး)' },
      { id: 'm18_5', category: 'cognitive', textMm: 'ခွက်ဖြင့် ရေသောက်တတ်ပြီး ဇွန်းဖြင့် အစာစတင် ခတ်စားတတ်သည်' },
      { id: 'm18_6', category: 'cognitive', textMm: 'တုံးကလေးများကို ၂ ခု သို့မဟုတ် ၃ ခု ဆင့်တင်နိုင်သည်' },
      { id: 'm18_7', category: 'movement', textMm: 'တစ်ယောက်တည်း ကောင်းမွန်စွာ လမ်းလျှောက်နိုင်ပြီး စတင် အပြေးလေ့ကျင့်သည်' },
      { id: 'm18_8', category: 'movement', textMm: 'လက်ဆွဲကိုင်၍ လှေကားထစ်များကို တက်နိုင်သည်' }
    ],
    redFlagsMm: [
      'တစ်ယောက်တည်း လမ်းမလျှောက်နိုင်သေးခြင်း',
      'စကားလုံး အနည်းဆုံး ၆ လုံးမျှ မပြောနိုင်ခြင်း',
      'စိတ်ဝင်စားသောအရာများကို လက်ညှိုးထိုးမပြခြင်း',
      'အခြားသူများကို လုံးဝ အတုမခိုးခြင်း',
      'ယခင်ရရှိပြီးသော ကျွမ်းကျင်မှုများ ပြန်လည်ပျောက်ဆုံးသွားခြင်း (Skill Loss)'
    ],
    parentTipsMm: [
      'ပုံတုံးများ ဆင့်ကစားခြင်း၊ ဘောလုံးပစ်ကစားခြင်း ပြုလုပ်ပေးပါ',
      'ကလေး စကားပြောရန် အခွင့်အရေးပေးပြီး အဖြေကို စိတ်ရှည်စွာ နားထောင်ပါ',
      'နေ့စဉ် လုပ်ရိုးလုပ်စဉ်များ (အိပ်ချိန်၊ စားချိန်) ကို ပုံမှန်အတိုင်း သတ်မှတ်ပေးပါ'
    ]
  },
  {
    ageId: '2_years',
    ageTitleMm: 'အသက် ၂ နှစ်အရွယ် (2 Years)',
    ageSubtitleMm: 'စကား ၂ လုံးတွဲပြောခြင်း၊ ခုန်ပေါက်ပြေးလွှားခြင်းနှင့် ပုံစံတူခွဲခြားနိုင်ခြင်း',
    badge: '၂ နှစ်',
    milestones: [
      { id: 'm24_1', category: 'social', textMm: 'အခြားကလေးများကို အတုခိုးပြီး ပူးပေါင်းကစားရန် စိတ်ဝင်စားလာသည်' },
      { id: 'm24_2', category: 'social', textMm: 'မိမိစိတ်တိုင်းကျ အမှီအခိုကင်းစွာ လုပ်ဆောင်လိုစိတ် ပြသသည်' },
      { id: 'm24_3', category: 'language', textMm: 'စကားလုံး ၂ လုံး သို့မဟုတ် ၃ လုံးတွဲ၍ ပြောတတ်သည် (ဥပမာ- "ရေသောက်မယ်", "ကားကြီးသွားတယ်")' },
      { id: 'm24_4', category: 'language', textMm: 'အသုံးများသော ပစ္စည်းများနှင့် ရုပ်ပုံများ၏ အမည် ၅၀% ကျော်ကို သိရှိသည်' },
      { id: 'm24_5', category: 'cognitive', textMm: 'အရောင်နှင့် ပုံသဏ္ဌာန်တူသောအရာများကို စတင်ခွဲခြားတတ်သည်' },
      { id: 'm24_6', category: 'cognitive', textMm: 'အဆင့် ၂ ဆင့်ပါသော ညွှန်ကြားချက်ကို လိုက်နာနိုင်သည် (ဥပမာ- "ဖိနပ်ချွတ်ပြီး အခန်းထဲဝင်ပါ")' },
      { id: 'm24_7', category: 'movement', textMm: 'ခြေ ၂ ဖက်စလုံး ကြွ၍ ခုန်နိုင်သည် (Jumps with both feet)' },
      { id: 'm24_8', category: 'movement', textMm: 'ဘောလုံးကို ရှေ့သို့ ကန်နိုင်ပြီး လှေကားထစ်များကို တစ်ထစ်ချင်း တက်/ဆင်းနိုင်သည်' }
    ],
    redFlagsMm: [
      'စကားလုံး ၂ လုံးတွဲ စကားစုများ လုံးဝမပြောနိုင်ခြင်း',
      'ဘရပ်ရှ်၊ ခွက်၊ ဇွန်း စသော နေ့စဉ်သုံးပစ္စည်းများ၏ အသုံးပြုပုံကို မသိရှိခြင်း',
      'အပြုအမူများနှင့် စကားလုံးများကို အတုမခိုးနိုင်ခြင်း',
      'ခိုင်မာစွာ လမ်းမလျှောက်နိုင်ခြင်း',
      'ရိုးရှင်းသော ညွှန်ကြားချက်များကို နားမလည်ခြင်း'
    ],
    parentTipsMm: [
      'ရိုးရှင်းသော စာအုပ်များကို အတူဖတ်ပြီး မေးခွန်းများ မေးပါ',
      'ဆေးရောင်ခြယ်ခြင်းနှင့် ရွှံ့စေး/မုန့်နှစ်နယ် ကစားခြင်းများ ပြုလုပ်ပေးပါ',
      'အိမ်သာတက် လေ့ကျင့်ခြင်း (Potty Training) ကို စိတ်ရှည်စွာ စတင်မိတ်ဆက်ပေးပါ'
    ]
  },
  {
    ageId: '3_to_5_years',
    ageTitleMm: 'အသက် ၃ နှစ် မှ ၅ နှစ် (Preschool Age)',
    ageSubtitleMm: 'ဝါကျရှည်ပြောဆိုခြင်း၊ စိတ်ကူးယဉ်ကစားခြင်း၊ စက်ဘီးစီးခြင်းနှင့် စာရေးခြစ်ခြင်း',
    badge: '၃-၅ နှစ်',
    milestones: [
      { id: 'm36_1', category: 'social', textMm: 'သူငယ်ချင်းများနှင့် မျှဝေကစားတတ်ပြီး စည်းကမ်းများကို လိုက်နာတတ်လာသည်' },
      { id: 'm36_2', category: 'social', textMm: 'သူတစ်ပါး၏ စိတ်ခံစားချက် (ဝမ်းနည်းခြင်း၊ ပျော်ရွှင်ခြင်း) ကို စာနာနားလည်တတ်သည်' },
      { id: 'm36_3', category: 'language', textMm: 'ဝါကျပြည့်စုံစွာဖြင့် ဇာတ်လမ်းတိုများ ပြန်ပြောပြနိုင်သည် (မေးခွန်းများစွာ မေးတတ်သည်)' },
      { id: 'm36_4', category: 'language', textMm: 'သူစိမ်းများ နားလည်နိုင်သော အသံထွက်ဖြင့် စကားပြောနိုင်သည်' },
      { id: 'm36_5', category: 'cognitive', textMm: 'အရောင် ၄ မျိုးနှင့် ဂဏန်း (၁ မှ ၁၀ အထိ) စတင် ရေတွက်မှတ်မိသည်' },
      { id: 'm36_6', category: 'cognitive', textMm: 'ကတ်ကြေးဖြင့် စက္ကူညှပ်ခြင်း၊ စက်ဝိုင်း/လေးထောင့်ပုံဆွဲခြင်းနှင့် လူပုံစံ ရေးဆွဲနိုင်သည်' },
      { id: 'm36_7', category: 'movement', textMm: 'ခြေတစ်ဖက်တည်းဖြင့် ခုန်နိုင်သည်၊ ခြေသုံးဘီးစက်ဘီး စီးနိုင်သည်' },
      { id: 'm36_8', category: 'movement', textMm: 'အဝတ်အစား ချွတ်/ဝတ်ခြင်း၊ ကြယ်သီးတပ်ခြင်းများကို မိမိကိုယ်တိုင် ပြုလုပ်နိုင်သည်' }
    ],
    redFlagsMm: [
      'ဝါကျဖြင့် စကားမပြောနိုင်ခြင်း သို့မဟုတ် စကားထစ်ခြင်း/အသံမပီခြင်း',
      'အခြားကလေးများနှင့် လုံးဝ မရောနှောဘဲ သီးသန့်နေခြင်း',
      'မျက်လုံးချင်းဆုံကြည့်ရန် ငြင်းဆန်ခြင်း (Eye contact အားနည်းခြင်း)',
      'ဘောလုံးမကန်နိုင်ခြင်း သို့မဟုတ် နေရာတွင် မခုန်နိုင်ခြင်း',
      'ကိုယ်တိုင် အဝတ်မလဲနိုင်ခြင်း သို့မဟုတ် အိမ်သာမတက်တတ်ခြင်း'
    ],
    parentTipsMm: [
      'စိတ်ကူးယဉ် ဇာတ်ကောင်စရိုက် သရုပ်ဆောင် ကစားနည်းများ ကစားပေးပါ',
      'ကဗျာ၊ သီချင်းနှင့် ပုံပြင်များ ပြောပြပြီး ကလေးကို ပြန်လည်မေးမြန်းပါ',
      'အပြင်ထွက်၍ ကစားကွင်းတွင် ပြေးလွှားဆော့ကစားစေပါ'
    ]
  }
];

export const ChildMilestonesModule: React.FC = () => {
  const [selectedAgeId, setSelectedAgeId] = useState<string>('6_months');
  const [checkedMilestones, setCheckedMilestones] = useState<{ [key: string]: boolean }>({
    'm6_1': true,
    'm6_3': true,
    'm6_5': true,
    'm6_7': true
  });

  const activeAgeData = MILESTONES_DATA.find(a => a.ageId === selectedAgeId) || MILESTONES_DATA[0];

  const toggleMilestone = (id: string) => {
    setCheckedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalAgeMilestones = activeAgeData.milestones.length;
  const achievedMilestones = activeAgeData.milestones.filter(m => !!checkedMilestones[m.id]).length;
  const progressPercent = Math.round((achievedMilestones / totalAgeMilestones) * 100);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'movement': return { label: '🏃‍♂️ ကာယ/လှုပ်ရှားမှု', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'language': return { label: '🗣️ ဘာသာစကား', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'cognitive': return { label: '🧠 တွေးခေါ်သင်ယူမှု', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'social': return { label: '🤝 လူမှုဆက်ဆံရေး', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default: return { label: 'ဖွံ့ဖြိုးမှု', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-xl">🏆</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 tracking-wide uppercase">
                CDC & WHO Pediatric Milestones
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              ကလေးဖွံ့ဖြိုးမှု မှတ်တိုင်များ စစ်ဆေးမှတ်တမ်း (Child Milestones)
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
              အသက် ၂ လမှ ၅ နှစ်အထိ ကာယလှုပ်ရှားမှု၊ ဘာသာစကား၊ တွေးခေါ်ကြံဆမှုနှင့် လူမှုဆက်ဆံရေး ဖွံ့ဖြိုးမှုအဆင့်များကို မိဘများ ကိုယ်တိုင် စစ်ဆေးမှတ်တမ်းတင်နိုင်သော စနစ်။
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs border border-white/20 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>ဖွံ့ဖြိုးမှု အဆင့်စစ်ဆေးလွှာ</span>
          </div>
        </div>
      </div>

      {/* Age Selector Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {MILESTONES_DATA.map((age) => {
            const isSelected = selectedAgeId === age.ageId;
            return (
              <button
                key={age.ageId}
                onClick={() => setSelectedAgeId(age.ageId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{age.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Milestone Card & Interactive Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
        {/* Card Header & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {activeAgeData.badge}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeAgeData.ageTitleMm}
              </h2>
            </div>
            <p className="text-xs text-slate-600">{activeAgeData.ageSubtitleMm}</p>
          </div>

          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 min-w-[200px] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-950">ရရှိပြီးသော မှတ်တိုင်များ:</span>
              <span className="font-extrabold text-amber-800">{achievedMilestones} / {totalAgeMilestones} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-amber-200">
              <div 
                className="bg-amber-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Milestones Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              📝 ကလေးငယ် တတ်မြောက်ပြီးသော အချက်များကို အမှန်ခြစ်ပါ ({totalAgeMilestones} ချက်)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeAgeData.milestones.map((m) => {
              const isChecked = !!checkedMilestones[m.id];
              const catBadge = getCategoryBadge(m.category);

              return (
                <label
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-amber-50/60 border-amber-300 text-slate-900 font-medium shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${catBadge.color} inline-block`}>
                      {catBadge.label}
                    </span>
                    <p className={`text-xs leading-relaxed ${isChecked ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                      {m.textMm}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Red Flags & Warning Signs Box */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>⚠️ ဤအသက်အရွယ်တွင် သတိပြုရမည့် ဖွံ့ဖြိုးမှု နှောင့်နှေးခြင်း သတိပေးလက္ခဏာများ (Red Flags)</span>
          </div>
          <p className="text-[11px] text-red-800">
            ကလေးတွင် အောက်ပါအချက်များအနက် တစ်ခုခု ဖြစ်ပေါ်နေပါက ကလေးအထူးကုဆရာဝန်နှင့် ပြသ၍ ဖွံ့ဖြိုးမှု အကဲဖြတ်စစ်ဆေးမှု ခံယူသင့်ပါသည် -
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-red-950 font-medium">
            {activeAgeData.redFlagsMm.map((rf, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-red-100">
                <span className="text-red-600 font-bold">✕</span>
                <span>{rf}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Parent Tips & Activities */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>💡 ဤအရွယ် ကလေးငယ်၏ ဖွံ့ဖြိုးမှုကို မြှင့်တင်ပေးမည့် မိဘများ လေ့ကျင့်ပေးနိုင်သော နည်းလမ်းများ</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {activeAgeData.parentTipsMm.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
