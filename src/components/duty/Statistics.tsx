import { DutyDay, gradeToNumber } from '@/lib/duty-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StatisticsProps {
  days: DutyDay[];
}

export default function Statistics({ days }: StatisticsProps) {
  const allStudents = days.flatMap((d) => d.students).filter((s) => s.grade);
  const graded = allStudents.length;
  const total = days.flatMap((d) => d.students).length;

  const high = allStudents.filter((s) => s.grade.startsWith('5'));
  const medium = allStudents.filter((s) => s.grade.startsWith('4'));
  const low = allStudents.filter(
    (s) => s.grade.startsWith('3') || s.grade.startsWith('2')
  );

  const avg =
    graded > 0
      ? (allStudents.reduce((sum, s) => sum + gradeToNumber(s.grade), 0) / graded).toFixed(2)
      : '—';

  const best =
    allStudents.length > 0
      ? allStudents.reduce((a, b) =>
          gradeToNumber(a.grade) >= gradeToNumber(b.grade) ? a : b
        )
      : null;

  const chartData = days.map((d) => {
    const dayStudents = d.students.filter((s) => s.grade);
    const dayAvg =
      dayStudents.length > 0
        ? dayStudents.reduce((sum, s) => sum + gradeToNumber(s.grade), 0) / dayStudents.length
        : 0;
    return { day: d.day, avg: parseFloat(dayAvg.toFixed(2)) };
  });

  const barColors = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Оценено
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{graded}/{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Средний балл
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{avg}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Отличники
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-600">{high.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Лучший
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-sm font-bold flex items-center gap-1">
              {best ? (
                <>
                  <span>👑</span>
                  <span className="truncate">{best.name.split(' ')[0]}</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {graded > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Средний балл по дням
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={13} fontWeight={600} />
                  <YAxis domain={[0, 5.5]} fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(2), 'Средний балл']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {graded > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {high.length > 0 && (
            <Card className="border-emerald-200">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                  Высокие оценки (5, 5+)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-1">
                  {high.map((s, i) => (
                    <li key={i} className="text-sm flex items-center justify-between">
                      <span>{s.name}</span>
                      <span className="font-semibold text-emerald-700">{s.grade}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {medium.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Средние оценки (4, 4+)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-1">
                  {medium.map((s, i) => (
                    <li key={i} className="text-sm flex items-center justify-between">
                      <span>{s.name}</span>
                      <span className="font-semibold text-blue-700">{s.grade}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {low.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Низкие оценки
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-1">
                  {low.map((s, i) => (
                    <li key={i} className="text-sm flex items-center justify-between">
                      <span>{s.name}</span>
                      <span className="font-semibold text-amber-700">{s.grade}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
