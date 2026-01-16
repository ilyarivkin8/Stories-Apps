
import React, { useState } from 'react';
import { AppState, Story } from './types';
import { generateStory } from './services/geminiService';
import VoiceInput from './components/VoiceInput';
import StoryBook from './components/StoryBook';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [adventurePrompt, setAdventurePrompt] = useState('');
  const [pageCount, setPageCount] = useState(10);
  const [story, setStory] = useState<Story | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('מכין את ההרפתקה...');
  const [isListening, setIsListening] = useState(false);

  const startAdventure = async () => {
    if (!adventurePrompt.trim()) {
      alert('אנא הזינו נושא להרפתקה!');
      return;
    }

    setAppState(AppState.LOADING);
    setLoadingStatus('האחים טוטו, פופו וסנופי מתכוננים...');
    
    try {
      const generatedStory = await generateStory(adventurePrompt, pageCount);
      setStory(generatedStory);
      setAppState(AppState.READING);
    } catch (error) {
      console.error(error);
      alert('משהו השתבש... בואו ננסה שוב');
      setAppState(AppState.INPUT);
    }
  };

  const renderContent = () => {
    if (appState === AppState.READING && story) {
      return <StoryBook story={story} onBack={() => setAppState(AppState.INPUT)} />;
    }

    if (appState === AppState.LOADING) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-blue-50">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🐕</div>
          </div>
          <h2 className="mt-8 text-3xl font-bold text-blue-800 animate-pulse text-center">{loadingStatus}</h2>
          <p className="mt-4 text-xl text-blue-600 text-center">הסיפור שלכם יהיה מוכן עוד רגע!</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-400">
          <header className="text-center mb-8">
            <div className="text-6xl mb-4">👬🐕</div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-2">הרפתקאות טוטו ופופו</h1>
            <p className="text-gray-500 font-bold">האחים הגמדים בכובעי הדרדסים וסנופי הכלב!</p>
          </header>

          <div className="space-y-8">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-3">מה תהיה ההרפתקה?</label>
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={adventurePrompt}
                  onChange={(e) => setAdventurePrompt(e.target.value)}
                  placeholder="למשל: הרפתקה בירח"
                  className="w-full p-4 pr-14 text-xl border-2 border-blue-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <VoiceInput 
                  onTranscript={(text) => setAdventurePrompt(text)} 
                  isListening={isListening} 
                  setIsListening={setIsListening}
                />
              </div>
            </div>

            <div>
              <label className="block text-xl font-bold text-gray-700 mb-6 text-center">כמה עמודים?</label>
              <div className="flex justify-between items-center bg-blue-50 p-6 rounded-2xl relative">
                {[10, 20, 30].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPageCount(count)}
                    className={`z-10 w-16 h-16 rounded-full font-bold text-xl transition-all ${
                      pageCount === count 
                        ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                        : 'bg-white text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <div className="absolute left-10 right-10 h-2 bg-blue-200 top-1/2 -translate-y-1/2 rounded-full"></div>
              </div>
            </div>

            <button
              onClick={startAdventure}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl text-2xl shadow-xl transform active:scale-95 transition-all mt-4"
            >
              בואו נתחיל! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {renderContent()}
      {/* Enhanced Watermark */}
      <div className="fixed bottom-4 left-4 text-blue-900 opacity-60 text-lg font-black select-none pointer-events-none z-[100] tracking-widest drop-shadow-sm">
        סיפורי מאמי
      </div>
    </div>
  );
};

export default App;
