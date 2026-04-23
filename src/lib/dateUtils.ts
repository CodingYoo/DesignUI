export function getWeekRangeAsString(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  // adjust day so Monday is 0, Sunday is 6
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff); // start of week is Monday
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // End of week is Sunday

  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, options)} - ${end.getDate()}`;
}

export function getWeekNumber(d: Date) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(( ( (d.valueOf() - yearStart.valueOf()) / 86400000) + 1)/7);
  return weekNo;
}

export function getDaysOfCurrentWeek(currentDate: Date) {
  const start = new Date(currentDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}
