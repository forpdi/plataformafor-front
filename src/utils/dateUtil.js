import moment from 'moment';

const datePattern = 'DD/MM/YYYY';
const dateTimePattern = `${datePattern} HH:mm:ss`;
const dateYearPattern = 'YYYY';

export function getDateTimeWithoutSeconds(dateTime) {
  return dateTime ? dateTime.substr(0, 16) : '';
}

export function validateTime(time) {
  if (!time) {
    return false;
  }
  const valid = (time.search(/^\d{2}:\d{2}:\d{2}$/) !== -1)
            && (time.substr(0, 2) >= 0 && time.substr(0, 2) <= 24)
            && (time.substr(3, 2) >= 0 && time.substr(3, 2) <= 59)
            && (time.substr(6, 2) >= 0 && time.substr(6, 2) <= 59);
  return valid;
}

export function nowDate() {
  return moment().format(datePattern);
}

export function nowDateTime() {
  return moment().format(dateTimePattern);
}

export function nowDateYear() {
  return moment().format(dateYearPattern);
}

export function parseIso8601ToDateStr(dateStr) {
  return moment(dateStr, 'YYYY-MM-DD').format(datePattern);
}

export function getMonthFromDateTime(dateTime) {
  return moment(dateTime, dateTimePattern).month();
}

export function getYearFromDateTime(dateTime) {
  const { date } = splitDateTime(dateTime);
  return getYearFromDate(date);
}

export function getYearFromDate(date) {
  return parseInt(date.split('/')[2], 10);
}

export function getMonthFromDate(date) {
  return moment(date, datePattern).month();
}

export function splitDateTime(dateTime) {
  if (!dateTime) {
    return { date: null, time: null };
  }
  const [date, time] = dateTime.split(' ');
  return { date, time };
}

export function getDateStrAsDateTimeStr(date, useMinTime = true) {
  if (!date) {
    return null;
  }
  const time = useMinTime ? '00:00:00' : '59:59:999';
  return joinDateTime(date, time);
}

export function joinDateTime(date, time) {
  return `${date} ${time}`;
}

export function validateDate(date) {
  const dateMoment = moment(date, 'DD/MM/YYYY').toDate();
  return !Number.isNaN(dateMoment.getDate());
}

export function validateDateBeginAndEnd(begin, end) {
  let validityBegin = begin.split(' ');
  validityBegin = moment(validityBegin, 'DD/MM/YYYY').toDate();
  let validityEnd = end.split(' ');
  validityEnd = moment(validityEnd, 'DD/MM/YYYY').toDate();
  return validityBegin >= validityEnd;
}

export function validateBeforeActualDate(begin) {
  let validityBegin = begin.split(' ');
  validityBegin = moment(validityBegin, 'DD/MM/YYYY').toDate();
  let now = nowDateTime();
  now = moment(now, 'DD/MM/YYYY').toDate();
  return validityBegin >= now;
}

export function passedEndDate(end) {
  let validityEnd = end.split(' ');
  validityEnd = moment(validityEnd, 'DD/MM/YYYY').toDate();
  let now = nowDateTime();
  now = moment(now, 'DD/MM/YYYY').toDate();
  return validityEnd < now;
}

export function getMaxMonthIfCurrentYearOrNumOfMonths(selectedYear) {
  const now = nowDateTime();
  const currentYear = getYearFromDateTime(now);
  return selectedYear === currentYear ? getMonthFromDateTime(now) : 11;
}

export function parseDate(date) {
  return moment(date, 'DD/MM/YYYY').toDate();
}

export function parseDateToStr(date) {
  return moment(date).format('DD/MM/YYYY');
}

export function parseDateTime(date, format = 'DD/MM/YYYY HH:mm:ss') {
  return moment(date, format).toDate();
}

export function parseTime(time) {
  return moment(time, 'HH:mm:ss');
}

export function dateStrIsAfter(dateStr1, dateStr2) {
  const date1 = moment(dateStr1, datePattern);
  const date2 = moment(dateStr2, datePattern);
  return date1.isAfter(date2);
}

export function dateStrIsBefore(dateStr1, dateStr2) {
  const date1 = moment(dateStr1, datePattern);
  const date2 = moment(dateStr2, datePattern);
  return date1.isBefore(date2);
}

export function dateStrIsSameOrAfter(dateStr1, dateStr2) {
  const date1 = moment(dateStr1, datePattern);
  const date2 = moment(dateStr2, datePattern);
  return date1.isSameOrAfter(date2);
}

export function dateStrIsSameOrBefore(dateStr1, dateStr2) {
  const date1 = moment(dateStr1, datePattern);
  const date2 = moment(dateStr2, datePattern);
  return date1.isSameOrBefore(date2);
}

export function getMonthYearFormatted(date) {
  const month = date.getMonth() + 1;
  const monthFmt = `${month}`.padStart(2, 0);
  const year = date.getFullYear();
  return `${monthFmt}/${year}`;
}

export function isDateInRange(date, startDate, endDate) {
  return dateStrIsSameOrAfter(date, startDate) && dateStrIsSameOrBefore(date, endDate);
}

export function getCurrentDateAndTime() {
  const currentDateTime = nowDateTime();
  const { date, time } = splitDateTime(currentDateTime);
  return { date, time };
}
