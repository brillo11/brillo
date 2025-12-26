"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

const data = [
  { name: "Jan", income: 4000, students: 240 },
  { name: "Feb", income: 3000, students: 139 },
  { name: "Mar", income: 2000, students: 980 },
  { name: "Apr", income: 2780, students: 390 },
  { name: "May", income: 1890, students: 480 },
  { name: "Jun", income: 2390, students: 380 },
  { name: "Jul", income: 3490, students: 430 },
];

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
}) => (
  <div className="bg-vzx-card border border-white/5 p-6 rounded-2xl hover:border-[#33DB98]/50 transition-colors duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-vzx-bg rounded-lg">
        <Icon className="w-6 h-6 text-[#33DB98]" />
      </div>
      <span
        className={`text-sm font-medium ${
          change.startsWith("+") ? "text-[#33DB98]" : "text-red-500"
        }`}
      >
        {change}
      </span>
    </div>
    <h3 className="text-gray-400 text-sm uppercase tracking-wide">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in p-8 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">대시보드</h1>
        <p className="text-gray-400">
          강사님 환영합니다. 성장 지표를 확인해보세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 수익"
          value="$124,592"
          change="+12.5%"
          icon={DollarSign}
        />
        <StatCard
          title="활성 수강생"
          value="1,429"
          change="+5.2%"
          icon={Users}
        />
        <StatCard
          title="콘텐츠 도달"
          value="850K"
          change="+24.3%"
          icon={TrendingUp}
        />
        <StatCard
          title="SaaS 사용량"
          value="89%"
          change="+2.1%"
          icon={Activity}
        />
      </div>

      {/* Main Chart */}
      <div className="bg-vzx-card border border-white/5 rounded-2xl p-6 h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">수익 성장률</h2>
          <select className="bg-vzx-bg border border-white/10 text-white text-sm rounded-lg px-3 py-1 outline-none focus:border-[#33DB98]">
            <option>최근 6개월</option>
            <option>최근 1년</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#33db98" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#33db98" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#666"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#666"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#121212",
                borderColor: "#333",
                color: "#fff",
              }}
              itemStyle={{ color: "#33db98" }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#33db98"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity / SaaS Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vzx-card border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            콘텐츠 파이프라인
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "SEO 마스터클래스 블로그",
                status: "발행됨",
                date: "2시간 전",
              },
              {
                title: "유튜브 쇼츠 - 4주차",
                status: "처리중",
                date: "5시간 전",
              },
              {
                title: "쓰레드: 확장하는 5가지 방법",
                status: "초안",
                date: "1일 전",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "발행됨"
                        ? "bg-[#33DB98]"
                        : item.status === "처리중"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  />
                  <span className="text-gray-300 font-medium">
                    {item.title}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-vzx-card border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            SaaS 도구 상태
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded text-blue-400 font-bold text-xs">
                  YT
                </div>
                <div>
                  <div className="text-white font-medium">
                    유튜브 순위 추적기
                  </div>
                  <div className="text-xs text-gray-400">배포됨 • v2.1.0</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-800">
                정상 작동
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded text-purple-400 font-bold text-xs">
                  IG
                </div>
                <div>
                  <div className="text-white font-medium">해시태그 생성기</div>
                  <div className="text-xs text-gray-400">배포됨 • v1.4.2</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-800">
                정상 작동
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
