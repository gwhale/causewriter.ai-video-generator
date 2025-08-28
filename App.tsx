
import React from 'react';
import { Header } from './components/Header';
import { VideoInput } from './components/VideoInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { VideoPlayer } from './components/VideoPlayer';
import { Footer } from './components/Footer';
import { useVideoGenerator } from './hooks/useVideoGenerator';
import { AppState } from './types';

const App: React.FC = () => {
  const {
    appState,
    videoUrl,
    error,
    loadingMessage,
    elapsedTime,
    generateVideo,
    reset,
  } = useVideoGenerator();

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return (
          <VideoInput
            onGenerate={generateVideo}
            isLoading={false}
            error={error}
          />
        );
      case AppState.LOADING:
        return <LoadingIndicator message={loadingMessage} elapsedTime={elapsedTime} />;
      case AppState.SUCCESS:
        if (videoUrl) {
          return <VideoPlayer videoUrl={videoUrl} onReset={reset} />;
        }
        // Fallback to idle if URL is missing for some reason
        reset();
        return null;
      case AppState.ERROR:
        return (
            <VideoInput
              onGenerate={generateVideo}
              isLoading={false}
              error={error}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
         {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;