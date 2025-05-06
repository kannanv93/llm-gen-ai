'use client';

import React, { useState, useMemo } from 'react';
import Modal from '@/components/Modal'; // Import Modal
import {
  LuListTree,   // Trace IQ
  LuMessagesSquare, // Chat Intel
  LuComponent,    // Embedding Insights (Placeholder)
  LuBellRing,     // Alert
  LuLayoutDashboard, // Dashboard
  LuSettings2,    // MetricMind (Placeholder)
  LuMoveDiagonal, // DriftLens (Placeholder)
  LuChevronDown,  // Dropdown icon
  LuCircleAlert, // Corrected Icon for Alert
  LuInfo, LuSearch, LuPencil, LuFileText, LuGitBranch, LuMessageCircle, LuUser, LuLoader, LuBrainCircuit, LuArrowRightLeft, LuClock, LuTrendingDown, LuTriangleAlert
} from 'react-icons/lu';
import { addDays } from 'date-fns'; // For default date range
import Plot from 'react-plotly.js'; // Import the Plotly component
import { PlotMouseEvent, Layout } from 'plotly.js'; // Import types
import Select, { MultiValue } from 'react-select'; // Import react-select

// Placeholder data for pipelines
const pipelines = [
  { id: 'pipe-1', name: 'Customer Support Assistant' },
  { id: 'pipe-2', name: 'Product Recommendation Engine' },
  { id: 'pipe-3', name: 'Content Summarization Bot' },
  { id: 'pipe-4', name: 'Internal Knowledge Search' },
];

// Define tabs
const monitoringTabs = [
  { id: 'trace', name: 'Trace IQ', icon: LuListTree },
  { id: 'chat', name: 'Chat Intel', icon: LuMessagesSquare },
  { id: 'embeddings', name: 'Embedding Insights', icon: LuComponent },
  { id: 'drift', name: 'DriftLens', icon: LuMoveDiagonal },
  { id: 'alerts', name: 'Alert', icon: LuBellRing },
  { id: 'dashboard', name: 'Dashboard', icon: LuLayoutDashboard },
  { id: 'metrics', name: 'MetricMind', icon: LuSettings2 },
];

// Dummy Trace Data Structure & Example Data
interface Trace {
  id: string;
  pipelineId: string;
  prompt: string;
  response: string;
  startTime: Date;
  latencyMs: number;
  totalTokens: number;
  evaluationIssues: string[]; // e.g., ['Hallucination', 'Toxicity']
  sessionId: string;
  feedback?: 'good' | 'bad'; // Optional feedback
  spans?: Span[]; // Placeholder for span details
}

interface Span {
    id: string;
    parentId?: string | null; // Added: ID of the parent span
    name: string; 
    startTime: Date; 
    endTime: Date;
    durationMs: number;
    metadata?: Record<string, any>;
    prompt?: string; 
    response?: string;
    observations?: Record<string, any>; 
    justification?: string; 
}

const now = Date.now();

const traceData: Trace[] = [
  // --- Session: session-abc (Longer Chat - 10 turns) ---
  {
    id: 'trace-abc-1', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 600000), latencyMs: 550, totalTokens: 25, evaluationIssues: [], feedback: 'good', prompt: 'What is the capital of France?', response: 'The capital of France is Paris.',
    spans: [{ id: 's-abc-1', parentId: null, name: 'LLM Call', startTime: new Date(now - 600000), endTime: new Date(now - 599450), durationMs: 550, prompt: 'What is the capital of France?', response: 'The capital of France is Paris.', observations: { tokens: 25, cost: 0.00012 } }]
  },
  {
    id: 'trace-abc-2', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 580000), latencyMs: 800, totalTokens: 45, evaluationIssues: [], prompt: 'What is its population?', response: 'The population of Paris is approximately 2.1 million people (city proper) and over 11 million in the metropolitan area.',
    spans: [{ id: 's-abc-2', parentId: null, name: 'LLM Call', startTime: new Date(now - 580000), endTime: new Date(now - 579200), durationMs: 800, prompt: 'What is the population of Paris?', response: 'The population of Paris is approximately 2.1 million people (city proper) and over 11 million in the metropolitan area.', observations: { tokens: 45, cost: 0.00021 } }]
  },
  {
    id: 'trace-abc-3', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 560000), latencyMs: 650, totalTokens: 30, evaluationIssues: [], prompt: 'Any famous landmarks?', response: 'Paris is famous for landmarks like the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and Arc de Triomphe.',
    spans: [{ id: 's-abc-3', parentId: null, name: 'LLM Call', startTime: new Date(now - 560000), endTime: new Date(now - 559350), durationMs: 650, prompt: 'Any famous landmarks in Paris?', response: 'Paris is famous for landmarks like the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and Arc de Triomphe.', observations: { tokens: 30, cost: 0.00015 } }]
  },
    {
    id: 'trace-abc-4', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 540000), latencyMs: 1200, totalTokens: 90, evaluationIssues: ['Hallucination'], prompt: 'Tell me about the birds there.', response: 'Paris has many common city birds like pigeons and sparrows. Large flocks often gather near the Eiffel Tower to watch the tourists.',
    spans: [{ id: 's-abc-4', parentId: null, name: 'LLM Call', startTime: new Date(now - 540000), endTime: new Date(now - 538800), durationMs: 1200, prompt: 'Tell me about the birds there.', response: 'Paris has many common city birds like pigeons and sparrows. Large flocks often gather near the Eiffel Tower to watch the tourists.', observations: { tokens: 90, cost: 0.00040 }, justification: 'Hallucination: While Paris has birds, the claim that flocks gather "to watch the tourists" is anthropomorphic and unfounded.' }]
  },
  {
    id: 'trace-abc-5', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 520000), latencyMs: 400, totalTokens: 15, evaluationIssues: [], prompt: 'Okay, thanks.', response: 'You\'re welcome! Is there anything else?',
    spans: [{ id: 's-abc-5', parentId: null, name: 'LLM Call', startTime: new Date(now - 520000), endTime: new Date(now - 519600), durationMs: 400, prompt: 'Okay, thanks.', response: 'You\'re welcome! Is there anything else?', observations: { tokens: 15, cost: 0.00008 } }]
  },
   {
    id: 'trace-abc-6', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 500000), latencyMs: 900, totalTokens: 55, evaluationIssues: [], prompt: 'What\'s the weather like?', response: 'I cannot provide real-time weather information. Please check a reliable weather source.',
    spans: [{ id: 's-abc-6', parentId: null, name: 'LLM Call (Capability Check)', startTime: new Date(now - 500000), endTime: new Date(now - 499100), durationMs: 900, prompt: 'What\'s the weather like in Paris?', response: 'I cannot provide real-time weather information. Please check a reliable weather source.', observations: { tokens: 55, cost: 0.00025 }, justification: 'Refusal: Model correctly identified inability to provide real-time data.' }]
  },
  {
    id: 'trace-abc-7', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 480000), latencyMs: 500, totalTokens: 20, evaluationIssues: [], prompt: 'How do I get from CDG airport to the city center?', response: 'You can take the RER B train, Roissybus, or a taxi/rideshare from CDG to central Paris.',
    spans: [{ id: 's-abc-7', parentId: null, name: 'LLM Call (General Info)', startTime: new Date(now - 480000), endTime: new Date(now - 479500), durationMs: 500, prompt: 'How do I get from CDG airport to the city center?', response: 'You can take the RER B train, Roissybus, or a taxi/rideshare from CDG to central Paris.', observations: { tokens: 20, cost: 0.00010 } }]
  },
  {
    id: 'trace-abc-8', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 460000), latencyMs: 1100, totalTokens: 70, evaluationIssues: [], prompt: 'Compare the train and the bus.', response: 'The RER B train is usually faster (around 35-40 mins) and cheaper. The Roissybus takes longer (60-75 mins) but goes directly to the Opéra area and might be easier with luggage.',
    spans: [{ id: 's-abc-8', parentId: null, name: 'LLM Call (Comparison)', startTime: new Date(now - 460000), endTime: new Date(now - 458900), durationMs: 1100, prompt: 'Compare the train and the bus from CDG.', response: 'The RER B train is usually faster (around 35-40 mins) and cheaper. The Roissybus takes longer (60-75 mins) but goes directly to the Opéra area and might be easier with luggage.', observations: { tokens: 70, cost: 0.00032 } }]
  },
  {
    id: 'trace-abc-9', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 440000), latencyMs: 350, totalTokens: 10, evaluationIssues: [], prompt: 'Price for the train?', response: 'The RER B ticket price is currently around €11.45.',
    spans: [{ id: 's-abc-9', parentId: null, name: 'LLM Call (Specific Info)', startTime: new Date(now - 440000), endTime: new Date(now - 439650), durationMs: 350, prompt: 'Price for the RER B train from CDG?', response: 'The RER B ticket price is currently around €11.45.', observations: { tokens: 10, cost: 0.00006 } }]
  },
  {
    id: 'trace-abc-10', pipelineId: 'pipe-1', sessionId: 'session-abc', startTime: new Date(now - 420000), latencyMs: 250, totalTokens: 5, evaluationIssues: [], prompt: 'Perfect, thanks!', response: 'My pleasure!',
    spans: [{ id: 's-abc-10', parentId: null, name: 'LLM Call (Closing)', startTime: new Date(now - 420000), endTime: new Date(now - 419750), durationMs: 250, prompt: 'Perfect, thanks!', response: 'My pleasure!', observations: { tokens: 5, cost: 0.00003 } }]
  },
  // --- Session: session-xyz (Shorter Chat - 3 turns) ---
  {
    id: 'trace-xyz-1', pipelineId: 'pipe-4', sessionId: 'session-xyz', startTime: new Date(now - 300000), latencyMs: 950, totalTokens: 60, evaluationIssues: [], prompt: 'How do I reset my VPN password?', response: 'To reset your VPN password, please visit the internal IT portal at internal.example.com/reset.',
    spans: [
      { id: 's-xyz-1p', parentId: null, name: 'KB Q&A', startTime: new Date(now - 300000), endTime: new Date(now - 299050), durationMs: 950 },
      { id: 's-xyz-1a', parentId: 's-xyz-1p', name: 'Knowledge Base Search', startTime: new Date(now - 300000), endTime: new Date(now - 299700), durationMs: 300, metadata: { query: 'reset VPN password', results_found: 1, source: 'KB_Article_45' } },
      { id: 's-xyz-1b', parentId: 's-xyz-1p', name: 'LLM Call', startTime: new Date(now - 299700), endTime: new Date(now - 299050), durationMs: 650, prompt: 'Context: [...] Question: How do I reset my VPN password?', response: 'To reset your VPN password, please visit the internal IT portal at internal.example.com/reset.', observations: { tokens: 60, cost: 0.00030 } }
    ]
  },
  {
    id: 'trace-xyz-2', pipelineId: 'pipe-4', sessionId: 'session-xyz', startTime: new Date(now - 280000), latencyMs: 500, totalTokens: 25, evaluationIssues: [], prompt: 'Is there a phone number for IT support?', response: 'Yes, the IT support phone number is x555-1234.',
    spans: [{ id: 's-xyz-2', parentId: null, name: 'LLM Call', startTime: new Date(now - 280000), endTime: new Date(now - 279500), durationMs: 500, prompt: 'Is there a phone number for IT support?', response: 'Yes, the IT support phone number is x555-1234.', observations: { tokens: 25, cost: 0.00011 } }]
  },
  {
    id: 'trace-xyz-3', pipelineId: 'pipe-4', sessionId: 'session-xyz', startTime: new Date(now - 260000), latencyMs: 1500, totalTokens: 110, evaluationIssues: ['Refusal'], prompt: 'Can you just reset it for me?', response: 'I apologize, but I don\'t have the capability to reset passwords directly for security reasons. Please use the IT portal or call the support number provided.',
    spans: [{ id: 's-xyz-3', parentId: null, name: 'LLM Call', startTime: new Date(now - 260000), endTime: new Date(now - 258500), durationMs: 1500, prompt: 'Can you just reset it for me?', response: 'I apologize, but I don\'t have the capability to reset passwords directly for security reasons. Please use the IT portal or call the support number provided.', observations: { tokens: 110, cost: 0.00048 }, justification: 'Refusal: Model appropriately declined a request outside its capabilities and security scope.' }]
  },
  // --- Other Single-Turn Sessions (Restoring missing Span fields) ---
   {
    id: 'trace-456', pipelineId: 'pipe-2', sessionId: 'session-def', startTime: new Date(now - 7200000), latencyMs: 1200, totalTokens: 85, evaluationIssues: ['Hallucination'], prompt: 'Summarize the attached document about project Nimbus.', response: 'Project Nimbus aims to monitor Large Language Models... uses React Flow.',
    spans: [ 
        { id: 's2_parent', parentId: null, name: 'RAG Pipeline', startTime: new Date(now - 7200000), endTime: new Date(now - 7198800), durationMs: 1200 }, 
        { id: 's2a', parentId: 's2_parent', name: 'Retrieval', startTime: new Date(now - 7200000), endTime: new Date(now - 7199800), durationMs: 200, metadata: { query: 'Project Nimbus summary', chunks_retrieved: 3 } }, 
        { id: 's2b', parentId: 's2_parent', name: 'LLM Call', startTime: new Date(now - 7199800), endTime: new Date(now - 7198800), durationMs: 1000, observations: { tokens: 85, cost: 0.00095 }, justification: 'Hallucination detected...not present in source.' } 
    ]
  },
    {
    id: 'trace-112', pipelineId: 'pipe-2', sessionId: 'session-mno', startTime: new Date(now - 5000000), latencyMs: 1800, totalTokens: 150, evaluationIssues: [], prompt: 'Recommend products based on purchase history.', response: 'Based on hiking boots, recommend socks and backpack.', feedback: 'good',
    spans: [ 
        { id: 's5_parent', parentId: null, name: 'Recommendation Generation', startTime: new Date(now - 5000000), endTime: new Date(now - 4998200), durationMs: 1800 }, 
        { id: 's5a', parentId: 's5_parent', name: 'DB Lookup', startTime: new Date(now - 5000000), endTime: new Date(now - 4999850), durationMs: 150, metadata: { user_id: 'user_123' } }, 
        { id: 's5b', parentId: 's5_parent', name: 'Logic', startTime: new Date(now - 4999850), endTime: new Date(now - 4999800), durationMs: 50, metadata: { strategy: 'collaborative_filtering' } }, 
        { id: 's5c', parentId: 's5_parent', name: 'LLM Call', startTime: new Date(now - 4999800), endTime: new Date(now - 4998200), durationMs: 1600, observations: { tokens: 150 } } 
    ]
  },
    {
    id: 'trace-145', pipelineId: 'pipe-1', sessionId: 'session-stu', startTime: new Date(now - 1200000), latencyMs: 2500, totalTokens: 95, evaluationIssues: [], prompt: 'Order #ORD-998 status?', response: 'Order is out for delivery, expected today 8 PM.',
    spans: [ 
        { id: 's7_parent', parentId: null, name: 'Order Status Check', startTime: new Date(now - 1200000), endTime: new Date(now - 1197500), durationMs: 2500 }, 
        { id: 's7a', parentId: 's7_parent', name: 'Tool Use', startTime: new Date(now - 1200000), endTime: new Date(now - 1199000), durationMs: 1000, metadata: { function_name: 'GetOrderStatus' } }, 
        { id: 's7b', parentId: 's7_parent', name: 'LLM Call', startTime: new Date(now - 1199000), endTime: new Date(now - 1197500), durationMs: 1500, observations: { tokens: 95 } } 
    ]
  },
    {
    id: 'trace-159', pipelineId: 'pipe-3', sessionId: 'session-vwx', startTime: new Date(now - 450000), latencyMs: 700, totalTokens: 30, evaluationIssues: [], prompt: 'Write a poem about clouds.', response: 'White puffs drift high... Soft shadows pass by.', feedback: 'good',
    spans: [ 
        { id: 's8', parentId: null, name: 'LLM Call', startTime: new Date(now - 450000), endTime: new Date(now - 449300), durationMs: 700, observations: { tokens: 30, cost: 0.00014 } } 
    ]
  },
    {
    id: 'trace-172', pipelineId: 'pipe-4', sessionId: 'session-yz0', startTime: new Date(now - 9000000), latencyMs: 1100, totalTokens: 75, evaluationIssues: ['Ambiguity'], prompt: 'Company remote work policy?', response: 'Hybrid work supported. See handbook 4.B or ask manager.',
    spans: [ 
        { id: 's9_parent', parentId: null, name: 'Policy Q&A', startTime: new Date(now - 9000000), endTime: new Date(now - 8998900), durationMs: 1100 }, 
        { id: 's9a', parentId: 's9_parent', name: 'KB Search', startTime: new Date(now - 9000000), endTime: new Date(now - 8999700), durationMs: 300, metadata: { query: 'remote work policy' } }, 
        { id: 's9b', parentId: 's9_parent', name: 'LLM Call', startTime: new Date(now - 8999700), endTime: new Date(now - 8998900), durationMs: 800, observations: { tokens: 75 }, justification: 'Ambiguity: Relies on user checking other sources.' } 
    ]
  },
    {
    id: 'trace-188', pipelineId: 'pipe-1', sessionId: 'session-1a2', startTime: new Date(now - 300000), latencyMs: 450, totalTokens: 28, evaluationIssues: ['Refusal', 'Capability Error'], prompt: 'Book flight to London?', response: 'Cannot book flights. Use travel website.', feedback: 'bad',
    spans: [ 
        { id: 's10', parentId: null, name: 'LLM Call', startTime: new Date(now - 300000), endTime: new Date(now - 299550), durationMs: 450, observations: { tokens: 28 }, justification: 'Capability Error: Cannot perform function.' } 
    ]
  }
];

