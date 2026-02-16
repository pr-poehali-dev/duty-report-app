import { useState } from 'react';
import {
  WeekReport,
  getHistory,
  deleteReport,
  generateReportText,
} from '@/lib/duty-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface HistoryProps {
  refreshKey: number;
  onLoad: (report: WeekReport) => void;
}

export default function History({ refreshKey, onLoad }: HistoryProps) {
  const { toast } = useToast();
  const [history, setHistory] = useState<WeekReport[]>(() => getHistory());
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = () => setHistory(getHistory());

  // re-fetch when refreshKey changes
  if (refreshKey) {
    /* triggers re-render via parent */
  }
  useState(() => refresh());

  const handleDelete = (id: string) => {
    deleteReport(id);
    refresh();
    toast({ title: 'Удалено', description: 'Отчёт удалён из истории' });
  };

  const handleCopy = async (report: WeekReport) => {
    const text = generateReportText(report.days);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    toast({ title: 'Скопировано', description: 'Отчёт скопирован из истории' });
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icon name="Archive" size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Сохранённых отчётов пока нет</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Заполните оценки и сохраните отчёт через вкладку «Экспорт»
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((report) => {
        const graded = report.days
          .flatMap((d) => d.students)
          .filter((s) => s.grade).length;
        const total = report.days.flatMap((d) => d.students).length;
        const isExpanded = expanded === report.id;

        return (
          <Card key={report.id} className="overflow-hidden">
            <CardHeader
              className="pb-2 pt-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : report.id)}
            >
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon
                    name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                    size={16}
                    className="text-muted-foreground"
                  />
                  <span>Отчёт от {report.createdAt}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({graded}/{total} оценок)
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0 pb-4 space-y-3">
                <pre className="text-xs bg-muted/40 rounded-md p-3 whitespace-pre-wrap font-mono leading-relaxed">
                  {generateReportText(report.days)}
                </pre>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(report)}
                    className="gap-1"
                  >
                    <Icon name="Copy" size={14} />
                    Копировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoad(report)}
                    className="gap-1"
                  >
                    <Icon name="Upload" size={14} />
                    Загрузить
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
                        <Icon name="Trash2" size={14} />
                        Удалить
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить отчёт?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Отчёт от {report.createdAt} будет удалён без возможности восстановления.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(report.id)}>
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
