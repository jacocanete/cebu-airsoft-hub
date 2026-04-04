interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, className = "" }: PageHeaderProps) {
  return (
    <div className={`border-l-2 border-primary pl-3 ${className}`}>
      <p className="label-military text-primary">{eyebrow}</p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
