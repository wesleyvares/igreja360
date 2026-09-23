import { Bar, Doughnut } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  ArcElement,
  Tooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type ChartBoxProps = {
  title: string;
  subtitle: string;
  labels: string[];
  values: number[];
  type?: 'bar' | 'doughnut';
};

export default function ChartBox({ title, subtitle, labels, values, type = 'bar' }: ChartBoxProps) {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="chart-box">
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {type === 'doughnut' ? <Doughnut data={data} /> : <Bar data={data} />}
    </div>
  );
}
