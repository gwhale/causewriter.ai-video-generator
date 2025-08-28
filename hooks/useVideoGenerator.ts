
import { useState, useCallback, useEffect } from 'react';
import { AppState, AspectRatio } from '../types';
import { generateVideo as generateVideoService } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

const LOADING_MESSAGES = [
  "Warming up the digital director...",
  "Gathering the creative pixels...",
  "Storyboarding your vision...",
  "Setting up the virtual cameras...",
  "This can take a few minutes",
  "Compositing the scene...",
  "Applying special effects...",
  "Rendering the final cut...",
  "Patience is the quality of enduring delay...",
  "Almost there, the premiere is about to start!"
];

export const useVideoGenerator = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let messageInterval: number | undefined;
    if (appState === AppState.LOADING) {
      let messageIndex = 0;
      messageInterval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 5000); // Change message every 5 seconds
    }
    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [appState]);

  useEffect(() => {
    let timerInterval: number | undefined;
    if (appState === AppState.LOADING) {
      const startTime = Date.now();
      setElapsedTime(0);
      timerInterval = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [appState]);


  const generateVideo = useCallback(async (prompt: string, imageFile?: File, aspectRatio?: AspectRatio) => {
    setAppState(AppState.LOADING);
    setError(null);
    setVideoUrl(null);
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      let image;
      if (imageFile) {
        const imageBytes = await fileToBase64(imageFile);
        image = {
          imageBytes,
          mimeType: imageFile.type,
        };
      }
      
      const url = await generateVideoService(prompt, image, aspectRatio);
      setVideoUrl(url);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred during video generation.');
      setAppState(AppState.ERROR);
    }
  }, []);

  const reset = useCallback(() => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setError(null);
    setElapsedTime(0);
    if(videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
  }, [videoUrl]);

  return { appState, videoUrl, error, loadingMessage, elapsedTime, generateVideo, reset };
};