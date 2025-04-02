import { createEnum } from 'forpdi/src/utils/util';

const riskLevel = {
  operational: { id: 5, name: 'Operacional' },
  tactical: { id: 10, name: 'Tático' },
  strategic: { id: 15, name: 'Estratégico' },
};

export default createEnum(riskLevel);
