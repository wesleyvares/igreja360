type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  full?: boolean;
};

export default function FormField({ label, children, full }: FormFieldProps) {
  return <label className={full ? 'full' : undefined}>{label}{children}</label>;
}
