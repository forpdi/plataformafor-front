import { createEnum } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

const preventiveActionStateEnum = {
  accomplished: {
    id: 0, color: '#63af65', label: Messages.get('label.actionAccomplished'), name: 'realizado', actionAccomplished: true,
  },
  notAccomplished: {
    id: 1, color: '#f08a48', label: Messages.get('label.actionNotAccomplished'), name: 'não realizado', actionAccomplished: false,
  },
};

export default createEnum(preventiveActionStateEnum);
