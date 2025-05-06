'use client'; // Required for recharts and state hooks

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Select from 'react-select';
import DatePicker from "react-datepicker"; // Import date picker
import "react-datepicker/dist/react-datepicker.css"; // Import date picker CSS
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  LuFilter,
  LuCheck,
  LuTriangleAlert,
  LuCircleX,
  LuTrendingUp,
  LuTrendingDown,
  LuExternalLink,
  LuCalendarDays,
  LuClock,
  LuLayoutGrid, // Icon for Use Case
  LuDatabase,   // Icon for Data
  LuUser,       // Icon for Owner
  LuFileText,   // Icon for Description
} from 'react-icons/lu';

// --- Placeholder Data --- //

// Use Case Data (Simplified - ideally fetch/share from UseCaseOrchestrateX)
const dummyDashboardUseCases = [
  { id: 'uc-001', name: 'Customer Support Classifier', model: 'GPT-4o', owner: 'AI Team', dataSources: 'Support Tickets DB, Knowledge Base' },
  { id: 'uc-002', name: 'Product Recommendation Engine', model: 'Claude 3 Opus', owner: 'Marketing', dataSources: 'User Behavior Logs, Product Catalog' },
  { id: 'uc-003', name: 'Sentiment Analyzer', model: 'Gemini 1.5 Pro', owner: 'Support Team', dataSources: 'Customer Reviews Feed' },
];

// More detailed summary metrics
const summaryMetrics = [
  { name: 'Hallucination Rate', value: '2.5%', change: '+0.1%', changeType: 'negative', icon: LuTriangleAlert, iconColor: 'text-red-500' },
  { name: 'API Cost', value: '$150.75', change: '-$5.20', changeType: 'positive', icon: LuTrendingDown, iconColor: 'text-green-500' },
  { name: 'Avg. Latency', value: '350ms', change: '+25ms', changeType: 'negative', icon: LuTrendingUp, iconColor: 'text-red-500' },
  { name: 'Accuracy', value: '92.1%', change: '+1.5%', changeType: 'positive', icon: LuTrendingUp, iconColor: 'text-green-500' },
];

// Define structure for options used in react-select
interface SelectOption { 
    value: string;
    label: string;
}

// Dummy time series data for graphs
const generateTimeSeriesData = (metricId: string, lines: string[]) => {
    const data: Array<Record<string, string | number>> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const entry: Record<string, string | number> = { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };

        lines.forEach(lineKey => {
            let value;
            // Simplified simulation
            if (metricId === 'cost') value = 100 + Math.random() * 100;
            else if (metricId === 'latency') value = 200 + Math.random() * (lineKey === 'value' ? 300 : 500);
            else if (metricId === 'hallucination') value = Math.random() * 0.2; // Hallucination scores often low
            else if (metricId === 'summarization') value = 0.4 + Math.random() * 0.5; // ROUGE/BLEU often 0-1
            else if (metricId === 'readability' && lineKey === 'flesch') value = 50 + Math.random() * 30;
            else if (metricId === 'readability' && lineKey === 'grade_level') value = 8 + Math.random() * 4;
            else if (metricId === 'guardrails') value = 95 + Math.random() * 5;
            else value = Math.random() * 100;

            entry[lineKey] = parseFloat(value.toFixed(metricId === 'hallucination' || metricId === 'summarization' ? 3 : 2));
        });
        data.push(entry);
    }
    return data;
};

// Dummy data for Toxicity analysis (Radar chart needs numeric domain)
const toxicityDataRadar = [
  { dimension: 'Insult', score: 1.2, fullMark: 5 }, // Assuming a max score of 5 for context
  { dimension: 'Threat', score: 0.5, fullMark: 5 },
  { dimension: 'Obscenity', score: 2.1, fullMark: 5 },
  { dimension: 'Identity Attack', score: 0.8, fullMark: 5 },
  { dimension: 'Sexual Explicit', score: 1.5, fullMark: 5 },
];

// Dummy data for Token Distribution
const tokenDistributionData = [
    { name: 'Prompt Tokens', value: 125060 },
    { name: 'Completion Tokens', value: 88730 },
    { name: 'Total Tokens', value: 213790 },
];

// Dummy data for Jailbreak Attempts
const jailbreakData = [
  { rule: 'Prompt Injection', attempts: 5 },
  { rule: 'Role Play Violation', attempts: 3 },
  { rule: 'Forbidden Content', attempts: 2 },
  { rule: 'Data Exfiltration', attempts: 1 },
  { rule: 'Denial of Service', attempts: 1 },
];

