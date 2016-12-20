var CLOSE, Formatters, OPEN, _, regex_eq, regex_eq_complement;

_ = require('lodash');

OPEN = "\ufd3e";

CLOSE = "\ufd3f";

regex_eq = new RegExp("[^" + OPEN + "]+(?=" + CLOSE + ")", 'g');

regex_eq_complement = new RegExp("[^" + CLOSE + "]+(?=" + OPEN + "|$)", 'g');

Formatters = {
  to_special_parenthesis: function(s) {
    return s.replace(/\\\[/g, OPEN).replace(/\\\]/g, CLOSE).replace(/\\\(/g, OPEN).replace(/\\\)/g, CLOSE);
  },
  to_en_period: function(s) {
    return s.replace(/\.(?!(\w{3,4}[\'\"]))(?!\d)(?!\s)/g, '. ').replace(/。/g, '. ');
  },
  outside_equations: function(s, formatters) {
    return s.replace(regex_eq_complement, function(text) {
      var ref;
      return (ref = new $F(text)).pipeline.apply(ref, formatters).value();
    });
  },
  txt_punctuations: function(txt) {
    return txt.replace(/\(/g, '（').replace(/\)/g, '）').replace(/,\s?/g, '，').replace(/;\s?/g, '；');
  },
  inside_equations: function(s, formatters) {
    return s.replace(regex_eq, function(equation) {
      var ref;
      return (ref = new $F(equation)).pipeline.apply(ref, formatters).value();
    });
  },
  eq_parenthesis: function(eq) {
    return eq.replace(/(\\left[\(\[]|\\right[\)\]])|([\(\[])|([\)\]])/g, function(m, p1, p2, p3) {
      if (p1) {
        return p1;
      }
      if (p2) {
        return '\\left' + p2;
      }
      if (p3) {
        return '\\right' + p3;
      }
    });
  },
  eq_comma_equalsign: function(eq) {
    return eq;
  },
  eq_therefore: function(eq) {
    return eq.replace(/(\S+\s*)(?=\\therefore)/g, "$&" + CLOSE + "，" + OPEN);
  },
  eq_double_hat_to_single: function(eq) {
    return eq.replace(/\^\^/g, "^");
  },
  restore_parenthesis: function(s) {
    return s.replace(RegExp(OPEN, 'g'), '\\\(').replace(RegExp(CLOSE, 'g'), '\\\)');
  }
};


class $F {
  constructor (input) {
    this.output = String(input);
    this.pipe = function(fn, fnArgs) {
      if (_.isString(fn)) {
        fn = Formatters[fn] || _.identity;
      }
      if (_.isFunction(fn)) {
        this.output = fn(this.output, fnArgs);
      }
      return this;
    };
    this.pipeline = function() {
      var fn, i, len;
      for (i = 0, len = arguments.length; i < len; i++) {
        fn = arguments[i];
        this.pipe(fn);
      }
      return this;
    };
    this.value = function() {
      return this.output;
    };
    return this;
  }
}

export default function(input) {
  let FInstance = new $F(input)
  return FInstance.pipe('to_special_parenthesis').pipe('to_en_period').pipe('outside_equations', ['txt_punctuations']).pipe('inside_equations', ['eq_therefore', 'eq_double_hat_to_single']).pipe('restore_parenthesis').value();
};
