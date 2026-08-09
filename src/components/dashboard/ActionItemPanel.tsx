import { AlertTriangle } from 'lucide-react';
import type { RiskActionItem as ActionItem } from '../../models';

interface Props {
  items: ActionItem[];
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'var(--critical)',
  high:     'var(--high)',
  medium:   'var(--medium)',
  low:      'var(--low)',
};

export default function ActionItemPanel({ items }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <AlertTriangle size={14} color="var(--critical)" />
          My Action Items
        </div>
        <span className="panel-count">{items.length}</span>
      </div>

      <div className="panel-body">
        {items.map(item => (
          <div key={item.id} className="action-item">
            <div
              className="action-item-dot"
              style={{ background: SEVERITY_COLOR[item.severity] }}
            />
            <div className="action-item-content">
              <div className="action-item-title">{item.title}</div>
              <div className="action-item-meta">
                <span>{item.domainName}</span>
                <span>·</span>
                <span>
                  {(item.daysOverdue ?? 0) > 0 ? (
                    <span className="overdue-tag">Overdue {item.daysOverdue}d</span>
                  ) : (
                    `Due ${new Date(item.dueDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}`
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