// Enhanced Active Pipelines data
const activePipelines = [
  {
    id: 'pipe-1',
    name: 'Customer Support Assistant',
    status: 'Healthy',
    description: 'Handles customer inquiries and provides relevant information from documentation.',
    accuracy: 92,
    latency: 235,
    hallucination: 3.8,
    lastRun: 'Today, 2:45 PM',
  },
  {
    id: 'pipe-2',
    name: 'Product Recommendation Engine',
    status: 'Warning',
    description: 'Generates product recommendations based on user behavior and history.',
    accuracy: 88,
    latency: 450,
    hallucination: 6.2,
    lastRun: 'Yesterday, 11:10 AM',
  },
   {
    id: 'pipe-3',
    name: 'Content Summarization Bot',
    status: 'Error',
    description: 'Summarizes long articles and documents into concise points.',
    accuracy: 75,
    latency: 800,
    hallucination: 11.5,
    lastRun: 'Today, 9:00 AM (Failed)',
  },
];

const availableMetrics = [
  {
    id: 'hallucination',
    name: 'Hallucination',
    unit: '',
    lines: ['vectara', 'deberta'],
    lineNames: { 'vectara': 'Vectara Score', 'deberta': 'DeBERTa Score' } as Record<string, string>
  },
  {
    id: 'summarization',
    name: 'Summarization Quality',
    unit: '',
    lines: ['rouge1', 'rouge2', 'bleu'],
    lineNames: { 'rouge1': 'ROUGE-1', 'rouge2': 'ROUGE-2', 'bleu': 'BLEU' } as Record<string, string>
  },
  { id: 'cost', name: 'API Cost', unit: '$', lines: ['value'], lineNames: { value: 'Cost'} as Record<string, string> },
  { id: 'latency', name: 'Avg. Latency', unit: 'ms', lines: ['value', 'p95', 'p99'], lineNames: { value: 'Average', 'p95': 'P95 Latency', 'p99': 'P99 Latency'} as Record<string, string> },
  {
    id: 'readability',
    name: 'Response Readability',
    unit: '',
    lines: ['flesch', 'grade_level'],
    lineNames: { 'flesch': 'Flesch Score', 'grade_level': 'Grade Level' } as Record<string, string>
  },
  {
    id: 'guardrails',
    name: 'Guardrail Adherence',
    unit: '%',
    lines: ['overall', 'pii_filter', 'toxicity_filter'],
    lineNames: { 'overall': 'Overall %', 'pii_filter': 'PII Filter %', 'toxicity_filter': 'Toxicity Filter %' } as Record<string, string>
  },
  // Add other families/metrics as needed (e.g., requests, sentiment, toxicity score chart if desired)
];

// Available Models & Time Periods
const availableModels = ['GPT-4o', 'Gemini 1.5 Pro', 'Claude 3 Opus', 'Llama 3 70B'];
const timePeriods = ['Hour', 'Day', 'Week', 'Month', 'Custom']; // Added Custom

