import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                မမျှော်လင့်သော ချို့ယွင်းချက် ဖြစ်ပေါ်နေပါသည်
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                စနစ်တွင် အမှားတစ်ခု ဖြစ်ပေါ်သွားသဖြင့် အက်ပ်ကို ပုံမှန်အတိုင်း ပြန်လည်အသုံးပြုနိုင်ရန် စာမျက်နှာကို ပြန်လည်စတင်ပေးပါ။
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto text-left max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/20 transition active:scale-98 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ပြန်လည်စတင်မည်</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
