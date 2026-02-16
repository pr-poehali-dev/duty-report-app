import { useState } from 'react';
import { DutyDay, DEFAULT_SCHEDULE, getBaseSchedule, saveCustomSchedule } from '@/lib/duty-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const DAY_LABELS: Record<string, string> = {
  'ПН': 'Понедельник',
  'ВТ': 'Вторник',
  'СР': 'Среда',
  'ЧТ': 'Четверг',
  'ПТ': 'Пятница',
};

interface StudentEditorProps {
  onSave: (schedule: DutyDay[]) => void;
}

export default function StudentEditor({ onSave }: StudentEditorProps) {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<DutyDay[]>(() =>
    getBaseSchedule().map(d => ({ ...d, students: d.students.map(s => ({ ...s, grade: '' as const })) }))
  );

  const updateStudentName = (dayIdx: number, sIdx: number, name: string) => {
    const updated = JSON.parse(JSON.stringify(schedule)) as DutyDay[];
    updated[dayIdx].students[sIdx].name = name;
    setSchedule(updated);
  };

  const addStudent = (dayIdx: number) => {
    const updated = JSON.parse(JSON.stringify(schedule)) as DutyDay[];
    updated[dayIdx].students.push({ name: '', grade: '' });
    setSchedule(updated);
  };

  const removeStudent = (dayIdx: number, sIdx: number) => {
    const updated = JSON.parse(JSON.stringify(schedule)) as DutyDay[];
    updated[dayIdx].students.splice(sIdx, 1);
    setSchedule(updated);
  };

  const updateLessonNumber = (dayIdx: number, num: number) => {
    const updated = JSON.parse(JSON.stringify(schedule)) as DutyDay[];
    updated[dayIdx].number = num;
    setSchedule(updated);
  };

  const handleSave = () => {
    const hasEmpty = schedule.some(d => d.students.some(s => !s.name.trim()));
    if (hasEmpty) {
      toast({ title: 'Заполните имена', description: 'У некоторых учеников не указано имя', variant: 'destructive' });
      return;
    }
    const clean = schedule.map(d => ({
      ...d,
      students: d.students.map(s => ({ name: s.name.trim(), grade: '' as const })),
    }));
    saveCustomSchedule(clean);
    onSave(clean);
    toast({ title: 'Сохранено', description: 'Список учеников обновлён' });
  };

  const handleReset = () => {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)).map((d: DutyDay) => ({
      ...d,
      students: d.students.map((s: { name: string }) => ({ name: s.name, grade: '' })),
    }));
    setSchedule(fresh);
    localStorage.removeItem('duty-schedule');
    onSave(fresh);
    toast({ title: 'Сброшено', description: 'Список учеников восстановлен по умолчанию' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Редактируйте имена, добавляйте или удаляйте учеников
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
              <Icon name="RotateCcw" size={14} />
              По умолчанию
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Сбросить список?</AlertDialogTitle>
              <AlertDialogDescription>
                Список учеников вернётся к начальному. Текущие оценки тоже сбросятся.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Сбросить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {schedule.map((day, dayIdx) => (
        <Card key={day.day} className="overflow-hidden">
          <CardHeader className="py-3 px-4 bg-muted/40">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {day.day}
                </span>
                {DAY_LABELS[day.day]}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                Урок
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={day.number}
                  onChange={(e) => updateLessonNumber(dayIdx, parseInt(e.target.value) || 1)}
                  className="w-14 h-7 text-center text-xs"
                />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {day.students.map((student, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2 group">
                <span className="w-5 text-xs text-muted-foreground text-right shrink-0">
                  {sIdx + 1}.
                </span>
                <Input
                  value={student.name}
                  onChange={(e) => updateStudentName(dayIdx, sIdx, e.target.value)}
                  placeholder="Фамилия Имя"
                  className="h-9 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeStudent(dayIdx, sIdx)}
                  disabled={day.students.length <= 1}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-muted-foreground hover:text-foreground gap-1.5 border border-dashed"
              onClick={() => addStudent(dayIdx)}
            >
              <Icon name="Plus" size={14} />
              Добавить ученика
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSave} className="w-full gap-2 h-11">
        <Icon name="Save" size={16} />
        Сохранить список
      </Button>
    </div>
  );
}
