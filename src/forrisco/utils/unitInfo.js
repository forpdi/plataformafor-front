export const resolveUnitInfo = (units, item) => {
  if (!item) return null;

  const inlineUnit = item.unit || item.companyUnit || item.unity || null;
  let name = item.unitName || (inlineUnit && inlineUnit.name) || '';
  let abbreviation = item.unitAbbreviation || (inlineUnit && (inlineUnit.abbreviation || inlineUnit.sigla)) || '';

  const unitId = (item.unitId != null ? item.unitId : undefined)
    ?? (inlineUnit && inlineUnit.id)
    ?? (item.companyUnitId != null ? item.companyUnitId : undefined)
    ?? (item.unit_id != null ? item.unit_id : undefined);

  if ((name === '' || abbreviation === '') && unitId != null && Array.isArray(units)) {
    const found = units.find(u => String(u.id) === String(unitId));
    if (found) {
      name = name || found.name || '';
      abbreviation = abbreviation || found.abbreviation || found.sigla || '';
    }
  }

  return (name || abbreviation) ? { abbreviation, name } : null;
};

export default resolveUnitInfo;
