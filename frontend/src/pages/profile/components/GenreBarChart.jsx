import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function GenreBarChart({ genreMap }) {
  const data = Object.entries(genreMap).map(([name, count]) => ({
    name,
    count,
  }));
  if (!data.length) return <p className="text-white-300">No genres yet.</p>;

  return (
    <div className="h-48 bg-black-200 p-3 rounded">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20 }}>
          <XAxis dataKey="name" tick={{ fill: "#E6E6F0" }} />
          <YAxis tick={{ fill: "#E6E6F0" }} />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
