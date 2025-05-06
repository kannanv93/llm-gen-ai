'use client';

import React, { useState, useCallback } from 'react';
import Modal from '@/components/Modal'; // Import the Modal component
import {
  LuBrainCircuit, // LLM
  LuDatabaseZap, // Vector DB
  LuNetwork,     // Graph DB
  LuPuzzle,      // Other
  LuPlug,        // Connect/Status Icon
  LuCheck,       // Corrected icon
  LuCircleX,     // Corrected icon
  LuTriangleAlert, // Corrected icon
  LuKey, // Icon for API Key
  LuLink, // Icon for Endpoint
  LuDatabase, // Added DB icon for index/db name
  LuUnplug, // Icon for Disconnect
  LuUpload, // Icon for custom upload
  LuFileBox, // Icon for file format
} from 'react-icons/lu';
import { useDropzone } from 'react-dropzone'; // Import dropzone hook

// --- Data Types & Placeholders --- 
type ConnectionStatus = 'connected' | 'disconnected' | 'needs_config' | 'upload_pending'; // Added upload status

interface IntegrationBase {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType; // Icon component
  status: ConnectionStatus;
}

interface LlmIntegration extends IntegrationBase {
  type: 'llm';
  models: string[];
  apiKey?: string; // Store the key after config
  baseUrl?: string; // Optional base URL
}

interface DbIntegration extends IntegrationBase {
  type: 'vector' | 'graph';
  endpoint?: string;
  apiKey?: string; 
  indexName?: string; // e.g., for Pinecone
  databaseName?: string; // e.g., for Neo4j
}

interface OtherIntegration extends IntegrationBase {
  type: 'other';
}

// New type for Custom Model Uploads
interface CustomModelIntegration extends IntegrationBase {
  type: 'custom_model';
  format?: string; // e.g., gguf, safetensors
  filePath?: string; // Path after successful upload (simulated)
  baseModel?: string; // e.g., Llama-3-8B
  // Allow File, null, or undefined for the temporary state
  modelFile?: File | null | undefined; 
}

// Update the main union type
type Integration =
  | LlmIntegration
  | DbIntegration
  | OtherIntegration
  | CustomModelIntegration; 