// Helper function for status badge
const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
  switch (status.toLowerCase()) {
    case 'healthy':
      return <span className={`${baseClasses} bg-green-100 text-green-800`}><LuCheck className="mr-1" /> Healthy</span>;
    case 'warning':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><LuTriangleAlert className="mr-1" /> Warning</span>;
    case 'error':
      return <span className={`${baseClasses} bg-red-100 text-red-800`}><LuCircleX className="mr-1" /> Error</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

// Line chart colors
const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908', '#0088FE', '#00C49F'];

// Colors for Pie Chart
const PIE_COLORS = ['#f97316', '#f59e0b', '#eab308', '#ef4444', '#dc2626'];

// --- Component --- //

export default function DashboardPage() {
  const [selectedMetricId, setSelectedMetricId] = useState(availableMetrics[0].id);
  const [selectedLineKeys, setSelectedLineKeys] = useState<SelectOption[]>([{ value: availableMetrics[0].lines[0], label: availableMetrics[0].lineNames[availableMetrics[0].lines[0]] }]);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<'all' | string>('all'); // 'all' or use case ID
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(timePeriods[1]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Prepare options for the Use Case selector
  const useCaseSelectorOptions = useMemo(() => {
    const options = [
        { value: 'all', label: 'All Use Cases' },
        ...dummyDashboardUseCases.map(uc => ({ value: uc.id, label: uc.name }))
    ];
    return options;
  }, []); // Empty dependency array as dummy data is static

  // Get details of the selected use case (if not 'all')
  const selectedUseCaseDetails = useMemo(() => {
    if (selectedUseCaseId === 'all') return null;
    return dummyDashboardUseCases.find(uc => uc.id === selectedUseCaseId) || null;
  }, [selectedUseCaseId]);

  const selectedMetric = useMemo(() => {
        const metric = availableMetrics.find(m => m.id === selectedMetricId);
        if (metric) return metric;
        // Fallback if selectedMetricId somehow becomes invalid
        setSelectedMetricId(availableMetrics[0].id);
        setSelectedLineKeys([{ value: availableMetrics[0].lines[0], label: availableMetrics[0].lineNames[availableMetrics[0].lines[0]] }])
        return availableMetrics[0];
  }, [selectedMetricId]);
  
  // Generate options for the sub-metric selector based on the selected main metric
  const lineSelectorOptions = useMemo(() => {
      return selectedMetric.lines.map(key => ({
          value: key,
          label: selectedMetric.lineNames[key] || key
      }));
  }, [selectedMetric]);

  // Regenerate chart data when selected metric or lines change
  const chartData = useMemo(() => generateTimeSeriesData(selectedMetric.id, selectedMetric.lines), [selectedMetric]);

  // Handle change in main metric selection
  const handleMetricChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newMetricId = event.target.value;
      const newMetric = availableMetrics.find(m => m.id === newMetricId);
      if (!newMetric) return; // Should not happen with dropdown

      setSelectedMetricId(newMetricId);
      // Reset sub-metric selection to the first line of the new metric
      const firstLineKey = newMetric.lines[0];
      const firstLineLabel = newMetric.lineNames[firstLineKey] || firstLineKey;
      setSelectedLineKeys([{ value: firstLineKey, label: firstLineLabel }]);
  };

  // Handle change in sub-metric selection
  const handleLineChange = (selectedOptions: readonly SelectOption[] | null) => {
      setSelectedLineKeys(selectedOptions ? [...selectedOptions] : []);
  };

  return (
    <div className="space-y-8">
      {/* Top Controls: Use Case & Time Period */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
         <h1 className="text-3xl font-bold">Dashboard Overview</h1>
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-wrap"> {/* Added flex-wrap */}
            {/* Use Case Selector */}
            <div className="relative w-full sm:w-64"> {/* Increased width */}
                 <select
                    className="appearance-none block w-full pl-3 pr-8 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white"
                    value={selectedUseCaseId}
                    onChange={(e) => setSelectedUseCaseId(e.target.value)}
                >
                    {useCaseSelectorOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                     <LuLayoutGrid className="h-4 w-4" aria-hidden="true" /> {/* Changed icon */}
                </div>
            </div>

            {/* Time Period Selector */}
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white overflow-hidden flex-wrap"> {/* Added flex-wrap */}
                 {timePeriods.map((period) => (
                     <button
                        key={period}
                        onClick={() => setSelectedTimePeriod(period)}
                        className={`px-3 py-2 text-sm font-medium focus:outline-none flex items-center gap-1 ${selectedTimePeriod === period ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                         {period === 'Hour' && <LuClock className="h-4 w-4"/>}
                         {period !== 'Hour' && period !== 'Custom' && <LuCalendarDays className="h-4 w-4"/>}
                         {period}
                    </button>
                ))}
            </div>
            {/* Custom Date Pickers */}
            {selectedTimePeriod === 'Custom' && (
                <div className="flex items-center gap-2">
                     <DatePicker
                        selected={startDate} 
                        onChange={(date: Date | null) => setStartDate(date ?? undefined)} 
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        isClearable
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="w-40 border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        wrapperClassName="datepicker-wrapper"
                        placeholderText="Start Date & Time"
                    />
                     <span className="text-gray-500">to</span>
                     <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => setEndDate(date ?? undefined)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        isClearable
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="w-40 border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        wrapperClassName="datepicker-wrapper"
                        placeholderText="End Date & Time"
                    />
                </div>
            )}
         </div>
      </section>

      {/* Use Case Summary Section (Visible only when a specific use case is selected) */}
      {selectedUseCaseDetails && (
        <section className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Use Case Details: <span className="text-indigo-600">{selectedUseCaseDetails.name}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <LuLayoutGrid className="h-4 w-4 mr-2 text-indigo-500" />
              <strong>Model:</strong><span className="ml-2">{selectedUseCaseDetails.model}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <LuDatabase className="h-4 w-4 mr-2 text-blue-500" />
              <strong>Data Sources:</strong><span className="ml-2">{selectedUseCaseDetails.dataSources}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <LuUser className="h-4 w-4 mr-2 text-green-500" />
              <strong>Owner:</strong><span className="ml-2">{selectedUseCaseDetails.owner}</span>
            </div>
          </div>
        </section>
      )}

      {/* Summary Metrics */}
      <section>
        {/* <h2 className="text-xl font-semibold mb-4">Key Metrics Summary</h2> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {summaryMetrics.map((metric) => {
              // Conditionally get icon based on availability
              const Icon = metric.icon || LuTrendingUp; 
              const color = metric.iconColor || 'text-gray-500';
              return (
                <div key={metric.name} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${color.replace('text-', 'bg-')}/10`}>
                        <Icon className={`h-5 w-5 ${color}`}/>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">{metric.name}</h3>
                        <p className="text-2xl font-semibold mb-1">{metric.value}</p>
                        <p className={`text-xs font-medium ${metric.changeType === 'positive' ? 'text-green-600' : metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                            {metric.change} {metric.change ? 'vs last period' : ''}
                        </p>
                    </div>
                </div>
              )
          })}
        </div>
      </section>

      {/* Graphs Section */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold whitespace-nowrap">Metric Trends</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Filter & Date Range - Aligned */}
                <div className="flex items-center justify-end space-x-3">
                    <div className="relative min-w-[150px]">
                        <select
                            className="appearance-none block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm bg-white"
                            value={selectedMetricId}
                            onChange={handleMetricChange}
                        >
                            {availableMetrics.map((metric) => (
                                <option key={metric.id} value={metric.id}>{metric.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <LuFilter className="h-4 w-4" aria-hidden="true" />
                        </div>
                    </div>
                    <div className="min-w-[200px]"> {/* Added min-width for consistent sizing */}
                        <Select 
                            isMulti
                            value={selectedLineKeys}
                            onChange={handleLineChange}
                            options={lineSelectorOptions}
                            className="react-select-container text-sm"
                            classNamePrefix="react-select"
                            isDisabled={lineSelectorOptions.length <= 1} // Disable if only one option
                            placeholder="Select lines..."
                        />
                    </div>
                </div>
            </div>
        </div>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            {selectedLineKeys.length > 0 ? (
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} unit={selectedMetric.unit} width={40} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: '0.375rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {selectedLineKeys.map((lineKeyOption) => (
                        <Line
                            key={lineKeyOption.value}
                            type="monotone"
                            dataKey={lineKeyOption.value}
                            name={lineKeyOption.label}
                            stroke={lineColors[selectedMetric.lines.indexOf(lineKeyOption.value) % lineColors.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                            unit={selectedMetric.unit}
                            connectNulls
                        />
                    ))}
                </LineChart>
            ) : (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    Select sub-metrics to display the chart.
                 </div>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* Additional Analysis: Toxicity, Tokens, Jailbreaks */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* Changed to 3 columns */}
          {/* Toxicity Analysis (Radar Chart) */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-center">Multidimensional Toxicity</h2>
              <div style={{ width: '100%', height: 280 }}>
                   <ResponsiveContainer>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={toxicityDataRadar}>
                          <PolarGrid stroke="#e0e0e0" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} stroke="#666" />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} stroke="#999" />
                          <Radar name="Score" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '4px' }}/>
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Token Distribution (Bar Chart) */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-center">Token Distribution ({selectedTimePeriod === 'Custom' ? 'Custom Range' : selectedTimePeriod})</h2>
              <div style={{ width: '100%', height: 280 }} >
                   <ResponsiveContainer>
                       <BarChart data={tokenDistributionData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#666" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#666"/>
                            <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '4px' }} formatter={(value: number) => value.toLocaleString()}/>
                            <Bar dataKey="value" fill="#6366f1" barSize={40} />
                        </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Jailbreak Attempts (Pie Chart) */}
           <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-center">Jailbreak Attempts by Type</h2>
              <div style={{ width: '100%', height: 280 }} >
                  <ResponsiveContainer>
                       <PieChart>
                           <Pie
                                data={jailbreakData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                // label={renderCustomizedLabel} // Optional: Add custom labels if needed
                                outerRadius={100} 
                                fill="#8884d8"
                                dataKey="attempts"
                                nameKey="rule"
                            >
                                {jailbreakData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                           <Tooltip formatter={(value: number, name: string) => [`${value} attempts`, name]}/>
                           <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                       </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </section>

      {/* Active Pipelines (Visible only when 'All Use Cases' is selected) */}
      {selectedUseCaseId === 'all' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Active Pipelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activePipelines.map((pipeline) => (
              <div key={pipeline.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-base font-semibold text-gray-800 mr-2">{pipeline.name}</h3>
                       <StatusBadge status={pipeline.status} />
                    </div>
                    {/* Key Metrics Mini Row */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3 border-b border-gray-100 pb-2">
                       <div className="text-center">
                          <span className="text-gray-500 block">Accuracy</span>
                          <span className="font-medium">{pipeline.accuracy}%</span>
                       </div>
                       <div className="text-center">
                          <span className="text-gray-500 block">Latency</span>
                          <span className="font-medium">{pipeline.latency}ms</span>
                       </div>
                       <div className="text-center">
                          <span className="text-gray-500 block">Hallucination</span>
                          <span className={`font-medium ${pipeline.hallucination > 5 ? 'text-red-600' : 'text-green-600'}`}>{pipeline.hallucination}%</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex justify-between items-center mt-1">
                   <p className="text-xs text-gray-500">Last run: {pipeline.lastRun}</p>
                   <Link href={`/pipeline/${pipeline.id}`}> 
                     <span className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">
                       Details <LuExternalLink className="ml-1 h-3 w-3" />
                     </span>
                   </Link>
                 </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
