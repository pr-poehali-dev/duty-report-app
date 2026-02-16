import { DutyDay, Grade, GRADES, getGradeBg, saveCurrent } from '@/lib/duty-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GradeTableProps {
  days: DutyDay[];
  onChange: (days: DutyDay[]) => void;
  filter: string;
}

export default function GradeTable({ days, onChange, filter }: GradeTableProps) {
  const handleGradeChange = (dayIdx: number, studentIdx: number, grade: Grade) => {
    const updated = JSON.parse(JSON.stringify(days)) as DutyDay[];
    updated[dayIdx].students[studentIdx].grade = grade;
    saveCurrent(updated);
    onChange(updated);
  };

  const filteredDays =
    filter === 'all' ? days : days.filter((d) => d.day === filter);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60">
            <TableHead className="w-[80px] font-semibold text-foreground">День</TableHead>
            <TableHead className="w-[50px] font-semibold text-foreground text-center">Урок</TableHead>
            <TableHead className="font-semibold text-foreground">Ученик</TableHead>
            <TableHead className="w-[120px] font-semibold text-foreground text-center">Оценка</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDays.map((day, dayIdx) => {
            const realDayIdx = days.indexOf(day);
            return day.students.map((student, sIdx) => (
              <TableRow
                key={`${day.day}-${sIdx}`}
                className="hover:bg-muted/30 transition-colors"
              >
                {sIdx === 0 && (
                  <>
                    <TableCell
                      rowSpan={day.students.length}
                      className="font-bold text-base border-r align-middle"
                    >
                      {day.day}
                    </TableCell>
                    <TableCell
                      rowSpan={day.students.length}
                      className="text-center text-muted-foreground border-r align-middle"
                    >
                      {day.number}
                    </TableCell>
                  </>
                )}
                <TableCell className="py-2">{student.name}</TableCell>
                <TableCell className="py-2 text-center">
                  <Select
                    value={student.grade || 'none'}
                    onValueChange={(val) =>
                      handleGradeChange(realDayIdx, sIdx, val === 'none' ? '' as Grade : val as Grade)
                    }
                  >
                    <SelectTrigger
                      className={`w-[90px] mx-auto h-8 text-sm font-medium border ${
                        student.grade ? getGradeBg(student.grade) : ''
                      }`}
                    >
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {GRADES.filter((g) => g !== '').map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
}
