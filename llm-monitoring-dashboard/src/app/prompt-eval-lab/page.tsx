'use client';

import React, { useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { 
    LuFlaskConical, 
    LuTextSelect, 
    LuLibrary, 
    LuPlay, 
    LuGitCompareArrows, 
    LuThumbsUp, 
    LuThumbsDown, 
    LuLoader, 
    LuCircleCheck,
    LuCircleX,
    LuDatabase
} from 'react-icons/lu';

// Define structure for options used in react-select
interface SelectOption {
    value: string;
    label: string;
}

// Dummy Data
const dummyModels: SelectOption[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'llama-3-70b', label: 'Llama 3 70B' },
];

const dummyPromptLibrary: SelectOption[] = [
  { value: 'prompt-1', label: 'Explain [concept] in simple terms.' },
  { value: 'prompt-2', label: 'Summarize the following text: [text]' },
  { value: 'prompt-3', label: 'Translate \'Hello\' to French.' },
  { value: 'prompt-4', label: 'Write a short poem about a rainy day.' },
];

// Dummy Data Ingestion Prompts (replace with actual fetched data later)
const dummyDataIngestionPrompts: SelectOption[] = [
  { value: 'ingest-prompt-1', label: 'finance_reports_q1.zip - Prompt 1: Analyze revenue trends.' },
  { value: 'ingest-prompt-2', label: 'customer_reviews.csv - Prompt 5: Extract key complaints.' },
  { value: 'ingest-prompt-3', label: 'support_tickets.jsonl - Prompt 2: Classify issue types.' },
];

