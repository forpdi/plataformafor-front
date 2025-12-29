import { createEnum } from 'forpdi/src/utils/util';

const dataImport = {
  unit: { id: 1, name: 'Unidade' },
  subunit: { id: 2, name: 'Subunidade' },
  process: { id: 3, name: 'Processo' },
  risk: { id: 4, name: 'Risco' },
  preventiveAction: { id: 5, name: 'Ação de prevenção' },
};

export default createEnum(dataImport);
