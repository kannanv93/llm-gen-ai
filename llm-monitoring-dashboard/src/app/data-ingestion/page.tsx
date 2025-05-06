'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Select, { GroupBase, StylesConfig } from 'react-select'; // Import types for styles
import {
  LuCloudUpload, LuFile, LuFileText, LuFileSpreadsheet, LuFileJson, LuMessageSquare, LuTrash2, LuX, LuTags, LuDatabase, LuGitBranch,
  LuCheck, LuSquare, LuSendHorizontal, LuFilter, LuList // Icons
} from 'react-icons/lu';

// Define types for uploaded files and dataset types
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  // Metadata added by user
  datasetInfo?: string;
  version?: string;
  datasetType?: string;
  tags?: string[];
  // The actual file object
  file: File;
}

interface SelectOption { value: string; label: string; }

const DATASET_TYPES = ['Ground Truth', 'Training Data', 'Evaluation Data', 'Prompt Library', 'Other'];

// Placeholder for documents list (replace with actual state later)
const initialDocuments: UploadedFile[] = [
  { id: 'doc1', name: 'Customer_Interactions_Q1.pdf', type: 'application/pdf', size: 120456, version: '1.0', datasetType: 'Ground Truth', tags: ['support', 'q1', 'urgent'], file: new File([""], "dummy.pdf") },
  { id: 'doc2', name: 'Product_Reviews.csv', type: 'text/csv', size: 58776, version: '2.1', datasetType: 'Evaluation Data', tags: ['reviews', 'sentiment'], file: new File([""], "dummy.csv") },
  { id: 'doc3', name: 'Internal_KB_v3.txt', type: 'text/plain', size: 98234, version: '3.0', datasetType: 'Ground Truth', tags: ['knowledgebase', 'internal'], file: new File([""], "dummy.txt") },
  { id: 'doc4', name: 'Onboarding_Guide_Internal.pdf', type: 'application/pdf', size: 250123, version: '1.1', datasetType: 'Training Data', tags: ['onboarding', 'internal'], file: new File([""], "dummy.pdf") },
];

