import { useState } from 'react';
import { DutyDay, generateReportText, saveReport } from '@/lib/duty-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface ExportPanelProps {
  days: DutyDay[];
  onSaved: () => void;
}

const DAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ'];

export default function ExportPanel({ days, onSaved }: ExportPanelProps) {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<string[]>(DAY_LABELS);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeBest, setIncludeBest] = useState(true);

  const reportText = generateReportText(days, {
    includeDays: selectedDays,
    includeStats,
    includeBest,
  });

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      toast({ title: 'Скопировано', description: 'Отчёт скопирован в буфер обмена' });
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = reportText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast({ title: 'Скопировано', description: 'Отчёт скопирован в буфер обмена' });
    }
  };

  const handleSave = () => {
    saveReport(days);
    onSaved();
    toast({ title: 'Сохранено', description: 'Отчёт добавлен в историю' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon name="Filter" size={16} />
            Фильтры экспорта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase font-medium tracking-wide">Дни</p>
            <div className="flex flex-wrap gap-3">
              {DAY_LABELS.map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <span className="text-sm font-medium">{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={includeStats}
                onCheckedChange={(v) => setIncludeStats(v === true)}
              />
              <span className="text-sm">Статистика</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={includeBest}
                onCheckedChange={(v) => setIncludeBest(v === true)}
              />
              <span className="text-sm">Лучший дежурный</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon name="FileText" size={16} />
            Предпросмотр отчёта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={reportText}
            readOnly
            className="min-h-[260px] font-mono text-sm leading-relaxed resize-none"
          />
          <div className="flex gap-3">
            <Button onClick={handleCopy} className="flex-1 gap-2">
              <Icon name="Copy" size={16} />
              Копировать
            </Button>
            <Button variant="outline" onClick={handleSave} className="flex-1 gap-2">
              <Icon name="Save" size={16} />
              Сохранить в историю
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
