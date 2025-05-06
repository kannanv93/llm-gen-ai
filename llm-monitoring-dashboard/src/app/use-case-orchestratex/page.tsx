'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select, { SingleValue } from 'react-select';
import ReactModal from 'react-modal';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    Connection,
    addEdge,
    Position,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
    LuWorkflow, 
    LuCirclePlus,
    LuSettings2, 
    LuLayoutList, 
    LuLayers, 
    LuCode,
    LuNetwork,
    LuX, 
    LuFileCode,
    LuGithub,
    LuCopy,
    LuPlay,
    LuSave,
    LuPanelLeftOpen,
    LuPanelLeftClose,
    LuCog,
    LuRocket,
    LuGrab
} from 'react-icons/lu';

// Interfaces
interface SelectOption {
    value: string;
    label: string;
}

interface UseCase {
    id: string;
    name: string;
    description: string;
    model: string; // Store model value/id
    createdAt: string;
}

interface UDFMetadata {
    id: string;
    name: string;
    description: string;
    language: 'Python' | 'JavaScript'; // Example languages
    code: string;
    type: 'Metric' | 'Custom';
    source: 'Predefined' | 'Created' | 'Git';
    gitUrl?: string;
    gitPath?: string;
}

// Dummy Data
const dummyModels: SelectOption[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
];

const dummyUseCases: UseCase[] = [
    { id: 'uc-001', name: 'Customer Support Classifier', description: 'Classifies incoming support tickets into categories.', model: 'gpt-4o', createdAt: '2023-10-26' },
    { id: 'uc-002', name: 'Product Description Generator', description: 'Generates descriptions based on product features.', model: 'claude-3-opus', createdAt: '2023-10-27' },
    { id: 'uc-003', name: 'Sentiment Analyzer', description: 'Analyzes sentiment of customer reviews.', model: 'gemini-1.5-pro', createdAt: '2023-10-28' },
];

// Dummy UDF Data (including predefined metrics)
const initialUdfs: UDFMetadata[] = [
    { id: 'udf-metric-acc', name: 'calculate_accuracy', description: 'Calculates accuracy between prediction and reference.', language: 'Python', code: 'def calculate_accuracy(prediction, reference):\n    return 1.0 if prediction == reference else 0.0', type: 'Metric', source: 'Predefined' },
    { id: 'udf-metric-halluc', name: 'detect_hallucination', description: 'Placeholder for hallucination detection logic.', language: 'Python', code: 'def detect_hallucination(response, context):\n    # Complex logic here\n    return False', type: 'Metric', source: 'Predefined' },
    { id: 'udf-metric-toxic', name: 'check_toxicity', description: 'Placeholder for toxicity check.', language: 'Python', code: 'def check_toxicity(text):\n    # Call toxicity model/API\n    return 0.05', type: 'Metric', source: 'Predefined' },
    { id: 'udf-custom-pii', name: 'mask_pii', description: 'Masks potential PII like email addresses.', language: 'Python', code: 'import re\ndef mask_pii(text):\n    return re.sub(r\'\\S+@\\S+\', \'[EMAIL MASKED]\', text)', type: 'Custom', source: 'Created' },
];

// React Flow Initial Nodes/Edges
const initialNodes: Node[] = [
  { id: 'data-ingestion', type: 'input', data: { label: 'Data Ingestion' }, position: { x: 50, y: 100 }, sourcePosition: Position.Right },
  { id: 'ground-truth', type: 'input', data: { label: 'Ground Truth Source' }, position: { x: 50, y: 300 }, sourcePosition: Position.Right },
  { id: 'metric-accuracy', data: { label: 'Accuracy Metric' }, position: { x: 300, y: 50 }, sourcePosition: Position.Right, targetPosition: Position.Left },
  { id: 'metric-precision', data: { label: 'Precision Metric' }, position: { x: 300, y: 125 }, sourcePosition: Position.Right, targetPosition: Position.Left },
  { id: 'metric-relevance', data: { label: 'Relevance Metric' }, position: { x: 300, y: 200 }, sourcePosition: Position.Right, targetPosition: Position.Left },
  { id: 'metric-hallucination', data: { label: 'Hallucination Metric' }, position: { x: 300, y: 275 }, sourcePosition: Position.Right, targetPosition: Position.Left },
  { id: 'metric-toxicity', data: { label: 'Toxicity Metric' }, position: { x: 300, y: 350 }, sourcePosition: Position.Right, targetPosition: Position.Left },
  { id: 'dashboard-data', type: 'output', data: { label: 'Dashboard Data Sink' }, position: { x: 550, y: 200 }, targetPosition: Position.Left },
];

