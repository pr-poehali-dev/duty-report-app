import { useState, useCallback } from 'react';
import {
  DutyDay,
  WeekReport,
  getInitialDays,
  saveCurrent,
  getBaseSchedule,
} from '@/lib/duty-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import GradeTable from '@/components/duty/GradeTable';
import Statistics from '@/components/duty/Statistics';
import ExportPanel from '@/components/duty/ExportPanel';
import History from '@/components/duty/History';
import StudentEditor from '@/components/duty/StudentEditor';

const Index = () => {
  const { toast } = useToast();
  const [days, setDays] = useState<DutyDay[]>(getInitialDays);
  const [filter, setFilter] = useState('all');
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState('table');

  const graded = days.flatMap((d) => d.students).filter((s) => s.grade).length;
  const total = days.flatMap((d) => d.students).length;

  const handleReset = () => {
    const fresh = getBaseSchedule();
    saveCurrent(fresh);
    setDays(fresh);
    toast({ title: 'Очищено', description: 'Все оценки сброшены' });
  };

  const handleScheduleSave = (schedule: DutyDay[]) => {
    const fresh = schedule.map(d => ({
      ...d,
      students: d.students.map(s => ({ ...s, grade: '' as const })),
    }));
    saveCurrent(fresh);
    setDays(fresh);
    setActiveTab('table');
  };

  const handleLoadReport = useCallback(
    (report: WeekReport) => {
      const loaded = JSON.parse(JSON.stringify(report.days));
      saveCurrent(loaded);
      setDays(loaded);
      setActiveTab('table');
      toast({ title: 'Загружено', description: `Отчёт от ${report.createdAt} загружен` });
    },
    [toast]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Icon name="ClipboardList" size={22} />
              Отчёт по дежурству
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Оценено {graded} из {total}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <Icon name="RotateCcw" size={14} />
                Сбросить
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Сбросить все оценки?</AlertDialogTitle>
                <AlertDialogDescription>
                  Все текущие оценки будут удалены. Сохранённые отчёты в истории останутся.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Сбросить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <TabsList className="grid grid-cols-5 w-full max-w-lg">
              <TabsTrigger value="table" className="gap-1 text-xs sm:text-sm">
                <Icon name="Table" size={14} />
                <span className="hidden sm:inline">Таблица</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-1 text-xs sm:text-sm">
                <Icon name="BarChart3" size={14} />
                <span className="hidden sm:inline">Статистика</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-1 text-xs sm:text-sm">
                <Icon name="FileOutput" size={14} />
                <span className="hidden sm:inline">Экспорт</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 text-xs sm:text-sm">
                <Icon name="History" size={14} />
                <span className="hidden sm:inline">История</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="gap-1 text-xs sm:text-sm">
                <Icon name="Users" size={14} />
                <span className="hidden sm:inline">Ученики</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === 'table' && (
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все дни</SelectItem>
                  <SelectItem value="ПН">Понедельник</SelectItem>
                  <SelectItem value="ВТ">Вторник</SelectItem>
                  <SelectItem value="СР">Среда</SelectItem>
                  <SelectItem value="ЧТ">Четверг</SelectItem>
                  <SelectItem value="ПТ">Пятница</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value="table" className="mt-0">
            <GradeTable days={days} onChange={setDays} filter={filter} />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <Statistics days={days} />
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <ExportPanel
              days={days}
              onSaved={() => setHistoryKey((k) => k + 1)}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <History refreshKey={historyKey} onLoad={handleLoadReport} />
          </TabsContent>

          <TabsContent value="students" className="mt-0">
            <StudentEditor onSave={handleScheduleSave} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;