import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Users, 
  Briefcase,
  Star,
  Zap,
  Activity,
  BarChart3,
  Eye,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus
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

// Enhanced Application Trend with Area Chart and Annotations
export const ApplicationTrend = ({ data }) => {
  const chartData = data?.months?.map((month, index) => ({
    month,
    applications: data.applicationCounts[index] || 0,
    target: 15, // Target applications per month
    trend: data.applicationCounts[index] > (data.applicationCounts[index - 1] || 0) ? 'up' : 'down'
  })) || [];

  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Application Momentum</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Applications</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Target</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="applicationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#targetGradient)"
            name="Target"
          />
          <Area
            type="monotone"
            dataKey="applications"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#applicationGradient)"
            name="Applications"
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ 
              fill: '#3b82f6', 
              strokeWidth: 3, 
              r: 6,
              stroke: '#ffffff'
            }}
            activeDot={{ 
              r: 8, 
              stroke: '#3b82f6', 
              strokeWidth: 2,
              fill: '#ffffff'
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Trend Indicators */}
      <div className="flex justify-between mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="text-center">
            {item.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500 mx-auto" />}
            {item.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500 mx-auto" />}
            {item.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400 mx-auto" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// Interactive Gauge Chart for Success Rate
export const SuccessRate = ({ successRate, endorsementRate }) => {
  const [hovered, setHovered] = useState(false);

  const gaugeData = [
    { name: 'Success Rate', value: successRate, fill: '#10b981' },
    { name: 'Remaining', value: 100 - successRate, fill: '#e5e7eb' }
  ];

  const getSuccessLevel = (rate) => {
    if (rate >= 80) return { level: 'Excellent', color: '#10b981', icon: '🎯' };
    if (rate >= 60) return { level: 'Good', color: '#f59e0b', icon: '⭐' };
    if (rate >= 40) return { level: 'Fair', color: '#f97316', icon: '📈' };
    return { level: 'Needs Improvement', color: '#ef4444', icon: '💪' };
  };

  const successLevel = getSuccessLevel(successRate);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Success Analytics</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          successLevel.color === '#10b981' ? 'bg-green-100 text-green-800' :
          successLevel.color === '#f59e0b' ? 'bg-yellow-100 text-yellow-800' :
          successLevel.color === '#f97316' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {successLevel.icon} {successLevel.level}
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="90%"
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill="#10b981"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-bold transition-all duration-300 ${
                hovered ? 'scale-110' : 'scale-100'
              }`} style={{ color: successLevel.color }}>
                {successRate}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Endorsement Rate</p>
              <p className="text-2xl font-bold text-green-600">{endorsementRate}%</p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((successRate + endorsementRate) / 2)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Radar Chart for Skill Assessment
export const EndorsementRate = ({ endorsementRate }) => {
  const skillData = [
    { skill: 'Technical Skills', value: endorsementRate, fullMark: 100 },
    { skill: 'Communication', value: Math.min(endorsementRate + 10, 100), fullMark: 100 },
    { skill: 'Leadership', value: Math.max(endorsementRate - 15, 0), fullMark: 100 },
    { skill: 'Problem Solving', value: Math.min(endorsementRate + 5, 100), fullMark: 100 },
    { skill: 'Teamwork', value: Math.min(endorsementRate + 8, 100), fullMark: 100 },
    { skill: 'Innovation', value: Math.max(endorsementRate - 8, 0), fullMark: 100 }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Award className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Skill Radar</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{endorsementRate}%</div>
          <div className="text-sm text-gray-600">Avg. Endorsement</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={skillData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
          />
          <Radar
            name="Skills"
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Skill Insights */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {skillData.slice(0, 4).map((skill, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-600">{skill.skill}</span>
            <span className="text-xs font-semibold text-purple-600">{skill.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Interactive Bubble Chart for Top Skills
export const TopSkills = ({ skills }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const bubbleData = skills?.map((skill, index) => ({
    skill,
    endorsements: Math.floor(Math.random() * 20) + 5,
    demand: Math.floor(Math.random() * 100) + 20,
    growth: Math.floor(Math.random() * 50) + 10,
    size: Math.floor(Math.random() * 30) + 20
  })) || [];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Zap className="w-6 h-6 text-orange-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Skills Ecosystem</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Endorsements</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Demand</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            dataKey="endorsements" 
            name="Endorsements"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            type="number" 
            dataKey="demand" 
            name="Demand"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            data={bubbleData} 
            fill="#3b82f6"
            onMouseEnter={(data) => setSelectedSkill(data)}
            onMouseLeave={() => setSelectedSkill(null)}
          >
            {bubbleData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={selectedSkill?.skill === entry.skill ? '#ef4444' : '#3b82f6'}
                opacity={0.7}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Selected Skill Details */}
      {selectedSkill && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2">{selectedSkill.skill}</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Endorsements</p>
              <p className="font-semibold text-blue-600">{selectedSkill.endorsements}</p>
            </div>
            <div>
              <p className="text-gray-600">Demand</p>
              <p className="font-semibold text-green-600">{selectedSkill.demand}%</p>
            </div>
            <div>
              <p className="text-gray-600">Growth</p>
              <p className="font-semibold text-purple-600">+{selectedSkill.growth}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Funnel Chart for Application Journey
export const ApplicationStatus = ({ totalApplications, acceptedApplications }) => {
  const rejectedApplications = totalApplications - acceptedApplications;
  const interviews = Math.floor(acceptedApplications * 0.7);
  const offers = Math.floor(interviews * 0.4);
  
  const funnelData = [
    { name: 'Applications', value: totalApplications, fill: '#3b82f6' },
    { name: 'Interviews', value: interviews, fill: '#8b5cf6' },
    { name: 'Offers', value: offers, fill: '#10b981' },
    { name: 'Accepted', value: acceptedApplications, fill: '#f59e0b' }
  ];

  const getConversionRate = (current, previous) => {
    return previous > 0 ? Math.round((current / previous) * 100) : 0;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Briefcase className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Application Funnel</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{totalApplications}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <ResponsiveContainer width="60%" height={300}>
          <FunnelChart>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
              labelFormatter={(value) => `${value} applications`}
            />
          </FunnelChart>
        </ResponsiveContainer>
      </div>
      
      {/* Conversion Rates */}
      <div className="grid grid-cols-2 gap-4">
        {funnelData.slice(0, -1).map((item, index) => {
          const nextItem = funnelData[index + 1];
          const rate = getConversionRate(nextItem.value, item.value);
          return (
            <div key={index} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.name} → {nextItem.name}</span>
                <span className="text-sm font-bold text-green-600">{rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${rate}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// New: Activity Heatmap Component
export const ActivityHeatmap = ({ activities }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Generate last 30 days of activity data
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayActivities = activities?.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.toDateString() === date.toDateString();
      }) || [];
      
      data.push({
        date: date.toISOString().split('T')[0],
        count: dayActivities.length,
        activities: dayActivities
      });
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();
  const maxCount = Math.max(...heatmapData.map(d => d.count));

  const getIntensity = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= maxCount * 0.25) return 'bg-blue-200';
    if (count <= maxCount * 0.5) return 'bg-blue-300';
    if (count <= maxCount * 0.75) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Activity Heatmap</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {activities?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Total Activities</div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
            {day}
          </div>
        ))}
        
        {heatmapData.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 ${
              getIntensity(day.count)
            } ${selectedDay?.date === day.date ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedDay(day)}
            title={`${day.date}: ${day.count} activities`}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
      
      {/* Selected Day Details */}
      {selectedDay && selectedDay.count > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            {new Date(selectedDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          <div className="space-y-2">
            {selectedDay.activities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{activity.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// New: Performance Metrics Dashboard
export const PerformanceMetrics = ({ analytics }) => {
  const metrics = [
    {
      title: 'Response Rate',
      value: analytics?.responseRate || 75,
      change: '+12%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Interview Rate',
      value: analytics?.interviewRate || 45,
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Offer Rate',
      value: analytics?.offerRate || 25,
      change: '+5%',
      trend: 'up',
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Time to Offer',
      value: analytics?.timeToOffer || 14,
      change: '-2 days',
      trend: 'down',
      icon: Clock,
      color: 'orange'
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-6 h-6 text-indigo-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-900">Performance Metrics</h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <IconComponent className={`w-6 h-6 text-${metric.color}-600`} />
                <div className={`flex items-center text-xs font-semibold ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}{metric.title.includes('Time') ? ' days' : '%'}
              </div>
              <div className="text-sm text-gray-600">{metric.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 