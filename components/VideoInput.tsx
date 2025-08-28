import React, { useState, useRef } from 'react';
import { UploadIcon, XIcon, AlertTriangleIcon, SparklesIcon } from './icons';
import { AspectRatio } from '../types';
import { generatePromptSuggestions } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

const aspectRatios: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: 'Landscape' },
  { value: '9:16', label: 'Portrait' },
];

interface VideoInputProps {
  onGenerate: (prompt: string, imageFile: File | undefined, aspectRatio: AspectRatio) => void;
  isLoading: boolean;
  error: string | null;
}

export const VideoInput: React.FC<VideoInputProps> = ({ onGenerate, isLoading, error }) => {
  const [idea, setIdea] = useState('');
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleGetSuggestions = async () => {
    if ((!idea.trim() && !image) || isGeneratingSuggestions) return;
    
    setIsGeneratingSuggestions(true);
    setSuggestionsError(null);
    setSuggestions([]);
    try {
      let imageData;
      if (image) {
        const imageBytes = await fileToBase64(image);
        imageData = { imageBytes, mimeType: image.type };
      }
      const newSuggestions = await generatePromptSuggestions(idea, imageData);
      setSuggestions(newSuggestions);
      if (newSuggestions.length > 0) {
        setPrompt(newSuggestions[0]);
        setSelectedSuggestionIndex(0);
      }
    } catch (err: any) {
      setSuggestionsError(err.message || "Couldn't generate suggestions.");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string, index: number) => {
    setPrompt(suggestion);
    setSelectedSuggestionIndex(index);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt, image || undefined, aspectRatio);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200/80">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Idea Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700">
            1. Describe your vision
          </label>
          <p className="text-sm text-gray-500 mb-3">Start with an idea and/or a starting image. Our AI video designer will help you craft the perfect prompt.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., a cat driving a sports car"
              rows={5}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-[#0424aa] focus:border-[#0424aa] transition-all duration-300 resize-none placeholder-gray-400"
              disabled={isLoading || isGeneratingSuggestions}
            />
             <div>
                <div
                  className="relative flex justify-center items-center w-full h-full min-h-[124px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0424aa] transition-colors duration-300"
                  onClick={() => !isLoading && !isGeneratingSuggestions && fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg p-1" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1.5 text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200"
                        aria-label="Remove image"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <UploadIcon className="mx-auto h-6 w-6 text-gray-400" />
                      <p className="mt-1 text-sm font-semibold text-gray-600">Starting image</p>
                      <p className="mt-1 text-xs text-gray-500">(optional)</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isLoading || isGeneratingSuggestions}
                />
              </div>
          </div>
          <button
            type="button"
            onClick={handleGetSuggestions}
            disabled={(!idea.trim() && !image) || isGeneratingSuggestions || isLoading}
            className="mt-4 w-full sm:w-auto flex items-center justify-center bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            {isGeneratingSuggestions ? 'Generating Ideas...' : 'Get Prompt Suggestions'}
          </button>
           {suggestionsError && (
            <p className="text-sm text-red-600 mt-2">{suggestionsError}</p>
          )}
        </div>

        {/* Step 2: Suggestions */}
        {(isGeneratingSuggestions || suggestions.length > 0) && (
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-lg font-medium text-gray-700">2. Choose a starting point</label>
            <p className="text-sm text-gray-500 mb-3">Select one of the AI-generated prompts below to use as a base.</p>
            {isGeneratingSuggestions ? (
              <div className="text-center p-4">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-[#0424aa] mx-auto"></div>
                 <p className="text-sm text-gray-500 mt-2">Our AI is brainstorming...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.map((suggestion, index) => (
                   <button
                    type="button"
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion, index)}
                    className={`text-left p-3 border rounded-lg transition-all duration-200 text-sm h-full ${
                      selectedSuggestionIndex === index
                        ? 'bg-[#e6e9f9] border-[#0424aa] ring-2 ring-[#0424aa]'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Refine and Generate */}
        {suggestions.length > 0 && (
          <div className="border-t border-gray-200 pt-6 space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-lg font-medium text-gray-700">
                3. Refine your final prompt
              </label>
              <p className="text-sm text-gray-500 mb-2">Edit the selected prompt to perfection before generating your video.</p>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Your final, detailed prompt will appear here."
                rows={4}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-[#0424aa] focus:border-[#0424aa] transition-all duration-300 resize-none placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            
            {/* Aspect Ratio */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <div className="flex bg-gray-100 border border-gray-300 rounded-lg p-1 space-x-1" role="group">
                {aspectRatios.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAspectRatio(value)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#0424aa] disabled:opacity-50 ${
                      aspectRatio === value
                        ? 'bg-[#0424aa] text-white shadow'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                    aria-pressed={aspectRatio === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg flex items-start space-x-3">
                <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0"/>
                <div>
                    <p className="font-semibold">Generation Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-full flex items-center justify-center bg-[#0424aa] text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-[#031e8d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#0424aa]"
            >
              {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};