import React, { useState } from 'react';
import {
  FlaskConical,
  TestTube,
  Activity,
  Heart,
  Droplets,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Search,
  BookOpen,
  Info,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  Stethoscope,
  Filter
} from 'lucide-react';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

interface LabTestItem {
  id: string;
  nameMm: string;
  nameEn: string;
  category: 'blood' | 'urine' | 'stool' | 'imaging' | 'prep';
  shortDesc: string;
  normalRange: string;
  indications: string[];
  preparation: string;
  highMeaning: string;
  lowMeaning: string;
  iconBg: string;
}

const LAB_TEST_DATABASE: LabTestItem[] = [
  // Blood Tests
  {
    id: 'cbc',
    nameMm: 'သွေးဆဲလ်အစုံ စစ်ဆေးခြင်း (CBC - Complete Blood Count)',
    nameEn: 'Complete Blood Count (CBC)',
    category: 'blood',
    shortDesc: 'သွေးနီဥ (RBC)၊ သွေးဖြူဥ (WBC)၊ ဟေမိုဂလိုဘင် (Hb) နှင့် သွေးဥမွှား (Platelets) ပမာဏများကို တိုင်းတာသော အခြေခံအကျဆုံး သွေးစစ်ဆေးမှု ဖြစ်ပါသည်။',
    normalRange: 'Hb: အမျိုးသား (13-17 g/dL)၊ အမျိုးသမီး (12-15 g/dL) | WBC: 4,000 - 11,000 /uL | Platelet: 150,000 - 450,000 /uL',
    indications: ['သွေးအားနည်းရောဂါ ရှိမရှိ စစ်ဆေးခြင်း', 'ခန္ဓာကိုယ်အတွင်း ပိုးဝင်ခြင်း သို့မဟုတ် ရောင်ရမ်းခြင်း သိရှိရန်', 'သွေးထွက်လွယ်ခြင်း သို့မဟုတ် သွေးလွန်တုပ်ကွေး ရောဂါ စစ်ဆေးရန်'],
    preparation: 'ပုံမှန်အားဖြင့် အစာငတ်ထားရန် မလိုပါ။ လိုအပ်ပါက သာမန်အတိုင်း သွေးဖောက်နိုင်ပါသည်။',
    highMeaning: 'WBC မြင့်မားခြင်း = ဘက်တီးရီးယား သို့မဟုတ် ဗိုင်းရပ်စ် ပိုးဝင်ခြင်း။ Platelet မြင့်ခြင်း = ရောင်ရမ်းမှု အခြေအနေ။',
    lowMeaning: 'Hb/RBC နည်းခြင်း = သွေးအားနည်းရောဂါ (Anemia)။ Platelet နည်းခြင်း = သွေးလွန်တုပ်ကွေး သို့မဟုတ် သွေးခဲစနစ် ချို့ယွင်းခြင်း။',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200'
  },
  {
    id: 'fbs_hba1c',
    nameMm: 'သွေးတွင်းသကြားဓာတ်နှင့် ၃ လစာ သွေးချိုပမာဏ (FBS & HbA1c)',
    nameEn: 'Fasting Blood Sugar & HbA1c',
    category: 'blood',
    shortDesc: 'ဆီးချို/သွေးချို ရောဂါ ရှိမရှိ စစ်ဆေးခြင်းနှင့် လွန်ခဲ့သော ၃ လအတွင်း သွေးချို ထိန်းသိမ်းနိုင်မှု အခြေအနေကို ကြည့်ရှုခြင်း ဖြစ်ပါသည်။',
    normalRange: 'FBS: 70 - 99 mg/dL (ပုံမှန်)၊ 100 - 125 mg/dL (ဆီးချိုမဖြစ်မီအဆင့်)၊ >=126 mg/dL (ဆီးချိုရောဂါ) | HbA1c: < 5.7% (ပုံမှန်)၊ 5.7 - 6.4% (ဆီးချိုမဖြစ်မီ)၊ >= 6.5% (ဆီးချို)',
    indications: ['ဆီးချိုရောဂါ စောစီးစွာ ရှာဖွေဖော်ထုတ်ခြင်း', 'ဆီးချိုဝေဒနာရှင်များ ဆေးသောက်ပြီး သွေးချိုထိန်းနိုင်မှု မှတ်တမ်းတင်ခြင်း', 'မကြာခဏ ရေဆာခြင်း၊ ဆီးခဏခဏသွားခြင်း လက္ခဏာများ ရှိပါက'],
    preparation: 'FBS အတွက် အနည်းဆုံး ၈ နာရီမှ ၁၂ နာရီအထိ ရေမှလွဲ၍ အစာငတ်ထားရန် လိုအပ်ပါသည်။ HbA1c အတွက် အစာငတ်ရန် မလိုပါ။',
    highMeaning: 'ဆီးချိုရောဂါ ရှိနေခြင်း သို့မဟုတ် သွေးချို ထိန်းသိမ်းမှု မကောင်းခြင်းကို ညွှန်ပြပါသည်။',
    lowMeaning: 'သွေးချိုလွန်စွာကျခြင်း (Hypoglycemia) ဖြစ်နိုင်ပြီး ခေါင်းမူးခြင်း၊ ချွေးစေးပြန်ခြင်း ဖြစ်စေနိုင်ပါသည်။',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  {
    id: 'lipid_profile',
    nameMm: 'သွေးတွင်း အဆီဓာတ် စစ်ဆေးခြင်း (Lipid Profile)',
    nameEn: 'Lipid Profile / Cholesterol Panel',
    category: 'blood',
    shortDesc: 'မကောင်းသော အဆီ (LDL)၊ ကောင်းသော အဆီ (HDL)၊ တြိုင်ဂလစ်စရိုက် (Triglyceride) နှင့် စုစုပေါင်း အဆီပမာဏများကို စစ်ဆေးခြင်း ဖြစ်ပါသည်။',
    normalRange: 'Total Cholesterol: < 200 mg/dL | LDL (မကောင်းသောအဆီ): < 100 mg/dL | HDL (ကောင်းသောအဆီ): > 40-50 mg/dL | Triglycerides: < 150 mg/dL',
    indications: ['နှလုံးနှင့် သွေးကြောကျဉ်းရောဂါ ဖြစ်နိုင်ခြေ စစ်ဆေးရန်', 'သွေးတိုးရောဂါ၊ ဆီးချိုရောဂါ သို့မဟုတ် ကိုယ်အလေးချိန် လွန်ကဲသူများ', 'အဆီကျဆေး သောက်သုံးနေသူများ ဆေးထိရောက်မှု စစ်ဆေးရန်'],
    preparation: 'စစ်ဆေးမည့် မနက်ပိုင်းမတိုင်မီ ၉ နာရီမှ ၁၂ နာရီအထိ အစာနှင့် အရက် လုံးဝ ရှောင်ကြဉ်ထားရပါမည်။',
    highMeaning: 'LDL သို့မဟုတ် Triglyceride မြင့်မားပါက သွေးကြောကျဉ်းခြင်း၊ နှလုံးသွေးကြောပိတ်ခြင်း နှင့် လေဖြတ်ခြင်း ဖြစ်နိုင်ခြေ မြင့်တက်စေပါသည်။',
    lowMeaning: 'HDL (ကောင်းသောအဆီ) နည်းပါက နှလုံးကျန်းမာရေးအတွက် ကာကွယ်မှု နည်းပါးကြောင်း ပြသပါသည်။',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200'
  },
  {
    id: 'lft',
    nameMm: 'အသည်းလုပ်ဆောင်ချက် စစ်ဆေးခြင်း (LFT - Liver Function Test)',
    nameEn: 'Liver Function Test (LFT)',
    category: 'blood',
    shortDesc: 'အသည်းမှ ထုတ်လုပ်ပေးသော အင်ဇိုင်းများ (SGOT/ALT, SGPT/AST)၊ အယ်ဘူမင် ပရိုတင်း နှင့် ဘီလီရူးဘင်း အဝါဓာတ်များကို စစ်ဆေးခြင်း ဖြစ်ပါသည်။',
    normalRange: 'SGPT/ALT: 7 - 56 U/L | SGOT/AST: 10 - 40 U/L | Total Bilirubin: 0.2 - 1.2 mg/dL | Albumin: 3.5 - 5.0 g/dL',
    indications: ['အသည်းရောင် အဝါဘီပိုး/စီပိုး စစ်ဆေးခြင်း', 'အသည်းအဆီဖုံးခြင်း သို့မဟုတ် အရက်ကြောင့် အသည်းထိခိုက်မှု ရှိမရှိ စစ်ဆေးရန်', 'မျက်လုံး သို့မဟုတ် အသားဝါခြင်း (Jaundice) ဖြစ်ပေါ်ပါက'],
    preparation: 'အသည်းဓာတ်ခွဲမစစ်မီ အရက်သောက်ခြင်းနှင့် အသည်းထိခိုက်စေနိုင်သော ဆေးဝါးများကို ခဏရပ်နားထားရန် လိုအပ်နိုင်ပါသည်။',
    highMeaning: 'ALT/AST မြင့်ခြင်း = အသည်းဆဲလ်များ ရောင်ရမ်း/ထိခိုက်နေခြင်း။ Bilirubin မြင့်ခြင်း = အသည်းရောင်ခြင်း သို့မဟုတ် သည်းခြေပြွန်ပိတ်ခြင်း။',
    lowMeaning: 'Albumin ပရိုတင်း နည်းပါက နာတာရှည် အသည်းခြောက်ခြင်း သို့မဟုတ် အာဟာရချို့တဲ့ခြင်းကို ပြသပါသည်။',
    iconBg: 'bg-teal-50 text-teal-600 border-teal-200'
  },
  {
    id: 'kft',
    nameMm: 'ကျောက်ကပ် လုပ်ဆောင်ချက် စစ်ဆေးခြင်း (KFT/RFT - Renal Function Test)',
    nameEn: 'Kidney Function Test (Creatinine & Urea)',
    category: 'blood',
    shortDesc: 'ကျောက်ကပ်မှ စွန့်ထုတ်ပေးသော ကရီယက်တီနင်း (Creatinine) နှင့် သွေးတွင်း ယူရီးယား (BUN) ပမာဏများအားဖြင့် ကျောက်ကပ် စွမ်းဆောင်ရည်ကို စစ်ဆေးခြင်း ဖြစ်ပါသည်။',
    normalRange: 'Serum Creatinine: 0.6 - 1.2 mg/dL | Blood Urea: 10 - 50 mg/dL | eGFR: > 90 mL/min/1.73m²',
    indications: ['သွေးတိုးရောဂါ၊ ဆီးချိုရောဂါ နာတာရှည် ရှိသူများ ကျောက်ကပ် စစ်ဆေးရန်', 'ခြေထောက်နှင့် မျက်နှာ ဖောရောင်ခြင်း၊ ဆီးနည်းခြင်း လက္ခဏာများ ရှိပါက', 'ကျောက်ကပ် ထိခိုက်နိုင်သော ဆေးများ မသောက်မီ စစ်ဆေးရန်'],
    preparation: 'စစ်ဆေးမည့်နေ့တွင် အသားအလွန်အကျွံ စားသုံးခြင်းမှ ရှောင်ကြဉ်ပါ။ ရေပုံမှန် သောက်သုံးထားပါ။',
    highMeaning: 'Creatinine သို့မဟုတ် Urea မြင့်မားပါက ကျောက်ကပ် စွန့်ထုတ်နိုင်စွမ်း လျော့ကျနေခြင်း သို့မဟုတ် ကျောက်ကပ် ပျက်စီးခြင်း ဖြစ်နိုင်ပါသည်။',
    lowMeaning: 'Creatinine လွန်စွာနည်းခြင်းသည် ကြွက်သားနည်းပါးခြင်း သို့မဟုတ် အာဟာရ နည်းခြင်းကြောင့် ဖြစ်တတ်ပါသည်။',
    iconBg: 'bg-sky-50 text-sky-600 border-sky-200'
  },
  {
    id: 'thyroid',
    nameMm: 'သိုင်းရွိုက် ဟော်မုန်း စစ်ဆေးခြင်း (Thyroid Panel - TSH, FT3, FT4)',
    nameEn: 'Thyroid Function Test (TSH, Free T3, Free T4)',
    category: 'blood',
    shortDesc: 'လည်ပင်းသိုင်းရွိုက်ဂလင်းမှ ဟော်မုန်း ထုတ်လုပ်မှု ပုံမှန်ရှိမရှိ စစ်ဆေးခြင်း ဖြစ်ပါသည်။',
    normalRange: 'TSH: 0.4 - 4.0 mIU/L | FT4: 0.8 - 1.8 ng/dL | FT3: 2.3 - 4.2 pg/mL',
    indications: ['အကြောင်းအရင်းမရှိဘဲ ဝလာခြင်း သို့မဟုတ် ပိန်သွားခြင်း', 'ရင်တုန်ခြင်း၊ အေးစိမ့်ခြင်း သို့မဟုတ် ပူအာင်းခြင်း လက္ခဏာများ', 'လည်ပင်းကြီးရောဂါ ရှိသူများ'],
    preparation: 'မနက်ပိုင်း သွေးဖောက်ရန် သင့်တော်ပါသည်။ သိုင်းရွိုက်ဆေး သောက်နေသူဖြစ်ပါက ဆေးမသောက်မီ သွေးဖောက်ရပါမည်။',
    highMeaning: 'TSH မြင့်ပြီး FT4 နည်းပါက သိုင်းရွိုက်ဟော်မုန်း နည်းရောဂါ (Hypothyroidism)။ TSH နည်းပြီး FT4 မြင့်ပါက သိုင်းရွိုက်ဟော်မုန်း လွန်ကဲရောဂါ (Hyperthyroidism)။',
    lowMeaning: 'ဟော်မုန်း မညီမျှမှုကို ပြသပြီး အထူးကုဆရာဝန်နှင့် သွားရောက် ပြသသင့်ပါသည်။',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200'
  },

  // Urine Tests
  {
    id: 'urine_re',
    nameMm: 'ဆီးအနည်နှင့် ဓာတုဓာတ် ပုံမှန်စစ်ဆေးခြင်း (Urine RE & Microscopy)',
    nameEn: 'Urine Routine & Microscopy (Urine RE)',
    category: 'urine',
    shortDesc: 'ဆီးတွင်း ပရိုတင်း (Protein)၊ သကြား (Glucose)၊ သွေးနီဥ၊ သွေးဖြူဥ (Pus cells) နှင့် ဗက်တီးရီးယားများ ပါဝင်မှုကို စစ်ဆေးခြင်း ဖြစ်ပါသည်။',
    normalRange: 'Protein: Negative (မပါရ) | Glucose: Negative (မပါရ) | Pus Cells: 0 - 5 /HPF | RBC: 0 - 2 /HPF',
    indications: ['ဆီးပူ၊ ဆီးအောင့်၊ ဆီးခဏခဏသွားခြင်း သို့မဟုတ် ဆီးထဲသွေးပါခြင်း', 'ကျောက်ကပ်ရောဂါ၊ ဆီးလမ်းကြောင်း ပိုးဝင်ခြင်း စစ်ဆေးရန်', 'ကိုယ်ဝန်ဆောင်များ ပုံမှန် စစ်ဆေးရန်'],
    preparation: 'မနက်အိပ်ရာထ ပထမဆုံး သွားသော ဆီး၏ အလယ်ရေ (Mid-stream urine) ကို သန့်ရှင်းသော ဘူးတွင် ခံယူရပါမည်။',
    highMeaning: 'Pus cells မြင့်ခြင်း = ဆီးလမ်းကြောင်း ပိုးဝင်ခြင်း (UTI)။ Protein ပါခြင်း = ကျောက်ကပ် ရောင်ရမ်းခြင်း သို့မဟုတ် ထိခိုက်ခြင်း။',
    lowMeaning: 'Negative / ပုံမှန် ရလဒ်သည် ဆီးလမ်းကြောင်း သန့်ရှင်းကြောင်း ပြသပါသည်။',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  },
  {
    id: 'urine_microalbumin',
    nameMm: 'ဆီးတွင်း မိုက်ခရိုအယ်ဘူမင် စစ်ဆေးခြင်း (Urine Microalbumin)',
    nameEn: 'Urine Microalbumin Test',
    category: 'urine',
    shortDesc: 'ဆီးတွင်းသို့ ပရိုတင်းဓာတ် သေးငယ်စွာ စိမ့်ထွက်နေမှု ရှိမရှိ စောစီးစွာ ရှာဖွေစစ်ဆေးသော အဆင့်မြင့် ကျောက်ကပ်စစ်ဆေးမှု ဖြစ်ပါသည်။',
    normalRange: 'Urine Microalbumin: < 30 mg/g creatinine (ပုံမှန်) | 30 - 300 mg/g (စောစီးစွာ ကျောက်ကပ်ထိခိုက်မှု)',
    indications: ['ဆီးချိုရောဂါရှင်များ နှစ်စဉ် ကျောက်ကပ် ထိခိုက်မှု စောစီးစွာ စစ်ဆေးရန်', 'သွေးတိုးရောဂါ နာတာရှည် ရှိသူများ'],
    preparation: 'မနက် အိပ်ရာထ ပထမဆုံး ဆီးကို သန့်ရှင်းစွာ ခံယူပါ။ လေ့ကျင့်ခန်း ပြင်းထန်စွာ ပြုလုပ်ထားချိန်တွင် မစစ်သင့်ပါ။',
    highMeaning: 'Microalbumin ပါဝင်နေပါက ဆီးချို/သွေးတိုးကြောင့် ကျောက်ကပ် အစောပိုင်း ထိခိုက်နေပြီဖြစ်ပြီး စနစ်တကျ ဆေးကုသမှု ခယူရပါမည်။',
    lowMeaning: '< 30 mg/g သည် ကျောက်ကပ် ကျန်းမာရေး ကောင်းမွန်ကြောင်း ပြသပါသည်။',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200'
  },

  // Stool Tests
  {
    id: 'stool_re',
    nameMm: 'ဝမ်းပုံမှန်နှင့် သွေးစိမ့်ပါမှု စစ်ဆေးခြင်း (Stool RE & Occult Blood)',
    nameEn: 'Stool Routine & Occult Blood (FOBT)',
    category: 'stool',
    shortDesc: 'ဝမ်းတွင်း သံကောင်၊ တုပ်ကောင်၊ အမီးဘား ဝမ်းကိုက်ပိုး နှင့် မျက်စိဖြင့် မမြင်နိုင်သော သွေးစိမ့်ပါမှု (Occult Blood) စစ်ဆေးခြင်း ဖြစ်ပါသည်။',
    normalRange: 'Occult Blood: Negative | Parasites / Amoeba: Not Found',
    indications: ['ဝမ်းခဏခဏပျက်ခြင်း၊ ဝမ်းကိုက်ခြင်း သို့မဟုတ် အကြောင်းမဲ့ သွေးအားနည်းခြင်း', 'အစာအိမ်နှင့် အူလမ်းကြောင်း သွေးယိုစိမ့်မှု ရှာဖွေရန်', 'အူမကြီး ကင်ဆာ စောစီးစွာ စစ်ဆေးရန် (FOBT Screening)'],
    preparation: 'Occult blood စစ်ခါနီး ၃ ရက်အတွင်း အနီရောင်အသား၊ သံဓာတ်အားဆေးနှင့် အက်စပရင် ဆေးများ သောက်သုံးခြင်းမှ ရှောင်ကြဉ်ပါ၊',
    highMeaning: 'Positive Occult Blood = အစာအိမ် သို့မဟုတ် အူလမ်းကြောင်းတွင် သွေးယိုစိမ့်မှု ရှိနေခြင်း (အနာ သို့မဟုတ် အကျိတ်ဖြစ်နိုင်)။',
    lowMeaning: 'Negative ဖြစ်ပါက အူလမ်းကြောင်းအတွင်း သွေးယိုစိမ့်မှု မရှိပါ။',
    iconBg: 'bg-stone-50 text-stone-600 border-stone-200'
  },

  // Imaging & Diagnostics
  {
    id: 'cxr',
    nameMm: 'ရင်ဘတ် ဓာတ်မှန်ရိုက်ခြင်း (Chest X-Ray / CXR)',
    nameEn: 'Chest X-Ray (CXR)',
    category: 'imaging',
    shortDesc: 'အဆုတ်၊ နှလုံးနှင့် ရင်ဘတ် အရိုးတည်ဆောက်ပုံများကို ပုံရိပ်ဖော် စစ်ဆေးသည့် ဓာတ်မှန် စစ်ဆေးမှု ဖြစ်ပါသည်။',
    normalRange: 'Lungs clear, No infiltrates, Heart size normal (Cardiothoracic ratio < 50%)',
    indications: ['ချောင်းဆိုးခြင်း ၂ ပတ်ထက်ကျော်ခြင်း၊ ရင်ဘတ်အောင့်ခြင်း၊ အသက်ရှူရခက်ခြင်း', 'တီဘီရောဂါ သို့မဟုတ် အဆုတ်ရောင် ရောဂါ စစ်ဆေးရန်', 'ခွဲစိတ်ကုသမှု မပြုမီ ပြင်ဆင်ရန်'],
    preparation: 'သတ္တုပါသော အကျီ၊ ဆွဲကြိုးများကို ချွတ်ထားရပါမည်။ ကိုယ်ဝန်ဆောင် အမျိုးသမီးများ ကြိုတင် အသိပေးရပါမည်။',
    highMeaning: 'အဆုတ်တွင် အစက်အပြောက် သို့မဟုတ် အရည်ဝင်ခြင်း = တီဘီ၊ အဆုတ်ရောင် သို့မဟုတ် ပိုးဝင်ခြင်း။ နှလုံးကြီးနေခြင်း = နှလုံးရောဂါ။',
    lowMeaning: 'အဆုတ်နှင့် နှလုံး ပုံမှန် သန့်ရှင်းနေကြောင်း ပြသပါသည်။',
    iconBg: 'bg-zinc-50 text-zinc-600 border-zinc-200'
  },
  {
    id: 'ultrasound',
    nameMm: 'ဗိုက်နှင့် ဝမ်းဗိုက် အာထရာဆောင်း စစ်ဆေးခြင်း (Abdominal Ultrasound)',
    nameEn: 'Abdominal & Pelvic Ultrasound (USG)',
    category: 'imaging',
    shortDesc: 'အသံလှိုင်း အသုံးပြု၍ အသည်း၊ သည်းခြေအိတ်၊ ကျောက်ကပ်၊ သားအိမ်နှင့် မျိုးဥအိမ် အင်္ဂါများကို ကြည့်ရှုခြင်း ဖြစ်ပါသည်။',
    normalRange: 'No gallstones, Liver echogenicity normal, Kidneys normal size without stones or hydronephrosis.',
    indications: ['ဗိုက်အောင့်ခြင်း၊ သည်းခြေကျောက် သို့မဟုတ် ကျောက်ကပ်ကျောက် စစ်ဆေးရန်', 'အသည်းအဆီဖုံးခြင်း ကြည့်ရှုရန်', 'အမျိုးသမီး သားအိမ်/မျိုးဥအိမ် အကျိတ်နှင့် ကိုယ်ဝန်ဆောင် စောင့်ရှောက်မှု'],
    preparation: 'Upper Abdomen အတွက် မနက်ပိုင်း အစာငတ် (၆-၈ နာရီ) ထားရပါမည်။ Pelvis (ဆီးစပ်) အတွက် ဆီးအောင့်ထားရပါမည်။',
    highMeaning: 'ကျောက်ကပ်ကျောက်၊ သည်းခြေကျောက် သို့မဟုတ် သားအိမ်အကျိတ် (Fibroid / Cyst) တွေ့ရှိနိုင်သည်။',
    lowMeaning: 'ဝမ်းဗိုက်အတွင်း အင်္ဂါများ သန့်ရှင်း ပုံမှန်ဖြစ်ကြောင်း ပြသပါသည်။',
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'ecg',
    nameMm: 'နှလုံးလျှပ်စစ်လှိုင်း တိုင်းတာခြင်း (ECG / EKG)',
    nameEn: 'Electrocardiogram (ECG / EKG)',
    category: 'imaging',
    shortDesc: 'နှလုံး၏ လျှပ်စစ်စီးဆင်းမှုနှင့် ခုနစ်နှုန်း ပုံမှန်ရှိမရှိ ရင်ဘတ်တွင် ငုတ်သီးတပ်၍ တိုင်းတာခြင်း ဖြစ်ပါသည်။',
    normalRange: 'Normal Sinus Rhythm, Rate: 60 - 100 bpm, No ischemic ST-T changes.',
    indications: ['ရင်ဘတ်အောင့်ခြင်း၊ ရင်တုန်ခြင်း၊ မူးဝေ့ခြင်း', 'သွေးတိုးရောဂါရှင်များ နှလုံးထိခိုက်မှု စစ်ဆေးရန်', 'နှလုံးသွေးကြောကျဉ်း ရောဂါ မသင်္ကာပါက'],
    preparation: 'အထူး ပြင်ဆင်ရန် မလိုပါ။ ရင်ဘတ်ပေါ်တွင် လျှပ်ခေါင်းများ တပ်ဆင်ချိန် ငြိမ်သက်စွာ လဲလျောင်းပေးရပါမည်။',
    highMeaning: 'ST elevation / T wave inversion = နှလုံးသွေးကြောပိတ်/ကျဉ်းခြင်း (Heart Attack)။ Arrhythmia = နှလုံးခုန်မမှန်ခြင်း။',
    lowMeaning: 'Normal Sinus Rhythm သည် နှလုံးလျှပ်စစ်လှိုင်း ပုံမှန်ဖြစ်ကြောင်း ပြသပါသည်။',
    iconBg: 'bg-rose-50 text-rose-700 border-rose-200'
  }
];

export const LabInvestigationGuideModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('cbc');

  // Interactive Quick Interpreter Tool State
  const [testType, setTestType] = useState<string>('fbs');
  const [inputValue, setInputValue] = useState<string>('');
  const [interpreterResult, setInterpreterResult] = useState<{
    status: 'normal' | 'warning' | 'danger' | 'info';
    title: string;
    description: string;
    recommendation: string;
  } | null>(null);

  const filteredTests = LAB_TEST_DATABASE.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = item.nameMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleInterpret = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setInterpreterResult({
        status: 'info',
        title: 'ကိန်းဂဏန်း ရိုက်ထည့်ပါ',
        description: 'ကျေးဇူးပြု၍ မိမိဆေးစစ်ချက်စာရွက်ပါ ဂဏန်းတန်ဖိုးကို ရိုက်ထည့်ပါ။',
        recommendation: 'ဥပမာ - ၁၀၅ သို့မဟုတ် ၆.၂'
      });
      return;
    }

    if (testType === 'fbs') {
      if (val < 70) {
        setInterpreterResult({
          status: 'danger',
          title: 'သွေးချိုလွန်စွာ ကျနေပါသည် (Hypoglycemia)',
          description: `သင်ရိုက်ထည့်သော Fasting Glucose တန်ဖိုးမှာ ${val} mg/dL ဖြစ်ပြီး ၇၀ mg/dL အောက် ရောက်ရှိနေပါသည်။`,
          recommendation: 'ခေါင်းမူးခြင်း၊ ချွေးစေးပြန်ခြင်း ရှိပါက သကြားရေ သို့မဟုတ် အချိုရည် ချက်ချင်း သောက်ပါ သို့မဟုတ် ဆရာဝန်ထံ ပြသပါ။'
        });
      } else if (val >= 70 && val <= 99) {
        setInterpreterResult({
          status: 'normal',
          title: 'သွေးချိုပမာဏ ပုံမှန်အဆင့် ဖြစ်ပါသည် (Normal)',
          description: `သင်ရိုက်ထည့်သော Fasting Glucose တန်ဖိုးမှာ ${val} mg/dL ဖြစ်ပြီး ပုံမှန်စံနှုန်း (70-99 mg/dL) အတွင်း ရှိပါသည်။`,
          recommendation: 'ကျန်းမာရေးနှင့် ညီညွတ်သော အစားအသောက်ပုံစံကို ဆက်လက် ထိန်းသိမ်းပါ။'
        });
      } else if (val >= 100 && val <= 125) {
        setInterpreterResult({
          status: 'warning',
          title: 'ဆီးချိုမဖြစ်မီ အစောပိုင်းအဆင့် (Prediabetes)',
          description: `သင်ရိုက်ထည့်သော တန်ဖိုးမှာ ${val} mg/dL ဖြစ်ပြီး ဆီးချို မဖြစ်မီ သတိပေးအဆင့် (100-125 mg/dL) အတွင်း ကျရောက်နေပါသည်။`,
          recommendation: 'အချိုနှင့် အဆီ လျှော့စားပါ၊ ကိုယ်အလေးချိန် ထိန်းပါ၊ နေ့စဉ် မိနစ် ၃၀ လမ်းလျှောက်ပါ။ ဆရာဝန်နှင့် တိုင်ပင်ပါ။'
        });
      } else {
        setInterpreterResult({
          status: 'danger',
          title: 'ဆီးချို/သွေးချို မြင့်မားနေပါသည် (Diabetes Level)',
          description: `သင်ရိုက်ထည့်သော တန်ဖိုးမှာ ${val} mg/dL ဖြစ်ပြီး ဆီးချိုသတ်မှတ်စံနှုန်း (၁၂၆ mg/dL နှင့် အထက်) သို့ ရောက်ရှိနေပါသည်။`,
          recommendation: 'အမြန်ဆုံး အထွေထွေရောဂါကု ဆရာဝန် သို့မဟုတ် ဆီးချိုအထူးကုနှင့် ပြသ၍ စနစ်တကျ ဆေးကုသမှု ခယူပါ။'
        });
      }
    } else if (testType === 'hba1c') {
      if (val < 5.7) {
        setInterpreterResult({
          status: 'normal',
          title: 'HbA1c ပုံမှန်အဆင့် (< 5.7%)',
          description: `၃ လစာ သွေးချိုပျမ်းမျှ တန်ဖိုး ${val}% သည် ပုံမှန်ကျန်းမာသော အဆင့်ဖြစ်ပါသည်။`,
          recommendation: 'ပုံမှန်အတိုင်း ကျန်းမာရေး ထိန်းသိမ်းပါ။'
        });
      } else if (val >= 5.7 && val <= 6.4) {
        setInterpreterResult({
          status: 'warning',
          title: 'HbA1c ဆီးချိုမဖြစ်မီ သတိပေးအဆင့် (5.7% - 6.4%)',
          description: `၃ လစာ သွေးချိုပျမ်းမျှ တန်ဖိုး ${val}% သည် Prediabetes အဆင့် ဖြစ်ပါသည်။`,
          recommendation: 'ကိုယ်လက်လှုပ်ရှားမှု တိုးမြှင့်ပါ၊ ကာဗိုဟိုက်ဒရိတ် လျှော့စားပါ။'
        });
      } else {
        setInterpreterResult({
          status: 'danger',
          title: 'HbA1c ဆီးချိုအဆင့် (>= 6.5%)',
          description: `၃ လစာ သွေးချိုပျမ်းမျှ တန်ဖိုး ${val}% သည် ဆီးချိုရောဂါ အဆင့်ဖြစ်ပါသည်။`,
          recommendation: 'ဆရာဝန်နှင့် ပြသ၍ ဆေးဝါးညှိနှိုင်းမှုနှင့် သွေးချိုပုံမှန် မှတ်တမ်းတင်ပါ။'
        });
      }
    } else if (testType === 'creatinine') {
      if (val >= 0.6 && val <= 1.2) {
        setInterpreterResult({
          status: 'normal',
          title: 'Serum Creatinine ပုံမှန်အဆင့် (0.6 - 1.2 mg/dL)',
          description: `ကျောက်ကပ် စွန့်ထုတ်နိုင်စွမ်း တန်ဖိုး ${val} mg/dL သည် ပုံမှန်စံနှုန်းအတွင်း ရှိပါသည်။`,
          recommendation: 'နေ့စဉ် ရေလုံလောက်စွာ သောက်သုံးပါ။'
        });
      } else if (val > 1.2) {
        setInterpreterResult({
          status: 'danger',
          title: 'Creatinine မြင့်မားနေပါသည် (> 1.2 mg/dL)',
          description: `Creatinine တန်ဖိုး ${val} mg/dL သည် ကျောက်ကပ်စွန့်ထုတ်နိုင်စွမ်း လျော့နည်းနေခြင်း သို့မဟုတ် ထိခိုက်နေခြင်း ဖြစ်နိုင်ပါသည်။`,
          recommendation: 'ကျောက်ကပ် အထူးကု သို့မဟုတ် ဆရာဝန်ထံ သွားရောက်၍ eGFR နှင့် ဆီးစစ်ချက် ထပ်မံ ပြုလုပ်ပါ။'
        });
      } else {
        setInterpreterResult({
          status: 'info',
          title: 'Creatinine နည်းပါးနေပါသည် (< 0.6 mg/dL)',
          description: `Creatinine တန်ဖိုး ${val} mg/dL သည် ကြွက်သားနည်းခြင်း သို့မဟုတ် အာဟာရ နည်းခြင်းကြောင့် ဖြစ်တတ်ပါသည်။`,
          recommendation: 'အာဟာရ စုံလင်စွာ စားသုံးပါ။'
        });
      }
    } else if (testType === 'hb') {
      if (val >= 12 && val <= 17) {
        setInterpreterResult({
          status: 'normal',
          title: 'ဟေမိုဂလိုဘင် ပုံမှန်အဆင့် (12 - 17 g/dL)',
          description: `သွေးနီဥ ပရိုတင်း တန်ဖိုး ${val} g/dL သည် ပုံမှန်အဆင့် ဖြစ်ပါသည်။`,
          recommendation: 'သွေးအားကောင်းစေသော အစားအစာများကို ပုံမှန် စားသုံးပါ။'
        });
      } else if (val < 12) {
        setInterpreterResult({
          status: 'warning',
          title: 'ဟေမိုဂလိုဘင် နည်းနေပါသည် (သွေးအားနည်းခြင်း Anemia)',
          description: `Hb တန်ဖိုး ${val} g/dL သည် ပုံမှန်ထက် နည်းနေပြီး သွေးအားနည်းရောဂါ လက္ခဏာ ဖြစ်နိုင်ပါသည်။`,
          recommendation: 'သံဓာတ်ကြွယ်ဝသော အသီးအရွက်၊ အသားနှင့် သံဓာတ်အားဆေး သောက်ရန် ဆရာဝန်နှင့် တိုင်ပင်ပါ။'
        });
      } else {
        setInterpreterResult({
          status: 'info',
          title: 'ဟေမိုဂလိုဘင် မြင့်မားနေပါသည် (> 17 g/dL)',
          description: `Hb တန်ဖိုး ${val} g/dL သည် ရေဓာတ်ခမ်းခြောက်ခြင်း သို့မဟုတ် ဆေးလိပ်သောက်ခြင်း ကြောင့် ဖြစ်တတ်ပါသည်။`,
          recommendation: 'ရေများများသောက်ပါ။'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Medical Investigations Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ဓာတ်ခွဲနှင့် စမ်းသပ်စစ်ဆေးမှုများ လမ်းညွှန်
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              သွေးစစ်ဆေးမှု၊ ဆီးစစ်ဆေးမှု၊ ဝမ်းစစ်ဆေးမှု နှင့် ရင်ဘတ်ဓာတ်မှန်/အာထရာဆောင်း စသည့် ဆေးစစ်ချက်များ၏ ပုံမှန်စံနှုန်းများ၊ ဆေးစစ်မီ ပြင်ဆင်ရန်များနှင့် ရလဒ်ကြည့်ရှုနည်းများကို စုံလင်စွာ လေ့လာနိုင်ပါသည်။
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <TestTube className="w-8 h-8 text-teal-300" />
            <div>
              <div className="text-xs text-teal-200 font-medium">စစ်ဆေးချက်ပေါင်း</div>
              <div className="text-xl font-bold text-white">၁၅ + ခု ပါဝင်သည်</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Test Interpreter */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              🧪 ဆေးစစ်ချက် ရလဒ် ကြည့်ရှုကူညီပေးစနစ် (Quick Interpreter)
            </h3>
            <p className="text-xs text-slate-500">
              မိမိဆေးစစ်ချက် စာရွက်ပါ ဂဏန်းတန်ဖိုးကို ရိုက်ထည့်၍ အကြမ်းဖျင်း အဓိပ္ပာယ် စစ်ဆေးပါ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">စစ်ဆေးမှု အမျိုးအစား ရွေးပါ</label>
            <select
              value={testType}
              onChange={(e) => {
                setTestType(e.target.value);
                setInterpreterResult(null);
              }}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="fbs">မနက်စာမစားမီ သွေးချို (Fasting Glucose - mg/dL)</option>
              <option value="hba1c">၃ လစာ သွေးချိုပျမ်းမျှ (HbA1c - %)</option>
              <option value="creatinine">ကျောက်ကပ် စွန့်ထုတ်ဓာတ် (Creatinine - mg/dL)</option>
              <option value="hb">သွေးနီဥ ပရိုတင်း (Hemoglobin - g/dL)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ဂဏန်းတန်ဖိုး ရိုက်ထည့်ပါ</label>
            <input
              type="number"
              step="0.1"
              placeholder="ဥပမာ - 105"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleInterpret}
              className="w-full py-2 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4" />
              <span>စစ်ဆေးချက် အဓိပ္ပာယ်ကြည့်မည်</span>
            </button>
          </div>
        </div>

        {/* Interpretation Result Alert */}
        {interpreterResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
            interpreterResult.status === 'normal' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
            interpreterResult.status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-950' :
            interpreterResult.status === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-950' :
            'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex items-center gap-2 font-extrabold text-sm">
              {interpreterResult.status === 'normal' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {interpreterResult.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
              {interpreterResult.status === 'danger' && <ShieldAlert className="w-4 h-4 text-rose-600" />}
              {interpreterResult.status === 'info' && <Info className="w-4 h-4 text-blue-600" />}
              <span>{interpreterResult.title}</span>
            </div>
            <p className="leading-relaxed">{interpreterResult.description}</p>
            <div className="font-bold pt-1 border-t border-black/5 flex items-center gap-1">
              <span>💡 အကြံပြုချက်:</span>
              <span>{interpreterResult.recommendation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Test Preparation Quick Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-xs text-amber-950 space-y-3">
        <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm">
          <Clock className="w-5 h-5 text-amber-600" />
          <span>⚠️ ဆေးစစ်ခန်း မသွားမီ အရေးကြီး ကြိုတင်ပြင်ဆင်ရန်များ</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/60">
            <span className="font-bold text-amber-900 block mb-1">၁။ အစာငတ်ထားရန် (Fasting)</span>
            <span>သွေးချို (FBS) နှင့် သွေးတွင်းအဆီ (Lipid) စစ်မည်ဆိုပါက မနက် သွေးမဖောက်မီ ၈ နာရီမှ ၁၂ နာရီအထိ ရေမှလွဲ၍ အစာမစားပါနှင့်။</span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/60">
            <span className="font-bold text-amber-900 block mb-1">၂။ ဆေးဝါးများ သောက်သုံးခြင်း</span>
            <span>သွေးတိုးဆေးကို ရေအနည်းငယ်ဖြင့် သောက်နိုင်သော်လည်း သိုင်းရွိုက်ဆေး သို့မဟုတ် ဆီးချိုဆေးများကို သွေးဖောက်ပြီးမှ သောက်ပါ။</span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/60">
            <span className="font-bold text-amber-900 block mb-1">၃။ ဆီးနှင့် ဝမ်းနမူနာ ခံယူခြင်း</span>
            <span>ဆီးစစ်ရန် မနက်အိပ်ရာထ ပထမဆုံး ဆီး၏ အလယ်ရေ (Mid-stream) ကို သန့်ရှင်းသော ဗူးတွင် ခံယူပါ။ ဝမ်းစစ်လျှင် သံဓာတ်ဆေး ခဏရပ်ပါ။</span>
          </div>
        </div>
      </div>

      {/* Category Dropdown & Search Bar (No Horizontal Scroll) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-bold text-slate-700 shrink-0">
            စစ်ဆေးမှု အမျိုးအစား:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">စစ်ဆေးချက် အားလုံး</option>
            <option value="blood">🩸 သွေးစစ်ဆေးမှုများ</option>
            <option value="urine">🧪 ဆီးစစ်ဆေးမှုများ</option>
            <option value="stool">🔬 ဝမ်းစစ်ဆေးမှုများ</option>
            <option value="imaging">🩻 ဓာတ်မှန်/အာထရာဆောင်း/ECG</option>
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="စစ်ဆေးချက် အမည် ရှာဖွေရန်..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Test Items List */}
      <div className="space-y-3">
        {filteredTests.map((test) => {
          const isExpanded = expandedId === test.id;
          return (
            <div
              key={test.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-teal-300"
            >
              {/* Item Card Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : test.id)}
                className="w-full p-4 text-left flex items-start sm:items-center justify-between gap-3 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${test.iconBg} shrink-0`}>
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {test.nameMm}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {test.nameEn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {test.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-teal-700 hidden md:inline">
                    {isExpanded ? 'အသေးစိတ် ပိတ်မည်' : 'အသေးစိတ် ကြည့်မည်'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-teal-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Item Card Expanded Body */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 space-y-4 bg-white text-xs animate-in slide-in-from-top-2 duration-200">
                  {/* Short Description */}
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-800 leading-relaxed">
                    <span className="font-bold text-teal-800">အနှစ်ချုပ် - </span>
                    {test.shortDesc}
                  </div>

                  {/* Normal Range Badge */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ပုံမှန်စံနှုန်း တန်ဖိုးများ (Normal Reference Range)</span>
                    </div>
                    <p className="font-semibold text-xs leading-relaxed">{test.normalRange}</p>
                  </div>

                  {/* Why to test (Indications) */}
                  <div className="space-y-1.5">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-teal-600" />
                      <span>မည်သည့်အခါတွင် စစ်ဆေးသင့်သနည်း။</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                      {test.indications.map((ind, i) => (
                        <li key={i} className="leading-relaxed">{ind}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Preparation Guidelines */}
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>မစစ်မီ ကြိုတင်ပြင်ဆင်ရန် -</span>
                    </span>
                    <p className="leading-relaxed">{test.preparation}</p>
                  </div>

                  {/* High and Low Meanings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                      <span className="font-bold text-rose-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>ရလဒ် ပုံမှန်ထက် မြင့်ပါက -</span>
                      </span>
                      <p className="leading-relaxed">{test.highMeaning}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-1">
                      <span className="font-bold text-sky-900 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-sky-600" />
                        <span>ရလဒ် ပုံမှန်ထက် နည်းပါက -</span>
                      </span>
                      <p className="leading-relaxed">{test.lowMeaning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTests.length === 0 && (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            ရှာဖွေမှုနှင့် ကိုက်ညီသော စစ်ဆေးချက် မတွေ့ရှိပါ။
          </div>
        )}
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
