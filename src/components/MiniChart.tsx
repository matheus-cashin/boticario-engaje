interface MiniChartProps {
  data?: number[];
  color?: string;
}

const MiniChart = ({ data = Array.from({ length: 12 }, () => Math.random() * 100), color = "success" }: MiniChartProps) => {
  const maxValue = Math.max(...data);

  return (
    <div className="flex items-end gap-[2px] h-12 mt-2">
      {data.map((value, index) => (
        <div
          key={index}
          className={`flex-1 rounded-t-sm bg-${color}/40`}
          style={{ height: `${(value / maxValue) * 100}%` }}
        />
      ))}
    </div>
  );
};

export default MiniChart;