// --- NEW: Chat Session Data Structures ---
interface ChatMessage {
  id: string; // Corresponds to Trace ID
  timestamp: Date;
  prompt: string;
  response: string;
  latencyMs: number;
  totalTokens: number;
  evaluationIssues: string[];
  cost?: number;
  // Add other relevant trace metrics if needed
}

interface ChatSession {
  sessionId: string;
  pipelineId: string; 
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  totalMessages: number; // Count of traces/messages
  firstPrompt: string;
  lastResponse: string;
  avgLatencyMs: number;
  totalTokens: number;
  totalCost: number;
  avgHallucinationScore: number; // Example metric (0-1, lower is better)
  avgContextRelevancy: number; // Example metric (0-1, higher is better)
  avgAccuracy: number; // Example metric (0-1, higher is better)
  messages: ChatMessage[];
}

// --- Generate Dummy Chat Session Data (from traceData) ---
const generateChatSessionData = (traces: Trace[]): ChatSession[] => {
    const sessions: Record<string, ChatSession> = {};
    const sortedTraces = [...traces].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    sortedTraces.forEach(trace => {
        if (!sessions[trace.sessionId]) {
            sessions[trace.sessionId] = {
                sessionId: trace.sessionId,
                pipelineId: trace.pipelineId, 
                startTime: trace.startTime,
                endTime: trace.startTime, // Will be updated
                durationSeconds: 0,
                totalMessages: 0,
                firstPrompt: trace.prompt,
                lastResponse: trace.response, // Will be updated
                avgLatencyMs: 0,
                totalTokens: 0,
                totalCost: 0,
                avgHallucinationScore: 0, // Placeholder calculation
                avgContextRelevancy: 0, // Placeholder calculation
                avgAccuracy: 0, // Placeholder calculation
                messages: [],
            };
        }

        const session = sessions[trace.sessionId];
        const messageCost = trace.spans?.reduce((sum, span) => sum + (span.observations?.cost ?? 0), 0) ?? 0;
        const hasHallucination = trace.evaluationIssues.includes('Hallucination');
        const currentTotalMessages = session.totalMessages; // Before incrementing

        // Add message
        session.messages.push({
            id: trace.id,
            timestamp: trace.startTime,
            prompt: trace.prompt,
            response: trace.response,
            latencyMs: trace.latencyMs,
            totalTokens: trace.totalTokens,
            evaluationIssues: trace.evaluationIssues,
            cost: messageCost,
        });

        // Update session aggregates
        session.endTime = trace.startTime; // Keep updating to the latest message time
        session.lastResponse = trace.response;
        session.totalMessages += 1;
        session.totalTokens += trace.totalTokens;
        session.totalCost += messageCost;
        // Running averages (simplistic calculation)
        session.avgLatencyMs = ((session.avgLatencyMs * currentTotalMessages) + trace.latencyMs) / session.totalMessages;
        // Example scoring: 1 if hallucination, 0 otherwise. Average this.
        session.avgHallucinationScore = ((session.avgHallucinationScore * currentTotalMessages) + (hasHallucination ? 1 : 0)) / session.totalMessages;
        // Dummy scores for other metrics - replace with real calculations later
        session.avgContextRelevancy = ((session.avgContextRelevancy * currentTotalMessages) + (hasHallucination ? 0.3 : 0.9)) / session.totalMessages;
        session.avgAccuracy = ((session.avgAccuracy * currentTotalMessages) + (hasHallucination ? 0.2 : 0.95)) / session.totalMessages;

    });

    // Calculate durations and finalize
    return Object.values(sessions).map(session => ({
        ...session,
        durationSeconds: Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000),
        avgLatencyMs: Math.round(session.avgLatencyMs),
        totalCost: parseFloat(session.totalCost.toFixed(5)), // Clean up float precision
        avgHallucinationScore: parseFloat(session.avgHallucinationScore.toFixed(2)),
        avgContextRelevancy: parseFloat(session.avgContextRelevancy.toFixed(2)),
        avgAccuracy: parseFloat(session.avgAccuracy.toFixed(2)),
        messages: session.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    }));
};

const chatSessionData = generateChatSessionData(traceData);

// --- NEW: Embedding Point Structure
interface EmbeddingPoint {
    id: string; // Unique ID (e.g., traceId + '-prompt' or docChunkId)
    x: number;
    y: number;
    z: number;
    clusterId: number;
    sourceText: string; // The text that was embedded (prompt, response, doc chunk)
    pipelineId: string;
    evaluationIssues: string[];
    feedback?: 'good' | 'bad';
    timestamp: Date;
    // Add other relevant metadata if needed
}

// NEW: Interface for Cluster Metadata
interface ClusterMetadata {
    name?: string;
    comment?: string;
}

// NEW: Interface for Drift Comparison Result
interface DriftMetricComparison {
    metricName: string;
    unit: string;
    period1Value: number;
    period2Value: number;
    change: number;
    percentChange: number;
    changeType: 'positive' | 'negative' | 'neutral'; // For coloring
    // Lower is better for negative, higher is better for positive
}

// --- NEW: Define Metric Families for MetricMind ---
interface MetricFamilyOption {
    value: string; // Unique ID for the metric family (e.g., 'hallucination')
    label: string; // User-friendly name (e.g., 'Hallucination')
    description?: string; // Optional description
    subMetrics: Array<{ // Array of sub-metrics
        key: string;       // Unique key within the family (e.g., 'vectara_score')
        name: string;      // Display name (e.g., 'Vectara Score')
        unit?: string;     // Optional unit
    }>;
    requiresGroundTruth?: boolean; // Flag if ground truth is needed
}

const metricFamilies: MetricFamilyOption[] = [
    {
        value: 'hallucination', label: 'Hallucination', description: 'Checks for factual inconsistencies or fabricated information.', requiresGroundTruth: true,
        subMetrics: [
            { key: 'vectara_score', name: 'Vectara Score', unit: '' },
            { key: 'deberta_score', name: 'DeBERTa Score', unit: '' },
            { key: 'binary_flag', name: 'Binary Flag', unit: ''}, // Example: Simple Yes/No
        ]
    },
    {
        value: 'pii', label: 'PII Detection', description: 'Identifies Personally Identifiable Information (Names, Emails, etc.).',
        subMetrics: [
            { key: 'detected_types', name: 'Detected Types', unit: '' },
            { key: 'count', name: 'Count', unit: '' },
        ]
    },
    {
        value: 'readability', label: 'Readability', description: 'Assesses the complexity and ease of understanding.',
        subMetrics: [
            { key: 'flesch_score', name: 'Flesch Score', unit: '' },
            { key: 'grade_level', name: 'Grade Level', unit: '' },
        ]
    },
    {
        value: 'summarization', label: 'Summarization Quality', description: 'Evaluates summary relevance and coherence against ground truth.', requiresGroundTruth: true,
        subMetrics: [
            { key: 'rouge_1', name: 'ROUGE-1', unit: '' },
            { key: 'rouge_2', name: 'ROUGE-2', unit: '' },
            { key: 'rouge_l', name: 'ROUGE-L', unit: '' },
        ]
    },
    {
        value: 'toxicity', label: 'Toxicity Detection', description: 'Flags harmful, offensive, or inappropriate language.',
        subMetrics: [
             { key: 'overall_score', name: 'Overall Score', unit: '' },
             { key: 'insult_score', name: 'Insult Score', unit: '' },
             { key: 'threat_score', name: 'Threat Score', unit: '' },
        ]
    },
    // Add more metric families as needed
];

// --- Helper Components --- 

const EvaluationBadge = ({ issues }: { issues: string[] }) => {
    if (issues.length === 0) {
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">No Issues</span>;
    }
    return (
        <span title={issues.join(', ')} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 cursor-help">
           <LuCircleAlert className="mr-1 h-4 w-4"/> {issues.length} Issue{issues.length > 1 ? 's' : ''}
        </span>
    );
};

// NEW: Recursive Span Item Component
interface SpanItemProps {
  span: Span;
  allSpans: Span[];
  level: number;
  selectedSpan: Span | null;
  onSelectSpan: (span: Span) => void;
}

