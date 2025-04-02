import { createEnum } from 'forpdi/src/utils/util';

const companyType = {
  university: { id: 5, name: 'Universidade' },
  institute: { id: 10, name: 'Instituto Federal' },
  others: { id: 15, name: 'Outros' }
};

export default createEnum(companyType);
