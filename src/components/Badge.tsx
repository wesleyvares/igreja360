type BadgeProps = {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple' | 'teal' | 'dark';
};

export default function Badge({ children, color = 'gray' }: BadgeProps) {
  return <span className={`badge ${color}`}>{children}</span>;
}