const initialEdges: Edge[] = [
  // Data Ingestion to Metrics
  { id: 'e-di-acc', source: 'data-ingestion', target: 'metric-accuracy', animated: true },
  { id: 'e-di-prec', source: 'data-ingestion', target: 'metric-precision', animated: true },
  { id: 'e-di-rel', source: 'data-ingestion', target: 'metric-relevance', animated: true },
  { id: 'e-di-halluc', source: 'data-ingestion', target: 'metric-hallucination', animated: true },
  { id: 'e-di-toxic', source: 'data-ingestion', target: 'metric-toxicity', animated: true },
  // Ground Truth to Metrics
  { id: 'e-gt-acc', source: 'ground-truth', target: 'metric-accuracy', animated: true },
  { id: 'e-gt-prec', source: 'ground-truth', target: 'metric-precision', animated: true },
  { id: 'e-gt-rel', source: 'ground-truth', target: 'metric-relevance', animated: true },
  // Metrics to Dashboard
  { id: 'e-acc-dash', source: 'metric-accuracy', target: 'dashboard-data' },
  { id: 'e-prec-dash', source: 'metric-precision', target: 'dashboard-data' },
  { id: 'e-rel-dash', source: 'metric-relevance', target: 'dashboard-data' },
  { id: 'e-halluc-dash', source: 'metric-hallucination', target: 'dashboard-data' },
  { id: 'e-toxic-dash', source: 'metric-toxicity', target: 'dashboard-data' },
];

// Modal Styles
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
    width: '90%',
    maxWidth: '700px',
    maxHeight: '85vh',
    overflowY: 'auto' as 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
};

// Counter for new node IDs
let idCounter = 0;
const getId = () => `dndnode_${idCounter++}`;

