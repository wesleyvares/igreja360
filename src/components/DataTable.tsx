import EmptyState from './EmptyState';

type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  minWidth?: number;
};

export default function DataTable<T>({ columns, rows, minWidth = 900 }: DataTableProps<T>) {
  if (!rows.length) return <EmptyState />;

  return (
    <div className="table-wrap">
      <table style={{ minWidth }}>
        <thead>
          <tr>{columns.map((col) => <th key={col.header}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>{columns.map((col) => <td key={col.header}>{col.render(row)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
