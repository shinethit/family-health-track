export const USER_DATA_COLLECTIONS = [
  'vitals',
  'glucose',
  'bmi',
  'labTests',
  'medications',
  'medicationLogs',
  'doctorAdvices',
  'doctorQuestions',
  'familyMembers',
  'vaccines'
] as const;

export type UserDataCollection = (typeof USER_DATA_COLLECTIONS)[number];

export const COLLECTION_NAMES_MM: Record<string, string> = {
  vitals: 'သွေးပေါင်ချိန် မှတ်တမ်းများ',
  glucose: 'ဆီးချို/သွေးချို မှတ်တမ်းများ',
  bmi: 'BMI မှတ်တမ်းများ',
  labTests: 'ဓာတ်ခွဲခန်း မှတ်တမ်းများ',
  medications: 'ဆေးမှတ်တမ်းများ',
  medicationLogs: 'ဆေးသောက်ပြီး မှတ်တမ်းများ',
  doctorAdvices: 'ဆရာဝန် အကြံပြုချက် မှတ်တမ်းများ',
  doctorQuestions: 'ဆရာဝန် မေးခွန်း မှတ်တမ်းများ',
  familyMembers: 'မိသားစုဝင် မှတ်တမ်းများ',
  vaccines: 'ကာကွယ်ဆေး မှတ်တမ်းများ',
  users: 'အသုံးပြုသူ ပရိုဖိုင်'
};
