import { createEnum } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

const riskStateEnum = {
  upToDate: {
    id: 0, color: '#83cab1', label: Messages.get('label.upToDate'), name: 'em dia',
  },
  closeToDue: {
    id: 1, color: '#e2e470', label: Messages.get('label.closeToDue'), name: 'próximo a vencer',
  },
  late: {
    id: 2, color: '#e97c66', label: Messages.get('label.late'), name: 'atrasado',
  },
  expiredPlan: {
    id: 3, color: '#A9A9A9', label: Messages.get('label.expiredPlan'), name: 'plano vencido',
  },
};

export default createEnum(riskStateEnum);