export default function UseCaseOrchestrateXPage() {
  const [mainTab, setMainTab] = useState<'useCases' | 'orchestrator'>('useCases');
  const [orchestratorTab, setOrchestratorTab] = useState<'udf' | 'pipeline'>('pipeline');
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string | null>(null);
  const [isCreateUseCaseModalOpen, setIsCreateUseCaseModalOpen] = useState(false);
  const [useCases, setUseCases] = useState<UseCase[]>(dummyUseCases);
  const [udfs, setUdfs] = useState<UDFMetadata[]>(initialUdfs);
  
  // Form state for modal
  const [newUseCaseName, setNewUseCaseName] = useState('');
  const [newUseCaseDesc, setNewUseCaseDesc] = useState('');
  const [selectedModelForNew, setSelectedModelForNew] = useState<SingleValue<SelectOption>>(null);

  // UDF state
  const [isAddUdfModalOpen, setIsAddUdfModalOpen] = useState(false);
  const [udfCreationMethod, setUdfCreationMethod] = useState<'create' | 'import' | null>(null);
  const [newUdfName, setNewUdfName] = useState('');
  const [newUdfDesc, setNewUdfDesc] = useState('');
  const [newUdfCode, setNewUdfCode] = useState('def my_custom_udf(input_data):\n    # Your Python code here\n    processed_data = input_data + " processed"\n    return processed_data');
  const [newUdfLanguage, setNewUdfLanguage] = useState<'Python' | 'JavaScript'>('Python');
  const [gitUrl, setGitUrl] = useState('');
  const [gitPath, setGitPath] = useState('');
  const [importUdfName, setImportUdfName] = useState('');
  const [importUdfDesc, setImportUdfDesc] = useState('');

  // React Flow state
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [] // Removed setNodes dependency as it's stable
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [] // Removed setEdges dependency
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [] // Removed setEdges dependency
  );

  useEffect(() => {
    ReactModal.setAppElement('body');
  }, []);

  const openCreateUseCaseModal = () => setIsCreateUseCaseModalOpen(true);
  const closeCreateUseCaseModal = () => {
      setIsCreateUseCaseModalOpen(false);
      setNewUseCaseName('');
      setNewUseCaseDesc('');
      setSelectedModelForNew(null);
  };

  const handleCreateUseCase = (event: React.FormEvent) => {
      event.preventDefault();
      if (!newUseCaseName.trim() || !newUseCaseDesc.trim() || !selectedModelForNew) {
          alert('Please fill in all fields.');
          return;
      }
      const newUseCase: UseCase = {
          id: `uc-${Date.now()}`,
          name: newUseCaseName.trim(),
          description: newUseCaseDesc.trim(),
          model: selectedModelForNew.value,
          createdAt: new Date().toISOString().split('T')[0], // Get YYYY-MM-DD
      };
      setUseCases(prev => [newUseCase, ...prev]); // Add to the top
      console.log('Creating Use Case:', newUseCase);
      closeCreateUseCaseModal();
  };

  const handleConfigureUseCase = (useCaseId: string) => {
      console.log('Configuring Use Case:', useCaseId);
      setSelectedUseCaseId(useCaseId);
      setMainTab('orchestrator');
      setOrchestratorTab('pipeline');
  };

  const openAddUdfModal = () => setIsAddUdfModalOpen(true);
  const closeAddUdfModal = () => {
      setIsAddUdfModalOpen(false);
      setUdfCreationMethod(null);
      setNewUdfName('');
      setNewUdfDesc('');
      setNewUdfCode('def my_custom_udf(input_data):\n    # Your Python code here\n    processed_data = input_data + " processed"\n    return processed_data');
      setGitUrl('');
      setGitPath('');
      setImportUdfName('');
      setImportUdfDesc('');
  };

  const handleCopyCode = () => {
      navigator.clipboard.writeText(newUdfCode).then(() => {
          alert('Code copied to clipboard!');
      }, (err) => {
          alert('Failed to copy code.');
          console.error('Clipboard copy failed: ', err);
      });
  };

  const handleDebugCode = () => {
      console.log('Simulating UDF debug:', { name: newUdfName, code: newUdfCode });
      alert('Debug simulation started (check console). No actual execution.');
  };

  const handleSaveNewUdf = () => {
      if (!newUdfName.trim() || !newUdfDesc.trim() || !newUdfCode.trim()) {
          alert('Please provide a name, description, and code for the UDF.');
          return;
      }
      const newUdf: UDFMetadata = {
          id: `udf-custom-${Date.now()}`,
          name: newUdfName.trim(),
          description: newUdfDesc.trim(),
          language: newUdfLanguage,
          code: newUdfCode,
          type: 'Custom',
          source: 'Created',
      };
      setUdfs(prev => [newUdf, ...prev]);
      console.log('Saving new UDF:', newUdf);
      closeAddUdfModal();
  };

  const handleSaveGitUdf = () => {
       if (!gitUrl.trim() || !gitPath.trim() || !importUdfDesc.trim()) {
          alert('Please provide Git URL, File Path, and Description.');
          return;
      }
       const udfName = importUdfName.trim() || gitPath.split('/').pop() || `udf-git-${Date.now()}`;
       const newUdf: UDFMetadata = {
          id: `udf-git-${Date.now()}`,
          name: udfName,
          description: importUdfDesc.trim(),
          language: 'Python',
          code: `# Imported from ${gitUrl}\n# Path: ${gitPath}\n\n# --- Code from file would be fetched here ---`,
          type: 'Custom',
          source: 'Git',
          gitUrl: gitUrl.trim(),
          gitPath: gitPath.trim(),
      };
      setUdfs(prev => [newUdf, ...prev]);
      console.log('Saving UDF from Git:', newUdf);
      closeAddUdfModal();
  };

  // Find selected Use Case name
  const selectedUseCase = useCases.find(uc => uc.id === selectedUseCaseId);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center">
        <LuWorkflow className="mr-3 h-8 w-8 text-indigo-600"/> Use Case OrchestrateX
      </h1>

      {/* Main Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Main Tabs">
          <button
            onClick={() => setMainTab('useCases')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${mainTab === 'useCases' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <LuLayoutList className="h-5 w-5 mr-2"/> Use Cases
          </button>
          <button
            onClick={() => { setMainTab('orchestrator'); if (!selectedUseCaseId && useCases.length > 0) setSelectedUseCaseId(useCases[0].id) } }
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${mainTab === 'orchestrator' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            disabled={useCases.length === 0}
            title={useCases.length === 0 ? "Create a Use Case first" : "Configure Orchestrator"}
          >
            <LuLayers className="h-5 w-5 mr-2"/> Orchestrator
          </button>
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="mt-6">
          {/* --- Use Cases Tab --- */} 
          {mainTab === 'useCases' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Registered Use Cases</h2>
                    <button
                        onClick={openCreateUseCaseModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <LuCirclePlus className="h-5 w-5 mr-2"/> Create Use Case
                    </button>
                </div>

                {/* Use Cases Table */}
                <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {useCases.length > 0 ? useCases.map((uc) => (
                                <tr key={uc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{uc.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={uc.description}>{uc.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {dummyModels.find(m => m.value === uc.model)?.label || uc.model}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{uc.createdAt}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button 
                                            onClick={() => handleConfigureUseCase(uc.id)}
                                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                        >
                                             <LuSettings2 className="h-4 w-4 mr-1"/> Configure
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 italic">No use cases created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* --- Orchestrator Tab --- */} 
          {mainTab === 'orchestrator' && (
             <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                   Configure Orchestrator for: <span className="text-indigo-700 font-bold">{selectedUseCase?.name || 'Unknown Use Case'}</span>
                </h2>
                 {/* Orchestrator Sub-Tab Navigation */}
                 <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Orchestrator Tabs">
                        <button
                            onClick={() => setOrchestratorTab('udf')}
                            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center ${orchestratorTab === 'udf' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <LuCode className="h-4 w-4 mr-2"/> UDF Studio
                        </button>
                        <button
                            onClick={() => setOrchestratorTab('pipeline')}
                            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center ${orchestratorTab === 'pipeline' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <LuNetwork className="h-4 w-4 mr-2"/> Task Pipeline
                        </button>
                    </nav>
                </div>

                {/* Orchestrator Sub-Tab Content */} 
                <div className="mt-4">
                    {orchestratorTab === 'udf' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-800">User Defined Functions (UDF) Studio</h3>
                                 <button
                                    onClick={openAddUdfModal}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <LuCirclePlus className="h-4 w-4 mr-1.5"/> Add UDF
                                </button>
                            </div>
                            <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                     <tbody className="bg-white divide-y divide-gray-200">
                                        {udfs.length > 0 ? udfs.map((udf) => (
                                            <tr key={udf.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{udf.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={udf.description}>{udf.description}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${udf.type === 'Metric' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                        {udf.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{udf.language}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {udf.source === 'Git' ? (
                                                        <a href={udf.gitUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline" title={udf.gitPath}>{udf.source} <LuGithub className="inline h-3 w-3 ml-0.5"/></a>
                                                    ) : udf.source}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                                    <button title="View/Edit Code (Not Implemented)" className="text-gray-400 cursor-not-allowed p-1 rounded hover:bg-gray-100">
                                                         <LuFileCode className="h-4 w-4"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-10 text-gray-500 italic">No UDFs found. Add one to get started.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                     {orchestratorTab === 'pipeline' && (
                        <ReactFlowProvider>
                             <PipelineBuilder 
                                udfs={udfs} 
                                nodes={nodes} 
                                edges={edges} 
                                onNodesChange={onNodesChange} 
                                onEdgesChange={onEdgesChange} 
                                onConnect={onConnect}
                                setNodes={setNodes}
                            />
                        </ReactFlowProvider>
                    )}
                </div>
             </div>
          )}
      </div>

      {/* Create Use Case Modal */} 
       <ReactModal
        isOpen={isCreateUseCaseModalOpen}
        onRequestClose={closeCreateUseCaseModal}
        style={customModalStyles}
        contentLabel="Create New Use Case"
      >
        <form onSubmit={handleCreateUseCase} className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2 mb-4">
                 <h2 className="text-xl font-semibold">Create New Use Case</h2>
                 <button type="button" onClick={closeCreateUseCaseModal} className="p-1 text-gray-500 hover:text-gray-800">
                     <LuX className="h-5 w-5" />
                 </button>
            </div>

             <div>
                <label htmlFor="ucName" className="block text-sm font-medium text-gray-700">Use Case Name</label>
                <input 
                    type="text" 
                    id="ucName" 
                    value={newUseCaseName}
                    onChange={(e) => setNewUseCaseName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                 <label htmlFor="ucDesc" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    id="ucDesc" 
                    rows={3}
                    value={newUseCaseDesc}
                    onChange={(e) => setNewUseCaseDesc(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

             <div>
                <label htmlFor="ucModel" className="block text-sm font-medium text-gray-700">Primary LLM Model</label>
                <Select
                    id="ucModel"
                    options={dummyModels}
                    value={selectedModelForNew}
                    onChange={(newValue: SingleValue<SelectOption>) => setSelectedModelForNew(newValue)}
                    placeholder="Select model..."
                    className="mt-1 react-select-container text-sm"
                    classNamePrefix="react-select"
                />
            </div>

             <div className="flex justify-end space-x-3 pt-3 border-t mt-5">
                <button 
                    type="button" 
                    onClick={closeCreateUseCaseModal} 
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Create Use Case
                </button>
            </div>
        </form>
      </ReactModal>

       {/* Add UDF Modal */} 
      <ReactModal
        isOpen={isAddUdfModalOpen}
        onRequestClose={closeAddUdfModal}
        style={customModalStyles}
        contentLabel="Add New UDF"
      >
         <div className="flex justify-between items-center border-b pb-2 mb-4">
             <h2 className="text-xl font-semibold">Add New User Defined Function (UDF)</h2>
             <button type="button" onClick={closeAddUdfModal} className="p-1 text-gray-500 hover:text-gray-800">
                 <LuX className="h-5 w-5" />
             </button>
         </div>

        {/* Method Selection */}
        {!udfCreationMethod && (
            <div className="space-y-4 pt-4 text-center">
                <p className="text-gray-600">How would you like to add the UDF?</p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setUdfCreationMethod('create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <LuCode className="h-5 w-5 mr-2"/> Create UDF in Editor
                    </button>
                     <button 
                        onClick={() => setUdfCreationMethod('import')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <LuGithub className="h-5 w-5 mr-2"/> Import from Git
                    </button>
                </div>
            </div>
        )}

        {/* Create UDF Form */} 
        {udfCreationMethod === 'create' && (
            <div className="space-y-4">
                 <div>
                    <label htmlFor="udfName" className="block text-sm font-medium text-gray-700">UDF Name <span className="text-gray-500">(e.g., process_user_query)</span></label>
                    <input 
                        type="text" 
                        id="udfName" 
                        value={newUdfName}
                        onChange={(e) => setNewUdfName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="udfDesc" className="block text-sm font-medium text-gray-700">Description</label>
                    <input 
                        type="text" 
                        id="udfDesc" 
                        value={newUdfDesc}
                        onChange={(e) => setNewUdfDesc(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                 <div>
                     <label htmlFor="udfCode" className="block text-sm font-medium text-gray-700">Python Code</label>
                     <div className="mt-1 border border-gray-300 rounded-md shadow-sm overflow-hidden relative group">
                        <textarea 
                            id="udfCode" 
                            rows={10}
                            value={newUdfCode}
                            onChange={(e) => setNewUdfCode(e.target.value)}
                            className="block w-full border-0 focus:ring-0 sm:text-sm font-mono p-2 resize-none"
                            spellCheck="false"
                        />
                         {/* Editor Actions Overlay */}
                         <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-white/80 p-0.5 rounded">
                            <button type="button" onClick={handleCopyCode} title="Copy Code" className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded">
                                <LuCopy className="h-4 w-4"/>
                            </button>
                             <button type="button" onClick={handleDebugCode} title="Debug (Simulate)" className="p-1 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded">
                                <LuPlay className="h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="flex justify-end space-x-3 pt-3 border-t mt-5">
                    <button 
                        type="button" 
                        onClick={closeAddUdfModal} 
                        className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveNewUdf}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                         <LuSave className="h-4 w-4 mr-2"/> Save UDF
                    </button>
                </div>
            </div>
        )}

        {/* Import from Git Form */} 
        {udfCreationMethod === 'import' && (
             <div className="space-y-4">
                 <div>
                    <label htmlFor="gitUrl" className="block text-sm font-medium text-gray-700">Git Repository URL</label>
                    <input 
                        type="url" 
                        id="gitUrl" 
                        placeholder="https://github.com/user/repo.git"
                        value={gitUrl}
                        onChange={(e) => setGitUrl(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="gitPath" className="block text-sm font-medium text-gray-700">File Path within Repository</label>
                    <input 
                        type="text" 
                        id="gitPath" 
                        placeholder="src/udfs/my_function.py"
                        value={gitPath}
                        onChange={(e) => setGitPath(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="importUdfName" className="block text-sm font-medium text-gray-700">UDF Name <span className="text-gray-500">(Optional, defaults to filename)</span></label>
                    <input 
                        type="text" 
                        id="importUdfName" 
                        value={importUdfName}
                        onChange={(e) => setImportUdfName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                    />
                </div>
                 <div>
                    <label htmlFor="importUdfDesc" className="block text-sm font-medium text-gray-700">Description</label>
                    <input 
                        type="text" 
                        id="importUdfDesc" 
                        value={importUdfDesc}
                        onChange={(e) => setImportUdfDesc(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                 <div className="flex justify-end space-x-3 pt-3 border-t mt-5">
                    <button 
                        type="button" 
                        onClick={closeAddUdfModal} 
                        className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveGitUdf}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                         <LuSave className="h-4 w-4 mr-2"/> Save UDF from Git
                    </button>
                </div>
             </div>
        )}

      </ReactModal>

    </div>
  );
}

// --- Separate component for the pipeline builder UI --- //
// Pass setNodes prop
function PipelineBuilder({ 
    udfs, 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setNodes // Added prop
}: {
    udfs: UDFMetadata[];
    nodes: Node[];
    edges: Edge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>; // Added prop type
}) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();
    const [isNodesPanelOpen, setIsNodesPanelOpen] = useState(true);

    const onDragStart = (event: React.DragEvent, nodeInfo: UDFMetadata) => {
        const nodeJson = JSON.stringify(nodeInfo);
        event.dataTransfer.setData('application/reactflow-udf', nodeJson);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            if (!reactFlowWrapper.current) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const udfJson = event.dataTransfer.getData('application/reactflow-udf');

            if (typeof udfJson === 'undefined' || !udfJson) return;

            const udfData: UDFMetadata = JSON.parse(udfJson);
            const position = screenToFlowPosition({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });
            const newNode: Node = {
                id: getId(),
                type: 'default',
                position,
                data: { label: `${udfData.name} (${udfData.type})` },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            };
            // Use the passed setNodes function to update state in the parent
            setNodes((nds) => nds.concat(newNode));

        },
        [screenToFlowPosition, setNodes] // Added setNodes dependency
    );

     const handleConfigurePipeline = () => {
        alert('Configure Pipeline action (Not Implemented)');
    };
    const handleRunPipeline = () => {
        alert('Run Pipeline action (Not Implemented)');
    };

    return (
        <div className="flex h-[650px]">
            {/* Nodes Panel */}
            <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto ${isNodesPanelOpen ? 'w-64 p-4' : 'w-0 p-0'}`}>
                <h4 className="text-md font-semibold mb-3 text-gray-800 sticky top-0 bg-white pb-2 border-b">Available Nodes</h4>
                {isNodesPanelOpen && (
                    <div className="space-y-2">
                        {udfs.map((udf) => (
                            <div 
                                key={udf.id}
                                className="p-2 border rounded cursor-grab bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 group"
                                onDragStart={(event) => onDragStart(event, udf)}
                                draggable
                            >
                                <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 flex items-center">
                                        {udf.type === 'Metric' ? <LuSettings2 className="h-3 w-3 mr-1.5 text-blue-500"/> : <LuCode className="h-3 w-3 mr-1.5 text-green-500"/>}
                                        {udf.name}
                                        </span>
                                    </div>
                                <p className="text-xs text-gray-500 mt-1 truncate" title={udf.description}>{udf.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* React Flow Wrapper */} 
            <div className="flex-grow relative" ref={reactFlowWrapper}>
                <div className="absolute top-0 left-0 right-0 p-2 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10 flex justify-between items-center">
                    <button 
                        onClick={() => setIsNodesPanelOpen(!isNodesPanelOpen)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                        title={isNodesPanelOpen ? "Close Nodes Panel" : "Open Nodes Panel"}
                        >
                        {isNodesPanelOpen ? <LuPanelLeftClose size={18}/> : <LuPanelLeftOpen size={18}/>}
                    </button>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => alert('Save Pipeline action (Not Implemented)')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                            title="Save Pipeline Layout"
                        >
                            <LuSave className="h-4 w-4 mr-1"/> Save Pipeline
                        </button>
                        <button 
                            onClick={handleRunPipeline}
                            className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
                        >
                                <LuRocket className="h-4 w-4 mr-1"/> Run Pipeline
                        </button>
                    </div>
                </div>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                    attributionPosition="bottom-left"
                    className="absolute inset-0 pt-12"
                >
                    <Controls />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
} 