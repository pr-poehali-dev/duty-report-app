export type Grade = '' | '2' | '2+' | '3-' | '3' | '3+' | '4-' | '4' | '4+' | '5-' | '5' | '5+';

export const GRADES: Grade[] = ['', '2', '2+', '3-', '3', '3+', '4-', '4', '4+', '5-', '5', '5+'];

export interface DutyStudent {
  name: string;
  grade: Grade;
}

export interface DutyDay {
  day: string;
  number: number;
  students: DutyStudent[];
}

export interface WeekReport {
  id: string;
  createdAt: string;
  days: DutyDay[];
}

export const DEFAULT_SCHEDULE: DutyDay[] = [
  {
    day: 'ПН', number: 2, students: [
      { name: 'Игнатова Милана', grade: '' },
      { name: 'Кетова Анита', grade: '' },
      { name: 'Луданина Елена', grade: '' },
    ],
  },
  {
    day: 'ВТ', number: 3, students: [
      { name: 'Макаров Федор', grade: '' },
      { name: 'Мамедов Амир', grade: '' },
      { name: 'Мелешко Дарья', grade: '' },
    ],
  },
  {
    day: 'СР', number: 4, students: [
      { name: 'Напалков Назар', grade: '' },
      { name: 'Овсянникова София', grade: '' },
      { name: 'Пазынюк Максим', grade: '' },
    ],
  },
  {
    day: 'ЧТ', number: 5, students: [
      { name: 'Попов Тимофей', grade: '' },
      { name: 'Пустоветова Дарья', grade: '' },
      { name: 'Руденко Кирилл', grade: '' },
    ],
  },
  {
    day: 'ПТ', number: 6, students: [
      { name: 'Савицкий Николай', grade: '' },
      { name: 'Семёнов Матвей', grade: '' },
      { name: 'Хлебова Елизавета', grade: '' },
    ],
  },
];

export function gradeToNumber(grade: Grade): number {
  if (!grade) return 0;
  const base = parseInt(grade[0]);
  if (grade.endsWith('+')) return base + 0.3;
  if (grade.endsWith('-')) return base - 0.3;
  return base;
}

export function getGradeBg(grade: Grade): string {
  if (!grade) return '';
  if (grade.startsWith('5')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (grade.startsWith('4')) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (grade.startsWith('3')) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

export function generateReportText(
  days: DutyDay[],
  options?: { includeDays?: string[]; includeStats?: boolean; includeBest?: boolean }
): string {
  const opts = {
    includeDays: options?.includeDays || days.map((d) => d.day),
    includeStats: options?.includeStats !== false,
    includeBest: options?.includeBest !== false,
  };

  const filteredDays = days.filter((d) => opts.includeDays.includes(d.day));

  let text = '*Оценки по дежурству за неделю*\n\n';

  for (const day of filteredDays) {
    const studentsText = day.students
      .map((s) => `${s.name} ${s.grade || '—'}`)
      .join(', ');
    text += `${day.day}(${day.number}): ${studentsText}.\n\n`;
  }

  if (opts.includeStats) {
    const allStudents = filteredDays.flatMap((d) => d.students).filter((s) => s.grade);
    const high = allStudents.filter((s) => s.grade.startsWith('5'));
    const medium = allStudents.filter((s) => s.grade.startsWith('4'));
    const low = allStudents.filter(
      (s) => s.grade && (s.grade.startsWith('3') || s.grade.startsWith('2'))
    );

    text += '\nОбщая статистика:\n';
    if (high.length > 0) {
      text += `- Высокие оценки (5 или 5+): ${high.map((s) => s.name).join(', ')}.\n\n`;
    }
    if (medium.length > 0) {
      text += `- Средние оценки (4 или 4+):\n${medium.map((s) => s.name).join(', ')}.\n`;
    }
    if (low.length > 0) {
      text += `\n- Низкие оценки (ниже 4): ${low.map((s) => s.name).join(', ')}.\n`;
    }

    if (opts.includeBest && allStudents.length > 0) {
      const best = allStudents.reduce((a, b) =>
        gradeToNumber(a.grade) >= gradeToNumber(b.grade) ? a : b
      );
      text += `\nЛучший дежурный за неделю 👑: ${best.name}.`;
    }
  }

  return text;
}

export function saveReport(days: DutyDay[]): WeekReport {
  const report: WeekReport = {
    id: Date.now().toString(),
    createdAt: new Date().toLocaleDateString('ru-RU'),
    days: JSON.parse(JSON.stringify(days)),
  };
  const history = getHistory();
  history.unshift(report);
  if (history.length > 50) history.pop();
  localStorage.setItem('duty-history', JSON.stringify(history));
  return report;
}

export function getHistory(): WeekReport[] {
  try {
    return JSON.parse(localStorage.getItem('duty-history') || '[]');
  } catch {
    return [];
  }
}

export function deleteReport(id: string): void {
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem('duty-history', JSON.stringify(history));
}

export function getInitialDays(): DutyDay[] {
  try {
    const saved = localStorage.getItem('duty-current');
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
}

export function saveCurrent(days: DutyDay[]): void {
  localStorage.setItem('duty-current', JSON.stringify(days));
}