const SpanItem = ({ span, allSpans, level, selectedSpan, onSelectSpan }: SpanItemProps) => {
  const children = allSpans.filter(s => s.parentId === span.id);
  const isSelected = selectedSpan?.id === span.id;

  return (
    <li className="relative">
      {/* Indentation Line (optional visualization) */}
      {level > 0 && (
        <span 
          className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"
          style={{ marginLeft: `${(level -1) * 1.5 + 0.5}rem`}}
        ></span>
      )}
      <div 
        className={`p-1.5 rounded cursor-pointer border relative ${
          isSelected 
            ? 'bg-indigo-100 border-indigo-200' 
            : 'border-transparent hover:bg-gray-50 hover:border-gray-100'
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }} // Indentation
        onClick={(e) => { e.stopPropagation(); onSelectSpan(span); }}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          {/* Icon can be dynamic based on span.name or type later */} 
          <LuGitBranch className="h-4 w-4 text-indigo-600 flex-shrink-0 absolute left-1.5 top-1/2 -translate-y-1/2" style={{ marginLeft: `${(level) * 1.5}rem` }}/>
          <span className="ml-2">{span.name}</span> {/* Added margin to account for icon */}
        </div>
        <div className="text-xs text-gray-500" style={{ paddingLeft: `${level * 1.5 + 1.25}rem` }}>{span.durationMs} ms</div>
      </div>
      {/* Render Children */} 
      {children.length > 0 && (
        <ul className="mt-1">
          {children.map(child => (
            <SpanItem 
              key={child.id}
              span={child}
              allSpans={allSpans}
              level={level + 1}
              selectedSpan={selectedSpan}
              onSelectSpan={onSelectSpan}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// --- Main Component --- 
export default function MonitoringPage() {
  // --- State --- 
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelines[0].id);
  const [activeTab, setActiveTab] = useState(monitoringTabs[0].id);
  // Span Analyzer State
  const [isSpanModalOpen, setIsSpanModalOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  // Chat Intel State
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatSession, setSelectedChatSession] = useState<ChatSession | null>(null);
  const [selectedChatMessageId, setSelectedChatMessageId] = useState<string | null>(null);
  // Embedding Insights State
  const [embeddingDateRange, setEmbeddingDateRange] = useState<any | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [isEmbeddingLoading, setIsEmbeddingLoading] = useState(false);
  const [embeddingPlotData, setEmbeddingPlotData] = useState<EmbeddingPoint[]>([]);
  const [selectedEmbeddingPoint, setSelectedEmbeddingPoint] = useState<EmbeddingPoint | null>(null);
  const [embeddingColorBy, setEmbeddingColorBy] = useState<'clusterId' | 'evaluationIssues' | 'feedback'>('clusterId');
  // NEW: Cluster Interaction State
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [clusterMetadata, setClusterMetadata] = useState<Record<number, ClusterMetadata>>({});
  const [clusterNameInput, setClusterNameInput] = useState('');
  const [clusterCommentInput, setClusterCommentInput] = useState('');
  // NEW: DriftLens State
  const [driftDateRange1, setDriftDateRange1] = useState<any | undefined>({
    from: addDays(new Date(), -14),
    to: addDays(new Date(), -7),
  });
  const [driftDateRange2, setDriftDateRange2] = useState<any | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [isDriftLoading, setIsDriftLoading] = useState(false);
  const [driftComparisonResults, setDriftComparisonResults] = useState<DriftMetricComparison[] | null>(null);

  // --- NEW: Alert State (Updated for comparison type) ---
  const [alertLatencyConfig, setAlertLatencyConfig] = useState<{ value: number | null; comparison: 'above' | 'below' }>({ value: 2000, comparison: 'above' }); // Default to above 2000ms
  const [alertTokenConfig, setAlertTokenConfig] = useState<{ value: number | null; comparison: 'above' | 'below' }>({ value: 100, comparison: 'above' }); // Default to above 100 tokens
  const [alertEvaluationIssues, setAlertEvaluationIssues] = useState<string[]>(['Hallucination', 'Refusal']); // Issues to flag
  const [alertTraces, setAlertTraces] = useState<Trace[]>([]); // Traces breaching thresholds

  // --- NEW: MetricMind State ---
  const [selectedMetricFamilies, setSelectedMetricFamilies] = useState<MultiValue<MetricFamilyOption>>([]);
  const [metricInputSource, setMetricInputSource] = useState<'manual' | 'traces'>('traces'); // Default to using existing traces
  const [manualMetricPrompt, setManualMetricPrompt] = useState<string>('');
  const [manualMetricResponse, setManualMetricResponse] = useState<string>('');
  const [isComputingMetrics, setIsComputingMetrics] = useState<boolean>(false);
  // UPDATED: Structure for results: Array of objects, each with input and a scores object (family -> sub-metric -> score)
  const [metricResultsTableData, setMetricResultsTableData] = useState<Array<{ prompt: string; response: string; scores: Record<string, Record<string, number | string | null>> }>>([]);
  // NEW: Ground Truth State
  const [groundTruthInputType, setGroundTruthInputType] = useState<'text' | 'source'>('text');
  const [groundTruthText, setGroundTruthText] = useState<string>('');
  const [groundTruthSource, setGroundTruthSource] = useState<string>(''); // Placeholder for document/vector DB source

  // --- Derived State & Calculations ---
  const selectedPipelineName = pipelines.find(p => p.id === selectedPipelineId)?.name || 'Select Pipeline';
  const displayedTraces = traceData.filter(t => t.pipelineId === selectedPipelineId);
  const displayedChatSessions = chatSessionData
    .filter(session => session.pipelineId === selectedPipelineId)
    .filter(session => 
        chatSearchTerm === '' ||
        session.sessionId.toLowerCase().includes(chatSearchTerm.toLowerCase()) ||
        session.firstPrompt.toLowerCase().includes(chatSearchTerm.toLowerCase()) ||
        session.lastResponse.toLowerCase().includes(chatSearchTerm.toLowerCase()) ||
        session.messages.some(m => m.prompt.toLowerCase().includes(chatSearchTerm.toLowerCase()) || m.response.toLowerCase().includes(chatSearchTerm.toLowerCase()))
    );

  // --- Functions ---
  // Span Analyzer Functions
  const openSpanAnalyzer = (trace: Trace) => {
      setSelectedTrace(trace);
      setSelectedSpan(null);
      setFeedbackText('');
      setIsSpanModalOpen(true);
  };
  const closeSpanAnalyzer = () => {
      setIsSpanModalOpen(false);
      setSelectedTrace(null);
      setSelectedSpan(null);
      setFeedbackText('');
  }
  const handleFeedbackSubmit = () => {
      if (!selectedTrace) return;
      console.log(`Manual feedback for trace ${selectedTrace.id}: ${feedbackText}`);
      alert(`Feedback submitted for ${selectedTrace.id} (simulated):
"${feedbackText}"`);
      // TODO: Add API call to submit feedback here
      // Optionally close modal or update UI
      // closeSpanAnalyzer(); 
      setFeedbackText(''); // Clear after submit
  }
  // Chat Modal Functions
  const openChatHistoryModal = (session: ChatSession) => {
    setSelectedChatSession(session);
    setSelectedChatMessageId(null); // Reset selected message when opening
    setIsChatModalOpen(true);
  };
  const closeChatHistoryModal = () => {
    setSelectedChatSession(null);
    setSelectedChatMessageId(null);
    setIsChatModalOpen(false);
  };
  const goToTrace = (traceId: string) => {
    // Find the trace and open the span analyzer modal
    const trace = traceData.find(t => t.id === traceId);
    if (trace) {
        // Close chat modal first if open
        if (isChatModalOpen) closeChatHistoryModal();
        // Switch to trace tab and open span analyzer
        setActiveTab('trace');
        openSpanAnalyzer(trace);
    } else {
        alert('Trace details not found.');
    }
  };
  // Embedding Insights Functions
  const handleComputeVizEmbeddings = () => {
    if (!embeddingDateRange?.from || !embeddingDateRange?.to) {
        alert('Please select a valid date range.');
        return;
    }
    // Ensure end date is not before start date
    if (embeddingDateRange.to < embeddingDateRange.from) {
        alert('End date cannot be before start date.');
        return;
    }

    console.log(`Simulating UMAP computation for prompts between: ${embeddingDateRange.from.toISOString()} - ${embeddingDateRange.to.toISOString()}`);
    setIsEmbeddingLoading(true);
    setEmbeddingPlotData([]);
    setSelectedEmbeddingPoint(null);
    setSelectedClusterId(null); // Reset selected cluster on new compute
    setClusterMetadata({}); // Reset metadata on new compute (or load saved metadata later)
    setClusterNameInput('');
    setClusterCommentInput('');

    setTimeout(() => {
        const dummyData: EmbeddingPoint[] = [];
        const numPoints = 150;
        const numClusters = 5;
        const evalIssuesOptions = [[], ['Hallucination'], ['Refusal'], ['Toxicity'], [] ,[]];
        const feedbackOptions: (('good' | 'bad' | undefined))[] = ['good', 'bad', undefined, undefined, 'good'];
        // Get actual prompts from traceData within the date range
        const relevantPrompts = traceData
            .filter(t => t.startTime >= embeddingDateRange.from && t.startTime <= embeddingDateRange.to)
            .map(t => ({ id: t.id, prompt: t.prompt, pipelineId: t.pipelineId, evaluationIssues: t.evaluationIssues, feedback: t.feedback, timestamp: t.startTime }));

        console.log(`Found ${relevantPrompts.length} relevant prompts for embedding simulation.`);

        for (let i = 0; i < numPoints; i++) {
            // Use relevant prompts if available, otherwise generate generic text
            const sourceInfo = relevantPrompts.length > 0 ? relevantPrompts[i % relevantPrompts.length] : null;

            const clusterId = Math.floor(Math.random() * numClusters);
            const timestamp = sourceInfo?.timestamp || new Date(embeddingDateRange.from!.getTime() + Math.random() * (embeddingDateRange.to!.getTime() - embeddingDateRange.from!.getTime()));

            // Generate points somewhat clustered
            const clusterCenterX = (clusterId - numClusters / 2) * 3;
            const clusterCenterY = (clusterId % 2 === 0 ? 1 : -1) * (numClusters / 2 - Math.abs(clusterId - numClusters / 2)) * 3;
            const clusterCenterZ = Math.sin(clusterId * Math.PI / numClusters) * 5;

            dummyData.push({
                id: sourceInfo ? `${sourceInfo.id}-prompt` : `emb-${i}`,
                x: clusterCenterX + (Math.random() - 0.5) * 3,
                y: clusterCenterY + (Math.random() - 0.5) * 3,
                z: clusterCenterZ + (Math.random() - 0.5) * 3,
                clusterId: clusterId,
                sourceText: sourceInfo?.prompt || `Generic example text ${i}.`, 
                pipelineId: sourceInfo?.pipelineId || `pipe-${i%4+1}`,
                evaluationIssues: sourceInfo?.evaluationIssues || evalIssuesOptions[i % evalIssuesOptions.length],
                feedback: sourceInfo?.feedback || feedbackOptions[i % feedbackOptions.length],
                timestamp: timestamp,
            });
        }
        setEmbeddingPlotData(dummyData);
        setIsEmbeddingLoading(false);
        console.log('Dummy embedding data generated based on prompts (if available).');
    }, 2500);
  };

  const getEmbeddingPointColor = (point: EmbeddingPoint): string => {
      switch (embeddingColorBy) {
        case 'evaluationIssues':
          return point.evaluationIssues.length > 0 ? '#DC2626' : '#16A34A';
        case 'feedback':
          if (point.feedback === 'good') return '#22C55E';
          if (point.feedback === 'bad') return '#EF4444';
          return '#9CA3AF';
        case 'clusterId':
        default:
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#6366F1', '#F43F5E']; // Added more colors
            return colors[point.clusterId % colors.length];
      }
  };

  // NEW: Handle selecting a cluster (e.g., from plot click)
  const handleSelectCluster = (clusterId: number | null) => {
    setSelectedClusterId(clusterId);
    if (clusterId !== null) {
        // Pre-fill inputs if metadata exists
        const metadata = clusterMetadata[clusterId];
        setClusterNameInput(metadata?.name || '');
        setClusterCommentInput(metadata?.comment || '');
    } else {
        setClusterNameInput('');
        setClusterCommentInput('');
    }
  };

  // NEW: Handle saving cluster metadata
  const handleSaveClusterMetadata = () => {
      if (selectedClusterId === null) return;
      setClusterMetadata(prev => ({
          ...prev,
          [selectedClusterId]: {
              name: clusterNameInput.trim() || undefined, // Store undefined if empty
              comment: clusterCommentInput.trim() || undefined, // Store undefined if empty
          }
      }));
      alert(`Metadata saved for Cluster ${selectedClusterId}`);
      // Potentially trigger plot re-render if cluster names affect labels/tooltips
  };

  // --- NEW: DriftLens Functions (Updated) ---
  const calculatePeriodMetrics = (range: any): Record<string, number> => {
      if (!range?.from || !range?.to) return {};
      // Ensure dates are valid Date objects
      const fromDate = range.from instanceof Date ? range.from : new Date(range.from);
      const toDate = range.to instanceof Date ? range.to : new Date(range.to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return {};

      const filteredTraces = traceData.filter(t => t.startTime >= fromDate && t.startTime <= toDate);
      const totalTraces = filteredTraces.length;

      // Initialize with small base values + random element to avoid zeros and make it look dynamic
      let totalLatency = Math.random() * 50;
      let hallucinationCount = Math.random() > 0.9 ? 1 : 0;
      let totalCost = Math.random() * 0.01;
      let totalTokens = Math.random() * 100;
      let refusalCount = Math.random() > 0.95 ? 1 : 0;
      let feedbackGoodCount = Math.random() > 0.5 ? 1 : 0;
      let feedbackBadCount = Math.random() > 0.8 ? 1 : 0;
      let toolUseCount = Math.random() > 0.7 ? 1 : 0;

      filteredTraces.forEach(trace => {
          totalLatency += trace.latencyMs;
          if (trace.evaluationIssues.includes('Hallucination')) hallucinationCount++;
          if (trace.evaluationIssues.includes('Refusal')) refusalCount++;
          totalTokens += trace.totalTokens;
          totalCost += trace.spans?.reduce((sum, span) => sum + (span.observations?.cost ?? 0), 0) ?? 0;
          if (trace.feedback === 'good') feedbackGoodCount++;
          if (trace.feedback === 'bad') feedbackBadCount++;
          // Simple check for tool use based on span names (example)
          if (trace.spans?.some(s => s.name.toLowerCase().includes('tool') || s.name.toLowerCase().includes('search') || s.name.toLowerCase().includes('db')) ){
             toolUseCount++;
          }
      });

      const feedbackTotal = feedbackGoodCount + feedbackBadCount;

      const metrics = {
          totalTraces: totalTraces,
          avgLatency: (totalLatency / totalTraces) + (Math.random() - 0.5) * 10, // Keep noise for real data
          hallucinationRate: (hallucinationCount / totalTraces) * 100 + (Math.random() * 2),
          avgCost: (totalCost / totalTraces) + (Math.random() * 0.0001),
          avgTokens: (totalTokens / totalTraces) + (Math.random() - 0.5) * 5,
          refusalRate: (refusalCount / totalTraces) * 100 + (Math.random()),
          feedbackScore: feedbackTotal > 0 ? ((feedbackGoodCount - feedbackBadCount) / feedbackTotal) * 100 : 0 + (Math.random() - 0.5) * 5,
          toolUseRate: (toolUseCount / totalTraces) * 100 + (Math.random() * 3)
      };

      // --- START: Add baseline if no traces found --- 
      if (totalTraces === 0) {
          console.log("No traces found for period, generating baseline metrics.");
          return {
              totalTraces: 0,
              avgLatency: 600 + (Math.random() - 0.5) * 150, // Baseline avg latency around 600ms
              hallucinationRate: 5 + (Math.random() - 0.5) * 4,    // Baseline hallucination around 5%
              avgCost: 0.00025 + (Math.random() - 0.5) * 0.0001, // Baseline cost
              avgTokens: 50 + (Math.random() - 0.5) * 20,      // Baseline tokens
              refusalRate: 2 + (Math.random() - 0.5) * 1.5,       // Baseline refusal rate
              feedbackScore: 40 + (Math.random() - 0.5) * 30,    // Baseline feedback score (slightly positive)
              toolUseRate: 15 + (Math.random() - 0.5) * 10      // Baseline tool usage
          };
      } 
      // --- END: Add baseline if no traces found ---

      return metrics;
  };

  const handleCompareDrift = () => {
      // ... (existing date validation) ...

      console.log('Calculating drift comparison...');
      setIsDriftLoading(true);
      setDriftComparisonResults(null);

      // Simulate calculation delay
      setTimeout(() => {
          const metrics1 = calculatePeriodMetrics(driftDateRange1);
          const metrics2 = calculatePeriodMetrics(driftDateRange2);

          const comparison: DriftMetricComparison[] = [];
          const metricsToCompare: { key: keyof typeof metrics1; name: string; unit: string; lowerIsBetter: boolean }[] = [
              { key: 'avgLatency', name: 'Avg. Latency', unit: 'ms', lowerIsBetter: true },
              { key: 'hallucinationRate', name: 'Hallucination Rate', unit: '%', lowerIsBetter: true },
              { key: 'avgCost', name: 'Avg. Cost', unit: '$', lowerIsBetter: true },
              { key: 'avgTokens', name: 'Avg. Tokens', unit: '', lowerIsBetter: false }, // Neutral? Or lower better?
              { key: 'refusalRate', name: 'Refusal Rate', unit: '%', lowerIsBetter: true },
              { key: 'feedbackScore', name: 'Feedback Score', unit: 'pts', lowerIsBetter: false }, // Higher is better
              { key: 'toolUseRate', name: 'Tool Usage Rate', unit: '%', lowerIsBetter: false }, // Context dependent
              { key: 'totalTraces', name: 'Total Traces', unit: '', lowerIsBetter: false } // Higher is usually better (more usage)
          ];

          metricsToCompare.forEach(({ key, name, unit, lowerIsBetter }) => {
              const val1 = metrics1[key];
              const val2 = metrics2[key];
              const change = val2 - val1;
              // Avoid division by zero for percentage change
              const pctChange = (val1 !== 0) ? (change / Math.abs(val1)) * 100 : (val2 !== 0 ? Infinity : 0);
              
              let changeType: 'positive' | 'negative' | 'neutral' = 'neutral';
              if (change !== 0) {
                 if (lowerIsBetter) {
                     changeType = change < 0 ? 'positive' : 'negative';
                 } else {
                      changeType = change > 0 ? 'positive' : 'negative';
                 }
              }

              comparison.push({
                  metricName: name,
                  unit: unit,
                  period1Value: val1,
                  period2Value: val2,
                  change: change,
                  percentChange: pctChange,
                  changeType: changeType,
              });
          });

          setDriftComparisonResults(comparison);
          setIsDriftLoading(false);
          console.log('Drift comparison calculated.');

      }, 1500); // Simulate 1.5 second calculation
  };

  // --- NEW: Alert Filtering Logic (Updated for comparison type) ---
  const filterAlertTraces = () => {
      if (!traceData) return;

      const breachingTraces = traceData.filter(trace => {
         // Check Latency
         if (alertLatencyConfig.value !== null) {
             const conditionMet = alertLatencyConfig.comparison === 'above'
                 ? trace.latencyMs > alertLatencyConfig.value
                 : trace.latencyMs < alertLatencyConfig.value;
             if (conditionMet) return true;
         }
         // Check Token Count
         if (alertTokenConfig.value !== null) {
              const conditionMet = alertTokenConfig.comparison === 'above'
                  ? trace.totalTokens > alertTokenConfig.value
                  : trace.totalTokens < alertTokenConfig.value;
              if (conditionMet) return true;
         }
         // Check Evaluation Issues (any match)
         if (alertEvaluationIssues.length > 0 && trace.evaluationIssues.some(issue => alertEvaluationIssues.includes(issue))) {
             return true;
         }

         return false; // No threshold breached
      });
      setAlertTraces(breachingTraces);
      console.log(`Filtered ${breachingTraces.length} alert traces based on thresholds.`);
  };

  // --- NEW: Calculate Pipeline Dashboard Metrics ---
  const pipelineDashboardMetrics = React.useMemo(() => {
      const tracesForPipeline = traceData.filter(t => t.pipelineId === selectedPipelineId);
      const sessionsForPipeline = chatSessionData.filter(s => s.pipelineId === selectedPipelineId);
      const totalTraces = tracesForPipeline.length;
      if (totalTraces === 0) {
          return {
              avgLatency: 0,
              totalTraces: 0,
              totalCost: 0,
              hallucinationRate: 0,
              refusalRate: 0,
              totalSessions: 0,
              avgTokens: 0,
              // Initialize other metrics to zero or default state
          };
      }

      const totalLatency = tracesForPipeline.reduce((sum, trace) => sum + trace.latencyMs, 0);
      const totalTokens = tracesForPipeline.reduce((sum, trace) => sum + trace.totalTokens, 0);
      const totalCost = sessionsForPipeline.reduce((sum, session) => sum + session.totalCost, 0); // Use pre-calculated session cost
      const hallucinationCount = tracesForPipeline.filter(t => t.evaluationIssues.includes('Hallucination')).length;
      const refusalCount = tracesForPipeline.filter(t => t.evaluationIssues.includes('Refusal')).length;

      return {
          avgLatency: Math.round(totalLatency / totalTraces),
          totalTraces: totalTraces,
          totalCost: parseFloat(totalCost.toFixed(5)),
          hallucinationRate: parseFloat(((hallucinationCount / totalTraces) * 100).toFixed(1)),
          refusalRate: parseFloat(((refusalCount / totalTraces) * 100).toFixed(1)),
          totalSessions: sessionsForPipeline.length,
          avgTokens: Math.round(totalTokens / totalTraces),
          // Add more derived metrics here
      };

  }, [selectedPipelineId, traceData, chatSessionData]);

  // --- NEW: Prepare Time-Series Data for Pipeline Dashboard Charts ---
  const pipelineChartData = React.useMemo(() => {
      const tracesForPipeline = traceData.filter(t => t.pipelineId === selectedPipelineId);
      if (tracesForPipeline.length === 0) {
          return { dailyLatency: [], dailyCounts: [], dailyHallucinations: [] };
      }

      // Group traces by date (YYYY-MM-DD)
      const tracesByDate: Record<string, Trace[]> = {};
      tracesForPipeline.forEach(trace => {
          const dateStr = trace.startTime.toISOString().split('T')[0];
          if (!tracesByDate[dateStr]) {
              tracesByDate[dateStr] = [];
          }
          tracesByDate[dateStr].push(trace);
      });

      const sortedDates = Object.keys(tracesByDate).sort();

      const dailyLatency: { date: string; avgLatency: number }[] = [];
      const dailyCounts: { date: string; count: number }[] = [];
      const dailyHallucinations: { date: string; rate: number }[] = [];

      sortedDates.forEach(date => {
          const traces = tracesByDate[date];
          const count = traces.length;
          const totalLatency = traces.reduce((sum, t) => sum + t.latencyMs, 0);
          const hallucinationCount = traces.filter(t => t.evaluationIssues.includes('Hallucination')).length;

          dailyLatency.push({ date, avgLatency: Math.round(totalLatency / count) });
          dailyCounts.push({ date, count });
          dailyHallucinations.push({ date, rate: parseFloat(((hallucinationCount / count) * 100).toFixed(1)) });
      });

      return { dailyLatency, dailyCounts, dailyHallucinations };

  }, [selectedPipelineId, traceData]);

  // --- NEW: MetricMind Computation Logic (Simulated & Updated) ---
  const handleComputeMetrics = () => {
      // Check if ground truth is required but not provided
      const requiresGt = selectedMetricFamilies.some(f => f.requiresGroundTruth);
      if (requiresGt && groundTruthInputType === 'text' && !groundTruthText.trim()) {
           alert('Some selected metrics require Ground Truth text. Please provide it or choose a source.');
           return;
      }
       if (requiresGt && groundTruthInputType === 'source' && !groundTruthSource.trim()) {
           alert('Some selected metrics require a Ground Truth source. Please select one (simulation).');
           return; // In real implementation, might check connection/selection
      }
       if (selectedMetricFamilies.length === 0) {
           alert('Please select at least one metric family to compute.');
           return;
       }


      setIsComputingMetrics(true);
      setMetricResultsTableData([]); // Clear previous results
      console.log(`Simulating metric computation for families: ${selectedMetricFamilies.map(f => f.label).join(', ')}`);
      if (requiresGt) {
           console.log(`Using Ground Truth (${groundTruthInputType}): ${groundTruthInputType === 'text' ? groundTruthText.substring(0, 50)+'...' : groundTruthSource}`);
      }

      let inputData: Array<{ prompt: string; response: string }> = [];

      if (metricInputSource === 'manual') {
          if (!manualMetricPrompt.trim()) {
              alert('Please enter a prompt for manual evaluation.');
              setIsComputingMetrics(false);
              return;
          }
          // Use manual prompt and response (even if response is empty)
          inputData.push({ prompt: manualMetricPrompt, response: manualMetricResponse });
      } else {
          // Use existing traces for the selected pipeline
          inputData = displayedTraces.map(trace => ({ prompt: trace.prompt, response: trace.response }));
          if (inputData.length === 0) {
               alert(`No trace data available for pipeline '${selectedPipelineName}' to compute metrics.`);
               setIsComputingMetrics(false);
               return;
          }
          // Limit computation for demo purposes if too many traces
          if (inputData.length > 20) {
            console.log(`Limiting computation to the first 20 traces out of ${inputData.length}.`);
            inputData = inputData.slice(0, 20);
          }
      }

      // Simulate API call and processing delay
      setTimeout(() => {
          const results: Array<{ prompt: string; response: string; scores: Record<string, Record<string, number | string | null>> }> = [];

          inputData.forEach(item => {
              const computedScoresByFamily: Record<string, Record<string, number | string | null>> = {};

              selectedMetricFamilies.forEach(family => {
                 const familyScores: Record<string, number | string | null> = {};

                 // Simulate ground truth usage message
                 if (family.requiresGroundTruth) {
                    console.log(` > Simulating using ground truth for ${family.label} on prompt: "${item.prompt.substring(0,30)}..."`)
                 }

                 family.subMetrics.forEach(subMetric => {
                      // --- Dummy Score Generation for Sub-Metrics ---
                      let score: number | string | null = null;
                      // Simple simulation based on family and sub-metric key
                      switch (family.value) {
                          case 'hallucination':
                              if (subMetric.key === 'binary_flag') score = Math.random() > 0.8 ? 'Yes' : 'No';
                              else score = parseFloat(Math.random().toFixed(2)); // 0-1 score for others
                              break;
                          case 'pii':
                              if (subMetric.key === 'detected_types') score = Math.random() > 0.7 ? 'EMAIL, PHONE' : (Math.random() > 0.4 ? 'NAME' : 'None');
                              else score = Math.floor(Math.random() * 3); // Count
                              break;
                          case 'readability':
                              if (subMetric.key === 'flesch_score') score = Math.floor(Math.random() * 50 + 50);
                              else score = parseFloat((8 + Math.random() * 4).toFixed(1)); // Grade level
                              break;
                           case 'summarization':
                               score = parseFloat((0.4 + Math.random() * 0.4).toFixed(2)); // ROUGE scores
                               break;
                          case 'toxicity':
                              score = parseFloat((Math.random() * 0.2).toFixed(2)); // Low toxicity scores
                              break;
                          default: score = null; // Unknown metric
                      }
                      familyScores[subMetric.key] = score;
                 });
                  computedScoresByFamily[family.value] = familyScores;
              });
              results.push({ prompt: item.prompt, response: item.response, scores: computedScoresByFamily });
          });

          setMetricResultsTableData(results);
          setIsComputingMetrics(false);
          console.log('Metric computation simulation finished.');
      }, 1800); // Simulate ~1.8 second delay
  };

  // Recalculate alerts when thresholds change or pipeline changes
  // Using useEffect to automatically trigger filtering
  React.useEffect(() => {
    filterAlertTraces();
  }, [selectedPipelineId, alertLatencyConfig, alertTokenConfig, alertEvaluationIssues, traceData]); // Updated dependencies

  // --- Tab Content Rendering Function ---
  const renderTabContent = () => {
    // Simplified conditional rendering
    if (activeTab === 'trace') {
        return (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                         <tr>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trace ID</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interaction</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluation</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                         {displayedTraces.map((trace) => (
                             <tr key={trace.id} onClick={() => openSpanAnalyzer(trace)} className="hover:bg-gray-50 cursor-pointer">
                                 <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">{trace.id}</td>
                                 <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                     <div className="truncate" title={trace.prompt}><span className="font-medium">P:</span> {trace.prompt}</div>
                                     <div className="truncate text-gray-600" title={trace.response}><span className="font-medium">R:</span> {trace.response}</div>
                                 </td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{trace.startTime.toLocaleString()}</td>
                                 <td className={`px-4 py-3 whitespace-nowrap text-sm ${alertLatencyConfig.value !== null && alertLatencyConfig.comparison === 'above' ? 'text-red-600 font-bold' : (alertLatencyConfig.value !== null && alertLatencyConfig.comparison === 'below' ? 'text-green-600 font-bold' : 'text-gray-500')}`}>
                                     {trace.latencyMs} ms {alertLatencyConfig.value !== null && alertLatencyConfig.comparison === 'above' ? <LuBellRing className="inline ml-1 h-3 w-3 text-red-500"/> : (alertLatencyConfig.value !== null && alertLatencyConfig.comparison === 'below' ? <LuBellRing className="inline ml-1 h-3 w-3 text-green-500"/> : '')}
                                 </td>
                                 <td className={`px-4 py-3 whitespace-nowrap text-sm ${alertTokenConfig.value !== null && alertTokenConfig.comparison === 'above' ? 'text-red-600 font-bold' : (alertTokenConfig.value !== null && alertTokenConfig.comparison === 'below' ? 'text-green-600 font-bold' : 'text-gray-500')}`}>
                                     {trace.totalTokens} {alertTokenConfig.value !== null && alertTokenConfig.comparison === 'above' ? <LuBellRing className="inline ml-1 h-3 w-3 text-red-500"/> : (alertTokenConfig.value !== null && alertTokenConfig.comparison === 'below' ? <LuBellRing className="inline ml-1 h-3 w-3 text-green-500"/> : '')}
                                 </td>
                                 <td className="px-4 py-3 whitespace-nowrap">
                                     <EvaluationBadge issues={trace.evaluationIssues} />
                                     {alertEvaluationIssues.length > 0 && trace.evaluationIssues.some(issue => alertEvaluationIssues.includes(issue)) && <LuBellRing className="inline ml-1 h-3 w-3 text-red-500"/>}
                                 </td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">{trace.sessionId}</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openSpanAnalyzer(trace); /* Optionally scroll to feedback? */ }} 
                                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded"
                                      title="Analyze Trace & Provide Feedback"
                                    >
                                      <LuPencil className="h-4 w-4" />
                                    </button>
                                  </td>
                             </tr>
                         ))}
                         {displayedTraces.length === 0 && (
                             <tr><td colSpan={8} className="text-center text-gray-500 py-8">No traces found for pipeline: {selectedPipelineName}.</td></tr>
                         )}
                     </tbody>
                 </table>
             </div>
          </div>
        );
    }
    if (activeTab === 'chat') {
        return (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                         <tr>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interaction Snippet</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traces</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Latency</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Hallucination</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Context Rel.</th>
                             <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Accuracy</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                         {displayedChatSessions.map((session) => (
                             <tr key={session.sessionId} onClick={() => openChatHistoryModal(session)} className="hover:bg-gray-50 cursor-pointer">
                                 <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500" title={session.sessionId}>{session.sessionId.substring(0, 12)}...</td>
                                 <td className="px-4 py-3 text-sm text-gray-900 max-w-sm">
                                     <div className="truncate" title={session.firstPrompt}><span className="font-medium">First P:</span> {session.firstPrompt}</div>
                                     <div className="truncate text-gray-600" title={session.lastResponse}><span className="font-medium">Last R:</span> {session.lastResponse}</div>
                                 </td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{session.durationSeconds} s</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{session.totalMessages}</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{session.avgLatencyMs} ms</td>
                                 {/* Lower is better for Hallucination */}
                                 <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${session.avgHallucinationScore > 0.5 ? 'text-red-600' : (session.avgHallucinationScore > 0.1 ? 'text-yellow-600' : 'text-green-600')}`}>{session.avgHallucinationScore.toFixed(2)}</td>
                                 {/* Higher is better for Relevance/Accuracy */}
                                 <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${session.avgContextRelevancy < 0.5 ? 'text-red-600' : (session.avgContextRelevancy < 0.8 ? 'text-yellow-600' : 'text-green-600')}`}>{session.avgContextRelevancy.toFixed(2)}</td>
                                 <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${session.avgAccuracy < 0.5 ? 'text-red-600' : (session.avgAccuracy < 0.8 ? 'text-yellow-600' : 'text-green-600')}`}>{session.avgAccuracy.toFixed(2)}</td>
                             </tr>
                         ))}
                         {displayedChatSessions.length === 0 && (
                             <tr><td colSpan={8} className="text-center text-gray-500 py-8">No chat sessions found matching filters for pipeline: {selectedPipelineName}.</td></tr>
                         )}
                     </tbody>
                 </table>
             </div>
          </div>
        );
    }
    if (activeTab === 'embeddings') {
        return (
          <div className="space-y-4">
             {/* Controls Row - Updated Date Inputs */}
             <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                 <div className="flex items-center gap-2">
                     <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date:</label>
                     <input 
                        type="date" 
                        id="startDate"
                        value={embeddingDateRange?.from ? embeddingDateRange.from.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEmbeddingDateRange({ ...embeddingDateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                     />
                 </div>
                  <div className="flex items-center gap-2">
                     <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date:</label>
                     <input 
                        type="date" 
                        id="endDate"
                        value={embeddingDateRange?.to ? embeddingDateRange.to.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEmbeddingDateRange({ ...embeddingDateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
                         className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                     />
                 </div>
                  <button 
                     onClick={handleComputeVizEmbeddings}
                     disabled={isEmbeddingLoading}
                     className="self-end px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                      {isEmbeddingLoading ? <LuLoader className="h-4 w-4 animate-spin" /> : <LuBrainCircuit className="h-4 w-4" />}
                      <span>{isEmbeddingLoading ? 'Computing...' : 'Compute & Visualize'}</span>
                  </button>
                  {/* Color Mapping Selector - Updated Options */}
                   {!isEmbeddingLoading && embeddingPlotData.length > 0 && (
                      <div className="ml-auto">
                         <label htmlFor="colorBySelect" className="block text-sm font-medium text-gray-700 mb-1">Color Points By</label>
                          <select 
                             id="colorBySelect"
                             value={embeddingColorBy}
                             onChange={(e) => setEmbeddingColorBy(e.target.value as any)}
                             className="appearance-none block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          >
                              <option value="clusterId">Cluster ID</option>
                              <option value="evaluationIssues">Evaluation Issues</option>
                              <option value="feedback">User Feedback</option>
                          </select>
                      </div>
                   )}
             </div>
             {/* Visualization Area */}
             <div className="flex flex-col md:flex-row gap-4 min-h-[500px]">
                  {/* Plot Area */} 
                 <div className="flex-grow bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center p-4 relative overflow-hidden"> {/* Added overflow-hidden */} 
                     {/* Loader */} 
                     {isEmbeddingLoading && (
                         <div className="absolute inset-0 bg-gray-50/50 flex flex-col items-center justify-center z-10">
                           {/* ... Loader icon and text ... */} 
                            <LuLoader className="h-12 w-12 text-indigo-600 animate-spin mb-4"/>
                            <p className="text-lg font-medium text-gray-700">Performing UMAP dimension reduction...</p>
                            <p className="text-sm text-gray-500">Visualizing prompt embeddings.</p>
                         </div>
                     )}
                      {/* Initial Prompt / No Data */} 
                     {!isEmbeddingLoading && embeddingPlotData.length === 0 && (
                         <div className="text-center text-gray-500">
                              {/* ... Icon and prompt text ... */} 
                             <LuBrainCircuit className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                             <p className="font-medium">Select start/end dates and click "Compute & Visualize".</p>
                             <p className="text-sm">Prompt embeddings will be visualized here using 3D UMAP.</p>
                         </div>
                     )}
                      {/* Actual Plotly Plot - Typed onClick handler */} 
                      {!isEmbeddingLoading && embeddingPlotData.length > 0 && (
                         <Plot
                             data={[
                                 {
                                     x: embeddingPlotData.map(p => p.x),
                                     y: embeddingPlotData.map(p => p.y),
                                     z: embeddingPlotData.map(p => p.z),
                                     mode: 'markers',
                                     type: 'scatter3d',
                                     marker: {
                                         size: 5, // Slightly larger points
                                         color: embeddingPlotData.map(getEmbeddingPointColor), // Use the color function
                                         opacity: 0.8
                                     },
                                     text: embeddingPlotData.map(p => `${p.sourceText.substring(0,100)}...<br>Cluster: ${p.clusterId}<br>ID: ${p.id}`), // Hover text
                                     hoverinfo: 'text', // Show only the text on hover
                                     customdata: embeddingPlotData.map(p => p.id) // Store ID for potential click events
                                 }
                             ]}
                             layout={{
                                 // title: '3D UMAP Embedding Visualization', // Title can be distracting, using tab title
                                 autosize: true,
                                 margin: { l: 0, r: 0, b: 0, t: 5 }, // Minimal margins
                                 scene: { // Ensure axis labels don't overlap much
                                    xaxis:{title: 'UMAP 1'},
                                    yaxis:{title: 'UMAP 2'},
                                    zaxis:{title: 'UMAP 3'},
                                 }
                             }}
                             style={{ width: '100%', height: '100%' }}
                             useResizeHandler={true}
                             onClick={(data: PlotMouseEvent) => {
                                if (data.points.length > 0) { // Check if a point was actually clicked
                                  const pointIndex = data.points[0].pointIndex;
                                  // Ensure pointIndex is valid
                                  if (pointIndex !== undefined && pointIndex >= 0 && pointIndex < embeddingPlotData.length) {
                                      const clickedPoint = embeddingPlotData[pointIndex];
                                      if (clickedPoint) {
                                          setSelectedEmbeddingPoint(clickedPoint);
                                          handleSelectCluster(clickedPoint.clusterId);
                                      }
                                  } else {
                                    console.warn('Plotly onClick event did not contain a valid pointIndex.');
                                  }
                                } 
                             }}
                             config={{ 
                                displayModeBar: true,
                                responsive: true 
                             }}
                         />
                     )}
                 </div>
                  {/* Details/Analysis Panel - UPDATED */} 
                  <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 bg-white rounded-lg shadow border border-gray-200 p-4 space-y-4 overflow-y-auto">
                     <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Details & Analysis</h3>
                     
                      {/* Selected Point Details */} 
                      <div className="border-b pb-4">
                          <h4 className="text-sm font-semibold text-indigo-700 mb-2">Selected Point</h4>
                          {selectedEmbeddingPoint ? (
                              <div className="text-xs space-y-3">
                                  <p><span className="font-medium text-gray-500">ID:</span> {selectedEmbeddingPoint.id}</p>
                                  <div>
                                      <p className="font-medium text-gray-600 mb-1">Source Text:</p>
                                      <p className="p-2 bg-gray-100 rounded border border-gray-200 max-h-20 overflow-y-auto">{selectedEmbeddingPoint.sourceText}</p>
                                  </div>
                                  {/* ... other point details (timestamp, feedback, issues) ... */} 
                              </div>
                          ) : (
                              <p className="text-xs text-gray-400 italic">Click a point in the plot to see its details.</p>
                          )}
                      </div>

                      {/* Cluster Analysis & Actions */} 
                      <div>
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">Cluster Analysis</h4>
                          {selectedClusterId !== null ? (
                              <div className="text-xs space-y-3">
                                  <p className="font-medium">Selected Cluster ID: <span className="font-bold text-lg">{selectedClusterId}</span></p>
                                  
                                  {/* Cluster Naming */} 
                                  <div>
                                      <label htmlFor="clusterName" className="block font-medium text-gray-700 mb-1">Custom Name:</label>
                                      <input 
                                        type="text"
                                        id="clusterName"
                                        value={clusterNameInput}
                                        onChange={(e) => setClusterNameInput(e.target.value)}
                                        placeholder={`Optional name for Cluster ${selectedClusterId}`}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                      />
                                  </div>

                                  {/* Cluster Commenting */} 
                                  <div>
                                      <label htmlFor="clusterComment" className="block font-medium text-gray-700 mb-1">Comments:</label>
                                      <textarea 
                                        id="clusterComment"
                                        rows={3}
                                        value={clusterCommentInput}
                                        onChange={(e) => setClusterCommentInput(e.target.value)}
                                        placeholder={`Add notes about Cluster ${selectedClusterId}...`}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                      />
                                  </div>
                                  
                                  <button 
                                    onClick={handleSaveClusterMetadata}
                                    className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    disabled={clusterMetadata[selectedClusterId]?.name === clusterNameInput.trim() && clusterMetadata[selectedClusterId]?.comment === clusterCommentInput.trim()} // Disable if no changes
                                   >
                                      Save Cluster Info
                                  </button>
                                  {/* Add more cluster analysis here later (size, representative points, etc.) */} 
                              </div>
                          ) : (
                              <p className="text-xs text-gray-400 italic">Click a point in the plot to select its cluster.</p>
                          )}
                      </div>
                 </div>
             </div>
          </div>
        );
    } 
    
    if (activeTab === 'drift') {
        // Prepare data for the grouped bar chart
        const chartData = driftComparisonResults ? [
            {
                x: driftComparisonResults.map(m => m.metricName),
                y: driftComparisonResults.map(m => m.period1Value),
                name: `Period 1 (${driftDateRange1?.from?.toLocaleDateString()} - ${driftDateRange1?.to?.toLocaleDateString()})`,
                type: 'bar',
                marker: { color: '#6366F1' } // Indigo
            },
            {
                x: driftComparisonResults.map(m => m.metricName),
                y: driftComparisonResults.map(m => m.period2Value),
                name: `Period 2 (${driftDateRange2?.from?.toLocaleDateString()} - ${driftDateRange2?.to?.toLocaleDateString()})`,
                type: 'bar',
                marker: { color: '#34D399' } // Emerald
            }
        ] : [];

        const chartLayout: Partial<Layout> = {
            barmode: 'group',
            xaxis: { tickangle: -45, automargin: true },
            yaxis: { title: 'Metric Value (Log Scale)', type: 'log', autorange: true }, // Use log scale for varying magnitudes
            margin: { l: 50, r: 20, t: 40, b: 100 }, // Adjust margins for labels
            legend: { orientation: 'h', yanchor: 'bottom', y: 1.02, xanchor: 'right', x: 1 },
            height: 400, // Set a fixed height
            autosize: true,
        };

        return (
            <div className="space-y-6">
                {/* Controls Row - Remains the same */}
                <div className="flex flex-wrap items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                   {/* Period 1 Date Inputs */}
                    <fieldset className="border border-gray-300 p-2 rounded-md">
                        <legend className="text-sm font-medium px-1 text-gray-600">Period 1</legend>
                        <div className="flex items-center gap-2">
                             <input
                                type="date"
                                value={driftDateRange1?.from ? driftDateRange1.from.toISOString().split('T')[0] : ''}
                                onChange={(e) => setDriftDateRange1({ ...driftDateRange1, from: e.target.value ? new Date(e.target.value) : undefined })}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                             />
                              <span className="text-gray-500">to</span>
                              <input
                                type="date"
                                value={driftDateRange1?.to ? driftDateRange1.to.toISOString().split('T')[0] : ''}
                                onChange={(e) => setDriftDateRange1({ ...driftDateRange1, to: e.target.value ? new Date(e.target.value) : undefined })}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                             />
                        </div>
                    </fieldset>

                     {/* Period 2 Date Inputs */}
                     <fieldset className="border border-gray-300 p-2 rounded-md">
                         <legend className="text-sm font-medium px-1 text-gray-600">Period 2</legend>
                        <div className="flex items-center gap-2">
                             <input
                                type="date"
                                value={driftDateRange2?.from ? driftDateRange2.from.toISOString().split('T')[0] : ''}
                                onChange={(e) => setDriftDateRange2({ ...driftDateRange2, from: e.target.value ? new Date(e.target.value) : undefined })}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                             />
                              <span className="text-gray-500">to</span>
                              <input
                                type="date"
                                value={driftDateRange2?.to ? driftDateRange2.to.toISOString().split('T')[0] : ''}
                                onChange={(e) => setDriftDateRange2({ ...driftDateRange2, to: e.target.value ? new Date(e.target.value) : undefined })}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                             />
                        </div>
                    </fieldset>

                  <button
                     onClick={handleCompareDrift}
                     disabled={isDriftLoading}
                     className="self-end mt-4 sm:mt-0 px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                      {isDriftLoading ? <LuLoader className="h-4 w-4 animate-spin" /> : <LuArrowRightLeft className="h-4 w-4" />}
                      <span>{isDriftLoading ? 'Comparing...' : 'Compare Periods'}</span>
                  </button>
                </div>

                {/* Results Area - Now includes Table and Chart */} 
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200 min-h-[300px]">
                     {isDriftLoading && (
                         <div className="flex flex-col items-center justify-center h-full">
                             <LuLoader className="h-12 w-12 text-teal-600 animate-spin mb-4"/>
                             <p className="text-lg font-medium text-gray-700">Calculating metric drift...</p>
                         </div>
                     )}

                    {!isDriftLoading && !driftComparisonResults && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                           <LuArrowRightLeft className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                           <p className="font-medium">Select two distinct time periods and click "Compare Periods".</p>
                           <p className="text-sm">Key metrics will be compared between the selected ranges.</p>
                        </div>
                    )}

                    {!isDriftLoading && driftComparisonResults && (
                        <div className="space-y-6">
                            {/* Summary Table */}
                            <div>
                               <h3 className="text-lg font-semibold mb-3 text-gray-800">Metric Comparison Summary</h3>
                                <div className="overflow-x-auto border rounded-md">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Period 1</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Period 2</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Change</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">% Change</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {driftComparisonResults.map((metric) => (
                                                <tr key={metric.metricName}>
                                                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{metric.metricName}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500">{metric.unit === '$' ? '$' : ''}{metric.period1Value.toFixed(2)}{metric.unit !== '$' ? metric.unit : ''}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500">{metric.unit === '$' ? '$' : ''}{metric.period2Value.toFixed(2)}{metric.unit !== '$' ? metric.unit : ''}</td>
                                                    <td className={`px-4 py-2 whitespace-nowrap text-right font-medium ${metric.changeType === 'negative' ? 'text-red-600' : (metric.changeType === 'positive' ? 'text-green-600' : 'text-gray-500')}`}>
                                                        {metric.change >= 0 ? '+' : ''}{metric.unit === '$' ? '$' : ''}{metric.change.toFixed(2)}{metric.unit !== '$' ? metric.unit : ''}
                                                    </td>
                                                    <td className={`px-4 py-2 whitespace-nowrap text-right font-medium ${metric.changeType === 'negative' ? 'text-red-600' : (metric.changeType === 'positive' ? 'text-green-600' : 'text-gray-500')}`}>
                                                         {isFinite(metric.percentChange) ? `${metric.percentChange >= 0 ? '+' : ''}${metric.percentChange.toFixed(1)}%` : (metric.period2Value !== 0 ? '∞' : 'N/A')}
                                                     </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Visual Comparison Chart */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Visual Comparison</h3>
                                <div className="border rounded-md p-2">
                                   <Plot
                                       data={chartData as any} // Cast as any if type issues persist with plotly types
                                       layout={chartLayout}
                                       style={{ width: '100%', height: '100%' }}
                                       useResizeHandler={true}
                                       config={{ 
                                           displayModeBar: false, // Cleaner look
                                           responsive: true 
                                       }}
                                   />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } 
    
    // --- NEW: Alert Tab Content ---
    if (activeTab === 'alerts') {
        // Basic structure for Alert Tab
        return (
            <div className="space-y-6">
                {/* Threshold Configuration Area */}
                <div className="p-4 bg-gray-50 rounded-lg border flex flex-wrap items-center gap-4">
                    <h3 className="text-md font-semibold text-gray-700 mr-4">Set Alert Thresholds:</h3>
                    <div className="flex items-center gap-2">
                        <label htmlFor="latencyComparison" className="text-sm font-medium text-gray-600">Latency (ms)</label>
                        <select
                            id="latencyComparison"
                            value={alertLatencyConfig.comparison}
                            onChange={(e) => setAlertLatencyConfig({ ...alertLatencyConfig, comparison: e.target.value as 'above' | 'below' })}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                           <option value="above">above</option>
                           <option value="below">below</option>
                        </select>
                        <input
                            type="number"
                            id="latencyThreshold"
                            value={alertLatencyConfig.value ?? ''}
                            onChange={(e) => setAlertLatencyConfig({ ...alertLatencyConfig, value: e.target.value ? parseInt(e.target.value, 10) : null })}
                            placeholder="e.g., 2000"
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm w-24 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="tokenComparison" className="text-sm font-medium text-gray-600">Total Tokens</label>
                         <select
                            id="tokenComparison"
                            value={alertTokenConfig.comparison}
                            onChange={(e) => setAlertTokenConfig({ ...alertTokenConfig, comparison: e.target.value as 'above' | 'below' })}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                         >
                            <option value="above">above</option>
                            <option value="below">below</option>
                         </select>
                        <input
                            type="number"
                            id="tokenThreshold"
                            value={alertTokenConfig.value ?? ''}
                            onChange={(e) => setAlertTokenConfig({ ...alertTokenConfig, value: e.target.value ? parseInt(e.target.value, 10) : null })}
                            placeholder="e.g., 100"
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm w-24 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                     {/* Add more threshold inputs here - e.g., Multi-select for Eval Issues */}
                     <div className="flex items-center gap-2">
                         <label className="text-sm font-medium text-gray-600">Flagged Issues:</label>
                         {/* Basic display - could be improved with checkboxes/multiselect */}
                         <span className="text-sm text-gray-800 bg-white px-2 py-1 border rounded">
                           {alertEvaluationIssues.join(', ') || 'None'}
                         </span>
                          {/* TODO: Implement a proper multi-select for alertEvaluationIssues */}
                     </div>
                </div>

                {/* Alerting Traces Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* Similar columns to Trace IQ, maybe highlight the breaching metric */}
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trace ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interaction</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluation</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {alertTraces
                                    .filter(t => t.pipelineId === selectedPipelineId) // Filter again by selected pipeline
                                    .map((trace) => {
                                        // Determine which thresholds were breached for styling
                                        const breachedLatency = alertLatencyConfig.value !== null && (
                                            alertLatencyConfig.comparison === 'above' ?
                                            trace.latencyMs > alertLatencyConfig.value :
                                            trace.latencyMs < alertLatencyConfig.value
                                        );
                                        const breachedTokens = alertTokenConfig.value !== null && (
                                            alertTokenConfig.comparison === 'above' ?
                                            trace.totalTokens > alertTokenConfig.value :
                                            trace.totalTokens < alertTokenConfig.value
                                        );
                                        const breachedIssues = alertEvaluationIssues.length > 0 && trace.evaluationIssues.some(issue => alertEvaluationIssues.includes(issue));

                                        return (
                                            <tr key={trace.id} onClick={() => openSpanAnalyzer(trace)} className="hover:bg-red-50 cursor-pointer">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">{trace.id}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                                    <div className="truncate" title={trace.prompt}><span className="font-medium">P:</span> {trace.prompt}</div>
                                                    <div className="truncate text-gray-600" title={trace.response}><span className="font-medium">R:</span> {trace.response}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{trace.startTime.toLocaleString()}</td>
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm ${breachedLatency ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                    {trace.latencyMs} ms {breachedLatency ? <LuBellRing className="inline ml-1 h-3 w-3 text-red-500"/> : ''}
                                                </td>
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm ${breachedTokens ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                    {trace.totalTokens} {breachedTokens ? <LuBellRing className="inline ml-1 h-3 w-3 text-red-500"/> : ''}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                     <EvaluationBadge issues={trace.evaluationIssues} />
                                                     {breachedIssues && <LuBellRing className="inline ml-1 h-3 w-3 text-red-500"/>}
                                                 </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">{trace.sessionId}</td>
                                            </tr>
                                        );
                                })}
                                {alertTraces.filter(t => t.pipelineId === selectedPipelineId).length === 0 && (
                                    <tr><td colSpan={7} className="text-center text-gray-500 py-8">No traces currently breaching the defined thresholds for pipeline: {selectedPipelineName}.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- NEW: Dashboard Tab Content (Adding Charts) ---
    if (activeTab === 'dashboard') {
        const metricsToDisplay = [
            { name: 'Total Traces', value: pipelineDashboardMetrics.totalTraces.toLocaleString(), icon: LuListTree, iconColor: 'text-blue-500' },
            { name: 'Total Sessions', value: pipelineDashboardMetrics.totalSessions.toLocaleString(), icon: LuMessagesSquare, iconColor: 'text-purple-500' },
            { name: 'Avg. Latency', value: `${pipelineDashboardMetrics.avgLatency} ms`, icon: LuClock, iconColor: 'text-orange-500', isBad: pipelineDashboardMetrics.avgLatency > 1500 }, // Example threshold
            { name: 'Avg. Tokens', value: pipelineDashboardMetrics.avgTokens.toLocaleString(), icon: LuFileText, iconColor: 'text-gray-500' }, // Example: Use LuFileText for tokens
            { name: 'Est. Total Cost', value: `$${pipelineDashboardMetrics.totalCost.toFixed(4)}`, icon: LuTrendingDown, iconColor: 'text-green-500' },
            { name: 'Hallucination Rate', value: `${pipelineDashboardMetrics.hallucinationRate}%`, icon: LuTriangleAlert, iconColor: 'text-red-500', isBad: pipelineDashboardMetrics.hallucinationRate > 5 }, // Example threshold
            { name: 'Refusal Rate', value: `${pipelineDashboardMetrics.refusalRate}%`, icon: LuCircleAlert, iconColor: 'text-yellow-600', isBad: pipelineDashboardMetrics.refusalRate > 10 }, // Example threshold
        ];

        return (
            <div className="space-y-6">
                <p className="text-sm text-gray-600">
                    Showing summary metrics for the <span className="font-semibold">{selectedPipelineName}</span> pipeline based on the available data.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                   {metricsToDisplay.map((metric) => {
                       const Icon = metric.icon;
                       const color = metric.isBad ? 'text-red-500' : (metric.iconColor || 'text-gray-500');
                       const bgColor = metric.isBad ? 'bg-red-500/10' : (metric.iconColor ? `${metric.iconColor.replace('text-', 'bg-')}/10` : 'bg-gray-500/10');

                        return (
                             <div key={metric.name} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-start space-x-3">
                                 <div className={`p-2 rounded-full ${bgColor}`}>
                                     <Icon className={`h-5 w-5 ${color}`}/>
                                 </div>
                                 <div>
                                     <h3 className="text-sm font-medium text-gray-500 mb-1 whitespace-nowrap">{metric.name}</h3>
                                     <p className={`text-2xl font-semibold mb-1 ${metric.isBad ? 'text-red-600' : ''}`}>{metric.value}</p>
                                     {/* Optionally add change indicator here if we calculate trends later */}
                                     {/* <p className={`text-xs font-medium ...`}>...</p> */}
                                 </div>
                             </div>
                        )
                   })}
                </div>
                {/* Add more dashboard components here later, e.g., charts specific to this pipeline */}
                 {pipelineDashboardMetrics.totalTraces === 0 && (
                     <div className="bg-white p-6 rounded-lg shadow border border-gray-200 min-h-[200px] flex items-center justify-center text-gray-400 border-dashed">
                         <p>No data available for the selected pipeline to generate a dashboard summary.</p>
                     </div>
                 )}

                {/* NEW: Charts Section */}
                {pipelineDashboardMetrics.totalTraces > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Avg Latency Chart */}
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h3 className="text-md font-semibold mb-3 text-gray-700">Avg. Latency Over Time (Daily)</h3>
                            <div className="h-64">
                                <Plot
                                    data={[
                                        {
                                            x: pipelineChartData.dailyLatency.map(d => d.date),
                                            y: pipelineChartData.dailyLatency.map(d => d.avgLatency),
                                            type: 'scatter',
                                            mode: 'lines+markers',
                                            name: 'Avg Latency',
                                            marker: { color: '#f97316' }, // Orange
                                            line: { color: '#f97316' },
                                        },
                                    ]}
                                    layout={{
                                        autosize: true,
                                        margin: { l: 40, r: 20, t: 20, b: 30 },
                                        yaxis: { title: 'ms', automargin: true, titlefont: { size: 10 }, tickfont: { size: 10 } },
                                        xaxis: { tickfont: { size: 10 } },
                                        showlegend: false,
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    useResizeHandler={true}
                                    config={{ displayModeBar: false, responsive: true }}
                                />
                            </div>
                        </div>

                         {/* Trace Count Chart */}
                         <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h3 className="text-md font-semibold mb-3 text-gray-700">Trace Volume Over Time (Daily)</h3>
                            <div className="h-64">
                                <Plot
                                    data={[
                                        {
                                            x: pipelineChartData.dailyCounts.map(d => d.date),
                                            y: pipelineChartData.dailyCounts.map(d => d.count),
                                            type: 'bar',
                                            name: 'Trace Count',
                                            marker: { color: '#3b82f6' }, // Blue
                                        },
                                    ]}
                                     layout={{
                                        autosize: true,
                                        margin: { l: 40, r: 20, t: 20, b: 30 },
                                        yaxis: { title: 'Count', automargin: true, titlefont: { size: 10 }, tickfont: { size: 10 } },
                                        xaxis: { tickfont: { size: 10 } },
                                        showlegend: false,
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    useResizeHandler={true}
                                    config={{ displayModeBar: false, responsive: true }}
                                />
                            </div>
                        </div>

                        {/* Hallucination Rate Chart */}
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 lg:col-span-2"> {/* Span across two columns on large screens */}
                            <h3 className="text-md font-semibold mb-3 text-gray-700">Hallucination Rate Over Time (Daily)</h3>
                            <div className="h-64">
                                <Plot
                                    data={[
                                        {
                                            x: pipelineChartData.dailyHallucinations.map(d => d.date),
                                            y: pipelineChartData.dailyHallucinations.map(d => d.rate),
                                            type: 'scatter',
                                            mode: 'lines+markers',
                                            name: 'Hallucination Rate',
                                            marker: { color: '#ef4444' }, // Red
                                            line: { color: '#ef4444' },
                                        },
                                    ]}
                                     layout={{
                                        autosize: true,
                                        margin: { l: 40, r: 20, t: 20, b: 30 },
                                        yaxis: { title: '%', automargin: true, titlefont: { size: 10 }, tickfont: { size: 10 } },
                                        xaxis: { tickfont: { size: 10 } },
                                        showlegend: false,
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                    useResizeHandler={true}
                                    config={{ displayModeBar: false, responsive: true }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    // --- NEW: MetricMind Tab Content ---
    if (activeTab === 'metrics') {
        const showGroundTruthInput = selectedMetricFamilies.some(f => f.requiresGroundTruth);

        return (
            <div className="space-y-6">
                {/* Configuration Area */}
                 <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                         {/* Left Column: Metric Selection & Input Source */}
                         <div className="space-y-4">
                             {/* Metric Family Selection */}
                             <div>
                                 <label htmlFor="metricFamiliesSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                     Select Metric Families
                                 </label>
                                 <Select
                                    id="metricFamiliesSelect"
                                    isMulti
                                    value={selectedMetricFamilies}
                                    onChange={(selected) => setSelectedMetricFamilies(selected as MultiValue<MetricFamilyOption>)} // Ensure correct type
                                    options={metricFamilies}
                                    getOptionLabel={(option) => option.label} // Ensure label is displayed
                                    getOptionValue={(option) => option.value} // Ensure value is used
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                    placeholder="Choose metrics to compute..."
                                    closeMenuOnSelect={false}
                                 />
                             </div>

                             {/* Input Source Selection */}
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Input Data Source</label>
                                 <div className="flex gap-4">
                                     <label className="flex items-center gap-1.5 cursor-pointer">
                                         <input
                                            type="radio"
                                            name="metricInputSource"
                                            value="traces"
                                            checked={metricInputSource === 'traces'}
                                            onChange={() => setMetricInputSource('traces')}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                         />
                                         <span className="text-sm text-gray-700">Use Existing Traces ({displayedTraces.length})</span>
                                     </label>
                                     <label className="flex items-center gap-1.5 cursor-pointer">
                                         <input
                                            type="radio"
                                            name="metricInputSource"
                                            value="manual"
                                            checked={metricInputSource === 'manual'}
                                            onChange={() => setMetricInputSource('manual')}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                         />
                                          <span className="text-sm text-gray-700">Manual Input</span>
                                     </label>
                                 </div>
                             </div>
                             {/* Manual Input Area (Conditional) */}
                             {metricInputSource === 'manual' && (
                                 <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label htmlFor="manualPrompt" className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                                        <textarea
                                            id="manualPrompt"
                                            rows={3}
                                            value={manualMetricPrompt}
                                            onChange={(e) => setManualMetricPrompt(e.target.value)}
                                            placeholder="Enter the prompt text here..."
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                     <div>
                                        <label htmlFor="manualResponse" className="block text-sm font-medium text-gray-700 mb-1">Response (Optional)</label>
                                        <textarea
                                            id="manualResponse"
                                            rows={3}
                                            value={manualMetricResponse}
                                            onChange={(e) => setManualMetricResponse(e.target.value)}
                                            placeholder="Enter the corresponding response text here..."
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                 </div>
                             )}
                         </div>

                         {/* Right Column: Ground Truth (Conditional) */}
                         {showGroundTruthInput && (
                             <div className="space-y-4">
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Ground Truth Source</label>
                                 <div className="flex gap-4 mb-2">
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                         <input
                                            type="radio"
                                            name="groundTruthInputType"
                                            value="text"
                                            checked={groundTruthInputType === 'text'}
                                            onChange={() => setGroundTruthInputType('text')}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                         />
                                          <span className="text-sm text-gray-700">Manual Text</span>
                                     </label>
                                     <label className="flex items-center gap-1.5 cursor-pointer">
                                         <input
                                            type="radio"
                                            name="groundTruthInputType"
                                            value="source"
                                            checked={groundTruthInputType === 'source'}
                                            onChange={() => setGroundTruthInputType('source')}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                         />
                                          <span className="text-sm text-gray-700">Select Source</span>
                                     </label>
                                 </div>

                                 {/* Ground Truth Input Fields */}
                                 {groundTruthInputType === 'text' ? (
                                    <div>
                                        <label htmlFor="groundTruthText" className="block text-sm font-medium text-gray-700 mb-1">Ground Truth Text</label>
                                        <textarea
                                            id="groundTruthText"
                                            rows={6}
                                            value={groundTruthText}
                                            onChange={(e) => setGroundTruthText(e.target.value)}
                                            placeholder="Enter the ground truth text (e.g., reference summary, factual answer)..."
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                 ) : (
                                     <div>
                                         <label htmlFor="groundTruthSourceSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Data Source</label>
                                         {/* Placeholder for source selection UI */}
                                         <select
                                             id="groundTruthSourceSelect"
                                             value={groundTruthSource}
                                             onChange={(e) => setGroundTruthSource(e.target.value)}
                                             className="appearance-none block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm bg-white"
                                         >
                                             <option value="" disabled>-- Select Source (Simulated) --</option>
                                             <option value="doc_upload">Uploaded Document: annual_report.pdf</option>
                                             <option value="vector_db_1">Vector DB: Product Knowledge Base</option>
                                             <option value="vector_db_2">Vector DB: Customer Support FAQs</option>
                                         </select>
                                         <p className="text-xs text-gray-500 mt-1 italic">Source selection is simulated.</p>
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>


                     {/* Compute Button */}
                     <div className="text-right border-t pt-4 mt-4">
                        <button
                            onClick={handleComputeMetrics}
                            disabled={isComputingMetrics || selectedMetricFamilies.length === 0 || (metricInputSource === 'manual' && !manualMetricPrompt.trim()) || (showGroundTruthInput && groundTruthInputType === 'text' && !groundTruthText.trim()) || (showGroundTruthInput && groundTruthInputType === 'source' && !groundTruthSource)}
                            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ml-auto"
                        >
                            {isComputingMetrics ? <LuLoader className="h-4 w-4 animate-spin" /> : <LuSettings2 className="h-4 w-4" />}
                             <span>{isComputingMetrics ? 'Computing...' : 'Compute Metrics'}</span>
                        </button>
                     </div>
                 </div>

                {/* Results Area */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden min-h-[300px]">
                    {isComputingMetrics ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <LuLoader className="h-8 w-8 animate-spin mr-3"/> Computing selected metrics...
                        </div>
                    ) : metricResultsTableData.length === 0 ? (
                         <div className="flex items-center justify-center h-full text-gray-400 italic p-6 text-center">
                            Configure metric families and input source above, then click "Compute Metrics" to see the results.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* Sticky columns for prompt/response */}
                                        <th scope="col" className="sticky left-0 z-10 px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50 min-w-[200px]">Prompt</th>
                                        <th scope="col" className="sticky left-[200px] z-10 px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50 min-w-[200px]">Response</th>

                                        {/* Dynamically add columns for selected metric families and their sub-metrics */}
                                        {selectedMetricFamilies.map(family => (
                                            family.subMetrics.map(subMetric => (
                                                <th
                                                   key={`${family.value}-${subMetric.key}`}
                                                   scope="col"
                                                   className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                                   title={family.label} // Add tooltip for family context
                                                >
                                                   {subMetric.name} {subMetric.unit ? `(${subMetric.unit})` : ''}
                                                </th>
                                            ))
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {metricResultsTableData.map((result, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            {/* Sticky cells for prompt/response */}
                                            <td className="sticky left-0 z-0 px-4 py-3 align-top bg-white min-w-[200px]"><div className="max-h-20 overflow-y-auto text-xs">{result.prompt}</div></td>
                                            <td className="sticky left-[200px] z-0 px-4 py-3 align-top bg-white min-w-[200px]"><div className="max-h-20 overflow-y-auto text-xs">{result.response || <span className="italic text-gray-400">N/A</span>}</div></td>

                                            {/* Dynamically add cells for scores */}
                                            {selectedMetricFamilies.map(family => (
                                                family.subMetrics.map(subMetric => (
                                                    <td key={`${family.value}-${subMetric.key}`} className="px-4 py-3 align-top whitespace-nowrap">
                                                        {result.scores[family.value]?.[subMetric.key] !== undefined && result.scores[family.value]?.[subMetric.key] !== null
                                                          ? String(result.scores[family.value][subMetric.key])
                                                          : <span className="italic text-gray-400">--</span>
                                                        }
                                                    </td>
                                                ))
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    // Default Fallback for other tabs
    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 min-h-[400px] flex items-center justify-center text-gray-400 border-dashed">
            <p>Content for {monitoringTabs.find(t => t.id === activeTab)?.name} tab goes here.</p>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Monitoring</h1>

      {/* Pipeline Selector */} 
      <div className="max-w-xs">
          <label htmlFor="pipelineSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Pipeline / Use Case
          </label>
          <div className="relative">
              <select id="pipelineSelect" value={selectedPipelineId} onChange={(e) => setSelectedPipelineId(e.target.value)} className="appearance-none block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white">
                  {pipelines.map(pipeline => <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><LuChevronDown className="h-4 w-4"/></div>
          </div>
      </div>

      {/* Tab Navigation */} 
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {monitoringTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-shrink-0 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                              activeTab === tab.id
                                  ? 'border-indigo-500 text-indigo-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                          <Icon className="h-5 w-5" /> {tab.name}
                      </button>
                  );
              })}
          </nav>
      </div>

      {/* Tab Content Area */} 
      <div className="mt-6">
          {/* Title & Filter Area */} 
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{monitoringTabs.find(t => t.id === activeTab)?.name} for {selectedPipelineName}</h2>
              {/* Tab-Specific Filters */}
              <div> {/* Wrap filters in a div to avoid direct sibling expression issues */}
                {activeTab === 'trace' && (
                    <div className="relative">
                        <input type="search" placeholder="Search traces..." className="pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" /* value={traceSearch} onChange={...} */ />
                        <LuSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                    </div>
                )}
                {activeTab === 'chat' && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input type="search" placeholder="Search sessions..." value={chatSearchTerm} onChange={(e) => setChatSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-64"/>
                            <LuSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                        </div>
                    </div>
                )}
                 {/* Add Filters for Embeddings tab later */}
              </div>
          </div>

          {/* Render Active Tab Content using function */} 
          {renderTabContent()}
      </div>

      {/* Modals */} 
      {selectedTrace && isSpanModalOpen ? (
          <Modal isOpen={isSpanModalOpen} onClose={closeSpanAnalyzer} title={`Span Analyzer - Trace: ${selectedTrace.id}`}>
               {/* Span Analyzer Modal Content */} 
               <div className="flex flex-col md:flex-row gap-6 max-h-[calc(90vh-100px)]">
                 <div className="md:w-1/3 border-r pr-4 overflow-y-auto flex-shrink-0">
                     <h3 className="text-md font-semibold mb-3 text-gray-700">Spans</h3>
                     <ul className="space-y-1">
                          {(selectedTrace.spans ?? [])
                             .filter(span => !span.parentId)
                             .map((rootSpan) => (
                               <SpanItem
                                 key={rootSpan.id}
                                 span={rootSpan}
                                 allSpans={selectedTrace.spans ?? []}
                                 level={0}
                                 selectedSpan={selectedSpan}
                                 onSelectSpan={setSelectedSpan}
                               />
                           ))}
                           {(!selectedTrace.spans || selectedTrace.spans.length === 0) && (
                               <li className="text-xs text-gray-400 italic p-2">No detailed spans available.</li>
                           )}
                        </ul>
                 </div>
                 {/* --- START: Replacement for Right Panel --- */}
                 <div className="md:w-2/3 overflow-y-auto space-y-4 pr-1 pb-2">
                     {/* Prompt Section */}
                     <div className="space-y-2">
                         <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5"><LuFileText/> Prompt</h4>
                         <div className="p-3 border rounded-md bg-gray-50 text-xs">
                             {selectedSpan?.prompt ? (
                                <p><span className="font-medium text-gray-500">[Span]</span> {selectedSpan.prompt}</p>
                             ) : (
                                 <p>{selectedTrace.prompt}</p>
                             )}
                         </div>
                     </div>

                     {/* Response Section */}
                     <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5"><LuMessageCircle /> Response</h4>
                          <div className="p-3 border rounded-md bg-gray-50 text-xs">
                              {selectedSpan?.response ? (
                                  <p><span className="font-medium text-gray-500">[Span]</span> {selectedSpan.response}</p>
                              ) : (
                                  <p>{selectedTrace.response}</p>
                              )}
                          </div>
                     </div>

                     {/* Observations / Metrics Section */}
                     {(selectedSpan?.observations || selectedSpan?.metadata || selectedSpan === null) && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5"><LuInfo/> Observations / Metrics</h4>
                            <div className="p-3 border rounded-md bg-gray-50 text-xs space-y-1">
                                {/* Display Trace-level metrics if no span is selected */}
                                {selectedSpan === null && (
                                    <>
                                        <p><span className="font-medium">Trace Latency:</span> {selectedTrace.latencyMs} ms</p>
                                        <p><span className="font-medium">Trace Tokens:</span> {selectedTrace.totalTokens}</p>
                                        <p><span className="font-medium">Trace Est. Cost:</span> ${selectedTrace.spans?.reduce((sum, span) => sum + (span.observations?.cost ?? 0), 0).toFixed(5) ?? 'N/A'}</p>
                                        {selectedTrace.evaluationIssues.length > 0 && <p className="mt-1 border-t pt-1"><span className="font-medium">Trace Issues:</span> <EvaluationBadge issues={selectedTrace.evaluationIssues} /></p>}
                                    </>
                                )}
                                {/* Display Span-level observations/metadata if a span is selected */}
                                {selectedSpan?.observations && Object.entries(selectedSpan.observations).map(([key, value]) => (
                                    <p key={key}><span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {JSON.stringify(value)}</p>
                                ))}
                                {selectedSpan?.metadata && Object.entries(selectedSpan.metadata).map(([key, value]) => (
                                     <p key={key} className="text-gray-600"><span className="font-medium capitalize">Meta - {key.replace(/_/g, ' ')}:</span> {JSON.stringify(value)}</p>
                                ))}
                                {selectedSpan && !selectedSpan.observations && !selectedSpan.metadata && <p className="italic text-gray-400">No specific observations or metadata for this span.</p>}
                            </div>
                        </div>
                     )}

                     {/* Justification Section (Conditional) */}
                     {(selectedSpan?.justification || (!selectedSpan && selectedTrace.evaluationIssues.includes('Hallucination'))) && (
                       <div className="space-y-2">
                         <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1.5"><LuCircleAlert /> Justification</h4>
                         <div className="p-3 border rounded-md bg-red-50 border-red-100 text-xs">
                            {selectedSpan?.justification ? (
                                <p>{selectedSpan.justification}</p>
                            ) : (
                                // Show trace-level hallucination message if no span is selected but issue exists
                                <div>
                                    <p className="font-medium mb-1">Potential Trace-level Issue Detected:</p>
                                    <p>Hallucination detected in the overall trace response.</p> 
                                </div>
                            )}
                         </div>
                       </div>
                     )}

                     {/* Manual Feedback Section */}
                     <div className="space-y-2 pt-2 border-t">
                          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5"><LuPencil/> Manual Feedback</h4>
                         <textarea 
                             value={feedbackText}
                             onChange={(e) => setFeedbackText(e.target.value)}
                             rows={3}
                             placeholder="Add feedback about this interaction... (e.g., 'Response was inaccurate', 'Good answer')"
                             className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-indigo-500 focus:border-indigo-500"
                         />
                         <button 
                             onClick={handleFeedbackSubmit}
                             disabled={!feedbackText.trim()} 
                             className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             Submit Feedback
                         </button>
                     </div>
                 </div>
                 {/* --- END: Replacement for Right Panel --- */}
               </div>
          </Modal>
      ) : null}

      {selectedChatSession && isChatModalOpen ? (
        <Modal isOpen={isChatModalOpen} onClose={closeChatHistoryModal} title={`Chat History - Session: ${selectedChatSession.sessionId}`}>
            {/* Chat History Modal Content */}
            <div className="flex flex-col md:flex-row gap-6 max-h-[calc(90vh-120px)]">
              <div className="md:w-3/5 border-r pr-4 overflow-y-auto space-y-3 flex-shrink-0">
                 {selectedChatSession.messages.map((msg) => { // Ensure this is 'msg'
                    const isSelectedMsg = selectedChatMessageId === msg.id; // Ensure this is 'isSelectedMsg'
                    return (
                     <div key={msg.id} className={`p-0.5 rounded ${isSelectedMsg ? 'bg-indigo-50' : ''}`}> {/* Ensure this uses isSelectedMsg */}
                        {/* Prompt bubble */}
                         {/* Corrected onClick handler and div structure */}
                         <div className="flex justify-start group cursor-pointer mb-1" onClick={() => setSelectedChatMessageId(msg.id)}> 
                           <div className="flex items-start gap-2 max-w-[85%]">
                              <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 mt-0.5">
                                <LuUser className="h-3.5 w-3.5 text-gray-600"/>
                              </span>
                             <div className={`relative text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg rounded-tl-none border border-gray-200`}>
                                {msg.prompt} {/* Ensure this uses msg */}
                             </div>
                           </div>
                         </div>
                        {/* Response bubble */}
                         {/* Corrected onClick handler and div structure */}
                         <div className="flex justify-end group cursor-pointer" onClick={() => setSelectedChatMessageId(msg.id)}> 
                            <div className="flex items-start gap-2 max-w-[85%] flex-row-reverse">
                                <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 mt-0.5">
                                    <LuBrainCircuit className="h-3.5 w-3.5 text-indigo-600"/>
                                </span>
                                <div className={`relative text-sm text-gray-800 bg-indigo-50 px-3 py-1.5 rounded-lg rounded-tr-none border border-indigo-100`}>
                                    {msg.response} {/* Ensure this uses msg */}
                                     {/* Add a subtle indicator for the selected message */}
                                     {isSelectedMsg && <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500 rounded-full"></div>} {/* Ensure this uses isSelectedMsg */}
                                </div>
                            </div>
                         </div>
                     </div>
                    )
                 })}
              </div>
              <div className="md:w-2/5 overflow-y-auto space-y-4 pr-1 pb-2">
                  <div className="sticky top-0 bg-white z-10 pt-1">
                     {/* Session Summary - Ensure null checks are present */}
                     <div className="p-3 border rounded-md bg-gray-100 text-xs mb-4 space-y-1">
                          <p><span className="font-medium">Pipeline:</span> {pipelines.find(p => p.id === selectedChatSession?.pipelineId)?.name ?? 'N/A'}</p>
                          <p><span className="font-medium">Duration:</span> {selectedChatSession?.durationSeconds ?? '?'}s | <span className="font-medium">Messages:</span> {selectedChatSession?.totalMessages ?? '?'}</p>
                          <p><span className="font-medium">Total Cost:</span> ${selectedChatSession?.totalCost?.toFixed(5) ?? 'N/A'}</p>
                     </div>
                     <h3 className="text-md font-semibold text-gray-700 pb-2 border-b mb-2">Selected Message Metrics</h3>
                  </div>
                  {/* Selected Message Details */}
                  <div className="p-3 border rounded-md bg-gray-50 text-xs min-h-[150px] space-y-1.5">
                      {selectedChatMessageId && selectedChatSession.messages.find(m => m.id === selectedChatMessageId) ? (
                        (() => {
                            const msg = selectedChatSession.messages.find(m => m.id === selectedChatMessageId)!;
                            return (
                                <>
                                    <p><span className="font-medium">Trace ID:</span> {msg.id}</p>
                                    <p><span className="font-medium">Timestamp:</span> {msg.timestamp.toLocaleString()}</p>
                                    <p><span className="font-medium">Latency:</span> {msg.latencyMs} ms</p>
                                    <p><span className="font-medium">Tokens:</span> {msg.totalTokens}</p>
                                    <p><span className="font-medium">Est. Cost:</span> ${msg.cost?.toFixed(5) ?? 'N/A'}</p>
                                    <div>
                                        <span className="font-medium">Evaluation:</span> {msg.evaluationIssues.length > 0 ? 
                                            <EvaluationBadge issues={msg.evaluationIssues} /> : 
                                            <span className="text-green-700 italic ml-1">No Issues</span>
                                        }
                                    </div>
                                    <button 
                                       onClick={() => goToTrace(msg.id)}
                                       className="mt-3 text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1"
                                    >
                                        <LuListTree className="h-3.5 w-3.5" /> Go to Trace Details
                                    </button>
                                </>
                            )
                        })()
                      ) : (
                         <p className="text-gray-400 italic">Click on a prompt or response bubble to see its metrics.</p>
                      )}
                  </div>
              </div>
            </div>
        </Modal>
      ) : null}

    </div>
  );
} 