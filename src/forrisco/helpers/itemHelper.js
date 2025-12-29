import _ from 'underscore';
import itemFields from 'forpdi/src/forrisco/enums/itemFields';


export function parseToBoolean(fields) {
  return (
    _.map(fields, field => ({
      ...field,
      isText: field.fieldId === String(itemFields.text.id),
    })));
}

export function parseToFormOption(fields) {
  return (
    _.map(fields, field => ({
      ...field,
      fieldId: field.isText ? String(itemFields.text.id) : String(itemFields.file.id),
    }))
  );
}
