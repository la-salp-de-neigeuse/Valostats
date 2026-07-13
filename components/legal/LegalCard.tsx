import { Card } from "@/components/ui/card";

interface LegalDetail {
  label: string;
  value: string;
}

interface LegalCardProps {
  title: string;
  content: string | readonly string[] | null;
  items?: readonly string[];
  details?: readonly LegalDetail[];
  paragraphs?: readonly string[];
}

export function LegalCard({ title, content, items, details, paragraphs }: LegalCardProps) {
  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-text-primary mb-4">{title}</h2>

      {content && (
        <div className="space-y-3">
          {Array.isArray(content) ? (
            content.map((p, i) => (
              <p key={i} className="text-sm text-text-secondary leading-relaxed">{p}</p>
            ))
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed">{content}</p>
          )}
        </div>
      )}

      {items && items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {paragraphs && paragraphs.length > 0 && (
        <div className="mt-3 space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-text-secondary leading-relaxed">{p}</p>
          ))}
        </div>
      )}

      {details && details.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {details.map((d) => {
            const isEmail = d.value.includes("@");
            return (
              <div key={d.label} className="flex items-center gap-2 text-sm">
                <span className="text-text-muted font-medium">{d.label} :</span>
                {isEmail ? (
                  <a
                    href={`mailto:${d.value}`}
                    className="text-accent hover:text-accent-hover underline-offset-2 hover:underline transition-colors"
                  >
                    {d.value}
                  </a>
                ) : (
                  <span className="text-text-primary">{d.value}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
