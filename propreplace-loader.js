/* eslint-disable */
const S = require('string');
const loaderUtils = require('loader-utils');
const createHash = require('hash-generator');

const hashLength = 10;

const defaultOpts = {
  start: '{{',
  end: '}}',
  props: {},
  process: function(content, opts) {
    const key = content.replace(opts.start, '').replace(opts.end, '');
    const value = S(opts.props[key]);
    if (value.isEmpty()) {
      return `???${key}???`;
    } else {
      return value.s;
    }
  }
};

module.exports = function(content) {
  this.cacheable && this.cacheable();

  const opts = Object.assign(defaultOpts, loaderUtils.getOptions(this) || {});
  opts.props = {};
  opts.props.hash = createHash(hashLength);

  if (!hasBlocks(content, opts)) {
    return content;
  }

  return processData(content, opts);
};

function hasBlocks(input, opts) {
  const has = input.indexOf(opts.start) !== -1 && input.indexOf(opts.end) !== -1;
  return has;
}

function processData(source, opts) {
  let from = 0;
  let curr = source.indexOf(opts.start, from);
  let term = source.indexOf(opts.end, from);

  let newsource = ''
  let blockString;
  while (curr !== -1) {
    newsource += source.substring(from, curr);
    if(term === -1) {
      throw new Error(`Block opened by ${opts.start} found without matching ending ${opts.end}`);
    }

    blockString = source.substring(curr, term + opts.end.length);
    try {
      newsource += opts.process(blockString, opts);
    } catch(err) {
      console.error(err);
    }

    from = term + opts.end.length;
    curr = source.indexOf(opts.start, from);
    term = source.indexOf(opts.end, from);
  }
  newsource += source.substring(from);
  return newsource;
};
