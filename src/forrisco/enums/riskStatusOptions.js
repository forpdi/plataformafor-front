// forpdi/src/forrisco/enums/riskStatusOptions.js
import { createEnum } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

/**
 * Estados dos riscos (padronizados como string):
 *  - published : ativo/publicado
 *  - archived  : arquivado pelo usuário
 *  - imported  : recém-importado (aguardando completar campos obrigatórios)
 *  - deleted   : removido logicamente
 */
const riskStatusOptions = {
  published: {
    id: 'published',
    name: Messages.get('label.stateOfRiskPublished'),
    iconName: 'frisk-archive',
    action: Messages.get('label.archiveRisk'),
  },
  archived: {
    id: 'archived',
    name: Messages.get('label.stateOfRiskArchived'),
    iconName: 'frisk-unarchive',
    action: Messages.get('label.unarchiveRisk'),
  },
  imported: {
    id: 'imported',
    name: Messages.get('label.stateOfRiskImported'),
    iconName: 'frisk-upload',
    action: Messages.get('label.completeRiskData'),
  },
  deleted: {
    id: 'deleted',
    name: Messages.get('label.stateOfRiskDeleted'),
    iconName: 'frisk-delete',
  },
};

export default createEnum(riskStatusOptions);
