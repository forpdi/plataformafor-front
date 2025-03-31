import { createEnum } from 'forpdi/src/utils/util';

const Region = {
  North: { id: 1, name: 'Norte', color: '#4ada33' },
  "North East": { id: 2, name: 'Nordeste', color: '#599fd1' },
  "South East": { id: 3, name: 'Sudeste', color: '#d97c2f' },
  "South": { id: 4, name: 'Sul', color: '#f00' },
  "Central West": { id: 5, name: 'Centro-Oeste', color: '#d7db29' },
};

export default createEnum(Region);
