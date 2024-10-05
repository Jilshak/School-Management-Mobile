export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateToYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.getFullYear().toString();
};

export const formatDateToLongFormat = (date: Date | string): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