// Helper to get file type icon
const FileIcon = ({ fileType }: { fileType: string }) => {
  if (fileType.includes('pdf')) return <LuFileText className="text-red-500 h-5 w-5 flex-shrink-0" />;
  if (fileType.includes('csv') || fileType.includes('spreadsheet')) return <LuFileSpreadsheet className="text-green-500 h-5 w-5 flex-shrink-0" />;
  if (fileType.includes('json')) return <LuFileJson className="text-yellow-500 h-5 w-5 flex-shrink-0" />;
  if (fileType.includes('text') || fileType.includes('plain')) return <LuFileText className="text-blue-500 h-5 w-5 flex-shrink-0" />;
  return <LuFile className="text-gray-500 h-5 w-5 flex-shrink-0" />;
};

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function DataIngestionPage() {
  // Tabs State
  const [activeTab, setActiveTab] = useState('knowledge'); // Default to Knowledge Articles now

  // Upload Tab State
  const [stagedFiles, setStagedFiles] = useState<UploadedFile[]>([]); // Renamed from uploadedFiles
  const [datasetInfo, setDatasetInfo] = useState('');
  const [version, setVersion] = useState('');
  const [datasetType, setDatasetType] = useState(DATASET_TYPES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Knowledge Articles Tab State
  const [allDocs, setAllDocs] = useState<UploadedFile[]>(initialDocuments); // Holds all persistent docs
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<SelectOption[]>([]);

  // Chat Tab State
  const [docsForChat, setDocsForChat] = useState<UploadedFile[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // --- Upload Tab Logic --- 
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      id: `staged-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
    }));
    setStagedFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'], // Older excel
    }
  });

  // Handle tag input and addition
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeStagedFile = (fileId: string) => setStagedFiles(stagedFiles.filter(f => f.id !== fileId));

  const handleUpload = () => {
    // 1. Prepare data for backend (metadata + files)
    const uploadData = stagedFiles.map(f => ({
        ...f,
        datasetInfo,
        version,
        datasetType,
        tags
    }));
    console.log("Processing Uploads:", uploadData.map(f => ({ ...f, file: '[File Object]' })));
    
    // 2. ** TODO: Implement actual API call to upload 'uploadData' **
    // Assume API call is successful for now
    alert('Upload initiated (check console). Implement backend logic here.');

    // 3. On successful upload:
    //    - Add newly uploaded docs to the main `allDocs` state
    //    - Clear the staged files and the form
    setAllDocs(prevDocs => [...prevDocs, ...uploadData]); 
    setStagedFiles([]);
    setDatasetInfo('');
    setVersion('');
    setDatasetType(DATASET_TYPES[0]);
    setTags([]);
    setTagInput('');
    // Optionally, switch to knowledge tab
    // setActiveTab('knowledge'); 
  };

  // --- Knowledge Articles Tab Logic --- 
  // Calculate available tags for filtering dropdown
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allDocs.forEach(doc => doc.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).map(tag => ({ value: tag, label: tag }));
  }, [allDocs]);

  // Filter documents based on selected tags
  const filteredDocs = useMemo(() => {
    if (selectedTagsFilter.length === 0) {
      return allDocs;
    }
    const filterTagValues = selectedTagsFilter.map(t => t.value);
    return allDocs.filter(doc => 
        filterTagValues.every(filterTag => doc.tags?.includes(filterTag))
    );
  }, [allDocs, selectedTagsFilter]);

  const toggleSelection = (docId: string) => {
    setSelectedDocIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(docId)) {
        newSelected.delete(docId);
      } else {
        newSelected.add(docId);
      }
      return newSelected;
    });
  };
  const toggleSelectAll = () => {
    if (selectedDocIds.size === filteredDocs.length && filteredDocs.length > 0) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(filteredDocs.map(doc => doc.id)));
    }
  };

  // Define styles for react-select *before* return statement
  const selectStyles: StylesConfig<SelectOption, true, GroupBase<SelectOption>> = { 
    control: (base) => ({ ...base, borderColor: '#d1d5db', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', '&:hover': { borderColor: '#a5b4fc' } }),
    container: (base) => ({ ...base, fontSize: '0.875rem' }),
    input: (base) => ({ ...base, margin: '0px' }),
    valueContainer: (base) => ({ ...base, padding: '0px 6px'}),
    indicatorsContainer: (base) => ({...base, height: '38px'})
  };

  // --- Chat Tab Logic & Shared Logic --- 
  const startChatWithSelected = () => {
    const selectedDocs = allDocs.filter(doc => selectedDocIds.has(doc.id));
    const chatDocs = selectedDocs.filter(doc => doc.type.includes('pdf') || doc.type.includes('plain'));
    if (chatDocs.length > 0) {
      setDocsForChat(chatDocs);
      setChatMessages([]); // Clear previous chat messages
      setActiveTab('chat');
      setSelectedDocIds(new Set()); // Clear selection after starting chat
    } else {
        alert("Please select at least one compatible document (PDF or TXT) to chat with.")
    }
  };

  const startSingleChat = (doc: UploadedFile) => {
    if (doc.type.includes('pdf') || doc.type.includes('plain')) {
      setDocsForChat([doc]);
      setChatMessages([]); // Clear previous chat messages
      setActiveTab('chat');
      setSelectedDocIds(new Set()); // Clear selection
    } else {
        alert("Chat is only supported for PDF and TXT files.")
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAssistantTyping(true);

    // --- Simulate RAG backend call --- 
    console.log("Simulating RAG query for:", userMessage.text);
    console.log("Context Documents:", docsForChat.map(d => d.name));
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const assistantResponse: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: `Based on (${docsForChat.map(d=>d.name).join(', ') || 'general knowledge'}), the answer to "${userMessage.text.substring(0, 20)}..." might be... [Placeholder RAG Response] `,
      timestamp: new Date(),
    };
    // --- End Simulation ---

    setChatMessages(prev => [...prev, assistantResponse]);
    setIsAssistantTyping(false);
  };
  const handleChatInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render --- 
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Ingestion & Knowledge</h1>

      {/* Tab Navigation */} 
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {/* Upload Data Tab Button */}
          <button
            onClick={() => setActiveTab('upload')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
             <LuCloudUpload className="h-5 w-5"/> Upload Data
          </button>
          {/* Knowledge Articles Tab Button */}
           <button
            onClick={() => setActiveTab('knowledge')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'knowledge'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
             <LuDatabase className="h-5 w-5"/> Knowledge Articles
          </button>
          {/* Chat with Data Tab Button */}
          <button
            onClick={() => setActiveTab('chat')}
            disabled={docsForChat.length === 0} // Disable if no docs selected for chat
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${docsForChat.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}` }
            title={docsForChat.length === 0 ? "Select documents from Knowledge Articles to enable chat" : "Chat with selected documents"}
          >
             <LuMessageSquare className="h-5 w-5"/> Chat with Data
          </button>
        </nav>
      </div>

      {/* Tab Content */} 
      <div>
        {/* Upload Data Tab */} 
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto"> {/* Centered and max-width */} 
            {/* Dropzone */} 
            <div
              {...getRootProps()}
              className={`px-6 py-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-6 ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <LuCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">{isDragActive ? 'Drop files here...' : 'Drag & drop files, or click to select'}</p>
              <p className="mt-1 text-xs text-gray-500">Supports: PDF, TXT, CSV, XLSX</p>
            </div>

            {/* Staged Files & Metadata Form */} 
            {stagedFiles.length > 0 && (
               <div className="space-y-6">
                    {/* Files to be uploaded list */} 
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Files staged for upload:</h3>
                      {stagedFiles.map((f) => (
                        <div key={f.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <div className="flex items-center gap-2 text-sm">
                            <FileIcon fileType={f.type} />
                            <span className="font-medium">{f.name}</span>
                            <span className="text-gray-500">({formatBytes(f.size)})</span>
                          </div>
                          <button onClick={() => removeStagedFile(f.id)} className="text-gray-400 hover:text-red-600">
                            <LuTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Metadata Form */} 
                    <div className="space-y-4 p-4 border rounded-md bg-white">
                      <h3 className="text-lg font-medium mb-3">Dataset Information (for all staged files)</h3>
                       {/* Description Input */}
                       <div> 
                         <label htmlFor="datasetInfo" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                         <textarea id="datasetInfo" rows={3} value={datasetInfo} onChange={(e) => setDatasetInfo(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Brief description of the dataset..." />
                       </div>
                       {/* Version & Type Inputs */}
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LuGitBranch className="mr-1 h-4 w-4 text-gray-500"/> Version</label>
                            <input type="text" id="version" value={version} onChange={(e) => setVersion(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g., 1.0, 2024-Q2" />
                         </div>
                         <div>
                            <label htmlFor="datasetType" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LuDatabase className="mr-1 h-4 w-4 text-gray-500"/> Dataset Type</label>
                            <select id="datasetType" value={datasetType} onChange={(e) => setDatasetType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2">
                                {DATASET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                         </div>
                       </div>
                       {/* Tags Input */}
                       <div> 
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LuTags className="mr-1 h-4 w-4 text-gray-500"/> Tags</label>
                            <div className="flex flex-wrap gap-1 items-center border border-gray-300 rounded-md p-1">
                                {tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-x-0.5 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-indigo-600/20">
                                            <LuX className="h-3.5 w-3.5 text-indigo-600/50 stroke-current group-hover:text-indigo-600/75" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    id="tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                    className="flex-grow border-none focus:ring-0 p-1 text-sm"
                                    placeholder="Add tags (press Enter)..."
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Press Enter or comma to add a tag.</p>
                       </div>
                       {/* Upload Button */}
                      <button onClick={handleUpload} disabled={stagedFiles.length === 0} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        Process Upload ({stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''})
                      </button>
                    </div>
               </div>
            )}
          </div>
        )}

        {/* Knowledge Articles Tab */} 
        {activeTab === 'knowledge' && (
            <div className="space-y-4">
                {/* Filter Controls */} 
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="w-full sm:w-80 z-10"> 
                        <label htmlFor="tagFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LuFilter className="mr-1 h-4"/> Filter by Tags</label>
                        <Select<SelectOption, true>
                            isMulti
                            options={allAvailableTags}
                            value={selectedTagsFilter}
                            onChange={(options) => setSelectedTagsFilter(options ? [...options] : [])}
                            placeholder="Select tags to filter..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={selectStyles}
                        />
                    </div>
                    <button 
                        onClick={startChatWithSelected}
                        disabled={selectedDocIds.size === 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                        title="Chat with selected compatible documents"
                    >
                        <LuMessageSquare className="mr-2 h-5 w-5" />
                        Chat with Selected ({selectedDocIds.size})
                    </button>
                </div>

                {/* Document Table */} 
                 <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                       <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                             <tr>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   <button onClick={toggleSelectAll} className="flex items-center p-1 border border-gray-300 rounded">
                                      {selectedDocIds.size === filteredDocs.length && filteredDocs.length > 0 ?
                                         <LuCheck className="h-3 w-3 text-indigo-600"/> : 
                                         <div className="h-3 w-3"></div> 
                                      }
                                   </button>
                                </th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                <th scope="col" className="relative p-3"><span className="sr-only">Chat</span></th>
                             </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                              <tr key={doc.id} className={`${selectedDocIds.has(doc.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                <td className="p-3 whitespace-nowrap">
                                   <button onClick={() => toggleSelection(doc.id)} className="flex items-center p-1 border border-gray-300 rounded">
                                      {selectedDocIds.has(doc.id) ? 
                                         <LuCheck className="h-3 w-3 text-indigo-600"/> : 
                                         <div className="h-3 w-3"></div> 
                                      }
                                   </button>
                                </td>
                                <td className="p-3 whitespace-nowrap text-sm text-gray-900 min-w-[250px]">
                                    <div className="flex items-center gap-2">
                                       <FileIcon fileType={doc.type} />
                                       <span className="font-medium truncate">{doc.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 whitespace-nowrap text-sm text-gray-500">{doc.version || '-'}</td>
                                <td className="p-3 whitespace-nowrap text-sm text-gray-500">{doc.datasetType || '-'}</td>
                                <td className="p-3 text-sm text-gray-500 min-w-[150px]">
                                   <div className="flex flex-wrap gap-1">
                                     {(doc.tags || []).map(tag => (
                                        <span key={tag} className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{tag}</span>
                                     ))}
                                   </div>
                                </td>
                                <td className="p-3 whitespace-nowrap text-sm text-gray-500">{formatBytes(doc.size)}</td>
                                <td className="p-3 whitespace-nowrap text-right text-sm font-medium">
                                  {(doc.type.includes('pdf') || doc.type.includes('plain')) && (
                                    <button onClick={() => startSingleChat(doc)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100" title="Chat with this document">
                                      <LuMessageSquare className="h-4 w-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )) : (
                               <tr><td colSpan={7} className="text-center text-gray-500 py-8">No documents match the selected filters.</td></tr>
                            )}
                          </tbody>
                        </table>
                     </div>
                 </div>
            </div>
        )}

        {/* Chat with Data Tab */} 
        {activeTab === 'chat' && (
          <div className="flex h-[calc(100vh-200px)] gap-4"> {/* Use flex container */} 
             {/* Left Sidebar: Document Context */} 
             <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
                 <div className="p-3 border-b border-gray-200">
                     <h3 className="text-base font-semibold flex items-center gap-2"><LuList className="h-5 w-5"/> Chat Context</h3>
                 </div>
                 <div className="flex-grow overflow-y-auto p-3 space-y-2">
                     {docsForChat.length > 0 ? docsForChat.map(doc => (
                         <div key={doc.id} className="flex items-start gap-2 p-2 rounded bg-indigo-50 text-xs border border-indigo-100">
                             <FileIcon fileType={doc.type} /> 
                             <span className="flex-1">{doc.name}</span>
                             {/* Add button to remove context? */} 
                         </div>
                     )) : (
                         <p className="text-xs text-gray-500 text-center italic mt-4">No documents selected for chat.</p>
                     )}
                 </div>
             </div>

             {/* Right Side: Chat Interface */} 
             <div className="flex-grow flex flex-col bg-white rounded-lg shadow border border-gray-200">
                {/* Message Display Area */} 
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
                     {chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}> 
                           <div className={`p-3 rounded-lg max-w-xl shadow-sm ${message.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}> 
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                           </div>
                        </div>
                    ))}
                    {/* Typing Indicator */} 
                    {isAssistantTyping && (
                         <div className="flex justify-start">
                             <div className="p-3 rounded-lg bg-gray-100 text-gray-500 italic text-sm shadow-sm">Assistant is typing...</div>
                        </div>
                    )}
                    {/* Initial prompt if no messages */} 
                    {chatMessages.length === 0 && !isAssistantTyping && (
                        <div className="text-center text-gray-400 pt-16 text-sm">
                            Ask a question about the selected document(s).
                        </div>
                    )}
                </div>
                {/* Input Area */} 
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center space-x-3">
                     <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatInputKeyPress} rows={1} className="flex-grow p-2 ..." placeholder="Ask something..." style={{ maxHeight: '100px', overflowY: 'auto' }} />
                     <button onClick={handleSendMessage} disabled={!chatInput.trim() || isAssistantTyping} className="p-2 rounded-md ...">
                       <LuSendHorizontal className="h-5 w-5" />
                     </button>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 