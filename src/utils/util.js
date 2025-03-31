import _ from 'underscore';

export function createEnum(enumObj, idFieldName = 'id') {
  return Object.freeze({
    ...enumObj,
    ...mapKeys(enumObj, value => value[idFieldName]),
    list: _.values(enumObj),
  });
}

export function mapKeys(obj, callback) {
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[callback(value, key)] = value;
  });
  return result;
}

export function mapArrayGrouping(array, getKey) {
  const result = {};
  _.forEach(array, (element) => {
    const key = getKey(element);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(element);
  });

  return result;
}

export function getDuplications(array) {
  return _.filter(array, (item, idx) => array.indexOf(item) !== idx);
}

export function getYearsToSelect(data, getYear = ({ year }) => year) {
  const allYears = _.map(data, value => getYear(value));
  const uniqueYears = _.sortBy(_.uniq(allYears), year => year);
  uniqueYears.reverse();

  return _.map(uniqueYears, year => ({ name: year, id: year }));
}

export function extractFileExtension(fileName) {
  const lastDotIdx = fileName.lastIndexOf('.');
  return lastDotIdx !== -1 ? fileName.substr(lastDotIdx + 1) : '';
}

export function constructFileLink(id, fileName) {
  if (!id || !fileName) {
    return null;
  }
  const croppedExtension = extractFileExtension(fileName);
  return `${id}.${croppedExtension}`;
}

export function booleanToString(boolean) {
  return boolean ? 'Sim' : 'Não';
}

export function htmlStringToSimpleText(htmlString) {
  const span = document.createElement('span');
  span.innerHTML = htmlString;
  return span.textContent || span.innerText || '';
}

export function censorCPF(plainCPF) {
  if (plainCPF) {
    return `*********${plainCPF.substr(-2)}`;
  }

  return '';
}

export function censorEmail(email) {
  if (email) {
    const split = email.split('@', 2);
    const localPart = split[0];
    const domain = split[1];
    const censoredCharsLen = localPart.length > 6 ? 3 : 1;
    const censoredLocalPart = localPart.slice(0, censoredCharsLen) + ''.padEnd(localPart.length - censoredCharsLen, '*');
    return `${censoredLocalPart}@${domain}`;
  }

  return '';
}

export function censorName(name) {
  if (name) {
    const split = name.trim().split(/\s+/g);
    const firstName = split[0];
    const surnames = split.length > 1 ? split.slice(1) : [];
    const censoredSurnames = _.map(surnames, surname => surname[0].padEnd(surname.length, '*'));
    let censoredName = firstName;
    _.forEach(censoredSurnames, (censoredSurname) => {
      censoredName += ` ${censoredSurname}`;
    });
    return censoredName;
  }

  return '';
}

export function validateCpf(rawCpf) {
  const cpf = rawCpf.replace(/[^\d]+/g, '');

  if (cpf === '') return false;

  if (cpf.length !== 11
    || cpf === '00000000000'
    || cpf === '11111111111'
    || cpf === '22222222222'
    || cpf === '33333333333'
    || cpf === '44444444444'
    || cpf === '55555555555'
    || cpf === '66666666666'
    || cpf === '77777777777'
    || cpf === '88888888888'
    || cpf === '99999999999') {
    return false;
  }

  let add = 0;
  for (let i = 0; i < 9; i += 1) {
    add += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) {
    rev = 0;
  }
  if (rev !== parseInt(cpf.charAt(9), 10)) {
    return false;
  }
  add = 0;
  for (let i = 0; i < 10; i += 1) {
    add += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) {
    rev = 0;
  }
  if (rev !== parseInt(cpf.charAt(10), 10)) {
    return false;
  }

  return true;
}

export function validatePhone(phone) {
  const rawPhone = removeEspecialCharsFromPhone(phone);
  return rawPhone
    && hasOnlyNumbers(rawPhone)
    && (rawPhone.length === 10 || rawPhone.length === 11);
}

export function hasOnlyNumbers(str) {
  return str && !!str.match(/^\d+$/g);
}

export function validateStrongPassword(password) {
  let strenght = 0;
  if (password && password.length >= 8) {
    if (password.match('.*\\d.*')) {
      strenght += 1;
    }
    if (password.match('.*[a-z].*')) {
      strenght += 1;
    }
    if (password.match('.*[A-Z].*')) {
      strenght += 1;
    }
    if (password.match('[^0-9a-zA-Z]')) {
      strenght += 1;
    }
  }

  return strenght >= 3;
}

export function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function removeEspecialCharsFromCpf(cpf) {
  return cpf ? cpf.replaceAll(/\.|-/g, '') : cpf;
}

export function removeEspecialCharsFromPhone(phone) {
  return phone ? phone.replaceAll(/\(|\)|-|\s|_/g, '') : phone;
}

export function formatPhone(phone) {
  if (!phone || phone.length < 10) {
    return phone;
  }

  const prefix = phone.slice(0, 2);
  const firstPart = phone.length > 10 ? phone.slice(2, 7) : phone.slice(2, 6);
  const secondPart = phone.slice(prefix.length + firstPart.length, phone.length);

  return `(${prefix}) ${firstPart}-${secondPart}`;
}

export function validateEveryWordCapitalized(text) {
  return text.split(' ').every((word) => {
    // check if the first letter is capitalized
    if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
      return false;
    }
    // check if the rest of the letters are in lowercase
    if (word.slice(1) !== word.slice(1).toLowerCase()) {
      return false;
    }
    return true;
  });
}

export function parseSortedByToList(sortedBy) {
  return sortedBy ? [sortedBy.field, sortedBy.order] : null;
}
