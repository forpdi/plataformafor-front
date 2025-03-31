import { createEnum } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

const riskStatusOptions = {
  unarchived:
  {
    id: false,
    name: Messages.get('label.stateOfRiskPublished'),
    iconName: 'frisk-archive',
    action: Messages.get('label.archiveRisk'),
  },
  archived:
  {
    id: true,
    name: Messages.get('label.stateOfRiskArchived'),
    iconName: 'frisk-unarchive',
    action: Messages.get('label.unarchiveRisk'),
  },
};

export default createEnum(riskStatusOptions);
