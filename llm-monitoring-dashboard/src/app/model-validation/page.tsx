'use client';

import React, { useState, useRef, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import ReactModal from 'react-modal';
import {
  LuFileText,
  LuBrainCircuit,
  LuFileJson,
  LuFileSpreadsheet,
  LuThumbsUp,
  LuThumbsDown,
  LuDownload,
  LuLoader,
  LuX,
  LuEye,
  LuSave,
  LuDatabaseZap,
  LuFileClock,
  LuClipboardCheck,
  LuTarget,
  LuCircleCheck,
  LuScale,
  LuGhost,
  LuShieldAlert,
} from 'react-icons/lu';

// Define structure for options used in react-select
interface SelectOption {
    value: string;
    label: string;
}

// Dummy data for document selector
const dummyDocuments: SelectOption[] = [
  { value: 'doc-1', label: 'Product_Manual_v2.pdf' },
  { value: 'doc-2', label: 'API_Reference_Guide.docx' },
  { value: 'doc-3', label: 'Troubleshooting_FAQ.html' },
  { value: 'doc-4', label: 'Security_Policy.pdf' },
];

// Interface for generated data row
interface SyntheticDataRow {
  id: number;
  prompt: string;
  context: string;
  reference: string;
  feedback?: 'up' | 'down' | null;
  feedbackText?: string;
}

// Interface for evaluation sample row
interface EvaluationSampleRow {
    id: number;
    prompt: string;
    modelResponse: string;
    referenceAnswer: string;
}

// Interface for evaluation results
interface EvaluationResults {
    summaryMetrics: Record<string, { value: string | number; icon?: React.ElementType }>;
    sampleData: EvaluationSampleRow[];
    model: string;
    dataset: string;
    timestamp: string;
}

// Dummy Models, Benchmarks, Custom Datasets for Evaluate Tab
const dummyModels: SelectOption[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
];

const dummyBenchmarks: SelectOption[] = [
  { value: 'hellaswag', label: 'HellaSwag' },
  { value: 'mmlu', label: 'MMLU' },
  { value: 'arc', label: 'ARC Challenge' },
  { value: 'truthfulqa', label: 'TruthfulQA' },
];

// Simulate saved datasets (will include generated + ingested)
const dummyCustomDatasets: SelectOption[] = [
  { value: 'ingested-finance-q1', label: 'Data Ingestion: finance_reports_q1.zip' },
  { value: 'generated-support-v1', label: 'Generated: support_qa_v1' }, // Example saved name
  { value: 'generated-pw-reset', label: 'Generated: password_reset_scenarios' }, // Example saved name
];

// Modal Styles (basic inline styles for simplicity)
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '25px',
    maxWidth: '800px',
    maxHeight: '80vh',
    overflowY: 'auto' as 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
};

