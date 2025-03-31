import { createEnum } from 'forpdi/src/utils/util';

const riskLevelColorsEnum = {
  red: {
    label: 'Vermelho', id: 0, hex: '#f1705f',
  },
  brown: {
    label: 'Cinza', id: 1, hex: '#c8c8c8',
  },
  pink: {
    label: 'Rosa', id: 2, hex: '#dd90be',
  },
  orange: {
    label: 'Laranja', id: 3, hex: '#fcbc70',
  },
  green: {
    label: 'Verde', id: 4, hex: '#9cdc9c',
  },
  blue: {
    label: 'Azul', id: 5, hex: '#8cbcdc',
  },
  yellow: {
    label: 'Amarelo', id: 6, hex: '#fff230',
  },
};

export default createEnum(riskLevelColorsEnum);
