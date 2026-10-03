# Family Health Track (HealthTrack Myanmar)

Family Health Track သည် မိသားစုဝင်များ၏ ကျန်းမာရေး အချက်အလက်များဖြစ်သော သွေးပေါင်ချိန် (Blood Pressure)၊ ဆီးချို/သကြားဓာတ် (Blood Sugar)၊ BMI ကိုယ်အလေးချိန်၊ ဓာတ်ခွဲခန်းစစ်ဆေးချက်များ (Lab Results)၊ ကာကွယ်ဆေးမှတ်တမ်း (Vaccines) နှင့် သောက်ဆေးမှတ်တမ်း (Medications) များကို မြန်မာဘာသာဖြင့် စနစ်တကျ မှတ်တမ်းတင် ခြေရာခံနိုင်သော မိသားစု ကျန်းမာရေးစနစ် ဖြစ်ပါသည်။

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Backend & Database:** Firebase Authentication, Cloud Firestore
- **Mobile & Offline Support:** Progressive Web App (PWA) with Service Worker

## Getting Started

1. **Dependencies ထည့်သွင်းခြင်း:**
   ```bash
   npm install
   ```

2. **Environment Variables သတ်မှတ်ခြင်း:**
   `.env.example` ဖိုင်ကို အခြေခံ၍ `.env` ဖိုင်ဖန်တီးပါ။ (Firebase အချက်အလက်များကို `firebase-applet-config.json` တွင် အလိုအလျောက် စီမံထားပါသည်)

3. **Development Server စတင်ခြင်း:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run lint` - TypeScript Type Check (`tsc --noEmit`)
- `npm test` - Unit Tests စစ်ဆေးခြင်း
- `npm run build` - Production Bundle တည်ဆောက်ခြင်း

## Firebase Configuration

Firestore Security Rules များကို Deploy ပြုလုပ်ရန်:
- `firestore.rules` ဖိုင်ကို စစ်ဆေးပြင်ဆင်ပြီး Firebase Console သို့မဟုတ် CLI မှတစ်ဆင့် Deploy ပြုလုပ်နိုင်ပါသည်။