export default function ModelValidationPage() {
  const [activeTab, setActiveTab] = useState<'synthetic' | 'evaluate'>('synthetic');

  // State for form elements
  const [selectedDocuments, setSelectedDocuments] = useState<MultiValue<SelectOption>>([]);
  const [samplingStrategy, setSamplingStrategy] = useState('random');
  const [numPairs, setNumPairs] = useState(100);
  const [maxContext, setMaxContext] = useState(512);
  const [maxSteps, setMaxSteps] = useState(3);
  const [filterCriteria, setFilterCriteria] = useState('Any');

  // State for generated data and UI
  const [generatedData, setGeneratedData] = useState<SyntheticDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowForModal, setSelectedRowForModal] = useState<SyntheticDataRow | null>(null);
  const [modalFeedbackText, setModalFeedbackText] = useState('');
  const [modalFeedbackStatus, setModalFeedbackStatus] = useState<'up' | 'down' | null>(null);
  const [datasetName, setDatasetName] = useState('');

  // State for Evaluate tab
  const [selectedModel, setSelectedModel] = useState<SelectOption | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<'benchmark' | 'custom'>('benchmark');
  const [selectedBenchmark, setSelectedBenchmark] = useState<SelectOption | null>(null);
  const [selectedCustomData, setSelectedCustomData] = useState<SelectOption | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResults | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Ensure ReactModal is initialized for accessibility
  useEffect(() => {
    ReactModal.setAppElement('body');
  }, []);

  // Dummy function to simulate data generation
  const handleGenerateData = () => {
    setIsLoading(true);
    setGeneratedData([]);
    setDatasetName('');

    setTimeout(() => {
       resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    console.log("Generating data with:", { selectedDocuments, samplingStrategy, numPairs, maxContext, maxSteps, filterCriteria });

    setTimeout(() => {
        const dummyGenerated: SyntheticDataRow[] = [
          {
            id: 1,
            prompt: 'What is the process for resetting a password?',
            context: 'Section 4.2 of the Product Manual v2 details the password reset procedure. Users must navigate to the login screen and click the \'Forgot Password\' link. An email will be sent to the registered address with further instructions. Ensure spam filters are checked if the email is not received within 5 minutes.',
            reference: 'Go to login, click \'Forgot Password\', follow email instructions. Check spam filter.'
          },
          {
            id: 2,
            prompt: 'How does the API handle rate limiting for authenticated users?',
            context: 'The API Reference Guide states that rate limits are applied per user API key. The default limit is 100 requests per minute. Exceeding this limit will result in a 429 Too Many Requests error. Contact support for potential limit increases based on usage.',
            reference: 'Rate limits are 100 requests/minute per API key. Exceeding results in 429 error. Contact support for increases.'
          },
          {
            id: 3,
            prompt: 'Why might a user encounter a \'Connection Refused\' error when trying to access the service through a VPN?',
            context: 'The Troubleshooting FAQ lists several potential causes for \'Connection Refused\': 1) Local firewall blocking the outbound connection. 2) The VPN service itself blocking the specific port required by our service. 3) The service server not running or misconfigured. 4) Incorrect server address or port specified in the client configuration. 5) Network routing issues between the VPN endpoint and our server.',
            reference: 'Check local firewall, VPN port restrictions, server status, client configuration (address/port), and network routing.'
          },
        ];
        setGeneratedData(dummyGenerated);
        setIsLoading(false);
    }, 2000);
  };

  const handleSaveData = () => {
    if (!datasetName.trim() || generatedData.length === 0) {
        alert('Please enter a name for the dataset and ensure data is generated.');
        return;
    }
    console.log(`Saving dataset "${datasetName}" with ${generatedData.length} items.`);
    alert(`Dataset "${datasetName}" saved (simulation).`);
  };

  // Open Modal
  const openModal = (row: SyntheticDataRow) => {
    setSelectedRowForModal(row);
    setModalFeedbackText(row.feedbackText || '');
    setModalFeedbackStatus(row.feedback || null);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRowForModal(null);
    setModalFeedbackText('');
    setModalFeedbackStatus(null);
  };

  // Handle feedback submission from modal
  const handleModalSubmit = () => {
    if (!selectedRowForModal) return;

    const rowId = selectedRowForModal.id;
    setGeneratedData(prevData =>
      prevData.map(row =>
        row.id === rowId ? { ...row, feedback: modalFeedbackStatus, feedbackText: modalFeedbackText } : row
      )
    );
    console.log(`Feedback for ${rowId}: ${modalFeedbackStatus}, Text: ${modalFeedbackText}`);
    closeModal();
  };

  // Handle Run Evaluation
  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setEvaluationResults(null);
    const evalModelLabel = selectedModel?.label;
    const evalDatasetLabel = selectedDataSource === 'benchmark' ? selectedBenchmark?.label : selectedCustomData?.label;
    
    // Add checks to ensure labels exist before proceeding (primarily for type safety)
    if (!evalModelLabel || !evalDatasetLabel) {
        console.error("Evaluation cannot run without a selected model and dataset.");
        setIsEvaluating(false); // Stop loading if somehow triggered without selection
        return; 
    }

    console.log("Running evaluation with:", { model: evalModelLabel, dataset: evalDatasetLabel });

    // Simulate evaluation time
    setTimeout(() => {
        // Dummy results structure (updated)
        const results: EvaluationResults = {
            model: evalModelLabel, // Now guaranteed to be string
            dataset: evalDatasetLabel, // Now guaranteed to be string
            timestamp: new Date().toISOString(),
            summaryMetrics: {
                accuracy: { value: (Math.random() * (95 - 70) + 70).toFixed(1) + '%', icon: LuTarget },
                precision: { value: (Math.random() * (90 - 65) + 65).toFixed(1) + '%', icon: LuCircleCheck },
                context_relevance: { value: (Math.random() * (0.9 - 0.6) + 0.6).toFixed(2), icon: LuScale },
                hallucination_rate: { value: (Math.random() * 8).toFixed(1) + '%', icon: LuGhost },
                toxicity_score: { value: (Math.random() * 0.1).toFixed(3), icon: LuShieldAlert },
            },
            sampleData: [
                {
                    id: 1,
                    prompt: "What is the capital of France?",
                    modelResponse: "The capital of France is Paris.",
                    referenceAnswer: "Paris"
                },
                {
                    id: 2,
                    prompt: "Summarize the main plot points of Hamlet.",
                    modelResponse: "Hamlet seeks revenge against his uncle Claudius for murdering his father and marrying his mother. This leads to madness, duels, and ultimately the death of most main characters.",
                    referenceAnswer: "Prince Hamlet plans revenge on his uncle Claudius, who killed Hamlet's father to seize the throne and marry Hamlet's mother Gertrude. Hamlet feigns madness, confronts Gertrude, and kills Polonius. Claudius plots Hamlet's death. A duel results in the deaths of Laertes, Gertrude, Claudius, and Hamlet."
                },
                {
                    id: 3,
                    prompt: "Explain the concept of photosynthesis.",
                    modelResponse: "Photosynthesis is the process plants use to convert light energy into chemical energy, creating sugars for food.",
                    referenceAnswer: "Photosynthesis is a process used by plants, algae, and cyanobacteria to convert light energy into chemical energy, through a process that uses sunlight, water and carbon dioxide, releasing oxygen as a byproduct."
                },
                 {
                    id: 4,
                    prompt: "Who wrote 'Pride and Prejudice'?",
                    modelResponse: "'Pride and Prejudice' was written by Jane Austen.",
                    referenceAnswer: "Jane Austen"
                },
            ]
        };
        setEvaluationResults(results);
        setIsEvaluating(false);
    }, 2500);
  };

  const handleDownloadEvalCsv = () => {
    if (!evaluationResults || evaluationResults.sampleData.length === 0) return;
    console.log("Downloading Evaluation CSV...");
    // TODO: Implement actual CSV generation and download
    alert('CSV download started (simulation).');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Validation</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('synthetic')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'synthetic'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Synthetic Data Generation
          </button>
          <button
            onClick={() => setActiveTab('evaluate')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'evaluate'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Evaluate
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'synthetic' && (
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Synthetic Data Generation Configuration</h2>

            {/* Document Selection */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                 <label htmlFor="document-selector" className="block text-sm font-medium text-gray-700 mb-2">Select Document(s)</label>
                 <Select
                    id="document-selector"
                    isMulti
                    value={selectedDocuments}
                    onChange={setSelectedDocuments}
                    options={dummyDocuments}
                    className="react-select-container text-sm"
                    classNamePrefix="react-select"
                    placeholder="Select documents from Data Ingestion..."
                />
             </div>

            {/* Sampling Strategy */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Choose Sampling Strategy</h3>
              <fieldset className="space-y-3">
                <div className="flex items-center">
                   <input id="random-sampling" name="sampling-strategy" type="radio" value="random" checked={samplingStrategy === 'random'} onChange={(e) => setSamplingStrategy(e.target.value)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                   <label htmlFor="random-sampling" className="ml-3 block text-sm font-medium text-gray-700">Random sampling of QA pairs</label>
                 </div>
                 <div className="flex items-center">
                   <input id="multi-hop" name="sampling-strategy" type="radio" value="multi-hop" checked={samplingStrategy === 'multi-hop'} onChange={(e) => setSamplingStrategy(e.target.value)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                   <label htmlFor="multi-hop" className="ml-3 block text-sm font-medium text-gray-700">Multi-hop sampling (complex reasoning)</label>
                 </div>
                 <div className="flex items-center">
                   <input id="entity-topic" name="sampling-strategy" type="radio" value="entity-topic" checked={samplingStrategy === 'entity-topic'} onChange={(e) => setSamplingStrategy(e.target.value)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                   <label htmlFor="entity-topic" className="ml-3 block text-sm font-medium text-gray-700">Named Entity/Topic-based sampling</label>
                 </div>
                 <div className="flex items-center">
                   <input id="user-defined" name="sampling-strategy" type="radio" value="user-defined" checked={samplingStrategy === 'user-defined'} onChange={(e) => setSamplingStrategy(e.target.value)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                   <label htmlFor="user-defined" className="ml-3 block text-sm font-medium text-gray-700">User-defined question templates <span className="text-xs text-gray-500">(Optional)</span></label>
                 </div>
              </fieldset>
            </div>

            {/* Sampling Parameters */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Set Sampling Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="num-pairs" className="block text-sm font-medium text-gray-700">Number of QA pairs</label>
                        <input type="number" id="num-pairs" name="num-pairs" value={numPairs} onChange={e => setNumPairs(parseInt(e.target.value))} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="max-context" className="block text-sm font-medium text-gray-700">Max context window (tokens)</label>
                        <input type="number" id="max-context" name="max-context" value={maxContext} onChange={e => setMaxContext(parseInt(e.target.value))} min="50" step="10" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    {samplingStrategy === 'multi-hop' && (
                        <div>
                            <label htmlFor="max-steps" className="block text-sm font-medium text-gray-700">Max reasoning steps (multi-hop)</label>
                            <input type="number" id="max-steps" name="max-steps" value={maxSteps} onChange={e => setMaxSteps(parseInt(e.target.value))} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                    )}
                     <div>
                        <label htmlFor="filter-criteria" className="block text-sm font-medium text-gray-700">Filtering Criteria</label>
                        <select id="filter-criteria" name="filter-criteria" value={filterCriteria} onChange={e => setFilterCriteria(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option>Any</option>
                            <option>Factual Questions Only</option>
                            <option>Causal Questions Only</option>
                            <option>Comparison Questions Only</option>
                            <option>High Difficulty Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-start pt-4">
                <button
                    type="button"
                    onClick={handleGenerateData}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={selectedDocuments.length === 0 || isLoading}
                >
                    {isLoading ? (
                        <LuLoader className="-ml-1 mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    ) : (
                        <LuBrainCircuit className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    )}
                    {isLoading ? 'Generating...' : 'Generate Synthetic Data'}
                </button>
            </div>

            {/* Results Section (Loader and Table) */}
            <div ref={resultsRef} className="mt-8 min-h-[100px]">
              {isLoading && (
                 <div className="flex justify-center items-center p-10 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <LuLoader className="h-8 w-8 text-indigo-600 animate-spin mr-3" />
                    <span className="text-lg font-medium text-gray-700">Generating data...</span>
                 </div>
              )}

              {!isLoading && generatedData.length > 0 && (
                <section className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 gap-3">
                      <div>
                         <h3 className="text-lg font-semibold text-gray-800">Generated Data ({generatedData.length} pairs)</h3>
                         <p className="text-xs text-gray-500 mt-1">Review the generated pairs and provide feedback using the actions column.</p>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <input 
                              type="text"
                              placeholder="Enter dataset name to save..."
                              value={datasetName}
                              onChange={(e) => setDatasetName(e.target.value)}
                              className="flex-grow sm:flex-grow-0 w-full sm:w-48 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              disabled={generatedData.length === 0}
                          />
                          <button 
                              title="Save Dataset" 
                              type="button" 
                              onClick={handleSaveData}
                              className={`p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                                  (!datasetName.trim() || generatedData.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={!datasetName.trim() || generatedData.length === 0}
                          > 
                              <LuSave className="h-4 w-4" />
                          </button>
                         <span className="border-l h-6 mx-2"></span>
                         <span className="text-sm font-medium text-gray-600">Export:</span>
                         <button title="Export JSON" type="button" className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">
                            <LuFileJson className="h-5 w-5" aria-hidden="true" />
                         </button>
                         <button title="Export CSV" type="button" className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">
                            <LuFileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                         </button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Prompt</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Reference Context</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Reference Answer</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Feedback</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {generatedData.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 align-top">
                            <td className="px-4 py-3 text-sm text-gray-800 font-medium break-words">{row.prompt}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 break-words">{row.context}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 break-words">{row.reference}</td>
                            <td className="px-4 py-3 text-center">
                              {row.feedback === 'up' && <LuThumbsUp title={row.feedbackText || 'Good'} className="h-5 w-5 text-green-600 mx-auto" />}
                              {row.feedback === 'down' && <LuThumbsDown title={row.feedbackText || 'Bad'} className="h-5 w-5 text-red-600 mx-auto" />}
                              {row.feedback == null && <span className="text-xs text-gray-400 italic">No feedback</span>}
                            </td>
                            <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                              <button
                                  onClick={() => openModal(row)}
                                  title="View Details & Feedback"
                                  className="p-1.5 rounded text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                              >
                                  <LuEye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          </section>
        )}

        {activeTab === 'evaluate' && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold">Model Evaluation Configuration</h2>

              {/* Evaluation Setup */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                   {/* Model Selection */}
                   <div>
                       <label htmlFor="eval-model-selector" className="block text-sm font-medium text-gray-700 mb-1">1. Select Model</label>
                        <Select
                           id="eval-model-selector"
                           value={selectedModel}
                           onChange={setSelectedModel}
                           options={dummyModels}
                           className="react-select-container text-sm"
                           classNamePrefix="react-select"
                           placeholder="Choose a model..."
                           isClearable
                       />
                   </div>

                   {/* Data Source Selection */}
                   <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-l md:pl-6">
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">2. Select Data Source</label>
                           <div className="flex space-x-4">
                               <button 
                                   onClick={() => setSelectedDataSource('benchmark')}
                                   className={`flex-1 inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none ${selectedDataSource === 'benchmark' ? 'bg-indigo-100 text-indigo-700 border-indigo-300 ring-1 ring-indigo-300' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                                >
                                   <LuDatabaseZap className="h-4 w-4 mr-2"/> Benchmark
                               </button>
                               <button 
                                   onClick={() => setSelectedDataSource('custom')}
                                   className={`flex-1 inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none ${selectedDataSource === 'custom' ? 'bg-indigo-100 text-indigo-700 border-indigo-300 ring-1 ring-indigo-300' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <LuFileClock className="h-4 w-4 mr-2"/> Custom Data
                               </button>
                           </div>
                       </div>
                        
                       {/* Conditional Dataset Selector */}
                       <div className="min-h-[60px]"> {/* Ensure space even when hidden */}
                           {selectedDataSource === 'benchmark' && (
                               <div>
                                   <label htmlFor="eval-benchmark-selector" className="block text-sm font-medium text-gray-700 mb-1">Select Benchmark Dataset</label>
                                   <Select
                                       id="eval-benchmark-selector"
                                       value={selectedBenchmark}
                                       onChange={setSelectedBenchmark}
                                       options={dummyBenchmarks}
                                       className="react-select-container text-sm"
                                       classNamePrefix="react-select"
                                       placeholder="Choose benchmark..."
                                       isClearable
                                   />
                               </div>
                           )}
                           {selectedDataSource === 'custom' && (
                               <div>
                                   <label htmlFor="eval-custom-selector" className="block text-sm font-medium text-gray-700 mb-1">Select Custom Dataset</label>
                                   <Select
                                       id="eval-custom-selector"
                                       value={selectedCustomData}
                                       onChange={setSelectedCustomData}
                                       options={dummyCustomDatasets} // Use combined list later
                                       className="react-select-container text-sm"
                                       classNamePrefix="react-select"
                                       placeholder="Choose custom data..."
                                       isClearable
                                   />
                               </div>
                           )}
                       </div>
                   </div>
               </div>

                {/* Run Evaluation Button */}
                <div className="flex justify-center pt-4">
                   <button
                       type="button"
                       onClick={handleRunEvaluation}
                       className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                           isEvaluating || !selectedModel || (selectedDataSource === 'benchmark' && !selectedBenchmark) || (selectedDataSource === 'custom' && !selectedCustomData) ? 'opacity-50 cursor-not-allowed' : ''
                       }`}
                       disabled={isEvaluating || !selectedModel || (selectedDataSource === 'benchmark' && !selectedBenchmark) || (selectedDataSource === 'custom' && !selectedCustomData)}
                   >
                       {isEvaluating ? (
                           <LuLoader className="-ml-1 mr-3 h-5 w-5 animate-spin" aria-hidden="true" />
                       ) : (
                           <LuClipboardCheck className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                       )}
                       {isEvaluating ? 'Evaluating...' : 'Run Evaluation'}
                   </button>
               </div>

              {/* Evaluation Results Placeholder */}
               <div className="mt-8 min-h-[150px]">
                   {isEvaluating && (
                       <div className="flex justify-center items-center p-10 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <LuLoader className="h-8 w-8 text-indigo-600 animate-spin mr-3" />
                          <span className="text-lg font-medium text-gray-700">Running evaluation...</span>
                       </div>
                   )}
                   {!isEvaluating && evaluationResults && (
                       <div className="space-y-6">
                           <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                               <h3 className="text-lg font-semibold mb-3 text-gray-800">Evaluation Summary</h3>
                               <p className="text-sm text-gray-500 mb-4">Model: <strong>{evaluationResults?.model ?? 'N/A'}</strong> | Dataset: <strong>{evaluationResults?.dataset ?? 'N/A'}</strong></p>
                               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                   {evaluationResults?.summaryMetrics && Object.entries(evaluationResults.summaryMetrics).map(([key, metric]) => {
                                       const Icon = metric.icon || LuCircleCheck;
                                       return (
                                           <div key={key} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center space-x-2">
                                                <Icon className="h-5 w-5 text-indigo-600 flex-shrink-0"/>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                                                    <p className="text-lg font-semibold text-gray-800">{metric.value}</p>
                                                </div>
                                            </div>
                                       );
                                   })}
                               </div>
                           </div>

                           <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                              <div className="p-4 flex justify-between items-center border-b border-gray-200">
                                  <h3 className="text-lg font-semibold text-gray-800">Sample Results ({evaluationResults?.sampleData?.length ?? 0} shown)</h3>
                                  <button 
                                      title="Download Sample Results CSV" 
                                      type="button"
                                      onClick={handleDownloadEvalCsv}
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                    >
                                      <LuDownload className="h-4 w-4 mr-1.5"/> Download CSV
                                  </button>
                              </div>
                              <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                      <tr>
                                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Prompt</th>
                                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Model Response</th>
                                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Reference Answer</th>
                                      </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                      {evaluationResults?.sampleData?.map((row) => (
                                          <tr key={row.id} className="hover:bg-gray-50 align-top">
                                              <td className="px-4 py-3 text-sm text-gray-800 font-medium break-words">{row.prompt}</td>
                                              <td className="px-4 py-3 text-sm text-gray-600 break-words">{row.modelResponse}</td>
                                              <td className="px-4 py-3 text-sm text-gray-600 break-words">{row.referenceAnswer}</td>
                                          </tr>
                                      ))}
                                      </tbody>
                                  </table>
                              </div>
                           </div>
                       </div>
                   )}
                    {!isEvaluating && !evaluationResults && (
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 min-h-[150px] flex items-center justify-center text-gray-400 italic">
                            Evaluation results will appear here after running an evaluation.
                        </div>
                    )}
               </div>
            </section>
        )}
      </div>

      {/* Feedback Modal */}
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Generation Details and Feedback"
      >
        {selectedRowForModal && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                 <h2 className="text-xl font-semibold">Details & Feedback (ID: {selectedRowForModal.id})</h2>
                 <button onClick={closeModal} className="p-1 text-gray-500 hover:text-gray-800">
                     <LuX className="h-5 w-5" />
                 </button>
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Prompt</h3>
                <p className="text-sm p-2 bg-gray-50 border border-gray-200 rounded">{selectedRowForModal.prompt}</p>
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Reference Context</h3>
                <p className="text-sm p-2 bg-gray-50 border border-gray-200 rounded max-h-40 overflow-y-auto">{selectedRowForModal.context}</p>
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Reference Answer</h3>
                <p className="text-sm p-2 bg-gray-50 border border-gray-200 rounded">{selectedRowForModal.reference}</p>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Provide Feedback</h3>
                 <div className="flex items-center space-x-3 mb-3">
                    <button
                        onClick={() => setModalFeedbackStatus('up')}
                        title="Good"
                        className={`p-2 rounded flex items-center space-x-1 ${modalFeedbackStatus === 'up' ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : 'text-gray-500 hover:text-green-600 hover:bg-green-50 border'}`}
                    >
                        <LuThumbsUp className="h-4 w-4" /> <span>Good</span>
                    </button>
                    <button
                        onClick={() => setModalFeedbackStatus('down')}
                        title="Bad"
                        className={`p-2 rounded flex items-center space-x-1 ${modalFeedbackStatus === 'down' ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : 'text-gray-500 hover:text-red-600 hover:bg-red-50 border'}`}
                    >
                        <LuThumbsDown className="h-4 w-4" /> <span>Bad</span>
                    </button>
                 </div>
                 <textarea
                    placeholder="Add optional comments..."
                    rows={3}
                    value={modalFeedbackText}
                    onChange={(e) => setModalFeedbackText(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                 />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
                <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleModalSubmit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Submit Feedback
                </button>
            </div>
          </div>
        )}
      </ReactModal>

    </div>
  );
} 