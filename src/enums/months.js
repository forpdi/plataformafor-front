import { createEnum } from 'forpdi/src/utils/util';

const months = {
  jan: { acronym: 'jan', name: 'janeiro', value: 0 },
  feb: { acronym: 'fev', name: 'fevereiro', value: 1 },
  mar: { acronym: 'mar', name: 'março', value: 2 },
  apr: { acronym: 'abr', name: 'abril', value: 3 },
  may: { acronym: 'mai', name: 'maio', value: 4 },
  jun: { acronym: 'jun', name: 'junho', value: 5 },
  jul: { acronym: 'jul', name: 'julho', value: 6 },
  aug: { acronym: 'ago', name: 'agosto', value: 7 },
  sep: { acronym: 'set', name: 'setembro', value: 8 },
  out: { acronym: 'out', name: 'outubro', value: 9 },
  nov: { acronym: 'nov', name: 'novembro', value: 10 },
  dec: { acronym: 'dez', name: 'dezembro', value: 11 },
};

export default createEnum(months, 'value');
