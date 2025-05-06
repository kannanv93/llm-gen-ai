import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Select, { MultiValue } from 'react-select';

interface DashboardPageProps { 
    // Optional props if needed
}

export default function DashboardPage({}: DashboardPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(() => {
      return searchParams.get('pipelineId') || pipelines[0]?.id || '';
  });
  const [timeRange, setTimeRange] = useState<TimeRangeOption>(defaultTimeRange);
  const [dateRange, setDateRange] = useState<DateRange | null>(() => getDateRangeFromTimeOption(defaultTimeRange));
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Specific state for the line chart metric selector
  const [selectedLineKeys, setSelectedLineKeys] = useState<MultiValue<SelectOption>>([]);
  const [isClient, setIsClient] = useState(false);

  // Effect to set client state after mount
  useEffect(() => {
      setIsClient(true);
  }, []);

  // ... existing useEffects ...

  // Derived Data / Calculations
  // ... existing calculations ...

  // Prepare options for the line key selector
  const lineSelectorOptions: SelectOption[] = useMemo(() => {
      // ... options generation ...
  }, [overviewMetrics]); // Assuming options depend on overviewMetrics

  // Initialize selectedLineKeys based on options once available
  useEffect(() => {
      if (lineSelectorOptions.length > 0 && selectedLineKeys.length === 0) {
          // Select first 3 metrics by default, or fewer if not available
          setSelectedLineKeys(lineSelectorOptions.slice(0, 3));
      }
  }, [lineSelectorOptions]); // Run when options are populated

  // ... handleFetchData, handleTimeRangeChange ...

  return (
      <div className="space-y-6">
          {/* ... Header, Pipeline Selector, Time Range Selector ... */}

          {/* Overview Metrics Grid */}
          {/* ... */}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart: Metric Trends */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Metric Trends</h3>
                     {/* Sub-Metric Selector (react-select) */}
                     <div className="w-full sm:w-80 z-10">
                        {isClient && (
                             <Select<SelectOption, true>
                                 isMulti
                                 options={lineSelectorOptions}
                                 value={selectedLineKeys}
                                 onChange={(selected) => setSelectedLineKeys(selected)}
                                 className="text-sm react-select-container"
                                 classNamePrefix="react-select"
                                 placeholder="Select metrics..."
                                 closeMenuOnSelect={false}
                                 hideSelectedOptions={false}
                                 isDisabled={isLoading}
                             />
                        )}
                     </div>
                  </div>
                  {/* ... Chart rendering ... */}
              </div>

              {/* Bar Chart: Evaluation Issues */}
              {/* ... */}
          </div>

          {/* Other sections maybe? */}

      </div>
  );
} 