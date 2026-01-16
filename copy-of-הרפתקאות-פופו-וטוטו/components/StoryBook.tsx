
import React, { useState, useEffect } from 'react';
import { Story, StoryPage } from '../types';
import { generateImage } from '../services/geminiService';

interface StoryBookProps {
  story: Story;
  onBack: () => void;
}

const StoryBook: React.FC<StoryBookProps> = ({ story, onBack }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, string>>({});
  const [loadingImage, setLoadingImage] = useState(false);

  const currentPage = story.pages[currentPageIndex];
  const totalPages = story.pages.length;
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalPages - 1;

  // Determine if a page is text-only (Title or End)
  const isTextOnlyPage = isFirstPage || isLastPage || !currentPage.imagePrompt || currentPage.imagePrompt.trim() === "";

  useEffect(() => {
    const fetchImage = async () => {
      if (!isTextOnlyPage && !loadedImages[currentPageIndex] && currentPage && currentPage.imagePrompt) {
        setLoadingImage(true);
        try {
          const url = await generateImage(currentPage.imagePrompt);
          setLoadedImages(prev => ({ ...prev, [currentPageIndex]: url }));
        } catch (error) {
          console.error("Failed to load image", error);
        } finally {
          setLoadingImage(false);
        }
      }
    };
    fetchImage();
  }, [currentPageIndex, currentPage, loadedImages, isTextOnlyPage]);

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      onBack();
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  // Logic for page numbering:
  // First page (index 0) and Last page (index length-1) don't show numbers.
  // Story pages start at index 1.
  const showPageNumber = !isFirstPage && !isLastPage;
  const displayPageNumber = currentPageIndex; // Since index 1 is story page 1
  const totalStoryPages = totalPages - 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-yellow-50 relative">
      {/* Close Button */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 md:top-8 md:left-8 bg-white text-red-500 hover:bg-red-50 p-3 rounded-full shadow-lg z-50 transition-transform active:scale-90"
        title="סגור סיפור"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className={`w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] border-8 border-yellow-200 relative transition-all duration-500`}>
        
        {/* Page Content */}
        <div className={`flex-1 p-8 flex flex-col items-center justify-center text-center ${isTextOnlyPage ? 'w-full' : 'md:border-l-4 border-yellow-100'}`}>
          <h2 className={`${isTextOnlyPage ? 'text-5xl md:text-7xl' : 'text-3xl md:text-5xl'} font-bold text-blue-800 leading-relaxed whitespace-pre-wrap`}>
            {currentPage.text}
          </h2>
          {isFirstPage && <p className="mt-8 text-2xl text-blue-400 font-bold animate-bounce">בואו נתחיל בהרפתקה!</p>}
        </div>

        {/* Image Content */}
        {!isTextOnlyPage && (
          <div className="flex-1 relative bg-blue-50 min-h-[300px]">
            {loadingImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
                  <p className="text-blue-500 font-bold">מציירים את ההרפתקה...</p>
                </div>
              </div>
            ) : (
              <img
                src={loadedImages[currentPageIndex] || 'https://picsum.photos/800/600?blur=5'}
                alt="Adventure"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          {!isFirstPage && (
            <button
              onClick={handlePrev}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-xl transform active:scale-95 transition-all"
            >
              הקודם
            </button>
          )}
          <button
            onClick={handleNext}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-xl transform active:scale-95 transition-all"
          >
            {isLastPage ? 'התחלה מחדש' : 'הבא'}
          </button>
        </div>
        {showPageNumber && (
          <p className="text-gray-500 font-medium text-lg">
            עמוד {displayPageNumber} מתוך {totalStoryPages}
          </p>
        )}
      </div>
    </div>
  );
};

export default StoryBook;
