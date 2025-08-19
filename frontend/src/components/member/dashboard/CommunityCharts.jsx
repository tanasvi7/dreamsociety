import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Briefcase, 
  MapPin, 
  Building,
  TrendingUp,
  Globe,
  Target,
  Activity
} from 'lucide-react';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-2xl">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-700">{entry.name}:</span>
            <span className="font-semibold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Community Overview Stats
export const CommunityOverview = ({ stats }) => {
  const overviewData = [
    {
      label: 'Total Members',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Active Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Recent Jobs',
      value: stats?.recentJobs || 0,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'New Members',
      value: stats?.recentMembers || 0,
      icon: Activity,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <div className="flex items-center mb-4 sm:mb-6">
        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mr-2 sm:mr-3" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Community Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {overviewData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className={`${item.bgColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-4 h-4 sm:w-6 sm:h-6 ${item.textColor}`} />
                <span className="text-xs text-gray-500">Live</span>
              </div>
              <div className={`text-lg sm:text-2xl font-bold ${item.textColor} mb-1`}>
                {item.value.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Members by Profession Chart
export const MembersByProfession = ({ data }) => {
  const [selectedProfession, setSelectedProfession] = useState(null);
  
  const chartData = data?.map(item => ({
    profession: item.profession || 'Unknown',
    count: item.count,
    percentage: Math.round((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100)
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center">
          <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Members by Profession</h3>
        </div>
        <div className="text-right">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {data?.reduce((sum, item) => sum + item.count, 0) || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Members</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ profession, percentage }) => `${profession}: ${percentage}%`}
              outerRadius={60}
              className="sm:outerRadius-80"
              fill="#8884d8"
              dataKey="count"
              onMouseEnter={(data) => setSelectedProfession(data)}
              onMouseLeave={() => setSelectedProfession(null)}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="space-y-2 sm:space-y-3">
          {chartData.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedProfession?.profession === item.profession 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onMouseEnter={() => setSelectedProfession(item)}
              onMouseLeave={() => setSelectedProfession(null)}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.profession}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{item.count} members</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 text-sm sm:text-base">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Members by Location Chart
export const MembersByLocation = ({ districtData }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'list'
  
  // Filter out empty districts and sort by count
  const validDistricts = districtData?.filter(item => 
    item.district && item.district.trim() !== '' && item.count > 0
  ) || [];
  
  const sortedData = validDistricts
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // Show top 15 districts for better readability

  const totalMembers = validDistricts.reduce((sum, item) => sum + item.count, 0);
  const totalDistricts = validDistricts.length;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="flex items-center mb-3 sm:mb-0">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Members by District</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              List
            </button>
          </div>
          <div className="text-right">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {totalMembers}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Members</div>
            <div className="text-xs text-gray-500">
              {totalDistricts} districts
            </div>
          </div>
        </div>
      </div>
      
      {sortedData.length > 0 ? (
        <>
          {viewMode === 'chart' ? (
            <div className="mb-4 sm:mb-6">
              <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
                <BarChart data={sortedData} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="district"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    className="sm:text-xs"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    className="sm:text-xs"
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data) => setSelectedLocation(data)}
                    onMouseLeave={() => setSelectedLocation(null)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mb-4 sm:mb-6 max-h-64 sm:max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {sortedData.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedLocation?.district === item.district 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onMouseEnter={() => setSelectedLocation(item)}
                    onMouseLeave={() => setSelectedLocation(null)}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.district}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{item.count} members</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm sm:text-base">{item.count}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((item.count / totalMembers) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-sm sm:text-lg font-bold text-gray-900">{totalDistricts}</div>
              <div className="text-xs text-gray-600">Total Districts</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-sm sm:text-lg font-bold text-green-600">
                {sortedData.length > 0 ? sortedData[0].district : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Top District</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-sm sm:text-lg font-bold text-blue-600">
                {sortedData.length > 0 ? sortedData[0].count : 0}
              </div>
              <div className="text-xs text-gray-600">Highest Count</div>
            </div>
          </div>
          
          {/* Location Details */}
          {selectedLocation && (
            <div className="mt-4 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                {selectedLocation.district}
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-600">Total Members</p>
                  <p className="font-semibold text-green-600">{selectedLocation.count}</p>
                </div>
                <div>
                  <p className="text-gray-600">Percentage</p>
                  <p className="font-semibold text-green-600">
                    {Math.round((selectedLocation.count / totalMembers) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm sm:text-base">No district data available</p>
          <p className="text-xs sm:text-sm text-gray-400">Members need to update their profiles with district information</p>
        </div>
      )}
    </div>
  );
};

// Jobs by Type Chart
export const JobsByType = ({ data }) => {
  const [selectedType, setSelectedType] = useState(null);
  
  const chartData = data?.map(item => ({
    type: item.type || 'Unknown',
    count: item.count,
    percentage: Math.round((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100)
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Jobs by Type</h3>
        </div>
        <div className="text-right">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {data?.reduce((sum, item) => sum + item.count, 0) || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Jobs</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="type" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              className="sm:text-xs"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              className="sm:text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(data) => setSelectedType(data)}
              onMouseLeave={() => setSelectedType(null)}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="space-y-2 sm:space-y-3">
          {chartData.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedType?.type === item.type 
                  ? 'bg-purple-50 border border-purple-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onMouseEnter={() => setSelectedType(item)}
              onMouseLeave={() => setSelectedType(null)}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.type}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{item.count} jobs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 text-sm sm:text-base">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Network Connections Chart
export const NetworkConnections = ({ networkStats }) => {
  const connectionData = [
    {
      name: 'Location',
      connections: networkStats?.locationConnections || 0,
      color: '#3b82f6',
      icon: MapPin
    },
    {
      name: 'Profession',
      connections: networkStats?.professionConnections || 0,
      color: '#10b981',
      icon: Building
    },
    {
      name: 'Skills',
      connections: networkStats?.skillConnections || 0,
      color: '#f59e0b',
      icon: Target
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Network</h3>
        </div>
        <div className="text-right">
          <div className="text-lg sm:text-2xl font-bold text-indigo-600">
            {networkStats?.totalConnections || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Connections</div>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {connectionData.map((item, index) => {
          const IconComponent = item.icon;
          const percentage = networkStats?.totalConnections > 0 
            ? Math.round((item.connections / networkStats.totalConnections) * 100)
            : 0;
          
          return (
            <div key={index} className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.name} Connections</span>
                </div>
                <span className="text-base sm:text-lg font-bold" style={{ color: item.color }}>
                  {item.connections}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-600">
                <span>{percentage}% of total</span>
                <span>{item.connections} members</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
