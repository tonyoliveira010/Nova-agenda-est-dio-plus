import type { WorkingHours, BookingSettings, DayScheduleSlot } from '../types';

export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const durationMinutes = (value = '30 min') => {
  const hours = value.match(/(\d+(?:[.,]\d+)?)\s*h/i);
  const mins = value.match(/(\d+)\s*min/i);
  return Math.max(1, (hours ? Number((hours[1] || '0').replace(',', '.')) * 60 : 0) + (mins ? Number(mins[1] || 0) : hours ? 0 : parseInt(value) || 30));
};
const minutes = (value: string) => { const [h = 0, m = 0] = value.split(':').map(Number); return h * 60 + m; };
export function availableSlots(date: string, duration: number, hours: WorkingHours, settings: BookingSettings, schedule: DayScheduleSlot[], now = new Date()) {
  const day = new Date(`${date}T00:00:00`);
  const key = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][day.getDay()] || 'dom';
  if (!hours.days.includes(key) || hours.blockedDates?.includes(date)) return [];
  const window = hours.overrides?.[key] || hours;
  const start = minutes(window.start), end = minutes(window.end);
  const buffer = Math.max(0, Number(settings.bufferMinutes) || 0);
  const step = Math.max(1, duration + buffer);
  const occupied = schedule.filter(slot => (slot.date || localDate(now)) === date && slot.type !== 'free');
  const result: string[] = [];
  for (let time = start; time + duration <= end; time += step) {
    const value = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
    if (new Date(`${date}T${value}:00`).getTime() < now.getTime() + Math.max(0, settings.minAdvanceHours) * 3600000) continue;
    if (occupied.some(slot => time < minutes(slot.time) + (slot.durationMinutes || 30) + buffer && time + duration + buffer > minutes(slot.time))) continue;
    result.push(value);
  }
  return result;
}