import React from 'react';
import { DollarSign, Calendar, Users, Activity } from 'lucide-react';
import { DashboardStats } from '../hooks/useDashboardData';

export const DashboardKPIs = ({ stats }: { stats: DashboardStats | null }) => {
  if (!stats) return null;

  // Formatting helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Revenue Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
          <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center">
            {formatPercent(stats.revenueGrowth)} <span className="text-gray-400 ml-1 font-normal">from last month</span>
          </p>
        </div>
      </div>

      {/* Appointments Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Appointments (Week)</h3>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.appointmentsThisWeek}</p>
          <p className="text-sm font-medium text-blue-600 mt-2 flex items-center">
            High Density <span className="text-gray-400 ml-1 font-normal">projected</span>
          </p>
        </div>
      </div>

      {/* Active Patients Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Active Patients</h3>
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.activePatients}</p>
          <p className="text-sm font-medium text-gray-500 mt-2 flex items-center">
            Seen in last 6 months
          </p>
        </div>
      </div>

      {/* No-Show Rate Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">No-Show Rate</h3>
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.noShowRate}%</p>
          <p className="text-sm font-medium text-rose-600 mt-2 flex items-center">
            Needs attention <span className="text-gray-400 ml-1 font-normal">avg 2.1%</span>
          </p>
        </div>
      </div>
    </div>
  );
};