// Expanded placeholder data
const initialIntegrationsData: Integration[] = [
  // LLMs (Expanded)
  { id: 'openai', name: 'OpenAI', type: 'llm', description: 'Access GPT models like GPT-4o.', icon: LuBrainCircuit, status: 'connected', models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4 Turbo'], apiKey: 'sk-MOCK_KEY_xxxxxx', baseUrl: 'https://api.openai.com/v1' },
  { id: 'azure_openai', name: 'Azure OpenAI / Copilot', type: 'llm', description: 'Use models via Azure infrastructure.', icon: LuBrainCircuit, status: 'disconnected', models: ['GPT-4', 'GPT-3.5-Turbo', 'Embeddings'] }, // Needs more specific config (endpoint, deployment)
  { id: 'google_gemini', name: 'Google Gemini', type: 'llm', description: 'Access Gemini models via Google AI Studio or Vertex AI.', icon: LuBrainCircuit, status: 'needs_config', models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'Gemini 1.0 Pro'] },
  { id: 'anthropic_claude', name: 'Anthropic Claude', type: 'llm', description: 'Access Claude models.', icon: LuBrainCircuit, status: 'disconnected', models: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'] },
  { id: 'cohere', name: 'Cohere', type: 'llm', description: 'Command, Rerank, Embed models.', icon: LuBrainCircuit, status: 'disconnected', models: ['Command R+', 'Command R', 'Command Light', 'Embed v3', 'Rerank v3'] },
  { id: 'mistral', name: 'Mistral AI', type: 'llm', description: 'Access Mistral and Mixtral models.', icon: LuBrainCircuit, status: 'disconnected', models: ['Mistral Large', 'Mistral Small', 'Mistral 7B', 'Mixtral 8x7B', 'Mixtral 8x22B'] },
  { id: 'huggingface_api', name: 'Hugging Face Inference API', type: 'llm', description: 'Access models hosted on Hugging Face.', icon: LuBrainCircuit, status: 'disconnected', models: ['Use any hosted model'] },
  { id: 'ai21', name: 'AI21 Labs Jurassic', type: 'llm', description: 'Jurassic-2 series models.', icon: LuBrainCircuit, status: 'disconnected', models: ['J2-Ultra', 'J2-Mid', 'J2-Light'] },
  // Custom Model Upload (Adding under LLMs for now)
  { id: 'custom_upload', name: 'Custom Model (Upload)', type: 'custom_model', description: 'Upload and use your own GGUF, Safetensors, etc.', icon: LuUpload, status: 'disconnected' },
  // Vector DBs
  { id: 'pinecone', name: 'Pinecone', type: 'vector', description: 'Managed vector database.', icon: LuDatabaseZap, status: 'connected', endpoint: 'https://my-index-abc.pinecone.io', apiKey: 'MOCK_API_KEY_abc123', indexName: 'my-llm-index' },
  { id: 'weaviate', name: 'Weaviate', type: 'vector', description: 'Open-source vector database.', icon: LuDatabaseZap, status: 'disconnected' },
  { id: 'qdrant', name: 'Qdrant', type: 'vector', description: 'High-performance vector similarity search.', icon: LuDatabaseZap, status: 'needs_config' },
  // Graph DBs
  { id: 'neo4j', name: 'Neo4j', type: 'graph', description: 'Native graph database.', icon: LuNetwork, status: 'disconnected', databaseName: 'neo4j' },
  // Other
  { id: 'langfuse', name: 'Langfuse', type: 'other', description: 'Open-source LLM observability.', icon: LuPuzzle, status: 'needs_config' },
];

// --- Helper Components --- 
const StatusIndicator = ({ status }: { status: ConnectionStatus }) => {
  const baseClasses = "text-xs font-medium inline-flex items-center gap-1";
  switch (status) {
    case 'connected':
      return <span className={`${baseClasses} text-green-600`}><LuCheck /> Connected</span>;
    case 'disconnected':
      return <span className={`${baseClasses} text-red-600`}><LuCircleX /> Disconnected</span>;
    case 'needs_config':
      return <span className={`${baseClasses} text-yellow-600`}><LuTriangleAlert /> Needs Configuration</span>;
  }
};

// Enhanced LLM Config Form
interface LlmConfigFormProps {
    onSave: (config: { apiKey: string, baseUrl?: string }) => void; 
    integration: LlmIntegration;
}
const LlmConfigForm = ({ onSave, integration }: LlmConfigFormProps) => {
    const [apiKey, setApiKey] = useState(integration.apiKey || '');
    const [baseUrl, setBaseUrl] = useState(integration.baseUrl || '');
    const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(integration.models)); // Track selected models

    const handleModelToggle = (modelName: string) => {
        setSelectedModels(prev => {
            const newSet = new Set(prev);
            if (newSet.has(modelName)) {
                newSet.delete(modelName);
            } else {
                newSet.add(modelName);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
         e.preventDefault();
         // Note: We are only saving apiKey and baseUrl here for simplicity.
         // A real implementation might save the list of selectedModels too.
         console.log("Selected Models (UI only):", Array.from(selectedModels));
         onSave({ apiKey, baseUrl: baseUrl || undefined }); // Pass undefined if empty
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {/* API Key */}
             <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuKey/> API Key</label>
                <input type="password" id="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Enter your API Key" required />
            </div>
             {/* Base URL (Optional) */}
             <div>
                <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuLink/> Base URL <span className="text-xs text-gray-400">(Optional)</span></label>
                <input type="url" id="baseUrl" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g., https://api.openai.com/v1" />
            </div>
             {/* Model Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Models to Enable:</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md bg-gray-50">
                    {integration.models.map(model => (
                        <label key={model} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                            <input 
                                type="checkbox" 
                                checked={selectedModels.has(model)}
                                onChange={() => handleModelToggle(model)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="text-sm text-gray-700">{model}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                 {integration.status === 'connected' ? 'Save Configuration' : 'Save & Connect'}
            </button>
        </form>
    );
};

// Enhanced DB Config Form Component
interface DbConfigFormProps {
    onSave: (config: Partial<DbIntegration>) => void; 
    integration: DbIntegration;
}
const DbConfigForm = ({ onSave, integration }: DbConfigFormProps) => {
    const [endpoint, setEndpoint] = useState(integration.endpoint || '');
    const [apiKey, setApiKey] = useState(integration.apiKey || '');
    const [indexName, setIndexName] = useState(integration.indexName || '');
    const [dbName, setDbName] = useState(integration.databaseName || '');

     const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const config: Partial<DbIntegration> = { endpoint, apiKey };
        // Add specific fields based on known integration IDs or types if desired
        if (integration.id === 'pinecone') config.indexName = indexName;
        if (integration.id === 'neo4j') config.databaseName = dbName;
        // Or just include all non-empty fields
        // if(indexName) config.indexName = indexName;
        // if(dbName) config.databaseName = dbName;
        onSave(config);
     };

     return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {/* Endpoint */}
             <div>
                <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuLink/> Endpoint URL</label>
                <input type="url" id="endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g., https://my-vector-db.com" required />
             </div>
             {/* API Key */}
              <div>
                <label htmlFor="dbApiKey" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuKey/> API Key / Token <span className="text-xs text-gray-400">(Optional)</span></label>
                <input type="password" id="dbApiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Enter API Key if required" />
             </div>
              {/* Specific Fields based on ID (example) */}
             {integration.id === 'pinecone' && (
                 <div>
                    <label htmlFor="indexName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuDatabase/> Index Name</label>
                    <input type="text" id="indexName" value={indexName} onChange={(e) => setIndexName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g., my-llm-index" required />
                 </div>
             )}
             {integration.id === 'neo4j' && (
                  <div>
                    <label htmlFor="dbName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuDatabase/> Database Name</label>
                    <input type="text" id="dbName" value={dbName} onChange={(e) => setDbName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g., neo4j" />
                 </div>
             )}
             {/* Add other fields like Username/Password if needed */}

            <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {integration.status === 'connected' ? 'Save Configuration' : 'Save & Connect'}
            </button>
        </form>
    );
}

// New Form for Custom Model Upload
interface CustomModelFormProps {
    onSave: (config: Partial<CustomModelIntegration> & { modelFile: File }) => void; // Ensure file is passed
    integration: CustomModelIntegration;
}
const CustomModelForm = ({ onSave, integration }: CustomModelFormProps) => {
    const [baseModel, setBaseModel] = useState(integration.baseModel || '');
    const [format, setFormat] = useState(integration.format || 'gguf');
    const [modelFile, setModelFile] = useState<File | null>(null);

    const onDropModel = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setModelFile(acceptedFiles[0]);
            // Auto-detect format from extension if possible
            const ext = acceptedFiles[0].name.split('.').pop()?.toLowerCase();
            if (ext === 'gguf' || ext === 'safetensors') {
                setFormat(ext);
            }
        }
    }, []);

    const { getRootProps: getModelRootProps, getInputProps: getModelInputProps, isDragActive: isModelDragActive } = useDropzone({
        onDrop: onDropModel,
        accept: {
             // Define accepted model formats
             'application/octet-stream': ['.gguf', '.safetensors'], 
        },
        maxFiles: 1,
        multiple: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modelFile) {
            alert('Please select a model file to upload.');
            return;
        }
        onSave({ baseModel, format, modelFile });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Dropzone */}
            <div
                {...getModelRootProps()}
                className={`px-6 py-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${ 
                    isModelDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <input {...getModelInputProps()} />
                 <LuUpload className="mx-auto h-10 w-10 text-gray-400" />
                 {modelFile ? (
                    <p className="mt-2 text-sm text-green-600">Selected: {modelFile.name}</p>
                 ) : isModelDragActive ? (
                    <p className="mt-2 text-sm text-indigo-600">Drop the model file here ...</p>
                 ) : (
                    <p className="mt-2 text-sm text-gray-600">Drag & drop model file, or click</p>
                 )}
                <p className="text-xs text-gray-500 mt-1">Upload a model file in GGUF or SafeTensors format. We&apos;ll use &quot;Ollama&quot; as the base model (simulated).</p>
            </div>

            {/* Base Model Name */}
             <div>
                <label htmlFor="baseModel" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuBrainCircuit/> Base Model Name <span className="text-xs text-gray-400">(Optional)</span></label>
                <input type="text" id="baseModel" value={baseModel} onChange={(e) => setBaseModel(e.target.value)} className="..." placeholder="e.g., Llama-3-8B, Mistral-7B-Instruct-v0.2" />
            </div>
            {/* Format Selection */}
            <div>
                <label htmlFor="modelFormat" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><LuFileBox/> Model Format</label>
                <select id="modelFormat" value={format} onChange={(e) => setFormat(e.target.value)} className="...">
                   <option value="gguf">GGUF</option>
                   <option value="safetensors">Safetensors</option>
                   <option value="other">Other</option>
                </select>
            </div>

            <button type="submit" disabled={!modelFile} className="w-full ...">
                Upload & Configure
            </button>
        </form>
    );
};

// --- Main Component --- 
export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('llm');
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrationsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null);

  // Filter integrations for the category tabs (LLM, Vector, Graph, Other)
  const categoryIntegrations = integrations.filter(int => {
      if (activeTab === 'llm') return int.type === 'llm' || int.type === 'custom_model';
      if (activeTab === 'vector') return int.type === 'vector';
      if (activeTab === 'graph') return int.type === 'graph';
      if (activeTab === 'other') return int.type === 'other';
      return false;
  });

  // Filter for the Active Connections tab
  const activeConnections = integrations.filter(int => int.status === 'connected');

  const openModal = (integration: Integration) => {
    setCurrentIntegration(integration);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentIntegration(null);
  };

  // Unified save handler
  const handleSaveConfiguration = (configData: Partial<Integration> & { modelFile?: File }) => { 
    if (!currentIntegration) return;

    console.log(`Saving configuration for ${currentIntegration.name}:`, 
        {...configData, modelFile: configData.modelFile ? `[File: ${configData.modelFile.name}]` : undefined }
    );

    const statusUpdate: ConnectionStatus = 'connected';
    
    if (currentIntegration.type === 'custom_model' && configData.modelFile) {
        alert(`Simulating upload for ${configData.modelFile.name}...`);
        // statusUpdate could be set to 'upload_pending' here in a real scenario
    }

    setIntegrations(prevIntegrations => 
        prevIntegrations.map(int => {
            if (int.id === currentIntegration.id) {
                let updatedInt: Integration;
                const baseUpdate = { ...int, status: statusUpdate };

                // Apply specific config fields based on ORIGINAL type
                if (int.type === 'llm') {
                    updatedInt = { 
                        ...baseUpdate, 
                        type: 'llm', // Ensure type is preserved
                        models: int.models,
                        apiKey: (configData as Partial<LlmIntegration>).apiKey, 
                        baseUrl: (configData as Partial<LlmIntegration>).baseUrl 
                    };
                } else if (int.type === 'vector' || int.type === 'graph') {
                    updatedInt = { 
                        ...baseUpdate, 
                        type: int.type, // Preserve vector/graph
                        apiKey: (configData as Partial<DbIntegration>).apiKey, 
                        endpoint: (configData as Partial<DbIntegration>).endpoint, 
                        indexName: (configData as Partial<DbIntegration>).indexName,
                        databaseName: (configData as Partial<DbIntegration>).databaseName
                    } as DbIntegration; // Assert specific DbIntegration type
                } else if (int.type === 'custom_model') {
                     updatedInt = {
                        ...baseUpdate,
                        type: 'custom_model', // Preserve type
                        format: (configData as Partial<CustomModelIntegration>).format,
                        baseModel: (configData as Partial<CustomModelIntegration>).baseModel,
                        // Store simulated path if a file was involved in this save operation
                        filePath: configData.modelFile ? `simulated/path/to/${configData.modelFile.name}` : int.filePath
                     };
                } else { // 'other' type
                    updatedInt = { ...baseUpdate, type: 'other' };
                }
                return updatedInt;
            }
            return int;
        })
    );
    closeModal();
    alert(`${currentIntegration.name} configuration saved & connected (simulated)!`);
  };

  // Modified disconnect handler to accept ID directly
  const handleDirectDisconnect = (integrationId: string) => {
      const integrationToDisconnect = integrations.find(int => int.id === integrationId);
      if (!integrationToDisconnect) return;

      console.log(`Disconnecting ${integrationToDisconnect.name}`);
      setIntegrations(prevIntegrations => 
          prevIntegrations.map(int => { 
              if (int.id === integrationId) {
                  let updatedInt: Integration;
                  // Type-aware field clearing
                  if (int.type === 'llm') updatedInt = { ...int, status: 'disconnected', apiKey: undefined, baseUrl: undefined };
                  else if (int.type === 'vector' || int.type === 'graph') updatedInt = { ...int, status: 'disconnected', apiKey: undefined, endpoint: undefined, indexName: undefined, databaseName: undefined };
                  else if (int.type === 'custom_model') updatedInt = { ...int, status: 'disconnected', filePath: undefined, baseModel: undefined, format: undefined }; 
                  else updatedInt = { ...int, status: 'disconnected' };
                  return updatedInt;
              }
              return int;
          })
      );
      // If the currently open modal was for the disconnected item, close it
      if (currentIntegration?.id === integrationId) {
          closeModal(); 
      }
      alert(`${integrationToDisconnect.name} disconnected (simulated).`);
  };
  
  // Disconnect handler used by the modal (calls the direct one)
  const handleModalDisconnect = () => {
      if (currentIntegration) {
          handleDirectDisconnect(currentIntegration.id);
      }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Integrations</h1>

      {/* Tab Navigation - Added Active Connections */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 flex-wrap" aria-label="Tabs">
          {[ { id: 'active', name: 'Active Connections', icon: LuCheck }, // Use LuCheck here
             { id: 'llm', name: 'LLM Models', icon: LuBrainCircuit },
             { id: 'vector', name: 'Vector Databases', icon: LuDatabaseZap },
             { id: 'graph', name: 'Graph Databases', icon: LuNetwork },
             { id: 'other', name: 'Other', icon: LuPuzzle },
           ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
               {/* Use green color specifically for the active tab's LuCheck icon */}
               <tab.icon className={`h-5 w-5 ${activeTab === 'active' && tab.id === 'active' ? 'text-green-600' : ''}`} /> {tab.name}
               {tab.id === 'active' && <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{activeConnections.length}</span>}
            </button>
           ))}
        </nav>
      </div>

      {/* Tab Content - Integration Cards */}
      {['llm', 'vector', 'graph', 'other'].includes(activeTab) && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {categoryIntegrations.map((integration) => {
                const Icon = integration.icon;
                // Define base card classes
                const baseCardClasses = "p-5 rounded-lg shadow border flex flex-col";
                // Define conditional classes for custom model card
                const customModelCardClasses = integration.type === 'custom_model' 
                    ? "bg-teal-50 border-teal-200 hover:border-teal-300" 
                    : "bg-white border-gray-200 hover:border-gray-300";
                
                return (
                    <div 
                       key={integration.id} 
                       className={`${baseCardClasses} ${customModelCardClasses}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                 {/* Use teal for custom model icon */}
                                <Icon className={`h-8 w-8 ${integration.type === 'custom_model' ? 'text-teal-600' : 'text-indigo-600'} flex-shrink-0`} />
                                <h2 className="text-lg font-semibold text-gray-800">{integration.name}</h2>
                            </div>
                            <StatusIndicator status={integration.status} />
                        </div>
                        <p className="text-sm text-gray-600 mb-4 flex-grow">{integration.description}</p>
                        
                        {/* Specific details based on type */} 
                        {integration.type === 'llm' && integration.models && (
                            <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-500 mb-1">Models:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {integration.models.map(model => (
                                        <span key={model} className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{model}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                         {(integration.type === 'vector' || integration.type === 'graph') && integration.endpoint && (
                            <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-500 mb-1">Endpoint:</h4>
                                <p className="text-xs text-gray-700 bg-gray-50 p-1 rounded truncate">{integration.endpoint}</p>
                             </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                           {/* Updated Button Logic */} 
                           <button 
                              onClick={() => openModal(integration)} 
                              className={`px-3 py-1 border text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center gap-1 ${
                                integration.status === 'connected' 
                                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500' 
                                  : integration.status === 'needs_config' 
                                    ? 'bg-yellow-500 border-transparent text-white hover:bg-yellow-600 focus:ring-yellow-500' 
                                    : 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700 focus:ring-indigo-500'
                              }`}
                           >
                             <LuPlug /> {integration.status === 'connected' ? 'Configure' : integration.status === 'needs_config' ? 'Configure' : 'Connect'}
                           </button>
                        </div>
                    </div>
                )
            })}
            {categoryIntegrations.length === 0 && (
                <p className="text-gray-500 md:col-span-2 lg:col-span-3 text-center py-8">No integrations configured for this category yet.</p>
            )}
          </div>
      )}

      {/* Active Connections Tab Content (Table) */} 
      {activeTab === 'active' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                       <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                          <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                       </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                       {activeConnections.length > 0 ? activeConnections.map((int) => (
                          <tr key={int.id}>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                   <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full ${int.type === 'custom_model' ? 'bg-teal-100' : 'bg-indigo-100'}`}>
                                      <int.icon className={`h-5 w-5 ${int.type === 'custom_model' ? 'text-teal-600' : 'text-indigo-600'}`} aria-hidden="true" />
                                   </div>
                                   <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{int.name}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{int.type.replace('_', ' ')}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {int.type === 'llm' && `Models: ${(int.models || []).join(', ')}`}
                                {int.type === 'vector' && `Endpoint: ${int.endpoint || '-'}`}
                                {int.type === 'graph' && `DB: ${int.databaseName || 'default'}`}
                                {int.type === 'custom_model' && `File: ${int.filePath || 'N/A'}`}
                                {int.type === 'other' && `(Specific details)`}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                 <button 
                                     onClick={() => openModal(int)} 
                                     className="text-indigo-600 hover:text-indigo-900"
                                     title="Configure"
                                >
                                    Configure
                                 </button>
                                 <button 
                                     onClick={() => handleDirectDisconnect(int.id)}
                                     className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                                     title="Disconnect"
                                 >
                                     <LuUnplug className="h-4 w-4" />
                                 </button>
                             </td>
                          </tr>
                       )) : (
                           <tr><td colSpan={4} className="text-center text-gray-500 py-8">No active connections.</td></tr>
                       )}
                    </tbody>
                </table>
             </div>
          </div>
      )}

      {/* Configuration Modal - Updated to include CustomModelForm */}
      {currentIntegration && (
         <Modal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            title={`${currentIntegration.status === 'connected' ? 'Configure' : 'Connect'} ${currentIntegration.name}`}
          >
            {/* Form Content */} 
            <div className="mb-6">
               {currentIntegration.type === 'llm' && (
                  <LlmConfigForm onSave={handleSaveConfiguration} integration={currentIntegration as LlmIntegration}/>
               )}
               {(currentIntegration.type === 'vector' || currentIntegration.type === 'graph') && (
                  <DbConfigForm onSave={handleSaveConfiguration} integration={currentIntegration as DbIntegration}/>
               )}
               {currentIntegration.type === 'custom_model' && ( // Add case for custom model
                  <CustomModelForm onSave={handleSaveConfiguration} integration={currentIntegration as CustomModelIntegration}/>
               )}
               {currentIntegration.type === 'other' && (
                  <p className="text-sm text-gray-600">Configuration options for \"{currentIntegration.name}\" are not yet implemented.</p>
               )}
            </div>
            {/* Modal Footer - Disconnect Button */}
            {currentIntegration.status === 'connected' && (
                <div className="pt-4 border-t border-gray-200 flex justify-end">
                     <button 
                        onClick={handleModalDisconnect}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded shadow-sm text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                    >
                         <LuUnplug className="mr-1.5 h-4 w-4" />
                         Disconnect
                    </button>
                </div>
            )}
         </Modal>
      )}

    </div>
  );
} 