export default function PromptEvalLabPage() {
  const [mode, setMode] = useState<'single' | 'ab'>('single');
  const [promptSource, setPromptSource] = useState<'text' | 'library' | 'ingestion'>('text');
  
  // Single Mode State
  const [singleModel, setSingleModel] = useState<SingleValue<SelectOption>>(null);
  const [singlePromptText, setSinglePromptText] = useState('');
  const [singleSelectedPrompt, setSingleSelectedPrompt] = useState<SingleValue<SelectOption>>(null);
  const [singleSelectedIngestionPrompt, setSingleSelectedIngestionPrompt] = useState<SingleValue<SelectOption>>(null);
  const [singleResponse, setSingleResponse] = useState<string | null>(null);
  const [isSingleLoading, setIsSingleLoading] = useState(false);

  // A/B Mode State
  const [modelA, setModelA] = useState<SingleValue<SelectOption>>(null);
  const [modelB, setModelB] = useState<SingleValue<SelectOption>>(null);
  const [abPromptText, setAbPromptText] = useState('');
  const [abSelectedPrompt, setAbSelectedPrompt] = useState<SingleValue<SelectOption>>(null);
  const [abSelectedIngestionPrompt, setAbSelectedIngestionPrompt] = useState<SingleValue<SelectOption>>(null);
  const [responseA, setResponseA] = useState<string | null>(null);
  const [responseB, setResponseB] = useState<string | null>(null);
  const [isAbLoading, setIsAbLoading] = useState(false);
  const [abPreference, setAbPreference] = useState<'A' | 'B' | 'Neither' | null>(null);
  const [abFeedback, setAbFeedback] = useState('');

  const getPromptValue = (
      source: 'text' | 'library' | 'ingestion',
      text: string,
      selectedLib: SingleValue<SelectOption>,
      selectedIngest: SingleValue<SelectOption>
  ): string => {
    if (source === 'library') return selectedLib?.label || '';
    if (source === 'ingestion') return selectedIngest?.label || '';
    return text;
  };

  // --- Handlers ---
  const handleRunSinglePrompt = () => {
    const prompt = getPromptValue(promptSource, singlePromptText, singleSelectedPrompt, singleSelectedIngestionPrompt);
    if (!singleModel || !prompt.trim()) {
        alert('Please select a model and enter or select a prompt.');
        return;
    }
    setIsSingleLoading(true);
    setSingleResponse(null);
    console.log('Running Single Prompt:', { model: singleModel.value, prompt });
    // Simulate API call
    setTimeout(() => {
        setSingleResponse(`Response from ${singleModel.label} for prompt: "${prompt}" (Simulated) - ${new Date().toLocaleTimeString()}`);
        setIsSingleLoading(false);
    }, 1500);
  };

  const handleRunAbTest = () => {
    const prompt = getPromptValue(promptSource, abPromptText, abSelectedPrompt, abSelectedIngestionPrompt);
    if (!modelA || !modelB || !prompt.trim()) {
        alert('Please select both models and enter or select a prompt.');
        return;
    }
    if (modelA.value === modelB.value) {
        alert('Please select two different models for A/B testing.');
        return;
    }
    setIsAbLoading(true);
    setResponseA(null);
    setResponseB(null);
    setAbPreference(null);
    setAbFeedback('');
    console.log('Running A/B Test:', { modelA: modelA.value, modelB: modelB.value, prompt });
    // Simulate API calls
    setTimeout(() => {
        setResponseA(`Response from Model A (${modelA.label}) for prompt: "${prompt}" (Simulated A) - ${new Date().toLocaleTimeString()}`);
    }, 1800);
     setTimeout(() => {
        setResponseB(`Response from Model B (${modelB.label}) for prompt: "${prompt}" (Simulated B) - ${new Date().toLocaleTimeString()}`);
        setIsAbLoading(false);
    }, 2200);
  };

  const handleAbPreference = (preference: 'A' | 'B' | 'Neither') => {
      setAbPreference(preference);
  };

  const submitAbFeedback = () => {
      console.log('A/B Feedback Submitted:', { preference: abPreference, comment: abFeedback });
      alert('Feedback submitted (simulation).');
  };

  const renderPromptInput = (
      textValue: string, 
      textSetter: (value: string) => void, 
      libValue: SingleValue<SelectOption>, 
      libSetter: (value: SingleValue<SelectOption>) => void,
      ingestValue: SingleValue<SelectOption>,
      ingestSetter: (value: SingleValue<SelectOption>) => void
    ) => (
    <div className="space-y-3">
        {/* Prompt Source Selector */}
        <div className="flex items-center flex-wrap gap-2 border border-gray-200 rounded-md p-1 bg-gray-50 w-fit">
            <button 
                onClick={() => setPromptSource('text')} 
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${promptSource === 'text' ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                 <LuTextSelect className="h-4 w-4 mr-1.5"/> Text Input
            </button>
            <button 
                onClick={() => setPromptSource('library')} 
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${promptSource === 'library' ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <LuLibrary className="h-4 w-4 mr-1.5"/> Prompt Library
            </button>
             <button 
                onClick={() => setPromptSource('ingestion')} 
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${promptSource === 'ingestion' ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <LuDatabase className="h-4 w-4 mr-1.5"/> Data Ingestion
            </button>
        </div>

        {/* Conditional Input */}
        {promptSource === 'text' && (
            <textarea 
                rows={4} 
                placeholder="Enter your prompt here..."
                value={textValue}
                onChange={e => textSetter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        )}
         {promptSource === 'library' && (
             <Select
                options={dummyPromptLibrary}
                value={libValue}
                onChange={libSetter}
                placeholder="Select a prompt from library..."
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                isClearable
            />
        )}
         {promptSource === 'ingestion' && (
             <Select
                options={dummyDataIngestionPrompts}
                value={ingestValue}
                onChange={ingestSetter}
                placeholder="Select a prompt from Data Ingestion..."
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                isClearable
            />
        )}
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center">
        <LuFlaskConical className="mr-3 h-8 w-8 text-indigo-600"/> PromptEval Lab
      </h1>

      {/* Mode Selection Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setMode('single')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${mode === 'single' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <LuTextSelect className="h-5 w-5 mr-2"/> Single Prompt Test
          </button>
          <button
            onClick={() => setMode('ab')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${mode === 'ab' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <LuGitCompareArrows className="h-5 w-5 mr-2"/> A/B Model Test
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {/* --- Single Prompt Test Mode --- */}
        {mode === 'single' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Model Selection */}
                <div className="md:col-span-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Select Model</label>
                    <Select
                        options={dummyModels}
                        value={singleModel}
                        onChange={setSingleModel}
                        placeholder="Choose model..."
                        className="react-select-container text-sm"
                        classNamePrefix="react-select"
                        isClearable
                    />
                </div>
                {/* Prompt Input */}
                <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Enter/Select Prompt</label>
                     {renderPromptInput(
                         singlePromptText, 
                         setSinglePromptText, 
                         singleSelectedPrompt, 
                         setSingleSelectedPrompt,
                         singleSelectedIngestionPrompt,
                         setSingleSelectedIngestionPrompt
                     )}
                </div>
            </div>

            {/* Run Button */}
            <div className="flex justify-center pt-2">
                 <button
                    type="button"
                    onClick={handleRunSinglePrompt}
                    disabled={isSingleLoading || !singleModel || !getPromptValue(promptSource, singlePromptText, singleSelectedPrompt, singleSelectedIngestionPrompt).trim()}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSingleLoading ? <LuLoader className="animate-spin h-5 w-5 mr-2"/> : <LuPlay className="h-5 w-5 mr-2"/>}
                    {isSingleLoading ? 'Running...' : 'Run Prompt'}
                </button>
            </div>

            {/* Response Area */}
             {(isSingleLoading || singleResponse) && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Response</h3>
                    {isSingleLoading && (
                         <div className="flex items-center text-gray-500">
                             <LuLoader className="animate-spin h-4 w-4 mr-2"/> Generating response...
                         </div>
                    )}
                    {singleResponse && !isSingleLoading && (
                         <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                            {singleResponse}
                        </div>
                    )}
                </div>
            )}
          </div>
        )}

        {/* --- A/B Model Test Mode --- */}
        {mode === 'ab' && (
           <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Model Selectors */}
                    <div className="lg:col-span-4 space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Model A</label>
                            <Select
                                options={dummyModels.filter(m => m.value !== modelB?.value)}
                                value={modelA}
                                onChange={setModelA}
                                placeholder="Choose model A..."
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                                isClearable
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Model B</label>
                             <Select
                                options={dummyModels.filter(m => m.value !== modelA?.value)}
                                value={modelB}
                                onChange={setModelB}
                                placeholder="Choose model B..."
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                                isClearable
                            />
                        </div>
                    </div>
                     {/* Prompt Input */}
                    <div className="lg:col-span-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter/Select Prompt</label>
                        {renderPromptInput(
                            abPromptText, 
                            setAbPromptText, 
                            abSelectedPrompt, 
                            setAbSelectedPrompt,
                            abSelectedIngestionPrompt,
                            setAbSelectedIngestionPrompt
                        )}
                    </div>
                </div>

                {/* Run Button */}
                 <div className="flex justify-center pt-2">
                   <button
                        type="button"
                        onClick={handleRunAbTest}
                        disabled={isAbLoading || !modelA || !modelB || !getPromptValue(promptSource, abPromptText, abSelectedPrompt, abSelectedIngestionPrompt).trim() || modelA.value === modelB.value}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAbLoading ? <LuLoader className="animate-spin h-5 w-5 mr-2"/> : <LuGitCompareArrows className="h-5 w-5 mr-2"/>}
                        {isAbLoading ? 'Running...' : 'Run A/B Test'}
                    </button>
                </div>

                {/* Response Area */}
                {(isAbLoading || responseA || responseB) && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                         <h3 className="text-lg font-semibold mb-3 text-gray-800">Comparison Results</h3>
                         {isAbLoading && (
                            <div className="flex items-center justify-center text-gray-500 p-6">
                                <LuLoader className="animate-spin h-5 w-5 mr-2"/> Generating responses...
                            </div>
                         )}
                         {!isAbLoading && (responseA || responseB) && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {/* Response A */}
                                 <div className="border border-gray-100 rounded p-3 bg-gray-50/50">
                                     <h4 className="font-semibold text-sm mb-1 text-gray-700">Model A: {modelA?.label || 'N/A'}</h4>
                                     <div className="text-sm text-gray-600 whitespace-pre-wrap min-h-[50px]">
                                         {responseA || (isAbLoading ? 'Loading...' : 'No response generated.')}
                                     </div>
                                 </div>
                                 {/* Response B */}
                                  <div className="border border-gray-100 rounded p-3 bg-gray-50/50">
                                     <h4 className="font-semibold text-sm mb-1 text-gray-700">Model B: {modelB?.label || 'N/A'}</h4>
                                      <div className="text-sm text-gray-600 whitespace-pre-wrap min-h-[50px]">
                                         {responseB || (isAbLoading ? 'Loading...' : 'No response generated.')}
                                     </div>
                                 </div>
                             </div>
                         )}

                         {/* Feedback Section (only show after results) */} 
                         {!isAbLoading && responseA && responseB && (
                             <div className="mt-6 pt-4 border-t border-gray-200">
                                 <h4 className="text-md font-semibold mb-3 text-gray-800">Which response is better?</h4>
                                 <div className="flex flex-wrap gap-3 mb-4">
                                     <button 
                                         onClick={() => handleAbPreference('A')} 
                                         className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium focus:outline-none ${abPreference === 'A' ? 'bg-green-100 text-green-700 border-green-300 ring-1 ring-green-300' : 'text-gray-700 bg-white border-gray-300 hover:bg-green-50'}`}
                                     > 
                                         <LuCircleCheck className="h-4 w-4 mr-1.5"/> Model A is better
                                     </button>
                                     <button 
                                         onClick={() => handleAbPreference('B')} 
                                         className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium focus:outline-none ${abPreference === 'B' ? 'bg-green-100 text-green-700 border-green-300 ring-1 ring-green-300' : 'text-gray-700 bg-white border-gray-300 hover:bg-green-50'}`}
                                     > 
                                          <LuCircleCheck className="h-4 w-4 mr-1.5"/> Model B is better
                                     </button>
                                      <button 
                                         onClick={() => handleAbPreference('Neither')} 
                                         className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium focus:outline-none ${abPreference === 'Neither' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-1 ring-yellow-300' : 'text-gray-700 bg-white border-gray-300 hover:bg-yellow-50'}`}
                                     > 
                                         <LuCircleX className="h-4 w-4 mr-1.5"/> Neither is better
                                     </button>
                                 </div>

                                 {abPreference && (
                                     <div className="mt-3 space-y-2">
                                          <label htmlFor="abFeedback" className="block text-sm font-medium text-gray-700">Feedback Comments (Optional)</label>
                                          <textarea 
                                             id="abFeedback"
                                             rows={2} 
                                             placeholder={`Explain why you chose ${abPreference === 'Neither' ? 'neither' : 'Model ' + abPreference}...`}
                                             value={abFeedback}
                                             onChange={e => setAbFeedback(e.target.value)}
                                             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                         />
                                         <div className="flex justify-end">
                                              <button
                                                type="button"
                                                onClick={submitAbFeedback}
                                                className="inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Submit Feedback
                                            </button>
                                         </div>
                                     </div>
                                 )}
                             </div>
                         )}
                    </div>
                )}
           </div>
        )}
      </div>
    </div>
  );
} 