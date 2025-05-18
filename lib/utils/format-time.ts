import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function formattedTime(time: string) {
  return format(new Date(time), 'dd MMMM yyyy, HH:mm', { locale: id });
}
