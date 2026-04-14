"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type GameChartProps = {
  games: {
    id: number;
    title: string;
    console: { name: string };
    releaseDate: string;
  }[];
};

const PIE_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#14b8a6", "#f97316"];

export default function DashboardCharts({ games }: GameChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth <= 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const gamesByConsole = games.reduce<Record<string, number>>((acc, game) => {
    const consoleName = game.console?.name ?? "Sin consola";
    acc[consoleName] = (acc[consoleName] ?? 0) + 1;
    return acc;
  }, {});

  const gamesByYear = games.reduce<Record<string, number>>((acc, game) => {
    const year = new Date(game.releaseDate).getFullYear().toString();
    acc[year] = (acc[year] ?? 0) + 1;
    return acc;
  }, {});

  const consoleData = Object.entries(gamesByConsole).map(([name, value]) => ({ name, value }));
  const yearData = Object.entries(gamesByYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Juegos por consola</h2>
            <p className="text-sm text-gray-500">Gráfica de pastel con cantidad de juegos por consola.</p>
          </div>
        </div>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={consoleData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                label
              >
                {consoleData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Juegos por año</h2>
            <p className="text-sm text-gray-500">Gráfica de barras con la cantidad de juegos según su año de lanzamiento.</p>
          </div>
        </div>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData} margin={{ top: 10, right: 24, left: 0, bottom: isMobile ? 32 : 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                interval={0}
                height={isMobile ? 60 : 40}
                tick={{
                  fontSize: isMobile ? 10 : 12,
                  angle: isMobile ? -45 : 0,
                  textAnchor: isMobile ? "end" : "middle",
                }}
                tickMargin={isMobile ? 12 : 8}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="count" name="Juegos" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
