// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/dotenv/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "dotenv",
    version: "16.4.5",
    description: "Loads environment variables from .env file",
    main: "lib/main.js",
    types: "lib/main.d.ts",
    exports: {
      ".": {
        types: "./lib/main.d.ts",
        require: "./lib/main.js",
        default: "./lib/main.js"
      },
      "./config": "./config.js",
      "./config.js": "./config.js",
      "./lib/env-options": "./lib/env-options.js",
      "./lib/env-options.js": "./lib/env-options.js",
      "./lib/cli-options": "./lib/cli-options.js",
      "./lib/cli-options.js": "./lib/cli-options.js",
      "./package.json": "./package.json"
    },
    scripts: {
      "dts-check": "tsc --project tests/types/tsconfig.json",
      lint: "standard",
      "lint-readme": "standard-markdown",
      pretest: "npm run lint && npm run dts-check",
      test: "tap tests/*.js --100 -Rspec",
      "test:coverage": "tap --coverage-report=lcov",
      prerelease: "npm test",
      release: "standard-version"
    },
    repository: {
      type: "git",
      url: "git://github.com/motdotla/dotenv.git"
    },
    funding: "https://dotenvx.com",
    keywords: [
      "dotenv",
      "env",
      ".env",
      "environment",
      "variables",
      "config",
      "settings"
    ],
    readmeFilename: "README.md",
    license: "BSD-2-Clause",
    devDependencies: {
      "@definitelytyped/dtslint": "^0.0.133",
      "@types/node": "^18.11.3",
      decache: "^4.6.1",
      sinon: "^14.0.1",
      standard: "^17.0.0",
      "standard-markdown": "^7.1.0",
      "standard-version": "^9.5.0",
      tap: "^16.3.0",
      tar: "^6.1.11",
      typescript: "^4.8.4"
    },
    engines: {
      node: ">=12"
    },
    browser: {
      fs: false
    }
  };
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS((exports, module) => {
  function parse(src) {
    const obj = {};
    let lines = src.toString();
    lines = lines.replace(/\r\n?/mg, "\n");
    let match;
    while ((match = LINE.exec(lines)) != null) {
      const key = match[1];
      let value = match[2] || "";
      value = value.trim();
      const maybeQuote = value[0];
      value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
      if (maybeQuote === '"') {
        value = value.replace(/\\n/g, "\n");
        value = value.replace(/\\r/g, "\r");
      }
      obj[key] = value;
    }
    return obj;
  }
  function _parseVault(options) {
    const vaultPath = _vaultPath(options);
    const result = DotenvModule.configDotenv({ path: vaultPath });
    if (!result.parsed) {
      const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
      err.code = "MISSING_DATA";
      throw err;
    }
    const keys = _dotenvKey(options).split(",");
    const length = keys.length;
    let decrypted;
    for (let i = 0;i < length; i++) {
      try {
        const key = keys[i].trim();
        const attrs = _instructions(result, key);
        decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
        break;
      } catch (error) {
        if (i + 1 >= length) {
          throw error;
        }
      }
    }
    return DotenvModule.parse(decrypted);
  }
  function _log(message) {
    console.log(`[dotenv@${version}][INFO] ${message}`);
  }
  function _warn(message) {
    console.log(`[dotenv@${version}][WARN] ${message}`);
  }
  function _debug(message) {
    console.log(`[dotenv@${version}][DEBUG] ${message}`);
  }
  function _dotenvKey(options) {
    if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
      return options.DOTENV_KEY;
    }
    if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
      return process.env.DOTENV_KEY;
    }
    return "";
  }
  function _instructions(result, dotenvKey) {
    let uri;
    try {
      uri = new URL(dotenvKey);
    } catch (error) {
      if (error.code === "ERR_INVALID_URL") {
        const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      throw error;
    }
    const key = uri.password;
    if (!key) {
      const err = new Error("INVALID_DOTENV_KEY: Missing key part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environment = uri.searchParams.get("environment");
    if (!environment) {
      const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
    const ciphertext = result.parsed[environmentKey];
    if (!ciphertext) {
      const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
      err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
      throw err;
    }
    return { ciphertext, key };
  }
  function _vaultPath(options) {
    let possibleVaultPath = null;
    if (options && options.path && options.path.length > 0) {
      if (Array.isArray(options.path)) {
        for (const filepath of options.path) {
          if (fs.existsSync(filepath)) {
            possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
          }
        }
      } else {
        possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
      }
    } else {
      possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
    }
    if (fs.existsSync(possibleVaultPath)) {
      return possibleVaultPath;
    }
    return null;
  }
  function _resolveHome(envPath) {
    return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
  }
  function _configVault(options) {
    _log("Loading env from encrypted .env.vault");
    const parsed = DotenvModule._parseVault(options);
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsed, options);
    return { parsed };
  }
  function configDotenv(options) {
    const dotenvPath = path.resolve(process.cwd(), ".env");
    let encoding = "utf8";
    const debug = Boolean(options && options.debug);
    if (options && options.encoding) {
      encoding = options.encoding;
    } else {
      if (debug) {
        _debug("No encoding is specified. UTF-8 is used by default");
      }
    }
    let optionPaths = [dotenvPath];
    if (options && options.path) {
      if (!Array.isArray(options.path)) {
        optionPaths = [_resolveHome(options.path)];
      } else {
        optionPaths = [];
        for (const filepath of options.path) {
          optionPaths.push(_resolveHome(filepath));
        }
      }
    }
    let lastError;
    const parsedAll = {};
    for (const path2 of optionPaths) {
      try {
        const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
        DotenvModule.populate(parsedAll, parsed, options);
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${path2} ${e.message}`);
        }
        lastError = e;
      }
    }
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsedAll, options);
    if (lastError) {
      return { parsed: parsedAll, error: lastError };
    } else {
      return { parsed: parsedAll };
    }
  }
  function config(options) {
    if (_dotenvKey(options).length === 0) {
      return DotenvModule.configDotenv(options);
    }
    const vaultPath = _vaultPath(options);
    if (!vaultPath) {
      _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
      return DotenvModule.configDotenv(options);
    }
    return DotenvModule._configVault(options);
  }
  function decrypt(encrypted, keyStr) {
    const key = Buffer.from(keyStr.slice(-64), "hex");
    let ciphertext = Buffer.from(encrypted, "base64");
    const nonce = ciphertext.subarray(0, 12);
    const authTag = ciphertext.subarray(-16);
    ciphertext = ciphertext.subarray(12, -16);
    try {
      const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
      aesgcm.setAuthTag(authTag);
      return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
    } catch (error) {
      const isRange = error instanceof RangeError;
      const invalidKeyLength = error.message === "Invalid key length";
      const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
      if (isRange || invalidKeyLength) {
        const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      } else if (decryptionFailed) {
        const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        err.code = "DECRYPTION_FAILED";
        throw err;
      } else {
        throw error;
      }
    }
  }
  function populate(processEnv, parsed, options = {}) {
    const debug = Boolean(options && options.debug);
    const override = Boolean(options && options.override);
    if (typeof parsed !== "object") {
      const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      err.code = "OBJECT_REQUIRED";
      throw err;
    }
    for (const key of Object.keys(parsed)) {
      if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
        if (override === true) {
          processEnv[key] = parsed[key];
        }
        if (debug) {
          if (override === true) {
            _debug(`"${key}" is already defined and WAS overwritten`);
          } else {
            _debug(`"${key}" is already defined and was NOT overwritten`);
          }
        }
      } else {
        processEnv[key] = parsed[key];
      }
    }
  }
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var os = import.meta.require("os");
  var crypto2 = import.meta.require("crypto");
  var packageJson = require_package();
  var version = packageJson.version;
  var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  var DotenvModule = {
    configDotenv,
    _configVault,
    _parseVault,
    config,
    decrypt,
    parse,
    populate
  };
  exports.configDotenv = DotenvModule.configDotenv;
  exports._configVault = DotenvModule._configVault;
  exports._parseVault = DotenvModule._parseVault;
  exports.config = DotenvModule.config;
  exports.decrypt = DotenvModule.decrypt;
  exports.parse = DotenvModule.parse;
  exports.populate = DotenvModule.populate;
  module.exports = DotenvModule;
});

// node_modules/moment/moment.js
var require_moment = __commonJS((exports, module) => {
  //! moment.js
  //! version : 2.30.1
  //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
  //! license : MIT
  //! momentjs.com
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global2.moment = factory();
  })(exports, function() {
    var hookCallback;
    function hooks() {
      return hookCallback.apply(null, arguments);
    }
    function setHookCallback(callback) {
      hookCallback = callback;
    }
    function isArray(input) {
      return input instanceof Array || Object.prototype.toString.call(input) === "[object Array]";
    }
    function isObject(input) {
      return input != null && Object.prototype.toString.call(input) === "[object Object]";
    }
    function hasOwnProp(a, b) {
      return Object.prototype.hasOwnProperty.call(a, b);
    }
    function isObjectEmpty(obj) {
      if (Object.getOwnPropertyNames) {
        return Object.getOwnPropertyNames(obj).length === 0;
      } else {
        var k;
        for (k in obj) {
          if (hasOwnProp(obj, k)) {
            return false;
          }
        }
        return true;
      }
    }
    function isUndefined(input) {
      return input === undefined;
    }
    function isNumber(input) {
      return typeof input === "number" || Object.prototype.toString.call(input) === "[object Number]";
    }
    function isDate(input) {
      return input instanceof Date || Object.prototype.toString.call(input) === "[object Date]";
    }
    function map(arr, fn) {
      var res = [], i, arrLen = arr.length;
      for (i = 0;i < arrLen; ++i) {
        res.push(fn(arr[i], i));
      }
      return res;
    }
    function extend(a, b) {
      for (var i in b) {
        if (hasOwnProp(b, i)) {
          a[i] = b[i];
        }
      }
      if (hasOwnProp(b, "toString")) {
        a.toString = b.toString;
      }
      if (hasOwnProp(b, "valueOf")) {
        a.valueOf = b.valueOf;
      }
      return a;
    }
    function createUTC(input, format2, locale2, strict) {
      return createLocalOrUTC(input, format2, locale2, strict, true).utc();
    }
    function defaultParsingFlags() {
      return {
        empty: false,
        unusedTokens: [],
        unusedInput: [],
        overflow: -2,
        charsLeftOver: 0,
        nullInput: false,
        invalidEra: null,
        invalidMonth: null,
        invalidFormat: false,
        userInvalidated: false,
        iso: false,
        parsedDateParts: [],
        era: null,
        meridiem: null,
        rfc2822: false,
        weekdayMismatch: false
      };
    }
    function getParsingFlags(m) {
      if (m._pf == null) {
        m._pf = defaultParsingFlags();
      }
      return m._pf;
    }
    var some;
    if (Array.prototype.some) {
      some = Array.prototype.some;
    } else {
      some = function(fun) {
        var t = Object(this), len = t.length >>> 0, i;
        for (i = 0;i < len; i++) {
          if (i in t && fun.call(this, t[i], i, t)) {
            return true;
          }
        }
        return false;
      };
    }
    function isValid(m) {
      var flags = null, parsedParts = false, isNowValid = m._d && !isNaN(m._d.getTime());
      if (isNowValid) {
        flags = getParsingFlags(m);
        parsedParts = some.call(flags.parsedDateParts, function(i) {
          return i != null;
        });
        isNowValid = flags.overflow < 0 && !flags.empty && !flags.invalidEra && !flags.invalidMonth && !flags.invalidWeekday && !flags.weekdayMismatch && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || flags.meridiem && parsedParts);
        if (m._strict) {
          isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
        }
      }
      if (Object.isFrozen == null || !Object.isFrozen(m)) {
        m._isValid = isNowValid;
      } else {
        return isNowValid;
      }
      return m._isValid;
    }
    function createInvalid(flags) {
      var m = createUTC(NaN);
      if (flags != null) {
        extend(getParsingFlags(m), flags);
      } else {
        getParsingFlags(m).userInvalidated = true;
      }
      return m;
    }
    var momentProperties = hooks.momentProperties = [], updateInProgress = false;
    function copyConfig(to2, from2) {
      var i, prop, val, momentPropertiesLen = momentProperties.length;
      if (!isUndefined(from2._isAMomentObject)) {
        to2._isAMomentObject = from2._isAMomentObject;
      }
      if (!isUndefined(from2._i)) {
        to2._i = from2._i;
      }
      if (!isUndefined(from2._f)) {
        to2._f = from2._f;
      }
      if (!isUndefined(from2._l)) {
        to2._l = from2._l;
      }
      if (!isUndefined(from2._strict)) {
        to2._strict = from2._strict;
      }
      if (!isUndefined(from2._tzm)) {
        to2._tzm = from2._tzm;
      }
      if (!isUndefined(from2._isUTC)) {
        to2._isUTC = from2._isUTC;
      }
      if (!isUndefined(from2._offset)) {
        to2._offset = from2._offset;
      }
      if (!isUndefined(from2._pf)) {
        to2._pf = getParsingFlags(from2);
      }
      if (!isUndefined(from2._locale)) {
        to2._locale = from2._locale;
      }
      if (momentPropertiesLen > 0) {
        for (i = 0;i < momentPropertiesLen; i++) {
          prop = momentProperties[i];
          val = from2[prop];
          if (!isUndefined(val)) {
            to2[prop] = val;
          }
        }
      }
      return to2;
    }
    function Moment(config) {
      copyConfig(this, config);
      this._d = new Date(config._d != null ? config._d.getTime() : NaN);
      if (!this.isValid()) {
        this._d = new Date(NaN);
      }
      if (updateInProgress === false) {
        updateInProgress = true;
        hooks.updateOffset(this);
        updateInProgress = false;
      }
    }
    function isMoment(obj) {
      return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
    }
    function warn(msg) {
      if (hooks.suppressDeprecationWarnings === false && typeof console !== "undefined" && console.warn) {
        console.warn("Deprecation warning: " + msg);
      }
    }
    function deprecate(msg, fn) {
      var firstTime = true;
      return extend(function() {
        if (hooks.deprecationHandler != null) {
          hooks.deprecationHandler(null, msg);
        }
        if (firstTime) {
          var args = [], arg, i, key, argLen = arguments.length;
          for (i = 0;i < argLen; i++) {
            arg = "";
            if (typeof arguments[i] === "object") {
              arg += "\n[" + i + "] ";
              for (key in arguments[0]) {
                if (hasOwnProp(arguments[0], key)) {
                  arg += key + ": " + arguments[0][key] + ", ";
                }
              }
              arg = arg.slice(0, -2);
            } else {
              arg = arguments[i];
            }
            args.push(arg);
          }
          warn(msg + "\nArguments: " + Array.prototype.slice.call(args).join("") + "\n" + new Error().stack);
          firstTime = false;
        }
        return fn.apply(this, arguments);
      }, fn);
    }
    var deprecations = {};
    function deprecateSimple(name, msg) {
      if (hooks.deprecationHandler != null) {
        hooks.deprecationHandler(name, msg);
      }
      if (!deprecations[name]) {
        warn(msg);
        deprecations[name] = true;
      }
    }
    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;
    function isFunction(input) {
      return typeof Function !== "undefined" && input instanceof Function || Object.prototype.toString.call(input) === "[object Function]";
    }
    function set(config) {
      var prop, i;
      for (i in config) {
        if (hasOwnProp(config, i)) {
          prop = config[i];
          if (isFunction(prop)) {
            this[i] = prop;
          } else {
            this["_" + i] = prop;
          }
        }
      }
      this._config = config;
      this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source);
    }
    function mergeConfigs(parentConfig, childConfig) {
      var res = extend({}, parentConfig), prop;
      for (prop in childConfig) {
        if (hasOwnProp(childConfig, prop)) {
          if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
            res[prop] = {};
            extend(res[prop], parentConfig[prop]);
            extend(res[prop], childConfig[prop]);
          } else if (childConfig[prop] != null) {
            res[prop] = childConfig[prop];
          } else {
            delete res[prop];
          }
        }
      }
      for (prop in parentConfig) {
        if (hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop])) {
          res[prop] = extend({}, res[prop]);
        }
      }
      return res;
    }
    function Locale(config) {
      if (config != null) {
        this.set(config);
      }
    }
    var keys;
    if (Object.keys) {
      keys = Object.keys;
    } else {
      keys = function(obj) {
        var i, res = [];
        for (i in obj) {
          if (hasOwnProp(obj, i)) {
            res.push(i);
          }
        }
        return res;
      };
    }
    var defaultCalendar = {
      sameDay: "[Today at] LT",
      nextDay: "[Tomorrow at] LT",
      nextWeek: "dddd [at] LT",
      lastDay: "[Yesterday at] LT",
      lastWeek: "[Last] dddd [at] LT",
      sameElse: "L"
    };
    function calendar(key, mom, now2) {
      var output = this._calendar[key] || this._calendar["sameElse"];
      return isFunction(output) ? output.call(mom, now2) : output;
    }
    function zeroFill(number, targetLength, forceSign) {
      var absNumber = "" + Math.abs(number), zerosToFill = targetLength - absNumber.length, sign2 = number >= 0;
      return (sign2 ? forceSign ? "+" : "" : "-") + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }
    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, formatFunctions = {}, formatTokenFunctions = {};
    function addFormatToken(token2, padded, ordinal2, callback) {
      var func = callback;
      if (typeof callback === "string") {
        func = function() {
          return this[callback]();
        };
      }
      if (token2) {
        formatTokenFunctions[token2] = func;
      }
      if (padded) {
        formatTokenFunctions[padded[0]] = function() {
          return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        };
      }
      if (ordinal2) {
        formatTokenFunctions[ordinal2] = function() {
          return this.localeData().ordinal(func.apply(this, arguments), token2);
        };
      }
    }
    function removeFormattingTokens(input) {
      if (input.match(/\[[\s\S]/)) {
        return input.replace(/^\[|\]$/g, "");
      }
      return input.replace(/\\/g, "");
    }
    function makeFormatFunction(format2) {
      var array = format2.match(formattingTokens), i, length;
      for (i = 0, length = array.length;i < length; i++) {
        if (formatTokenFunctions[array[i]]) {
          array[i] = formatTokenFunctions[array[i]];
        } else {
          array[i] = removeFormattingTokens(array[i]);
        }
      }
      return function(mom) {
        var output = "", i2;
        for (i2 = 0;i2 < length; i2++) {
          output += isFunction(array[i2]) ? array[i2].call(mom, format2) : array[i2];
        }
        return output;
      };
    }
    function formatMoment(m, format2) {
      if (!m.isValid()) {
        return m.localeData().invalidDate();
      }
      format2 = expandFormat(format2, m.localeData());
      formatFunctions[format2] = formatFunctions[format2] || makeFormatFunction(format2);
      return formatFunctions[format2](m);
    }
    function expandFormat(format2, locale2) {
      var i = 5;
      function replaceLongDateFormatTokens(input) {
        return locale2.longDateFormat(input) || input;
      }
      localFormattingTokens.lastIndex = 0;
      while (i >= 0 && localFormattingTokens.test(format2)) {
        format2 = format2.replace(localFormattingTokens, replaceLongDateFormatTokens);
        localFormattingTokens.lastIndex = 0;
        i -= 1;
      }
      return format2;
    }
    var defaultLongDateFormat = {
      LTS: "h:mm:ss A",
      LT: "h:mm A",
      L: "MM/DD/YYYY",
      LL: "MMMM D, YYYY",
      LLL: "MMMM D, YYYY h:mm A",
      LLLL: "dddd, MMMM D, YYYY h:mm A"
    };
    function longDateFormat(key) {
      var format2 = this._longDateFormat[key], formatUpper = this._longDateFormat[key.toUpperCase()];
      if (format2 || !formatUpper) {
        return format2;
      }
      this._longDateFormat[key] = formatUpper.match(formattingTokens).map(function(tok) {
        if (tok === "MMMM" || tok === "MM" || tok === "DD" || tok === "dddd") {
          return tok.slice(1);
        }
        return tok;
      }).join("");
      return this._longDateFormat[key];
    }
    var defaultInvalidDate = "Invalid date";
    function invalidDate() {
      return this._invalidDate;
    }
    var defaultOrdinal = "%d", defaultDayOfMonthOrdinalParse = /\d{1,2}/;
    function ordinal(number) {
      return this._ordinal.replace("%d", number);
    }
    var defaultRelativeTime = {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      ss: "%d seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      w: "a week",
      ww: "%d weeks",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    };
    function relativeTime(number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return isFunction(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    }
    function pastFuture(diff2, output) {
      var format2 = this._relativeTime[diff2 > 0 ? "future" : "past"];
      return isFunction(format2) ? format2(output) : format2.replace(/%s/i, output);
    }
    var aliases = {
      D: "date",
      dates: "date",
      date: "date",
      d: "day",
      days: "day",
      day: "day",
      e: "weekday",
      weekdays: "weekday",
      weekday: "weekday",
      E: "isoWeekday",
      isoweekdays: "isoWeekday",
      isoweekday: "isoWeekday",
      DDD: "dayOfYear",
      dayofyears: "dayOfYear",
      dayofyear: "dayOfYear",
      h: "hour",
      hours: "hour",
      hour: "hour",
      ms: "millisecond",
      milliseconds: "millisecond",
      millisecond: "millisecond",
      m: "minute",
      minutes: "minute",
      minute: "minute",
      M: "month",
      months: "month",
      month: "month",
      Q: "quarter",
      quarters: "quarter",
      quarter: "quarter",
      s: "second",
      seconds: "second",
      second: "second",
      gg: "weekYear",
      weekyears: "weekYear",
      weekyear: "weekYear",
      GG: "isoWeekYear",
      isoweekyears: "isoWeekYear",
      isoweekyear: "isoWeekYear",
      w: "week",
      weeks: "week",
      week: "week",
      W: "isoWeek",
      isoweeks: "isoWeek",
      isoweek: "isoWeek",
      y: "year",
      years: "year",
      year: "year"
    };
    function normalizeUnits(units) {
      return typeof units === "string" ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }
    function normalizeObjectUnits(inputObject) {
      var normalizedInput = {}, normalizedProp, prop;
      for (prop in inputObject) {
        if (hasOwnProp(inputObject, prop)) {
          normalizedProp = normalizeUnits(prop);
          if (normalizedProp) {
            normalizedInput[normalizedProp] = inputObject[prop];
          }
        }
      }
      return normalizedInput;
    }
    var priorities = {
      date: 9,
      day: 11,
      weekday: 11,
      isoWeekday: 11,
      dayOfYear: 4,
      hour: 13,
      millisecond: 16,
      minute: 14,
      month: 8,
      quarter: 7,
      second: 15,
      weekYear: 1,
      isoWeekYear: 1,
      week: 5,
      isoWeek: 5,
      year: 1
    };
    function getPrioritizedUnits(unitsObj) {
      var units = [], u;
      for (u in unitsObj) {
        if (hasOwnProp(unitsObj, u)) {
          units.push({ unit: u, priority: priorities[u] });
        }
      }
      units.sort(function(a, b) {
        return a.priority - b.priority;
      });
      return units;
    }
    var match1 = /\d/, match2 = /\d\d/, match3 = /\d{3}/, match4 = /\d{4}/, match6 = /[+-]?\d{6}/, match1to2 = /\d\d?/, match3to4 = /\d\d\d\d?/, match5to6 = /\d\d\d\d\d\d?/, match1to3 = /\d{1,3}/, match1to4 = /\d{1,4}/, match1to6 = /[+-]?\d{1,6}/, matchUnsigned = /\d+/, matchSigned = /[+-]?\d+/, matchOffset = /Z|[+-]\d\d:?\d\d/gi, matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i, match1to2NoLeadingZero = /^[1-9]\d?/, match1to2HasZero = /^([1-9]\d|\d)/, regexes;
    regexes = {};
    function addRegexToken(token2, regex, strictRegex) {
      regexes[token2] = isFunction(regex) ? regex : function(isStrict, localeData2) {
        return isStrict && strictRegex ? strictRegex : regex;
      };
    }
    function getParseRegexForToken(token2, config) {
      if (!hasOwnProp(regexes, token2)) {
        return new RegExp(unescapeFormat(token2));
      }
      return regexes[token2](config._strict, config._locale);
    }
    function unescapeFormat(s) {
      return regexEscape(s.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
      }));
    }
    function regexEscape(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    function absFloor(number) {
      if (number < 0) {
        return Math.ceil(number) || 0;
      } else {
        return Math.floor(number);
      }
    }
    function toInt(argumentForCoercion) {
      var coercedNumber = +argumentForCoercion, value = 0;
      if (coercedNumber !== 0 && isFinite(coercedNumber)) {
        value = absFloor(coercedNumber);
      }
      return value;
    }
    var tokens = {};
    function addParseToken(token2, callback) {
      var i, func = callback, tokenLen;
      if (typeof token2 === "string") {
        token2 = [token2];
      }
      if (isNumber(callback)) {
        func = function(input, array) {
          array[callback] = toInt(input);
        };
      }
      tokenLen = token2.length;
      for (i = 0;i < tokenLen; i++) {
        tokens[token2[i]] = func;
      }
    }
    function addWeekParseToken(token2, callback) {
      addParseToken(token2, function(input, array, config, token3) {
        config._w = config._w || {};
        callback(input, config._w, config, token3);
      });
    }
    function addTimeToArrayFromToken(token2, input, config) {
      if (input != null && hasOwnProp(tokens, token2)) {
        tokens[token2](input, config._a, config, token2);
      }
    }
    function isLeapYear(year) {
      return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }
    var YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, WEEK = 7, WEEKDAY = 8;
    addFormatToken("Y", 0, 0, function() {
      var y = this.year();
      return y <= 9999 ? zeroFill(y, 4) : "+" + y;
    });
    addFormatToken(0, ["YY", 2], 0, function() {
      return this.year() % 100;
    });
    addFormatToken(0, ["YYYY", 4], 0, "year");
    addFormatToken(0, ["YYYYY", 5], 0, "year");
    addFormatToken(0, ["YYYYYY", 6, true], 0, "year");
    addRegexToken("Y", matchSigned);
    addRegexToken("YY", match1to2, match2);
    addRegexToken("YYYY", match1to4, match4);
    addRegexToken("YYYYY", match1to6, match6);
    addRegexToken("YYYYYY", match1to6, match6);
    addParseToken(["YYYYY", "YYYYYY"], YEAR);
    addParseToken("YYYY", function(input, array) {
      array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken("YY", function(input, array) {
      array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken("Y", function(input, array) {
      array[YEAR] = parseInt(input, 10);
    });
    function daysInYear(year) {
      return isLeapYear(year) ? 366 : 365;
    }
    hooks.parseTwoDigitYear = function(input) {
      return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };
    var getSetYear = makeGetSet("FullYear", true);
    function getIsLeapYear() {
      return isLeapYear(this.year());
    }
    function makeGetSet(unit, keepTime) {
      return function(value) {
        if (value != null) {
          set$1(this, unit, value);
          hooks.updateOffset(this, keepTime);
          return this;
        } else {
          return get(this, unit);
        }
      };
    }
    function get(mom, unit) {
      if (!mom.isValid()) {
        return NaN;
      }
      var { _d: d, _isUTC: isUTC } = mom;
      switch (unit) {
        case "Milliseconds":
          return isUTC ? d.getUTCMilliseconds() : d.getMilliseconds();
        case "Seconds":
          return isUTC ? d.getUTCSeconds() : d.getSeconds();
        case "Minutes":
          return isUTC ? d.getUTCMinutes() : d.getMinutes();
        case "Hours":
          return isUTC ? d.getUTCHours() : d.getHours();
        case "Date":
          return isUTC ? d.getUTCDate() : d.getDate();
        case "Day":
          return isUTC ? d.getUTCDay() : d.getDay();
        case "Month":
          return isUTC ? d.getUTCMonth() : d.getMonth();
        case "FullYear":
          return isUTC ? d.getUTCFullYear() : d.getFullYear();
        default:
          return NaN;
      }
    }
    function set$1(mom, unit, value) {
      var d, isUTC, year, month, date;
      if (!mom.isValid() || isNaN(value)) {
        return;
      }
      d = mom._d;
      isUTC = mom._isUTC;
      switch (unit) {
        case "Milliseconds":
          return void (isUTC ? d.setUTCMilliseconds(value) : d.setMilliseconds(value));
        case "Seconds":
          return void (isUTC ? d.setUTCSeconds(value) : d.setSeconds(value));
        case "Minutes":
          return void (isUTC ? d.setUTCMinutes(value) : d.setMinutes(value));
        case "Hours":
          return void (isUTC ? d.setUTCHours(value) : d.setHours(value));
        case "Date":
          return void (isUTC ? d.setUTCDate(value) : d.setDate(value));
        case "FullYear":
          break;
        default:
          return;
      }
      year = value;
      month = mom.month();
      date = mom.date();
      date = date === 29 && month === 1 && !isLeapYear(year) ? 28 : date;
      isUTC ? d.setUTCFullYear(year, month, date) : d.setFullYear(year, month, date);
    }
    function stringGet(units) {
      units = normalizeUnits(units);
      if (isFunction(this[units])) {
        return this[units]();
      }
      return this;
    }
    function stringSet(units, value) {
      if (typeof units === "object") {
        units = normalizeObjectUnits(units);
        var prioritized = getPrioritizedUnits(units), i, prioritizedLen = prioritized.length;
        for (i = 0;i < prioritizedLen; i++) {
          this[prioritized[i].unit](units[prioritized[i].unit]);
        }
      } else {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
          return this[units](value);
        }
      }
      return this;
    }
    function mod(n, x) {
      return (n % x + x) % x;
    }
    var indexOf;
    if (Array.prototype.indexOf) {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(o) {
        var i;
        for (i = 0;i < this.length; ++i) {
          if (this[i] === o) {
            return i;
          }
        }
        return -1;
      };
    }
    function daysInMonth(year, month) {
      if (isNaN(year) || isNaN(month)) {
        return NaN;
      }
      var modMonth = mod(month, 12);
      year += (month - modMonth) / 12;
      return modMonth === 1 ? isLeapYear(year) ? 29 : 28 : 31 - modMonth % 7 % 2;
    }
    addFormatToken("M", ["MM", 2], "Mo", function() {
      return this.month() + 1;
    });
    addFormatToken("MMM", 0, 0, function(format2) {
      return this.localeData().monthsShort(this, format2);
    });
    addFormatToken("MMMM", 0, 0, function(format2) {
      return this.localeData().months(this, format2);
    });
    addRegexToken("M", match1to2, match1to2NoLeadingZero);
    addRegexToken("MM", match1to2, match2);
    addRegexToken("MMM", function(isStrict, locale2) {
      return locale2.monthsShortRegex(isStrict);
    });
    addRegexToken("MMMM", function(isStrict, locale2) {
      return locale2.monthsRegex(isStrict);
    });
    addParseToken(["M", "MM"], function(input, array) {
      array[MONTH] = toInt(input) - 1;
    });
    addParseToken(["MMM", "MMMM"], function(input, array, config, token2) {
      var month = config._locale.monthsParse(input, token2, config._strict);
      if (month != null) {
        array[MONTH] = month;
      } else {
        getParsingFlags(config).invalidMonth = input;
      }
    });
    var defaultLocaleMonths = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), defaultLocaleMonthsShort = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, defaultMonthsShortRegex = matchWord, defaultMonthsRegex = matchWord;
    function localeMonths(m, format2) {
      if (!m) {
        return isArray(this._months) ? this._months : this._months["standalone"];
      }
      return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format2) ? "format" : "standalone"][m.month()];
    }
    function localeMonthsShort(m, format2) {
      if (!m) {
        return isArray(this._monthsShort) ? this._monthsShort : this._monthsShort["standalone"];
      }
      return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format2) ? "format" : "standalone"][m.month()];
    }
    function handleStrictParse(monthName, format2, strict) {
      var i, ii, mom, llc = monthName.toLocaleLowerCase();
      if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
        for (i = 0;i < 12; ++i) {
          mom = createUTC([2000, i]);
          this._shortMonthsParse[i] = this.monthsShort(mom, "").toLocaleLowerCase();
          this._longMonthsParse[i] = this.months(mom, "").toLocaleLowerCase();
        }
      }
      if (strict) {
        if (format2 === "MMM") {
          ii = indexOf.call(this._shortMonthsParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._longMonthsParse, llc);
          return ii !== -1 ? ii : null;
        }
      } else {
        if (format2 === "MMM") {
          ii = indexOf.call(this._shortMonthsParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._longMonthsParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._longMonthsParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._shortMonthsParse, llc);
          return ii !== -1 ? ii : null;
        }
      }
    }
    function localeMonthsParse(monthName, format2, strict) {
      var i, mom, regex;
      if (this._monthsParseExact) {
        return handleStrictParse.call(this, monthName, format2, strict);
      }
      if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
      }
      for (i = 0;i < 12; i++) {
        mom = createUTC([2000, i]);
        if (strict && !this._longMonthsParse[i]) {
          this._longMonthsParse[i] = new RegExp("^" + this.months(mom, "").replace(".", "") + "$", "i");
          this._shortMonthsParse[i] = new RegExp("^" + this.monthsShort(mom, "").replace(".", "") + "$", "i");
        }
        if (!strict && !this._monthsParse[i]) {
          regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
          this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
        }
        if (strict && format2 === "MMMM" && this._longMonthsParse[i].test(monthName)) {
          return i;
        } else if (strict && format2 === "MMM" && this._shortMonthsParse[i].test(monthName)) {
          return i;
        } else if (!strict && this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    }
    function setMonth(mom, value) {
      if (!mom.isValid()) {
        return mom;
      }
      if (typeof value === "string") {
        if (/^\d+$/.test(value)) {
          value = toInt(value);
        } else {
          value = mom.localeData().monthsParse(value);
          if (!isNumber(value)) {
            return mom;
          }
        }
      }
      var month = value, date = mom.date();
      date = date < 29 ? date : Math.min(date, daysInMonth(mom.year(), month));
      mom._isUTC ? mom._d.setUTCMonth(month, date) : mom._d.setMonth(month, date);
      return mom;
    }
    function getSetMonth(value) {
      if (value != null) {
        setMonth(this, value);
        hooks.updateOffset(this, true);
        return this;
      } else {
        return get(this, "Month");
      }
    }
    function getDaysInMonth() {
      return daysInMonth(this.year(), this.month());
    }
    function monthsShortRegex(isStrict) {
      if (this._monthsParseExact) {
        if (!hasOwnProp(this, "_monthsRegex")) {
          computeMonthsParse.call(this);
        }
        if (isStrict) {
          return this._monthsShortStrictRegex;
        } else {
          return this._monthsShortRegex;
        }
      } else {
        if (!hasOwnProp(this, "_monthsShortRegex")) {
          this._monthsShortRegex = defaultMonthsShortRegex;
        }
        return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
      }
    }
    function monthsRegex(isStrict) {
      if (this._monthsParseExact) {
        if (!hasOwnProp(this, "_monthsRegex")) {
          computeMonthsParse.call(this);
        }
        if (isStrict) {
          return this._monthsStrictRegex;
        } else {
          return this._monthsRegex;
        }
      } else {
        if (!hasOwnProp(this, "_monthsRegex")) {
          this._monthsRegex = defaultMonthsRegex;
        }
        return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
      }
    }
    function computeMonthsParse() {
      function cmpLenRev(a, b) {
        return b.length - a.length;
      }
      var shortPieces = [], longPieces = [], mixedPieces = [], i, mom, shortP, longP;
      for (i = 0;i < 12; i++) {
        mom = createUTC([2000, i]);
        shortP = regexEscape(this.monthsShort(mom, ""));
        longP = regexEscape(this.months(mom, ""));
        shortPieces.push(shortP);
        longPieces.push(longP);
        mixedPieces.push(longP);
        mixedPieces.push(shortP);
      }
      shortPieces.sort(cmpLenRev);
      longPieces.sort(cmpLenRev);
      mixedPieces.sort(cmpLenRev);
      this._monthsRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
      this._monthsShortRegex = this._monthsRegex;
      this._monthsStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
      this._monthsShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
    }
    function createDate(y, m, d, h, M, s, ms) {
      var date;
      if (y < 100 && y >= 0) {
        date = new Date(y + 400, m, d, h, M, s, ms);
        if (isFinite(date.getFullYear())) {
          date.setFullYear(y);
        }
      } else {
        date = new Date(y, m, d, h, M, s, ms);
      }
      return date;
    }
    function createUTCDate(y) {
      var date, args;
      if (y < 100 && y >= 0) {
        args = Array.prototype.slice.call(arguments);
        args[0] = y + 400;
        date = new Date(Date.UTC.apply(null, args));
        if (isFinite(date.getUTCFullYear())) {
          date.setUTCFullYear(y);
        }
      } else {
        date = new Date(Date.UTC.apply(null, arguments));
      }
      return date;
    }
    function firstWeekOffset(year, dow, doy) {
      var fwd = 7 + dow - doy, fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
      return -fwdlw + fwd - 1;
    }
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
      var localWeekday = (7 + weekday - dow) % 7, weekOffset = firstWeekOffset(year, dow, doy), dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset, resYear, resDayOfYear;
      if (dayOfYear <= 0) {
        resYear = year - 1;
        resDayOfYear = daysInYear(resYear) + dayOfYear;
      } else if (dayOfYear > daysInYear(year)) {
        resYear = year + 1;
        resDayOfYear = dayOfYear - daysInYear(year);
      } else {
        resYear = year;
        resDayOfYear = dayOfYear;
      }
      return {
        year: resYear,
        dayOfYear: resDayOfYear
      };
    }
    function weekOfYear(mom, dow, doy) {
      var weekOffset = firstWeekOffset(mom.year(), dow, doy), week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1, resWeek, resYear;
      if (week < 1) {
        resYear = mom.year() - 1;
        resWeek = week + weeksInYear(resYear, dow, doy);
      } else if (week > weeksInYear(mom.year(), dow, doy)) {
        resWeek = week - weeksInYear(mom.year(), dow, doy);
        resYear = mom.year() + 1;
      } else {
        resYear = mom.year();
        resWeek = week;
      }
      return {
        week: resWeek,
        year: resYear
      };
    }
    function weeksInYear(year, dow, doy) {
      var weekOffset = firstWeekOffset(year, dow, doy), weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
      return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }
    addFormatToken("w", ["ww", 2], "wo", "week");
    addFormatToken("W", ["WW", 2], "Wo", "isoWeek");
    addRegexToken("w", match1to2, match1to2NoLeadingZero);
    addRegexToken("ww", match1to2, match2);
    addRegexToken("W", match1to2, match1to2NoLeadingZero);
    addRegexToken("WW", match1to2, match2);
    addWeekParseToken(["w", "ww", "W", "WW"], function(input, week, config, token2) {
      week[token2.substr(0, 1)] = toInt(input);
    });
    function localeWeek(mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }
    var defaultLocaleWeek = {
      dow: 0,
      doy: 6
    };
    function localeFirstDayOfWeek() {
      return this._week.dow;
    }
    function localeFirstDayOfYear() {
      return this._week.doy;
    }
    function getSetWeek(input) {
      var week = this.localeData().week(this);
      return input == null ? week : this.add((input - week) * 7, "d");
    }
    function getSetISOWeek(input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week : this.add((input - week) * 7, "d");
    }
    addFormatToken("d", 0, "do", "day");
    addFormatToken("dd", 0, 0, function(format2) {
      return this.localeData().weekdaysMin(this, format2);
    });
    addFormatToken("ddd", 0, 0, function(format2) {
      return this.localeData().weekdaysShort(this, format2);
    });
    addFormatToken("dddd", 0, 0, function(format2) {
      return this.localeData().weekdays(this, format2);
    });
    addFormatToken("e", 0, 0, "weekday");
    addFormatToken("E", 0, 0, "isoWeekday");
    addRegexToken("d", match1to2);
    addRegexToken("e", match1to2);
    addRegexToken("E", match1to2);
    addRegexToken("dd", function(isStrict, locale2) {
      return locale2.weekdaysMinRegex(isStrict);
    });
    addRegexToken("ddd", function(isStrict, locale2) {
      return locale2.weekdaysShortRegex(isStrict);
    });
    addRegexToken("dddd", function(isStrict, locale2) {
      return locale2.weekdaysRegex(isStrict);
    });
    addWeekParseToken(["dd", "ddd", "dddd"], function(input, week, config, token2) {
      var weekday = config._locale.weekdaysParse(input, token2, config._strict);
      if (weekday != null) {
        week.d = weekday;
      } else {
        getParsingFlags(config).invalidWeekday = input;
      }
    });
    addWeekParseToken(["d", "e", "E"], function(input, week, config, token2) {
      week[token2] = toInt(input);
    });
    function parseWeekday(input, locale2) {
      if (typeof input !== "string") {
        return input;
      }
      if (!isNaN(input)) {
        return parseInt(input, 10);
      }
      input = locale2.weekdaysParse(input);
      if (typeof input === "number") {
        return input;
      }
      return null;
    }
    function parseIsoWeekday(input, locale2) {
      if (typeof input === "string") {
        return locale2.weekdaysParse(input) % 7 || 7;
      }
      return isNaN(input) ? null : input;
    }
    function shiftWeekdays(ws, n) {
      return ws.slice(n, 7).concat(ws.slice(0, n));
    }
    var defaultLocaleWeekdays = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), defaultLocaleWeekdaysShort = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), defaultLocaleWeekdaysMin = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), defaultWeekdaysRegex = matchWord, defaultWeekdaysShortRegex = matchWord, defaultWeekdaysMinRegex = matchWord;
    function localeWeekdays(m, format2) {
      var weekdays = isArray(this._weekdays) ? this._weekdays : this._weekdays[m && m !== true && this._weekdays.isFormat.test(format2) ? "format" : "standalone"];
      return m === true ? shiftWeekdays(weekdays, this._week.dow) : m ? weekdays[m.day()] : weekdays;
    }
    function localeWeekdaysShort(m) {
      return m === true ? shiftWeekdays(this._weekdaysShort, this._week.dow) : m ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }
    function localeWeekdaysMin(m) {
      return m === true ? shiftWeekdays(this._weekdaysMin, this._week.dow) : m ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }
    function handleStrictParse$1(weekdayName, format2, strict) {
      var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._minWeekdaysParse = [];
        for (i = 0;i < 7; ++i) {
          mom = createUTC([2000, 1]).day(i);
          this._minWeekdaysParse[i] = this.weekdaysMin(mom, "").toLocaleLowerCase();
          this._shortWeekdaysParse[i] = this.weekdaysShort(mom, "").toLocaleLowerCase();
          this._weekdaysParse[i] = this.weekdays(mom, "").toLocaleLowerCase();
        }
      }
      if (strict) {
        if (format2 === "dddd") {
          ii = indexOf.call(this._weekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else if (format2 === "ddd") {
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        }
      } else {
        if (format2 === "dddd") {
          ii = indexOf.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else if (format2 === "ddd") {
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._minWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        }
      }
    }
    function localeWeekdaysParse(weekdayName, format2, strict) {
      var i, mom, regex;
      if (this._weekdaysParseExact) {
        return handleStrictParse$1.call(this, weekdayName, format2, strict);
      }
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._minWeekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._fullWeekdaysParse = [];
      }
      for (i = 0;i < 7; i++) {
        mom = createUTC([2000, 1]).day(i);
        if (strict && !this._fullWeekdaysParse[i]) {
          this._fullWeekdaysParse[i] = new RegExp("^" + this.weekdays(mom, "").replace(".", "\\.?") + "$", "i");
          this._shortWeekdaysParse[i] = new RegExp("^" + this.weekdaysShort(mom, "").replace(".", "\\.?") + "$", "i");
          this._minWeekdaysParse[i] = new RegExp("^" + this.weekdaysMin(mom, "").replace(".", "\\.?") + "$", "i");
        }
        if (!this._weekdaysParse[i]) {
          regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
          this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
        }
        if (strict && format2 === "dddd" && this._fullWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (strict && format2 === "ddd" && this._shortWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (strict && format2 === "dd" && this._minWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    }
    function getSetDayOfWeek(input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      var day = get(this, "Day");
      if (input != null) {
        input = parseWeekday(input, this.localeData());
        return this.add(input - day, "d");
      } else {
        return day;
      }
    }
    function getSetLocaleDayOfWeek(input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
      return input == null ? weekday : this.add(input - weekday, "d");
    }
    function getSetISODayOfWeek(input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      if (input != null) {
        var weekday = parseIsoWeekday(input, this.localeData());
        return this.day(this.day() % 7 ? weekday : weekday - 7);
      } else {
        return this.day() || 7;
      }
    }
    function weekdaysRegex(isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysStrictRegex;
        } else {
          return this._weekdaysRegex;
        }
      } else {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          this._weekdaysRegex = defaultWeekdaysRegex;
        }
        return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
      }
    }
    function weekdaysShortRegex(isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysShortStrictRegex;
        } else {
          return this._weekdaysShortRegex;
        }
      } else {
        if (!hasOwnProp(this, "_weekdaysShortRegex")) {
          this._weekdaysShortRegex = defaultWeekdaysShortRegex;
        }
        return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
      }
    }
    function weekdaysMinRegex(isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysMinStrictRegex;
        } else {
          return this._weekdaysMinRegex;
        }
      } else {
        if (!hasOwnProp(this, "_weekdaysMinRegex")) {
          this._weekdaysMinRegex = defaultWeekdaysMinRegex;
        }
        return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
      }
    }
    function computeWeekdaysParse() {
      function cmpLenRev(a, b) {
        return b.length - a.length;
      }
      var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [], i, mom, minp, shortp, longp;
      for (i = 0;i < 7; i++) {
        mom = createUTC([2000, 1]).day(i);
        minp = regexEscape(this.weekdaysMin(mom, ""));
        shortp = regexEscape(this.weekdaysShort(mom, ""));
        longp = regexEscape(this.weekdays(mom, ""));
        minPieces.push(minp);
        shortPieces.push(shortp);
        longPieces.push(longp);
        mixedPieces.push(minp);
        mixedPieces.push(shortp);
        mixedPieces.push(longp);
      }
      minPieces.sort(cmpLenRev);
      shortPieces.sort(cmpLenRev);
      longPieces.sort(cmpLenRev);
      mixedPieces.sort(cmpLenRev);
      this._weekdaysRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
      this._weekdaysShortRegex = this._weekdaysRegex;
      this._weekdaysMinRegex = this._weekdaysRegex;
      this._weekdaysStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
      this._weekdaysShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
      this._weekdaysMinStrictRegex = new RegExp("^(" + minPieces.join("|") + ")", "i");
    }
    function hFormat() {
      return this.hours() % 12 || 12;
    }
    function kFormat() {
      return this.hours() || 24;
    }
    addFormatToken("H", ["HH", 2], 0, "hour");
    addFormatToken("h", ["hh", 2], 0, hFormat);
    addFormatToken("k", ["kk", 2], 0, kFormat);
    addFormatToken("hmm", 0, 0, function() {
      return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });
    addFormatToken("hmmss", 0, 0, function() {
      return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });
    addFormatToken("Hmm", 0, 0, function() {
      return "" + this.hours() + zeroFill(this.minutes(), 2);
    });
    addFormatToken("Hmmss", 0, 0, function() {
      return "" + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });
    function meridiem(token2, lowercase) {
      addFormatToken(token2, 0, 0, function() {
        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
      });
    }
    meridiem("a", true);
    meridiem("A", false);
    function matchMeridiem(isStrict, locale2) {
      return locale2._meridiemParse;
    }
    addRegexToken("a", matchMeridiem);
    addRegexToken("A", matchMeridiem);
    addRegexToken("H", match1to2, match1to2HasZero);
    addRegexToken("h", match1to2, match1to2NoLeadingZero);
    addRegexToken("k", match1to2, match1to2NoLeadingZero);
    addRegexToken("HH", match1to2, match2);
    addRegexToken("hh", match1to2, match2);
    addRegexToken("kk", match1to2, match2);
    addRegexToken("hmm", match3to4);
    addRegexToken("hmmss", match5to6);
    addRegexToken("Hmm", match3to4);
    addRegexToken("Hmmss", match5to6);
    addParseToken(["H", "HH"], HOUR);
    addParseToken(["k", "kk"], function(input, array, config) {
      var kInput = toInt(input);
      array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(["a", "A"], function(input, array, config) {
      config._isPm = config._locale.isPM(input);
      config._meridiem = input;
    });
    addParseToken(["h", "hh"], function(input, array, config) {
      array[HOUR] = toInt(input);
      getParsingFlags(config).bigHour = true;
    });
    addParseToken("hmm", function(input, array, config) {
      var pos = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos));
      array[MINUTE] = toInt(input.substr(pos));
      getParsingFlags(config).bigHour = true;
    });
    addParseToken("hmmss", function(input, array, config) {
      var pos1 = input.length - 4, pos2 = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos1));
      array[MINUTE] = toInt(input.substr(pos1, 2));
      array[SECOND] = toInt(input.substr(pos2));
      getParsingFlags(config).bigHour = true;
    });
    addParseToken("Hmm", function(input, array, config) {
      var pos = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos));
      array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken("Hmmss", function(input, array, config) {
      var pos1 = input.length - 4, pos2 = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos1));
      array[MINUTE] = toInt(input.substr(pos1, 2));
      array[SECOND] = toInt(input.substr(pos2));
    });
    function localeIsPM(input) {
      return (input + "").toLowerCase().charAt(0) === "p";
    }
    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i, getSetHour = makeGetSet("Hours", true);
    function localeMeridiem(hours2, minutes2, isLower) {
      if (hours2 > 11) {
        return isLower ? "pm" : "PM";
      } else {
        return isLower ? "am" : "AM";
      }
    }
    var baseConfig = {
      calendar: defaultCalendar,
      longDateFormat: defaultLongDateFormat,
      invalidDate: defaultInvalidDate,
      ordinal: defaultOrdinal,
      dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
      relativeTime: defaultRelativeTime,
      months: defaultLocaleMonths,
      monthsShort: defaultLocaleMonthsShort,
      week: defaultLocaleWeek,
      weekdays: defaultLocaleWeekdays,
      weekdaysMin: defaultLocaleWeekdaysMin,
      weekdaysShort: defaultLocaleWeekdaysShort,
      meridiemParse: defaultLocaleMeridiemParse
    };
    var locales = {}, localeFamilies = {}, globalLocale;
    function commonPrefix(arr1, arr2) {
      var i, minl = Math.min(arr1.length, arr2.length);
      for (i = 0;i < minl; i += 1) {
        if (arr1[i] !== arr2[i]) {
          return i;
        }
      }
      return minl;
    }
    function normalizeLocale(key) {
      return key ? key.toLowerCase().replace("_", "-") : key;
    }
    function chooseLocale(names) {
      var i = 0, j, next, locale2, split;
      while (i < names.length) {
        split = normalizeLocale(names[i]).split("-");
        j = split.length;
        next = normalizeLocale(names[i + 1]);
        next = next ? next.split("-") : null;
        while (j > 0) {
          locale2 = loadLocale(split.slice(0, j).join("-"));
          if (locale2) {
            return locale2;
          }
          if (next && next.length >= j && commonPrefix(split, next) >= j - 1) {
            break;
          }
          j--;
        }
        i++;
      }
      return globalLocale;
    }
    function isLocaleNameSane(name) {
      return !!(name && name.match("^[^/\\\\]*$"));
    }
    function loadLocale(name) {
      var oldLocale = null, aliasedRequire;
      if (locales[name] === undefined && typeof module !== "undefined" && module && module.exports && isLocaleNameSane(name)) {
        try {
          oldLocale = globalLocale._abbr;
          aliasedRequire = import.meta.require;
          aliasedRequire("./locale/" + name);
          getSetGlobalLocale(oldLocale);
        } catch (e) {
          locales[name] = null;
        }
      }
      return locales[name];
    }
    function getSetGlobalLocale(key, values) {
      var data;
      if (key) {
        if (isUndefined(values)) {
          data = getLocale(key);
        } else {
          data = defineLocale(key, values);
        }
        if (data) {
          globalLocale = data;
        } else {
          if (typeof console !== "undefined" && console.warn) {
            console.warn("Locale " + key + " not found. Did you forget to load it?");
          }
        }
      }
      return globalLocale._abbr;
    }
    function defineLocale(name, config) {
      if (config !== null) {
        var locale2, parentConfig = baseConfig;
        config.abbr = name;
        if (locales[name] != null) {
          deprecateSimple("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change " + "an existing locale. moment.defineLocale(localeName, " + "config) should only be used for creating a new locale " + "See http://momentjs.com/guides/#/warnings/define-locale/ for more info.");
          parentConfig = locales[name]._config;
        } else if (config.parentLocale != null) {
          if (locales[config.parentLocale] != null) {
            parentConfig = locales[config.parentLocale]._config;
          } else {
            locale2 = loadLocale(config.parentLocale);
            if (locale2 != null) {
              parentConfig = locale2._config;
            } else {
              if (!localeFamilies[config.parentLocale]) {
                localeFamilies[config.parentLocale] = [];
              }
              localeFamilies[config.parentLocale].push({
                name,
                config
              });
              return null;
            }
          }
        }
        locales[name] = new Locale(mergeConfigs(parentConfig, config));
        if (localeFamilies[name]) {
          localeFamilies[name].forEach(function(x) {
            defineLocale(x.name, x.config);
          });
        }
        getSetGlobalLocale(name);
        return locales[name];
      } else {
        delete locales[name];
        return null;
      }
    }
    function updateLocale(name, config) {
      if (config != null) {
        var locale2, tmpLocale, parentConfig = baseConfig;
        if (locales[name] != null && locales[name].parentLocale != null) {
          locales[name].set(mergeConfigs(locales[name]._config, config));
        } else {
          tmpLocale = loadLocale(name);
          if (tmpLocale != null) {
            parentConfig = tmpLocale._config;
          }
          config = mergeConfigs(parentConfig, config);
          if (tmpLocale == null) {
            config.abbr = name;
          }
          locale2 = new Locale(config);
          locale2.parentLocale = locales[name];
          locales[name] = locale2;
        }
        getSetGlobalLocale(name);
      } else {
        if (locales[name] != null) {
          if (locales[name].parentLocale != null) {
            locales[name] = locales[name].parentLocale;
            if (name === getSetGlobalLocale()) {
              getSetGlobalLocale(name);
            }
          } else if (locales[name] != null) {
            delete locales[name];
          }
        }
      }
      return locales[name];
    }
    function getLocale(key) {
      var locale2;
      if (key && key._locale && key._locale._abbr) {
        key = key._locale._abbr;
      }
      if (!key) {
        return globalLocale;
      }
      if (!isArray(key)) {
        locale2 = loadLocale(key);
        if (locale2) {
          return locale2;
        }
        key = [key];
      }
      return chooseLocale(key);
    }
    function listLocales() {
      return keys(locales);
    }
    function checkOverflow(m) {
      var overflow, a = m._a;
      if (a && getParsingFlags(m).overflow === -2) {
        overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
        if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
          overflow = DATE;
        }
        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
          overflow = WEEK;
        }
        if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
          overflow = WEEKDAY;
        }
        getParsingFlags(m).overflow = overflow;
      }
      return m;
    }
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, tzRegex = /Z|[+-]\d\d(?::?\d\d)?/, isoDates = [
      ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
      ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
      ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
      ["GGGG-[W]WW", /\d{4}-W\d\d/, false],
      ["YYYY-DDD", /\d{4}-\d{3}/],
      ["YYYY-MM", /\d{4}-\d\d/, false],
      ["YYYYYYMMDD", /[+-]\d{10}/],
      ["YYYYMMDD", /\d{8}/],
      ["GGGG[W]WWE", /\d{4}W\d{3}/],
      ["GGGG[W]WW", /\d{4}W\d{2}/, false],
      ["YYYYDDD", /\d{7}/],
      ["YYYYMM", /\d{6}/, false],
      ["YYYY", /\d{4}/, false]
    ], isoTimes = [
      ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
      ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
      ["HH:mm:ss", /\d\d:\d\d:\d\d/],
      ["HH:mm", /\d\d:\d\d/],
      ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
      ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
      ["HHmmss", /\d\d\d\d\d\d/],
      ["HHmm", /\d\d\d\d/],
      ["HH", /\d\d/]
    ], aspNetJsonRegex = /^\/?Date\((-?\d+)/i, rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/, obsOffsets = {
      UT: 0,
      GMT: 0,
      EDT: -4 * 60,
      EST: -5 * 60,
      CDT: -5 * 60,
      CST: -6 * 60,
      MDT: -6 * 60,
      MST: -7 * 60,
      PDT: -7 * 60,
      PST: -8 * 60
    };
    function configFromISO(config) {
      var i, l, string = config._i, match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string), allowTime, dateFormat, timeFormat, tzFormat, isoDatesLen = isoDates.length, isoTimesLen = isoTimes.length;
      if (match) {
        getParsingFlags(config).iso = true;
        for (i = 0, l = isoDatesLen;i < l; i++) {
          if (isoDates[i][1].exec(match[1])) {
            dateFormat = isoDates[i][0];
            allowTime = isoDates[i][2] !== false;
            break;
          }
        }
        if (dateFormat == null) {
          config._isValid = false;
          return;
        }
        if (match[3]) {
          for (i = 0, l = isoTimesLen;i < l; i++) {
            if (isoTimes[i][1].exec(match[3])) {
              timeFormat = (match[2] || " ") + isoTimes[i][0];
              break;
            }
          }
          if (timeFormat == null) {
            config._isValid = false;
            return;
          }
        }
        if (!allowTime && timeFormat != null) {
          config._isValid = false;
          return;
        }
        if (match[4]) {
          if (tzRegex.exec(match[4])) {
            tzFormat = "Z";
          } else {
            config._isValid = false;
            return;
          }
        }
        config._f = dateFormat + (timeFormat || "") + (tzFormat || "");
        configFromStringAndFormat(config);
      } else {
        config._isValid = false;
      }
    }
    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
      var result = [
        untruncateYear(yearStr),
        defaultLocaleMonthsShort.indexOf(monthStr),
        parseInt(dayStr, 10),
        parseInt(hourStr, 10),
        parseInt(minuteStr, 10)
      ];
      if (secondStr) {
        result.push(parseInt(secondStr, 10));
      }
      return result;
    }
    function untruncateYear(yearStr) {
      var year = parseInt(yearStr, 10);
      if (year <= 49) {
        return 2000 + year;
      } else if (year <= 999) {
        return 1900 + year;
      }
      return year;
    }
    function preprocessRFC2822(s) {
      return s.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    }
    function checkWeekday(weekdayStr, parsedInput, config) {
      if (weekdayStr) {
        var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr), weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
        if (weekdayProvided !== weekdayActual) {
          getParsingFlags(config).weekdayMismatch = true;
          config._isValid = false;
          return false;
        }
      }
      return true;
    }
    function calculateOffset(obsOffset, militaryOffset, numOffset) {
      if (obsOffset) {
        return obsOffsets[obsOffset];
      } else if (militaryOffset) {
        return 0;
      } else {
        var hm = parseInt(numOffset, 10), m = hm % 100, h = (hm - m) / 100;
        return h * 60 + m;
      }
    }
    function configFromRFC2822(config) {
      var match = rfc2822.exec(preprocessRFC2822(config._i)), parsedArray;
      if (match) {
        parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
        if (!checkWeekday(match[1], parsedArray, config)) {
          return;
        }
        config._a = parsedArray;
        config._tzm = calculateOffset(match[8], match[9], match[10]);
        config._d = createUTCDate.apply(null, config._a);
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        getParsingFlags(config).rfc2822 = true;
      } else {
        config._isValid = false;
      }
    }
    function configFromString(config) {
      var matched = aspNetJsonRegex.exec(config._i);
      if (matched !== null) {
        config._d = new Date(+matched[1]);
        return;
      }
      configFromISO(config);
      if (config._isValid === false) {
        delete config._isValid;
      } else {
        return;
      }
      configFromRFC2822(config);
      if (config._isValid === false) {
        delete config._isValid;
      } else {
        return;
      }
      if (config._strict) {
        config._isValid = false;
      } else {
        hooks.createFromInputFallback(config);
      }
    }
    hooks.createFromInputFallback = deprecate("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), " + "which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are " + "discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function(config) {
      config._d = new Date(config._i + (config._useUTC ? " UTC" : ""));
    });
    function defaults(a, b, c) {
      if (a != null) {
        return a;
      }
      if (b != null) {
        return b;
      }
      return c;
    }
    function currentDateArray(config) {
      var nowValue = new Date(hooks.now());
      if (config._useUTC) {
        return [
          nowValue.getUTCFullYear(),
          nowValue.getUTCMonth(),
          nowValue.getUTCDate()
        ];
      }
      return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }
    function configFromArray(config) {
      var i, date, input = [], currentDate, expectedWeekday, yearToUse;
      if (config._d) {
        return;
      }
      currentDate = currentDateArray(config);
      if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
        dayOfYearFromWeekInfo(config);
      }
      if (config._dayOfYear != null) {
        yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
        if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
          getParsingFlags(config)._overflowDayOfYear = true;
        }
        date = createUTCDate(yearToUse, 0, config._dayOfYear);
        config._a[MONTH] = date.getUTCMonth();
        config._a[DATE] = date.getUTCDate();
      }
      for (i = 0;i < 3 && config._a[i] == null; ++i) {
        config._a[i] = input[i] = currentDate[i];
      }
      for (;i < 7; i++) {
        config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
      }
      if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
        config._nextDay = true;
        config._a[HOUR] = 0;
      }
      config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
      expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();
      if (config._tzm != null) {
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
      }
      if (config._nextDay) {
        config._a[HOUR] = 24;
      }
      if (config._w && typeof config._w.d !== "undefined" && config._w.d !== expectedWeekday) {
        getParsingFlags(config).weekdayMismatch = true;
      }
    }
    function dayOfYearFromWeekInfo(config) {
      var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;
      w = config._w;
      if (w.GG != null || w.W != null || w.E != null) {
        dow = 1;
        doy = 4;
        weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
        week = defaults(w.W, 1);
        weekday = defaults(w.E, 1);
        if (weekday < 1 || weekday > 7) {
          weekdayOverflow = true;
        }
      } else {
        dow = config._locale._week.dow;
        doy = config._locale._week.doy;
        curWeek = weekOfYear(createLocal(), dow, doy);
        weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
        week = defaults(w.w, curWeek.week);
        if (w.d != null) {
          weekday = w.d;
          if (weekday < 0 || weekday > 6) {
            weekdayOverflow = true;
          }
        } else if (w.e != null) {
          weekday = w.e + dow;
          if (w.e < 0 || w.e > 6) {
            weekdayOverflow = true;
          }
        } else {
          weekday = dow;
        }
      }
      if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
        getParsingFlags(config)._overflowWeeks = true;
      } else if (weekdayOverflow != null) {
        getParsingFlags(config)._overflowWeekday = true;
      } else {
        temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
      }
    }
    hooks.ISO_8601 = function() {
    };
    hooks.RFC_2822 = function() {
    };
    function configFromStringAndFormat(config) {
      if (config._f === hooks.ISO_8601) {
        configFromISO(config);
        return;
      }
      if (config._f === hooks.RFC_2822) {
        configFromRFC2822(config);
        return;
      }
      config._a = [];
      getParsingFlags(config).empty = true;
      var string = "" + config._i, i, parsedInput, tokens2, token2, skipped, stringLength = string.length, totalParsedInputLength = 0, era, tokenLen;
      tokens2 = expandFormat(config._f, config._locale).match(formattingTokens) || [];
      tokenLen = tokens2.length;
      for (i = 0;i < tokenLen; i++) {
        token2 = tokens2[i];
        parsedInput = (string.match(getParseRegexForToken(token2, config)) || [])[0];
        if (parsedInput) {
          skipped = string.substr(0, string.indexOf(parsedInput));
          if (skipped.length > 0) {
            getParsingFlags(config).unusedInput.push(skipped);
          }
          string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
          totalParsedInputLength += parsedInput.length;
        }
        if (formatTokenFunctions[token2]) {
          if (parsedInput) {
            getParsingFlags(config).empty = false;
          } else {
            getParsingFlags(config).unusedTokens.push(token2);
          }
          addTimeToArrayFromToken(token2, parsedInput, config);
        } else if (config._strict && !parsedInput) {
          getParsingFlags(config).unusedTokens.push(token2);
        }
      }
      getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
      if (string.length > 0) {
        getParsingFlags(config).unusedInput.push(string);
      }
      if (config._a[HOUR] <= 12 && getParsingFlags(config).bigHour === true && config._a[HOUR] > 0) {
        getParsingFlags(config).bigHour = undefined;
      }
      getParsingFlags(config).parsedDateParts = config._a.slice(0);
      getParsingFlags(config).meridiem = config._meridiem;
      config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
      era = getParsingFlags(config).era;
      if (era !== null) {
        config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
      }
      configFromArray(config);
      checkOverflow(config);
    }
    function meridiemFixWrap(locale2, hour, meridiem2) {
      var isPm;
      if (meridiem2 == null) {
        return hour;
      }
      if (locale2.meridiemHour != null) {
        return locale2.meridiemHour(hour, meridiem2);
      } else if (locale2.isPM != null) {
        isPm = locale2.isPM(meridiem2);
        if (isPm && hour < 12) {
          hour += 12;
        }
        if (!isPm && hour === 12) {
          hour = 0;
        }
        return hour;
      } else {
        return hour;
      }
    }
    function configFromStringAndArray(config) {
      var tempConfig, bestMoment, scoreToBeat, i, currentScore, validFormatFound, bestFormatIsValid = false, configfLen = config._f.length;
      if (configfLen === 0) {
        getParsingFlags(config).invalidFormat = true;
        config._d = new Date(NaN);
        return;
      }
      for (i = 0;i < configfLen; i++) {
        currentScore = 0;
        validFormatFound = false;
        tempConfig = copyConfig({}, config);
        if (config._useUTC != null) {
          tempConfig._useUTC = config._useUTC;
        }
        tempConfig._f = config._f[i];
        configFromStringAndFormat(tempConfig);
        if (isValid(tempConfig)) {
          validFormatFound = true;
        }
        currentScore += getParsingFlags(tempConfig).charsLeftOver;
        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
        getParsingFlags(tempConfig).score = currentScore;
        if (!bestFormatIsValid) {
          if (scoreToBeat == null || currentScore < scoreToBeat || validFormatFound) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
            if (validFormatFound) {
              bestFormatIsValid = true;
            }
          }
        } else {
          if (currentScore < scoreToBeat) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
          }
        }
      }
      extend(config, bestMoment || tempConfig);
    }
    function configFromObject(config) {
      if (config._d) {
        return;
      }
      var i = normalizeObjectUnits(config._i), dayOrDate = i.day === undefined ? i.date : i.day;
      config._a = map([i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond], function(obj) {
        return obj && parseInt(obj, 10);
      });
      configFromArray(config);
    }
    function createFromConfig(config) {
      var res = new Moment(checkOverflow(prepareConfig(config)));
      if (res._nextDay) {
        res.add(1, "d");
        res._nextDay = undefined;
      }
      return res;
    }
    function prepareConfig(config) {
      var { _i: input, _f: format2 } = config;
      config._locale = config._locale || getLocale(config._l);
      if (input === null || format2 === undefined && input === "") {
        return createInvalid({ nullInput: true });
      }
      if (typeof input === "string") {
        config._i = input = config._locale.preparse(input);
      }
      if (isMoment(input)) {
        return new Moment(checkOverflow(input));
      } else if (isDate(input)) {
        config._d = input;
      } else if (isArray(format2)) {
        configFromStringAndArray(config);
      } else if (format2) {
        configFromStringAndFormat(config);
      } else {
        configFromInput(config);
      }
      if (!isValid(config)) {
        config._d = null;
      }
      return config;
    }
    function configFromInput(config) {
      var input = config._i;
      if (isUndefined(input)) {
        config._d = new Date(hooks.now());
      } else if (isDate(input)) {
        config._d = new Date(input.valueOf());
      } else if (typeof input === "string") {
        configFromString(config);
      } else if (isArray(input)) {
        config._a = map(input.slice(0), function(obj) {
          return parseInt(obj, 10);
        });
        configFromArray(config);
      } else if (isObject(input)) {
        configFromObject(config);
      } else if (isNumber(input)) {
        config._d = new Date(input);
      } else {
        hooks.createFromInputFallback(config);
      }
    }
    function createLocalOrUTC(input, format2, locale2, strict, isUTC) {
      var c = {};
      if (format2 === true || format2 === false) {
        strict = format2;
        format2 = undefined;
      }
      if (locale2 === true || locale2 === false) {
        strict = locale2;
        locale2 = undefined;
      }
      if (isObject(input) && isObjectEmpty(input) || isArray(input) && input.length === 0) {
        input = undefined;
      }
      c._isAMomentObject = true;
      c._useUTC = c._isUTC = isUTC;
      c._l = locale2;
      c._i = input;
      c._f = format2;
      c._strict = strict;
      return createFromConfig(c);
    }
    function createLocal(input, format2, locale2, strict) {
      return createLocalOrUTC(input, format2, locale2, strict, false);
    }
    var prototypeMin = deprecate("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var other = createLocal.apply(null, arguments);
      if (this.isValid() && other.isValid()) {
        return other < this ? this : other;
      } else {
        return createInvalid();
      }
    }), prototypeMax = deprecate("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var other = createLocal.apply(null, arguments);
      if (this.isValid() && other.isValid()) {
        return other > this ? this : other;
      } else {
        return createInvalid();
      }
    });
    function pickBy(fn, moments) {
      var res, i;
      if (moments.length === 1 && isArray(moments[0])) {
        moments = moments[0];
      }
      if (!moments.length) {
        return createLocal();
      }
      res = moments[0];
      for (i = 1;i < moments.length; ++i) {
        if (!moments[i].isValid() || moments[i][fn](res)) {
          res = moments[i];
        }
      }
      return res;
    }
    function min() {
      var args = [].slice.call(arguments, 0);
      return pickBy("isBefore", args);
    }
    function max() {
      var args = [].slice.call(arguments, 0);
      return pickBy("isAfter", args);
    }
    var now = function() {
      return Date.now ? Date.now() : +new Date;
    };
    var ordering = [
      "year",
      "quarter",
      "month",
      "week",
      "day",
      "hour",
      "minute",
      "second",
      "millisecond"
    ];
    function isDurationValid(m) {
      var key, unitHasDecimal = false, i, orderLen = ordering.length;
      for (key in m) {
        if (hasOwnProp(m, key) && !(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
          return false;
        }
      }
      for (i = 0;i < orderLen; ++i) {
        if (m[ordering[i]]) {
          if (unitHasDecimal) {
            return false;
          }
          if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
            unitHasDecimal = true;
          }
        }
      }
      return true;
    }
    function isValid$1() {
      return this._isValid;
    }
    function createInvalid$1() {
      return createDuration(NaN);
    }
    function Duration(duration) {
      var normalizedInput = normalizeObjectUnits(duration), years2 = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months2 = normalizedInput.month || 0, weeks2 = normalizedInput.week || normalizedInput.isoWeek || 0, days2 = normalizedInput.day || 0, hours2 = normalizedInput.hour || 0, minutes2 = normalizedInput.minute || 0, seconds2 = normalizedInput.second || 0, milliseconds2 = normalizedInput.millisecond || 0;
      this._isValid = isDurationValid(normalizedInput);
      this._milliseconds = +milliseconds2 + seconds2 * 1000 + minutes2 * 60000 + hours2 * 1000 * 60 * 60;
      this._days = +days2 + weeks2 * 7;
      this._months = +months2 + quarters * 3 + years2 * 12;
      this._data = {};
      this._locale = getLocale();
      this._bubble();
    }
    function isDuration(obj) {
      return obj instanceof Duration;
    }
    function absRound(number) {
      if (number < 0) {
        return Math.round(-1 * number) * -1;
      } else {
        return Math.round(number);
      }
    }
    function compareArrays(array1, array2, dontConvert) {
      var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
      for (i = 0;i < len; i++) {
        if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
          diffs++;
        }
      }
      return diffs + lengthDiff;
    }
    function offset(token2, separator) {
      addFormatToken(token2, 0, 0, function() {
        var offset2 = this.utcOffset(), sign2 = "+";
        if (offset2 < 0) {
          offset2 = -offset2;
          sign2 = "-";
        }
        return sign2 + zeroFill(~~(offset2 / 60), 2) + separator + zeroFill(~~offset2 % 60, 2);
      });
    }
    offset("Z", ":");
    offset("ZZ", "");
    addRegexToken("Z", matchShortOffset);
    addRegexToken("ZZ", matchShortOffset);
    addParseToken(["Z", "ZZ"], function(input, array, config) {
      config._useUTC = true;
      config._tzm = offsetFromString(matchShortOffset, input);
    });
    var chunkOffset = /([\+\-]|\d\d)/gi;
    function offsetFromString(matcher, string) {
      var matches = (string || "").match(matcher), chunk, parts, minutes2;
      if (matches === null) {
        return null;
      }
      chunk = matches[matches.length - 1] || [];
      parts = (chunk + "").match(chunkOffset) || ["-", 0, 0];
      minutes2 = +(parts[1] * 60) + toInt(parts[2]);
      return minutes2 === 0 ? 0 : parts[0] === "+" ? minutes2 : -minutes2;
    }
    function cloneWithOffset(input, model) {
      var res, diff2;
      if (model._isUTC) {
        res = model.clone();
        diff2 = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
        res._d.setTime(res._d.valueOf() + diff2);
        hooks.updateOffset(res, false);
        return res;
      } else {
        return createLocal(input).local();
      }
    }
    function getDateOffset(m) {
      return -Math.round(m._d.getTimezoneOffset());
    }
    hooks.updateOffset = function() {
    };
    function getSetOffset(input, keepLocalTime, keepMinutes) {
      var offset2 = this._offset || 0, localAdjust;
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      if (input != null) {
        if (typeof input === "string") {
          input = offsetFromString(matchShortOffset, input);
          if (input === null) {
            return this;
          }
        } else if (Math.abs(input) < 16 && !keepMinutes) {
          input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
          localAdjust = getDateOffset(this);
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
          this.add(localAdjust, "m");
        }
        if (offset2 !== input) {
          if (!keepLocalTime || this._changeInProgress) {
            addSubtract(this, createDuration(input - offset2, "m"), 1, false);
          } else if (!this._changeInProgress) {
            this._changeInProgress = true;
            hooks.updateOffset(this, true);
            this._changeInProgress = null;
          }
        }
        return this;
      } else {
        return this._isUTC ? offset2 : getDateOffset(this);
      }
    }
    function getSetZone(input, keepLocalTime) {
      if (input != null) {
        if (typeof input !== "string") {
          input = -input;
        }
        this.utcOffset(input, keepLocalTime);
        return this;
      } else {
        return -this.utcOffset();
      }
    }
    function setOffsetToUTC(keepLocalTime) {
      return this.utcOffset(0, keepLocalTime);
    }
    function setOffsetToLocal(keepLocalTime) {
      if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;
        if (keepLocalTime) {
          this.subtract(getDateOffset(this), "m");
        }
      }
      return this;
    }
    function setOffsetToParsedOffset() {
      if (this._tzm != null) {
        this.utcOffset(this._tzm, false, true);
      } else if (typeof this._i === "string") {
        var tZone = offsetFromString(matchOffset, this._i);
        if (tZone != null) {
          this.utcOffset(tZone);
        } else {
          this.utcOffset(0, true);
        }
      }
      return this;
    }
    function hasAlignedHourOffset(input) {
      if (!this.isValid()) {
        return false;
      }
      input = input ? createLocal(input).utcOffset() : 0;
      return (this.utcOffset() - input) % 60 === 0;
    }
    function isDaylightSavingTime() {
      return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
    }
    function isDaylightSavingTimeShifted() {
      if (!isUndefined(this._isDSTShifted)) {
        return this._isDSTShifted;
      }
      var c = {}, other;
      copyConfig(c, this);
      c = prepareConfig(c);
      if (c._a) {
        other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
        this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
      } else {
        this._isDSTShifted = false;
      }
      return this._isDSTShifted;
    }
    function isLocal() {
      return this.isValid() ? !this._isUTC : false;
    }
    function isUtcOffset() {
      return this.isValid() ? this._isUTC : false;
    }
    function isUtc() {
      return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }
    var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/, isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
    function createDuration(input, key) {
      var duration = input, match = null, sign2, ret, diffRes;
      if (isDuration(input)) {
        duration = {
          ms: input._milliseconds,
          d: input._days,
          M: input._months
        };
      } else if (isNumber(input) || !isNaN(+input)) {
        duration = {};
        if (key) {
          duration[key] = +input;
        } else {
          duration.milliseconds = +input;
        }
      } else if (match = aspNetRegex.exec(input)) {
        sign2 = match[1] === "-" ? -1 : 1;
        duration = {
          y: 0,
          d: toInt(match[DATE]) * sign2,
          h: toInt(match[HOUR]) * sign2,
          m: toInt(match[MINUTE]) * sign2,
          s: toInt(match[SECOND]) * sign2,
          ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign2
        };
      } else if (match = isoRegex.exec(input)) {
        sign2 = match[1] === "-" ? -1 : 1;
        duration = {
          y: parseIso(match[2], sign2),
          M: parseIso(match[3], sign2),
          w: parseIso(match[4], sign2),
          d: parseIso(match[5], sign2),
          h: parseIso(match[6], sign2),
          m: parseIso(match[7], sign2),
          s: parseIso(match[8], sign2)
        };
      } else if (duration == null) {
        duration = {};
      } else if (typeof duration === "object" && (("from" in duration) || ("to" in duration))) {
        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
        duration = {};
        duration.ms = diffRes.milliseconds;
        duration.M = diffRes.months;
      }
      ret = new Duration(duration);
      if (isDuration(input) && hasOwnProp(input, "_locale")) {
        ret._locale = input._locale;
      }
      if (isDuration(input) && hasOwnProp(input, "_isValid")) {
        ret._isValid = input._isValid;
      }
      return ret;
    }
    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;
    function parseIso(inp, sign2) {
      var res = inp && parseFloat(inp.replace(",", "."));
      return (isNaN(res) ? 0 : res) * sign2;
    }
    function positiveMomentsDifference(base, other) {
      var res = {};
      res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
      if (base.clone().add(res.months, "M").isAfter(other)) {
        --res.months;
      }
      res.milliseconds = +other - +base.clone().add(res.months, "M");
      return res;
    }
    function momentsDifference(base, other) {
      var res;
      if (!(base.isValid() && other.isValid())) {
        return { milliseconds: 0, months: 0 };
      }
      other = cloneWithOffset(other, base);
      if (base.isBefore(other)) {
        res = positiveMomentsDifference(base, other);
      } else {
        res = positiveMomentsDifference(other, base);
        res.milliseconds = -res.milliseconds;
        res.months = -res.months;
      }
      return res;
    }
    function createAdder(direction, name) {
      return function(val, period) {
        var dur, tmp;
        if (period !== null && !isNaN(+period)) {
          deprecateSimple(name, "moment()." + name + "(period, number) is deprecated. Please use moment()." + name + "(number, period). " + "See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.");
          tmp = val;
          val = period;
          period = tmp;
        }
        dur = createDuration(val, period);
        addSubtract(this, dur, direction);
        return this;
      };
    }
    function addSubtract(mom, duration, isAdding, updateOffset) {
      var milliseconds2 = duration._milliseconds, days2 = absRound(duration._days), months2 = absRound(duration._months);
      if (!mom.isValid()) {
        return;
      }
      updateOffset = updateOffset == null ? true : updateOffset;
      if (months2) {
        setMonth(mom, get(mom, "Month") + months2 * isAdding);
      }
      if (days2) {
        set$1(mom, "Date", get(mom, "Date") + days2 * isAdding);
      }
      if (milliseconds2) {
        mom._d.setTime(mom._d.valueOf() + milliseconds2 * isAdding);
      }
      if (updateOffset) {
        hooks.updateOffset(mom, days2 || months2);
      }
    }
    var add = createAdder(1, "add"), subtract = createAdder(-1, "subtract");
    function isString(input) {
      return typeof input === "string" || input instanceof String;
    }
    function isMomentInput(input) {
      return isMoment(input) || isDate(input) || isString(input) || isNumber(input) || isNumberOrStringArray(input) || isMomentInputObject(input) || input === null || input === undefined;
    }
    function isMomentInputObject(input) {
      var objectTest = isObject(input) && !isObjectEmpty(input), propertyTest = false, properties = [
        "years",
        "year",
        "y",
        "months",
        "month",
        "M",
        "days",
        "day",
        "d",
        "dates",
        "date",
        "D",
        "hours",
        "hour",
        "h",
        "minutes",
        "minute",
        "m",
        "seconds",
        "second",
        "s",
        "milliseconds",
        "millisecond",
        "ms"
      ], i, property, propertyLen = properties.length;
      for (i = 0;i < propertyLen; i += 1) {
        property = properties[i];
        propertyTest = propertyTest || hasOwnProp(input, property);
      }
      return objectTest && propertyTest;
    }
    function isNumberOrStringArray(input) {
      var arrayTest = isArray(input), dataTypeTest = false;
      if (arrayTest) {
        dataTypeTest = input.filter(function(item) {
          return !isNumber(item) && isString(input);
        }).length === 0;
      }
      return arrayTest && dataTypeTest;
    }
    function isCalendarSpec(input) {
      var objectTest = isObject(input) && !isObjectEmpty(input), propertyTest = false, properties = [
        "sameDay",
        "nextDay",
        "lastDay",
        "nextWeek",
        "lastWeek",
        "sameElse"
      ], i, property;
      for (i = 0;i < properties.length; i += 1) {
        property = properties[i];
        propertyTest = propertyTest || hasOwnProp(input, property);
      }
      return objectTest && propertyTest;
    }
    function getCalendarFormat(myMoment, now2) {
      var diff2 = myMoment.diff(now2, "days", true);
      return diff2 < -6 ? "sameElse" : diff2 < -1 ? "lastWeek" : diff2 < 0 ? "lastDay" : diff2 < 1 ? "sameDay" : diff2 < 2 ? "nextDay" : diff2 < 7 ? "nextWeek" : "sameElse";
    }
    function calendar$1(time, formats) {
      if (arguments.length === 1) {
        if (!arguments[0]) {
          time = undefined;
          formats = undefined;
        } else if (isMomentInput(arguments[0])) {
          time = arguments[0];
          formats = undefined;
        } else if (isCalendarSpec(arguments[0])) {
          formats = arguments[0];
          time = undefined;
        }
      }
      var now2 = time || createLocal(), sod = cloneWithOffset(now2, this).startOf("day"), format2 = hooks.calendarFormat(this, sod) || "sameElse", output = formats && (isFunction(formats[format2]) ? formats[format2].call(this, now2) : formats[format2]);
      return this.format(output || this.localeData().calendar(format2, this, createLocal(now2)));
    }
    function clone() {
      return new Moment(this);
    }
    function isAfter(input, units) {
      var localInput = isMoment(input) ? input : createLocal(input);
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(units) || "millisecond";
      if (units === "millisecond") {
        return this.valueOf() > localInput.valueOf();
      } else {
        return localInput.valueOf() < this.clone().startOf(units).valueOf();
      }
    }
    function isBefore(input, units) {
      var localInput = isMoment(input) ? input : createLocal(input);
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(units) || "millisecond";
      if (units === "millisecond") {
        return this.valueOf() < localInput.valueOf();
      } else {
        return this.clone().endOf(units).valueOf() < localInput.valueOf();
      }
    }
    function isBetween(from2, to2, units, inclusivity) {
      var localFrom = isMoment(from2) ? from2 : createLocal(from2), localTo = isMoment(to2) ? to2 : createLocal(to2);
      if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
        return false;
      }
      inclusivity = inclusivity || "()";
      return (inclusivity[0] === "(" ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) && (inclusivity[1] === ")" ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }
    function isSame(input, units) {
      var localInput = isMoment(input) ? input : createLocal(input), inputMs;
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(units) || "millisecond";
      if (units === "millisecond") {
        return this.valueOf() === localInput.valueOf();
      } else {
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
      }
    }
    function isSameOrAfter(input, units) {
      return this.isSame(input, units) || this.isAfter(input, units);
    }
    function isSameOrBefore(input, units) {
      return this.isSame(input, units) || this.isBefore(input, units);
    }
    function diff(input, units, asFloat) {
      var that, zoneDelta, output;
      if (!this.isValid()) {
        return NaN;
      }
      that = cloneWithOffset(input, this);
      if (!that.isValid()) {
        return NaN;
      }
      zoneDelta = (that.utcOffset() - this.utcOffset()) * 60000;
      units = normalizeUnits(units);
      switch (units) {
        case "year":
          output = monthDiff(this, that) / 12;
          break;
        case "month":
          output = monthDiff(this, that);
          break;
        case "quarter":
          output = monthDiff(this, that) / 3;
          break;
        case "second":
          output = (this - that) / 1000;
          break;
        case "minute":
          output = (this - that) / 60000;
          break;
        case "hour":
          output = (this - that) / 3600000;
          break;
        case "day":
          output = (this - that - zoneDelta) / 86400000;
          break;
        case "week":
          output = (this - that - zoneDelta) / 604800000;
          break;
        default:
          output = this - that;
      }
      return asFloat ? output : absFloor(output);
    }
    function monthDiff(a, b) {
      if (a.date() < b.date()) {
        return -monthDiff(b, a);
      }
      var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()), anchor = a.clone().add(wholeMonthDiff, "months"), anchor2, adjust;
      if (b - anchor < 0) {
        anchor2 = a.clone().add(wholeMonthDiff - 1, "months");
        adjust = (b - anchor) / (anchor - anchor2);
      } else {
        anchor2 = a.clone().add(wholeMonthDiff + 1, "months");
        adjust = (b - anchor) / (anchor2 - anchor);
      }
      return -(wholeMonthDiff + adjust) || 0;
    }
    hooks.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
    hooks.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
    function toString() {
      return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
    }
    function toISOString(keepOffset) {
      if (!this.isValid()) {
        return null;
      }
      var utc = keepOffset !== true, m = utc ? this.clone().utc() : this;
      if (m.year() < 0 || m.year() > 9999) {
        return formatMoment(m, utc ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ");
      }
      if (isFunction(Date.prototype.toISOString)) {
        if (utc) {
          return this.toDate().toISOString();
        } else {
          return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace("Z", formatMoment(m, "Z"));
        }
      }
      return formatMoment(m, utc ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ");
    }
    function inspect() {
      if (!this.isValid()) {
        return "moment.invalid(/* " + this._i + " */)";
      }
      var func = "moment", zone = "", prefix, year, datetime, suffix;
      if (!this.isLocal()) {
        func = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone";
        zone = "Z";
      }
      prefix = "[" + func + '("]';
      year = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY";
      datetime = "-MM-DD[T]HH:mm:ss.SSS";
      suffix = zone + '[")]';
      return this.format(prefix + year + datetime + suffix);
    }
    function format(inputString) {
      if (!inputString) {
        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
      }
      var output = formatMoment(this, inputString);
      return this.localeData().postformat(output);
    }
    function from(time, withoutSuffix) {
      if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
        return createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
      } else {
        return this.localeData().invalidDate();
      }
    }
    function fromNow(withoutSuffix) {
      return this.from(createLocal(), withoutSuffix);
    }
    function to(time, withoutSuffix) {
      if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
        return createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
      } else {
        return this.localeData().invalidDate();
      }
    }
    function toNow(withoutSuffix) {
      return this.to(createLocal(), withoutSuffix);
    }
    function locale(key) {
      var newLocaleData;
      if (key === undefined) {
        return this._locale._abbr;
      } else {
        newLocaleData = getLocale(key);
        if (newLocaleData != null) {
          this._locale = newLocaleData;
        }
        return this;
      }
    }
    var lang = deprecate("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(key) {
      if (key === undefined) {
        return this.localeData();
      } else {
        return this.locale(key);
      }
    });
    function localeData() {
      return this._locale;
    }
    var MS_PER_SECOND = 1000, MS_PER_MINUTE = 60 * MS_PER_SECOND, MS_PER_HOUR = 60 * MS_PER_MINUTE, MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;
    function mod$1(dividend, divisor) {
      return (dividend % divisor + divisor) % divisor;
    }
    function localStartOfDate(y, m, d) {
      if (y < 100 && y >= 0) {
        return new Date(y + 400, m, d) - MS_PER_400_YEARS;
      } else {
        return new Date(y, m, d).valueOf();
      }
    }
    function utcStartOfDate(y, m, d) {
      if (y < 100 && y >= 0) {
        return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
      } else {
        return Date.UTC(y, m, d);
      }
    }
    function startOf(units) {
      var time, startOfDate;
      units = normalizeUnits(units);
      if (units === undefined || units === "millisecond" || !this.isValid()) {
        return this;
      }
      startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
      switch (units) {
        case "year":
          time = startOfDate(this.year(), 0, 1);
          break;
        case "quarter":
          time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
          break;
        case "month":
          time = startOfDate(this.year(), this.month(), 1);
          break;
        case "week":
          time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
          break;
        case "isoWeek":
          time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
          break;
        case "day":
        case "date":
          time = startOfDate(this.year(), this.month(), this.date());
          break;
        case "hour":
          time = this._d.valueOf();
          time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
          break;
        case "minute":
          time = this._d.valueOf();
          time -= mod$1(time, MS_PER_MINUTE);
          break;
        case "second":
          time = this._d.valueOf();
          time -= mod$1(time, MS_PER_SECOND);
          break;
      }
      this._d.setTime(time);
      hooks.updateOffset(this, true);
      return this;
    }
    function endOf(units) {
      var time, startOfDate;
      units = normalizeUnits(units);
      if (units === undefined || units === "millisecond" || !this.isValid()) {
        return this;
      }
      startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
      switch (units) {
        case "year":
          time = startOfDate(this.year() + 1, 0, 1) - 1;
          break;
        case "quarter":
          time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
          break;
        case "month":
          time = startOfDate(this.year(), this.month() + 1, 1) - 1;
          break;
        case "week":
          time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
          break;
        case "isoWeek":
          time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
          break;
        case "day":
        case "date":
          time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
          break;
        case "hour":
          time = this._d.valueOf();
          time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
          break;
        case "minute":
          time = this._d.valueOf();
          time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
          break;
        case "second":
          time = this._d.valueOf();
          time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
          break;
      }
      this._d.setTime(time);
      hooks.updateOffset(this, true);
      return this;
    }
    function valueOf() {
      return this._d.valueOf() - (this._offset || 0) * 60000;
    }
    function unix() {
      return Math.floor(this.valueOf() / 1000);
    }
    function toDate() {
      return new Date(this.valueOf());
    }
    function toArray() {
      var m = this;
      return [
        m.year(),
        m.month(),
        m.date(),
        m.hour(),
        m.minute(),
        m.second(),
        m.millisecond()
      ];
    }
    function toObject() {
      var m = this;
      return {
        years: m.year(),
        months: m.month(),
        date: m.date(),
        hours: m.hours(),
        minutes: m.minutes(),
        seconds: m.seconds(),
        milliseconds: m.milliseconds()
      };
    }
    function toJSON() {
      return this.isValid() ? this.toISOString() : null;
    }
    function isValid$2() {
      return isValid(this);
    }
    function parsingFlags() {
      return extend({}, getParsingFlags(this));
    }
    function invalidAt() {
      return getParsingFlags(this).overflow;
    }
    function creationData() {
      return {
        input: this._i,
        format: this._f,
        locale: this._locale,
        isUTC: this._isUTC,
        strict: this._strict
      };
    }
    addFormatToken("N", 0, 0, "eraAbbr");
    addFormatToken("NN", 0, 0, "eraAbbr");
    addFormatToken("NNN", 0, 0, "eraAbbr");
    addFormatToken("NNNN", 0, 0, "eraName");
    addFormatToken("NNNNN", 0, 0, "eraNarrow");
    addFormatToken("y", ["y", 1], "yo", "eraYear");
    addFormatToken("y", ["yy", 2], 0, "eraYear");
    addFormatToken("y", ["yyy", 3], 0, "eraYear");
    addFormatToken("y", ["yyyy", 4], 0, "eraYear");
    addRegexToken("N", matchEraAbbr);
    addRegexToken("NN", matchEraAbbr);
    addRegexToken("NNN", matchEraAbbr);
    addRegexToken("NNNN", matchEraName);
    addRegexToken("NNNNN", matchEraNarrow);
    addParseToken(["N", "NN", "NNN", "NNNN", "NNNNN"], function(input, array, config, token2) {
      var era = config._locale.erasParse(input, token2, config._strict);
      if (era) {
        getParsingFlags(config).era = era;
      } else {
        getParsingFlags(config).invalidEra = input;
      }
    });
    addRegexToken("y", matchUnsigned);
    addRegexToken("yy", matchUnsigned);
    addRegexToken("yyy", matchUnsigned);
    addRegexToken("yyyy", matchUnsigned);
    addRegexToken("yo", matchEraYearOrdinal);
    addParseToken(["y", "yy", "yyy", "yyyy"], YEAR);
    addParseToken(["yo"], function(input, array, config, token2) {
      var match;
      if (config._locale._eraYearOrdinalRegex) {
        match = input.match(config._locale._eraYearOrdinalRegex);
      }
      if (config._locale.eraYearOrdinalParse) {
        array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
      } else {
        array[YEAR] = parseInt(input, 10);
      }
    });
    function localeEras(m, format2) {
      var i, l, date, eras = this._eras || getLocale("en")._eras;
      for (i = 0, l = eras.length;i < l; ++i) {
        switch (typeof eras[i].since) {
          case "string":
            date = hooks(eras[i].since).startOf("day");
            eras[i].since = date.valueOf();
            break;
        }
        switch (typeof eras[i].until) {
          case "undefined":
            eras[i].until = Infinity;
            break;
          case "string":
            date = hooks(eras[i].until).startOf("day").valueOf();
            eras[i].until = date.valueOf();
            break;
        }
      }
      return eras;
    }
    function localeErasParse(eraName, format2, strict) {
      var i, l, eras = this.eras(), name, abbr, narrow;
      eraName = eraName.toUpperCase();
      for (i = 0, l = eras.length;i < l; ++i) {
        name = eras[i].name.toUpperCase();
        abbr = eras[i].abbr.toUpperCase();
        narrow = eras[i].narrow.toUpperCase();
        if (strict) {
          switch (format2) {
            case "N":
            case "NN":
            case "NNN":
              if (abbr === eraName) {
                return eras[i];
              }
              break;
            case "NNNN":
              if (name === eraName) {
                return eras[i];
              }
              break;
            case "NNNNN":
              if (narrow === eraName) {
                return eras[i];
              }
              break;
          }
        } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
          return eras[i];
        }
      }
    }
    function localeErasConvertYear(era, year) {
      var dir = era.since <= era.until ? 1 : -1;
      if (year === undefined) {
        return hooks(era.since).year();
      } else {
        return hooks(era.since).year() + (year - era.offset) * dir;
      }
    }
    function getEraName() {
      var i, l, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until) {
          return eras[i].name;
        }
        if (eras[i].until <= val && val <= eras[i].since) {
          return eras[i].name;
        }
      }
      return "";
    }
    function getEraNarrow() {
      var i, l, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until) {
          return eras[i].narrow;
        }
        if (eras[i].until <= val && val <= eras[i].since) {
          return eras[i].narrow;
        }
      }
      return "";
    }
    function getEraAbbr() {
      var i, l, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until) {
          return eras[i].abbr;
        }
        if (eras[i].until <= val && val <= eras[i].since) {
          return eras[i].abbr;
        }
      }
      return "";
    }
    function getEraYear() {
      var i, l, dir, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        dir = eras[i].since <= eras[i].until ? 1 : -1;
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until || eras[i].until <= val && val <= eras[i].since) {
          return (this.year() - hooks(eras[i].since).year()) * dir + eras[i].offset;
        }
      }
      return this.year();
    }
    function erasNameRegex(isStrict) {
      if (!hasOwnProp(this, "_erasNameRegex")) {
        computeErasParse.call(this);
      }
      return isStrict ? this._erasNameRegex : this._erasRegex;
    }
    function erasAbbrRegex(isStrict) {
      if (!hasOwnProp(this, "_erasAbbrRegex")) {
        computeErasParse.call(this);
      }
      return isStrict ? this._erasAbbrRegex : this._erasRegex;
    }
    function erasNarrowRegex(isStrict) {
      if (!hasOwnProp(this, "_erasNarrowRegex")) {
        computeErasParse.call(this);
      }
      return isStrict ? this._erasNarrowRegex : this._erasRegex;
    }
    function matchEraAbbr(isStrict, locale2) {
      return locale2.erasAbbrRegex(isStrict);
    }
    function matchEraName(isStrict, locale2) {
      return locale2.erasNameRegex(isStrict);
    }
    function matchEraNarrow(isStrict, locale2) {
      return locale2.erasNarrowRegex(isStrict);
    }
    function matchEraYearOrdinal(isStrict, locale2) {
      return locale2._eraYearOrdinalRegex || matchUnsigned;
    }
    function computeErasParse() {
      var abbrPieces = [], namePieces = [], narrowPieces = [], mixedPieces = [], i, l, erasName, erasAbbr, erasNarrow, eras = this.eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        erasName = regexEscape(eras[i].name);
        erasAbbr = regexEscape(eras[i].abbr);
        erasNarrow = regexEscape(eras[i].narrow);
        namePieces.push(erasName);
        abbrPieces.push(erasAbbr);
        narrowPieces.push(erasNarrow);
        mixedPieces.push(erasName);
        mixedPieces.push(erasAbbr);
        mixedPieces.push(erasNarrow);
      }
      this._erasRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
      this._erasNameRegex = new RegExp("^(" + namePieces.join("|") + ")", "i");
      this._erasAbbrRegex = new RegExp("^(" + abbrPieces.join("|") + ")", "i");
      this._erasNarrowRegex = new RegExp("^(" + narrowPieces.join("|") + ")", "i");
    }
    addFormatToken(0, ["gg", 2], 0, function() {
      return this.weekYear() % 100;
    });
    addFormatToken(0, ["GG", 2], 0, function() {
      return this.isoWeekYear() % 100;
    });
    function addWeekYearFormatToken(token2, getter) {
      addFormatToken(0, [token2, token2.length], 0, getter);
    }
    addWeekYearFormatToken("gggg", "weekYear");
    addWeekYearFormatToken("ggggg", "weekYear");
    addWeekYearFormatToken("GGGG", "isoWeekYear");
    addWeekYearFormatToken("GGGGG", "isoWeekYear");
    addRegexToken("G", matchSigned);
    addRegexToken("g", matchSigned);
    addRegexToken("GG", match1to2, match2);
    addRegexToken("gg", match1to2, match2);
    addRegexToken("GGGG", match1to4, match4);
    addRegexToken("gggg", match1to4, match4);
    addRegexToken("GGGGG", match1to6, match6);
    addRegexToken("ggggg", match1to6, match6);
    addWeekParseToken(["gggg", "ggggg", "GGGG", "GGGGG"], function(input, week, config, token2) {
      week[token2.substr(0, 2)] = toInt(input);
    });
    addWeekParseToken(["gg", "GG"], function(input, week, config, token2) {
      week[token2] = hooks.parseTwoDigitYear(input);
    });
    function getSetWeekYear(input) {
      return getSetWeekYearHelper.call(this, input, this.week(), this.weekday() + this.localeData()._week.dow, this.localeData()._week.dow, this.localeData()._week.doy);
    }
    function getSetISOWeekYear(input) {
      return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }
    function getISOWeeksInYear() {
      return weeksInYear(this.year(), 1, 4);
    }
    function getISOWeeksInISOWeekYear() {
      return weeksInYear(this.isoWeekYear(), 1, 4);
    }
    function getWeeksInYear() {
      var weekInfo = this.localeData()._week;
      return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }
    function getWeeksInWeekYear() {
      var weekInfo = this.localeData()._week;
      return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
    }
    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
      var weeksTarget;
      if (input == null) {
        return weekOfYear(this, dow, doy).year;
      } else {
        weeksTarget = weeksInYear(input, dow, doy);
        if (week > weeksTarget) {
          week = weeksTarget;
        }
        return setWeekAll.call(this, input, week, weekday, dow, doy);
      }
    }
    function setWeekAll(weekYear, week, weekday, dow, doy) {
      var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy), date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
      this.year(date.getUTCFullYear());
      this.month(date.getUTCMonth());
      this.date(date.getUTCDate());
      return this;
    }
    addFormatToken("Q", 0, "Qo", "quarter");
    addRegexToken("Q", match1);
    addParseToken("Q", function(input, array) {
      array[MONTH] = (toInt(input) - 1) * 3;
    });
    function getSetQuarter(input) {
      return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }
    addFormatToken("D", ["DD", 2], "Do", "date");
    addRegexToken("D", match1to2, match1to2NoLeadingZero);
    addRegexToken("DD", match1to2, match2);
    addRegexToken("Do", function(isStrict, locale2) {
      return isStrict ? locale2._dayOfMonthOrdinalParse || locale2._ordinalParse : locale2._dayOfMonthOrdinalParseLenient;
    });
    addParseToken(["D", "DD"], DATE);
    addParseToken("Do", function(input, array) {
      array[DATE] = toInt(input.match(match1to2)[0]);
    });
    var getSetDayOfMonth = makeGetSet("Date", true);
    addFormatToken("DDD", ["DDDD", 3], "DDDo", "dayOfYear");
    addRegexToken("DDD", match1to3);
    addRegexToken("DDDD", match3);
    addParseToken(["DDD", "DDDD"], function(input, array, config) {
      config._dayOfYear = toInt(input);
    });
    function getSetDayOfYear(input) {
      var dayOfYear = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 86400000) + 1;
      return input == null ? dayOfYear : this.add(input - dayOfYear, "d");
    }
    addFormatToken("m", ["mm", 2], 0, "minute");
    addRegexToken("m", match1to2, match1to2HasZero);
    addRegexToken("mm", match1to2, match2);
    addParseToken(["m", "mm"], MINUTE);
    var getSetMinute = makeGetSet("Minutes", false);
    addFormatToken("s", ["ss", 2], 0, "second");
    addRegexToken("s", match1to2, match1to2HasZero);
    addRegexToken("ss", match1to2, match2);
    addParseToken(["s", "ss"], SECOND);
    var getSetSecond = makeGetSet("Seconds", false);
    addFormatToken("S", 0, 0, function() {
      return ~~(this.millisecond() / 100);
    });
    addFormatToken(0, ["SS", 2], 0, function() {
      return ~~(this.millisecond() / 10);
    });
    addFormatToken(0, ["SSS", 3], 0, "millisecond");
    addFormatToken(0, ["SSSS", 4], 0, function() {
      return this.millisecond() * 10;
    });
    addFormatToken(0, ["SSSSS", 5], 0, function() {
      return this.millisecond() * 100;
    });
    addFormatToken(0, ["SSSSSS", 6], 0, function() {
      return this.millisecond() * 1000;
    });
    addFormatToken(0, ["SSSSSSS", 7], 0, function() {
      return this.millisecond() * 1e4;
    });
    addFormatToken(0, ["SSSSSSSS", 8], 0, function() {
      return this.millisecond() * 1e5;
    });
    addFormatToken(0, ["SSSSSSSSS", 9], 0, function() {
      return this.millisecond() * 1e6;
    });
    addRegexToken("S", match1to3, match1);
    addRegexToken("SS", match1to3, match2);
    addRegexToken("SSS", match1to3, match3);
    var token, getSetMillisecond;
    for (token = "SSSS";token.length <= 9; token += "S") {
      addRegexToken(token, matchUnsigned);
    }
    function parseMs(input, array) {
      array[MILLISECOND] = toInt(("0." + input) * 1000);
    }
    for (token = "S";token.length <= 9; token += "S") {
      addParseToken(token, parseMs);
    }
    getSetMillisecond = makeGetSet("Milliseconds", false);
    addFormatToken("z", 0, 0, "zoneAbbr");
    addFormatToken("zz", 0, 0, "zoneName");
    function getZoneAbbr() {
      return this._isUTC ? "UTC" : "";
    }
    function getZoneName() {
      return this._isUTC ? "Coordinated Universal Time" : "";
    }
    var proto = Moment.prototype;
    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    if (typeof Symbol !== "undefined" && Symbol.for != null) {
      proto[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return "Moment<" + this.format() + ">";
      };
    }
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.eraName = getEraName;
    proto.eraNarrow = getEraNarrow;
    proto.eraAbbr = getEraAbbr;
    proto.eraYear = getEraYear;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.weeksInWeekYear = getWeeksInWeekYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate("dates accessor is deprecated. Use date instead.", getSetDayOfMonth);
    proto.months = deprecate("months accessor is deprecated. Use month instead", getSetMonth);
    proto.years = deprecate("years accessor is deprecated. Use year instead", getSetYear);
    proto.zone = deprecate("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", getSetZone);
    proto.isDSTShifted = deprecate("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", isDaylightSavingTimeShifted);
    function createUnix(input) {
      return createLocal(input * 1000);
    }
    function createInZone() {
      return createLocal.apply(null, arguments).parseZone();
    }
    function preParsePostFormat(string) {
      return string;
    }
    var proto$1 = Locale.prototype;
    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.eras = localeEras;
    proto$1.erasParse = localeErasParse;
    proto$1.erasConvertYear = localeErasConvertYear;
    proto$1.erasAbbrRegex = erasAbbrRegex;
    proto$1.erasNameRegex = erasNameRegex;
    proto$1.erasNarrowRegex = erasNarrowRegex;
    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;
    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;
    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;
    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;
    function get$1(format2, index, field, setter) {
      var locale2 = getLocale(), utc = createUTC().set(setter, index);
      return locale2[field](utc, format2);
    }
    function listMonthsImpl(format2, index, field) {
      if (isNumber(format2)) {
        index = format2;
        format2 = undefined;
      }
      format2 = format2 || "";
      if (index != null) {
        return get$1(format2, index, field, "month");
      }
      var i, out = [];
      for (i = 0;i < 12; i++) {
        out[i] = get$1(format2, i, field, "month");
      }
      return out;
    }
    function listWeekdaysImpl(localeSorted, format2, index, field) {
      if (typeof localeSorted === "boolean") {
        if (isNumber(format2)) {
          index = format2;
          format2 = undefined;
        }
        format2 = format2 || "";
      } else {
        format2 = localeSorted;
        index = format2;
        localeSorted = false;
        if (isNumber(format2)) {
          index = format2;
          format2 = undefined;
        }
        format2 = format2 || "";
      }
      var locale2 = getLocale(), shift = localeSorted ? locale2._week.dow : 0, i, out = [];
      if (index != null) {
        return get$1(format2, (index + shift) % 7, field, "day");
      }
      for (i = 0;i < 7; i++) {
        out[i] = get$1(format2, (i + shift) % 7, field, "day");
      }
      return out;
    }
    function listMonths(format2, index) {
      return listMonthsImpl(format2, index, "months");
    }
    function listMonthsShort(format2, index) {
      return listMonthsImpl(format2, index, "monthsShort");
    }
    function listWeekdays(localeSorted, format2, index) {
      return listWeekdaysImpl(localeSorted, format2, index, "weekdays");
    }
    function listWeekdaysShort(localeSorted, format2, index) {
      return listWeekdaysImpl(localeSorted, format2, index, "weekdaysShort");
    }
    function listWeekdaysMin(localeSorted, format2, index) {
      return listWeekdaysImpl(localeSorted, format2, index, "weekdaysMin");
    }
    getSetGlobalLocale("en", {
      eras: [
        {
          since: "0001-01-01",
          until: Infinity,
          offset: 1,
          name: "Anno Domini",
          narrow: "AD",
          abbr: "AD"
        },
        {
          since: "0000-12-31",
          until: -Infinity,
          offset: 1,
          name: "Before Christ",
          narrow: "BC",
          abbr: "BC"
        }
      ],
      dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
      ordinal: function(number) {
        var b = number % 10, output = toInt(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
        return number + output;
      }
    });
    hooks.lang = deprecate("moment.lang is deprecated. Use moment.locale instead.", getSetGlobalLocale);
    hooks.langData = deprecate("moment.langData is deprecated. Use moment.localeData instead.", getLocale);
    var mathAbs = Math.abs;
    function abs() {
      var data = this._data;
      this._milliseconds = mathAbs(this._milliseconds);
      this._days = mathAbs(this._days);
      this._months = mathAbs(this._months);
      data.milliseconds = mathAbs(data.milliseconds);
      data.seconds = mathAbs(data.seconds);
      data.minutes = mathAbs(data.minutes);
      data.hours = mathAbs(data.hours);
      data.months = mathAbs(data.months);
      data.years = mathAbs(data.years);
      return this;
    }
    function addSubtract$1(duration, input, value, direction) {
      var other = createDuration(input, value);
      duration._milliseconds += direction * other._milliseconds;
      duration._days += direction * other._days;
      duration._months += direction * other._months;
      return duration._bubble();
    }
    function add$1(input, value) {
      return addSubtract$1(this, input, value, 1);
    }
    function subtract$1(input, value) {
      return addSubtract$1(this, input, value, -1);
    }
    function absCeil(number) {
      if (number < 0) {
        return Math.floor(number);
      } else {
        return Math.ceil(number);
      }
    }
    function bubble() {
      var milliseconds2 = this._milliseconds, days2 = this._days, months2 = this._months, data = this._data, seconds2, minutes2, hours2, years2, monthsFromDays;
      if (!(milliseconds2 >= 0 && days2 >= 0 && months2 >= 0 || milliseconds2 <= 0 && days2 <= 0 && months2 <= 0)) {
        milliseconds2 += absCeil(monthsToDays(months2) + days2) * 86400000;
        days2 = 0;
        months2 = 0;
      }
      data.milliseconds = milliseconds2 % 1000;
      seconds2 = absFloor(milliseconds2 / 1000);
      data.seconds = seconds2 % 60;
      minutes2 = absFloor(seconds2 / 60);
      data.minutes = minutes2 % 60;
      hours2 = absFloor(minutes2 / 60);
      data.hours = hours2 % 24;
      days2 += absFloor(hours2 / 24);
      monthsFromDays = absFloor(daysToMonths(days2));
      months2 += monthsFromDays;
      days2 -= absCeil(monthsToDays(monthsFromDays));
      years2 = absFloor(months2 / 12);
      months2 %= 12;
      data.days = days2;
      data.months = months2;
      data.years = years2;
      return this;
    }
    function daysToMonths(days2) {
      return days2 * 4800 / 146097;
    }
    function monthsToDays(months2) {
      return months2 * 146097 / 4800;
    }
    function as(units) {
      if (!this.isValid()) {
        return NaN;
      }
      var days2, months2, milliseconds2 = this._milliseconds;
      units = normalizeUnits(units);
      if (units === "month" || units === "quarter" || units === "year") {
        days2 = this._days + milliseconds2 / 86400000;
        months2 = this._months + daysToMonths(days2);
        switch (units) {
          case "month":
            return months2;
          case "quarter":
            return months2 / 3;
          case "year":
            return months2 / 12;
        }
      } else {
        days2 = this._days + Math.round(monthsToDays(this._months));
        switch (units) {
          case "week":
            return days2 / 7 + milliseconds2 / 604800000;
          case "day":
            return days2 + milliseconds2 / 86400000;
          case "hour":
            return days2 * 24 + milliseconds2 / 3600000;
          case "minute":
            return days2 * 1440 + milliseconds2 / 60000;
          case "second":
            return days2 * 86400 + milliseconds2 / 1000;
          case "millisecond":
            return Math.floor(days2 * 86400000) + milliseconds2;
          default:
            throw new Error("Unknown unit " + units);
        }
      }
    }
    function makeAs(alias) {
      return function() {
        return this.as(alias);
      };
    }
    var asMilliseconds = makeAs("ms"), asSeconds = makeAs("s"), asMinutes = makeAs("m"), asHours = makeAs("h"), asDays = makeAs("d"), asWeeks = makeAs("w"), asMonths = makeAs("M"), asQuarters = makeAs("Q"), asYears = makeAs("y"), valueOf$1 = asMilliseconds;
    function clone$1() {
      return createDuration(this);
    }
    function get$2(units) {
      units = normalizeUnits(units);
      return this.isValid() ? this[units + "s"]() : NaN;
    }
    function makeGetter(name) {
      return function() {
        return this.isValid() ? this._data[name] : NaN;
      };
    }
    var milliseconds = makeGetter("milliseconds"), seconds = makeGetter("seconds"), minutes = makeGetter("minutes"), hours = makeGetter("hours"), days = makeGetter("days"), months = makeGetter("months"), years = makeGetter("years");
    function weeks() {
      return absFloor(this.days() / 7);
    }
    var round = Math.round, thresholds = {
      ss: 44,
      s: 45,
      m: 45,
      h: 22,
      d: 26,
      w: null,
      M: 11
    };
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale2) {
      return locale2.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function relativeTime$1(posNegDuration, withoutSuffix, thresholds2, locale2) {
      var duration = createDuration(posNegDuration).abs(), seconds2 = round(duration.as("s")), minutes2 = round(duration.as("m")), hours2 = round(duration.as("h")), days2 = round(duration.as("d")), months2 = round(duration.as("M")), weeks2 = round(duration.as("w")), years2 = round(duration.as("y")), a = seconds2 <= thresholds2.ss && ["s", seconds2] || seconds2 < thresholds2.s && ["ss", seconds2] || minutes2 <= 1 && ["m"] || minutes2 < thresholds2.m && ["mm", minutes2] || hours2 <= 1 && ["h"] || hours2 < thresholds2.h && ["hh", hours2] || days2 <= 1 && ["d"] || days2 < thresholds2.d && ["dd", days2];
      if (thresholds2.w != null) {
        a = a || weeks2 <= 1 && ["w"] || weeks2 < thresholds2.w && ["ww", weeks2];
      }
      a = a || months2 <= 1 && ["M"] || months2 < thresholds2.M && ["MM", months2] || years2 <= 1 && ["y"] || ["yy", years2];
      a[2] = withoutSuffix;
      a[3] = +posNegDuration > 0;
      a[4] = locale2;
      return substituteTimeAgo.apply(null, a);
    }
    function getSetRelativeTimeRounding(roundingFunction) {
      if (roundingFunction === undefined) {
        return round;
      }
      if (typeof roundingFunction === "function") {
        round = roundingFunction;
        return true;
      }
      return false;
    }
    function getSetRelativeTimeThreshold(threshold, limit) {
      if (thresholds[threshold] === undefined) {
        return false;
      }
      if (limit === undefined) {
        return thresholds[threshold];
      }
      thresholds[threshold] = limit;
      if (threshold === "s") {
        thresholds.ss = limit - 1;
      }
      return true;
    }
    function humanize(argWithSuffix, argThresholds) {
      if (!this.isValid()) {
        return this.localeData().invalidDate();
      }
      var withSuffix = false, th = thresholds, locale2, output;
      if (typeof argWithSuffix === "object") {
        argThresholds = argWithSuffix;
        argWithSuffix = false;
      }
      if (typeof argWithSuffix === "boolean") {
        withSuffix = argWithSuffix;
      }
      if (typeof argThresholds === "object") {
        th = Object.assign({}, thresholds, argThresholds);
        if (argThresholds.s != null && argThresholds.ss == null) {
          th.ss = argThresholds.s - 1;
        }
      }
      locale2 = this.localeData();
      output = relativeTime$1(this, !withSuffix, th, locale2);
      if (withSuffix) {
        output = locale2.pastFuture(+this, output);
      }
      return locale2.postformat(output);
    }
    var abs$1 = Math.abs;
    function sign(x) {
      return (x > 0) - (x < 0) || +x;
    }
    function toISOString$1() {
      if (!this.isValid()) {
        return this.localeData().invalidDate();
      }
      var seconds2 = abs$1(this._milliseconds) / 1000, days2 = abs$1(this._days), months2 = abs$1(this._months), minutes2, hours2, years2, s, total = this.asSeconds(), totalSign, ymSign, daysSign, hmsSign;
      if (!total) {
        return "P0D";
      }
      minutes2 = absFloor(seconds2 / 60);
      hours2 = absFloor(minutes2 / 60);
      seconds2 %= 60;
      minutes2 %= 60;
      years2 = absFloor(months2 / 12);
      months2 %= 12;
      s = seconds2 ? seconds2.toFixed(3).replace(/\.?0+$/, "") : "";
      totalSign = total < 0 ? "-" : "";
      ymSign = sign(this._months) !== sign(total) ? "-" : "";
      daysSign = sign(this._days) !== sign(total) ? "-" : "";
      hmsSign = sign(this._milliseconds) !== sign(total) ? "-" : "";
      return totalSign + "P" + (years2 ? ymSign + years2 + "Y" : "") + (months2 ? ymSign + months2 + "M" : "") + (days2 ? daysSign + days2 + "D" : "") + (hours2 || minutes2 || seconds2 ? "T" : "") + (hours2 ? hmsSign + hours2 + "H" : "") + (minutes2 ? hmsSign + minutes2 + "M" : "") + (seconds2 ? hmsSign + s + "S" : "");
    }
    var proto$2 = Duration.prototype;
    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asQuarters = asQuarters;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;
    proto$2.toIsoString = deprecate("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", toISOString$1);
    proto$2.lang = lang;
    addFormatToken("X", 0, 0, "unix");
    addFormatToken("x", 0, 0, "valueOf");
    addRegexToken("x", matchSigned);
    addRegexToken("X", matchTimestamp);
    addParseToken("X", function(input, array, config) {
      config._d = new Date(parseFloat(input) * 1000);
    });
    addParseToken("x", function(input, array, config) {
      config._d = new Date(toInt(input));
    });
    //! moment.js
    hooks.version = "2.30.1";
    setHookCallback(createLocal);
    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;
    hooks.HTML5_FMT = {
      DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
      DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
      DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
      DATE: "YYYY-MM-DD",
      TIME: "HH:mm",
      TIME_SECONDS: "HH:mm:ss",
      TIME_MS: "HH:mm:ss.SSS",
      WEEK: "GGGG-[W]WW",
      MONTH: "YYYY-MM"
    };
    return hooks;
  });
});

// node_modules/logform/format.js
var require_format = __commonJS((exports, module) => {
  class InvalidFormatError extends Error {
    constructor(formatFn) {
      super(`Format functions must be synchronous taking a two arguments: (info, opts)
Found: ${formatFn.toString().split("\n")[0]}\n`);
      Error.captureStackTrace(this, InvalidFormatError);
    }
  }
  module.exports = (formatFn) => {
    if (formatFn.length > 2) {
      throw new InvalidFormatError(formatFn);
    }
    function Format(options = {}) {
      this.options = options;
    }
    Format.prototype.transform = formatFn;
    function createFormatWrap(opts) {
      return new Format(opts);
    }
    createFormatWrap.Format = Format;
    return createFormatWrap;
  };
});

// node_modules/@colors/colors/lib/styles.js
var require_styles = __commonJS((exports, module) => {
  var styles = {};
  module["exports"] = styles;
  var codes = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],
    brightRed: [91, 39],
    brightGreen: [92, 39],
    brightYellow: [93, 39],
    brightBlue: [94, 39],
    brightMagenta: [95, 39],
    brightCyan: [96, 39],
    brightWhite: [97, 39],
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
    bgBrightRed: [101, 49],
    bgBrightGreen: [102, 49],
    bgBrightYellow: [103, 49],
    bgBrightBlue: [104, 49],
    bgBrightMagenta: [105, 49],
    bgBrightCyan: [106, 49],
    bgBrightWhite: [107, 49],
    blackBG: [40, 49],
    redBG: [41, 49],
    greenBG: [42, 49],
    yellowBG: [43, 49],
    blueBG: [44, 49],
    magentaBG: [45, 49],
    cyanBG: [46, 49],
    whiteBG: [47, 49]
  };
  Object.keys(codes).forEach(function(key) {
    var val = codes[key];
    var style = styles[key] = [];
    style.open = "\x1B[" + val[0] + "m";
    style.close = "\x1B[" + val[1] + "m";
  });
});

// node_modules/@colors/colors/lib/system/has-flag.js
var require_has_flag = __commonJS((exports, module) => {
  module.exports = function(flag, argv) {
    argv = argv || process.argv || [];
    var terminatorPos = argv.indexOf("--");
    var prefix = /^-{1,2}/.test(flag) ? "" : "--";
    var pos = argv.indexOf(prefix + flag);
    return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
  };
});

// node_modules/@colors/colors/lib/system/supports-colors.js
var require_supports_colors = __commonJS((exports, module) => {
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(stream) {
    if (forceColor === false) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (stream && !stream.isTTY && forceColor !== true) {
      return 0;
    }
    var min = forceColor ? 1 : 0;
    if (process.platform === "win32") {
      var osRelease = os.release().split(".");
      if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some(function(sign) {
        return sign in env;
      }) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if ("TERM_PROGRAM" in env) {
      var version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Hyper":
          return 3;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    if (env.TERM === "dumb") {
      return min;
    }
    return min;
  }
  function getSupportLevel(stream) {
    var level = supportsColor(stream);
    return translateLevel(level);
  }
  var os = import.meta.require("os");
  var hasFlag = require_has_flag();
  var env = process.env;
  var forceColor = undefined;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
    forceColor = false;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = true;
  }
  if ("FORCE_COLOR" in env) {
    forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
  }
  module.exports = {
    supportsColor: getSupportLevel,
    stdout: getSupportLevel(process.stdout),
    stderr: getSupportLevel(process.stderr)
  };
});

// node_modules/@colors/colors/lib/custom/trap.js
var require_trap = __commonJS((exports, module) => {
  module["exports"] = function runTheTrap(text, options) {
    var result = "";
    text = text || "Run the trap, drop the bass";
    text = text.split("");
    var trap = {
      a: ["@", "\u0104", "\u023A", "\u0245", "\u0394", "\u039B", "\u0414"],
      b: ["\xDF", "\u0181", "\u0243", "\u026E", "\u03B2", "\u0E3F"],
      c: ["\xA9", "\u023B", "\u03FE"],
      d: ["\xD0", "\u018A", "\u0500", "\u0501", "\u0502", "\u0503"],
      e: [
        "\xCB",
        "\u0115",
        "\u018E",
        "\u0258",
        "\u03A3",
        "\u03BE",
        "\u04BC",
        "\u0A6C"
      ],
      f: ["\u04FA"],
      g: ["\u0262"],
      h: ["\u0126", "\u0195", "\u04A2", "\u04BA", "\u04C7", "\u050A"],
      i: ["\u0F0F"],
      j: ["\u0134"],
      k: ["\u0138", "\u04A0", "\u04C3", "\u051E"],
      l: ["\u0139"],
      m: ["\u028D", "\u04CD", "\u04CE", "\u0520", "\u0521", "\u0D69"],
      n: ["\xD1", "\u014B", "\u019D", "\u0376", "\u03A0", "\u048A"],
      o: [
        "\xD8",
        "\xF5",
        "\xF8",
        "\u01FE",
        "\u0298",
        "\u047A",
        "\u05DD",
        "\u06DD",
        "\u0E4F"
      ],
      p: ["\u01F7", "\u048E"],
      q: ["\u09CD"],
      r: ["\xAE", "\u01A6", "\u0210", "\u024C", "\u0280", "\u042F"],
      s: ["\xA7", "\u03DE", "\u03DF", "\u03E8"],
      t: ["\u0141", "\u0166", "\u0373"],
      u: ["\u01B1", "\u054D"],
      v: ["\u05D8"],
      w: ["\u0428", "\u0460", "\u047C", "\u0D70"],
      x: ["\u04B2", "\u04FE", "\u04FC", "\u04FD"],
      y: ["\xA5", "\u04B0", "\u04CB"],
      z: ["\u01B5", "\u0240"]
    };
    text.forEach(function(c) {
      c = c.toLowerCase();
      var chars = trap[c] || [" "];
      var rand = Math.floor(Math.random() * chars.length);
      if (typeof trap[c] !== "undefined") {
        result += trap[c][rand];
      } else {
        result += c;
      }
    });
    return result;
  };
});

// node_modules/@colors/colors/lib/custom/zalgo.js
var require_zalgo = __commonJS((exports, module) => {
  module["exports"] = function zalgo(text, options) {
    text = text || "   he is here   ";
    var soul = {
      up: [
        "\u030D",
        "\u030E",
        "\u0304",
        "\u0305",
        "\u033F",
        "\u0311",
        "\u0306",
        "\u0310",
        "\u0352",
        "\u0357",
        "\u0351",
        "\u0307",
        "\u0308",
        "\u030A",
        "\u0342",
        "\u0313",
        "\u0308",
        "\u034A",
        "\u034B",
        "\u034C",
        "\u0303",
        "\u0302",
        "\u030C",
        "\u0350",
        "\u0300",
        "\u0301",
        "\u030B",
        "\u030F",
        "\u0312",
        "\u0313",
        "\u0314",
        "\u033D",
        "\u0309",
        "\u0363",
        "\u0364",
        "\u0365",
        "\u0366",
        "\u0367",
        "\u0368",
        "\u0369",
        "\u036A",
        "\u036B",
        "\u036C",
        "\u036D",
        "\u036E",
        "\u036F",
        "\u033E",
        "\u035B",
        "\u0346",
        "\u031A"
      ],
      down: [
        "\u0316",
        "\u0317",
        "\u0318",
        "\u0319",
        "\u031C",
        "\u031D",
        "\u031E",
        "\u031F",
        "\u0320",
        "\u0324",
        "\u0325",
        "\u0326",
        "\u0329",
        "\u032A",
        "\u032B",
        "\u032C",
        "\u032D",
        "\u032E",
        "\u032F",
        "\u0330",
        "\u0331",
        "\u0332",
        "\u0333",
        "\u0339",
        "\u033A",
        "\u033B",
        "\u033C",
        "\u0345",
        "\u0347",
        "\u0348",
        "\u0349",
        "\u034D",
        "\u034E",
        "\u0353",
        "\u0354",
        "\u0355",
        "\u0356",
        "\u0359",
        "\u035A",
        "\u0323"
      ],
      mid: [
        "\u0315",
        "\u031B",
        "\u0300",
        "\u0301",
        "\u0358",
        "\u0321",
        "\u0322",
        "\u0327",
        "\u0328",
        "\u0334",
        "\u0335",
        "\u0336",
        "\u035C",
        "\u035D",
        "\u035E",
        "\u035F",
        "\u0360",
        "\u0362",
        "\u0338",
        "\u0337",
        "\u0361",
        " \u0489"
      ]
    };
    var all = [].concat(soul.up, soul.down, soul.mid);
    function randomNumber(range) {
      var r = Math.floor(Math.random() * range);
      return r;
    }
    function isChar(character) {
      var bool = false;
      all.filter(function(i) {
        bool = i === character;
      });
      return bool;
    }
    function heComes(text2, options2) {
      var result = "";
      var counts;
      var l;
      options2 = options2 || {};
      options2["up"] = typeof options2["up"] !== "undefined" ? options2["up"] : true;
      options2["mid"] = typeof options2["mid"] !== "undefined" ? options2["mid"] : true;
      options2["down"] = typeof options2["down"] !== "undefined" ? options2["down"] : true;
      options2["size"] = typeof options2["size"] !== "undefined" ? options2["size"] : "maxi";
      text2 = text2.split("");
      for (l in text2) {
        if (isChar(l)) {
          continue;
        }
        result = result + text2[l];
        counts = { up: 0, down: 0, mid: 0 };
        switch (options2.size) {
          case "mini":
            counts.up = randomNumber(8);
            counts.mid = randomNumber(2);
            counts.down = randomNumber(8);
            break;
          case "maxi":
            counts.up = randomNumber(16) + 3;
            counts.mid = randomNumber(4) + 1;
            counts.down = randomNumber(64) + 3;
            break;
          default:
            counts.up = randomNumber(8) + 1;
            counts.mid = randomNumber(6) / 2;
            counts.down = randomNumber(8) + 1;
            break;
        }
        var arr = ["up", "mid", "down"];
        for (var d in arr) {
          var index = arr[d];
          for (var i = 0;i <= counts[index]; i++) {
            if (options2[index]) {
              result = result + soul[index][randomNumber(soul[index].length)];
            }
          }
        }
      }
      return result;
    }
    return heComes(text, options);
  };
});

// node_modules/@colors/colors/lib/maps/america.js
var require_america = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    return function(letter, i, exploded) {
      if (letter === " ")
        return letter;
      switch (i % 3) {
        case 0:
          return colors.red(letter);
        case 1:
          return colors.white(letter);
        case 2:
          return colors.blue(letter);
      }
    };
  };
});

// node_modules/@colors/colors/lib/maps/zebra.js
var require_zebra = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    return function(letter, i, exploded) {
      return i % 2 === 0 ? letter : colors.inverse(letter);
    };
  };
});

// node_modules/@colors/colors/lib/maps/rainbow.js
var require_rainbow = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    var rainbowColors = ["red", "yellow", "green", "blue", "magenta"];
    return function(letter, i, exploded) {
      if (letter === " ") {
        return letter;
      } else {
        return colors[rainbowColors[i++ % rainbowColors.length]](letter);
      }
    };
  };
});

// node_modules/@colors/colors/lib/maps/random.js
var require_random = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    var available = [
      "underline",
      "inverse",
      "grey",
      "yellow",
      "red",
      "green",
      "blue",
      "white",
      "cyan",
      "magenta",
      "brightYellow",
      "brightRed",
      "brightGreen",
      "brightBlue",
      "brightWhite",
      "brightCyan",
      "brightMagenta"
    ];
    return function(letter, i, exploded) {
      return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 2))]](letter);
    };
  };
});

// node_modules/@colors/colors/lib/colors.js
var require_colors = __commonJS((exports, module) => {
  function build(_styles) {
    var builder = function builder() {
      return applyStyle.apply(builder, arguments);
    };
    builder._styles = _styles;
    builder.__proto__ = proto;
    return builder;
  }
  function applyStyle() {
    var args = Array.prototype.slice.call(arguments);
    var str = args.map(function(arg) {
      if (arg != null && arg.constructor === String) {
        return arg;
      } else {
        return util.inspect(arg);
      }
    }).join(" ");
    if (!colors.enabled || !str) {
      return str;
    }
    var newLinesPresent = str.indexOf("\n") != -1;
    var nestedStyles = this._styles;
    var i = nestedStyles.length;
    while (i--) {
      var code = ansiStyles[nestedStyles[i]];
      str = code.open + str.replace(code.closeRe, code.open) + code.close;
      if (newLinesPresent) {
        str = str.replace(newLineRegex, function(match) {
          return code.close + match + code.open;
        });
      }
    }
    return str;
  }
  function init() {
    var ret = {};
    Object.keys(styles).forEach(function(name) {
      ret[name] = {
        get: function() {
          return build([name]);
        }
      };
    });
    return ret;
  }
  var colors = {};
  module["exports"] = colors;
  colors.themes = {};
  var util = import.meta.require("util");
  var ansiStyles = colors.styles = require_styles();
  var defineProps = Object.defineProperties;
  var newLineRegex = new RegExp(/[\r\n]+/g);
  colors.supportsColor = require_supports_colors().supportsColor;
  if (typeof colors.enabled === "undefined") {
    colors.enabled = colors.supportsColor() !== false;
  }
  colors.enable = function() {
    colors.enabled = true;
  };
  colors.disable = function() {
    colors.enabled = false;
  };
  colors.stripColors = colors.strip = function(str) {
    return ("" + str).replace(/\x1B\[\d+m/g, "");
  };
  var stylize = colors.stylize = function stylize(str, style) {
    if (!colors.enabled) {
      return str + "";
    }
    var styleMap = ansiStyles[style];
    if (!styleMap && style in colors) {
      return colors[style](str);
    }
    return styleMap.open + str + styleMap.close;
  };
  var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  var escapeStringRegexp = function(str) {
    if (typeof str !== "string") {
      throw new TypeError("Expected a string");
    }
    return str.replace(matchOperatorsRe, "\\$&");
  };
  var styles = function() {
    var ret = {};
    ansiStyles.grey = ansiStyles.gray;
    Object.keys(ansiStyles).forEach(function(key) {
      ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), "g");
      ret[key] = {
        get: function() {
          return build(this._styles.concat(key));
        }
      };
    });
    return ret;
  }();
  var proto = defineProps(function colors() {
  }, styles);
  colors.setTheme = function(theme) {
    if (typeof theme === "string") {
      console.log("colors.setTheme now only accepts an object, not a string.  " + "If you are trying to set a theme from a file, it is now your (the " + "caller\'s) responsibility to require the file.  The old syntax " + "looked like colors.setTheme(__dirname + " + "\'/../themes/generic-logging.js\'); The new syntax looks like " + "colors.setTheme(require(__dirname + " + "\'/../themes/generic-logging.js\'));");
      return;
    }
    for (var style in theme) {
      (function(style2) {
        colors[style2] = function(str) {
          if (typeof theme[style2] === "object") {
            var out = str;
            for (var i in theme[style2]) {
              out = colors[theme[style2][i]](out);
            }
            return out;
          }
          return colors[theme[style2]](str);
        };
      })(style);
    }
  };
  var sequencer = function sequencer(map2, str) {
    var exploded = str.split("");
    exploded = exploded.map(map2);
    return exploded.join("");
  };
  colors.trap = require_trap();
  colors.zalgo = require_zalgo();
  colors.maps = {};
  colors.maps.america = require_america()(colors);
  colors.maps.zebra = require_zebra()(colors);
  colors.maps.rainbow = require_rainbow()(colors);
  colors.maps.random = require_random()(colors);
  for (map in colors.maps) {
    (function(map2) {
      colors[map2] = function(str) {
        return sequencer(colors.maps[map2], str);
      };
    })(map);
  }
  var map;
  defineProps(colors, init());
});

// node_modules/@colors/colors/safe.js
var require_safe = __commonJS((exports, module) => {
  var colors = require_colors();
  module["exports"] = colors;
});

// node_modules/triple-beam/config/cli.js
var require_cli = __commonJS((exports) => {
  exports.levels = {
    error: 0,
    warn: 1,
    help: 2,
    data: 3,
    info: 4,
    debug: 5,
    prompt: 6,
    verbose: 7,
    input: 8,
    silly: 9
  };
  exports.colors = {
    error: "red",
    warn: "yellow",
    help: "cyan",
    data: "grey",
    info: "green",
    debug: "blue",
    prompt: "grey",
    verbose: "cyan",
    input: "grey",
    silly: "magenta"
  };
});

// node_modules/triple-beam/config/npm.js
var require_npm = __commonJS((exports) => {
  exports.levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  };
  exports.colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "green",
    verbose: "cyan",
    debug: "blue",
    silly: "magenta"
  };
});

// node_modules/triple-beam/config/syslog.js
var require_syslog = __commonJS((exports) => {
  exports.levels = {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
  };
  exports.colors = {
    emerg: "red",
    alert: "yellow",
    crit: "red",
    error: "red",
    warning: "red",
    notice: "yellow",
    info: "green",
    debug: "blue"
  };
});

// node_modules/triple-beam/config/index.js
var require_config = __commonJS((exports) => {
  Object.defineProperty(exports, "cli", {
    value: require_cli()
  });
  Object.defineProperty(exports, "npm", {
    value: require_npm()
  });
  Object.defineProperty(exports, "syslog", {
    value: require_syslog()
  });
});

// node_modules/triple-beam/index.js
var require_triple_beam = __commonJS((exports) => {
  Object.defineProperty(exports, "LEVEL", {
    value: Symbol.for("level")
  });
  Object.defineProperty(exports, "MESSAGE", {
    value: Symbol.for("message")
  });
  Object.defineProperty(exports, "SPLAT", {
    value: Symbol.for("splat")
  });
  Object.defineProperty(exports, "configs", {
    value: require_config()
  });
});

// node_modules/logform/colorize.js
var require_colorize = __commonJS((exports, module) => {
  var colors = require_safe();
  var { LEVEL, MESSAGE } = require_triple_beam();
  colors.enabled = true;
  var hasSpace = /\s+/;

  class Colorizer {
    constructor(opts = {}) {
      if (opts.colors) {
        this.addColors(opts.colors);
      }
      this.options = opts;
    }
    static addColors(clrs) {
      const nextColors = Object.keys(clrs).reduce((acc, level) => {
        acc[level] = hasSpace.test(clrs[level]) ? clrs[level].split(hasSpace) : clrs[level];
        return acc;
      }, {});
      Colorizer.allColors = Object.assign({}, Colorizer.allColors || {}, nextColors);
      return Colorizer.allColors;
    }
    addColors(clrs) {
      return Colorizer.addColors(clrs);
    }
    colorize(lookup, level, message) {
      if (typeof message === "undefined") {
        message = level;
      }
      if (!Array.isArray(Colorizer.allColors[lookup])) {
        return colors[Colorizer.allColors[lookup]](message);
      }
      for (let i = 0, len = Colorizer.allColors[lookup].length;i < len; i++) {
        message = colors[Colorizer.allColors[lookup][i]](message);
      }
      return message;
    }
    transform(info, opts) {
      if (opts.all && typeof info[MESSAGE] === "string") {
        info[MESSAGE] = this.colorize(info[LEVEL], info.level, info[MESSAGE]);
      }
      if (opts.level || opts.all || !opts.message) {
        info.level = this.colorize(info[LEVEL], info.level);
      }
      if (opts.all || opts.message) {
        info.message = this.colorize(info[LEVEL], info.level, info.message);
      }
      return info;
    }
  }
  module.exports = (opts) => new Colorizer(opts);
  module.exports.Colorizer = module.exports.Format = Colorizer;
});

// node_modules/logform/levels.js
var require_levels = __commonJS((exports, module) => {
  var { Colorizer } = require_colorize();
  module.exports = (config) => {
    Colorizer.addColors(config.colors || config);
    return config;
  };
});

// node_modules/logform/align.js
var require_align = __commonJS((exports, module) => {
  var format = require_format();
  module.exports = format((info) => {
    info.message = `\t${info.message}`;
    return info;
  });
});

// node_modules/logform/errors.js
var require_errors = __commonJS((exports, module) => {
  var format = require_format();
  var { LEVEL, MESSAGE } = require_triple_beam();
  module.exports = format((einfo, { stack, cause }) => {
    if (einfo instanceof Error) {
      const info = Object.assign({}, einfo, {
        level: einfo.level,
        [LEVEL]: einfo[LEVEL] || einfo.level,
        message: einfo.message,
        [MESSAGE]: einfo[MESSAGE] || einfo.message
      });
      if (stack)
        info.stack = einfo.stack;
      if (cause)
        info.cause = einfo.cause;
      return info;
    }
    if (!(einfo.message instanceof Error))
      return einfo;
    const err = einfo.message;
    Object.assign(einfo, err);
    einfo.message = err.message;
    einfo[MESSAGE] = err.message;
    if (stack)
      einfo.stack = err.stack;
    if (cause)
      einfo.cause = err.cause;
    return einfo;
  });
});

// node_modules/logform/pad-levels.js
var require_pad_levels = __commonJS((exports, module) => {
  var { configs, LEVEL, MESSAGE } = require_triple_beam();

  class Padder {
    constructor(opts = { levels: configs.npm.levels }) {
      this.paddings = Padder.paddingForLevels(opts.levels, opts.filler);
      this.options = opts;
    }
    static getLongestLevel(levels) {
      const lvls = Object.keys(levels).map((level) => level.length);
      return Math.max(...lvls);
    }
    static paddingForLevel(level, filler, maxLength) {
      const targetLen = maxLength + 1 - level.length;
      const rep = Math.floor(targetLen / filler.length);
      const padding = `${filler}${filler.repeat(rep)}`;
      return padding.slice(0, targetLen);
    }
    static paddingForLevels(levels, filler = " ") {
      const maxLength = Padder.getLongestLevel(levels);
      return Object.keys(levels).reduce((acc, level) => {
        acc[level] = Padder.paddingForLevel(level, filler, maxLength);
        return acc;
      }, {});
    }
    transform(info, opts) {
      info.message = `${this.paddings[info[LEVEL]]}${info.message}`;
      if (info[MESSAGE]) {
        info[MESSAGE] = `${this.paddings[info[LEVEL]]}${info[MESSAGE]}`;
      }
      return info;
    }
  }
  module.exports = (opts) => new Padder(opts);
  module.exports.Padder = module.exports.Format = Padder;
});

// node_modules/logform/cli.js
var require_cli2 = __commonJS((exports, module) => {
  var { Colorizer } = require_colorize();
  var { Padder } = require_pad_levels();
  var { configs, MESSAGE } = require_triple_beam();

  class CliFormat {
    constructor(opts = {}) {
      if (!opts.levels) {
        opts.levels = configs.cli.levels;
      }
      this.colorizer = new Colorizer(opts);
      this.padder = new Padder(opts);
      this.options = opts;
    }
    transform(info, opts) {
      this.colorizer.transform(this.padder.transform(info, opts), opts);
      info[MESSAGE] = `${info.level}:${info.message}`;
      return info;
    }
  }
  module.exports = (opts) => new CliFormat(opts);
  module.exports.Format = CliFormat;
});

// node_modules/logform/combine.js
var require_combine = __commonJS((exports, module) => {
  function cascade(formats) {
    if (!formats.every(isValidFormat)) {
      return;
    }
    return (info) => {
      let obj = info;
      for (let i = 0;i < formats.length; i++) {
        obj = formats[i].transform(obj, formats[i].options);
        if (!obj) {
          return false;
        }
      }
      return obj;
    };
  }
  function isValidFormat(fmt) {
    if (typeof fmt.transform !== "function") {
      throw new Error([
        "No transform function found on format. Did you create a format instance?",
        "const myFormat = format(formatFn);",
        "const instance = myFormat();"
      ].join("\n"));
    }
    return true;
  }
  var format = require_format();
  module.exports = (...formats) => {
    const combinedFormat = format(cascade(formats));
    const instance = combinedFormat();
    instance.Format = combinedFormat.Format;
    return instance;
  };
  module.exports.cascade = cascade;
});

// node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = __commonJS((exports, module) => {
  function strEscape(str) {
    if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
      return `"${str}"`;
    }
    return JSON.stringify(str);
  }
  function sort(array, comparator) {
    if (array.length > 200 || comparator) {
      return array.sort(comparator);
    }
    for (let i = 1;i < array.length; i++) {
      const currentValue = array[i];
      let position = i;
      while (position !== 0 && array[position - 1] > currentValue) {
        array[position] = array[position - 1];
        position--;
      }
      array[position] = currentValue;
    }
    return array;
  }
  function isTypedArrayWithEntries(value) {
    return typedArrayPrototypeGetSymbolToStringTag.call(value) !== undefined && value.length !== 0;
  }
  function stringifyTypedArray(array, separator, maximumBreadth) {
    if (array.length < maximumBreadth) {
      maximumBreadth = array.length;
    }
    const whitespace = separator === "," ? "" : " ";
    let res = `"0":${whitespace}${array[0]}`;
    for (let i = 1;i < maximumBreadth; i++) {
      res += `${separator}"${i}":${whitespace}${array[i]}`;
    }
    return res;
  }
  function getCircularValueOption(options) {
    if (hasOwnProperty.call(options, "circularValue")) {
      const circularValue = options.circularValue;
      if (typeof circularValue === "string") {
        return `"${circularValue}"`;
      }
      if (circularValue == null) {
        return circularValue;
      }
      if (circularValue === Error || circularValue === TypeError) {
        return {
          toString() {
            throw new TypeError("Converting circular structure to JSON");
          }
        };
      }
      throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
    }
    return '"[Circular]"';
  }
  function getDeterministicOption(options) {
    let value;
    if (hasOwnProperty.call(options, "deterministic")) {
      value = options.deterministic;
      if (typeof value !== "boolean" && typeof value !== "function") {
        throw new TypeError('The "deterministic" argument must be of type boolean or comparator function');
      }
    }
    return value === undefined ? true : value;
  }
  function getBooleanOption(options, key) {
    let value;
    if (hasOwnProperty.call(options, key)) {
      value = options[key];
      if (typeof value !== "boolean") {
        throw new TypeError(`The "${key}" argument must be of type boolean`);
      }
    }
    return value === undefined ? true : value;
  }
  function getPositiveIntegerOption(options, key) {
    let value;
    if (hasOwnProperty.call(options, key)) {
      value = options[key];
      if (typeof value !== "number") {
        throw new TypeError(`The "${key}" argument must be of type number`);
      }
      if (!Number.isInteger(value)) {
        throw new TypeError(`The "${key}" argument must be an integer`);
      }
      if (value < 1) {
        throw new RangeError(`The "${key}" argument must be >= 1`);
      }
    }
    return value === undefined ? Infinity : value;
  }
  function getItemCount(number) {
    if (number === 1) {
      return "1 item";
    }
    return `${number} items`;
  }
  function getUniqueReplacerSet(replacerArray) {
    const replacerSet = new Set;
    for (const value of replacerArray) {
      if (typeof value === "string" || typeof value === "number") {
        replacerSet.add(String(value));
      }
    }
    return replacerSet;
  }
  function getStrictOption(options) {
    if (hasOwnProperty.call(options, "strict")) {
      const value = options.strict;
      if (typeof value !== "boolean") {
        throw new TypeError('The "strict" argument must be of type boolean');
      }
      if (value) {
        return (value2) => {
          let message = `Object can not safely be stringified. Received type ${typeof value2}`;
          if (typeof value2 !== "function")
            message += ` (${value2.toString()})`;
          throw new Error(message);
        };
      }
    }
  }
  function configure(options) {
    options = { ...options };
    const fail = getStrictOption(options);
    if (fail) {
      if (options.bigint === undefined) {
        options.bigint = false;
      }
      if (!("circularValue" in options)) {
        options.circularValue = Error;
      }
    }
    const circularValue = getCircularValueOption(options);
    const bigint = getBooleanOption(options, "bigint");
    const deterministic = getDeterministicOption(options);
    const comparator = typeof deterministic === "function" ? deterministic : undefined;
    const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
    const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
    function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
      let value = parent[key];
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      value = replacer.call(parent, key, value);
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          let join = ",";
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `\n${indentation}`;
              join = `,\n${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `\n${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let whitespace = "";
          let separator = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,\n${indentation}`;
            whitespace = " ";
          }
          const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (deterministic && !isTypedArrayWithEntries(value)) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (spacer !== "" && separator.length > 1) {
            res = `\n${indentation}${res}\n${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          let res = "";
          let join = ",";
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `\n${indentation}`;
              join = `,\n${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `\n${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          stack.push(value);
          let whitespace = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,\n${indentation}`;
            whitespace = " ";
          }
          let separator = "";
          for (const key2 of replacer) {
            const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (spacer !== "" && separator.length > 1) {
            res = `\n${indentation}${res}\n${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyIndent(key, value, stack, spacer, indentation) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifyIndent(key, value, stack, spacer, indentation);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            indentation += spacer;
            let res2 = `\n${indentation}`;
            const join2 = `,\n${indentation}`;
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              res2 += tmp2 !== undefined ? tmp2 : "null";
              res2 += join2;
            }
            const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
            res2 += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            res2 += `\n${originalIndentation}`;
            stack.pop();
            return `[${res2}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          indentation += spacer;
          const join = `,\n${indentation}`;
          let res = "";
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, join, maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = join;
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}: ${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (separator !== "") {
            res = `\n${indentation}${res}\n${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifySimple(key, value, stack) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifySimple(key, value, stack);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          const hasLength = value.length !== undefined;
          if (hasLength && Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifySimple(String(i), value[i], stack);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += ",";
            }
            const tmp = stringifySimple(String(i), value[i], stack);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `,"... ${getItemCount(removedKeys)} not stringified"`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (hasLength && isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, ",", maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = ",";
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifySimple(key2, value[key2], stack);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${tmp}`;
              separator = ",";
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringify2(value, replacer, space) {
      if (arguments.length > 1) {
        let spacer = "";
        if (typeof space === "number") {
          spacer = " ".repeat(Math.min(space, 10));
        } else if (typeof space === "string") {
          spacer = space.slice(0, 10);
        }
        if (replacer != null) {
          if (typeof replacer === "function") {
            return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
          }
          if (Array.isArray(replacer)) {
            return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
          }
        }
        if (spacer.length !== 0) {
          return stringifyIndent("", value, [], spacer, "");
        }
      }
      return stringifySimple("", value, []);
    }
    return stringify2;
  }
  var { hasOwnProperty } = Object.prototype;
  var stringify = configure();
  stringify.configure = configure;
  stringify.stringify = stringify;
  stringify.default = stringify;
  exports.stringify = stringify;
  exports.configure = configure;
  module.exports = stringify;
  var strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
  var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array)), Symbol.toStringTag).get;
});

// node_modules/logform/json.js
var require_json = __commonJS((exports, module) => {
  function replacer(key, value) {
    if (typeof value === "bigint")
      return value.toString();
    return value;
  }
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  var stringify = require_safe_stable_stringify();
  module.exports = format((info, opts) => {
    const jsonStringify = stringify.configure(opts);
    info[MESSAGE] = jsonStringify(info, opts.replacer || replacer, opts.space);
    return info;
  });
});

// node_modules/logform/label.js
var require_label = __commonJS((exports, module) => {
  var format = require_format();
  module.exports = format((info, opts) => {
    if (opts.message) {
      info.message = `[${opts.label}] ${info.message}`;
      return info;
    }
    info.label = opts.label;
    return info;
  });
});

// node_modules/logform/logstash.js
var require_logstash = __commonJS((exports, module) => {
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  var jsonStringify = require_safe_stable_stringify();
  module.exports = format((info) => {
    const logstash = {};
    if (info.message) {
      logstash["@message"] = info.message;
      delete info.message;
    }
    if (info.timestamp) {
      logstash["@timestamp"] = info.timestamp;
      delete info.timestamp;
    }
    logstash["@fields"] = info;
    info[MESSAGE] = jsonStringify(logstash);
    return info;
  });
});

// node_modules/logform/metadata.js
var require_metadata = __commonJS((exports, module) => {
  function fillExcept(info, fillExceptKeys, metadataKey) {
    const savedKeys = fillExceptKeys.reduce((acc, key) => {
      acc[key] = info[key];
      delete info[key];
      return acc;
    }, {});
    const metadata = Object.keys(info).reduce((acc, key) => {
      acc[key] = info[key];
      delete info[key];
      return acc;
    }, {});
    Object.assign(info, savedKeys, {
      [metadataKey]: metadata
    });
    return info;
  }
  function fillWith(info, fillWithKeys, metadataKey) {
    info[metadataKey] = fillWithKeys.reduce((acc, key) => {
      acc[key] = info[key];
      delete info[key];
      return acc;
    }, {});
    return info;
  }
  var format = require_format();
  module.exports = format((info, opts = {}) => {
    let metadataKey = "metadata";
    if (opts.key) {
      metadataKey = opts.key;
    }
    let fillExceptKeys = [];
    if (!opts.fillExcept && !opts.fillWith) {
      fillExceptKeys.push("level");
      fillExceptKeys.push("message");
    }
    if (opts.fillExcept) {
      fillExceptKeys = opts.fillExcept;
    }
    if (fillExceptKeys.length > 0) {
      return fillExcept(info, fillExceptKeys, metadataKey);
    }
    if (opts.fillWith) {
      return fillWith(info, opts.fillWith, metadataKey);
    }
    return info;
  });
});

// node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse2(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
});

// node_modules/logform/ms.js
var require_ms2 = __commonJS((exports, module) => {
  var format = require_format();
  var ms = require_ms();
  module.exports = format((info) => {
    const curr = +new Date;
    exports.diff = curr - (exports.prevTime || curr);
    exports.prevTime = curr;
    info.ms = `+${ms(exports.diff)}`;
    return info;
  });
});

// node_modules/logform/pretty-print.js
var require_pretty_print = __commonJS((exports, module) => {
  var inspect = import.meta.require("util").inspect;
  var format = require_format();
  var { LEVEL, MESSAGE, SPLAT } = require_triple_beam();
  module.exports = format((info, opts = {}) => {
    const stripped = Object.assign({}, info);
    delete stripped[LEVEL];
    delete stripped[MESSAGE];
    delete stripped[SPLAT];
    info[MESSAGE] = inspect(stripped, false, opts.depth || null, opts.colorize);
    return info;
  });
});

// node_modules/logform/printf.js
var require_printf = __commonJS((exports, module) => {
  var { MESSAGE } = require_triple_beam();

  class Printf {
    constructor(templateFn) {
      this.template = templateFn;
    }
    transform(info) {
      info[MESSAGE] = this.template(info);
      return info;
    }
  }
  module.exports = (opts) => new Printf(opts);
  module.exports.Printf = module.exports.Format = Printf;
});

// node_modules/logform/simple.js
var require_simple = __commonJS((exports, module) => {
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  var jsonStringify = require_safe_stable_stringify();
  module.exports = format((info) => {
    const stringifiedRest = jsonStringify(Object.assign({}, info, {
      level: undefined,
      message: undefined,
      splat: undefined
    }));
    const padding = info.padding && info.padding[info.level] || "";
    if (stringifiedRest !== "{}") {
      info[MESSAGE] = `${info.level}:${padding} ${info.message} ${stringifiedRest}`;
    } else {
      info[MESSAGE] = `${info.level}:${padding} ${info.message}`;
    }
    return info;
  });
});

// node_modules/logform/splat.js
var require_splat = __commonJS((exports, module) => {
  var util = import.meta.require("util");
  var { SPLAT } = require_triple_beam();
  var formatRegExp = /%[scdjifoO%]/g;
  var escapedPercent = /%%/g;

  class Splatter {
    constructor(opts) {
      this.options = opts;
    }
    _splat(info, tokens) {
      const msg = info.message;
      const splat = info[SPLAT] || info.splat || [];
      const percents = msg.match(escapedPercent);
      const escapes = percents && percents.length || 0;
      const expectedSplat = tokens.length - escapes;
      const extraSplat = expectedSplat - splat.length;
      const metas = extraSplat < 0 ? splat.splice(extraSplat, -1 * extraSplat) : [];
      const metalen = metas.length;
      if (metalen) {
        for (let i = 0;i < metalen; i++) {
          Object.assign(info, metas[i]);
        }
      }
      info.message = util.format(msg, ...splat);
      return info;
    }
    transform(info) {
      const msg = info.message;
      const splat = info[SPLAT] || info.splat;
      if (!splat || !splat.length) {
        return info;
      }
      const tokens = msg && msg.match && msg.match(formatRegExp);
      if (!tokens && (splat || splat.length)) {
        const metas = splat.length > 1 ? splat.splice(0) : splat;
        const metalen = metas.length;
        if (metalen) {
          for (let i = 0;i < metalen; i++) {
            Object.assign(info, metas[i]);
          }
        }
        return info;
      }
      if (tokens) {
        return this._splat(info, tokens);
      }
      return info;
    }
  }
  module.exports = (opts) => new Splatter(opts);
});

// node_modules/fecha/lib/fecha.umd.js
var require_fecha_umd = __commonJS((exports, module) => {
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global2.fecha = {});
  })(exports, function(exports2) {
    var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
    var twoDigitsOptional = "\\d\\d?";
    var twoDigits = "\\d\\d";
    var threeDigits = "\\d{3}";
    var fourDigits = "\\d{4}";
    var word = "[^\\s]+";
    var literal = /\[([^]*?)\]/gm;
    function shorten(arr, sLen) {
      var newArr = [];
      for (var i = 0, len = arr.length;i < len; i++) {
        newArr.push(arr[i].substr(0, sLen));
      }
      return newArr;
    }
    var monthUpdate = function(arrName) {
      return function(v, i18n) {
        var lowerCaseArr = i18n[arrName].map(function(v2) {
          return v2.toLowerCase();
        });
        var index = lowerCaseArr.indexOf(v.toLowerCase());
        if (index > -1) {
          return index;
        }
        return null;
      };
    };
    function assign(origObj) {
      var args = [];
      for (var _i = 1;_i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      for (var _a = 0, args_1 = args;_a < args_1.length; _a++) {
        var obj = args_1[_a];
        for (var key in obj) {
          origObj[key] = obj[key];
        }
      }
      return origObj;
    }
    var dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    var monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    var monthNamesShort = shorten(monthNames, 3);
    var dayNamesShort = shorten(dayNames, 3);
    var defaultI18n = {
      dayNamesShort,
      dayNames,
      monthNamesShort,
      monthNames,
      amPm: ["am", "pm"],
      DoFn: function(dayOfMonth) {
        return dayOfMonth + ["th", "st", "nd", "rd"][dayOfMonth % 10 > 3 ? 0 : (dayOfMonth - dayOfMonth % 10 !== 10 ? 1 : 0) * dayOfMonth % 10];
      }
    };
    var globalI18n = assign({}, defaultI18n);
    var setGlobalDateI18n = function(i18n) {
      return globalI18n = assign(globalI18n, i18n);
    };
    var regexEscape = function(str) {
      return str.replace(/[|\\{()[^$+*?.-]/g, "\\$&");
    };
    var pad = function(val, len) {
      if (len === undefined) {
        len = 2;
      }
      val = String(val);
      while (val.length < len) {
        val = "0" + val;
      }
      return val;
    };
    var formatFlags = {
      D: function(dateObj) {
        return String(dateObj.getDate());
      },
      DD: function(dateObj) {
        return pad(dateObj.getDate());
      },
      Do: function(dateObj, i18n) {
        return i18n.DoFn(dateObj.getDate());
      },
      d: function(dateObj) {
        return String(dateObj.getDay());
      },
      dd: function(dateObj) {
        return pad(dateObj.getDay());
      },
      ddd: function(dateObj, i18n) {
        return i18n.dayNamesShort[dateObj.getDay()];
      },
      dddd: function(dateObj, i18n) {
        return i18n.dayNames[dateObj.getDay()];
      },
      M: function(dateObj) {
        return String(dateObj.getMonth() + 1);
      },
      MM: function(dateObj) {
        return pad(dateObj.getMonth() + 1);
      },
      MMM: function(dateObj, i18n) {
        return i18n.monthNamesShort[dateObj.getMonth()];
      },
      MMMM: function(dateObj, i18n) {
        return i18n.monthNames[dateObj.getMonth()];
      },
      YY: function(dateObj) {
        return pad(String(dateObj.getFullYear()), 4).substr(2);
      },
      YYYY: function(dateObj) {
        return pad(dateObj.getFullYear(), 4);
      },
      h: function(dateObj) {
        return String(dateObj.getHours() % 12 || 12);
      },
      hh: function(dateObj) {
        return pad(dateObj.getHours() % 12 || 12);
      },
      H: function(dateObj) {
        return String(dateObj.getHours());
      },
      HH: function(dateObj) {
        return pad(dateObj.getHours());
      },
      m: function(dateObj) {
        return String(dateObj.getMinutes());
      },
      mm: function(dateObj) {
        return pad(dateObj.getMinutes());
      },
      s: function(dateObj) {
        return String(dateObj.getSeconds());
      },
      ss: function(dateObj) {
        return pad(dateObj.getSeconds());
      },
      S: function(dateObj) {
        return String(Math.round(dateObj.getMilliseconds() / 100));
      },
      SS: function(dateObj) {
        return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
      },
      SSS: function(dateObj) {
        return pad(dateObj.getMilliseconds(), 3);
      },
      a: function(dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
      },
      A: function(dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
      },
      ZZ: function(dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60) * 100 + Math.abs(offset) % 60, 4);
      },
      Z: function(dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60), 2) + ":" + pad(Math.abs(offset) % 60, 2);
      }
    };
    var monthParse = function(v) {
      return +v - 1;
    };
    var emptyDigits = [null, twoDigitsOptional];
    var emptyWord = [null, word];
    var amPm = [
      "isPm",
      word,
      function(v, i18n) {
        var val = v.toLowerCase();
        if (val === i18n.amPm[0]) {
          return 0;
        } else if (val === i18n.amPm[1]) {
          return 1;
        }
        return null;
      }
    ];
    var timezoneOffset = [
      "timezoneOffset",
      "[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",
      function(v) {
        var parts = (v + "").match(/([+-]|\d\d)/gi);
        if (parts) {
          var minutes = +parts[1] * 60 + parseInt(parts[2], 10);
          return parts[0] === "+" ? minutes : -minutes;
        }
        return 0;
      }
    ];
    var parseFlags = {
      D: ["day", twoDigitsOptional],
      DD: ["day", twoDigits],
      Do: ["day", twoDigitsOptional + word, function(v) {
        return parseInt(v, 10);
      }],
      M: ["month", twoDigitsOptional, monthParse],
      MM: ["month", twoDigits, monthParse],
      YY: [
        "year",
        twoDigits,
        function(v) {
          var now = new Date;
          var cent = +("" + now.getFullYear()).substr(0, 2);
          return +("" + (+v > 68 ? cent - 1 : cent) + v);
        }
      ],
      h: ["hour", twoDigitsOptional, undefined, "isPm"],
      hh: ["hour", twoDigits, undefined, "isPm"],
      H: ["hour", twoDigitsOptional],
      HH: ["hour", twoDigits],
      m: ["minute", twoDigitsOptional],
      mm: ["minute", twoDigits],
      s: ["second", twoDigitsOptional],
      ss: ["second", twoDigits],
      YYYY: ["year", fourDigits],
      S: ["millisecond", "\\d", function(v) {
        return +v * 100;
      }],
      SS: ["millisecond", twoDigits, function(v) {
        return +v * 10;
      }],
      SSS: ["millisecond", threeDigits],
      d: emptyDigits,
      dd: emptyDigits,
      ddd: emptyWord,
      dddd: emptyWord,
      MMM: ["month", word, monthUpdate("monthNamesShort")],
      MMMM: ["month", word, monthUpdate("monthNames")],
      a: amPm,
      A: amPm,
      ZZ: timezoneOffset,
      Z: timezoneOffset
    };
    var globalMasks = {
      default: "ddd MMM DD YYYY HH:mm:ss",
      shortDate: "M/D/YY",
      mediumDate: "MMM D, YYYY",
      longDate: "MMMM D, YYYY",
      fullDate: "dddd, MMMM D, YYYY",
      isoDate: "YYYY-MM-DD",
      isoDateTime: "YYYY-MM-DDTHH:mm:ssZ",
      shortTime: "HH:mm",
      mediumTime: "HH:mm:ss",
      longTime: "HH:mm:ss.SSS"
    };
    var setGlobalDateMasks = function(masks) {
      return assign(globalMasks, masks);
    };
    var format = function(dateObj, mask, i18n) {
      if (mask === undefined) {
        mask = globalMasks["default"];
      }
      if (i18n === undefined) {
        i18n = {};
      }
      if (typeof dateObj === "number") {
        dateObj = new Date(dateObj);
      }
      if (Object.prototype.toString.call(dateObj) !== "[object Date]" || isNaN(dateObj.getTime())) {
        throw new Error("Invalid Date pass to format");
      }
      mask = globalMasks[mask] || mask;
      var literals = [];
      mask = mask.replace(literal, function($0, $1) {
        literals.push($1);
        return "@@@";
      });
      var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
      mask = mask.replace(token, function($0) {
        return formatFlags[$0](dateObj, combinedI18nSettings);
      });
      return mask.replace(/@@@/g, function() {
        return literals.shift();
      });
    };
    function parse2(dateStr, format2, i18n) {
      if (i18n === undefined) {
        i18n = {};
      }
      if (typeof format2 !== "string") {
        throw new Error("Invalid format in fecha parse");
      }
      format2 = globalMasks[format2] || format2;
      if (dateStr.length > 1000) {
        return null;
      }
      var today = new Date;
      var dateInfo = {
        year: today.getFullYear(),
        month: 0,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        isPm: null,
        timezoneOffset: null
      };
      var parseInfo = [];
      var literals = [];
      var newFormat = format2.replace(literal, function($0, $1) {
        literals.push(regexEscape($1));
        return "@@@";
      });
      var specifiedFields = {};
      var requiredFields = {};
      newFormat = regexEscape(newFormat).replace(token, function($0) {
        var info = parseFlags[$0];
        var field2 = info[0], regex = info[1], requiredField = info[3];
        if (specifiedFields[field2]) {
          throw new Error("Invalid format. " + field2 + " specified twice in format");
        }
        specifiedFields[field2] = true;
        if (requiredField) {
          requiredFields[requiredField] = true;
        }
        parseInfo.push(info);
        return "(" + regex + ")";
      });
      Object.keys(requiredFields).forEach(function(field2) {
        if (!specifiedFields[field2]) {
          throw new Error("Invalid format. " + field2 + " is required in specified format");
        }
      });
      newFormat = newFormat.replace(/@@@/g, function() {
        return literals.shift();
      });
      var matches = dateStr.match(new RegExp(newFormat, "i"));
      if (!matches) {
        return null;
      }
      var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
      for (var i = 1;i < matches.length; i++) {
        var _a = parseInfo[i - 1], field = _a[0], parser = _a[2];
        var value = parser ? parser(matches[i], combinedI18nSettings) : +matches[i];
        if (value == null) {
          return null;
        }
        dateInfo[field] = value;
      }
      if (dateInfo.isPm === 1 && dateInfo.hour != null && +dateInfo.hour !== 12) {
        dateInfo.hour = +dateInfo.hour + 12;
      } else if (dateInfo.isPm === 0 && +dateInfo.hour === 12) {
        dateInfo.hour = 0;
      }
      var dateTZ;
      if (dateInfo.timezoneOffset == null) {
        dateTZ = new Date(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute, dateInfo.second, dateInfo.millisecond);
        var validateFields = [
          ["month", "getMonth"],
          ["day", "getDate"],
          ["hour", "getHours"],
          ["minute", "getMinutes"],
          ["second", "getSeconds"]
        ];
        for (var i = 0, len = validateFields.length;i < len; i++) {
          if (specifiedFields[validateFields[i][0]] && dateInfo[validateFields[i][0]] !== dateTZ[validateFields[i][1]]()) {
            return null;
          }
        }
      } else {
        dateTZ = new Date(Date.UTC(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute - dateInfo.timezoneOffset, dateInfo.second, dateInfo.millisecond));
        if (dateInfo.month > 11 || dateInfo.month < 0 || dateInfo.day > 31 || dateInfo.day < 1 || dateInfo.hour > 23 || dateInfo.hour < 0 || dateInfo.minute > 59 || dateInfo.minute < 0 || dateInfo.second > 59 || dateInfo.second < 0) {
          return null;
        }
      }
      return dateTZ;
    }
    var fecha = {
      format,
      parse: parse2,
      defaultI18n,
      setGlobalDateI18n,
      setGlobalDateMasks
    };
    exports2.assign = assign;
    exports2.default = fecha;
    exports2.format = format;
    exports2.parse = parse2;
    exports2.defaultI18n = defaultI18n;
    exports2.setGlobalDateI18n = setGlobalDateI18n;
    exports2.setGlobalDateMasks = setGlobalDateMasks;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
});

// node_modules/logform/timestamp.js
var require_timestamp = __commonJS((exports, module) => {
  var fecha = require_fecha_umd();
  var format = require_format();
  module.exports = format((info, opts = {}) => {
    if (opts.format) {
      info.timestamp = typeof opts.format === "function" ? opts.format() : fecha.format(new Date, opts.format);
    }
    if (!info.timestamp) {
      info.timestamp = new Date().toISOString();
    }
    if (opts.alias) {
      info[opts.alias] = info.timestamp;
    }
    return info;
  });
});

// node_modules/logform/uncolorize.js
var require_uncolorize = __commonJS((exports, module) => {
  var colors = require_safe();
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  module.exports = format((info, opts) => {
    if (opts.level !== false) {
      info.level = colors.strip(info.level);
    }
    if (opts.message !== false) {
      info.message = colors.strip(String(info.message));
    }
    if (opts.raw !== false && info[MESSAGE]) {
      info[MESSAGE] = colors.strip(String(info[MESSAGE]));
    }
    return info;
  });
});

// node_modules/logform/index.js
var require_logform = __commonJS((exports) => {
  function exposeFormat(name, requireFormat) {
    Object.defineProperty(format, name, {
      get() {
        return requireFormat();
      },
      configurable: true
    });
  }
  var format = exports.format = require_format();
  exports.levels = require_levels();
  exposeFormat("align", function() {
    return require_align();
  });
  exposeFormat("errors", function() {
    return require_errors();
  });
  exposeFormat("cli", function() {
    return require_cli2();
  });
  exposeFormat("combine", function() {
    return require_combine();
  });
  exposeFormat("colorize", function() {
    return require_colorize();
  });
  exposeFormat("json", function() {
    return require_json();
  });
  exposeFormat("label", function() {
    return require_label();
  });
  exposeFormat("logstash", function() {
    return require_logstash();
  });
  exposeFormat("metadata", function() {
    return require_metadata();
  });
  exposeFormat("ms", function() {
    return require_ms2();
  });
  exposeFormat("padLevels", function() {
    return require_pad_levels();
  });
  exposeFormat("prettyPrint", function() {
    return require_pretty_print();
  });
  exposeFormat("printf", function() {
    return require_printf();
  });
  exposeFormat("simple", function() {
    return require_simple();
  });
  exposeFormat("splat", function() {
    return require_splat();
  });
  exposeFormat("timestamp", function() {
    return require_timestamp();
  });
  exposeFormat("uncolorize", function() {
    return require_uncolorize();
  });
});

// node_modules/winston/lib/winston/common.js
var require_common = __commonJS((exports) => {
  var { format } = import.meta.require("util");
  exports.warn = {
    deprecated(prop) {
      return () => {
        throw new Error(format("{ %s } was removed in winston@3.0.0.", prop));
      };
    },
    useFormat(prop) {
      return () => {
        throw new Error([
          format("{ %s } was removed in winston@3.0.0.", prop),
          "Use a custom winston.format = winston.format(function) instead."
        ].join("\n"));
      };
    },
    forFunctions(obj, type, props) {
      props.forEach((prop) => {
        obj[prop] = exports.warn[type](prop);
      });
    },
    forProperties(obj, type, props) {
      props.forEach((prop) => {
        const notice = exports.warn[type](prop);
        Object.defineProperty(obj, prop, {
          get: notice,
          set: notice
        });
      });
    }
  };
});

// node_modules/winston/package.json
var require_package2 = __commonJS((exports, module) => {
  module.exports = {
    name: "winston",
    description: "A logger for just about everything.",
    version: "3.17.0",
    author: "Charlie Robbins <charlie.robbins@gmail.com>",
    maintainers: [
      "David Hyde <dabh@alumni.stanford.edu>"
    ],
    repository: {
      type: "git",
      url: "https://github.com/winstonjs/winston.git"
    },
    keywords: [
      "winston",
      "logger",
      "logging",
      "logs",
      "sysadmin",
      "bunyan",
      "pino",
      "loglevel",
      "tools",
      "json",
      "stream"
    ],
    dependencies: {
      "@dabh/diagnostics": "^2.0.2",
      "@colors/colors": "^1.6.0",
      async: "^3.2.3",
      "is-stream": "^2.0.0",
      logform: "^2.7.0",
      "one-time": "^1.0.0",
      "readable-stream": "^3.4.0",
      "safe-stable-stringify": "^2.3.1",
      "stack-trace": "0.0.x",
      "triple-beam": "^1.3.0",
      "winston-transport": "^4.9.0"
    },
    devDependencies: {
      "@babel/cli": "^7.23.9",
      "@babel/core": "^7.24.0",
      "@babel/preset-env": "^7.24.0",
      "@dabh/eslint-config-populist": "^4.4.0",
      "@types/node": "^20.11.24",
      "abstract-winston-transport": "^0.5.1",
      assume: "^2.2.0",
      "cross-spawn-async": "^2.2.5",
      eslint: "^8.57.0",
      hock: "^1.4.1",
      mocha: "^10.3.0",
      nyc: "^17.1.0",
      rimraf: "5.0.1",
      split2: "^4.1.0",
      "std-mocks": "^2.0.0",
      through2: "^4.0.2",
      "winston-compat": "^0.1.5"
    },
    main: "./lib/winston.js",
    browser: "./dist/winston",
    types: "./index.d.ts",
    scripts: {
      lint: "eslint lib/*.js lib/winston/*.js lib/winston/**/*.js --resolve-plugins-relative-to ./node_modules/@dabh/eslint-config-populist",
      test: "rimraf test/fixtures/logs/* && mocha",
      "test:coverage": "nyc npm run test:unit",
      "test:unit": "mocha test/unit",
      "test:integration": "mocha test/integration",
      build: "rimraf dist && babel lib -d dist",
      prepublishOnly: "npm run build"
    },
    engines: {
      node: ">= 12.0.0"
    },
    license: "MIT"
  };
});

// node_modules/string_decoder/node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS((exports, module) => {
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
  var buffer = import.meta.require("buffer");
  var Buffer2 = buffer.Buffer;
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  SafeBuffer.prototype = Object.create(Buffer2.prototype);
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== undefined) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS((exports) => {
  function _normalizeEncoding(enc) {
    if (!enc)
      return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried)
            return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
      throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer2.allocUnsafe(nb);
  }
  function utf8CheckByte(byte) {
    if (byte <= 127)
      return 0;
    else if (byte >> 5 === 6)
      return 2;
    else if (byte >> 4 === 14)
      return 3;
    else if (byte >> 3 === 30)
      return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i)
      return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2)
          nb = 0;
        else
          self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "\uFFFD";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "\uFFFD";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "\uFFFD";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf, p);
    if (r !== undefined)
      return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed)
      return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + "\uFFFD";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0)
      return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
  var Buffer2 = require_safe_buffer().Buffer;
  var isEncoding = Buffer2.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  exports.StringDecoder = StringDecoder;
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0)
      return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === undefined)
        return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length)
      return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
});

// node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS((exports, module) => {
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1;i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0;i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function copyBuffer(src, target, offset) {
    Buffer2.prototype.copy.call(src, target, offset);
  }
  var _require = import.meta.require("buffer");
  var Buffer2 = _require.Buffer;
  var _require2 = import.meta.require("util");
  var inspect = _require2.inspect;
  var custom = inspect && inspect.custom || "inspect";
  module.exports = /* @__PURE__ */ function() {
    function BufferList() {
      _classCallCheck(this, BufferList);
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    _createClass(BufferList, [{
      key: "push",
      value: function push(v) {
        var entry = {
          data: v,
          next: null
        };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry;
        ++this.length;
      }
    }, {
      key: "unshift",
      value: function unshift(v) {
        var entry = {
          data: v,
          next: this.head
        };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry;
        ++this.length;
      }
    }, {
      key: "shift",
      value: function shift() {
        if (this.length === 0)
          return;
        var ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        --this.length;
        return ret;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
    }, {
      key: "join",
      value: function join(s) {
        if (this.length === 0)
          return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next)
          ret += s + p.data;
        return ret;
      }
    }, {
      key: "concat",
      value: function concat(n) {
        if (this.length === 0)
          return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
    }, {
      key: "consume",
      value: function consume(n, hasStrings) {
        var ret;
        if (n < this.head.data.length) {
          ret = this.head.data.slice(0, n);
          this.head.data = this.head.data.slice(n);
        } else if (n === this.head.data.length) {
          ret = this.shift();
        } else {
          ret = hasStrings ? this._getString(n) : this._getBuffer(n);
        }
        return ret;
      }
    }, {
      key: "first",
      value: function first() {
        return this.head.data;
      }
    }, {
      key: "_getString",
      value: function _getString(n) {
        var p = this.head;
        var c = 1;
        var ret = p.data;
        n -= ret.length;
        while (p = p.next) {
          var str = p.data;
          var nb = n > str.length ? str.length : n;
          if (nb === str.length)
            ret += str;
          else
            ret += str.slice(0, n);
          n -= nb;
          if (n === 0) {
            if (nb === str.length) {
              ++c;
              if (p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = str.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
    }, {
      key: "_getBuffer",
      value: function _getBuffer(n) {
        var ret = Buffer2.allocUnsafe(n);
        var p = this.head;
        var c = 1;
        p.data.copy(ret);
        n -= p.data.length;
        while (p = p.next) {
          var buf = p.data;
          var nb = n > buf.length ? buf.length : n;
          buf.copy(ret, ret.length - n, 0, nb);
          n -= nb;
          if (n === 0) {
            if (nb === buf.length) {
              ++c;
              if (p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = buf.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
    }, {
      key: custom,
      value: function value(_, options) {
        return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
          depth: 0,
          customInspect: false
        }));
      }
    }]);
    return BufferList;
  }();
});

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS((exports, module) => {
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          process.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          process.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else {
          process.nextTick(emitCloseNT, _this);
        }
      } else if (cb) {
        process.nextTick(emitCloseNT, _this);
        cb(err2);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    });
    return this;
  }
  function emitErrorAndCloseNT(self2, err) {
    emitErrorNT(self2, err);
    emitCloseNT(self2);
  }
  function emitCloseNT(self2) {
    if (self2._writableState && !self2._writableState.emitClose)
      return;
    if (self2._readableState && !self2._readableState.emitClose)
      return;
    self2.emit("close");
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  function errorOrDestroy(stream, err) {
    var rState = stream._readableState;
    var wState = stream._writableState;
    if (rState && rState.autoDestroy || wState && wState.autoDestroy)
      stream.destroy(err);
    else
      stream.emit("error", err);
  }
  module.exports = {
    destroy,
    undestroy,
    errorOrDestroy
  };
});

// node_modules/readable-stream/errors.js
var require_errors2 = __commonJS((exports, module) => {
  function createErrorType(code, message, Base) {
    if (!Base) {
      Base = Error;
    }
    function getMessage(arg1, arg2, arg3) {
      if (typeof message === "string") {
        return message;
      } else {
        return message(arg1, arg2, arg3);
      }
    }

    class NodeError extends Base {
      constructor(arg1, arg2, arg3) {
        super(getMessage(arg1, arg2, arg3));
      }
    }
    NodeError.prototype.name = Base.name;
    NodeError.prototype.code = code;
    codes[code] = NodeError;
  }
  function oneOf(expected, thing) {
    if (Array.isArray(expected)) {
      const len = expected.length;
      expected = expected.map((i) => String(i));
      if (len > 2) {
        return `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1];
      } else if (len === 2) {
        return `one of ${thing} ${expected[0]} or ${expected[1]}`;
      } else {
        return `of ${thing} ${expected[0]}`;
      }
    } else {
      return `of ${thing} ${String(expected)}`;
    }
  }
  function startsWith(str, search, pos) {
    return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  }
  function endsWith(str, search, this_len) {
    if (this_len === undefined || this_len > str.length) {
      this_len = str.length;
    }
    return str.substring(this_len - search.length, this_len) === search;
  }
  function includes(str, search, start) {
    if (typeof start !== "number") {
      start = 0;
    }
    if (start + search.length > str.length) {
      return false;
    } else {
      return str.indexOf(search, start) !== -1;
    }
  }
  var codes = {};
  createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
    return 'The value "' + value + '" is invalid for option "' + name + '"';
  }, TypeError);
  createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
    let determiner;
    if (typeof expected === "string" && startsWith(expected, "not ")) {
      determiner = "must not be";
      expected = expected.replace(/^not /, "");
    } else {
      determiner = "must be";
    }
    let msg;
    if (endsWith(name, " argument")) {
      msg = `The ${name} ${determiner} ${oneOf(expected, "type")}`;
    } else {
      const type = includes(name, ".") ? "property" : "argument";
      msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, "type")}`;
    }
    msg += `. Received type ${typeof actual}`;
    return msg;
  }, TypeError);
  createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
  createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
    return "The " + name + " method is not implemented";
  });
  createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
  createErrorType("ERR_STREAM_DESTROYED", function(name) {
    return "Cannot call " + name + " after a stream was destroyed";
  });
  createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
  createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
  createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
  createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
    return "Unknown encoding: " + arg;
  }, TypeError);
  createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
  exports.codes = codes;
});

// node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS((exports, module) => {
  function highWaterMarkFrom(options, isDuplex, duplexKey) {
    return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
  }
  function getHighWaterMark(state, options, duplexKey, isDuplex) {
    var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
    if (hwm != null) {
      if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
        var name = isDuplex ? duplexKey : "highWaterMark";
        throw new ERR_INVALID_OPT_VALUE(name, hwm);
      }
      return Math.floor(hwm);
    }
    return state.objectMode ? 16 : 16 * 1024;
  }
  var ERR_INVALID_OPT_VALUE = require_errors2().codes.ERR_INVALID_OPT_VALUE;
  module.exports = {
    getHighWaterMark
  };
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS((exports, module) => {
  if (typeof Object.create === "function") {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor;
        ctor.prototype.constructor = ctor;
      }
    };
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS((exports, module) => {
  try {
    util = import.meta.require("util");
    if (typeof util.inherits !== "function")
      throw "";
    module.exports = util.inherits;
  } catch (e) {
    module.exports = require_inherits_browser();
  }
  var util;
});

// node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS((exports, module) => {
  function once(callback) {
    var called = false;
    return function() {
      if (called)
        return;
      called = true;
      for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      callback.apply(this, args);
    };
  }
  function noop() {
  }
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  }
  function eos(stream, opts, callback) {
    if (typeof opts === "function")
      return eos(stream, null, opts);
    if (!opts)
      opts = {};
    callback = once(callback || noop);
    var readable = opts.readable || opts.readable !== false && stream.readable;
    var writable = opts.writable || opts.writable !== false && stream.writable;
    var onlegacyfinish = function onlegacyfinish() {
      if (!stream.writable)
        onfinish();
    };
    var writableEnded = stream._writableState && stream._writableState.finished;
    var onfinish = function onfinish() {
      writable = false;
      writableEnded = true;
      if (!readable)
        callback.call(stream);
    };
    var readableEnded = stream._readableState && stream._readableState.endEmitted;
    var onend = function onend() {
      readable = false;
      readableEnded = true;
      if (!writable)
        callback.call(stream);
    };
    var onerror = function onerror(err) {
      callback.call(stream, err);
    };
    var onclose = function onclose() {
      var err;
      if (readable && !readableEnded) {
        if (!stream._readableState || !stream._readableState.ended)
          err = new ERR_STREAM_PREMATURE_CLOSE;
        return callback.call(stream, err);
      }
      if (writable && !writableEnded) {
        if (!stream._writableState || !stream._writableState.ended)
          err = new ERR_STREAM_PREMATURE_CLOSE;
        return callback.call(stream, err);
      }
    };
    var onrequest = function onrequest() {
      stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
      stream.on("complete", onfinish);
      stream.on("abort", onclose);
      if (stream.req)
        onrequest();
      else
        stream.on("request", onrequest);
    } else if (writable && !stream._writableState) {
      stream.on("end", onlegacyfinish);
      stream.on("close", onlegacyfinish);
    }
    stream.on("end", onend);
    stream.on("finish", onfinish);
    if (opts.error !== false)
      stream.on("error", onerror);
    stream.on("close", onclose);
    return function() {
      stream.removeListener("complete", onfinish);
      stream.removeListener("abort", onclose);
      stream.removeListener("request", onrequest);
      if (stream.req)
        stream.req.removeListener("finish", onfinish);
      stream.removeListener("end", onlegacyfinish);
      stream.removeListener("close", onlegacyfinish);
      stream.removeListener("finish", onfinish);
      stream.removeListener("end", onend);
      stream.removeListener("error", onerror);
      stream.removeListener("close", onclose);
    };
  }
  var ERR_STREAM_PREMATURE_CLOSE = require_errors2().codes.ERR_STREAM_PREMATURE_CLOSE;
  module.exports = eos;
});

// node_modules/readable-stream/lib/internal/streams/async_iterator.js
var require_async_iterator = __commonJS((exports, module) => {
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function createIterResult(value, done) {
    return {
      value,
      done
    };
  }
  function readAndResolve(iter) {
    var resolve = iter[kLastResolve];
    if (resolve !== null) {
      var data = iter[kStream].read();
      if (data !== null) {
        iter[kLastPromise] = null;
        iter[kLastResolve] = null;
        iter[kLastReject] = null;
        resolve(createIterResult(data, false));
      }
    }
  }
  function onReadable(iter) {
    process.nextTick(readAndResolve, iter);
  }
  function wrapForNext(lastPromise, iter) {
    return function(resolve, reject) {
      lastPromise.then(function() {
        if (iter[kEnded]) {
          resolve(createIterResult(undefined, true));
          return;
        }
        iter[kHandlePromise](resolve, reject);
      }, reject);
    };
  }
  var _Object$setPrototypeO;
  var finished = require_end_of_stream();
  var kLastResolve = Symbol("lastResolve");
  var kLastReject = Symbol("lastReject");
  var kError = Symbol("error");
  var kEnded = Symbol("ended");
  var kLastPromise = Symbol("lastPromise");
  var kHandlePromise = Symbol("handlePromise");
  var kStream = Symbol("stream");
  var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
  });
  var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
    get stream() {
      return this[kStream];
    },
    next: function next() {
      var _this = this;
      var error = this[kError];
      if (error !== null) {
        return Promise.reject(error);
      }
      if (this[kEnded]) {
        return Promise.resolve(createIterResult(undefined, true));
      }
      if (this[kStream].destroyed) {
        return new Promise(function(resolve, reject) {
          process.nextTick(function() {
            if (_this[kError]) {
              reject(_this[kError]);
            } else {
              resolve(createIterResult(undefined, true));
            }
          });
        });
      }
      var lastPromise = this[kLastPromise];
      var promise;
      if (lastPromise) {
        promise = new Promise(wrapForNext(lastPromise, this));
      } else {
        var data = this[kStream].read();
        if (data !== null) {
          return Promise.resolve(createIterResult(data, false));
        }
        promise = new Promise(this[kHandlePromise]);
      }
      this[kLastPromise] = promise;
      return promise;
    }
  }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
    return this;
  }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
    var _this2 = this;
    return new Promise(function(resolve, reject) {
      _this2[kStream].destroy(null, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(createIterResult(undefined, true));
      });
    });
  }), _Object$setPrototypeO), AsyncIteratorPrototype);
  var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
    var _Object$create;
    var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
      value: stream,
      writable: true
    }), _defineProperty(_Object$create, kLastResolve, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kLastReject, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kError, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kEnded, {
      value: stream._readableState.endEmitted,
      writable: true
    }), _defineProperty(_Object$create, kHandlePromise, {
      value: function value(resolve, reject) {
        var data = iterator[kStream].read();
        if (data) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          resolve(createIterResult(data, false));
        } else {
          iterator[kLastResolve] = resolve;
          iterator[kLastReject] = reject;
        }
      },
      writable: true
    }), _Object$create));
    iterator[kLastPromise] = null;
    finished(stream, function(err) {
      if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var reject = iterator[kLastReject];
        if (reject !== null) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          reject(err);
        }
        iterator[kError] = err;
        return;
      }
      var resolve = iterator[kLastResolve];
      if (resolve !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(undefined, true));
      }
      iterator[kEnded] = true;
    });
    stream.on("readable", onReadable.bind(null, iterator));
    return iterator;
  };
  module.exports = createReadableStreamAsyncIterator;
});

// node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS((exports, module) => {
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function() {
      var self2 = this, args = arguments;
      return new Promise(function(resolve, reject) {
        var gen = fn.apply(self2, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1;i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function from(Readable, iterable, opts) {
    var iterator;
    if (iterable && typeof iterable.next === "function") {
      iterator = iterable;
    } else if (iterable && iterable[Symbol.asyncIterator])
      iterator = iterable[Symbol.asyncIterator]();
    else if (iterable && iterable[Symbol.iterator])
      iterator = iterable[Symbol.iterator]();
    else
      throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
    var readable = new Readable(_objectSpread({
      objectMode: true
    }, opts));
    var reading = false;
    readable._read = function() {
      if (!reading) {
        reading = true;
        next();
      }
    };
    function next() {
      return _next2.apply(this, arguments);
    }
    function _next2() {
      _next2 = _asyncToGenerator(function* () {
        try {
          var _yield$iterator$next = yield iterator.next(), value = _yield$iterator$next.value, done = _yield$iterator$next.done;
          if (done) {
            readable.push(null);
          } else if (readable.push(yield value)) {
            next();
          } else {
            reading = false;
          }
        } catch (err) {
          readable.destroy(err);
        }
      });
      return _next2.apply(this, arguments);
    }
    return readable;
  }
  var ERR_INVALID_ARG_TYPE = require_errors2().codes.ERR_INVALID_ARG_TYPE;
  module.exports = from;
});

// node_modules/readable-stream/lib/_stream_readable.js
var require__stream_readable = __commonJS((exports, module) => {
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function")
      return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream, isDuplex) {
    Duplex = Duplex || require__stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.readableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
    this.buffer = new BufferList;
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.paused = true;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder)
        StringDecoder = require_string_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require__stream_duplex();
    if (!(this instanceof Readable))
      return new Readable(options);
    var isDuplex = this instanceof Duplex;
    this._readableState = new ReadableState(options, this, isDuplex);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function")
        this._read = options.read;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
    debug("readableAddChunk", chunk);
    var state = stream._readableState;
    if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else {
      var er;
      if (!skipChunkCheck)
        er = chunkInvalid(state, chunk);
      if (er) {
        errorOrDestroy(stream, er);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state.endEmitted)
            errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT);
          else
            addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF);
        } else if (state.destroyed) {
          return false;
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0)
              addChunk(stream, state, chunk, false);
            else
              maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
        maybeReadMore(stream, state);
      }
    }
    return !state.ended && (state.length < state.highWaterMark || state.length === 0);
  }
  function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
      state.awaitDrain = 0;
      stream.emit("data", chunk);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront)
        state.buffer.unshift(chunk);
      else
        state.buffer.push(chunk);
      if (state.needReadable)
        emitReadable(stream);
    }
    maybeReadMore(stream, state);
  }
  function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== undefined && !state.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
    }
    return er;
  }
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended)
      return 0;
    if (state.objectMode)
      return 1;
    if (n !== n) {
      if (state.flowing && state.length)
        return state.buffer.head.data.length;
      else
        return state.length;
    }
    if (n > state.highWaterMark)
      state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length)
      return n;
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }
  function onEofChunk(stream, state) {
    debug("onEofChunk");
    if (state.ended)
      return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    if (state.sync) {
      emitReadable(stream);
    } else {
      state.needReadable = false;
      if (!state.emittedReadable) {
        state.emittedReadable = true;
        emitReadable_(stream);
      }
    }
  }
  function emitReadable(stream) {
    var state = stream._readableState;
    debug("emitReadable", state.needReadable, state.emittedReadable);
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      process.nextTick(emitReadable_, stream);
    }
  }
  function emitReadable_(stream) {
    var state = stream._readableState;
    debug("emitReadable_", state.destroyed, state.length, state.ended);
    if (!state.destroyed && (state.length || state.ended)) {
      stream.emit("readable");
      state.emittedReadable = false;
    }
    state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
    flow(stream);
  }
  function maybeReadMore(stream, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      process.nextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
      var len = state.length;
      debug("maybeReadMore read 0");
      stream.read(0);
      if (len === state.length)
        break;
    }
    state.readingMore = false;
  }
  function pipeOnDrain(src) {
    return function pipeOnDrainFunctionResult() {
      var state = src._readableState;
      debug("pipeOnDrain", state.awaitDrain);
      if (state.awaitDrain)
        state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  function updateReadableListening(self2) {
    var state = self2._readableState;
    state.readableListening = self2.listenerCount("readable") > 0;
    if (state.resumeScheduled && !state.paused) {
      state.flowing = true;
    } else if (self2.listenerCount("data") > 0) {
      self2.resume();
    }
  }
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      process.nextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    debug("resume", state.reading);
    if (!state.reading) {
      stream.read(0);
    }
    state.resumeScheduled = false;
    stream.emit("resume");
    flow(stream);
    if (state.flowing && !state.reading)
      stream.read(0);
  }
  function flow(stream) {
    var state = stream._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream.read() !== null)
      ;
  }
  function fromList(n, state) {
    if (state.length === 0)
      return null;
    var ret;
    if (state.objectMode)
      ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder)
        ret = state.buffer.join("");
      else if (state.buffer.length === 1)
        ret = state.buffer.first();
      else
        ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = state.buffer.consume(n, state.decoder);
    }
    return ret;
  }
  function endReadable(stream) {
    var state = stream._readableState;
    debug("endReadable", state.endEmitted);
    if (!state.endEmitted) {
      state.ended = true;
      process.nextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    debug("endReadableNT", state.endEmitted, state.length);
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.readable = false;
      stream.emit("end");
      if (state.autoDestroy) {
        var wState = stream._writableState;
        if (!wState || wState.autoDestroy && wState.finished) {
          stream.destroy();
        }
      }
    }
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length;i < l; i++) {
      if (xs[i] === x)
        return i;
    }
    return -1;
  }
  module.exports = Readable;
  var Duplex;
  Readable.ReadableState = ReadableState;
  var EE = import.meta.require("events").EventEmitter;
  var EElistenerCount = function EElistenerCount(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = import.meta.require("stream");
  var Buffer2 = import.meta.require("buffer").Buffer;
  var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  var debugUtil = import.meta.require("util");
  var debug;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function debug() {
    };
  }
  var BufferList = require_buffer_list();
  var destroyImpl = require_destroy();
  var _require = require_state();
  var getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = require_errors2().codes;
  var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
  var ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
  var StringDecoder;
  var createReadableStreamAsyncIterator;
  var from;
  require_inherits()(Readable, Stream);
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  Object.defineProperty(Readable.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._readableState === undefined) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function set(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    var skipChunkCheck;
    if (!state.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder)
      StringDecoder = require_string_decoder().StringDecoder;
    var decoder = new StringDecoder(enc);
    this._readableState.decoder = decoder;
    this._readableState.encoding = this._readableState.decoder.encoding;
    var p = this._readableState.buffer.head;
    var content = "";
    while (p !== null) {
      content += decoder.write(p.data);
      p = p.next;
    }
    this._readableState.buffer.clear();
    if (content !== "")
      this._readableState.buffer.push(content);
    this._readableState.length = content.length;
    return this;
  };
  var MAX_HWM = 1073741824;
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0)
      state.emittedReadable = false;
    if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended)
        endReadable(this);
      else
        emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0)
        endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state.reading = true;
      state.sync = true;
      if (state.length === 0)
        state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
      if (!state.reading)
        n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0)
      ret = fromList(n, state);
    else
      ret = null;
    if (ret === null) {
      state.needReadable = state.length <= state.highWaterMark;
      n = 0;
    } else {
      state.length -= n;
      state.awaitDrain = 0;
    }
    if (state.length === 0) {
      if (!state.ended)
        state.needReadable = true;
      if (nOrig !== n && state.ended)
        endReadable(this);
    }
    if (ret !== null)
      this.emit("data", ret);
    return ret;
  };
  Readable.prototype._read = function(n) {
    errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state.endEmitted)
      process.nextTick(endFn);
    else
      src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable, unpipeInfo) {
      debug("onunpipe");
      if (readable === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
        ondrain();
    }
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      var ret = dest.write(chunk);
      debug("dest.write", ret);
      if (ret === false) {
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state.awaitDrain);
          state.awaitDrain++;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0)
        errorOrDestroy(dest, er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    var unpipeInfo = {
      hasUnpiped: false
    };
    if (state.pipesCount === 0)
      return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes)
        return this;
      if (!dest)
        dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest)
        dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0;i < len; i++)
        dests[i].emit("unpipe", this, {
          hasUnpiped: false
        });
      return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1)
      return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1)
      state.pipes = state.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    var state = this._readableState;
    if (ev === "data") {
      state.readableListening = this.listenerCount("readable") > 0;
      if (state.flowing !== false)
        this.resume();
    } else if (ev === "readable") {
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.flowing = false;
        state.emittedReadable = false;
        debug("on readable", state.length, state.reading);
        if (state.length) {
          emitReadable(this);
        } else if (!state.reading) {
          process.nextTick(nReadingNextTick, this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  Readable.prototype.removeListener = function(ev, fn) {
    var res = Stream.prototype.removeListener.call(this, ev, fn);
    if (ev === "readable") {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.removeAllListeners = function(ev) {
    var res = Stream.prototype.removeAllListeners.apply(this, arguments);
    if (ev === "readable" || ev === undefined) {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = !state.readableListening;
      resume(this, state);
    }
    state.paused = false;
    return this;
  };
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    this._readableState.paused = true;
    return this;
  };
  Readable.prototype.wrap = function(stream) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream.on("end", function() {
      debug("wrapped end");
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length)
          _this.push(chunk);
      }
      _this.push(null);
    });
    stream.on("data", function(chunk) {
      debug("wrapped data");
      if (state.decoder)
        chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === undefined))
        return;
      else if (!state.objectMode && (!chunk || !chunk.length))
        return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream.pause();
      }
    });
    for (var i in stream) {
      if (this[i] === undefined && typeof stream[i] === "function") {
        this[i] = function methodWrap(method) {
          return function methodWrapReturnFunction() {
            return stream[method].apply(stream, arguments);
          };
        }(i);
      }
    }
    for (var n = 0;n < kProxyEvents.length; n++) {
      stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream.resume();
      }
    };
    return this;
  };
  if (typeof Symbol === "function") {
    Readable.prototype[Symbol.asyncIterator] = function() {
      if (createReadableStreamAsyncIterator === undefined) {
        createReadableStreamAsyncIterator = require_async_iterator();
      }
      return createReadableStreamAsyncIterator(this);
    };
  }
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._readableState.highWaterMark;
    }
  });
  Object.defineProperty(Readable.prototype, "readableBuffer", {
    enumerable: false,
    get: function get() {
      return this._readableState && this._readableState.buffer;
    }
  });
  Object.defineProperty(Readable.prototype, "readableFlowing", {
    enumerable: false,
    get: function get() {
      return this._readableState.flowing;
    },
    set: function set(state) {
      if (this._readableState) {
        this._readableState.flowing = state;
      }
    }
  });
  Readable._fromList = fromList;
  Object.defineProperty(Readable.prototype, "readableLength", {
    enumerable: false,
    get: function get() {
      return this._readableState.length;
    }
  });
  if (typeof Symbol === "function") {
    Readable.from = function(iterable, opts) {
      if (from === undefined) {
        from = require_from();
      }
      return from(Readable, iterable, opts);
    };
  }
});

// node_modules/readable-stream/lib/_stream_duplex.js
var require__stream_duplex = __commonJS((exports, module) => {
  function Duplex(options) {
    if (!(this instanceof Duplex))
      return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    this.allowHalfOpen = true;
    if (options) {
      if (options.readable === false)
        this.readable = false;
      if (options.writable === false)
        this.writable = false;
      if (options.allowHalfOpen === false) {
        this.allowHalfOpen = false;
        this.once("end", onend);
      }
    }
  }
  function onend() {
    if (this._writableState.ended)
      return;
    process.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj)
      keys2.push(key);
    return keys2;
  };
  module.exports = Duplex;
  var Readable = require__stream_readable();
  var Writable = require__stream_writable();
  require_inherits()(Duplex, Readable);
  {
    keys = objectKeys(Writable.prototype);
    for (v = 0;v < keys.length; v++) {
      method = keys[v];
      if (!Duplex.prototype[method])
        Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  var keys;
  var method;
  var v;
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  Object.defineProperty(Duplex.prototype, "writableBuffer", {
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  Object.defineProperty(Duplex.prototype, "writableLength", {
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  Object.defineProperty(Duplex.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._readableState === undefined || this._writableState === undefined) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function set(value) {
      if (this._readableState === undefined || this._writableState === undefined) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
});

// node_modules/util-deprecate/node.js
var require_node = __commonJS((exports, module) => {
  module.exports = import.meta.require("util").deprecate;
});

// node_modules/readable-stream/lib/_stream_writable.js
var require__stream_writable = __commonJS((exports, module) => {
  function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state);
    };
  }
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  function nop() {
  }
  function WritableState(options, stream, isDuplex) {
    Duplex = Duplex || require__stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.writableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  function Writable(options) {
    Duplex = Duplex || require__stream_duplex();
    var isDuplex = this instanceof Duplex;
    if (!isDuplex && !realHasInstance.call(Writable, this))
      return new Writable(options);
    this._writableState = new WritableState(options, this, isDuplex);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function")
        this._write = options.write;
      if (typeof options.writev === "function")
        this._writev = options.writev;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
      if (typeof options.final === "function")
        this._final = options.final;
    }
    Stream.call(this);
  }
  function writeAfterEnd(stream, cb) {
    var er = new ERR_STREAM_WRITE_AFTER_END;
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
  }
  function validChunk(stream, state, chunk, cb) {
    var er;
    if (chunk === null) {
      er = new ERR_STREAM_NULL_VALUES;
    } else if (typeof chunk !== "string" && !state.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
    }
    if (er) {
      errorOrDestroy(stream, er);
      process.nextTick(cb, er);
      return false;
    }
    return true;
  }
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer2.from(chunk, encoding);
    }
    return chunk;
  }
  function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret)
      state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (state.destroyed)
      state.onwrite(new ERR_STREAM_DESTROYED("write"));
    else if (writev)
      stream._writev(chunk, state.onwrite);
    else
      stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
      process.nextTick(cb, er);
      process.nextTick(finishMaybe, stream, state);
      stream._writableState.errorEmitted = true;
      errorOrDestroy(stream, er);
    } else {
      cb(er);
      stream._writableState.errorEmitted = true;
      errorOrDestroy(stream, er);
      finishMaybe(stream, state);
    }
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream, er) {
    var state = stream._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    if (typeof cb !== "function")
      throw new ERR_MULTIPLE_CALLBACK;
    onwriteStateUpdate(state);
    if (er)
      onwriteError(stream, state, sync, er, cb);
    else {
      var finished = needFinish(state) || stream.destroyed;
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream, state);
      }
      if (sync) {
        process.nextTick(afterWrite, stream, state, finished, cb);
      } else {
        afterWrite(stream, state, finished, cb);
      }
    }
  }
  function afterWrite(stream, state, finished, cb) {
    if (!finished)
      onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
  }
  function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream.emit("drain");
    }
  }
  function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream._writev && entry && entry.next) {
      var l = state.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer[count] = entry;
        if (!entry.isBuf)
          allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer.allBuffers = allBuffers;
      doWrite(stream, state, true, state.length, buffer, "", holder.finish);
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
      state.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        state.bufferedRequestCount--;
        if (state.writing) {
          break;
        }
      }
      if (entry === null)
        state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }
  function callFinal(stream, state) {
    stream._final(function(err) {
      state.pendingcb--;
      if (err) {
        errorOrDestroy(stream, err);
      }
      state.prefinished = true;
      stream.emit("prefinish");
      finishMaybe(stream, state);
    });
  }
  function prefinish(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream._final === "function" && !state.destroyed) {
        state.pendingcb++;
        state.finalCalled = true;
        process.nextTick(callFinal, stream, state);
      } else {
        state.prefinished = true;
        stream.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream, state) {
    var need = needFinish(state);
    if (need) {
      prefinish(stream, state);
      if (state.pendingcb === 0) {
        state.finished = true;
        stream.emit("finish");
        if (state.autoDestroy) {
          var rState = stream._readableState;
          if (!rState || rState.autoDestroy && rState.endEmitted) {
            stream.destroy();
          }
        }
      }
    }
    return need;
  }
  function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
      if (state.finished)
        process.nextTick(cb);
      else
        stream.once("finish", cb);
    }
    state.ended = true;
    stream.writable = false;
  }
  function onCorkedFinish(corkReq, state, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state.corkedRequestsFree.next = corkReq;
  }
  module.exports = Writable;
  var Duplex;
  Writable.WritableState = WritableState;
  var internalUtil = {
    deprecate: require_node()
  };
  var Stream = import.meta.require("stream");
  var Buffer2 = import.meta.require("buffer").Buffer;
  var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  var destroyImpl = require_destroy();
  var _require = require_state();
  var getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = require_errors2().codes;
  var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
  var ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE;
  var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  var ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
  var ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END;
  var ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  require_inherits()(Writable, Stream);
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function writableStateBufferGetter() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer " + "instead.", "DEP0003")
      });
    } catch (_) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function value(object) {
        if (realHasInstance.call(this, object))
          return true;
        if (this !== Writable)
          return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function realHasInstance(object) {
      return object instanceof this;
    };
  }
  Writable.prototype.pipe = function() {
    errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE);
  };
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    var isBuf = !state.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer2.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf)
      encoding = "buffer";
    else if (!encoding)
      encoding = state.defaultEncoding;
    if (typeof cb !== "function")
      cb = nop;
    if (state.ending)
      writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    this._writableState.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest)
        clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string")
      encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
      throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableBuffer", {
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== undefined)
      this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending)
      endWritable(this, state, cb);
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableLength", {
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  Object.defineProperty(Writable.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._writableState === undefined) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function set(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    cb(err);
  };
});

// node_modules/winston-transport/modern.js
var require_modern = __commonJS((exports, module) => {
  var util = import.meta.require("util");
  var Writable = require__stream_writable();
  var { LEVEL } = require_triple_beam();
  var TransportStream = module.exports = function TransportStream(options = {}) {
    Writable.call(this, { objectMode: true, highWaterMark: options.highWaterMark });
    this.format = options.format;
    this.level = options.level;
    this.handleExceptions = options.handleExceptions;
    this.handleRejections = options.handleRejections;
    this.silent = options.silent;
    if (options.log)
      this.log = options.log;
    if (options.logv)
      this.logv = options.logv;
    if (options.close)
      this.close = options.close;
    this.once("pipe", (logger) => {
      this.levels = logger.levels;
      this.parent = logger;
    });
    this.once("unpipe", (src) => {
      if (src === this.parent) {
        this.parent = null;
        if (this.close) {
          this.close();
        }
      }
    });
  };
  util.inherits(TransportStream, Writable);
  TransportStream.prototype._write = function _write(info, enc, callback) {
    if (this.silent || info.exception === true && !this.handleExceptions) {
      return callback(null);
    }
    const level = this.level || this.parent && this.parent.level;
    if (!level || this.levels[level] >= this.levels[info[LEVEL]]) {
      if (info && !this.format) {
        return this.log(info, callback);
      }
      let errState;
      let transformed;
      try {
        transformed = this.format.transform(Object.assign({}, info), this.format.options);
      } catch (err) {
        errState = err;
      }
      if (errState || !transformed) {
        callback();
        if (errState)
          throw errState;
        return;
      }
      return this.log(transformed, callback);
    }
    this._writableState.sync = false;
    return callback(null);
  };
  TransportStream.prototype._writev = function _writev(chunks, callback) {
    if (this.logv) {
      const infos = chunks.filter(this._accept, this);
      if (!infos.length) {
        return callback(null);
      }
      return this.logv(infos, callback);
    }
    for (let i = 0;i < chunks.length; i++) {
      if (!this._accept(chunks[i]))
        continue;
      if (chunks[i].chunk && !this.format) {
        this.log(chunks[i].chunk, chunks[i].callback);
        continue;
      }
      let errState;
      let transformed;
      try {
        transformed = this.format.transform(Object.assign({}, chunks[i].chunk), this.format.options);
      } catch (err) {
        errState = err;
      }
      if (errState || !transformed) {
        chunks[i].callback();
        if (errState) {
          callback(null);
          throw errState;
        }
      } else {
        this.log(transformed, chunks[i].callback);
      }
    }
    return callback(null);
  };
  TransportStream.prototype._accept = function _accept(write) {
    const info = write.chunk;
    if (this.silent) {
      return false;
    }
    const level = this.level || this.parent && this.parent.level;
    if (info.exception === true || !level || this.levels[level] >= this.levels[info[LEVEL]]) {
      if (this.handleExceptions || info.exception !== true) {
        return true;
      }
    }
    return false;
  };
  TransportStream.prototype._nop = function _nop() {
    return;
  };
});

// node_modules/winston-transport/legacy.js
var require_legacy = __commonJS((exports, module) => {
  var util = import.meta.require("util");
  var { LEVEL } = require_triple_beam();
  var TransportStream = require_modern();
  var LegacyTransportStream = module.exports = function LegacyTransportStream(options = {}) {
    TransportStream.call(this, options);
    if (!options.transport || typeof options.transport.log !== "function") {
      throw new Error("Invalid transport, must be an object with a log method.");
    }
    this.transport = options.transport;
    this.level = this.level || options.transport.level;
    this.handleExceptions = this.handleExceptions || options.transport.handleExceptions;
    this._deprecated();
    function transportError(err) {
      this.emit("error", err, this.transport);
    }
    if (!this.transport.__winstonError) {
      this.transport.__winstonError = transportError.bind(this);
      this.transport.on("error", this.transport.__winstonError);
    }
  };
  util.inherits(LegacyTransportStream, TransportStream);
  LegacyTransportStream.prototype._write = function _write(info, enc, callback) {
    if (this.silent || info.exception === true && !this.handleExceptions) {
      return callback(null);
    }
    if (!this.level || this.levels[this.level] >= this.levels[info[LEVEL]]) {
      this.transport.log(info[LEVEL], info.message, info, this._nop);
    }
    callback(null);
  };
  LegacyTransportStream.prototype._writev = function _writev(chunks, callback) {
    for (let i = 0;i < chunks.length; i++) {
      if (this._accept(chunks[i])) {
        this.transport.log(chunks[i].chunk[LEVEL], chunks[i].chunk.message, chunks[i].chunk, this._nop);
        chunks[i].callback();
      }
    }
    return callback(null);
  };
  LegacyTransportStream.prototype._deprecated = function _deprecated() {
    console.error([
      `${this.transport.name} is a legacy winston transport. Consider upgrading: `,
      "- Upgrade docs: https://github.com/winstonjs/winston/blob/master/UPGRADE-3.0.md"
    ].join("\n"));
  };
  LegacyTransportStream.prototype.close = function close() {
    if (this.transport.close) {
      this.transport.close();
    }
    if (this.transport.__winstonError) {
      this.transport.removeListener("error", this.transport.__winstonError);
      this.transport.__winstonError = null;
    }
  };
});

// node_modules/winston-transport/index.js
var require_winston_transport = __commonJS((exports, module) => {
  module.exports = require_modern();
  module.exports.LegacyTransportStream = require_legacy();
});

// node_modules/winston/lib/winston/transports/console.js
var require_console = __commonJS((exports, module) => {
  var os = import.meta.require("os");
  var { LEVEL, MESSAGE } = require_triple_beam();
  var TransportStream = require_winston_transport();
  module.exports = class Console extends TransportStream {
    constructor(options = {}) {
      super(options);
      this.name = options.name || "console";
      this.stderrLevels = this._stringArrayToSet(options.stderrLevels);
      this.consoleWarnLevels = this._stringArrayToSet(options.consoleWarnLevels);
      this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
      this.forceConsole = options.forceConsole || false;
      this._consoleLog = console.log.bind(console);
      this._consoleWarn = console.warn.bind(console);
      this._consoleError = console.error.bind(console);
      this.setMaxListeners(30);
    }
    log(info, callback) {
      setImmediate(() => this.emit("logged", info));
      if (this.stderrLevels[info[LEVEL]]) {
        if (console._stderr && !this.forceConsole) {
          console._stderr.write(`${info[MESSAGE]}${this.eol}`);
        } else {
          this._consoleError(info[MESSAGE]);
        }
        if (callback) {
          callback();
        }
        return;
      } else if (this.consoleWarnLevels[info[LEVEL]]) {
        if (console._stderr && !this.forceConsole) {
          console._stderr.write(`${info[MESSAGE]}${this.eol}`);
        } else {
          this._consoleWarn(info[MESSAGE]);
        }
        if (callback) {
          callback();
        }
        return;
      }
      if (console._stdout && !this.forceConsole) {
        console._stdout.write(`${info[MESSAGE]}${this.eol}`);
      } else {
        this._consoleLog(info[MESSAGE]);
      }
      if (callback) {
        callback();
      }
    }
    _stringArrayToSet(strArray, errMsg) {
      if (!strArray)
        return {};
      errMsg = errMsg || "Cannot make set from type other than Array of string elements";
      if (!Array.isArray(strArray)) {
        throw new Error(errMsg);
      }
      return strArray.reduce((set, el) => {
        if (typeof el !== "string") {
          throw new Error(errMsg);
        }
        set[el] = true;
        return set;
      }, {});
    }
  };
});

// node_modules/async/internal/isArrayLike.js
var require_isArrayLike = __commonJS((exports, module) => {
  function isArrayLike(value) {
    return value && typeof value.length === "number" && value.length >= 0 && value.length % 1 === 0;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isArrayLike;
  module.exports = exports.default;
});

// node_modules/async/internal/initialParams.js
var require_initialParams = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = function(fn) {
    return function(...args) {
      var callback = args.pop();
      return fn.call(this, args, callback);
    };
  };
  module.exports = exports.default;
});

// node_modules/async/internal/setImmediate.js
var require_setImmediate = __commonJS((exports) => {
  function fallback(fn) {
    setTimeout(fn, 0);
  }
  function wrap(defer) {
    return (fn, ...args) => defer(() => fn(...args));
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.fallback = fallback;
  exports.wrap = wrap;
  var hasQueueMicrotask = exports.hasQueueMicrotask = typeof queueMicrotask === "function" && queueMicrotask;
  var hasSetImmediate = exports.hasSetImmediate = typeof setImmediate === "function" && setImmediate;
  var hasNextTick = exports.hasNextTick = typeof process === "object" && typeof process.nextTick === "function";
  var _defer;
  if (hasQueueMicrotask) {
    _defer = queueMicrotask;
  } else if (hasSetImmediate) {
    _defer = setImmediate;
  } else if (hasNextTick) {
    _defer = process.nextTick;
  } else {
    _defer = fallback;
  }
  exports.default = wrap(_defer);
});

// node_modules/async/asyncify.js
var require_asyncify = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function asyncify(func) {
    if ((0, _wrapAsync.isAsync)(func)) {
      return function(...args) {
        const callback = args.pop();
        const promise = func.apply(this, args);
        return handlePromise(promise, callback);
      };
    }
    return (0, _initialParams2.default)(function(args, callback) {
      var result;
      try {
        result = func.apply(this, args);
      } catch (e) {
        return callback(e);
      }
      if (result && typeof result.then === "function") {
        return handlePromise(result, callback);
      } else {
        callback(null, result);
      }
    });
  }
  function handlePromise(promise, callback) {
    return promise.then((value) => {
      invokeCallback(callback, null, value);
    }, (err) => {
      invokeCallback(callback, err && (err instanceof Error || err.message) ? err : new Error(err));
    });
  }
  function invokeCallback(callback, error, value) {
    try {
      callback(error, value);
    } catch (err) {
      (0, _setImmediate2.default)((e) => {
        throw e;
      }, err);
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = asyncify;
  var _initialParams = require_initialParams();
  var _initialParams2 = _interopRequireDefault(_initialParams);
  var _setImmediate = require_setImmediate();
  var _setImmediate2 = _interopRequireDefault(_setImmediate);
  var _wrapAsync = require_wrapAsync();
  module.exports = exports.default;
});

// node_modules/async/internal/wrapAsync.js
var require_wrapAsync = __commonJS((exports) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function isAsync(fn) {
    return fn[Symbol.toStringTag] === "AsyncFunction";
  }
  function isAsyncGenerator(fn) {
    return fn[Symbol.toStringTag] === "AsyncGenerator";
  }
  function isAsyncIterable(obj) {
    return typeof obj[Symbol.asyncIterator] === "function";
  }
  function wrapAsync(asyncFn) {
    if (typeof asyncFn !== "function")
      throw new Error("expected a function");
    return isAsync(asyncFn) ? (0, _asyncify2.default)(asyncFn) : asyncFn;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isAsyncIterable = exports.isAsyncGenerator = exports.isAsync = undefined;
  var _asyncify = require_asyncify();
  var _asyncify2 = _interopRequireDefault(_asyncify);
  exports.default = wrapAsync;
  exports.isAsync = isAsync;
  exports.isAsyncGenerator = isAsyncGenerator;
  exports.isAsyncIterable = isAsyncIterable;
});

// node_modules/async/internal/awaitify.js
var require_awaitify = __commonJS((exports, module) => {
  function awaitify(asyncFn, arity) {
    if (!arity)
      arity = asyncFn.length;
    if (!arity)
      throw new Error("arity is undefined");
    function awaitable(...args) {
      if (typeof args[arity - 1] === "function") {
        return asyncFn.apply(this, args);
      }
      return new Promise((resolve, reject) => {
        args[arity - 1] = (err, ...cbArgs) => {
          if (err)
            return reject(err);
          resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
        };
        asyncFn.apply(this, args);
      });
    }
    return awaitable;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = awaitify;
  module.exports = exports.default;
});

// node_modules/async/internal/parallel.js
var require_parallel = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _isArrayLike = require_isArrayLike();
  var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)((eachfn, tasks, callback) => {
    var results = (0, _isArrayLike2.default)(tasks) ? [] : {};
    eachfn(tasks, (task, key, taskCb) => {
      (0, _wrapAsync2.default)(task)((err, ...result) => {
        if (result.length < 2) {
          [result] = result;
        }
        results[key] = result;
        taskCb(err);
      });
    }, (err) => callback(err, results));
  }, 3);
  module.exports = exports.default;
});

// node_modules/async/internal/once.js
var require_once = __commonJS((exports, module) => {
  function once(fn) {
    function wrapper(...args) {
      if (fn === null)
        return;
      var callFn = fn;
      fn = null;
      callFn.apply(this, args);
    }
    Object.assign(wrapper, fn);
    return wrapper;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = once;
  module.exports = exports.default;
});

// node_modules/async/internal/getIterator.js
var require_getIterator = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = function(coll) {
    return coll[Symbol.iterator] && coll[Symbol.iterator]();
  };
  module.exports = exports.default;
});

// node_modules/async/internal/iterator.js
var require_iterator = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
      return ++i < len ? { value: coll[i], key: i } : null;
    };
  }
  function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
      var item = iterator.next();
      if (item.done)
        return null;
      i++;
      return { value: item.value, key: i };
    };
  }
  function createObjectIterator(obj) {
    var okeys = obj ? Object.keys(obj) : [];
    var i = -1;
    var len = okeys.length;
    return function next() {
      var key = okeys[++i];
      if (key === "__proto__") {
        return next();
      }
      return i < len ? { value: obj[key], key } : null;
    };
  }
  function createIterator(coll) {
    if ((0, _isArrayLike2.default)(coll)) {
      return createArrayIterator(coll);
    }
    var iterator = (0, _getIterator2.default)(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = createIterator;
  var _isArrayLike = require_isArrayLike();
  var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
  var _getIterator = require_getIterator();
  var _getIterator2 = _interopRequireDefault(_getIterator);
  module.exports = exports.default;
});

// node_modules/async/internal/onlyOnce.js
var require_onlyOnce = __commonJS((exports, module) => {
  function onlyOnce(fn) {
    return function(...args) {
      if (fn === null)
        throw new Error("Callback was already called.");
      var callFn = fn;
      fn = null;
      callFn.apply(this, args);
    };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = onlyOnce;
  module.exports = exports.default;
});

// node_modules/async/internal/breakLoop.js
var require_breakLoop = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var breakLoop = {};
  exports.default = breakLoop;
  module.exports = exports.default;
});

// node_modules/async/internal/asyncEachOfLimit.js
var require_asyncEachOfLimit = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function asyncEachOfLimit(generator, limit, iteratee, callback) {
    let done = false;
    let canceled = false;
    let awaiting = false;
    let running = 0;
    let idx = 0;
    function replenish() {
      if (running >= limit || awaiting || done)
        return;
      awaiting = true;
      generator.next().then(({ value, done: iterDone }) => {
        if (canceled || done)
          return;
        awaiting = false;
        if (iterDone) {
          done = true;
          if (running <= 0) {
            callback(null);
          }
          return;
        }
        running++;
        iteratee(value, idx, iterateeCallback);
        idx++;
        replenish();
      }).catch(handleError);
    }
    function iterateeCallback(err, result) {
      running -= 1;
      if (canceled)
        return;
      if (err)
        return handleError(err);
      if (err === false) {
        done = true;
        canceled = true;
        return;
      }
      if (result === _breakLoop2.default || done && running <= 0) {
        done = true;
        return callback(null);
      }
      replenish();
    }
    function handleError(err) {
      if (canceled)
        return;
      awaiting = false;
      done = true;
      callback(err);
    }
    replenish();
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = asyncEachOfLimit;
  var _breakLoop = require_breakLoop();
  var _breakLoop2 = _interopRequireDefault(_breakLoop);
  module.exports = exports.default;
});

// node_modules/async/internal/eachOfLimit.js
var require_eachOfLimit = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _once = require_once();
  var _once2 = _interopRequireDefault(_once);
  var _iterator = require_iterator();
  var _iterator2 = _interopRequireDefault(_iterator);
  var _onlyOnce = require_onlyOnce();
  var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
  var _wrapAsync = require_wrapAsync();
  var _asyncEachOfLimit = require_asyncEachOfLimit();
  var _asyncEachOfLimit2 = _interopRequireDefault(_asyncEachOfLimit);
  var _breakLoop = require_breakLoop();
  var _breakLoop2 = _interopRequireDefault(_breakLoop);
  exports.default = (limit) => {
    return (obj, iteratee, callback) => {
      callback = (0, _once2.default)(callback);
      if (limit <= 0) {
        throw new RangeError("concurrency limit cannot be less than 1");
      }
      if (!obj) {
        return callback(null);
      }
      if ((0, _wrapAsync.isAsyncGenerator)(obj)) {
        return (0, _asyncEachOfLimit2.default)(obj, limit, iteratee, callback);
      }
      if ((0, _wrapAsync.isAsyncIterable)(obj)) {
        return (0, _asyncEachOfLimit2.default)(obj[Symbol.asyncIterator](), limit, iteratee, callback);
      }
      var nextElem = (0, _iterator2.default)(obj);
      var done = false;
      var canceled = false;
      var running = 0;
      var looping = false;
      function iterateeCallback(err, value) {
        if (canceled)
          return;
        running -= 1;
        if (err) {
          done = true;
          callback(err);
        } else if (err === false) {
          done = true;
          canceled = true;
        } else if (value === _breakLoop2.default || done && running <= 0) {
          done = true;
          return callback(null);
        } else if (!looping) {
          replenish();
        }
      }
      function replenish() {
        looping = true;
        while (running < limit && !done) {
          var elem = nextElem();
          if (elem === null) {
            done = true;
            if (running <= 0) {
              callback(null);
            }
            return;
          }
          running += 1;
          iteratee(elem.value, elem.key, (0, _onlyOnce2.default)(iterateeCallback));
        }
        looping = false;
      }
      replenish();
    };
  };
  module.exports = exports.default;
});

// node_modules/async/eachOfLimit.js
var require_eachOfLimit2 = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachOfLimit(coll, limit, iteratee, callback) {
    return (0, _eachOfLimit3.default)(limit)(coll, (0, _wrapAsync2.default)(iteratee), callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _eachOfLimit2 = require_eachOfLimit();
  var _eachOfLimit3 = _interopRequireDefault(_eachOfLimit2);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachOfLimit, 4);
  module.exports = exports.default;
});

// node_modules/async/eachOfSeries.js
var require_eachOfSeries = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachOfSeries(coll, iteratee, callback) {
    return (0, _eachOfLimit2.default)(coll, 1, iteratee, callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _eachOfLimit = require_eachOfLimit2();
  var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachOfSeries, 3);
  module.exports = exports.default;
});

// node_modules/async/series.js
var require_series = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function series(tasks, callback) {
    return (0, _parallel3.default)(_eachOfSeries2.default, tasks, callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = series;
  var _parallel2 = require_parallel();
  var _parallel3 = _interopRequireDefault(_parallel2);
  var _eachOfSeries = require_eachOfSeries();
  var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);
  module.exports = exports.default;
});

// node_modules/readable-stream/lib/_stream_transform.js
var require__stream_transform = __commonJS((exports, module) => {
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (cb === null) {
      return this.emit("error", new ERR_MULTIPLE_CALLBACK);
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform))
      return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function")
        this._transform = options.transform;
      if (typeof options.flush === "function")
        this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function" && !this._readableState.destroyed) {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  function done(stream, er, data) {
    if (er)
      return stream.emit("error", er);
    if (data != null)
      stream.push(data);
    if (stream._writableState.length)
      throw new ERR_TRANSFORM_WITH_LENGTH_0;
    if (stream._transformState.transforming)
      throw new ERR_TRANSFORM_ALREADY_TRANSFORMING;
    return stream.push(null);
  }
  module.exports = Transform;
  var _require$codes = require_errors2().codes;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
  var ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING;
  var ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
  var Duplex = require__stream_duplex();
  require_inherits()(Transform, Duplex);
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
        this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
    });
  };
});

// node_modules/readable-stream/lib/_stream_passthrough.js
var require__stream_passthrough = __commonJS((exports, module) => {
  function PassThrough(options) {
    if (!(this instanceof PassThrough))
      return new PassThrough(options);
    Transform.call(this, options);
  }
  module.exports = PassThrough;
  var Transform = require__stream_transform();
  require_inherits()(PassThrough, Transform);
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
});

// node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS((exports, module) => {
  function once(callback) {
    var called = false;
    return function() {
      if (called)
        return;
      called = true;
      callback.apply(undefined, arguments);
    };
  }
  function noop(err) {
    if (err)
      throw err;
  }
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  }
  function destroyer(stream, reading, writing, callback) {
    callback = once(callback);
    var closed = false;
    stream.on("close", function() {
      closed = true;
    });
    if (eos === undefined)
      eos = require_end_of_stream();
    eos(stream, {
      readable: reading,
      writable: writing
    }, function(err) {
      if (err)
        return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed)
        return;
      if (destroyed)
        return;
      destroyed = true;
      if (isRequest(stream))
        return stream.abort();
      if (typeof stream.destroy === "function")
        return stream.destroy();
      callback(err || new ERR_STREAM_DESTROYED("pipe"));
    };
  }
  function call(fn) {
    fn();
  }
  function pipe(from, to) {
    return from.pipe(to);
  }
  function popCallback(streams) {
    if (!streams.length)
      return noop;
    if (typeof streams[streams.length - 1] !== "function")
      return noop;
    return streams.pop();
  }
  function pipeline() {
    for (var _len = arguments.length, streams = new Array(_len), _key = 0;_key < _len; _key++) {
      streams[_key] = arguments[_key];
    }
    var callback = popCallback(streams);
    if (Array.isArray(streams[0]))
      streams = streams[0];
    if (streams.length < 2) {
      throw new ERR_MISSING_ARGS("streams");
    }
    var error;
    var destroys = streams.map(function(stream, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream, reading, writing, function(err) {
        if (!error)
          error = err;
        if (err)
          destroys.forEach(call);
        if (reading)
          return;
        destroys.forEach(call);
        callback(error);
      });
    });
    return streams.reduce(pipe);
  }
  var eos;
  var _require$codes = require_errors2().codes;
  var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
  var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  module.exports = pipeline;
});

// node_modules/readable-stream/readable.js
var require_readable = __commonJS((exports, module) => {
  var Stream = import.meta.require("stream");
  if (process.env.READABLE_STREAM === "disable" && Stream) {
    module.exports = Stream.Readable;
    Object.assign(module.exports, Stream);
    module.exports.Stream = Stream;
  } else {
    exports = module.exports = require__stream_readable();
    exports.Stream = Stream || exports;
    exports.Readable = exports;
    exports.Writable = require__stream_writable();
    exports.Duplex = require__stream_duplex();
    exports.Transform = require__stream_transform();
    exports.PassThrough = require__stream_passthrough();
    exports.finished = require_end_of_stream();
    exports.pipeline = require_pipeline();
  }
});

// node_modules/@dabh/diagnostics/diagnostics.js
var require_diagnostics = __commonJS((exports, module) => {
  function use(adapter) {
    if (~adapters.indexOf(adapter))
      return false;
    adapters.push(adapter);
    return true;
  }
  function set(custom) {
    logger = custom;
  }
  function enabled(namespace) {
    var async = [];
    for (var i = 0;i < adapters.length; i++) {
      if (adapters[i].async) {
        async.push(adapters[i]);
        continue;
      }
      if (adapters[i](namespace))
        return true;
    }
    if (!async.length)
      return false;
    return new Promise(function pinky(resolve) {
      Promise.all(async.map(function prebind(fn) {
        return fn(namespace);
      })).then(function resolved(values) {
        resolve(values.some(Boolean));
      });
    });
  }
  function modify(fn) {
    if (~modifiers.indexOf(fn))
      return false;
    modifiers.push(fn);
    return true;
  }
  function write() {
    logger.apply(logger, arguments);
  }
  function process2(message) {
    for (var i = 0;i < modifiers.length; i++) {
      message = modifiers[i].apply(modifiers[i], arguments);
    }
    return message;
  }
  function introduce(fn, options) {
    var has = Object.prototype.hasOwnProperty;
    for (var key in options) {
      if (has.call(options, key)) {
        fn[key] = options[key];
      }
    }
    return fn;
  }
  function nope(options) {
    options.enabled = false;
    options.modify = modify;
    options.set = set;
    options.use = use;
    return introduce(function diagnopes() {
      return false;
    }, options);
  }
  function yep(options) {
    function diagnostics() {
      var args = Array.prototype.slice.call(arguments, 0);
      write.call(write, options, process2(args, options));
      return true;
    }
    options.enabled = true;
    options.modify = modify;
    options.set = set;
    options.use = use;
    return introduce(diagnostics, options);
  }
  var adapters = [];
  var modifiers = [];
  var logger = function devnull() {
  };
  module.exports = function create(diagnostics) {
    diagnostics.introduce = introduce;
    diagnostics.enabled = enabled;
    diagnostics.process = process2;
    diagnostics.modify = modify;
    diagnostics.write = write;
    diagnostics.nope = nope;
    diagnostics.yep = yep;
    diagnostics.set = set;
    diagnostics.use = use;
    return diagnostics;
  };
});

// node_modules/color-string/node_modules/color-name/index.js
var require_color_name = __commonJS((exports, module) => {
  module.exports = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
});

// node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS((exports, module) => {
  module.exports = function isArrayish(obj) {
    if (!obj || typeof obj === "string") {
      return false;
    }
    return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && (obj.splice instanceof Function || Object.getOwnPropertyDescriptor(obj, obj.length - 1) && obj.constructor.name !== "String");
  };
});

// node_modules/simple-swizzle/index.js
var require_simple_swizzle = __commonJS((exports, module) => {
  var isArrayish = require_is_arrayish();
  var concat = Array.prototype.concat;
  var slice = Array.prototype.slice;
  var swizzle = module.exports = function swizzle(args) {
    var results = [];
    for (var i = 0, len = args.length;i < len; i++) {
      var arg = args[i];
      if (isArrayish(arg)) {
        results = concat.call(results, slice.call(arg));
      } else {
        results.push(arg);
      }
    }
    return results;
  };
  swizzle.wrap = function(fn) {
    return function() {
      return fn(swizzle(arguments));
    };
  };
});

// node_modules/color-string/index.js
var require_color_string = __commonJS((exports, module) => {
  function clamp(num, min, max) {
    return Math.min(Math.max(min, num), max);
  }
  function hexDouble(num) {
    var str = Math.round(num).toString(16).toUpperCase();
    return str.length < 2 ? "0" + str : str;
  }
  var colorNames = require_color_name();
  var swizzle = require_simple_swizzle();
  var hasOwnProperty = Object.hasOwnProperty;
  var reverseNames = Object.create(null);
  for (name in colorNames) {
    if (hasOwnProperty.call(colorNames, name)) {
      reverseNames[colorNames[name]] = name;
    }
  }
  var name;
  var cs = module.exports = {
    to: {},
    get: {}
  };
  cs.get = function(string) {
    var prefix = string.substring(0, 3).toLowerCase();
    var val;
    var model;
    switch (prefix) {
      case "hsl":
        val = cs.get.hsl(string);
        model = "hsl";
        break;
      case "hwb":
        val = cs.get.hwb(string);
        model = "hwb";
        break;
      default:
        val = cs.get.rgb(string);
        model = "rgb";
        break;
    }
    if (!val) {
      return null;
    }
    return { model, value: val };
  };
  cs.get.rgb = function(string) {
    if (!string) {
      return null;
    }
    var abbr = /^#([a-f0-9]{3,4})$/i;
    var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
    var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
    var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
    var keyword = /^(\w+)$/;
    var rgb = [0, 0, 0, 1];
    var match;
    var i;
    var hexAlpha;
    if (match = string.match(hex)) {
      hexAlpha = match[2];
      match = match[1];
      for (i = 0;i < 3; i++) {
        var i2 = i * 2;
        rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
      }
      if (hexAlpha) {
        rgb[3] = parseInt(hexAlpha, 16) / 255;
      }
    } else if (match = string.match(abbr)) {
      match = match[1];
      hexAlpha = match[3];
      for (i = 0;i < 3; i++) {
        rgb[i] = parseInt(match[i] + match[i], 16);
      }
      if (hexAlpha) {
        rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
      }
    } else if (match = string.match(rgba)) {
      for (i = 0;i < 3; i++) {
        rgb[i] = parseInt(match[i + 1], 0);
      }
      if (match[4]) {
        if (match[5]) {
          rgb[3] = parseFloat(match[4]) * 0.01;
        } else {
          rgb[3] = parseFloat(match[4]);
        }
      }
    } else if (match = string.match(per)) {
      for (i = 0;i < 3; i++) {
        rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      if (match[4]) {
        if (match[5]) {
          rgb[3] = parseFloat(match[4]) * 0.01;
        } else {
          rgb[3] = parseFloat(match[4]);
        }
      }
    } else if (match = string.match(keyword)) {
      if (match[1] === "transparent") {
        return [0, 0, 0, 0];
      }
      if (!hasOwnProperty.call(colorNames, match[1])) {
        return null;
      }
      rgb = colorNames[match[1]];
      rgb[3] = 1;
      return rgb;
    } else {
      return null;
    }
    for (i = 0;i < 3; i++) {
      rgb[i] = clamp(rgb[i], 0, 255);
    }
    rgb[3] = clamp(rgb[3], 0, 1);
    return rgb;
  };
  cs.get.hsl = function(string) {
    if (!string) {
      return null;
    }
    var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
    var match = string.match(hsl);
    if (match) {
      var alpha = parseFloat(match[4]);
      var h = (parseFloat(match[1]) % 360 + 360) % 360;
      var s = clamp(parseFloat(match[2]), 0, 100);
      var l = clamp(parseFloat(match[3]), 0, 100);
      var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, s, l, a];
    }
    return null;
  };
  cs.get.hwb = function(string) {
    if (!string) {
      return null;
    }
    var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
    var match = string.match(hwb);
    if (match) {
      var alpha = parseFloat(match[4]);
      var h = (parseFloat(match[1]) % 360 + 360) % 360;
      var w = clamp(parseFloat(match[2]), 0, 100);
      var b = clamp(parseFloat(match[3]), 0, 100);
      var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, w, b, a];
    }
    return null;
  };
  cs.to.hex = function() {
    var rgba = swizzle(arguments);
    return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
  };
  cs.to.rgb = function() {
    var rgba = swizzle(arguments);
    return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
  };
  cs.to.rgb.percent = function() {
    var rgba = swizzle(arguments);
    var r = Math.round(rgba[0] / 255 * 100);
    var g = Math.round(rgba[1] / 255 * 100);
    var b = Math.round(rgba[2] / 255 * 100);
    return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
  };
  cs.to.hsl = function() {
    var hsla = swizzle(arguments);
    return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
  };
  cs.to.hwb = function() {
    var hwba = swizzle(arguments);
    var a = "";
    if (hwba.length >= 4 && hwba[3] !== 1) {
      a = ", " + hwba[3];
    }
    return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
  };
  cs.to.keyword = function(rgb) {
    return reverseNames[rgb.slice(0, 3)];
  };
});

// node_modules/color-name/index.js
var require_color_name2 = __commonJS((exports, module) => {
  module.exports = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS((exports, module) => {
  function comparativeDistance(x, y) {
    return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
  }
  var cssKeywords = require_color_name2();
  var reverseKeywords = {};
  for (key in cssKeywords) {
    if (cssKeywords.hasOwnProperty(key)) {
      reverseKeywords[cssKeywords[key]] = key;
    }
  }
  var key;
  var convert = module.exports = {
    rgb: { channels: 3, labels: "rgb" },
    hsl: { channels: 3, labels: "hsl" },
    hsv: { channels: 3, labels: "hsv" },
    hwb: { channels: 3, labels: "hwb" },
    cmyk: { channels: 4, labels: "cmyk" },
    xyz: { channels: 3, labels: "xyz" },
    lab: { channels: 3, labels: "lab" },
    lch: { channels: 3, labels: "lch" },
    hex: { channels: 1, labels: ["hex"] },
    keyword: { channels: 1, labels: ["keyword"] },
    ansi16: { channels: 1, labels: ["ansi16"] },
    ansi256: { channels: 1, labels: ["ansi256"] },
    hcg: { channels: 3, labels: ["h", "c", "g"] },
    apple: { channels: 3, labels: ["r16", "g16", "b16"] },
    gray: { channels: 1, labels: ["gray"] }
  };
  for (model in convert) {
    if (convert.hasOwnProperty(model)) {
      if (!("channels" in convert[model])) {
        throw new Error("missing channels property: " + model);
      }
      if (!("labels" in convert[model])) {
        throw new Error("missing channel labels property: " + model);
      }
      if (convert[model].labels.length !== convert[model].channels) {
        throw new Error("channel and label counts mismatch: " + model);
      }
      channels = convert[model].channels;
      labels = convert[model].labels;
      delete convert[model].channels;
      delete convert[model].labels;
      Object.defineProperty(convert[model], "channels", { value: channels });
      Object.defineProperty(convert[model], "labels", { value: labels });
    }
  }
  var channels;
  var labels;
  var model;
  convert.rgb.hsl = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h;
    var s;
    var l;
    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    l = (min + max) / 2;
    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }
    return [h, s * 100, l * 100];
  };
  convert.rgb.hsv = function(rgb) {
    var rdif;
    var gdif;
    var bdif;
    var h;
    var s;
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var v = Math.max(r, g, b);
    var diff = v - Math.min(r, g, b);
    var diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff === 0) {
      h = s = 0;
    } else {
      s = diff / v;
      rdif = diffc(r);
      gdif = diffc(g);
      bdif = diffc(b);
      if (r === v) {
        h = bdif - gdif;
      } else if (g === v) {
        h = 1 / 3 + rdif - bdif;
      } else if (b === v) {
        h = 2 / 3 + gdif - rdif;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return [
      h * 360,
      s * 100,
      v * 100
    ];
  };
  convert.rgb.hwb = function(rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    var h = convert.rgb.hsl(rgb)[0];
    var w = 1 / 255 * Math.min(r, Math.min(g, b));
    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  };
  convert.rgb.cmyk = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var c;
    var m;
    var y;
    var k;
    k = Math.min(1 - r, 1 - g, 1 - b);
    c = (1 - r - k) / (1 - k) || 0;
    m = (1 - g - k) / (1 - k) || 0;
    y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  };
  convert.rgb.keyword = function(rgb) {
    var reversed = reverseKeywords[rgb];
    if (reversed) {
      return reversed;
    }
    var currentClosestDistance = Infinity;
    var currentClosestKeyword;
    for (var keyword in cssKeywords) {
      if (cssKeywords.hasOwnProperty(keyword)) {
        var value = cssKeywords[keyword];
        var distance = comparativeDistance(rgb, value);
        if (distance < currentClosestDistance) {
          currentClosestDistance = distance;
          currentClosestKeyword = keyword;
        }
      }
    }
    return currentClosestKeyword;
  };
  convert.keyword.rgb = function(keyword) {
    return cssKeywords[keyword];
  };
  convert.rgb.xyz = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x * 100, y * 100, z * 100];
  };
  convert.rgb.lab = function(rgb) {
    var xyz = convert.rgb.xyz(rgb);
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  };
  convert.hsl.rgb = function(hsl) {
    var h = hsl[0] / 360;
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var t1;
    var t2;
    var t3;
    var rgb;
    var val;
    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    t1 = 2 * l - t2;
    rgb = [0, 0, 0];
    for (var i = 0;i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }
      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }
      rgb[i] = val * 255;
    }
    return rgb;
  };
  convert.hsl.hsv = function(hsl) {
    var h = hsl[0];
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var smin = s;
    var lmin = Math.max(l, 0.01);
    var sv;
    var v;
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    v = (l + s) / 2;
    sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  };
  convert.hsv.rgb = function(hsv) {
    var h = hsv[0] / 60;
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var hi = Math.floor(h) % 6;
    var f = h - Math.floor(h);
    var p = 255 * v * (1 - s);
    var q = 255 * v * (1 - s * f);
    var t = 255 * v * (1 - s * (1 - f));
    v *= 255;
    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };
  convert.hsv.hsl = function(hsv) {
    var h = hsv[0];
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var vmin = Math.max(v, 0.01);
    var lmin;
    var sl;
    var l;
    l = (2 - s) * v;
    lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  };
  convert.hwb.rgb = function(hwb) {
    var h = hwb[0] / 360;
    var wh = hwb[1] / 100;
    var bl = hwb[2] / 100;
    var ratio = wh + bl;
    var i;
    var v;
    var f;
    var n;
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }
    i = Math.floor(6 * h);
    v = 1 - bl;
    f = 6 * h - i;
    if ((i & 1) !== 0) {
      f = 1 - f;
    }
    n = wh + f * (v - wh);
    var r;
    var g;
    var b;
    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;
      case 1:
        r = n;
        g = v;
        b = wh;
        break;
      case 2:
        r = wh;
        g = v;
        b = n;
        break;
      case 3:
        r = wh;
        g = n;
        b = v;
        break;
      case 4:
        r = n;
        g = wh;
        b = v;
        break;
      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }
    return [r * 255, g * 255, b * 255];
  };
  convert.cmyk.rgb = function(cmyk) {
    var c = cmyk[0] / 100;
    var m = cmyk[1] / 100;
    var y = cmyk[2] / 100;
    var k = cmyk[3] / 100;
    var r;
    var g;
    var b;
    r = 1 - Math.min(1, c * (1 - k) + k);
    g = 1 - Math.min(1, m * (1 - k) + k);
    b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.rgb = function(xyz) {
    var x = xyz[0] / 100;
    var y = xyz[1] / 100;
    var z = xyz[2] / 100;
    var r;
    var g;
    var b;
    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.204 + z * 1.057;
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.lab = function(xyz) {
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  };
  convert.lab.xyz = function(lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var x;
    var y;
    var z;
    y = (l + 16) / 116;
    x = a / 500 + y;
    z = y - b / 200;
    var y2 = Math.pow(y, 3);
    var x2 = Math.pow(x, 3);
    var z2 = Math.pow(z, 3);
    y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
    z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;
    x *= 95.047;
    y *= 100;
    z *= 108.883;
    return [x, y, z];
  };
  convert.lab.lch = function(lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var hr;
    var h;
    var c;
    hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;
    if (h < 0) {
      h += 360;
    }
    c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  };
  convert.lch.lab = function(lch) {
    var l = lch[0];
    var c = lch[1];
    var h = lch[2];
    var a;
    var b;
    var hr;
    hr = h / 360 * 2 * Math.PI;
    a = c * Math.cos(hr);
    b = c * Math.sin(hr);
    return [l, a, b];
  };
  convert.rgb.ansi16 = function(args) {
    var r = args[0];
    var g = args[1];
    var b = args[2];
    var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2];
    value = Math.round(value / 50);
    if (value === 0) {
      return 30;
    }
    var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
    if (value === 2) {
      ansi += 60;
    }
    return ansi;
  };
  convert.hsv.ansi16 = function(args) {
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };
  convert.rgb.ansi256 = function(args) {
    var r = args[0];
    var g = args[1];
    var b = args[2];
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }
      if (r > 248) {
        return 231;
      }
      return Math.round((r - 8) / 247 * 24) + 232;
    }
    var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
    return ansi;
  };
  convert.ansi16.rgb = function(args) {
    var color = args % 10;
    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }
      color = color / 10.5 * 255;
      return [color, color, color];
    }
    var mult = (~~(args > 50) + 1) * 0.5;
    var r = (color & 1) * mult * 255;
    var g = (color >> 1 & 1) * mult * 255;
    var b = (color >> 2 & 1) * mult * 255;
    return [r, g, b];
  };
  convert.ansi256.rgb = function(args) {
    if (args >= 232) {
      var c = (args - 232) * 10 + 8;
      return [c, c, c];
    }
    args -= 16;
    var rem;
    var r = Math.floor(args / 36) / 5 * 255;
    var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    var b = rem % 6 / 5 * 255;
    return [r, g, b];
  };
  convert.rgb.hex = function(args) {
    var integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
    var string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.hex.rgb = function(args) {
    var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
      return [0, 0, 0];
    }
    var colorString = match[0];
    if (match[0].length === 3) {
      colorString = colorString.split("").map(function(char) {
        return char + char;
      }).join("");
    }
    var integer = parseInt(colorString, 16);
    var r = integer >> 16 & 255;
    var g = integer >> 8 & 255;
    var b = integer & 255;
    return [r, g, b];
  };
  convert.rgb.hcg = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var max = Math.max(Math.max(r, g), b);
    var min = Math.min(Math.min(r, g), b);
    var chroma = max - min;
    var grayscale;
    var hue;
    if (chroma < 1) {
      grayscale = min / (1 - chroma);
    } else {
      grayscale = 0;
    }
    if (chroma <= 0) {
      hue = 0;
    } else if (max === r) {
      hue = (g - b) / chroma % 6;
    } else if (max === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma + 4;
    }
    hue /= 6;
    hue %= 1;
    return [hue * 360, chroma * 100, grayscale * 100];
  };
  convert.hsl.hcg = function(hsl) {
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var c = 1;
    var f = 0;
    if (l < 0.5) {
      c = 2 * s * l;
    } else {
      c = 2 * s * (1 - l);
    }
    if (c < 1) {
      f = (l - 0.5 * c) / (1 - c);
    }
    return [hsl[0], c * 100, f * 100];
  };
  convert.hsv.hcg = function(hsv) {
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var c = s * v;
    var f = 0;
    if (c < 1) {
      f = (v - c) / (1 - c);
    }
    return [hsv[0], c * 100, f * 100];
  };
  convert.hcg.rgb = function(hcg) {
    var h = hcg[0] / 360;
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    if (c === 0) {
      return [g * 255, g * 255, g * 255];
    }
    var pure = [0, 0, 0];
    var hi = h % 1 * 6;
    var v = hi % 1;
    var w = 1 - v;
    var mg = 0;
    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;
        pure[1] = v;
        pure[2] = 0;
        break;
      case 1:
        pure[0] = w;
        pure[1] = 1;
        pure[2] = 0;
        break;
      case 2:
        pure[0] = 0;
        pure[1] = 1;
        pure[2] = v;
        break;
      case 3:
        pure[0] = 0;
        pure[1] = w;
        pure[2] = 1;
        break;
      case 4:
        pure[0] = v;
        pure[1] = 0;
        pure[2] = 1;
        break;
      default:
        pure[0] = 1;
        pure[1] = 0;
        pure[2] = w;
    }
    mg = (1 - c) * g;
    return [
      (c * pure[0] + mg) * 255,
      (c * pure[1] + mg) * 255,
      (c * pure[2] + mg) * 255
    ];
  };
  convert.hcg.hsv = function(hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var v = c + g * (1 - c);
    var f = 0;
    if (v > 0) {
      f = c / v;
    }
    return [hcg[0], f * 100, v * 100];
  };
  convert.hcg.hsl = function(hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var l = g * (1 - c) + 0.5 * c;
    var s = 0;
    if (l > 0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1) {
      s = c / (2 * (1 - l));
    }
    return [hcg[0], s * 100, l * 100];
  };
  convert.hcg.hwb = function(hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var v = c + g * (1 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };
  convert.hwb.hcg = function(hwb) {
    var w = hwb[1] / 100;
    var b = hwb[2] / 100;
    var v = 1 - b;
    var c = v - w;
    var g = 0;
    if (c < 1) {
      g = (v - c) / (1 - c);
    }
    return [hwb[0], c * 100, g * 100];
  };
  convert.apple.rgb = function(apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };
  convert.rgb.apple = function(rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };
  convert.gray.rgb = function(args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };
  convert.gray.hsl = convert.gray.hsv = function(args) {
    return [0, 0, args[0]];
  };
  convert.gray.hwb = function(gray) {
    return [0, 100, gray[0]];
  };
  convert.gray.cmyk = function(gray) {
    return [0, 0, 0, gray[0]];
  };
  convert.gray.lab = function(gray) {
    return [gray[0], 0, 0];
  };
  convert.gray.hex = function(gray) {
    var val = Math.round(gray[0] / 100 * 255) & 255;
    var integer = (val << 16) + (val << 8) + val;
    var string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.rgb.gray = function(rgb) {
    var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

// node_modules/color-convert/route.js
var require_route = __commonJS((exports, module) => {
  function buildGraph() {
    var graph = {};
    var models = Object.keys(conversions);
    for (var len = models.length, i = 0;i < len; i++) {
      graph[models[i]] = {
        distance: -1,
        parent: null
      };
    }
    return graph;
  }
  function deriveBFS(fromModel) {
    var graph = buildGraph();
    var queue = [fromModel];
    graph[fromModel].distance = 0;
    while (queue.length) {
      var current = queue.pop();
      var adjacents = Object.keys(conversions[current]);
      for (var len = adjacents.length, i = 0;i < len; i++) {
        var adjacent = adjacents[i];
        var node = graph[adjacent];
        if (node.distance === -1) {
          node.distance = graph[current].distance + 1;
          node.parent = current;
          queue.unshift(adjacent);
        }
      }
    }
    return graph;
  }
  function link(from, to) {
    return function(args) {
      return to(from(args));
    };
  }
  function wrapConversion(toModel, graph) {
    var path = [graph[toModel].parent, toModel];
    var fn = conversions[graph[toModel].parent][toModel];
    var cur = graph[toModel].parent;
    while (graph[cur].parent) {
      path.unshift(graph[cur].parent);
      fn = link(conversions[graph[cur].parent][cur], fn);
      cur = graph[cur].parent;
    }
    fn.conversion = path;
    return fn;
  }
  var conversions = require_conversions();
  module.exports = function(fromModel) {
    var graph = deriveBFS(fromModel);
    var conversion = {};
    var models = Object.keys(graph);
    for (var len = models.length, i = 0;i < len; i++) {
      var toModel = models[i];
      var node = graph[toModel];
      if (node.parent === null) {
        continue;
      }
      conversion[toModel] = wrapConversion(toModel, graph);
    }
    return conversion;
  };
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS((exports, module) => {
  function wrapRaw(fn) {
    var wrappedFn = function(args) {
      if (args === undefined || args === null) {
        return args;
      }
      if (arguments.length > 1) {
        args = Array.prototype.slice.call(arguments);
      }
      return fn(args);
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  function wrapRounded(fn) {
    var wrappedFn = function(args) {
      if (args === undefined || args === null) {
        return args;
      }
      if (arguments.length > 1) {
        args = Array.prototype.slice.call(arguments);
      }
      var result = fn(args);
      if (typeof result === "object") {
        for (var len = result.length, i = 0;i < len; i++) {
          result[i] = Math.round(result[i]);
        }
      }
      return result;
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  var conversions = require_conversions();
  var route = require_route();
  var convert = {};
  var models = Object.keys(conversions);
  models.forEach(function(fromModel) {
    convert[fromModel] = {};
    Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
    Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
    var routes = route(fromModel);
    var routeModels = Object.keys(routes);
    routeModels.forEach(function(toModel) {
      var fn = routes[toModel];
      convert[fromModel][toModel] = wrapRounded(fn);
      convert[fromModel][toModel].raw = wrapRaw(fn);
    });
  });
  module.exports = convert;
});

// node_modules/color/index.js
var require_color = __commonJS((exports, module) => {
  function Color(obj, model) {
    if (!(this instanceof Color)) {
      return new Color(obj, model);
    }
    if (model && model in skippedModels) {
      model = null;
    }
    if (model && !(model in convert)) {
      throw new Error("Unknown model: " + model);
    }
    var i;
    var channels;
    if (obj == null) {
      this.model = "rgb";
      this.color = [0, 0, 0];
      this.valpha = 1;
    } else if (obj instanceof Color) {
      this.model = obj.model;
      this.color = obj.color.slice();
      this.valpha = obj.valpha;
    } else if (typeof obj === "string") {
      var result = colorString.get(obj);
      if (result === null) {
        throw new Error("Unable to parse color from string: " + obj);
      }
      this.model = result.model;
      channels = convert[this.model].channels;
      this.color = result.value.slice(0, channels);
      this.valpha = typeof result.value[channels] === "number" ? result.value[channels] : 1;
    } else if (obj.length) {
      this.model = model || "rgb";
      channels = convert[this.model].channels;
      var newArr = _slice.call(obj, 0, channels);
      this.color = zeroArray(newArr, channels);
      this.valpha = typeof obj[channels] === "number" ? obj[channels] : 1;
    } else if (typeof obj === "number") {
      obj &= 16777215;
      this.model = "rgb";
      this.color = [
        obj >> 16 & 255,
        obj >> 8 & 255,
        obj & 255
      ];
      this.valpha = 1;
    } else {
      this.valpha = 1;
      var keys = Object.keys(obj);
      if ("alpha" in obj) {
        keys.splice(keys.indexOf("alpha"), 1);
        this.valpha = typeof obj.alpha === "number" ? obj.alpha : 0;
      }
      var hashedKeys = keys.sort().join("");
      if (!(hashedKeys in hashedModelKeys)) {
        throw new Error("Unable to parse color from object: " + JSON.stringify(obj));
      }
      this.model = hashedModelKeys[hashedKeys];
      var labels = convert[this.model].labels;
      var color = [];
      for (i = 0;i < labels.length; i++) {
        color.push(obj[labels[i]]);
      }
      this.color = zeroArray(color);
    }
    if (limiters[this.model]) {
      channels = convert[this.model].channels;
      for (i = 0;i < channels; i++) {
        var limit = limiters[this.model][i];
        if (limit) {
          this.color[i] = limit(this.color[i]);
        }
      }
    }
    this.valpha = Math.max(0, Math.min(1, this.valpha));
    if (Object.freeze) {
      Object.freeze(this);
    }
  }
  function roundTo(num, places) {
    return Number(num.toFixed(places));
  }
  function roundToPlace(places) {
    return function(num) {
      return roundTo(num, places);
    };
  }
  function getset(model, channel, modifier) {
    model = Array.isArray(model) ? model : [model];
    model.forEach(function(m) {
      (limiters[m] || (limiters[m] = []))[channel] = modifier;
    });
    model = model[0];
    return function(val) {
      var result;
      if (arguments.length) {
        if (modifier) {
          val = modifier(val);
        }
        result = this[model]();
        result.color[channel] = val;
        return result;
      }
      result = this[model]().color[channel];
      if (modifier) {
        result = modifier(result);
      }
      return result;
    };
  }
  function maxfn(max) {
    return function(v) {
      return Math.max(0, Math.min(max, v));
    };
  }
  function assertArray(val) {
    return Array.isArray(val) ? val : [val];
  }
  function zeroArray(arr, length) {
    for (var i = 0;i < length; i++) {
      if (typeof arr[i] !== "number") {
        arr[i] = 0;
      }
    }
    return arr;
  }
  var colorString = require_color_string();
  var convert = require_color_convert();
  var _slice = [].slice;
  var skippedModels = [
    "keyword",
    "gray",
    "hex"
  ];
  var hashedModelKeys = {};
  Object.keys(convert).forEach(function(model) {
    hashedModelKeys[_slice.call(convert[model].labels).sort().join("")] = model;
  });
  var limiters = {};
  Color.prototype = {
    toString: function() {
      return this.string();
    },
    toJSON: function() {
      return this[this.model]();
    },
    string: function(places) {
      var self2 = this.model in colorString.to ? this : this.rgb();
      self2 = self2.round(typeof places === "number" ? places : 1);
      var args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
      return colorString.to[self2.model](args);
    },
    percentString: function(places) {
      var self2 = this.rgb().round(typeof places === "number" ? places : 1);
      var args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
      return colorString.to.rgb.percent(args);
    },
    array: function() {
      return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
    },
    object: function() {
      var result = {};
      var channels = convert[this.model].channels;
      var labels = convert[this.model].labels;
      for (var i = 0;i < channels; i++) {
        result[labels[i]] = this.color[i];
      }
      if (this.valpha !== 1) {
        result.alpha = this.valpha;
      }
      return result;
    },
    unitArray: function() {
      var rgb = this.rgb().color;
      rgb[0] /= 255;
      rgb[1] /= 255;
      rgb[2] /= 255;
      if (this.valpha !== 1) {
        rgb.push(this.valpha);
      }
      return rgb;
    },
    unitObject: function() {
      var rgb = this.rgb().object();
      rgb.r /= 255;
      rgb.g /= 255;
      rgb.b /= 255;
      if (this.valpha !== 1) {
        rgb.alpha = this.valpha;
      }
      return rgb;
    },
    round: function(places) {
      places = Math.max(places || 0, 0);
      return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
    },
    alpha: function(val) {
      if (arguments.length) {
        return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
      }
      return this.valpha;
    },
    red: getset("rgb", 0, maxfn(255)),
    green: getset("rgb", 1, maxfn(255)),
    blue: getset("rgb", 2, maxfn(255)),
    hue: getset(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function(val) {
      return (val % 360 + 360) % 360;
    }),
    saturationl: getset("hsl", 1, maxfn(100)),
    lightness: getset("hsl", 2, maxfn(100)),
    saturationv: getset("hsv", 1, maxfn(100)),
    value: getset("hsv", 2, maxfn(100)),
    chroma: getset("hcg", 1, maxfn(100)),
    gray: getset("hcg", 2, maxfn(100)),
    white: getset("hwb", 1, maxfn(100)),
    wblack: getset("hwb", 2, maxfn(100)),
    cyan: getset("cmyk", 0, maxfn(100)),
    magenta: getset("cmyk", 1, maxfn(100)),
    yellow: getset("cmyk", 2, maxfn(100)),
    black: getset("cmyk", 3, maxfn(100)),
    x: getset("xyz", 0, maxfn(100)),
    y: getset("xyz", 1, maxfn(100)),
    z: getset("xyz", 2, maxfn(100)),
    l: getset("lab", 0, maxfn(100)),
    a: getset("lab", 1),
    b: getset("lab", 2),
    keyword: function(val) {
      if (arguments.length) {
        return new Color(val);
      }
      return convert[this.model].keyword(this.color);
    },
    hex: function(val) {
      if (arguments.length) {
        return new Color(val);
      }
      return colorString.to.hex(this.rgb().round().color);
    },
    rgbNumber: function() {
      var rgb = this.rgb().color;
      return (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255;
    },
    luminosity: function() {
      var rgb = this.rgb().color;
      var lum = [];
      for (var i = 0;i < rgb.length; i++) {
        var chan = rgb[i] / 255;
        lum[i] = chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
      }
      return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
    },
    contrast: function(color2) {
      var lum1 = this.luminosity();
      var lum2 = color2.luminosity();
      if (lum1 > lum2) {
        return (lum1 + 0.05) / (lum2 + 0.05);
      }
      return (lum2 + 0.05) / (lum1 + 0.05);
    },
    level: function(color2) {
      var contrastRatio = this.contrast(color2);
      if (contrastRatio >= 7.1) {
        return "AAA";
      }
      return contrastRatio >= 4.5 ? "AA" : "";
    },
    isDark: function() {
      var rgb = this.rgb().color;
      var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      return yiq < 128;
    },
    isLight: function() {
      return !this.isDark();
    },
    negate: function() {
      var rgb = this.rgb();
      for (var i = 0;i < 3; i++) {
        rgb.color[i] = 255 - rgb.color[i];
      }
      return rgb;
    },
    lighten: function(ratio) {
      var hsl = this.hsl();
      hsl.color[2] += hsl.color[2] * ratio;
      return hsl;
    },
    darken: function(ratio) {
      var hsl = this.hsl();
      hsl.color[2] -= hsl.color[2] * ratio;
      return hsl;
    },
    saturate: function(ratio) {
      var hsl = this.hsl();
      hsl.color[1] += hsl.color[1] * ratio;
      return hsl;
    },
    desaturate: function(ratio) {
      var hsl = this.hsl();
      hsl.color[1] -= hsl.color[1] * ratio;
      return hsl;
    },
    whiten: function(ratio) {
      var hwb = this.hwb();
      hwb.color[1] += hwb.color[1] * ratio;
      return hwb;
    },
    blacken: function(ratio) {
      var hwb = this.hwb();
      hwb.color[2] += hwb.color[2] * ratio;
      return hwb;
    },
    grayscale: function() {
      var rgb = this.rgb().color;
      var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
      return Color.rgb(val, val, val);
    },
    fade: function(ratio) {
      return this.alpha(this.valpha - this.valpha * ratio);
    },
    opaquer: function(ratio) {
      return this.alpha(this.valpha + this.valpha * ratio);
    },
    rotate: function(degrees) {
      var hsl = this.hsl();
      var hue = hsl.color[0];
      hue = (hue + degrees) % 360;
      hue = hue < 0 ? 360 + hue : hue;
      hsl.color[0] = hue;
      return hsl;
    },
    mix: function(mixinColor, weight) {
      if (!mixinColor || !mixinColor.rgb) {
        throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
      }
      var color1 = mixinColor.rgb();
      var color2 = this.rgb();
      var p = weight === undefined ? 0.5 : weight;
      var w = 2 * p - 1;
      var a = color1.alpha() - color2.alpha();
      var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
      var w2 = 1 - w1;
      return Color.rgb(w1 * color1.red() + w2 * color2.red(), w1 * color1.green() + w2 * color2.green(), w1 * color1.blue() + w2 * color2.blue(), color1.alpha() * p + color2.alpha() * (1 - p));
    }
  };
  Object.keys(convert).forEach(function(model) {
    if (skippedModels.indexOf(model) !== -1) {
      return;
    }
    var channels = convert[model].channels;
    Color.prototype[model] = function() {
      if (this.model === model) {
        return new Color(this);
      }
      if (arguments.length) {
        return new Color(arguments, model);
      }
      var newAlpha = typeof arguments[channels] === "number" ? channels : this.valpha;
      return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
    };
    Color[model] = function(color) {
      if (typeof color === "number") {
        color = zeroArray(_slice.call(arguments), channels);
      }
      return new Color(color, model);
    };
  });
  module.exports = Color;
});

// node_modules/text-hex/index.js
var require_text_hex = __commonJS((exports, module) => {
  module.exports = function hex(str) {
    for (var i = 0, hash = 0;i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash))
      ;
    var color = Math.floor(Math.abs(Math.sin(hash) * 1e4 % 1 * 16777216)).toString(16);
    return "#" + Array(6 - color.length + 1).join("0") + color;
  };
});

// node_modules/colorspace/index.js
var require_colorspace = __commonJS((exports, module) => {
  var color = require_color();
  var hex = require_text_hex();
  module.exports = function colorspace(namespace, delimiter) {
    var split = namespace.split(delimiter || ":");
    var base = hex(split[0]);
    if (!split.length)
      return base;
    for (var i = 0, l = split.length - 1;i < l; i++) {
      base = color(base).mix(color(hex(split[i + 1]))).saturate(1).hex();
    }
    return base;
  };
});

// node_modules/kuler/index.js
var require_kuler = __commonJS((exports, module) => {
  function Kuler(text, color) {
    if (color)
      return new Kuler(text).style(color);
    if (!(this instanceof Kuler))
      return new Kuler(text);
    this.text = text;
  }
  Kuler.prototype.prefix = "\x1B[";
  Kuler.prototype.suffix = "m";
  Kuler.prototype.hex = function hex(color) {
    color = color[0] === "#" ? color.substring(1) : color;
    if (color.length === 3) {
      color = color.split("");
      color[5] = color[2];
      color[4] = color[2];
      color[3] = color[1];
      color[2] = color[1];
      color[1] = color[0];
      color = color.join("");
    }
    var r = color.substring(0, 2), g = color.substring(2, 4), b = color.substring(4, 6);
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  };
  Kuler.prototype.rgb = function rgb(r, g, b) {
    var red = r / 255 * 5, green = g / 255 * 5, blue = b / 255 * 5;
    return this.ansi(red, green, blue);
  };
  Kuler.prototype.ansi = function ansi(r, g, b) {
    var red = Math.round(r), green = Math.round(g), blue = Math.round(b);
    return 16 + red * 36 + green * 6 + blue;
  };
  Kuler.prototype.reset = function reset() {
    return this.prefix + "39;49" + this.suffix;
  };
  Kuler.prototype.style = function style(color) {
    return this.prefix + "38;5;" + this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
  };
  module.exports = Kuler;
});

// node_modules/@dabh/diagnostics/modifiers/namespace-ansi.js
var require_namespace_ansi = __commonJS((exports, module) => {
  var colorspace = require_colorspace();
  var kuler = require_kuler();
  module.exports = function ansiModifier(args, options) {
    var namespace = options.namespace;
    var ansi = options.colors !== false ? kuler(namespace + ":", colorspace(namespace)) : namespace + ":";
    args[0] = ansi + " " + args[0];
    return args;
  };
});

// node_modules/enabled/index.js
var require_enabled = __commonJS((exports, module) => {
  module.exports = function enabled(name, variable) {
    if (!variable)
      return false;
    var variables = variable.split(/[\s,]+/), i = 0;
    for (;i < variables.length; i++) {
      variable = variables[i].replace("*", ".*?");
      if (variable.charAt(0) === "-") {
        if (new RegExp("^" + variable.substr(1) + "$").test(name)) {
          return false;
        }
        continue;
      }
      if (new RegExp("^" + variable + "$").test(name)) {
        return true;
      }
    }
    return false;
  };
});

// node_modules/@dabh/diagnostics/adapters/index.js
var require_adapters = __commonJS((exports, module) => {
  var enabled = require_enabled();
  module.exports = function create(fn) {
    return function adapter(namespace) {
      try {
        return enabled(namespace, fn());
      } catch (e) {
      }
      return false;
    };
  };
});

// node_modules/@dabh/diagnostics/adapters/process.env.js
var require_process_env = __commonJS((exports, module) => {
  var adapter = require_adapters();
  module.exports = adapter(function processenv() {
    return process.env.DEBUG || process.env.DIAGNOSTICS;
  });
});

// node_modules/@dabh/diagnostics/logger/console.js
var require_console2 = __commonJS((exports, module) => {
  module.exports = function(meta, messages) {
    try {
      Function.prototype.apply.call(console.log, console, messages);
    } catch (e) {
    }
  };
});

// node_modules/@dabh/diagnostics/node/development.js
var require_development = __commonJS((exports, module) => {
  var create = require_diagnostics();
  var tty = import.meta.require("tty").isatty(1);
  var diagnostics = create(function dev(namespace, options) {
    options = options || {};
    options.colors = "colors" in options ? options.colors : tty;
    options.namespace = namespace;
    options.prod = false;
    options.dev = true;
    if (!dev.enabled(namespace) && !(options.force || dev.force)) {
      return dev.nope(options);
    }
    return dev.yep(options);
  });
  diagnostics.modify(require_namespace_ansi());
  diagnostics.use(require_process_env());
  diagnostics.set(require_console2());
  module.exports = diagnostics;
});

// node_modules/@dabh/diagnostics/node/index.js
var require_node2 = __commonJS((exports, module) => {
  if (false) {
  } else {
    module.exports = require_development();
  }
});

// node_modules/winston/lib/winston/tail-file.js
var require_tail_file = __commonJS((exports, module) => {
  function noop() {
  }
  var fs = import.meta.require("fs");
  var { StringDecoder } = import.meta.require("string_decoder");
  var { Stream } = require_readable();
  module.exports = (options, iter) => {
    const buffer = Buffer.alloc(64 * 1024);
    const decode = new StringDecoder("utf8");
    const stream = new Stream;
    let buff = "";
    let pos = 0;
    let row = 0;
    if (options.start === -1) {
      delete options.start;
    }
    stream.readable = true;
    stream.destroy = () => {
      stream.destroyed = true;
      stream.emit("end");
      stream.emit("close");
    };
    fs.open(options.file, "a+", "0644", (err, fd) => {
      if (err) {
        if (!iter) {
          stream.emit("error", err);
        } else {
          iter(err);
        }
        stream.destroy();
        return;
      }
      (function read() {
        if (stream.destroyed) {
          fs.close(fd, noop);
          return;
        }
        return fs.read(fd, buffer, 0, buffer.length, pos, (error, bytes) => {
          if (error) {
            if (!iter) {
              stream.emit("error", error);
            } else {
              iter(error);
            }
            stream.destroy();
            return;
          }
          if (!bytes) {
            if (buff) {
              if (options.start == null || row > options.start) {
                if (!iter) {
                  stream.emit("line", buff);
                } else {
                  iter(null, buff);
                }
              }
              row++;
              buff = "";
            }
            return setTimeout(read, 1000);
          }
          let data = decode.write(buffer.slice(0, bytes));
          if (!iter) {
            stream.emit("data", data);
          }
          data = (buff + data).split(/\n+/);
          const l = data.length - 1;
          let i = 0;
          for (;i < l; i++) {
            if (options.start == null || row > options.start) {
              if (!iter) {
                stream.emit("line", data[i]);
              } else {
                iter(null, data[i]);
              }
            }
            row++;
          }
          buff = data[l];
          pos += bytes;
          return read();
        });
      })();
    });
    if (!iter) {
      return stream;
    }
    return stream.destroy;
  };
});

// node_modules/winston/lib/winston/transports/file.js
var require_file = __commonJS((exports, module) => {
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var asyncSeries = require_series();
  var zlib = import.meta.require("zlib");
  var { MESSAGE } = require_triple_beam();
  var { Stream, PassThrough } = require_readable();
  var TransportStream = require_winston_transport();
  var debug = require_node2()("winston:file");
  var os = import.meta.require("os");
  var tailFile = require_tail_file();
  module.exports = class File extends TransportStream {
    constructor(options = {}) {
      super(options);
      this.name = options.name || "file";
      function throwIf(target, ...args) {
        args.slice(1).forEach((name) => {
          if (options[name]) {
            throw new Error(`Cannot set ${name} and ${target} together`);
          }
        });
      }
      this._stream = new PassThrough;
      this._stream.setMaxListeners(30);
      this._onError = this._onError.bind(this);
      if (options.filename || options.dirname) {
        throwIf("filename or dirname", "stream");
        this._basename = this.filename = options.filename ? path.basename(options.filename) : "winston.log";
        this.dirname = options.dirname || path.dirname(options.filename);
        this.options = options.options || { flags: "a" };
      } else if (options.stream) {
        console.warn("options.stream will be removed in winston@4. Use winston.transports.Stream");
        throwIf("stream", "filename", "maxsize");
        this._dest = this._stream.pipe(this._setupStream(options.stream));
        this.dirname = path.dirname(this._dest.path);
      } else {
        throw new Error("Cannot log to file without filename or stream.");
      }
      this.maxsize = options.maxsize || null;
      this.rotationFormat = options.rotationFormat || false;
      this.zippedArchive = options.zippedArchive || false;
      this.maxFiles = options.maxFiles || null;
      this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
      this.tailable = options.tailable || false;
      this.lazy = options.lazy || false;
      this._size = 0;
      this._pendingSize = 0;
      this._created = 0;
      this._drain = false;
      this._opening = false;
      this._ending = false;
      this._fileExist = false;
      if (this.dirname)
        this._createLogDirIfNotExist(this.dirname);
      if (!this.lazy)
        this.open();
    }
    finishIfEnding() {
      if (this._ending) {
        if (this._opening) {
          this.once("open", () => {
            this._stream.once("finish", () => this.emit("finish"));
            setImmediate(() => this._stream.end());
          });
        } else {
          this._stream.once("finish", () => this.emit("finish"));
          setImmediate(() => this._stream.end());
        }
      }
    }
    log(info, callback = () => {
    }) {
      if (this.silent) {
        callback();
        return true;
      }
      if (this._drain) {
        this._stream.once("drain", () => {
          this._drain = false;
          this.log(info, callback);
        });
        return;
      }
      if (this._rotate) {
        this._stream.once("rotate", () => {
          this._rotate = false;
          this.log(info, callback);
        });
        return;
      }
      if (this.lazy) {
        if (!this._fileExist) {
          if (!this._opening) {
            this.open();
          }
          this.once("open", () => {
            this._fileExist = true;
            this.log(info, callback);
            return;
          });
          return;
        }
        if (this._needsNewFile(this._pendingSize)) {
          this._dest.once("close", () => {
            if (!this._opening) {
              this.open();
            }
            this.once("open", () => {
              this.log(info, callback);
              return;
            });
            return;
          });
          return;
        }
      }
      const output = `${info[MESSAGE]}${this.eol}`;
      const bytes = Buffer.byteLength(output);
      function logged() {
        this._size += bytes;
        this._pendingSize -= bytes;
        debug("logged %s %s", this._size, output);
        this.emit("logged", info);
        if (this._rotate) {
          return;
        }
        if (this._opening) {
          return;
        }
        if (!this._needsNewFile()) {
          return;
        }
        if (this.lazy) {
          this._endStream(() => {
            this.emit("fileclosed");
          });
          return;
        }
        this._rotate = true;
        this._endStream(() => this._rotateFile());
      }
      this._pendingSize += bytes;
      if (this._opening && !this.rotatedWhileOpening && this._needsNewFile(this._size + this._pendingSize)) {
        this.rotatedWhileOpening = true;
      }
      const written = this._stream.write(output, logged.bind(this));
      if (!written) {
        this._drain = true;
        this._stream.once("drain", () => {
          this._drain = false;
          callback();
        });
      } else {
        callback();
      }
      debug("written", written, this._drain);
      this.finishIfEnding();
      return written;
    }
    query(options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = normalizeQuery(options);
      const file = path.join(this.dirname, this.filename);
      let buff = "";
      let results = [];
      let row = 0;
      const stream = fs.createReadStream(file, {
        encoding: "utf8"
      });
      stream.on("error", (err) => {
        if (stream.readable) {
          stream.destroy();
        }
        if (!callback) {
          return;
        }
        return err.code !== "ENOENT" ? callback(err) : callback(null, results);
      });
      stream.on("data", (data) => {
        data = (buff + data).split(/\n+/);
        const l = data.length - 1;
        let i = 0;
        for (;i < l; i++) {
          if (!options.start || row >= options.start) {
            add(data[i]);
          }
          row++;
        }
        buff = data[l];
      });
      stream.on("close", () => {
        if (buff) {
          add(buff, true);
        }
        if (options.order === "desc") {
          results = results.reverse();
        }
        if (callback)
          callback(null, results);
      });
      function add(buff2, attempt) {
        try {
          const log = JSON.parse(buff2);
          if (check(log)) {
            push(log);
          }
        } catch (e) {
          if (!attempt) {
            stream.emit("error", e);
          }
        }
      }
      function push(log) {
        if (options.rows && results.length >= options.rows && options.order !== "desc") {
          if (stream.readable) {
            stream.destroy();
          }
          return;
        }
        if (options.fields) {
          log = options.fields.reduce((obj, key) => {
            obj[key] = log[key];
            return obj;
          }, {});
        }
        if (options.order === "desc") {
          if (results.length >= options.rows) {
            results.shift();
          }
        }
        results.push(log);
      }
      function check(log) {
        if (!log) {
          return;
        }
        if (typeof log !== "object") {
          return;
        }
        const time = new Date(log.timestamp);
        if (options.from && time < options.from || options.until && time > options.until || options.level && options.level !== log.level) {
          return;
        }
        return true;
      }
      function normalizeQuery(options2) {
        options2 = options2 || {};
        options2.rows = options2.rows || options2.limit || 10;
        options2.start = options2.start || 0;
        options2.until = options2.until || new Date;
        if (typeof options2.until !== "object") {
          options2.until = new Date(options2.until);
        }
        options2.from = options2.from || options2.until - 24 * 60 * 60 * 1000;
        if (typeof options2.from !== "object") {
          options2.from = new Date(options2.from);
        }
        options2.order = options2.order || "desc";
        return options2;
      }
    }
    stream(options = {}) {
      const file = path.join(this.dirname, this.filename);
      const stream = new Stream;
      const tail = {
        file,
        start: options.start
      };
      stream.destroy = tailFile(tail, (err, line) => {
        if (err) {
          return stream.emit("error", err);
        }
        try {
          stream.emit("data", line);
          line = JSON.parse(line);
          stream.emit("log", line);
        } catch (e) {
          stream.emit("error", e);
        }
      });
      return stream;
    }
    open() {
      if (!this.filename)
        return;
      if (this._opening)
        return;
      this._opening = true;
      this.stat((err, size) => {
        if (err) {
          return this.emit("error", err);
        }
        debug("stat done: %s { size: %s }", this.filename, size);
        this._size = size;
        this._dest = this._createStream(this._stream);
        this._opening = false;
        this.once("open", () => {
          if (!this._stream.emit("rotate")) {
            this._rotate = false;
          }
        });
      });
    }
    stat(callback) {
      const target = this._getFile();
      const fullpath = path.join(this.dirname, target);
      fs.stat(fullpath, (err, stat) => {
        if (err && err.code === "ENOENT") {
          debug("ENOENT\xA0ok", fullpath);
          this.filename = target;
          return callback(null, 0);
        }
        if (err) {
          debug(`err ${err.code} ${fullpath}`);
          return callback(err);
        }
        if (!stat || this._needsNewFile(stat.size)) {
          return this._incFile(() => this.stat(callback));
        }
        this.filename = target;
        callback(null, stat.size);
      });
    }
    close(cb) {
      if (!this._stream) {
        return;
      }
      this._stream.end(() => {
        if (cb) {
          cb();
        }
        this.emit("flush");
        this.emit("closed");
      });
    }
    _needsNewFile(size) {
      size = size || this._size;
      return this.maxsize && size >= this.maxsize;
    }
    _onError(err) {
      this.emit("error", err);
    }
    _setupStream(stream) {
      stream.on("error", this._onError);
      return stream;
    }
    _cleanupStream(stream) {
      stream.removeListener("error", this._onError);
      stream.destroy();
      return stream;
    }
    _rotateFile() {
      this._incFile(() => this.open());
    }
    _endStream(callback = () => {
    }) {
      if (this._dest) {
        this._stream.unpipe(this._dest);
        this._dest.end(() => {
          this._cleanupStream(this._dest);
          callback();
        });
      } else {
        callback();
      }
    }
    _createStream(source) {
      const fullpath = path.join(this.dirname, this.filename);
      debug("create stream start", fullpath, this.options);
      const dest = fs.createWriteStream(fullpath, this.options).on("error", (err) => debug(err)).on("close", () => debug("close", dest.path, dest.bytesWritten)).on("open", () => {
        debug("file open ok", fullpath);
        this.emit("open", fullpath);
        source.pipe(dest);
        if (this.rotatedWhileOpening) {
          this._stream = new PassThrough;
          this._stream.setMaxListeners(30);
          this._rotateFile();
          this.rotatedWhileOpening = false;
          this._cleanupStream(dest);
          source.end();
        }
      });
      debug("create stream ok", fullpath);
      return dest;
    }
    _incFile(callback) {
      debug("_incFile", this.filename);
      const ext = path.extname(this._basename);
      const basename = path.basename(this._basename, ext);
      const tasks = [];
      if (this.zippedArchive) {
        tasks.push(function(cb) {
          const num = this._created > 0 && !this.tailable ? this._created : "";
          this._compressFile(path.join(this.dirname, `${basename}${num}${ext}`), path.join(this.dirname, `${basename}${num}${ext}.gz`), cb);
        }.bind(this));
      }
      tasks.push(function(cb) {
        if (!this.tailable) {
          this._created += 1;
          this._checkMaxFilesIncrementing(ext, basename, cb);
        } else {
          this._checkMaxFilesTailable(ext, basename, cb);
        }
      }.bind(this));
      asyncSeries(tasks, callback);
    }
    _getFile() {
      const ext = path.extname(this._basename);
      const basename = path.basename(this._basename, ext);
      const isRotation = this.rotationFormat ? this.rotationFormat() : this._created;
      return !this.tailable && this._created ? `${basename}${isRotation}${ext}` : `${basename}${ext}`;
    }
    _checkMaxFilesIncrementing(ext, basename, callback) {
      if (!this.maxFiles || this._created < this.maxFiles) {
        return setImmediate(callback);
      }
      const oldest = this._created - this.maxFiles;
      const isOldest = oldest !== 0 ? oldest : "";
      const isZipped = this.zippedArchive ? ".gz" : "";
      const filePath = `${basename}${isOldest}${ext}${isZipped}`;
      const target = path.join(this.dirname, filePath);
      fs.unlink(target, callback);
    }
    _checkMaxFilesTailable(ext, basename, callback) {
      const tasks = [];
      if (!this.maxFiles) {
        return;
      }
      const isZipped = this.zippedArchive ? ".gz" : "";
      for (let x = this.maxFiles - 1;x > 1; x--) {
        tasks.push(function(i, cb) {
          let fileName = `${basename}${i - 1}${ext}${isZipped}`;
          const tmppath = path.join(this.dirname, fileName);
          fs.exists(tmppath, (exists) => {
            if (!exists) {
              return cb(null);
            }
            fileName = `${basename}${i}${ext}${isZipped}`;
            fs.rename(tmppath, path.join(this.dirname, fileName), cb);
          });
        }.bind(this, x));
      }
      asyncSeries(tasks, () => {
        fs.rename(path.join(this.dirname, `${basename}${ext}${isZipped}`), path.join(this.dirname, `${basename}1${ext}${isZipped}`), callback);
      });
    }
    _compressFile(src, dest, callback) {
      fs.access(src, fs.F_OK, (err) => {
        if (err) {
          return callback();
        }
        var gzip = zlib.createGzip();
        var inp = fs.createReadStream(src);
        var out = fs.createWriteStream(dest);
        out.on("finish", () => {
          fs.unlink(src, callback);
        });
        inp.pipe(gzip).pipe(out);
      });
    }
    _createLogDirIfNotExist(dirPath) {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  };
});

// node_modules/winston/lib/winston/transports/http.js
var require_http = __commonJS((exports, module) => {
  var http = import.meta.require("http");
  var https = import.meta.require("https");
  var { Stream } = require_readable();
  var TransportStream = require_winston_transport();
  var { configure } = require_safe_stable_stringify();
  module.exports = class Http extends TransportStream {
    constructor(options = {}) {
      super(options);
      this.options = options;
      this.name = options.name || "http";
      this.ssl = !!options.ssl;
      this.host = options.host || "localhost";
      this.port = options.port;
      this.auth = options.auth;
      this.path = options.path || "";
      this.maximumDepth = options.maximumDepth;
      this.agent = options.agent;
      this.headers = options.headers || {};
      this.headers["content-type"] = "application/json";
      this.batch = options.batch || false;
      this.batchInterval = options.batchInterval || 5000;
      this.batchCount = options.batchCount || 10;
      this.batchOptions = [];
      this.batchTimeoutID = -1;
      this.batchCallback = {};
      if (!this.port) {
        this.port = this.ssl ? 443 : 80;
      }
    }
    log(info, callback) {
      this._request(info, null, null, (err, res) => {
        if (res && res.statusCode !== 200) {
          err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
        }
        if (err) {
          this.emit("warn", err);
        } else {
          this.emit("logged", info);
        }
      });
      if (callback) {
        setImmediate(callback);
      }
    }
    query(options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = {
        method: "query",
        params: this.normalizeQuery(options)
      };
      const auth = options.params.auth || null;
      delete options.params.auth;
      const path = options.params.path || null;
      delete options.params.path;
      this._request(options, auth, path, (err, res, body) => {
        if (res && res.statusCode !== 200) {
          err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
        }
        if (err) {
          return callback(err);
        }
        if (typeof body === "string") {
          try {
            body = JSON.parse(body);
          } catch (e) {
            return callback(e);
          }
        }
        callback(null, body);
      });
    }
    stream(options = {}) {
      const stream = new Stream;
      options = {
        method: "stream",
        params: options
      };
      const path = options.params.path || null;
      delete options.params.path;
      const auth = options.params.auth || null;
      delete options.params.auth;
      let buff = "";
      const req = this._request(options, auth, path);
      stream.destroy = () => req.destroy();
      req.on("data", (data) => {
        data = (buff + data).split(/\n+/);
        const l = data.length - 1;
        let i = 0;
        for (;i < l; i++) {
          try {
            stream.emit("log", JSON.parse(data[i]));
          } catch (e) {
            stream.emit("error", e);
          }
        }
        buff = data[l];
      });
      req.on("error", (err) => stream.emit("error", err));
      return stream;
    }
    _request(options, auth, path, callback) {
      options = options || {};
      auth = auth || this.auth;
      path = path || this.path || "";
      if (this.batch) {
        this._doBatch(options, callback, auth, path);
      } else {
        this._doRequest(options, callback, auth, path);
      }
    }
    _doBatch(options, callback, auth, path) {
      this.batchOptions.push(options);
      if (this.batchOptions.length === 1) {
        const me = this;
        this.batchCallback = callback;
        this.batchTimeoutID = setTimeout(function() {
          me.batchTimeoutID = -1;
          me._doBatchRequest(me.batchCallback, auth, path);
        }, this.batchInterval);
      }
      if (this.batchOptions.length === this.batchCount) {
        this._doBatchRequest(this.batchCallback, auth, path);
      }
    }
    _doBatchRequest(callback, auth, path) {
      if (this.batchTimeoutID > 0) {
        clearTimeout(this.batchTimeoutID);
        this.batchTimeoutID = -1;
      }
      const batchOptionsCopy = this.batchOptions.slice();
      this.batchOptions = [];
      this._doRequest(batchOptionsCopy, callback, auth, path);
    }
    _doRequest(options, callback, auth, path) {
      const headers = Object.assign({}, this.headers);
      if (auth && auth.bearer) {
        headers.Authorization = `Bearer ${auth.bearer}`;
      }
      const req = (this.ssl ? https : http).request({
        ...this.options,
        method: "POST",
        host: this.host,
        port: this.port,
        path: `/${path.replace(/^\//, "")}`,
        headers,
        auth: auth && auth.username && auth.password ? `${auth.username}:${auth.password}` : "",
        agent: this.agent
      });
      req.on("error", callback);
      req.on("response", (res) => res.on("end", () => callback(null, res)).resume());
      const jsonStringify = configure({
        ...this.maximumDepth && { maximumDepth: this.maximumDepth }
      });
      req.end(Buffer.from(jsonStringify(options, this.options.replacer), "utf8"));
    }
  };
});

// node_modules/is-stream/index.js
var require_is_stream = __commonJS((exports, module) => {
  var isStream = (stream) => stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
  isStream.writable = (stream) => isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
  isStream.readable = (stream) => isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
  isStream.duplex = (stream) => isStream.writable(stream) && isStream.readable(stream);
  isStream.transform = (stream) => isStream.duplex(stream) && typeof stream._transform === "function";
  module.exports = isStream;
});

// node_modules/winston/lib/winston/transports/stream.js
var require_stream = __commonJS((exports, module) => {
  var isStream = require_is_stream();
  var { MESSAGE } = require_triple_beam();
  var os = import.meta.require("os");
  var TransportStream = require_winston_transport();
  module.exports = class Stream extends TransportStream {
    constructor(options = {}) {
      super(options);
      if (!options.stream || !isStream(options.stream)) {
        throw new Error("options.stream is required.");
      }
      this._stream = options.stream;
      this._stream.setMaxListeners(Infinity);
      this.isObjectMode = options.stream._writableState.objectMode;
      this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
    }
    log(info, callback) {
      setImmediate(() => this.emit("logged", info));
      if (this.isObjectMode) {
        this._stream.write(info);
        if (callback) {
          callback();
        }
        return;
      }
      this._stream.write(`${info[MESSAGE]}${this.eol}`);
      if (callback) {
        callback();
      }
      return;
    }
  };
});

// node_modules/winston/lib/winston/transports/index.js
var require_transports = __commonJS((exports) => {
  Object.defineProperty(exports, "Console", {
    configurable: true,
    enumerable: true,
    get() {
      return require_console();
    }
  });
  Object.defineProperty(exports, "File", {
    configurable: true,
    enumerable: true,
    get() {
      return require_file();
    }
  });
  Object.defineProperty(exports, "Http", {
    configurable: true,
    enumerable: true,
    get() {
      return require_http();
    }
  });
  Object.defineProperty(exports, "Stream", {
    configurable: true,
    enumerable: true,
    get() {
      return require_stream();
    }
  });
});

// node_modules/winston/lib/winston/config/index.js
var require_config2 = __commonJS((exports) => {
  var logform = require_logform();
  var { configs } = require_triple_beam();
  exports.cli = logform.levels(configs.cli);
  exports.npm = logform.levels(configs.npm);
  exports.syslog = logform.levels(configs.syslog);
  exports.addColors = logform.levels;
});

// node_modules/async/eachOf.js
var require_eachOf = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachOfArrayLike(coll, iteratee, callback) {
    callback = (0, _once2.default)(callback);
    var index = 0, completed = 0, { length } = coll, canceled = false;
    if (length === 0) {
      callback(null);
    }
    function iteratorCallback(err, value) {
      if (err === false) {
        canceled = true;
      }
      if (canceled === true)
        return;
      if (err) {
        callback(err);
      } else if (++completed === length || value === _breakLoop2.default) {
        callback(null);
      }
    }
    for (;index < length; index++) {
      iteratee(coll[index], index, (0, _onlyOnce2.default)(iteratorCallback));
    }
  }
  function eachOfGeneric(coll, iteratee, callback) {
    return (0, _eachOfLimit2.default)(coll, Infinity, iteratee, callback);
  }
  function eachOf(coll, iteratee, callback) {
    var eachOfImplementation = (0, _isArrayLike2.default)(coll) ? eachOfArrayLike : eachOfGeneric;
    return eachOfImplementation(coll, (0, _wrapAsync2.default)(iteratee), callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _isArrayLike = require_isArrayLike();
  var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
  var _breakLoop = require_breakLoop();
  var _breakLoop2 = _interopRequireDefault(_breakLoop);
  var _eachOfLimit = require_eachOfLimit2();
  var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);
  var _once = require_once();
  var _once2 = _interopRequireDefault(_once);
  var _onlyOnce = require_onlyOnce();
  var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachOf, 3);
  module.exports = exports.default;
});

// node_modules/async/internal/withoutIndex.js
var require_withoutIndex = __commonJS((exports, module) => {
  function _withoutIndex(iteratee) {
    return (value, index, callback) => iteratee(value, callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _withoutIndex;
  module.exports = exports.default;
});

// node_modules/async/forEach.js
var require_forEach = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachLimit(coll, iteratee, callback) {
    return (0, _eachOf2.default)(coll, (0, _withoutIndex2.default)((0, _wrapAsync2.default)(iteratee)), callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _eachOf = require_eachOf();
  var _eachOf2 = _interopRequireDefault(_eachOf);
  var _withoutIndex = require_withoutIndex();
  var _withoutIndex2 = _interopRequireDefault(_withoutIndex);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachLimit, 3);
  module.exports = exports.default;
});

// node_modules/fn.name/index.js
var require_fn = __commonJS((exports, module) => {
  var toString = Object.prototype.toString;
  module.exports = function name(fn) {
    if (typeof fn.displayName === "string" && fn.constructor.name) {
      return fn.displayName;
    } else if (typeof fn.name === "string" && fn.name) {
      return fn.name;
    }
    if (typeof fn === "object" && fn.constructor && typeof fn.constructor.name === "string")
      return fn.constructor.name;
    var named = fn.toString(), type = toString.call(fn).slice(8, -1);
    if (type === "Function") {
      named = named.substring(named.indexOf("(") + 1, named.indexOf(")"));
    } else {
      named = type;
    }
    return named || "anonymous";
  };
});

// node_modules/one-time/index.js
var require_one_time = __commonJS((exports, module) => {
  var name = require_fn();
  module.exports = function one(fn) {
    var called = 0, value;
    function onetime() {
      if (called)
        return value;
      called = 1;
      value = fn.apply(this, arguments);
      fn = null;
      return value;
    }
    onetime.displayName = name(fn);
    return onetime;
  };
});

// node_modules/stack-trace/lib/stack-trace.js
var require_stack_trace = __commonJS((exports) => {
  function CallSite(properties) {
    for (var property in properties) {
      this[property] = properties[property];
    }
  }
  exports.get = function(belowFn) {
    var oldLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = Infinity;
    var dummyObject = {};
    var v8Handler = Error.prepareStackTrace;
    Error.prepareStackTrace = function(dummyObject2, v8StackTrace2) {
      return v8StackTrace2;
    };
    Error.captureStackTrace(dummyObject, belowFn || exports.get);
    var v8StackTrace = dummyObject.stack;
    Error.prepareStackTrace = v8Handler;
    Error.stackTraceLimit = oldLimit;
    return v8StackTrace;
  };
  exports.parse = function(err) {
    if (!err.stack) {
      return [];
    }
    var self2 = this;
    var lines = err.stack.split("\n").slice(1);
    return lines.map(function(line) {
      if (line.match(/^\s*[-]{4,}$/)) {
        return self2._createParsedCallSite({
          fileName: line,
          lineNumber: null,
          functionName: null,
          typeName: null,
          methodName: null,
          columnNumber: null,
          native: null
        });
      }
      var lineMatch = line.match(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);
      if (!lineMatch) {
        return;
      }
      var object = null;
      var method = null;
      var functionName = null;
      var typeName = null;
      var methodName = null;
      var isNative = lineMatch[5] === "native";
      if (lineMatch[1]) {
        functionName = lineMatch[1];
        var methodStart = functionName.lastIndexOf(".");
        if (functionName[methodStart - 1] == ".")
          methodStart--;
        if (methodStart > 0) {
          object = functionName.substr(0, methodStart);
          method = functionName.substr(methodStart + 1);
          var objectEnd = object.indexOf(".Module");
          if (objectEnd > 0) {
            functionName = functionName.substr(objectEnd + 1);
            object = object.substr(0, objectEnd);
          }
        }
        typeName = null;
      }
      if (method) {
        typeName = object;
        methodName = method;
      }
      if (method === "<anonymous>") {
        methodName = null;
        functionName = null;
      }
      var properties = {
        fileName: lineMatch[2] || null,
        lineNumber: parseInt(lineMatch[3], 10) || null,
        functionName,
        typeName,
        methodName,
        columnNumber: parseInt(lineMatch[4], 10) || null,
        native: isNative
      };
      return self2._createParsedCallSite(properties);
    }).filter(function(callSite) {
      return !!callSite;
    });
  };
  var strProperties = [
    "this",
    "typeName",
    "functionName",
    "methodName",
    "fileName",
    "lineNumber",
    "columnNumber",
    "function",
    "evalOrigin"
  ];
  var boolProperties = [
    "topLevel",
    "eval",
    "native",
    "constructor"
  ];
  strProperties.forEach(function(property) {
    CallSite.prototype[property] = null;
    CallSite.prototype["get" + property[0].toUpperCase() + property.substr(1)] = function() {
      return this[property];
    };
  });
  boolProperties.forEach(function(property) {
    CallSite.prototype[property] = false;
    CallSite.prototype["is" + property[0].toUpperCase() + property.substr(1)] = function() {
      return this[property];
    };
  });
  exports._createParsedCallSite = function(properties) {
    return new CallSite(properties);
  };
});

// node_modules/winston/lib/winston/exception-stream.js
var require_exception_stream = __commonJS((exports, module) => {
  var { Writable } = require_readable();
  module.exports = class ExceptionStream extends Writable {
    constructor(transport) {
      super({ objectMode: true });
      if (!transport) {
        throw new Error("ExceptionStream requires a TransportStream instance.");
      }
      this.handleExceptions = true;
      this.transport = transport;
    }
    _write(info, enc, callback) {
      if (info.exception) {
        return this.transport.log(info, callback);
      }
      callback();
      return true;
    }
  };
});

// node_modules/winston/lib/winston/exception-handler.js
var require_exception_handler = __commonJS((exports, module) => {
  var os = import.meta.require("os");
  var asyncForEach = require_forEach();
  var debug = require_node2()("winston:exception");
  var once = require_one_time();
  var stackTrace = require_stack_trace();
  var ExceptionStream = require_exception_stream();
  module.exports = class ExceptionHandler {
    constructor(logger) {
      if (!logger) {
        throw new Error("Logger is required to handle exceptions");
      }
      this.logger = logger;
      this.handlers = new Map;
    }
    handle(...args) {
      args.forEach((arg) => {
        if (Array.isArray(arg)) {
          return arg.forEach((handler) => this._addHandler(handler));
        }
        this._addHandler(arg);
      });
      if (!this.catcher) {
        this.catcher = this._uncaughtException.bind(this);
        process.on("uncaughtException", this.catcher);
      }
    }
    unhandle() {
      if (this.catcher) {
        process.removeListener("uncaughtException", this.catcher);
        this.catcher = false;
        Array.from(this.handlers.values()).forEach((wrapper) => this.logger.unpipe(wrapper));
      }
    }
    getAllInfo(err) {
      let message = null;
      if (err) {
        message = typeof err === "string" ? err : err.message;
      }
      return {
        error: err,
        level: "error",
        message: [
          `uncaughtException: ${message || "(no error message)"}`,
          err && err.stack || "  No stack trace"
        ].join("\n"),
        stack: err && err.stack,
        exception: true,
        date: new Date().toString(),
        process: this.getProcessInfo(),
        os: this.getOsInfo(),
        trace: this.getTrace(err)
      };
    }
    getProcessInfo() {
      return {
        pid: process.pid,
        uid: process.getuid ? process.getuid() : null,
        gid: process.getgid ? process.getgid() : null,
        cwd: process.cwd(),
        execPath: process.execPath,
        version: process.version,
        argv: process.argv,
        memoryUsage: process.memoryUsage()
      };
    }
    getOsInfo() {
      return {
        loadavg: os.loadavg(),
        uptime: os.uptime()
      };
    }
    getTrace(err) {
      const trace = err ? stackTrace.parse(err) : stackTrace.get();
      return trace.map((site) => {
        return {
          column: site.getColumnNumber(),
          file: site.getFileName(),
          function: site.getFunctionName(),
          line: site.getLineNumber(),
          method: site.getMethodName(),
          native: site.isNative()
        };
      });
    }
    _addHandler(handler) {
      if (!this.handlers.has(handler)) {
        handler.handleExceptions = true;
        const wrapper = new ExceptionStream(handler);
        this.handlers.set(handler, wrapper);
        this.logger.pipe(wrapper);
      }
    }
    _uncaughtException(err) {
      const info = this.getAllInfo(err);
      const handlers = this._getExceptionHandlers();
      let doExit = typeof this.logger.exitOnError === "function" ? this.logger.exitOnError(err) : this.logger.exitOnError;
      let timeout;
      if (!handlers.length && doExit) {
        console.warn("winston: exitOnError cannot be true with no exception handlers.");
        console.warn("winston: not exiting process.");
        doExit = false;
      }
      function gracefulExit() {
        debug("doExit", doExit);
        debug("process._exiting", process._exiting);
        if (doExit && !process._exiting) {
          if (timeout) {
            clearTimeout(timeout);
          }
          process.exit(1);
        }
      }
      if (!handlers || handlers.length === 0) {
        return process.nextTick(gracefulExit);
      }
      asyncForEach(handlers, (handler, next) => {
        const done = once(next);
        const transport = handler.transport || handler;
        function onDone(event) {
          return () => {
            debug(event);
            done();
          };
        }
        transport._ending = true;
        transport.once("finish", onDone("finished"));
        transport.once("error", onDone("error"));
      }, () => doExit && gracefulExit());
      this.logger.log(info);
      if (doExit) {
        timeout = setTimeout(gracefulExit, 3000);
      }
    }
    _getExceptionHandlers() {
      return this.logger.transports.filter((wrap) => {
        const transport = wrap.transport || wrap;
        return transport.handleExceptions;
      });
    }
  };
});

// node_modules/winston/lib/winston/rejection-stream.js
var require_rejection_stream = __commonJS((exports, module) => {
  var { Writable } = require_readable();
  module.exports = class RejectionStream extends Writable {
    constructor(transport) {
      super({ objectMode: true });
      if (!transport) {
        throw new Error("RejectionStream requires a TransportStream instance.");
      }
      this.handleRejections = true;
      this.transport = transport;
    }
    _write(info, enc, callback) {
      if (info.rejection) {
        return this.transport.log(info, callback);
      }
      callback();
      return true;
    }
  };
});

// node_modules/winston/lib/winston/rejection-handler.js
var require_rejection_handler = __commonJS((exports, module) => {
  var os = import.meta.require("os");
  var asyncForEach = require_forEach();
  var debug = require_node2()("winston:rejection");
  var once = require_one_time();
  var stackTrace = require_stack_trace();
  var RejectionStream = require_rejection_stream();
  module.exports = class RejectionHandler {
    constructor(logger) {
      if (!logger) {
        throw new Error("Logger is required to handle rejections");
      }
      this.logger = logger;
      this.handlers = new Map;
    }
    handle(...args) {
      args.forEach((arg) => {
        if (Array.isArray(arg)) {
          return arg.forEach((handler) => this._addHandler(handler));
        }
        this._addHandler(arg);
      });
      if (!this.catcher) {
        this.catcher = this._unhandledRejection.bind(this);
        process.on("unhandledRejection", this.catcher);
      }
    }
    unhandle() {
      if (this.catcher) {
        process.removeListener("unhandledRejection", this.catcher);
        this.catcher = false;
        Array.from(this.handlers.values()).forEach((wrapper) => this.logger.unpipe(wrapper));
      }
    }
    getAllInfo(err) {
      let message = null;
      if (err) {
        message = typeof err === "string" ? err : err.message;
      }
      return {
        error: err,
        level: "error",
        message: [
          `unhandledRejection: ${message || "(no error message)"}`,
          err && err.stack || "  No stack trace"
        ].join("\n"),
        stack: err && err.stack,
        rejection: true,
        date: new Date().toString(),
        process: this.getProcessInfo(),
        os: this.getOsInfo(),
        trace: this.getTrace(err)
      };
    }
    getProcessInfo() {
      return {
        pid: process.pid,
        uid: process.getuid ? process.getuid() : null,
        gid: process.getgid ? process.getgid() : null,
        cwd: process.cwd(),
        execPath: process.execPath,
        version: process.version,
        argv: process.argv,
        memoryUsage: process.memoryUsage()
      };
    }
    getOsInfo() {
      return {
        loadavg: os.loadavg(),
        uptime: os.uptime()
      };
    }
    getTrace(err) {
      const trace = err ? stackTrace.parse(err) : stackTrace.get();
      return trace.map((site) => {
        return {
          column: site.getColumnNumber(),
          file: site.getFileName(),
          function: site.getFunctionName(),
          line: site.getLineNumber(),
          method: site.getMethodName(),
          native: site.isNative()
        };
      });
    }
    _addHandler(handler) {
      if (!this.handlers.has(handler)) {
        handler.handleRejections = true;
        const wrapper = new RejectionStream(handler);
        this.handlers.set(handler, wrapper);
        this.logger.pipe(wrapper);
      }
    }
    _unhandledRejection(err) {
      const info = this.getAllInfo(err);
      const handlers = this._getRejectionHandlers();
      let doExit = typeof this.logger.exitOnError === "function" ? this.logger.exitOnError(err) : this.logger.exitOnError;
      let timeout;
      if (!handlers.length && doExit) {
        console.warn("winston: exitOnError cannot be true with no rejection handlers.");
        console.warn("winston: not exiting process.");
        doExit = false;
      }
      function gracefulExit() {
        debug("doExit", doExit);
        debug("process._exiting", process._exiting);
        if (doExit && !process._exiting) {
          if (timeout) {
            clearTimeout(timeout);
          }
          process.exit(1);
        }
      }
      if (!handlers || handlers.length === 0) {
        return process.nextTick(gracefulExit);
      }
      asyncForEach(handlers, (handler, next) => {
        const done = once(next);
        const transport = handler.transport || handler;
        function onDone(event) {
          return () => {
            debug(event);
            done();
          };
        }
        transport._ending = true;
        transport.once("finish", onDone("finished"));
        transport.once("error", onDone("error"));
      }, () => doExit && gracefulExit());
      this.logger.log(info);
      if (doExit) {
        timeout = setTimeout(gracefulExit, 3000);
      }
    }
    _getRejectionHandlers() {
      return this.logger.transports.filter((wrap) => {
        const transport = wrap.transport || wrap;
        return transport.handleRejections;
      });
    }
  };
});

// node_modules/winston/lib/winston/profiler.js
var require_profiler = __commonJS((exports, module) => {
  class Profiler {
    constructor(logger) {
      const Logger = require_logger();
      if (typeof logger !== "object" || Array.isArray(logger) || !(logger instanceof Logger)) {
        throw new Error("Logger is required for profiling");
      } else {
        this.logger = logger;
        this.start = Date.now();
      }
    }
    done(...args) {
      if (typeof args[args.length - 1] === "function") {
        console.warn("Callback function no longer supported as of winston@3.0.0");
        args.pop();
      }
      const info = typeof args[args.length - 1] === "object" ? args.pop() : {};
      info.level = info.level || "info";
      info.durationMs = Date.now() - this.start;
      return this.logger.write(info);
    }
  }
  module.exports = Profiler;
});

// node_modules/winston/lib/winston/logger.js
var require_logger = __commonJS((exports, module) => {
  function getLevelValue(levels, level) {
    const value = levels[level];
    if (!value && value !== 0) {
      return null;
    }
    return value;
  }
  var { Stream, Transform } = require_readable();
  var asyncForEach = require_forEach();
  var { LEVEL, SPLAT } = require_triple_beam();
  var isStream = require_is_stream();
  var ExceptionHandler = require_exception_handler();
  var RejectionHandler = require_rejection_handler();
  var LegacyTransportStream = require_legacy();
  var Profiler = require_profiler();
  var { warn } = require_common();
  var config = require_config2();
  var formatRegExp = /%[scdjifoO%]/g;

  class Logger extends Transform {
    constructor(options) {
      super({ objectMode: true });
      this.configure(options);
    }
    child(defaultRequestMetadata) {
      const logger = this;
      return Object.create(logger, {
        write: {
          value: function(info) {
            const infoClone = Object.assign({}, defaultRequestMetadata, info);
            if (info instanceof Error) {
              infoClone.stack = info.stack;
              infoClone.message = info.message;
            }
            logger.write(infoClone);
          }
        }
      });
    }
    configure({
      silent,
      format,
      defaultMeta,
      levels,
      level = "info",
      exitOnError = true,
      transports,
      colors,
      emitErrs,
      formatters,
      padLevels,
      rewriters,
      stripColors,
      exceptionHandlers,
      rejectionHandlers
    } = {}) {
      if (this.transports.length) {
        this.clear();
      }
      this.silent = silent;
      this.format = format || this.format || require_json()();
      this.defaultMeta = defaultMeta || null;
      this.levels = levels || this.levels || config.npm.levels;
      this.level = level;
      if (this.exceptions) {
        this.exceptions.unhandle();
      }
      if (this.rejections) {
        this.rejections.unhandle();
      }
      this.exceptions = new ExceptionHandler(this);
      this.rejections = new RejectionHandler(this);
      this.profilers = {};
      this.exitOnError = exitOnError;
      if (transports) {
        transports = Array.isArray(transports) ? transports : [transports];
        transports.forEach((transport) => this.add(transport));
      }
      if (colors || emitErrs || formatters || padLevels || rewriters || stripColors) {
        throw new Error([
          "{ colors, emitErrs, formatters, padLevels, rewriters, stripColors } were removed in winston@3.0.0.",
          "Use a custom winston.format(function) instead.",
          "See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md"
        ].join("\n"));
      }
      if (exceptionHandlers) {
        this.exceptions.handle(exceptionHandlers);
      }
      if (rejectionHandlers) {
        this.rejections.handle(rejectionHandlers);
      }
    }
    isLevelEnabled(level) {
      const givenLevelValue = getLevelValue(this.levels, level);
      if (givenLevelValue === null) {
        return false;
      }
      const configuredLevelValue = getLevelValue(this.levels, this.level);
      if (configuredLevelValue === null) {
        return false;
      }
      if (!this.transports || this.transports.length === 0) {
        return configuredLevelValue >= givenLevelValue;
      }
      const index = this.transports.findIndex((transport) => {
        let transportLevelValue = getLevelValue(this.levels, transport.level);
        if (transportLevelValue === null) {
          transportLevelValue = configuredLevelValue;
        }
        return transportLevelValue >= givenLevelValue;
      });
      return index !== -1;
    }
    log(level, msg, ...splat) {
      if (arguments.length === 1) {
        level[LEVEL] = level.level;
        this._addDefaultMeta(level);
        this.write(level);
        return this;
      }
      if (arguments.length === 2) {
        if (msg && typeof msg === "object") {
          msg[LEVEL] = msg.level = level;
          this._addDefaultMeta(msg);
          this.write(msg);
          return this;
        }
        msg = { [LEVEL]: level, level, message: msg };
        this._addDefaultMeta(msg);
        this.write(msg);
        return this;
      }
      const [meta] = splat;
      if (typeof meta === "object" && meta !== null) {
        const tokens = msg && msg.match && msg.match(formatRegExp);
        if (!tokens) {
          const info = Object.assign({}, this.defaultMeta, meta, {
            [LEVEL]: level,
            [SPLAT]: splat,
            level,
            message: msg
          });
          if (meta.message)
            info.message = `${info.message} ${meta.message}`;
          if (meta.stack)
            info.stack = meta.stack;
          if (meta.cause)
            info.cause = meta.cause;
          this.write(info);
          return this;
        }
      }
      this.write(Object.assign({}, this.defaultMeta, {
        [LEVEL]: level,
        [SPLAT]: splat,
        level,
        message: msg
      }));
      return this;
    }
    _transform(info, enc, callback) {
      if (this.silent) {
        return callback();
      }
      if (!info[LEVEL]) {
        info[LEVEL] = info.level;
      }
      if (!this.levels[info[LEVEL]] && this.levels[info[LEVEL]] !== 0) {
        console.error("[winston] Unknown logger level: %s", info[LEVEL]);
      }
      if (!this._readableState.pipes) {
        console.error("[winston] Attempt to write logs with no transports, which can increase memory usage: %j", info);
      }
      try {
        this.push(this.format.transform(info, this.format.options));
      } finally {
        this._writableState.sync = false;
        callback();
      }
    }
    _final(callback) {
      const transports = this.transports.slice();
      asyncForEach(transports, (transport, next) => {
        if (!transport || transport.finished)
          return setImmediate(next);
        transport.once("finish", next);
        transport.end();
      }, callback);
    }
    add(transport) {
      const target = !isStream(transport) || transport.log.length > 2 ? new LegacyTransportStream({ transport }) : transport;
      if (!target._writableState || !target._writableState.objectMode) {
        throw new Error("Transports must WritableStreams in objectMode. Set { objectMode: true }.");
      }
      this._onEvent("error", target);
      this._onEvent("warn", target);
      this.pipe(target);
      if (transport.handleExceptions) {
        this.exceptions.handle();
      }
      if (transport.handleRejections) {
        this.rejections.handle();
      }
      return this;
    }
    remove(transport) {
      if (!transport)
        return this;
      let target = transport;
      if (!isStream(transport) || transport.log.length > 2) {
        target = this.transports.filter((match) => match.transport === transport)[0];
      }
      if (target) {
        this.unpipe(target);
      }
      return this;
    }
    clear() {
      this.unpipe();
      return this;
    }
    close() {
      this.exceptions.unhandle();
      this.rejections.unhandle();
      this.clear();
      this.emit("close");
      return this;
    }
    setLevels() {
      warn.deprecated("setLevels");
    }
    query(options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = options || {};
      const results = {};
      const queryObject = Object.assign({}, options.query || {});
      function queryTransport(transport, next) {
        if (options.query && typeof transport.formatQuery === "function") {
          options.query = transport.formatQuery(queryObject);
        }
        transport.query(options, (err, res) => {
          if (err) {
            return next(err);
          }
          if (typeof transport.formatResults === "function") {
            res = transport.formatResults(res, options.format);
          }
          next(null, res);
        });
      }
      function addResults(transport, next) {
        queryTransport(transport, (err, result) => {
          if (next) {
            result = err || result;
            if (result) {
              results[transport.name] = result;
            }
            next();
          }
          next = null;
        });
      }
      asyncForEach(this.transports.filter((transport) => !!transport.query), addResults, () => callback(null, results));
    }
    stream(options = {}) {
      const out = new Stream;
      const streams = [];
      out._streams = streams;
      out.destroy = () => {
        let i = streams.length;
        while (i--) {
          streams[i].destroy();
        }
      };
      this.transports.filter((transport) => !!transport.stream).forEach((transport) => {
        const str = transport.stream(options);
        if (!str) {
          return;
        }
        streams.push(str);
        str.on("log", (log) => {
          log.transport = log.transport || [];
          log.transport.push(transport.name);
          out.emit("log", log);
        });
        str.on("error", (err) => {
          err.transport = err.transport || [];
          err.transport.push(transport.name);
          out.emit("error", err);
        });
      });
      return out;
    }
    startTimer() {
      return new Profiler(this);
    }
    profile(id, ...args) {
      const time = Date.now();
      if (this.profilers[id]) {
        const timeEnd = this.profilers[id];
        delete this.profilers[id];
        if (typeof args[args.length - 2] === "function") {
          console.warn("Callback function no longer supported as of winston@3.0.0");
          args.pop();
        }
        const info = typeof args[args.length - 1] === "object" ? args.pop() : {};
        info.level = info.level || "info";
        info.durationMs = time - timeEnd;
        info.message = info.message || id;
        return this.write(info);
      }
      this.profilers[id] = time;
      return this;
    }
    handleExceptions(...args) {
      console.warn("Deprecated: .handleExceptions() will be removed in winston@4. Use .exceptions.handle()");
      this.exceptions.handle(...args);
    }
    unhandleExceptions(...args) {
      console.warn("Deprecated: .unhandleExceptions() will be removed in winston@4. Use .exceptions.unhandle()");
      this.exceptions.unhandle(...args);
    }
    cli() {
      throw new Error([
        "Logger.cli() was removed in winston@3.0.0",
        "Use a custom winston.formats.cli() instead.",
        "See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md"
      ].join("\n"));
    }
    _onEvent(event, transport) {
      function transportEvent(err) {
        if (event === "error" && !this.transports.includes(transport)) {
          this.add(transport);
        }
        this.emit(event, err, transport);
      }
      if (!transport["__winston" + event]) {
        transport["__winston" + event] = transportEvent.bind(this);
        transport.on(event, transport["__winston" + event]);
      }
    }
    _addDefaultMeta(msg) {
      if (this.defaultMeta) {
        Object.assign(msg, this.defaultMeta);
      }
    }
  }
  Object.defineProperty(Logger.prototype, "transports", {
    configurable: false,
    enumerable: true,
    get() {
      const { pipes } = this._readableState;
      return !Array.isArray(pipes) ? [pipes].filter(Boolean) : pipes;
    }
  });
  module.exports = Logger;
});

// node_modules/winston/lib/winston/create-logger.js
var require_create_logger = __commonJS((exports, module) => {
  function isLevelEnabledFunctionName(level) {
    return "is" + level.charAt(0).toUpperCase() + level.slice(1) + "Enabled";
  }
  var { LEVEL } = require_triple_beam();
  var config = require_config2();
  var Logger = require_logger();
  var debug = require_node2()("winston:create-logger");
  module.exports = function(opts = {}) {
    opts.levels = opts.levels || config.npm.levels;

    class DerivedLogger extends Logger {
      constructor(options) {
        super(options);
      }
    }
    const logger = new DerivedLogger(opts);
    Object.keys(opts.levels).forEach(function(level) {
      debug('Define prototype method for "%s"', level);
      if (level === "log") {
        console.warn('Level "log" not defined: conflicts with the method "log". Use a different level name.');
        return;
      }
      DerivedLogger.prototype[level] = function(...args) {
        const self2 = this || logger;
        if (args.length === 1) {
          const [msg] = args;
          const info = msg && msg.message && msg || { message: msg };
          info.level = info[LEVEL] = level;
          self2._addDefaultMeta(info);
          self2.write(info);
          return this || logger;
        }
        if (args.length === 0) {
          self2.log(level, "");
          return self2;
        }
        return self2.log(level, ...args);
      };
      DerivedLogger.prototype[isLevelEnabledFunctionName(level)] = function() {
        return (this || logger).isLevelEnabled(level);
      };
    });
    return logger;
  };
});

// node_modules/winston/lib/winston/container.js
var require_container = __commonJS((exports, module) => {
  var createLogger = require_create_logger();
  module.exports = class Container {
    constructor(options = {}) {
      this.loggers = new Map;
      this.options = options;
    }
    add(id, options) {
      if (!this.loggers.has(id)) {
        options = Object.assign({}, options || this.options);
        const existing = options.transports || this.options.transports;
        if (existing) {
          options.transports = Array.isArray(existing) ? existing.slice() : [existing];
        } else {
          options.transports = [];
        }
        const logger = createLogger(options);
        logger.on("close", () => this._delete(id));
        this.loggers.set(id, logger);
      }
      return this.loggers.get(id);
    }
    get(id, options) {
      return this.add(id, options);
    }
    has(id) {
      return !!this.loggers.has(id);
    }
    close(id) {
      if (id) {
        return this._removeLogger(id);
      }
      this.loggers.forEach((val, key) => this._removeLogger(key));
    }
    _removeLogger(id) {
      if (!this.loggers.has(id)) {
        return;
      }
      const logger = this.loggers.get(id);
      logger.close();
      this._delete(id);
    }
    _delete(id) {
      this.loggers.delete(id);
    }
  };
});

// node_modules/winston/lib/winston.js
var require_winston = __commonJS((exports) => {
  var logform = require_logform();
  var { warn } = require_common();
  exports.version = require_package2().version;
  exports.transports = require_transports();
  exports.config = require_config2();
  exports.addColors = logform.levels;
  exports.format = logform.format;
  exports.createLogger = require_create_logger();
  exports.Logger = require_logger();
  exports.ExceptionHandler = require_exception_handler();
  exports.RejectionHandler = require_rejection_handler();
  exports.Container = require_container();
  exports.Transport = require_winston_transport();
  exports.loggers = new exports.Container;
  var defaultLogger = exports.createLogger();
  Object.keys(exports.config.npm.levels).concat([
    "log",
    "query",
    "stream",
    "add",
    "remove",
    "clear",
    "profile",
    "startTimer",
    "handleExceptions",
    "unhandleExceptions",
    "handleRejections",
    "unhandleRejections",
    "configure",
    "child"
  ]).forEach((method) => exports[method] = (...args) => defaultLogger[method](...args));
  Object.defineProperty(exports, "level", {
    get() {
      return defaultLogger.level;
    },
    set(val) {
      defaultLogger.level = val;
    }
  });
  Object.defineProperty(exports, "exceptions", {
    get() {
      return defaultLogger.exceptions;
    }
  });
  Object.defineProperty(exports, "rejections", {
    get() {
      return defaultLogger.rejections;
    }
  });
  ["exitOnError"].forEach((prop) => {
    Object.defineProperty(exports, prop, {
      get() {
        return defaultLogger[prop];
      },
      set(val) {
        defaultLogger[prop] = val;
      }
    });
  });
  Object.defineProperty(exports, "default", {
    get() {
      return {
        exceptionHandlers: defaultLogger.exceptionHandlers,
        rejectionHandlers: defaultLogger.rejectionHandlers,
        transports: defaultLogger.transports
      };
    }
  });
  warn.deprecated(exports, "setLevels");
  warn.forFunctions(exports, "useFormat", ["cli"]);
  warn.forProperties(exports, "useFormat", ["padLevels", "stripColors"]);
  warn.forFunctions(exports, "deprecated", [
    "addRewriter",
    "addFilter",
    "clone",
    "extend"
  ]);
  warn.forProperties(exports, "deprecated", ["emitErrs", "levelLength"]);
});

// node_modules/requires-port/index.js
var require_requires_port = __commonJS((exports, module) => {
  module.exports = function required(port, protocol) {
    protocol = protocol.split(":")[0];
    port = +port;
    if (!port)
      return false;
    switch (protocol) {
      case "http":
      case "ws":
        return port !== 80;
      case "https":
      case "wss":
        return port !== 443;
      case "ftp":
        return port !== 21;
      case "gopher":
        return port !== 70;
      case "file":
        return false;
    }
    return port !== 0;
  };
});

// node_modules/querystringify/index.js
var require_querystringify = __commonJS((exports) => {
  function decode(input) {
    try {
      return decodeURIComponent(input.replace(/\+/g, " "));
    } catch (e) {
      return null;
    }
  }
  function encode(input) {
    try {
      return encodeURIComponent(input);
    } catch (e) {
      return null;
    }
  }
  function querystring(query) {
    var parser = /([^=?#&]+)=?([^&]*)/g, result = {}, part;
    while (part = parser.exec(query)) {
      var key = decode(part[1]), value = decode(part[2]);
      if (key === null || value === null || key in result)
        continue;
      result[key] = value;
    }
    return result;
  }
  function querystringify(obj, prefix) {
    prefix = prefix || "";
    var pairs = [], value, key;
    if (typeof prefix !== "string")
      prefix = "?";
    for (key in obj) {
      if (has.call(obj, key)) {
        value = obj[key];
        if (!value && (value === null || value === undef || isNaN(value))) {
          value = "";
        }
        key = encode(key);
        value = encode(value);
        if (key === null || value === null)
          continue;
        pairs.push(key + "=" + value);
      }
    }
    return pairs.length ? prefix + pairs.join("&") : "";
  }
  var has = Object.prototype.hasOwnProperty;
  var undef;
  exports.stringify = querystringify;
  exports.parse = querystring;
});

// node_modules/url-parse/index.js
var require_url_parse = __commonJS((exports, module) => {
  function trimLeft(str) {
    return (str ? str : "").toString().replace(controlOrWhitespace, "");
  }
  function lolcation(loc) {
    var globalVar;
    if (typeof window !== "undefined")
      globalVar = window;
    else if (typeof global !== "undefined")
      globalVar = global;
    else if (typeof self !== "undefined")
      globalVar = self;
    else
      globalVar = {};
    var location = globalVar.location || {};
    loc = loc || location;
    var finaldestination = {}, type = typeof loc, key;
    if (loc.protocol === "blob:") {
      finaldestination = new Url(unescape(loc.pathname), {});
    } else if (type === "string") {
      finaldestination = new Url(loc, {});
      for (key in ignore)
        delete finaldestination[key];
    } else if (type === "object") {
      for (key in loc) {
        if (key in ignore)
          continue;
        finaldestination[key] = loc[key];
      }
      if (finaldestination.slashes === undefined) {
        finaldestination.slashes = slashes.test(loc.href);
      }
    }
    return finaldestination;
  }
  function isSpecial(scheme) {
    return scheme === "file:" || scheme === "ftp:" || scheme === "http:" || scheme === "https:" || scheme === "ws:" || scheme === "wss:";
  }
  function extractProtocol(address, location) {
    address = trimLeft(address);
    address = address.replace(CRHTLF, "");
    location = location || {};
    var match = protocolre.exec(address);
    var protocol = match[1] ? match[1].toLowerCase() : "";
    var forwardSlashes = !!match[2];
    var otherSlashes = !!match[3];
    var slashesCount = 0;
    var rest;
    if (forwardSlashes) {
      if (otherSlashes) {
        rest = match[2] + match[3] + match[4];
        slashesCount = match[2].length + match[3].length;
      } else {
        rest = match[2] + match[4];
        slashesCount = match[2].length;
      }
    } else {
      if (otherSlashes) {
        rest = match[3] + match[4];
        slashesCount = match[3].length;
      } else {
        rest = match[4];
      }
    }
    if (protocol === "file:") {
      if (slashesCount >= 2) {
        rest = rest.slice(2);
      }
    } else if (isSpecial(protocol)) {
      rest = match[4];
    } else if (protocol) {
      if (forwardSlashes) {
        rest = rest.slice(2);
      }
    } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
      rest = match[4];
    }
    return {
      protocol,
      slashes: forwardSlashes || isSpecial(protocol),
      slashesCount,
      rest
    };
  }
  function resolve(relative, base) {
    if (relative === "")
      return base;
    var path = (base || "/").split("/").slice(0, -1).concat(relative.split("/")), i = path.length, last = path[i - 1], unshift = false, up = 0;
    while (i--) {
      if (path[i] === ".") {
        path.splice(i, 1);
      } else if (path[i] === "..") {
        path.splice(i, 1);
        up++;
      } else if (up) {
        if (i === 0)
          unshift = true;
        path.splice(i, 1);
        up--;
      }
    }
    if (unshift)
      path.unshift("");
    if (last === "." || last === "..")
      path.push("");
    return path.join("/");
  }
  function Url(address, location, parser) {
    address = trimLeft(address);
    address = address.replace(CRHTLF, "");
    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }
    var relative, extracted, parse2, instruction, index, key, instructions = rules.slice(), type = typeof location, url = this, i = 0;
    if (type !== "object" && type !== "string") {
      parser = location;
      location = null;
    }
    if (parser && typeof parser !== "function")
      parser = qs.parse;
    location = lolcation(location);
    extracted = extractProtocol(address || "", location);
    relative = !extracted.protocol && !extracted.slashes;
    url.slashes = extracted.slashes || relative && location.slashes;
    url.protocol = extracted.protocol || location.protocol || "";
    address = extracted.rest;
    if (extracted.protocol === "file:" && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
      instructions[3] = [/(.*)/, "pathname"];
    }
    for (;i < instructions.length; i++) {
      instruction = instructions[i];
      if (typeof instruction === "function") {
        address = instruction(address, url);
        continue;
      }
      parse2 = instruction[0];
      key = instruction[1];
      if (parse2 !== parse2) {
        url[key] = address;
      } else if (typeof parse2 === "string") {
        index = parse2 === "@" ? address.lastIndexOf(parse2) : address.indexOf(parse2);
        if (~index) {
          if (typeof instruction[2] === "number") {
            url[key] = address.slice(0, index);
            address = address.slice(index + instruction[2]);
          } else {
            url[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else if (index = parse2.exec(address)) {
        url[key] = index[1];
        address = address.slice(0, index.index);
      }
      url[key] = url[key] || (relative && instruction[3] ? location[key] || "" : "");
      if (instruction[4])
        url[key] = url[key].toLowerCase();
    }
    if (parser)
      url.query = parser(url.query);
    if (relative && location.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location.pathname !== "")) {
      url.pathname = resolve(url.pathname, location.pathname);
    }
    if (url.pathname.charAt(0) !== "/" && isSpecial(url.protocol)) {
      url.pathname = "/" + url.pathname;
    }
    if (!required(url.port, url.protocol)) {
      url.host = url.hostname;
      url.port = "";
    }
    url.username = url.password = "";
    if (url.auth) {
      index = url.auth.indexOf(":");
      if (~index) {
        url.username = url.auth.slice(0, index);
        url.username = encodeURIComponent(decodeURIComponent(url.username));
        url.password = url.auth.slice(index + 1);
        url.password = encodeURIComponent(decodeURIComponent(url.password));
      } else {
        url.username = encodeURIComponent(decodeURIComponent(url.auth));
      }
      url.auth = url.password ? url.username + ":" + url.password : url.username;
    }
    url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
    url.href = url.toString();
  }
  function set(part, value, fn) {
    var url = this;
    switch (part) {
      case "query":
        if (typeof value === "string" && value.length) {
          value = (fn || qs.parse)(value);
        }
        url[part] = value;
        break;
      case "port":
        url[part] = value;
        if (!required(value, url.protocol)) {
          url.host = url.hostname;
          url[part] = "";
        } else if (value) {
          url.host = url.hostname + ":" + value;
        }
        break;
      case "hostname":
        url[part] = value;
        if (url.port)
          value += ":" + url.port;
        url.host = value;
        break;
      case "host":
        url[part] = value;
        if (port.test(value)) {
          value = value.split(":");
          url.port = value.pop();
          url.hostname = value.join(":");
        } else {
          url.hostname = value;
          url.port = "";
        }
        break;
      case "protocol":
        url.protocol = value.toLowerCase();
        url.slashes = !fn;
        break;
      case "pathname":
      case "hash":
        if (value) {
          var char = part === "pathname" ? "/" : "#";
          url[part] = value.charAt(0) !== char ? char + value : value;
        } else {
          url[part] = value;
        }
        break;
      case "username":
      case "password":
        url[part] = encodeURIComponent(value);
        break;
      case "auth":
        var index = value.indexOf(":");
        if (~index) {
          url.username = value.slice(0, index);
          url.username = encodeURIComponent(decodeURIComponent(url.username));
          url.password = value.slice(index + 1);
          url.password = encodeURIComponent(decodeURIComponent(url.password));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(value));
        }
    }
    for (var i = 0;i < rules.length; i++) {
      var ins = rules[i];
      if (ins[4])
        url[ins[1]] = url[ins[1]].toLowerCase();
    }
    url.auth = url.password ? url.username + ":" + url.password : url.username;
    url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
    url.href = url.toString();
    return url;
  }
  function toString(stringify) {
    if (!stringify || typeof stringify !== "function")
      stringify = qs.stringify;
    var query, url = this, host = url.host, protocol = url.protocol;
    if (protocol && protocol.charAt(protocol.length - 1) !== ":")
      protocol += ":";
    var result = protocol + (url.protocol && url.slashes || isSpecial(url.protocol) ? "//" : "");
    if (url.username) {
      result += url.username;
      if (url.password)
        result += ":" + url.password;
      result += "@";
    } else if (url.password) {
      result += ":" + url.password;
      result += "@";
    } else if (url.protocol !== "file:" && isSpecial(url.protocol) && !host && url.pathname !== "/") {
      result += "@";
    }
    if (host[host.length - 1] === ":" || port.test(url.hostname) && !url.port) {
      host += ":";
    }
    result += host + url.pathname;
    query = typeof url.query === "object" ? stringify(url.query) : url.query;
    if (query)
      result += query.charAt(0) !== "?" ? "?" + query : query;
    if (url.hash)
      result += url.hash;
    return result;
  }
  var required = require_requires_port();
  var qs = require_querystringify();
  var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
  var CRHTLF = /[\n\r\t]/g;
  var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
  var port = /:\d+$/;
  var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i;
  var windowsDriveLetter = /^[a-zA-Z]:/;
  var rules = [
    ["#", "hash"],
    ["?", "query"],
    function sanitize(address, url) {
      return isSpecial(url.protocol) ? address.replace(/\\/g, "/") : address;
    },
    ["/", "pathname"],
    ["@", "auth", 1],
    [NaN, "host", undefined, 1, 1],
    [/:(\d*)$/, "port", undefined, 1],
    [NaN, "hostname", undefined, 1, 1]
  ];
  var ignore = { hash: 1, query: 1 };
  Url.prototype = { set, toString };
  Url.extractProtocol = extractProtocol;
  Url.location = lolcation;
  Url.trimLeft = trimLeft;
  Url.qs = qs;
  module.exports = Url;
});

// node_modules/buffer-more-ints/buffer-more-ints.js
var require_buffer_more_ints = __commonJS((exports, module) => {
  function isContiguousInt(val) {
    return val <= MAX_INT && val >= -MAX_INT;
  }
  function assertContiguousInt(val) {
    if (!isContiguousInt(val)) {
      throw new TypeError("number cannot be represented as a contiguous integer");
    }
  }
  function check_value(val, min, max) {
    val = +val;
    if (typeof val != "number" || val < min || val > max || Math.floor(val) !== val) {
      throw new TypeError("\"value\" argument is out of bounds");
    }
    return val;
  }
  function check_bounds(buf, offset, len) {
    if (offset < 0 || offset + len > buf.length) {
      throw new RangeError("Index out of range");
    }
  }
  function readUInt24BE(buf, offset) {
    return buf.readUInt8(offset) << 16 | buf.readUInt16BE(offset + 1);
  }
  function writeUInt24BE(buf, val, offset) {
    val = check_value(val, 0, 16777215);
    check_bounds(buf, offset, 3);
    buf.writeUInt8(val >>> 16, offset);
    buf.writeUInt16BE(val & 65535, offset + 1);
  }
  function readUInt40BE(buf, offset) {
    return (buf.readUInt8(offset) || 0) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 1);
  }
  function writeUInt40BE(buf, val, offset) {
    val = check_value(val, 0, 1099511627775);
    check_bounds(buf, offset, 5);
    buf.writeUInt8(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 1);
  }
  function readUInt48BE(buf, offset) {
    return buf.readUInt16BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 2);
  }
  function writeUInt48BE(buf, val, offset) {
    val = check_value(val, 0, 281474976710655);
    check_bounds(buf, offset, 6);
    buf.writeUInt16BE(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 2);
  }
  function readUInt56BE(buf, offset) {
    return ((buf.readUInt8(offset) || 0) << 16 | buf.readUInt16BE(offset + 1)) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 3);
  }
  function writeUInt56BE(buf, val, offset) {
    val = check_value(val, 0, 72057594037927940);
    check_bounds(buf, offset, 7);
    if (val < 72057594037927940) {
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeUInt8(hi >>> 16, offset);
      buf.writeUInt16BE(hi & 65535, offset + 1);
      buf.writeInt32BE(val & -1, offset + 3);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
    }
  }
  function readUInt64BE(buf, offset) {
    return buf.readUInt32BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 4);
  }
  function writeUInt64BE(buf, val, offset) {
    val = check_value(val, 0, 18446744073709552000);
    check_bounds(buf, offset, 8);
    if (val < 18446744073709552000) {
      buf.writeUInt32BE(Math.floor(val * SHIFT_RIGHT_32), offset);
      buf.writeInt32BE(val & -1, offset + 4);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 255;
    }
  }
  function readUInt24LE(buf, offset) {
    return buf.readUInt8(offset + 2) << 16 | buf.readUInt16LE(offset);
  }
  function writeUInt24LE(buf, val, offset) {
    val = check_value(val, 0, 16777215);
    check_bounds(buf, offset, 3);
    buf.writeUInt16LE(val & 65535, offset);
    buf.writeUInt8(val >>> 16, offset + 2);
  }
  function readUInt40LE(buf, offset) {
    return (buf.readUInt8(offset + 4) || 0) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeUInt40LE(buf, val, offset) {
    val = check_value(val, 0, 1099511627775);
    check_bounds(buf, offset, 5);
    buf.writeInt32LE(val & -1, offset);
    buf.writeUInt8(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  function readUInt48LE(buf, offset) {
    return buf.readUInt16LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeUInt48LE(buf, val, offset) {
    val = check_value(val, 0, 281474976710655);
    check_bounds(buf, offset, 6);
    buf.writeInt32LE(val & -1, offset);
    buf.writeUInt16LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  function readUInt56LE(buf, offset) {
    return ((buf.readUInt8(offset + 6) || 0) << 16 | buf.readUInt16LE(offset + 4)) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeUInt56LE(buf, val, offset) {
    val = check_value(val, 0, 72057594037927940);
    check_bounds(buf, offset, 7);
    if (val < 72057594037927940) {
      buf.writeInt32LE(val & -1, offset);
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeUInt16LE(hi & 65535, offset + 4);
      buf.writeUInt8(hi >>> 16, offset + 6);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
    }
  }
  function readUInt64LE(buf, offset) {
    return buf.readUInt32LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeUInt64LE(buf, val, offset) {
    val = check_value(val, 0, 18446744073709552000);
    check_bounds(buf, offset, 8);
    if (val < 18446744073709552000) {
      buf.writeInt32LE(val & -1, offset);
      buf.writeUInt32LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 255;
    }
  }
  function readInt24BE(buf, offset) {
    return (buf.readInt8(offset) << 16) + buf.readUInt16BE(offset + 1);
  }
  function writeInt24BE(buf, val, offset) {
    val = check_value(val, -8388608, 8388607);
    check_bounds(buf, offset, 3);
    buf.writeInt8(val >> 16, offset);
    buf.writeUInt16BE(val & 65535, offset + 1);
  }
  function readInt40BE(buf, offset) {
    return (buf.readInt8(offset) || 0) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 1);
  }
  function writeInt40BE(buf, val, offset) {
    val = check_value(val, -549755813888, 549755813887);
    check_bounds(buf, offset, 5);
    buf.writeInt8(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 1);
  }
  function readInt48BE(buf, offset) {
    return buf.readInt16BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 2);
  }
  function writeInt48BE(buf, val, offset) {
    val = check_value(val, -140737488355328, 140737488355327);
    check_bounds(buf, offset, 6);
    buf.writeInt16BE(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 2);
  }
  function readInt56BE(buf, offset) {
    return (((buf.readInt8(offset) || 0) << 16) + buf.readUInt16BE(offset + 1)) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 3);
  }
  function writeInt56BE(buf, val, offset) {
    val = check_value(val, -576460752303423500, 36028797018963970);
    check_bounds(buf, offset, 7);
    if (val < 36028797018963970) {
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeInt8(hi >> 16, offset);
      buf.writeUInt16BE(hi & 65535, offset + 1);
      buf.writeInt32BE(val & -1, offset + 3);
    } else {
      buf[offset] = 127;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
    }
  }
  function readInt64BE(buf, offset) {
    return buf.readInt32BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 4);
  }
  function writeInt64BE(buf, val, offset) {
    val = check_value(val, -2361183241434822600000, 9223372036854776000);
    check_bounds(buf, offset, 8);
    if (val < 9223372036854776000) {
      buf.writeInt32BE(Math.floor(val * SHIFT_RIGHT_32), offset);
      buf.writeInt32BE(val & -1, offset + 4);
    } else {
      buf[offset] = 127;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 255;
    }
  }
  function readInt24LE(buf, offset) {
    return (buf.readInt8(offset + 2) << 16) + buf.readUInt16LE(offset);
  }
  function writeInt24LE(buf, val, offset) {
    val = check_value(val, -8388608, 8388607);
    check_bounds(buf, offset, 3);
    buf.writeUInt16LE(val & 65535, offset);
    buf.writeInt8(val >> 16, offset + 2);
  }
  function readInt40LE(buf, offset) {
    return (buf.readInt8(offset + 4) || 0) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeInt40LE(buf, val, offset) {
    val = check_value(val, -549755813888, 549755813887);
    check_bounds(buf, offset, 5);
    buf.writeInt32LE(val & -1, offset);
    buf.writeInt8(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  function readInt48LE(buf, offset) {
    return buf.readInt16LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeInt48LE(buf, val, offset) {
    val = check_value(val, -140737488355328, 140737488355327);
    check_bounds(buf, offset, 6);
    buf.writeInt32LE(val & -1, offset);
    buf.writeInt16LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  function readInt56LE(buf, offset) {
    return (((buf.readInt8(offset + 6) || 0) << 16) + buf.readUInt16LE(offset + 4)) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeInt56LE(buf, val, offset) {
    val = check_value(val, -36028797018963970, 36028797018963970);
    check_bounds(buf, offset, 7);
    if (val < 36028797018963970) {
      buf.writeInt32LE(val & -1, offset);
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeUInt16LE(hi & 65535, offset + 4);
      buf.writeInt8(hi >> 16, offset + 6);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 127;
    }
  }
  function readInt64LE(buf, offset) {
    return buf.readInt32LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  function writeInt64LE(buf, val, offset) {
    val = check_value(val, -9223372036854776000, 9223372036854776000);
    check_bounds(buf, offset, 8);
    if (val < 9223372036854776000) {
      buf.writeInt32LE(val & -1, offset);
      buf.writeInt32LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 127;
    }
  }
  var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
  var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
  var MAX_INT = 9007199254740991;
  exports.isContiguousInt = isContiguousInt;
  exports.assertContiguousInt = assertContiguousInt;
  ["UInt", "Int"].forEach(function(sign) {
    var suffix = sign + "8";
    exports["read" + suffix] = Buffer.prototype["read" + suffix].call;
    exports["write" + suffix] = Buffer.prototype["write" + suffix].call;
    ["16", "32"].forEach(function(size) {
      ["LE", "BE"].forEach(function(endian) {
        var suffix2 = sign + size + endian;
        var read = Buffer.prototype["read" + suffix2];
        exports["read" + suffix2] = function(buf, offset) {
          return read.call(buf, offset);
        };
        var write = Buffer.prototype["write" + suffix2];
        exports["write" + suffix2] = function(buf, val, offset) {
          return write.call(buf, val, offset);
        };
      });
    });
  });
  exports.readUInt24BE = readUInt24BE;
  exports.writeUInt24BE = writeUInt24BE;
  exports.readUInt40BE = readUInt40BE;
  exports.writeUInt40BE = writeUInt40BE;
  exports.readUInt48BE = readUInt48BE;
  exports.writeUInt48BE = writeUInt48BE;
  exports.readUInt56BE = readUInt56BE;
  exports.writeUInt56BE = writeUInt56BE;
  exports.readUInt64BE = readUInt64BE;
  exports.writeUInt64BE = writeUInt64BE;
  exports.readUInt24LE = readUInt24LE;
  exports.writeUInt24LE = writeUInt24LE;
  exports.readUInt40LE = readUInt40LE;
  exports.writeUInt40LE = writeUInt40LE;
  exports.readUInt48LE = readUInt48LE;
  exports.writeUInt48LE = writeUInt48LE;
  exports.readUInt56LE = readUInt56LE;
  exports.writeUInt56LE = writeUInt56LE;
  exports.readUInt64LE = readUInt64LE;
  exports.writeUInt64LE = writeUInt64LE;
  exports.readInt24BE = readInt24BE;
  exports.writeInt24BE = writeInt24BE;
  exports.readInt40BE = readInt40BE;
  exports.writeInt40BE = writeInt40BE;
  exports.readInt48BE = readInt48BE;
  exports.writeInt48BE = writeInt48BE;
  exports.readInt56BE = readInt56BE;
  exports.writeInt56BE = writeInt56BE;
  exports.readInt64BE = readInt64BE;
  exports.writeInt64BE = writeInt64BE;
  exports.readInt24LE = readInt24LE;
  exports.writeInt24LE = writeInt24LE;
  exports.readInt40LE = readInt40LE;
  exports.writeInt40LE = writeInt40LE;
  exports.readInt48LE = readInt48LE;
  exports.writeInt48LE = writeInt48LE;
  exports.readInt56LE = readInt56LE;
  exports.writeInt56LE = writeInt56LE;
  exports.readInt64LE = readInt64LE;
  exports.writeInt64LE = writeInt64LE;
});

// node_modules/amqplib/lib/codec.js
var require_codec = __commonJS((exports, module) => {
  function isFloatingPoint(n) {
    return n >= 9223372036854776000 || Math.abs(n) < 1125899906842624 && Math.floor(n) !== n;
  }
  function encodeTable(buffer, val, offset) {
    var start = offset;
    offset += 4;
    for (var key in val) {
      if (val[key] !== undefined) {
        var len = Buffer.byteLength(key);
        buffer.writeUInt8(len, offset);
        offset++;
        buffer.write(key, offset, "utf8");
        offset += len;
        offset += encodeFieldValue(buffer, val[key], offset);
      }
    }
    var size = offset - start;
    buffer.writeUInt32BE(size - 4, start);
    return size;
  }
  function encodeArray(buffer, val, offset) {
    var start = offset;
    offset += 4;
    for (var i = 0, num = val.length;i < num; i++) {
      offset += encodeFieldValue(buffer, val[i], offset);
    }
    var size = offset - start;
    buffer.writeUInt32BE(size - 4, start);
    return size;
  }
  function encodeFieldValue(buffer, value, offset) {
    var start = offset;
    var type = typeof value, val = value;
    if (value && type === "object" && value.hasOwnProperty("!")) {
      val = value.value;
      type = value["!"];
    }
    if (type == "number") {
      if (isFloatingPoint(val)) {
        type = "double";
      } else {
        if (val < 128 && val >= -128) {
          type = "byte";
        } else if (val >= -32768 && val < 32768) {
          type = "short";
        } else if (val >= -2147483648 && val < 2147483648) {
          type = "int";
        } else {
          type = "long";
        }
      }
    }
    function tag(t) {
      buffer.write(t, offset);
      offset++;
    }
    switch (type) {
      case "string":
        var len = Buffer.byteLength(val, "utf8");
        tag("S");
        buffer.writeUInt32BE(len, offset);
        offset += 4;
        buffer.write(val, offset, "utf8");
        offset += len;
        break;
      case "object":
        if (val === null) {
          tag("V");
        } else if (Array.isArray(val)) {
          tag("A");
          offset += encodeArray(buffer, val, offset);
        } else if (Buffer.isBuffer(val)) {
          tag("x");
          buffer.writeUInt32BE(val.length, offset);
          offset += 4;
          val.copy(buffer, offset);
          offset += val.length;
        } else {
          tag("F");
          offset += encodeTable(buffer, val, offset);
        }
        break;
      case "boolean":
        tag("t");
        buffer.writeUInt8(val ? 1 : 0, offset);
        offset++;
        break;
      case "double":
      case "float64":
        tag("d");
        buffer.writeDoubleBE(val, offset);
        offset += 8;
        break;
      case "byte":
      case "int8":
        tag("b");
        buffer.writeInt8(val, offset);
        offset++;
        break;
      case "unsignedbyte":
      case "uint8":
        tag("B");
        buffer.writeUInt8(val, offset);
        offset++;
        break;
      case "short":
      case "int16":
        tag("s");
        buffer.writeInt16BE(val, offset);
        offset += 2;
        break;
      case "unsignedshort":
      case "uint16":
        tag("u");
        buffer.writeUInt16BE(val, offset);
        offset += 2;
        break;
      case "int":
      case "int32":
        tag("I");
        buffer.writeInt32BE(val, offset);
        offset += 4;
        break;
      case "unsignedint":
      case "uint32":
        tag("i");
        buffer.writeUInt32BE(val, offset);
        offset += 4;
        break;
      case "long":
      case "int64":
        tag("l");
        ints.writeInt64BE(buffer, val, offset);
        offset += 8;
        break;
      case "timestamp":
        tag("T");
        ints.writeUInt64BE(buffer, val, offset);
        offset += 8;
        break;
      case "float":
        tag("f");
        buffer.writeFloatBE(val, offset);
        offset += 4;
        break;
      case "decimal":
        tag("D");
        if (val.hasOwnProperty("places") && val.hasOwnProperty("digits") && val.places >= 0 && val.places < 256) {
          buffer[offset] = val.places;
          offset++;
          buffer.writeUInt32BE(val.digits, offset);
          offset += 4;
        } else
          throw new TypeError("Decimal value must be {'places': 0..255, 'digits': uint32}, " + "got " + JSON.stringify(val));
        break;
      default:
        throw new TypeError("Unknown type to encode: " + type);
    }
    return offset - start;
  }
  function decodeFields(slice) {
    var fields = {}, offset = 0, size = slice.length;
    var len, key, val;
    function decodeFieldValue() {
      var tag = String.fromCharCode(slice[offset]);
      offset++;
      switch (tag) {
        case "b":
          val = slice.readInt8(offset);
          offset++;
          break;
        case "B":
          val = slice.readUInt8(offset);
          offset++;
          break;
        case "S":
          len = slice.readUInt32BE(offset);
          offset += 4;
          val = slice.toString("utf8", offset, offset + len);
          offset += len;
          break;
        case "I":
          val = slice.readInt32BE(offset);
          offset += 4;
          break;
        case "i":
          val = slice.readUInt32BE(offset);
          offset += 4;
          break;
        case "D":
          var places = slice[offset];
          offset++;
          var digits = slice.readUInt32BE(offset);
          offset += 4;
          val = { "!": "decimal", value: { places, digits } };
          break;
        case "T":
          val = ints.readUInt64BE(slice, offset);
          offset += 8;
          val = { "!": "timestamp", value: val };
          break;
        case "F":
          len = slice.readUInt32BE(offset);
          offset += 4;
          val = decodeFields(slice.subarray(offset, offset + len));
          offset += len;
          break;
        case "A":
          len = slice.readUInt32BE(offset);
          offset += 4;
          decodeArray(offset + len);
          break;
        case "d":
          val = slice.readDoubleBE(offset);
          offset += 8;
          break;
        case "f":
          val = slice.readFloatBE(offset);
          offset += 4;
          break;
        case "l":
          val = ints.readInt64BE(slice, offset);
          offset += 8;
          break;
        case "s":
          val = slice.readInt16BE(offset);
          offset += 2;
          break;
        case "u":
          val = slice.readUInt16BE(offset);
          offset += 2;
          break;
        case "t":
          val = slice[offset] != 0;
          offset++;
          break;
        case "V":
          val = null;
          break;
        case "x":
          len = slice.readUInt32BE(offset);
          offset += 4;
          val = slice.subarray(offset, offset + len);
          offset += len;
          break;
        default:
          throw new TypeError('Unexpected type tag "' + tag + '"');
      }
    }
    function decodeArray(until) {
      var vals = [];
      while (offset < until) {
        decodeFieldValue();
        vals.push(val);
      }
      val = vals;
    }
    while (offset < size) {
      len = slice.readUInt8(offset);
      offset++;
      key = slice.toString("utf8", offset, offset + len);
      offset += len;
      decodeFieldValue();
      fields[key] = val;
    }
    return fields;
  }
  var ints = require_buffer_more_ints();
  exports.encodeTable = encodeTable;
  exports.decodeFields = decodeFields;
});

// node_modules/amqplib/lib/defs.js
var require_defs = __commonJS((exports, module) => {
  function decodeBasicQos(buffer) {
    var val, offset = 0, fields = {
      prefetchSize: undefined,
      prefetchCount: undefined,
      global: undefined
    };
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.prefetchSize = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.prefetchCount = val;
    val = !!(1 & buffer[offset]);
    fields.global = val;
    return fields;
  }
  function encodeBasicQos(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(19);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932170, 7);
    offset = 11;
    val = fields.prefetchSize;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'prefetchSize' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.prefetchCount;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'prefetchCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.global;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicQosOk(buffer) {
    return {};
  }
  function encodeBasicQosOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932171, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicConsume(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      consumerTag: undefined,
      noLocal: undefined,
      noAck: undefined,
      exclusive: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    val = !!(1 & buffer[offset]);
    fields.noLocal = val;
    val = !!(2 & buffer[offset]);
    fields.noAck = val;
    val = !!(4 & buffer[offset]);
    fields.exclusive = val;
    val = !!(8 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeBasicConsume(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.consumerTag;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932180, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.consumerTag;
    val === undefined && (val = "");
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    val = fields.noLocal;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.noAck;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.exclusive;
    val === undefined && (val = false);
    val && (bits += 4);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 8);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicConsumeOk(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    return fields;
  }
  function encodeBasicConsumeOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932181, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicCancel(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined,
      nowait: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeBasicCancel(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    var buffer = Buffer.alloc(14 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932190, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicCancelOk(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    return fields;
  }
  function encodeBasicCancelOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932191, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicPublish(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      exchange: undefined,
      routingKey: undefined,
      mandatory: undefined,
      immediate: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.mandatory = val;
    val = !!(2 & buffer[offset]);
    fields.immediate = val;
    return fields;
  }
  function encodeBasicPublish(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.exchange;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932200, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.exchange;
    val === undefined && (val = "");
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.mandatory;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.immediate;
    val === undefined && (val = false);
    val && (bits += 2);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicReturn(buffer) {
    var val, len, offset = 0, fields = {
      replyCode: undefined,
      replyText: undefined,
      exchange: undefined,
      routingKey: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.replyCode = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.replyText = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    return fields;
  }
  function encodeBasicReturn(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.replyText;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'replyText' is the wrong type; must be a string (up to 255 chars)");
    var replyText_len = Buffer.byteLength(val, "utf8");
    varyingSize += replyText_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'routingKey'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932210, 7);
    offset = 11;
    val = fields.replyCode;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'replyCode'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'replyCode' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.replyText;
    val === undefined && (val = "");
    buffer[offset] = replyText_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += replyText_len;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = undefined);
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicDeliver(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined,
      deliveryTag: undefined,
      redelivered: undefined,
      exchange: undefined,
      routingKey: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.redelivered = val;
    offset++;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    return fields;
  }
  function encodeBasicDeliver(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'routingKey'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(24 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932220, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    val = fields.deliveryTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'deliveryTag'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.redelivered;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = undefined);
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicGet(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      noAck: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.noAck = val;
    return fields;
  }
  function encodeBasicGet(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932230, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.noAck;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicGetOk(buffer) {
    var val, len, offset = 0, fields = {
      deliveryTag: undefined,
      redelivered: undefined,
      exchange: undefined,
      routingKey: undefined,
      messageCount: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.redelivered = val;
    offset++;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    return fields;
  }
  function encodeBasicGetOk(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'routingKey'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(27 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932231, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'deliveryTag'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.redelivered;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = undefined);
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicGetEmpty(buffer) {
    var val, len, offset = 0, fields = {
      clusterId: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.clusterId = val;
    return fields;
  }
  function encodeBasicGetEmpty(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.clusterId;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'clusterId' is the wrong type; must be a string (up to 255 chars)");
    var clusterId_len = Buffer.byteLength(val, "utf8");
    varyingSize += clusterId_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932232, 7);
    offset = 11;
    val = fields.clusterId;
    val === undefined && (val = "");
    buffer[offset] = clusterId_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += clusterId_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicAck(buffer) {
    var val, offset = 0, fields = {
      deliveryTag: undefined,
      multiple: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.multiple = val;
    return fields;
  }
  function encodeBasicAck(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(21);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932240, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.multiple;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicReject(buffer) {
    var val, offset = 0, fields = {
      deliveryTag: undefined,
      requeue: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicReject(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(21);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932250, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'deliveryTag'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.requeue;
    val === undefined && (val = true);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicRecoverAsync(buffer) {
    var val, fields = {
      requeue: undefined
    };
    val = !!(1 & buffer[0]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicRecoverAsync(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932260, 7);
    offset = 11;
    val = fields.requeue;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicRecover(buffer) {
    var val, fields = {
      requeue: undefined
    };
    val = !!(1 & buffer[0]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicRecover(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932270, 7);
    offset = 11;
    val = fields.requeue;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicRecoverOk(buffer) {
    return {};
  }
  function encodeBasicRecoverOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932271, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicNack(buffer) {
    var val, offset = 0, fields = {
      deliveryTag: undefined,
      multiple: undefined,
      requeue: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.multiple = val;
    val = !!(2 & buffer[offset]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicNack(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(21);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932280, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.multiple;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.requeue;
    val === undefined && (val = true);
    val && (bits += 2);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionStart(buffer) {
    var val, len, offset = 0, fields = {
      versionMajor: undefined,
      versionMinor: undefined,
      serverProperties: undefined,
      mechanisms: undefined,
      locales: undefined
    };
    val = buffer[offset];
    offset++;
    fields.versionMajor = val;
    val = buffer[offset];
    offset++;
    fields.versionMinor = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.serverProperties = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.mechanisms = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.locales = val;
    return fields;
  }
  function encodeConnectionStart(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0, scratchOffset = 0;
    val = fields.serverProperties;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'serverProperties'");
    if (typeof val != "object")
      throw new TypeError("Field 'serverProperties' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var serverProperties_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += serverProperties_encoded.length;
    val = fields.mechanisms;
    if (val === undefined)
      val = Buffer.from("PLAIN");
    else if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'mechanisms' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    val = fields.locales;
    if (val === undefined)
      val = Buffer.from("en_US");
    else if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'locales' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(22 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655370, 7);
    offset = 11;
    val = fields.versionMajor;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'versionMajor' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt8(val, offset);
    offset++;
    val = fields.versionMinor;
    if (val === undefined)
      val = 9;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'versionMinor' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt8(val, offset);
    offset++;
    offset += serverProperties_encoded.copy(buffer, offset);
    val = fields.mechanisms;
    val === undefined && (val = Buffer.from("PLAIN"));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    val = fields.locales;
    val === undefined && (val = Buffer.from("en_US"));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionStartOk(buffer) {
    var val, len, offset = 0, fields = {
      clientProperties: undefined,
      mechanism: undefined,
      response: undefined,
      locale: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.clientProperties = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.mechanism = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.response = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.locale = val;
    return fields;
  }
  function encodeConnectionStartOk(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0, scratchOffset = 0;
    val = fields.clientProperties;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'clientProperties'");
    if (typeof val != "object")
      throw new TypeError("Field 'clientProperties' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var clientProperties_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += clientProperties_encoded.length;
    val = fields.mechanism;
    if (val === undefined)
      val = "PLAIN";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'mechanism' is the wrong type; must be a string (up to 255 chars)");
    var mechanism_len = Buffer.byteLength(val, "utf8");
    varyingSize += mechanism_len;
    val = fields.response;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'response'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'response' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    val = fields.locale;
    if (val === undefined)
      val = "en_US";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'locale' is the wrong type; must be a string (up to 255 chars)");
    var locale_len = Buffer.byteLength(val, "utf8");
    varyingSize += locale_len;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655371, 7);
    offset = 11;
    offset += clientProperties_encoded.copy(buffer, offset);
    val = fields.mechanism;
    val === undefined && (val = "PLAIN");
    buffer[offset] = mechanism_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += mechanism_len;
    val = fields.response;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    val = fields.locale;
    val === undefined && (val = "en_US");
    buffer[offset] = locale_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += locale_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionSecure(buffer) {
    var val, len, offset = 0, fields = {
      challenge: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.challenge = val;
    return fields;
  }
  function encodeConnectionSecure(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.challenge;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'challenge'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'challenge' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655380, 7);
    offset = 11;
    val = fields.challenge;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionSecureOk(buffer) {
    var val, len, offset = 0, fields = {
      response: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.response = val;
    return fields;
  }
  function encodeConnectionSecureOk(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.response;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'response'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'response' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655381, 7);
    offset = 11;
    val = fields.response;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionTune(buffer) {
    var val, offset = 0, fields = {
      channelMax: undefined,
      frameMax: undefined,
      heartbeat: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.channelMax = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.frameMax = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.heartbeat = val;
    return fields;
  }
  function encodeConnectionTune(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(20);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655390, 7);
    offset = 11;
    val = fields.channelMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'channelMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.frameMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'frameMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.heartbeat;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'heartbeat' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionTuneOk(buffer) {
    var val, offset = 0, fields = {
      channelMax: undefined,
      frameMax: undefined,
      heartbeat: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.channelMax = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.frameMax = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.heartbeat = val;
    return fields;
  }
  function encodeConnectionTuneOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(20);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655391, 7);
    offset = 11;
    val = fields.channelMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'channelMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.frameMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'frameMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.heartbeat;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'heartbeat' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionOpen(buffer) {
    var val, len, offset = 0, fields = {
      virtualHost: undefined,
      capabilities: undefined,
      insist: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.virtualHost = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.capabilities = val;
    val = !!(1 & buffer[offset]);
    fields.insist = val;
    return fields;
  }
  function encodeConnectionOpen(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.virtualHost;
    if (val === undefined)
      val = "/";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'virtualHost' is the wrong type; must be a string (up to 255 chars)");
    var virtualHost_len = Buffer.byteLength(val, "utf8");
    varyingSize += virtualHost_len;
    val = fields.capabilities;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'capabilities' is the wrong type; must be a string (up to 255 chars)");
    var capabilities_len = Buffer.byteLength(val, "utf8");
    varyingSize += capabilities_len;
    var buffer = Buffer.alloc(15 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655400, 7);
    offset = 11;
    val = fields.virtualHost;
    val === undefined && (val = "/");
    buffer[offset] = virtualHost_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += virtualHost_len;
    val = fields.capabilities;
    val === undefined && (val = "");
    buffer[offset] = capabilities_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += capabilities_len;
    val = fields.insist;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionOpenOk(buffer) {
    var val, len, offset = 0, fields = {
      knownHosts: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.knownHosts = val;
    return fields;
  }
  function encodeConnectionOpenOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.knownHosts;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'knownHosts' is the wrong type; must be a string (up to 255 chars)");
    var knownHosts_len = Buffer.byteLength(val, "utf8");
    varyingSize += knownHosts_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655401, 7);
    offset = 11;
    val = fields.knownHosts;
    val === undefined && (val = "");
    buffer[offset] = knownHosts_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += knownHosts_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionClose(buffer) {
    var val, len, offset = 0, fields = {
      replyCode: undefined,
      replyText: undefined,
      classId: undefined,
      methodId: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.replyCode = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.replyText = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.classId = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.methodId = val;
    return fields;
  }
  function encodeConnectionClose(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.replyText;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'replyText' is the wrong type; must be a string (up to 255 chars)");
    var replyText_len = Buffer.byteLength(val, "utf8");
    varyingSize += replyText_len;
    var buffer = Buffer.alloc(19 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655410, 7);
    offset = 11;
    val = fields.replyCode;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'replyCode'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'replyCode' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.replyText;
    val === undefined && (val = "");
    buffer[offset] = replyText_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += replyText_len;
    val = fields.classId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'classId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'classId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.methodId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'methodId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'methodId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionCloseOk(buffer) {
    return {};
  }
  function encodeConnectionCloseOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655411, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionBlocked(buffer) {
    var val, len, offset = 0, fields = {
      reason: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.reason = val;
    return fields;
  }
  function encodeConnectionBlocked(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.reason;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'reason' is the wrong type; must be a string (up to 255 chars)");
    var reason_len = Buffer.byteLength(val, "utf8");
    varyingSize += reason_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655420, 7);
    offset = 11;
    val = fields.reason;
    val === undefined && (val = "");
    buffer[offset] = reason_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += reason_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionUnblocked(buffer) {
    return {};
  }
  function encodeConnectionUnblocked(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655421, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionUpdateSecret(buffer) {
    var val, len, offset = 0, fields = {
      newSecret: undefined,
      reason: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.newSecret = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.reason = val;
    return fields;
  }
  function encodeConnectionUpdateSecret(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.newSecret;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'newSecret'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'newSecret' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    val = fields.reason;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'reason'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'reason' is the wrong type; must be a string (up to 255 chars)");
    var reason_len = Buffer.byteLength(val, "utf8");
    varyingSize += reason_len;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655430, 7);
    offset = 11;
    val = fields.newSecret;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    val = fields.reason;
    val === undefined && (val = undefined);
    buffer[offset] = reason_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += reason_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionUpdateSecretOk(buffer) {
    return {};
  }
  function encodeConnectionUpdateSecretOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655431, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelOpen(buffer) {
    var val, len, offset = 0, fields = {
      outOfBand: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.outOfBand = val;
    return fields;
  }
  function encodeChannelOpen(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.outOfBand;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'outOfBand' is the wrong type; must be a string (up to 255 chars)");
    var outOfBand_len = Buffer.byteLength(val, "utf8");
    varyingSize += outOfBand_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310730, 7);
    offset = 11;
    val = fields.outOfBand;
    val === undefined && (val = "");
    buffer[offset] = outOfBand_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += outOfBand_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelOpenOk(buffer) {
    var val, len, offset = 0, fields = {
      channelId: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.channelId = val;
    return fields;
  }
  function encodeChannelOpenOk(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.channelId;
    if (val === undefined)
      val = Buffer.from("");
    else if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'channelId' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310731, 7);
    offset = 11;
    val = fields.channelId;
    val === undefined && (val = Buffer.from(""));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelFlow(buffer) {
    var val, fields = {
      active: undefined
    };
    val = !!(1 & buffer[0]);
    fields.active = val;
    return fields;
  }
  function encodeChannelFlow(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310740, 7);
    offset = 11;
    val = fields.active;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'active'");
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelFlowOk(buffer) {
    var val, fields = {
      active: undefined
    };
    val = !!(1 & buffer[0]);
    fields.active = val;
    return fields;
  }
  function encodeChannelFlowOk(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310741, 7);
    offset = 11;
    val = fields.active;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'active'");
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelClose(buffer) {
    var val, len, offset = 0, fields = {
      replyCode: undefined,
      replyText: undefined,
      classId: undefined,
      methodId: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.replyCode = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.replyText = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.classId = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.methodId = val;
    return fields;
  }
  function encodeChannelClose(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.replyText;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'replyText' is the wrong type; must be a string (up to 255 chars)");
    var replyText_len = Buffer.byteLength(val, "utf8");
    varyingSize += replyText_len;
    var buffer = Buffer.alloc(19 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310760, 7);
    offset = 11;
    val = fields.replyCode;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'replyCode'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'replyCode' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.replyText;
    val === undefined && (val = "");
    buffer[offset] = replyText_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += replyText_len;
    val = fields.classId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'classId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'classId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.methodId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'methodId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'methodId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelCloseOk(buffer) {
    return {};
  }
  function encodeChannelCloseOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310761, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeAccessRequest(buffer) {
    var val, len, offset = 0, fields = {
      realm: undefined,
      exclusive: undefined,
      passive: undefined,
      active: undefined,
      write: undefined,
      read: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.realm = val;
    val = !!(1 & buffer[offset]);
    fields.exclusive = val;
    val = !!(2 & buffer[offset]);
    fields.passive = val;
    val = !!(4 & buffer[offset]);
    fields.active = val;
    val = !!(8 & buffer[offset]);
    fields.write = val;
    val = !!(16 & buffer[offset]);
    fields.read = val;
    return fields;
  }
  function encodeAccessRequest(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.realm;
    if (val === undefined)
      val = "/data";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'realm' is the wrong type; must be a string (up to 255 chars)");
    var realm_len = Buffer.byteLength(val, "utf8");
    varyingSize += realm_len;
    var buffer = Buffer.alloc(14 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1966090, 7);
    offset = 11;
    val = fields.realm;
    val === undefined && (val = "/data");
    buffer[offset] = realm_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += realm_len;
    val = fields.exclusive;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.passive;
    val === undefined && (val = true);
    val && (bits += 2);
    val = fields.active;
    val === undefined && (val = true);
    val && (bits += 4);
    val = fields.write;
    val === undefined && (val = true);
    val && (bits += 8);
    val = fields.read;
    val === undefined && (val = true);
    val && (bits += 16);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeAccessRequestOk(buffer) {
    var val, offset = 0, fields = {
      ticket: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    return fields;
  }
  function encodeAccessRequestOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(14);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1966091, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 1;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDeclare(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      exchange: undefined,
      type: undefined,
      passive: undefined,
      durable: undefined,
      autoDelete: undefined,
      internal: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.type = val;
    val = !!(1 & buffer[offset]);
    fields.passive = val;
    val = !!(2 & buffer[offset]);
    fields.durable = val;
    val = !!(4 & buffer[offset]);
    fields.autoDelete = val;
    val = !!(8 & buffer[offset]);
    fields.internal = val;
    val = !!(16 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeExchangeDeclare(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.type;
    if (val === undefined)
      val = "direct";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'type' is the wrong type; must be a string (up to 255 chars)");
    var type_len = Buffer.byteLength(val, "utf8");
    varyingSize += type_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621450, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.type;
    val === undefined && (val = "direct");
    buffer[offset] = type_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += type_len;
    val = fields.passive;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.durable;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.autoDelete;
    val === undefined && (val = false);
    val && (bits += 4);
    val = fields.internal;
    val === undefined && (val = false);
    val && (bits += 8);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 16);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDeclareOk(buffer) {
    return {};
  }
  function encodeExchangeDeclareOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621451, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDelete(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      exchange: undefined,
      ifUnused: undefined,
      nowait: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    val = !!(1 & buffer[offset]);
    fields.ifUnused = val;
    val = !!(2 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeExchangeDelete(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621460, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.ifUnused;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 2);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDeleteOk(buffer) {
    return {};
  }
  function encodeExchangeDeleteOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621461, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeBind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      destination: undefined,
      source: undefined,
      routingKey: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.destination = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.source = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeExchangeBind(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.destination;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'destination'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'destination' is the wrong type; must be a string (up to 255 chars)");
    var destination_len = Buffer.byteLength(val, "utf8");
    varyingSize += destination_len;
    val = fields.source;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'source'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'source' is the wrong type; must be a string (up to 255 chars)");
    var source_len = Buffer.byteLength(val, "utf8");
    varyingSize += source_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621470, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.destination;
    val === undefined && (val = undefined);
    buffer[offset] = destination_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += destination_len;
    val = fields.source;
    val === undefined && (val = undefined);
    buffer[offset] = source_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += source_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeBindOk(buffer) {
    return {};
  }
  function encodeExchangeBindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621471, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeUnbind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      destination: undefined,
      source: undefined,
      routingKey: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.destination = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.source = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeExchangeUnbind(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.destination;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'destination'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'destination' is the wrong type; must be a string (up to 255 chars)");
    var destination_len = Buffer.byteLength(val, "utf8");
    varyingSize += destination_len;
    val = fields.source;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'source'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'source' is the wrong type; must be a string (up to 255 chars)");
    var source_len = Buffer.byteLength(val, "utf8");
    varyingSize += source_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621480, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.destination;
    val === undefined && (val = undefined);
    buffer[offset] = destination_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += destination_len;
    val = fields.source;
    val === undefined && (val = undefined);
    buffer[offset] = source_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += source_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeUnbindOk(buffer) {
    return {};
  }
  function encodeExchangeUnbindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621491, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDeclare(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      passive: undefined,
      durable: undefined,
      exclusive: undefined,
      autoDelete: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.passive = val;
    val = !!(2 & buffer[offset]);
    fields.durable = val;
    val = !!(4 & buffer[offset]);
    fields.exclusive = val;
    val = !!(8 & buffer[offset]);
    fields.autoDelete = val;
    val = !!(16 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeQueueDeclare(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276810, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.passive;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.durable;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.exclusive;
    val === undefined && (val = false);
    val && (bits += 4);
    val = fields.autoDelete;
    val === undefined && (val = false);
    val && (bits += 8);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 16);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDeclareOk(buffer) {
    var val, len, offset = 0, fields = {
      queue: undefined,
      messageCount: undefined,
      consumerCount: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.consumerCount = val;
    return fields;
  }
  function encodeQueueDeclareOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'queue'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(21 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276811, 7);
    offset = 11;
    val = fields.queue;
    val === undefined && (val = undefined);
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.consumerCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'consumerCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueBind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      exchange: undefined,
      routingKey: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeQueueBind(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276820, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueBindOk(buffer) {
    return {};
  }
  function encodeQueueBindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276821, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueuePurge(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      nowait: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeQueuePurge(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276830, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueuePurgeOk(buffer) {
    var val, offset = 0, fields = {
      messageCount: undefined
    };
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    return fields;
  }
  function encodeQueuePurgeOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(16);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276831, 7);
    offset = 11;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDelete(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      ifUnused: undefined,
      ifEmpty: undefined,
      nowait: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.ifUnused = val;
    val = !!(2 & buffer[offset]);
    fields.ifEmpty = val;
    val = !!(4 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeQueueDelete(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276840, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.ifUnused;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.ifEmpty;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 4);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDeleteOk(buffer) {
    var val, offset = 0, fields = {
      messageCount: undefined
    };
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    return fields;
  }
  function encodeQueueDeleteOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(16);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276841, 7);
    offset = 11;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueUnbind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      exchange: undefined,
      routingKey: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeQueueUnbind(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276850, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueUnbindOk(buffer) {
    return {};
  }
  function encodeQueueUnbindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276851, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxSelect(buffer) {
    return {};
  }
  function encodeTxSelect(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898250, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxSelectOk(buffer) {
    return {};
  }
  function encodeTxSelectOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898251, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxCommit(buffer) {
    return {};
  }
  function encodeTxCommit(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898260, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxCommitOk(buffer) {
    return {};
  }
  function encodeTxCommitOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898261, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxRollback(buffer) {
    return {};
  }
  function encodeTxRollback(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898270, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxRollbackOk(buffer) {
    return {};
  }
  function encodeTxRollbackOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898271, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConfirmSelect(buffer) {
    var val, fields = {
      nowait: undefined
    };
    val = !!(1 & buffer[0]);
    fields.nowait = val;
    return fields;
  }
  function encodeConfirmSelect(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5570570, 7);
    offset = 11;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConfirmSelectOk(buffer) {
    return {};
  }
  function encodeConfirmSelectOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5570571, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function encodeBasicProperties(channel, size, fields) {
    var val, len, offset = 0, flags = 0, scratchOffset = 0, varyingSize = 0;
    val = fields.contentType;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'contentType' is the wrong type; must be a string (up to 255 chars)");
      var contentType_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += contentType_len;
    }
    val = fields.contentEncoding;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'contentEncoding' is the wrong type; must be a string (up to 255 chars)");
      var contentEncoding_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += contentEncoding_len;
    }
    val = fields.headers;
    if (val != null) {
      if (typeof val != "object")
        throw new TypeError("Field 'headers' is the wrong type; must be an object");
      len = encodeTable(SCRATCH, val, scratchOffset);
      var headers_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
      scratchOffset += len;
      varyingSize += headers_encoded.length;
    }
    val = fields.deliveryMode;
    if (val != null) {
      if (typeof val != "number" || isNaN(val))
        throw new TypeError("Field 'deliveryMode' is the wrong type; must be a number (but not NaN)");
      varyingSize += 1;
    }
    val = fields.priority;
    if (val != null) {
      if (typeof val != "number" || isNaN(val))
        throw new TypeError("Field 'priority' is the wrong type; must be a number (but not NaN)");
      varyingSize += 1;
    }
    val = fields.correlationId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'correlationId' is the wrong type; must be a string (up to 255 chars)");
      var correlationId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += correlationId_len;
    }
    val = fields.replyTo;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'replyTo' is the wrong type; must be a string (up to 255 chars)");
      var replyTo_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += replyTo_len;
    }
    val = fields.expiration;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'expiration' is the wrong type; must be a string (up to 255 chars)");
      var expiration_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += expiration_len;
    }
    val = fields.messageId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'messageId' is the wrong type; must be a string (up to 255 chars)");
      var messageId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += messageId_len;
    }
    val = fields.timestamp;
    if (val != null) {
      if (typeof val != "number" || isNaN(val))
        throw new TypeError("Field 'timestamp' is the wrong type; must be a number (but not NaN)");
      varyingSize += 8;
    }
    val = fields.type;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'type' is the wrong type; must be a string (up to 255 chars)");
      var type_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += type_len;
    }
    val = fields.userId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'userId' is the wrong type; must be a string (up to 255 chars)");
      var userId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += userId_len;
    }
    val = fields.appId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'appId' is the wrong type; must be a string (up to 255 chars)");
      var appId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += appId_len;
    }
    val = fields.clusterId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'clusterId' is the wrong type; must be a string (up to 255 chars)");
      var clusterId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += clusterId_len;
    }
    var buffer = Buffer.alloc(22 + varyingSize);
    buffer[0] = 2;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932160, 7);
    ints.writeUInt64BE(buffer, size, 11);
    flags = 0;
    offset = 21;
    val = fields.contentType;
    if (val != null) {
      flags += 32768;
      buffer[offset] = contentType_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += contentType_len;
    }
    val = fields.contentEncoding;
    if (val != null) {
      flags += 16384;
      buffer[offset] = contentEncoding_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += contentEncoding_len;
    }
    val = fields.headers;
    if (val != null) {
      flags += 8192;
      offset += headers_encoded.copy(buffer, offset);
    }
    val = fields.deliveryMode;
    if (val != null) {
      flags += 4096;
      buffer.writeUInt8(val, offset);
      offset++;
    }
    val = fields.priority;
    if (val != null) {
      flags += 2048;
      buffer.writeUInt8(val, offset);
      offset++;
    }
    val = fields.correlationId;
    if (val != null) {
      flags += 1024;
      buffer[offset] = correlationId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += correlationId_len;
    }
    val = fields.replyTo;
    if (val != null) {
      flags += 512;
      buffer[offset] = replyTo_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += replyTo_len;
    }
    val = fields.expiration;
    if (val != null) {
      flags += 256;
      buffer[offset] = expiration_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += expiration_len;
    }
    val = fields.messageId;
    if (val != null) {
      flags += 128;
      buffer[offset] = messageId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += messageId_len;
    }
    val = fields.timestamp;
    if (val != null) {
      flags += 64;
      ints.writeUInt64BE(buffer, val, offset);
      offset += 8;
    }
    val = fields.type;
    if (val != null) {
      flags += 32;
      buffer[offset] = type_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += type_len;
    }
    val = fields.userId;
    if (val != null) {
      flags += 16;
      buffer[offset] = userId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += userId_len;
    }
    val = fields.appId;
    if (val != null) {
      flags += 8;
      buffer[offset] = appId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += appId_len;
    }
    val = fields.clusterId;
    if (val != null) {
      flags += 4;
      buffer[offset] = clusterId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += clusterId_len;
    }
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    buffer.writeUInt16BE(flags, 19);
    return buffer.subarray(0, offset + 1);
  }
  function decodeBasicProperties(buffer) {
    var flags, val, len, offset = 2;
    flags = buffer.readUInt16BE(0);
    if (flags === 0)
      return {};
    var fields = {
      contentType: undefined,
      contentEncoding: undefined,
      headers: undefined,
      deliveryMode: undefined,
      priority: undefined,
      correlationId: undefined,
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: undefined,
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined
    };
    if (32768 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.contentType = val;
    }
    if (16384 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.contentEncoding = val;
    }
    if (8192 & flags) {
      len = buffer.readUInt32BE(offset);
      offset += 4;
      val = decodeFields(buffer.subarray(offset, offset + len));
      offset += len;
      fields.headers = val;
    }
    if (4096 & flags) {
      val = buffer[offset];
      offset++;
      fields.deliveryMode = val;
    }
    if (2048 & flags) {
      val = buffer[offset];
      offset++;
      fields.priority = val;
    }
    if (1024 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.correlationId = val;
    }
    if (512 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.replyTo = val;
    }
    if (256 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.expiration = val;
    }
    if (128 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.messageId = val;
    }
    if (64 & flags) {
      val = ints.readUInt64BE(buffer, offset);
      offset += 8;
      fields.timestamp = val;
    }
    if (32 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.type = val;
    }
    if (16 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.userId = val;
    }
    if (8 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.appId = val;
    }
    if (4 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.clusterId = val;
    }
    return fields;
  }
  var codec = require_codec();
  var ints = require_buffer_more_ints();
  var encodeTable = codec.encodeTable;
  var decodeFields = codec.decodeFields;
  var SCRATCH = Buffer.alloc(65536);
  var EMPTY_OBJECT = Object.freeze({});
  exports.constants = {
    FRAME_METHOD: 1,
    FRAME_HEADER: 2,
    FRAME_BODY: 3,
    FRAME_HEARTBEAT: 8,
    FRAME_MIN_SIZE: 4096,
    FRAME_END: 206,
    REPLY_SUCCESS: 200,
    CONTENT_TOO_LARGE: 311,
    NO_ROUTE: 312,
    NO_CONSUMERS: 313,
    ACCESS_REFUSED: 403,
    NOT_FOUND: 404,
    RESOURCE_LOCKED: 405,
    PRECONDITION_FAILED: 406,
    CONNECTION_FORCED: 320,
    INVALID_PATH: 402,
    FRAME_ERROR: 501,
    SYNTAX_ERROR: 502,
    COMMAND_INVALID: 503,
    CHANNEL_ERROR: 504,
    UNEXPECTED_FRAME: 505,
    RESOURCE_ERROR: 506,
    NOT_ALLOWED: 530,
    NOT_IMPLEMENTED: 540,
    INTERNAL_ERROR: 541
  };
  exports.constant_strs = {
    "1": "FRAME-METHOD",
    "2": "FRAME-HEADER",
    "3": "FRAME-BODY",
    "8": "FRAME-HEARTBEAT",
    "200": "REPLY-SUCCESS",
    "206": "FRAME-END",
    "311": "CONTENT-TOO-LARGE",
    "312": "NO-ROUTE",
    "313": "NO-CONSUMERS",
    "320": "CONNECTION-FORCED",
    "402": "INVALID-PATH",
    "403": "ACCESS-REFUSED",
    "404": "NOT-FOUND",
    "405": "RESOURCE-LOCKED",
    "406": "PRECONDITION-FAILED",
    "501": "FRAME-ERROR",
    "502": "SYNTAX-ERROR",
    "503": "COMMAND-INVALID",
    "504": "CHANNEL-ERROR",
    "505": "UNEXPECTED-FRAME",
    "506": "RESOURCE-ERROR",
    "530": "NOT-ALLOWED",
    "540": "NOT-IMPLEMENTED",
    "541": "INTERNAL-ERROR",
    "4096": "FRAME-MIN-SIZE"
  };
  exports.FRAME_OVERHEAD = 8;
  exports.decode = function(id, buf) {
    switch (id) {
      case 3932170:
        return decodeBasicQos(buf);
      case 3932171:
        return decodeBasicQosOk(buf);
      case 3932180:
        return decodeBasicConsume(buf);
      case 3932181:
        return decodeBasicConsumeOk(buf);
      case 3932190:
        return decodeBasicCancel(buf);
      case 3932191:
        return decodeBasicCancelOk(buf);
      case 3932200:
        return decodeBasicPublish(buf);
      case 3932210:
        return decodeBasicReturn(buf);
      case 3932220:
        return decodeBasicDeliver(buf);
      case 3932230:
        return decodeBasicGet(buf);
      case 3932231:
        return decodeBasicGetOk(buf);
      case 3932232:
        return decodeBasicGetEmpty(buf);
      case 3932240:
        return decodeBasicAck(buf);
      case 3932250:
        return decodeBasicReject(buf);
      case 3932260:
        return decodeBasicRecoverAsync(buf);
      case 3932270:
        return decodeBasicRecover(buf);
      case 3932271:
        return decodeBasicRecoverOk(buf);
      case 3932280:
        return decodeBasicNack(buf);
      case 655370:
        return decodeConnectionStart(buf);
      case 655371:
        return decodeConnectionStartOk(buf);
      case 655380:
        return decodeConnectionSecure(buf);
      case 655381:
        return decodeConnectionSecureOk(buf);
      case 655390:
        return decodeConnectionTune(buf);
      case 655391:
        return decodeConnectionTuneOk(buf);
      case 655400:
        return decodeConnectionOpen(buf);
      case 655401:
        return decodeConnectionOpenOk(buf);
      case 655410:
        return decodeConnectionClose(buf);
      case 655411:
        return decodeConnectionCloseOk(buf);
      case 655420:
        return decodeConnectionBlocked(buf);
      case 655421:
        return decodeConnectionUnblocked(buf);
      case 655430:
        return decodeConnectionUpdateSecret(buf);
      case 655431:
        return decodeConnectionUpdateSecretOk(buf);
      case 1310730:
        return decodeChannelOpen(buf);
      case 1310731:
        return decodeChannelOpenOk(buf);
      case 1310740:
        return decodeChannelFlow(buf);
      case 1310741:
        return decodeChannelFlowOk(buf);
      case 1310760:
        return decodeChannelClose(buf);
      case 1310761:
        return decodeChannelCloseOk(buf);
      case 1966090:
        return decodeAccessRequest(buf);
      case 1966091:
        return decodeAccessRequestOk(buf);
      case 2621450:
        return decodeExchangeDeclare(buf);
      case 2621451:
        return decodeExchangeDeclareOk(buf);
      case 2621460:
        return decodeExchangeDelete(buf);
      case 2621461:
        return decodeExchangeDeleteOk(buf);
      case 2621470:
        return decodeExchangeBind(buf);
      case 2621471:
        return decodeExchangeBindOk(buf);
      case 2621480:
        return decodeExchangeUnbind(buf);
      case 2621491:
        return decodeExchangeUnbindOk(buf);
      case 3276810:
        return decodeQueueDeclare(buf);
      case 3276811:
        return decodeQueueDeclareOk(buf);
      case 3276820:
        return decodeQueueBind(buf);
      case 3276821:
        return decodeQueueBindOk(buf);
      case 3276830:
        return decodeQueuePurge(buf);
      case 3276831:
        return decodeQueuePurgeOk(buf);
      case 3276840:
        return decodeQueueDelete(buf);
      case 3276841:
        return decodeQueueDeleteOk(buf);
      case 3276850:
        return decodeQueueUnbind(buf);
      case 3276851:
        return decodeQueueUnbindOk(buf);
      case 5898250:
        return decodeTxSelect(buf);
      case 5898251:
        return decodeTxSelectOk(buf);
      case 5898260:
        return decodeTxCommit(buf);
      case 5898261:
        return decodeTxCommitOk(buf);
      case 5898270:
        return decodeTxRollback(buf);
      case 5898271:
        return decodeTxRollbackOk(buf);
      case 5570570:
        return decodeConfirmSelect(buf);
      case 5570571:
        return decodeConfirmSelectOk(buf);
      case 60:
        return decodeBasicProperties(buf);
      default:
        throw new Error("Unknown class/method ID");
    }
  };
  exports.encodeMethod = function(id, channel, fields) {
    switch (id) {
      case 3932170:
        return encodeBasicQos(channel, fields);
      case 3932171:
        return encodeBasicQosOk(channel, fields);
      case 3932180:
        return encodeBasicConsume(channel, fields);
      case 3932181:
        return encodeBasicConsumeOk(channel, fields);
      case 3932190:
        return encodeBasicCancel(channel, fields);
      case 3932191:
        return encodeBasicCancelOk(channel, fields);
      case 3932200:
        return encodeBasicPublish(channel, fields);
      case 3932210:
        return encodeBasicReturn(channel, fields);
      case 3932220:
        return encodeBasicDeliver(channel, fields);
      case 3932230:
        return encodeBasicGet(channel, fields);
      case 3932231:
        return encodeBasicGetOk(channel, fields);
      case 3932232:
        return encodeBasicGetEmpty(channel, fields);
      case 3932240:
        return encodeBasicAck(channel, fields);
      case 3932250:
        return encodeBasicReject(channel, fields);
      case 3932260:
        return encodeBasicRecoverAsync(channel, fields);
      case 3932270:
        return encodeBasicRecover(channel, fields);
      case 3932271:
        return encodeBasicRecoverOk(channel, fields);
      case 3932280:
        return encodeBasicNack(channel, fields);
      case 655370:
        return encodeConnectionStart(channel, fields);
      case 655371:
        return encodeConnectionStartOk(channel, fields);
      case 655380:
        return encodeConnectionSecure(channel, fields);
      case 655381:
        return encodeConnectionSecureOk(channel, fields);
      case 655390:
        return encodeConnectionTune(channel, fields);
      case 655391:
        return encodeConnectionTuneOk(channel, fields);
      case 655400:
        return encodeConnectionOpen(channel, fields);
      case 655401:
        return encodeConnectionOpenOk(channel, fields);
      case 655410:
        return encodeConnectionClose(channel, fields);
      case 655411:
        return encodeConnectionCloseOk(channel, fields);
      case 655420:
        return encodeConnectionBlocked(channel, fields);
      case 655421:
        return encodeConnectionUnblocked(channel, fields);
      case 655430:
        return encodeConnectionUpdateSecret(channel, fields);
      case 655431:
        return encodeConnectionUpdateSecretOk(channel, fields);
      case 1310730:
        return encodeChannelOpen(channel, fields);
      case 1310731:
        return encodeChannelOpenOk(channel, fields);
      case 1310740:
        return encodeChannelFlow(channel, fields);
      case 1310741:
        return encodeChannelFlowOk(channel, fields);
      case 1310760:
        return encodeChannelClose(channel, fields);
      case 1310761:
        return encodeChannelCloseOk(channel, fields);
      case 1966090:
        return encodeAccessRequest(channel, fields);
      case 1966091:
        return encodeAccessRequestOk(channel, fields);
      case 2621450:
        return encodeExchangeDeclare(channel, fields);
      case 2621451:
        return encodeExchangeDeclareOk(channel, fields);
      case 2621460:
        return encodeExchangeDelete(channel, fields);
      case 2621461:
        return encodeExchangeDeleteOk(channel, fields);
      case 2621470:
        return encodeExchangeBind(channel, fields);
      case 2621471:
        return encodeExchangeBindOk(channel, fields);
      case 2621480:
        return encodeExchangeUnbind(channel, fields);
      case 2621491:
        return encodeExchangeUnbindOk(channel, fields);
      case 3276810:
        return encodeQueueDeclare(channel, fields);
      case 3276811:
        return encodeQueueDeclareOk(channel, fields);
      case 3276820:
        return encodeQueueBind(channel, fields);
      case 3276821:
        return encodeQueueBindOk(channel, fields);
      case 3276830:
        return encodeQueuePurge(channel, fields);
      case 3276831:
        return encodeQueuePurgeOk(channel, fields);
      case 3276840:
        return encodeQueueDelete(channel, fields);
      case 3276841:
        return encodeQueueDeleteOk(channel, fields);
      case 3276850:
        return encodeQueueUnbind(channel, fields);
      case 3276851:
        return encodeQueueUnbindOk(channel, fields);
      case 5898250:
        return encodeTxSelect(channel, fields);
      case 5898251:
        return encodeTxSelectOk(channel, fields);
      case 5898260:
        return encodeTxCommit(channel, fields);
      case 5898261:
        return encodeTxCommitOk(channel, fields);
      case 5898270:
        return encodeTxRollback(channel, fields);
      case 5898271:
        return encodeTxRollbackOk(channel, fields);
      case 5570570:
        return encodeConfirmSelect(channel, fields);
      case 5570571:
        return encodeConfirmSelectOk(channel, fields);
      default:
        throw new Error("Unknown class/method ID");
    }
  };
  exports.encodeProperties = function(id, channel, size, fields) {
    switch (id) {
      case 60:
        return encodeBasicProperties(channel, size, fields);
      default:
        throw new Error("Unknown class/properties ID");
    }
  };
  exports.info = function(id) {
    switch (id) {
      case 3932170:
        return methodInfoBasicQos;
      case 3932171:
        return methodInfoBasicQosOk;
      case 3932180:
        return methodInfoBasicConsume;
      case 3932181:
        return methodInfoBasicConsumeOk;
      case 3932190:
        return methodInfoBasicCancel;
      case 3932191:
        return methodInfoBasicCancelOk;
      case 3932200:
        return methodInfoBasicPublish;
      case 3932210:
        return methodInfoBasicReturn;
      case 3932220:
        return methodInfoBasicDeliver;
      case 3932230:
        return methodInfoBasicGet;
      case 3932231:
        return methodInfoBasicGetOk;
      case 3932232:
        return methodInfoBasicGetEmpty;
      case 3932240:
        return methodInfoBasicAck;
      case 3932250:
        return methodInfoBasicReject;
      case 3932260:
        return methodInfoBasicRecoverAsync;
      case 3932270:
        return methodInfoBasicRecover;
      case 3932271:
        return methodInfoBasicRecoverOk;
      case 3932280:
        return methodInfoBasicNack;
      case 655370:
        return methodInfoConnectionStart;
      case 655371:
        return methodInfoConnectionStartOk;
      case 655380:
        return methodInfoConnectionSecure;
      case 655381:
        return methodInfoConnectionSecureOk;
      case 655390:
        return methodInfoConnectionTune;
      case 655391:
        return methodInfoConnectionTuneOk;
      case 655400:
        return methodInfoConnectionOpen;
      case 655401:
        return methodInfoConnectionOpenOk;
      case 655410:
        return methodInfoConnectionClose;
      case 655411:
        return methodInfoConnectionCloseOk;
      case 655420:
        return methodInfoConnectionBlocked;
      case 655421:
        return methodInfoConnectionUnblocked;
      case 655430:
        return methodInfoConnectionUpdateSecret;
      case 655431:
        return methodInfoConnectionUpdateSecretOk;
      case 1310730:
        return methodInfoChannelOpen;
      case 1310731:
        return methodInfoChannelOpenOk;
      case 1310740:
        return methodInfoChannelFlow;
      case 1310741:
        return methodInfoChannelFlowOk;
      case 1310760:
        return methodInfoChannelClose;
      case 1310761:
        return methodInfoChannelCloseOk;
      case 1966090:
        return methodInfoAccessRequest;
      case 1966091:
        return methodInfoAccessRequestOk;
      case 2621450:
        return methodInfoExchangeDeclare;
      case 2621451:
        return methodInfoExchangeDeclareOk;
      case 2621460:
        return methodInfoExchangeDelete;
      case 2621461:
        return methodInfoExchangeDeleteOk;
      case 2621470:
        return methodInfoExchangeBind;
      case 2621471:
        return methodInfoExchangeBindOk;
      case 2621480:
        return methodInfoExchangeUnbind;
      case 2621491:
        return methodInfoExchangeUnbindOk;
      case 3276810:
        return methodInfoQueueDeclare;
      case 3276811:
        return methodInfoQueueDeclareOk;
      case 3276820:
        return methodInfoQueueBind;
      case 3276821:
        return methodInfoQueueBindOk;
      case 3276830:
        return methodInfoQueuePurge;
      case 3276831:
        return methodInfoQueuePurgeOk;
      case 3276840:
        return methodInfoQueueDelete;
      case 3276841:
        return methodInfoQueueDeleteOk;
      case 3276850:
        return methodInfoQueueUnbind;
      case 3276851:
        return methodInfoQueueUnbindOk;
      case 5898250:
        return methodInfoTxSelect;
      case 5898251:
        return methodInfoTxSelectOk;
      case 5898260:
        return methodInfoTxCommit;
      case 5898261:
        return methodInfoTxCommitOk;
      case 5898270:
        return methodInfoTxRollback;
      case 5898271:
        return methodInfoTxRollbackOk;
      case 5570570:
        return methodInfoConfirmSelect;
      case 5570571:
        return methodInfoConfirmSelectOk;
      case 60:
        return propertiesInfoBasicProperties;
      default:
        throw new Error("Unknown class/method ID");
    }
  };
  exports.BasicQos = 3932170;
  var methodInfoBasicQos = exports.methodInfoBasicQos = {
    id: 3932170,
    classId: 60,
    methodId: 10,
    name: "BasicQos",
    args: [{
      type: "long",
      name: "prefetchSize",
      default: 0
    }, {
      type: "short",
      name: "prefetchCount",
      default: 0
    }, {
      type: "bit",
      name: "global",
      default: false
    }]
  };
  exports.BasicQosOk = 3932171;
  var methodInfoBasicQosOk = exports.methodInfoBasicQosOk = {
    id: 3932171,
    classId: 60,
    methodId: 11,
    name: "BasicQosOk",
    args: []
  };
  exports.BasicConsume = 3932180;
  var methodInfoBasicConsume = exports.methodInfoBasicConsume = {
    id: 3932180,
    classId: 60,
    methodId: 20,
    name: "BasicConsume",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "shortstr",
      name: "consumerTag",
      default: ""
    }, {
      type: "bit",
      name: "noLocal",
      default: false
    }, {
      type: "bit",
      name: "noAck",
      default: false
    }, {
      type: "bit",
      name: "exclusive",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.BasicConsumeOk = 3932181;
  var methodInfoBasicConsumeOk = exports.methodInfoBasicConsumeOk = {
    id: 3932181,
    classId: 60,
    methodId: 21,
    name: "BasicConsumeOk",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }]
  };
  exports.BasicCancel = 3932190;
  var methodInfoBasicCancel = exports.methodInfoBasicCancel = {
    id: 3932190,
    classId: 60,
    methodId: 30,
    name: "BasicCancel",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.BasicCancelOk = 3932191;
  var methodInfoBasicCancelOk = exports.methodInfoBasicCancelOk = {
    id: 3932191,
    classId: 60,
    methodId: 31,
    name: "BasicCancelOk",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }]
  };
  exports.BasicPublish = 3932200;
  var methodInfoBasicPublish = exports.methodInfoBasicPublish = {
    id: 3932200,
    classId: 60,
    methodId: 40,
    name: "BasicPublish",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "exchange",
      default: ""
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "mandatory",
      default: false
    }, {
      type: "bit",
      name: "immediate",
      default: false
    }]
  };
  exports.BasicReturn = 3932210;
  var methodInfoBasicReturn = exports.methodInfoBasicReturn = {
    id: 3932210,
    classId: 60,
    methodId: 50,
    name: "BasicReturn",
    args: [{
      type: "short",
      name: "replyCode"
    }, {
      type: "shortstr",
      name: "replyText",
      default: ""
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey"
    }]
  };
  exports.BasicDeliver = 3932220;
  var methodInfoBasicDeliver = exports.methodInfoBasicDeliver = {
    id: 3932220,
    classId: 60,
    methodId: 60,
    name: "BasicDeliver",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }, {
      type: "longlong",
      name: "deliveryTag"
    }, {
      type: "bit",
      name: "redelivered",
      default: false
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey"
    }]
  };
  exports.BasicGet = 3932230;
  var methodInfoBasicGet = exports.methodInfoBasicGet = {
    id: 3932230,
    classId: 60,
    methodId: 70,
    name: "BasicGet",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "noAck",
      default: false
    }]
  };
  exports.BasicGetOk = 3932231;
  var methodInfoBasicGetOk = exports.methodInfoBasicGetOk = {
    id: 3932231,
    classId: 60,
    methodId: 71,
    name: "BasicGetOk",
    args: [{
      type: "longlong",
      name: "deliveryTag"
    }, {
      type: "bit",
      name: "redelivered",
      default: false
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey"
    }, {
      type: "long",
      name: "messageCount"
    }]
  };
  exports.BasicGetEmpty = 3932232;
  var methodInfoBasicGetEmpty = exports.methodInfoBasicGetEmpty = {
    id: 3932232,
    classId: 60,
    methodId: 72,
    name: "BasicGetEmpty",
    args: [{
      type: "shortstr",
      name: "clusterId",
      default: ""
    }]
  };
  exports.BasicAck = 3932240;
  var methodInfoBasicAck = exports.methodInfoBasicAck = {
    id: 3932240,
    classId: 60,
    methodId: 80,
    name: "BasicAck",
    args: [{
      type: "longlong",
      name: "deliveryTag",
      default: 0
    }, {
      type: "bit",
      name: "multiple",
      default: false
    }]
  };
  exports.BasicReject = 3932250;
  var methodInfoBasicReject = exports.methodInfoBasicReject = {
    id: 3932250,
    classId: 60,
    methodId: 90,
    name: "BasicReject",
    args: [{
      type: "longlong",
      name: "deliveryTag"
    }, {
      type: "bit",
      name: "requeue",
      default: true
    }]
  };
  exports.BasicRecoverAsync = 3932260;
  var methodInfoBasicRecoverAsync = exports.methodInfoBasicRecoverAsync = {
    id: 3932260,
    classId: 60,
    methodId: 100,
    name: "BasicRecoverAsync",
    args: [{
      type: "bit",
      name: "requeue",
      default: false
    }]
  };
  exports.BasicRecover = 3932270;
  var methodInfoBasicRecover = exports.methodInfoBasicRecover = {
    id: 3932270,
    classId: 60,
    methodId: 110,
    name: "BasicRecover",
    args: [{
      type: "bit",
      name: "requeue",
      default: false
    }]
  };
  exports.BasicRecoverOk = 3932271;
  var methodInfoBasicRecoverOk = exports.methodInfoBasicRecoverOk = {
    id: 3932271,
    classId: 60,
    methodId: 111,
    name: "BasicRecoverOk",
    args: []
  };
  exports.BasicNack = 3932280;
  var methodInfoBasicNack = exports.methodInfoBasicNack = {
    id: 3932280,
    classId: 60,
    methodId: 120,
    name: "BasicNack",
    args: [{
      type: "longlong",
      name: "deliveryTag",
      default: 0
    }, {
      type: "bit",
      name: "multiple",
      default: false
    }, {
      type: "bit",
      name: "requeue",
      default: true
    }]
  };
  exports.ConnectionStart = 655370;
  var methodInfoConnectionStart = exports.methodInfoConnectionStart = {
    id: 655370,
    classId: 10,
    methodId: 10,
    name: "ConnectionStart",
    args: [{
      type: "octet",
      name: "versionMajor",
      default: 0
    }, {
      type: "octet",
      name: "versionMinor",
      default: 9
    }, {
      type: "table",
      name: "serverProperties"
    }, {
      type: "longstr",
      name: "mechanisms",
      default: "PLAIN"
    }, {
      type: "longstr",
      name: "locales",
      default: "en_US"
    }]
  };
  exports.ConnectionStartOk = 655371;
  var methodInfoConnectionStartOk = exports.methodInfoConnectionStartOk = {
    id: 655371,
    classId: 10,
    methodId: 11,
    name: "ConnectionStartOk",
    args: [{
      type: "table",
      name: "clientProperties"
    }, {
      type: "shortstr",
      name: "mechanism",
      default: "PLAIN"
    }, {
      type: "longstr",
      name: "response"
    }, {
      type: "shortstr",
      name: "locale",
      default: "en_US"
    }]
  };
  exports.ConnectionSecure = 655380;
  var methodInfoConnectionSecure = exports.methodInfoConnectionSecure = {
    id: 655380,
    classId: 10,
    methodId: 20,
    name: "ConnectionSecure",
    args: [{
      type: "longstr",
      name: "challenge"
    }]
  };
  exports.ConnectionSecureOk = 655381;
  var methodInfoConnectionSecureOk = exports.methodInfoConnectionSecureOk = {
    id: 655381,
    classId: 10,
    methodId: 21,
    name: "ConnectionSecureOk",
    args: [{
      type: "longstr",
      name: "response"
    }]
  };
  exports.ConnectionTune = 655390;
  var methodInfoConnectionTune = exports.methodInfoConnectionTune = {
    id: 655390,
    classId: 10,
    methodId: 30,
    name: "ConnectionTune",
    args: [{
      type: "short",
      name: "channelMax",
      default: 0
    }, {
      type: "long",
      name: "frameMax",
      default: 0
    }, {
      type: "short",
      name: "heartbeat",
      default: 0
    }]
  };
  exports.ConnectionTuneOk = 655391;
  var methodInfoConnectionTuneOk = exports.methodInfoConnectionTuneOk = {
    id: 655391,
    classId: 10,
    methodId: 31,
    name: "ConnectionTuneOk",
    args: [{
      type: "short",
      name: "channelMax",
      default: 0
    }, {
      type: "long",
      name: "frameMax",
      default: 0
    }, {
      type: "short",
      name: "heartbeat",
      default: 0
    }]
  };
  exports.ConnectionOpen = 655400;
  var methodInfoConnectionOpen = exports.methodInfoConnectionOpen = {
    id: 655400,
    classId: 10,
    methodId: 40,
    name: "ConnectionOpen",
    args: [{
      type: "shortstr",
      name: "virtualHost",
      default: "/"
    }, {
      type: "shortstr",
      name: "capabilities",
      default: ""
    }, {
      type: "bit",
      name: "insist",
      default: false
    }]
  };
  exports.ConnectionOpenOk = 655401;
  var methodInfoConnectionOpenOk = exports.methodInfoConnectionOpenOk = {
    id: 655401,
    classId: 10,
    methodId: 41,
    name: "ConnectionOpenOk",
    args: [{
      type: "shortstr",
      name: "knownHosts",
      default: ""
    }]
  };
  exports.ConnectionClose = 655410;
  var methodInfoConnectionClose = exports.methodInfoConnectionClose = {
    id: 655410,
    classId: 10,
    methodId: 50,
    name: "ConnectionClose",
    args: [{
      type: "short",
      name: "replyCode"
    }, {
      type: "shortstr",
      name: "replyText",
      default: ""
    }, {
      type: "short",
      name: "classId"
    }, {
      type: "short",
      name: "methodId"
    }]
  };
  exports.ConnectionCloseOk = 655411;
  var methodInfoConnectionCloseOk = exports.methodInfoConnectionCloseOk = {
    id: 655411,
    classId: 10,
    methodId: 51,
    name: "ConnectionCloseOk",
    args: []
  };
  exports.ConnectionBlocked = 655420;
  var methodInfoConnectionBlocked = exports.methodInfoConnectionBlocked = {
    id: 655420,
    classId: 10,
    methodId: 60,
    name: "ConnectionBlocked",
    args: [{
      type: "shortstr",
      name: "reason",
      default: ""
    }]
  };
  exports.ConnectionUnblocked = 655421;
  var methodInfoConnectionUnblocked = exports.methodInfoConnectionUnblocked = {
    id: 655421,
    classId: 10,
    methodId: 61,
    name: "ConnectionUnblocked",
    args: []
  };
  exports.ConnectionUpdateSecret = 655430;
  var methodInfoConnectionUpdateSecret = exports.methodInfoConnectionUpdateSecret = {
    id: 655430,
    classId: 10,
    methodId: 70,
    name: "ConnectionUpdateSecret",
    args: [{
      type: "longstr",
      name: "newSecret"
    }, {
      type: "shortstr",
      name: "reason"
    }]
  };
  exports.ConnectionUpdateSecretOk = 655431;
  var methodInfoConnectionUpdateSecretOk = exports.methodInfoConnectionUpdateSecretOk = {
    id: 655431,
    classId: 10,
    methodId: 71,
    name: "ConnectionUpdateSecretOk",
    args: []
  };
  exports.ChannelOpen = 1310730;
  var methodInfoChannelOpen = exports.methodInfoChannelOpen = {
    id: 1310730,
    classId: 20,
    methodId: 10,
    name: "ChannelOpen",
    args: [{
      type: "shortstr",
      name: "outOfBand",
      default: ""
    }]
  };
  exports.ChannelOpenOk = 1310731;
  var methodInfoChannelOpenOk = exports.methodInfoChannelOpenOk = {
    id: 1310731,
    classId: 20,
    methodId: 11,
    name: "ChannelOpenOk",
    args: [{
      type: "longstr",
      name: "channelId",
      default: ""
    }]
  };
  exports.ChannelFlow = 1310740;
  var methodInfoChannelFlow = exports.methodInfoChannelFlow = {
    id: 1310740,
    classId: 20,
    methodId: 20,
    name: "ChannelFlow",
    args: [{
      type: "bit",
      name: "active"
    }]
  };
  exports.ChannelFlowOk = 1310741;
  var methodInfoChannelFlowOk = exports.methodInfoChannelFlowOk = {
    id: 1310741,
    classId: 20,
    methodId: 21,
    name: "ChannelFlowOk",
    args: [{
      type: "bit",
      name: "active"
    }]
  };
  exports.ChannelClose = 1310760;
  var methodInfoChannelClose = exports.methodInfoChannelClose = {
    id: 1310760,
    classId: 20,
    methodId: 40,
    name: "ChannelClose",
    args: [{
      type: "short",
      name: "replyCode"
    }, {
      type: "shortstr",
      name: "replyText",
      default: ""
    }, {
      type: "short",
      name: "classId"
    }, {
      type: "short",
      name: "methodId"
    }]
  };
  exports.ChannelCloseOk = 1310761;
  var methodInfoChannelCloseOk = exports.methodInfoChannelCloseOk = {
    id: 1310761,
    classId: 20,
    methodId: 41,
    name: "ChannelCloseOk",
    args: []
  };
  exports.AccessRequest = 1966090;
  var methodInfoAccessRequest = exports.methodInfoAccessRequest = {
    id: 1966090,
    classId: 30,
    methodId: 10,
    name: "AccessRequest",
    args: [{
      type: "shortstr",
      name: "realm",
      default: "/data"
    }, {
      type: "bit",
      name: "exclusive",
      default: false
    }, {
      type: "bit",
      name: "passive",
      default: true
    }, {
      type: "bit",
      name: "active",
      default: true
    }, {
      type: "bit",
      name: "write",
      default: true
    }, {
      type: "bit",
      name: "read",
      default: true
    }]
  };
  exports.AccessRequestOk = 1966091;
  var methodInfoAccessRequestOk = exports.methodInfoAccessRequestOk = {
    id: 1966091,
    classId: 30,
    methodId: 11,
    name: "AccessRequestOk",
    args: [{
      type: "short",
      name: "ticket",
      default: 1
    }]
  };
  exports.ExchangeDeclare = 2621450;
  var methodInfoExchangeDeclare = exports.methodInfoExchangeDeclare = {
    id: 2621450,
    classId: 40,
    methodId: 10,
    name: "ExchangeDeclare",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "type",
      default: "direct"
    }, {
      type: "bit",
      name: "passive",
      default: false
    }, {
      type: "bit",
      name: "durable",
      default: false
    }, {
      type: "bit",
      name: "autoDelete",
      default: false
    }, {
      type: "bit",
      name: "internal",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.ExchangeDeclareOk = 2621451;
  var methodInfoExchangeDeclareOk = exports.methodInfoExchangeDeclareOk = {
    id: 2621451,
    classId: 40,
    methodId: 11,
    name: "ExchangeDeclareOk",
    args: []
  };
  exports.ExchangeDelete = 2621460;
  var methodInfoExchangeDelete = exports.methodInfoExchangeDelete = {
    id: 2621460,
    classId: 40,
    methodId: 20,
    name: "ExchangeDelete",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "bit",
      name: "ifUnused",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.ExchangeDeleteOk = 2621461;
  var methodInfoExchangeDeleteOk = exports.methodInfoExchangeDeleteOk = {
    id: 2621461,
    classId: 40,
    methodId: 21,
    name: "ExchangeDeleteOk",
    args: []
  };
  exports.ExchangeBind = 2621470;
  var methodInfoExchangeBind = exports.methodInfoExchangeBind = {
    id: 2621470,
    classId: 40,
    methodId: 30,
    name: "ExchangeBind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "destination"
    }, {
      type: "shortstr",
      name: "source"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.ExchangeBindOk = 2621471;
  var methodInfoExchangeBindOk = exports.methodInfoExchangeBindOk = {
    id: 2621471,
    classId: 40,
    methodId: 31,
    name: "ExchangeBindOk",
    args: []
  };
  exports.ExchangeUnbind = 2621480;
  var methodInfoExchangeUnbind = exports.methodInfoExchangeUnbind = {
    id: 2621480,
    classId: 40,
    methodId: 40,
    name: "ExchangeUnbind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "destination"
    }, {
      type: "shortstr",
      name: "source"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.ExchangeUnbindOk = 2621491;
  var methodInfoExchangeUnbindOk = exports.methodInfoExchangeUnbindOk = {
    id: 2621491,
    classId: 40,
    methodId: 51,
    name: "ExchangeUnbindOk",
    args: []
  };
  exports.QueueDeclare = 3276810;
  var methodInfoQueueDeclare = exports.methodInfoQueueDeclare = {
    id: 3276810,
    classId: 50,
    methodId: 10,
    name: "QueueDeclare",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "passive",
      default: false
    }, {
      type: "bit",
      name: "durable",
      default: false
    }, {
      type: "bit",
      name: "exclusive",
      default: false
    }, {
      type: "bit",
      name: "autoDelete",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.QueueDeclareOk = 3276811;
  var methodInfoQueueDeclareOk = exports.methodInfoQueueDeclareOk = {
    id: 3276811,
    classId: 50,
    methodId: 11,
    name: "QueueDeclareOk",
    args: [{
      type: "shortstr",
      name: "queue"
    }, {
      type: "long",
      name: "messageCount"
    }, {
      type: "long",
      name: "consumerCount"
    }]
  };
  exports.QueueBind = 3276820;
  var methodInfoQueueBind = exports.methodInfoQueueBind = {
    id: 3276820,
    classId: 50,
    methodId: 20,
    name: "QueueBind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.QueueBindOk = 3276821;
  var methodInfoQueueBindOk = exports.methodInfoQueueBindOk = {
    id: 3276821,
    classId: 50,
    methodId: 21,
    name: "QueueBindOk",
    args: []
  };
  exports.QueuePurge = 3276830;
  var methodInfoQueuePurge = exports.methodInfoQueuePurge = {
    id: 3276830,
    classId: 50,
    methodId: 30,
    name: "QueuePurge",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.QueuePurgeOk = 3276831;
  var methodInfoQueuePurgeOk = exports.methodInfoQueuePurgeOk = {
    id: 3276831,
    classId: 50,
    methodId: 31,
    name: "QueuePurgeOk",
    args: [{
      type: "long",
      name: "messageCount"
    }]
  };
  exports.QueueDelete = 3276840;
  var methodInfoQueueDelete = exports.methodInfoQueueDelete = {
    id: 3276840,
    classId: 50,
    methodId: 40,
    name: "QueueDelete",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "ifUnused",
      default: false
    }, {
      type: "bit",
      name: "ifEmpty",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.QueueDeleteOk = 3276841;
  var methodInfoQueueDeleteOk = exports.methodInfoQueueDeleteOk = {
    id: 3276841,
    classId: 50,
    methodId: 41,
    name: "QueueDeleteOk",
    args: [{
      type: "long",
      name: "messageCount"
    }]
  };
  exports.QueueUnbind = 3276850;
  var methodInfoQueueUnbind = exports.methodInfoQueueUnbind = {
    id: 3276850,
    classId: 50,
    methodId: 50,
    name: "QueueUnbind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.QueueUnbindOk = 3276851;
  var methodInfoQueueUnbindOk = exports.methodInfoQueueUnbindOk = {
    id: 3276851,
    classId: 50,
    methodId: 51,
    name: "QueueUnbindOk",
    args: []
  };
  exports.TxSelect = 5898250;
  var methodInfoTxSelect = exports.methodInfoTxSelect = {
    id: 5898250,
    classId: 90,
    methodId: 10,
    name: "TxSelect",
    args: []
  };
  exports.TxSelectOk = 5898251;
  var methodInfoTxSelectOk = exports.methodInfoTxSelectOk = {
    id: 5898251,
    classId: 90,
    methodId: 11,
    name: "TxSelectOk",
    args: []
  };
  exports.TxCommit = 5898260;
  var methodInfoTxCommit = exports.methodInfoTxCommit = {
    id: 5898260,
    classId: 90,
    methodId: 20,
    name: "TxCommit",
    args: []
  };
  exports.TxCommitOk = 5898261;
  var methodInfoTxCommitOk = exports.methodInfoTxCommitOk = {
    id: 5898261,
    classId: 90,
    methodId: 21,
    name: "TxCommitOk",
    args: []
  };
  exports.TxRollback = 5898270;
  var methodInfoTxRollback = exports.methodInfoTxRollback = {
    id: 5898270,
    classId: 90,
    methodId: 30,
    name: "TxRollback",
    args: []
  };
  exports.TxRollbackOk = 5898271;
  var methodInfoTxRollbackOk = exports.methodInfoTxRollbackOk = {
    id: 5898271,
    classId: 90,
    methodId: 31,
    name: "TxRollbackOk",
    args: []
  };
  exports.ConfirmSelect = 5570570;
  var methodInfoConfirmSelect = exports.methodInfoConfirmSelect = {
    id: 5570570,
    classId: 85,
    methodId: 10,
    name: "ConfirmSelect",
    args: [{
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.ConfirmSelectOk = 5570571;
  var methodInfoConfirmSelectOk = exports.methodInfoConfirmSelectOk = {
    id: 5570571,
    classId: 85,
    methodId: 11,
    name: "ConfirmSelectOk",
    args: []
  };
  exports.BasicProperties = 60;
  var propertiesInfoBasicProperties = exports.propertiesInfoBasicProperties = {
    id: 60,
    name: "BasicProperties",
    args: [{
      type: "shortstr",
      name: "contentType"
    }, {
      type: "shortstr",
      name: "contentEncoding"
    }, {
      type: "table",
      name: "headers"
    }, {
      type: "octet",
      name: "deliveryMode"
    }, {
      type: "octet",
      name: "priority"
    }, {
      type: "shortstr",
      name: "correlationId"
    }, {
      type: "shortstr",
      name: "replyTo"
    }, {
      type: "shortstr",
      name: "expiration"
    }, {
      type: "shortstr",
      name: "messageId"
    }, {
      type: "timestamp",
      name: "timestamp"
    }, {
      type: "shortstr",
      name: "type"
    }, {
      type: "shortstr",
      name: "userId"
    }, {
      type: "shortstr",
      name: "appId"
    }, {
      type: "shortstr",
      name: "clusterId"
    }]
  };
});

// node_modules/@acuminous/bitsyntax/lib/pattern.js
var require_pattern = __commonJS((exports, module) => {
  function set(values) {
    var s = {};
    for (var i in values) {
      if (!Object.prototype.hasOwnProperty.call(values, i))
        continue;
      s[values[i]] = 1;
    }
    return s;
  }
  function variable(name, size, specifiers0) {
    var specifiers = set(specifiers0);
    var segment = { name };
    segment.type = type_in(specifiers);
    specs(segment, segment.type, specifiers);
    segment.size = size_of(segment, segment.type, size, segment.unit);
    return segment;
  }
  function value(val, size, specifiers0) {
    var specifiers = set(specifiers0);
    var segment = { value: val };
    segment.type = type_in(specifiers);
    specs(segment, segment.type, specifiers);
    segment.size = size_of(segment, segment.type, size, segment.unit);
    return segment;
  }
  function string(val) {
    return { value: val, type: "string" };
  }
  function type_in(specifiers) {
    for (var t in specifiers) {
      if (!Object.prototype.hasOwnProperty.call(specifiers, t))
        continue;
      if (TYPES[t]) {
        return t;
      }
    }
    return "integer";
  }
  function specs(segment, type, specifiers) {
    switch (type) {
      case "integer":
        segment.signed = signed_in(specifiers);
      case "float":
        segment.bigendian = endian_in(specifiers);
      default:
        segment.unit = unit_in(specifiers, segment.type);
    }
    return segment;
  }
  function endian_in(specifiers) {
    return !specifiers["little"];
  }
  function signed_in(specifiers) {
    return specifiers["signed"];
  }
  function unit_in(specifiers, type) {
    for (var s in specifiers) {
      if (!Object.prototype.hasOwnProperty.call(specifiers, s))
        continue;
      if (s.substr(0, 5) == "unit:") {
        var unit = parseInt(s.substr(5));
        return unit;
      }
    }
    switch (type) {
      case "binary":
        return 8;
      case "integer":
      case "float":
        return 1;
    }
  }
  function size_of(segment, type, size, unit) {
    if (size !== undefined && size !== "") {
      return size;
    } else {
      switch (type) {
        case "integer":
          return 8;
        case "float":
          return 64;
        case "binary":
          return true;
      }
    }
  }
  exports.variable = variable;
  exports.rest = function() {
    return variable("_", true, ["binary"]);
  };
  exports.value = value;
  exports.string = string;
  var TYPES = { integer: 1, binary: 1, float: 1 };
});

// node_modules/@acuminous/bitsyntax/lib/parser.js
var require_parser = __commonJS((exports, module) => {
  module.exports = function() {
    function quote(s) {
      return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape) + '"';
    }
    var result = {
      parse: function(input, startRule) {
        var parseFunctions = {
          start: parse_start,
          segmentTail: parse_segmentTail,
          segment: parse_segment,
          string: parse_string,
          chars: parse_chars,
          char: parse_char,
          hexDigit: parse_hexDigit,
          identifier: parse_identifier,
          number: parse_number,
          size: parse_size,
          specifierList: parse_specifierList,
          specifierTail: parse_specifierTail,
          specifier: parse_specifier,
          unit: parse_unit,
          ws: parse_ws
        };
        if (startRule !== undefined) {
          if (parseFunctions[startRule] === undefined) {
            throw new Error("Invalid rule name: " + quote(startRule) + ".");
          }
        } else {
          startRule = "start";
        }
        var pos = 0;
        var reportFailures = 0;
        var rightmostFailuresPos = 0;
        var rightmostFailuresExpected = [];
        function padLeft(input2, padding, length) {
          var result3 = input2;
          var padLength = length - input2.length;
          for (var i = 0;i < padLength; i++) {
            result3 = padding + result3;
          }
          return result3;
        }
        function escape2(ch) {
          var charCode = ch.charCodeAt(0);
          var escapeChar;
          var length;
          if (charCode <= 255) {
            escapeChar = "x";
            length = 2;
          } else {
            escapeChar = "u";
            length = 4;
          }
          return "\\" + escapeChar + padLeft(charCode.toString(16).toUpperCase(), "0", length);
        }
        function matchFailed(failure) {
          if (pos < rightmostFailuresPos) {
            return;
          }
          if (pos > rightmostFailuresPos) {
            rightmostFailuresPos = pos;
            rightmostFailuresExpected = [];
          }
          rightmostFailuresExpected.push(failure);
        }
        function parse_start() {
          var result0, result1, result22, result3;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          result0 = parse_ws();
          if (result0 !== null) {
            result1 = parse_segment();
            if (result1 !== null) {
              result22 = [];
              result3 = parse_segmentTail();
              while (result3 !== null) {
                result22.push(result3);
                result3 = parse_segmentTail();
              }
              if (result22 !== null) {
                result0 = [result0, result1, result22];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2, head, tail) {
              tail.unshift(head);
              return tail;
            }(pos0, result0[1], result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        function parse_segmentTail() {
          var result0, result1, result22, result3;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          result0 = parse_ws();
          if (result0 !== null) {
            if (input.charCodeAt(pos) === 44) {
              result1 = ",";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            if (result1 !== null) {
              result22 = parse_ws();
              if (result22 !== null) {
                result3 = parse_segment();
                if (result3 !== null) {
                  result0 = [result0, result1, result22, result3];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2, seg) {
              return seg;
            }(pos0, result0[3]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        function parse_segment() {
          var result0, result1, result22;
          var pos0, pos1;
          pos0 = pos;
          result0 = parse_string();
          if (result0 !== null) {
            result0 = function(offset2, str) {
              return { string: str };
            }(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_identifier();
            if (result0 !== null) {
              result1 = parse_size();
              result1 = result1 !== null ? result1 : "";
              if (result1 !== null) {
                result22 = parse_specifierList();
                result22 = result22 !== null ? result22 : "";
                if (result22 !== null) {
                  result0 = [result0, result1, result22];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = function(offset2, v, size, specs) {
                return { name: v, size, specifiers: specs };
              }(pos0, result0[0], result0[1], result0[2]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              result0 = parse_number();
              if (result0 !== null) {
                result1 = parse_size();
                result1 = result1 !== null ? result1 : "";
                if (result1 !== null) {
                  result22 = parse_specifierList();
                  result22 = result22 !== null ? result22 : "";
                  if (result22 !== null) {
                    result0 = [result0, result1, result22];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = function(offset2, v, size, specs) {
                  return { value: v, size, specifiers: specs };
                }(pos0, result0[0], result0[1], result0[2]);
              }
              if (result0 === null) {
                pos = pos0;
              }
            }
          }
          return result0;
        }
        function parse_string() {
          var result0, result1, result22;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 34) {
            result0 = "\"";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result0 !== null) {
            if (input.charCodeAt(pos) === 34) {
              result1 = "\"";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2) {
              return "";
            }(pos0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (input.charCodeAt(pos) === 34) {
              result0 = "\"";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result0 !== null) {
              result1 = parse_chars();
              if (result1 !== null) {
                if (input.charCodeAt(pos) === 34) {
                  result22 = "\"";
                  pos++;
                } else {
                  result22 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\\"\"");
                  }
                }
                if (result22 !== null) {
                  result0 = [result0, result1, result22];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = function(offset2, chars) {
                return chars;
              }(pos0, result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
          return result0;
        }
        function parse_chars() {
          var result0, result1;
          var pos0;
          pos0 = pos;
          result1 = parse_char();
          if (result1 !== null) {
            result0 = [];
            while (result1 !== null) {
              result0.push(result1);
              result1 = parse_char();
            }
          } else {
            result0 = null;
          }
          if (result0 !== null) {
            result0 = function(offset2, chars) {
              return chars.join("");
            }(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        function parse_char() {
          var result0, result1, result22, result3, result4;
          var pos0, pos1;
          if (/^[^"\\\0-\x1F\u007F]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[^\"\\\\\\0-\\x1F]");
            }
          }
          if (result0 === null) {
            pos0 = pos;
            if (input.substr(pos, 2) === "\\\"") {
              result0 = "\\\"";
              pos += 2;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\\\\\"\"");
              }
            }
            if (result0 !== null) {
              result0 = function(offset2) {
                return '"';
              }(pos0);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              if (input.substr(pos, 2) === "\\\\") {
                result0 = "\\\\";
                pos += 2;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\\\\\\\"");
                }
              }
              if (result0 !== null) {
                result0 = function(offset2) {
                  return "\\";
                }(pos0);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                pos0 = pos;
                if (input.substr(pos, 2) === "\\/") {
                  result0 = "\\/";
                  pos += 2;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\\\/\"");
                  }
                }
                if (result0 !== null) {
                  result0 = function(offset2) {
                    return "/";
                  }(pos0);
                }
                if (result0 === null) {
                  pos = pos0;
                }
                if (result0 === null) {
                  pos0 = pos;
                  if (input.substr(pos, 2) === "\\b") {
                    result0 = "\\b";
                    pos += 2;
                  } else {
                    result0 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"\\\\b\"");
                    }
                  }
                  if (result0 !== null) {
                    result0 = function(offset2) {
                      return "\b";
                    }(pos0);
                  }
                  if (result0 === null) {
                    pos = pos0;
                  }
                  if (result0 === null) {
                    pos0 = pos;
                    if (input.substr(pos, 2) === "\\f") {
                      result0 = "\\f";
                      pos += 2;
                    } else {
                      result0 = null;
                      if (reportFailures === 0) {
                        matchFailed("\"\\\\f\"");
                      }
                    }
                    if (result0 !== null) {
                      result0 = function(offset2) {
                        return "\f";
                      }(pos0);
                    }
                    if (result0 === null) {
                      pos = pos0;
                    }
                    if (result0 === null) {
                      pos0 = pos;
                      if (input.substr(pos, 2) === "\\n") {
                        result0 = "\\n";
                        pos += 2;
                      } else {
                        result0 = null;
                        if (reportFailures === 0) {
                          matchFailed("\"\\\\n\"");
                        }
                      }
                      if (result0 !== null) {
                        result0 = function(offset2) {
                          return "\n";
                        }(pos0);
                      }
                      if (result0 === null) {
                        pos = pos0;
                      }
                      if (result0 === null) {
                        pos0 = pos;
                        if (input.substr(pos, 2) === "\\r") {
                          result0 = "\\r";
                          pos += 2;
                        } else {
                          result0 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"\\\\r\"");
                          }
                        }
                        if (result0 !== null) {
                          result0 = function(offset2) {
                            return "\r";
                          }(pos0);
                        }
                        if (result0 === null) {
                          pos = pos0;
                        }
                        if (result0 === null) {
                          pos0 = pos;
                          if (input.substr(pos, 2) === "\\t") {
                            result0 = "\\t";
                            pos += 2;
                          } else {
                            result0 = null;
                            if (reportFailures === 0) {
                              matchFailed("\"\\\\t\"");
                            }
                          }
                          if (result0 !== null) {
                            result0 = function(offset2) {
                              return "\t";
                            }(pos0);
                          }
                          if (result0 === null) {
                            pos = pos0;
                          }
                          if (result0 === null) {
                            pos0 = pos;
                            pos1 = pos;
                            if (input.substr(pos, 2) === "\\u") {
                              result0 = "\\u";
                              pos += 2;
                            } else {
                              result0 = null;
                              if (reportFailures === 0) {
                                matchFailed("\"\\\\u\"");
                              }
                            }
                            if (result0 !== null) {
                              result1 = parse_hexDigit();
                              if (result1 !== null) {
                                result22 = parse_hexDigit();
                                if (result22 !== null) {
                                  result3 = parse_hexDigit();
                                  if (result3 !== null) {
                                    result4 = parse_hexDigit();
                                    if (result4 !== null) {
                                      result0 = [result0, result1, result22, result3, result4];
                                    } else {
                                      result0 = null;
                                      pos = pos1;
                                    }
                                  } else {
                                    result0 = null;
                                    pos = pos1;
                                  }
                                } else {
                                  result0 = null;
                                  pos = pos1;
                                }
                              } else {
                                result0 = null;
                                pos = pos1;
                              }
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                            if (result0 !== null) {
                              result0 = function(offset2, h1, h2, h3, h4) {
                                return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
                              }(pos0, result0[1], result0[2], result0[3], result0[4]);
                            }
                            if (result0 === null) {
                              pos = pos0;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          return result0;
        }
        function parse_hexDigit() {
          var result0;
          if (/^[0-9a-fA-F]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9a-fA-F]");
            }
          }
          return result0;
        }
        function parse_identifier() {
          var result0, result1, result22;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          if (/^[_a-zA-Z]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[_a-zA-Z]");
            }
          }
          if (result0 !== null) {
            result1 = [];
            if (/^[_a-zA-Z0-9]/.test(input.charAt(pos))) {
              result22 = input.charAt(pos);
              pos++;
            } else {
              result22 = null;
              if (reportFailures === 0) {
                matchFailed("[_a-zA-Z0-9]");
              }
            }
            while (result22 !== null) {
              result1.push(result22);
              if (/^[_a-zA-Z0-9]/.test(input.charAt(pos))) {
                result22 = input.charAt(pos);
                pos++;
              } else {
                result22 = null;
                if (reportFailures === 0) {
                  matchFailed("[_a-zA-Z0-9]");
                }
              }
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2, head, tail) {
              return head + tail.join("");
            }(pos0, result0[0], result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        function parse_number() {
          var result0, result1, result22;
          var pos0, pos1;
          pos0 = pos;
          if (input.charCodeAt(pos) === 48) {
            result0 = "0";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"0\"");
            }
          }
          if (result0 !== null) {
            result0 = function(offset2) {
              return 0;
            }(pos0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (/^[1-9]/.test(input.charAt(pos))) {
              result0 = input.charAt(pos);
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("[1-9]");
              }
            }
            if (result0 !== null) {
              result1 = [];
              if (/^[0-9]/.test(input.charAt(pos))) {
                result22 = input.charAt(pos);
                pos++;
              } else {
                result22 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
              while (result22 !== null) {
                result1.push(result22);
                if (/^[0-9]/.test(input.charAt(pos))) {
                  result22 = input.charAt(pos);
                  pos++;
                } else {
                  result22 = null;
                  if (reportFailures === 0) {
                    matchFailed("[0-9]");
                  }
                }
              }
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = function(offset2, head, tail) {
                return parseInt(head + tail.join(""));
              }(pos0, result0[0], result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
          return result0;
        }
        function parse_size() {
          var result0, result1;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 58) {
            result0 = ":";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\":\"");
            }
          }
          if (result0 !== null) {
            result1 = parse_number();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2, num) {
              return num;
            }(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (input.charCodeAt(pos) === 58) {
              result0 = ":";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\":\"");
              }
            }
            if (result0 !== null) {
              result1 = parse_identifier();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = function(offset2, id) {
                return id;
              }(pos0, result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
          return result0;
        }
        function parse_specifierList() {
          var result0, result1, result22, result3;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 47) {
            result0 = "/";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"/\"");
            }
          }
          if (result0 !== null) {
            result1 = parse_specifier();
            if (result1 !== null) {
              result22 = [];
              result3 = parse_specifierTail();
              while (result3 !== null) {
                result22.push(result3);
                result3 = parse_specifierTail();
              }
              if (result22 !== null) {
                result0 = [result0, result1, result22];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2, head, tail) {
              tail.unshift(head);
              return tail;
            }(pos0, result0[1], result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        function parse_specifierTail() {
          var result0, result1;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 45) {
            result0 = "-";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"-\"");
            }
          }
          if (result0 !== null) {
            result1 = parse_specifier();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2, spec) {
              return spec;
            }(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        function parse_specifier() {
          var result0;
          if (input.substr(pos, 6) === "little") {
            result0 = "little";
            pos += 6;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"little\"");
            }
          }
          if (result0 === null) {
            if (input.substr(pos, 3) === "big") {
              result0 = "big";
              pos += 3;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"big\"");
              }
            }
            if (result0 === null) {
              if (input.substr(pos, 6) === "signed") {
                result0 = "signed";
                pos += 6;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"signed\"");
                }
              }
              if (result0 === null) {
                if (input.substr(pos, 8) === "unsigned") {
                  result0 = "unsigned";
                  pos += 8;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"unsigned\"");
                  }
                }
                if (result0 === null) {
                  if (input.substr(pos, 7) === "integer") {
                    result0 = "integer";
                    pos += 7;
                  } else {
                    result0 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"integer\"");
                    }
                  }
                  if (result0 === null) {
                    if (input.substr(pos, 6) === "binary") {
                      result0 = "binary";
                      pos += 6;
                    } else {
                      result0 = null;
                      if (reportFailures === 0) {
                        matchFailed("\"binary\"");
                      }
                    }
                    if (result0 === null) {
                      if (input.substr(pos, 5) === "float") {
                        result0 = "float";
                        pos += 5;
                      } else {
                        result0 = null;
                        if (reportFailures === 0) {
                          matchFailed("\"float\"");
                        }
                      }
                      if (result0 === null) {
                        result0 = parse_unit();
                      }
                    }
                  }
                }
              }
            }
          }
          return result0;
        }
        function parse_unit() {
          var result0, result1;
          var pos0, pos1;
          pos0 = pos;
          pos1 = pos;
          if (input.substr(pos, 5) === "unit:") {
            result0 = "unit:";
            pos += 5;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"unit:\"");
            }
          }
          if (result0 !== null) {
            result1 = parse_number();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = function(offset2, num) {
              return "unit:" + num;
            }(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        function parse_ws() {
          var result0, result1;
          result0 = [];
          if (/^[ \t\n]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[ \\t\\n]");
            }
          }
          while (result1 !== null) {
            result0.push(result1);
            if (/^[ \t\n]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[ \\t\\n]");
              }
            }
          }
          return result0;
        }
        function cleanupExpected(expected) {
          expected.sort();
          var lastExpected = null;
          var cleanExpected = [];
          for (var i = 0;i < expected.length; i++) {
            if (expected[i] !== lastExpected) {
              cleanExpected.push(expected[i]);
              lastExpected = expected[i];
            }
          }
          return cleanExpected;
        }
        function computeErrorPosition() {
          var line = 1;
          var column = 1;
          var seenCR = false;
          for (var i = 0;i < Math.max(pos, rightmostFailuresPos); i++) {
            var ch = input.charAt(i);
            if (ch === "\n") {
              if (!seenCR) {
                line++;
              }
              column = 1;
              seenCR = false;
            } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
              line++;
              column = 1;
              seenCR = true;
            } else {
              column++;
              seenCR = false;
            }
          }
          return { line, column };
        }
        var result2 = parseFunctions[startRule]();
        if (result2 === null || pos !== input.length) {
          var offset = Math.max(pos, rightmostFailuresPos);
          var found = offset < input.length ? input.charAt(offset) : null;
          var errorPosition = computeErrorPosition();
          throw new this.SyntaxError(cleanupExpected(rightmostFailuresExpected), found, offset, errorPosition.line, errorPosition.column);
        }
        return result2;
      },
      toSource: function() {
        return this._source;
      }
    };
    result.SyntaxError = function(expected, found, offset, line, column) {
      function buildMessage(expected2, found2) {
        var expectedHumanized, foundHumanized;
        switch (expected2.length) {
          case 0:
            expectedHumanized = "end of input";
            break;
          case 1:
            expectedHumanized = expected2[0];
            break;
          default:
            expectedHumanized = expected2.slice(0, expected2.length - 1).join(", ") + " or " + expected2[expected2.length - 1];
        }
        foundHumanized = found2 ? quote(found2) : "end of input";
        return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
      }
      this.name = "SyntaxError";
      this.expected = expected;
      this.found = found;
      this.message = buildMessage(expected, found);
      this.offset = offset;
      this.line = line;
      this.column = column;
    };
    result.SyntaxError.prototype = Error.prototype;
    return result;
  }();
});

// node_modules/@acuminous/bitsyntax/lib/parse.js
var require_parse = __commonJS((exports, module) => {
  function parse_pattern(string) {
    var segments = parser.parse(string);
    for (var i = 0, len = segments.length;i < len; i++) {
      var s = segments[i];
      if (s.string != null) {
        segments[i] = ast.string(s.string);
      } else if (s.value != null) {
        segments[i] = ast.value(s.value, s.size, s.specifiers);
      } else if (s.name != null) {
        segments[i] = ast.variable(s.name, s.size, s.specifiers);
      } else {
        throw "Unknown segment " + s;
      }
    }
    return segments;
  }
  var ast = require_pattern();
  var parser = require_parser();
  exports.parse = function() {
    var str = [].join.call(arguments, ",");
    return parse_pattern(str);
  };
});

// node_modules/debug/src/common.js
var require_common2 = __commonJS((exports, module) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self2 = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format2) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format2];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module.exports = setup;
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    let m;
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {
    }
  }
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  exports.log = console.debug || console.log || (() => {
  });
  module.exports = require_common2()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// node_modules/debug/src/node.js
var require_node3 = __commonJS((exports, module) => {
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  function formatArgs(args) {
    const { namespace: name, useColors: useColors2 } = this;
    if (useColors2) {
      const c = this.color;
      const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
      const prefix = `  ${colorCode};1m${name} \x1B[0m`;
      args[0] = prefix + args[0].split("\n").join("\n" + prefix);
      args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  }
  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  }
  function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
  }
  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for (let i = 0;i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  }
  var tty = import.meta.require("tty");
  var util = import.meta.require("util");
  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.destroy = util.deprecate(() => {
  }, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = (()=>{throw new Error(`Cannot require module "supports-color"`);})();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {
  }
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  module.exports = require_common2()(exports);
  var { formatters } = module.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// node_modules/debug/src/index.js
var require_src = __commonJS((exports, module) => {
  if (typeof process === "undefined" || process.type === "renderer" || false || process.__nwjs) {
    module.exports = require_browser();
  } else {
    module.exports = require_node3();
  }
});

// node_modules/@acuminous/bitsyntax/lib/interp.js
var require_interp = __commonJS((exports, module) => {
  function parse_int(bin, off, sizeInBytes, bigendian, signed) {
    switch (sizeInBytes) {
      case 1:
        return signed ? bin.readInt8(off) : bin.readUInt8(off);
      case 2:
        return bigendian ? signed ? bin.readInt16BE(off) : bin.readUInt16BE(off) : signed ? bin.readInt16LE(off) : bin.readUInt16LE(off);
      case 4:
        return bigendian ? signed ? bin.readInt32BE(off) : bin.readUInt32BE(off) : signed ? bin.readInt32LE(off) : bin.readUInt32LE(off);
      case 8:
        return bigendian ? (signed ? ints.readInt64BE : ints.readUInt64BE)(bin, off) : (signed ? ints.readInt64LE : ints.readUInt64LE)(bin, off);
      default:
        throw "Integers must be 8-, 16-, 32- or 64-bit";
    }
  }
  function parse_float(bin, off, sizeInBytes, bigendian) {
    switch (sizeInBytes) {
      case 4:
        return bigendian ? bin.readFloatBE(off) : bin.readFloatLE(off);
      case 8:
        return bigendian ? bin.readDoubleBE(off) : bin.readDoubleLE(off);
      default:
        throw "Floats must be 32- or 64-bit";
    }
  }
  function size_of(segment, bound) {
    var size = segment.size;
    if (typeof size === "string") {
      return bound[size];
    } else {
      return size;
    }
  }
  function new_scope(env) {
    function scope() {
    }
    scope.prototype = env;
    return new scope;
  }
  function bindings(scope) {
    var s = {};
    for (var k in scope) {
      if (scope.hasOwnProperty(k)) {
        s[k] = scope[k];
      }
    }
    return s;
  }
  function match(pattern, binary, boundvars) {
    var offset = 0, vars = new_scope(boundvars);
    var binsize = binary.length * 8;
    function skip_bits(segment2) {
      debug("skip bits");
      debug(segment2);
      var size = size_of(segment2, vars);
      if (size === true) {
        if (offset % 8 === 0) {
          offset = binsize;
          return true;
        } else {
          return false;
        }
      }
      var bits = segment2.unit * size;
      if (offset + bits > binsize) {
        return false;
      } else {
        offset += bits;
      }
    }
    function get_integer(segment2) {
      debug("get_integer");
      debug(segment2);
      var unit = segment2.unit, size = size_of(segment2, vars);
      var bitsize = size * unit;
      var byteoffset = offset / 8;
      offset += bitsize;
      if (bitsize % 8 > 0 || offset > binsize) {
        return false;
      } else {
        return parse_int(binary, byteoffset, bitsize / 8, segment2.bigendian, segment2.signed);
      }
    }
    function get_float(segment2) {
      debug("get_float");
      debug(segment2);
      var unit = segment2.unit;
      var size = size_of(segment2, vars);
      var bitsize = size * unit;
      var byteoffset = offset / 8;
      offset += bitsize;
      if (offset > binsize) {
        return false;
      } else {
        return parse_float(binary, byteoffset, bitsize / 8, segment2.bigendian);
      }
    }
    function get_binary(segment2) {
      debug("get_binary");
      debug(segment2);
      var unit = segment2.unit, size = size_of(segment2, vars);
      var byteoffset = offset / 8;
      if (size === true) {
        offset = binsize;
        return binary.slice(byteoffset);
      } else {
        var bitsize = size * unit;
        if (bitsize % 8 > 0 || offset + bitsize > binsize) {
          return false;
        } else {
          offset += bitsize;
          return binary.slice(byteoffset, byteoffset + bitsize / 8);
        }
      }
    }
    function get_string(segment2) {
      debug("get_string");
      debug(segment2);
      var len = segment2.value.length;
      var byteoffset = offset / 8;
      offset += len * 8;
      if (offset > binsize) {
        return false;
      }
      return binary.slice(byteoffset, byteoffset + len).toString("utf8");
    }
    var patternlen = pattern.length;
    for (var i = 0;i < patternlen; i++) {
      var segment = pattern[i];
      var result = false;
      if (segment.name === "_") {
        result = skip_bits(segment);
      } else {
        switch (segment.type) {
          case "string":
            result = get_string(segment);
            break;
          case "integer":
            result = get_integer(segment);
            break;
          case "float":
            result = get_float(segment);
            break;
          case "binary":
            result = get_binary(segment);
            break;
        }
        if (result === false) {
          return false;
        } else if (segment.name) {
          vars[segment.name] = result;
        } else if (segment.value != result) {
          return false;
        }
      }
    }
    if (offset == binsize) {
      return bindings(vars);
    } else {
      return false;
    }
  }
  var ints = require_buffer_more_ints();
  var debug = require_src()("bitsyntax-Interpreter");
  exports.match = match;
  exports.parse_int = parse_int;
  exports.parse_float = parse_float;
});

// node_modules/safe-buffer/index.js
var require_safe_buffer2 = __commonJS((exports, module) => {
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  var buffer = import.meta.require("buffer");
  var Buffer2 = buffer.Buffer;
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== undefined) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
});

// node_modules/@acuminous/bitsyntax/lib/constructor.js
var require_constructor = __commonJS((exports, module) => {
  function write(buf, offset, pattern, bindings) {
    for (var i = 0, len = pattern.length;i < len; i++) {
      var segment = pattern[i];
      switch (segment.type) {
        case "string":
          offset += buf.write(segment.value, offset, "utf8");
          break;
        case "binary":
          offset += writeBinary(segment, buf, offset, bindings);
          break;
        case "integer":
          offset += writeInteger(segment, buf, offset, bindings);
          break;
        case "float":
          offset += writeFloat(segment, buf, offset, bindings);
          break;
      }
    }
    return offset;
  }
  function build(pattern, bindings) {
    var bufsize = size_of(pattern, bindings);
    var buf = Buffer2.alloc(bufsize);
    write(buf, 0, pattern, bindings);
    return buf;
  }
  function size_of_segment(segment, bindings) {
    if (typeof segment.size === "string") {
      return bindings[segment.size] * segment.unit / 8;
    }
    if (segment.type === "string") {
      return Buffer2.byteLength(segment.value, "utf8");
    }
    if (segment.type === "binary" && segment.size === true) {
      var val = bindings[segment.name];
      return val.length;
    }
    return segment.size * segment.unit / 8;
  }
  function size_of(segments, bindings) {
    var size = 0;
    for (var i = 0, len = segments.length;i < len; i++) {
      size += size_of_segment(segments[i], bindings);
    }
    return size;
  }
  function writeBinary(segment, buf, offset, bindings) {
    var bin = bindings[segment.name];
    var size = size_of_segment(segment, bindings);
    bin.copy(buf, offset, 0, size);
    return size;
  }
  function writeInteger(segment, buf, offset, bindings) {
    var value = segment.name ? bindings[segment.name] : segment.value;
    var size = size_of_segment(segment, bindings);
    return write_int(buf, value, offset, size, segment.bigendian);
  }
  function write_int(buf, value, offset, size, bigendian) {
    switch (size) {
      case 1:
        buf.writeUInt8(value, offset);
        break;
      case 2:
        bigendian ? buf.writeUInt16BE(value, offset) : buf.writeUInt16LE(value, offset);
        break;
      case 4:
        bigendian ? buf.writeUInt32BE(value, offset) : buf.writeUInt32LE(value, offset);
        break;
      case 8:
        bigendian ? ints.writeUInt64BE(buf, value, offset) : ints.writeUInt64LE(buf, value, offset);
        break;
      default:
        throw new Error("integer size * unit must be 8, 16, 32 or 64");
    }
    return size;
  }
  function writeFloat(segment, buf, offset, bindings) {
    var value = segment.name ? bindings[segment.name] : segment.value;
    var size = size_of_segment(segment, bindings);
    return write_float(buf, value, offset, size, segment.bigendian);
  }
  function write_float(buf, value, offset, size, bigendian) {
    if (size === 4) {
      bigendian ? buf.writeFloatBE(value, offset) : buf.writeFloatLE(value, offset);
    } else if (size === 8) {
      bigendian ? buf.writeDoubleBE(value, offset) : buf.writeDoubleLE(value, offset);
    } else {
      throw new Error("float size * unit must be 32 or 64");
    }
    return size;
  }
  var ints = require_buffer_more_ints();
  var Buffer2 = require_safe_buffer2().Buffer;
  var parse2 = require_parse().parse;
  exports.write = write;
  exports.build = build;
  exports.write_int = write_int;
  exports.write_float = write_float;
  exports.builder = function(pstr) {
    pstr = arguments.length > 1 ? [].join.call(arguments, ",") : pstr;
    var pattern = parse2(pstr);
    return function(vars) {
      return build(pattern, vars);
    };
  };
});

// node_modules/@acuminous/bitsyntax/lib/compile.js
var require_compile = __commonJS((exports, module) => {
  function $start() {
    lines = [];
  }
  function $line() {
    lines.push($.apply(null, arguments));
  }
  function $result() {
    return lines.join("\n");
  }
  function bits_expr(segment) {
    if (typeof segment.size === "string") {
      return $("%s * %d", var_name(segment.size), segment.unit);
    } else {
      return (segment.size * segment.unit).toString();
    }
  }
  function get_number(segment) {
    $line("bits = %s;\n", bits_expr(segment));
    var parser = segment.type === "integer" ? "parse_int" : "parse_float";
    var { bigendian: be, signed: sg } = segment;
    $line("byteoffset = offset / 8; offset += bits");
    $line("if (offset > binsize) { return false; }");
    $line("else { result = %s(bin, byteoffset, bits / 8, %s, %s); }", parser, be, sg);
  }
  function get_binary(segment) {
    $line("byteoffset = offset / 8;");
    if (segment.size === true) {
      $line("offset = binsize;");
      $line("result = bin.slice(byteoffset);");
    } else {
      $line("bits = %s;", bits_expr(segment));
      $line("offset += bits;");
      $line("if (offset > binsize) { return false; }");
      $line("else { result = bin.slice(byteoffset,", "byteoffset + bits / 8); }");
    }
  }
  function get_string(segment) {
    $line("byteoffset = offset / 8;");
    var strlen = segment.value.length;
    var strlenbits = strlen * 8;
    $line("offset += %d;", strlenbits);
    $line("if (offset > binsize) { return false; }");
    $line("else { result = bin.toString(byteoffset,", $("byteoffset + %d); }", strlen));
  }
  function skip_bits(segment) {
    if (typeof segment.size === "string") {
      $line("var skipbits = %s * %d;", var_name(segment.size), segment.unit);
      $line("if (offset + skipbits > binsize) { return false; }");
      $line("else { offset += skipbits; }");
    } else if (segment.size === true) {
      $line("if (offset % 8 === 0) { offset = binsize; }");
      $line("else { return false; }");
    } else {
      var bits = segment.unit * segment.size;
      $line("if (offset + %d > binsize) { return false; }", bits);
      $line("else { offset += %d; }", bits);
    }
  }
  function match_seg(segment) {
    if (segment.name === "_") {
      skip_bits(segment);
    } else {
      var assign_result;
      switch (segment.type) {
        case "integer":
        case "float":
          get_number(segment);
          break;
        case "binary":
          get_binary(segment);
          break;
        case "string":
          get_string(segment);
          break;
      }
      $line("if (result === false) return false;");
      if (segment.name) {
        $line("else if (%s !== undefined) {", var_name(segment.name));
        $line("if (%s != result) return false;", var_name(segment.name));
        $line("}");
        $line("else %s = result;", var_name(segment.name));
      } else {
        var repr = JSON.stringify(segment.value);
        $line("else if (result != %s) return false;", repr);
      }
    }
  }
  function var_name(name) {
    return "var_" + name;
  }
  function variables(segments) {
    var names = {};
    for (var i = 0;i < segments.length; i++) {
      var name = segments[i].name;
      if (name && name !== "_") {
        names[name] = true;
      }
      name = segments[i].size;
      if (typeof name === "string") {
        names[name] = true;
      }
    }
    return Object.keys(names);
  }
  function compile_pattern(segments) {
    $start();
    $line("return function(binary, env) {");
    $line("'use strict';");
    $line("var bin = binary, env = env || {};");
    $line("var offset = 0, binsize = bin.length * 8;");
    $line("var bits, result, byteoffset;");
    var varnames = variables(segments);
    for (var v = 0;v < varnames.length; v++) {
      var name = varnames[v];
      $line("var %s = env['%s'];", var_name(name), name);
    }
    var len = segments.length;
    for (var i = 0;i < len; i++) {
      var segment = segments[i];
      $line("// " + JSON.stringify(segment));
      match_seg(segment);
    }
    $line("if (offset == binsize) {");
    $line("return {");
    for (var v = 0;v < varnames.length; v++) {
      var name = varnames[v];
      $line("%s: %s,", name, var_name(name));
    }
    $line("};");
    $line("}");
    $line("else return false;");
    $line("}");
    var fn = new Function("parse_int", "parse_float", $result());
    return fn(parse_int, parse_float);
  }
  function write_seg(segment) {
    switch (segment.type) {
      case "string":
        $line("offset += buf.write(%s, offset, 'utf8');", JSON.stringify(segment.value));
        break;
      case "binary":
        $line("val = bindings['%s'];", segment.name);
        if (segment.size === true) {
          $line("size = val.length;");
        } else if (typeof segment.size === "string") {
          $line("size = (bindings['%s'] * %d) / 8;", segment.size, segment.unit);
        } else {
          $line("size = %d;", segment.size * segment.unit / 8);
        }
        $line("val.copy(buf, offset, 0, size);");
        $line("offset += size;");
        break;
      case "integer":
      case "float":
        write_number(segment);
        break;
    }
  }
  function write_number(segment) {
    if (segment.name) {
      $line("val = bindings['%s'];", segment.name);
    } else {
      $line("val = %d", segment.value);
    }
    var writer = segment.type === "integer" ? "write_int" : "write_float";
    if (typeof segment.size === "string") {
      $line("size = (bindings['%s'] * %d) / 8;", segment.size, segment.unit);
    } else {
      $line("size = %d;", segment.size * segment.unit / 8);
    }
    $line("%s(buf, val, offset, size, %s);", writer, segment.bigendian);
    $line("offset += size;");
  }
  function size_of(segments) {
    var variable = [];
    var fixed = 0;
    for (var i = 0;i < segments.length; i++) {
      var segment = segments[i];
      if (typeof segment.size === "string" || segment.size === true) {
        variable.push(segment);
      } else if (segment.type === "string") {
        fixed += Buffer2.byteLength(segment.value);
      } else {
        fixed += segment.size * segment.unit / 8;
      }
    }
    $line("var buffersize = %d;", fixed);
    if (variable.length > 0) {
      for (var j = 0;j < variable.length; j++) {
        var segment = variable[j];
        if (segment.size === true) {
          $line("buffersize += bindings['%s'].length;", segment.name);
        } else {
          $line("buffersize += (bindings['%s'] * %d) / 8;", segment.size, segment.unit);
        }
      }
    }
  }
  function emit_write(segments) {
    $line("var val, size;");
    var len = segments.length;
    for (var i = 0;i < len; i++) {
      var segment = segments[i];
      $line("// %s", JSON.stringify(segment));
      write_seg(segment);
    }
  }
  function compile_ctor(segments) {
    $start();
    $line("return function(bindings) {");
    $line("'use strict';");
    size_of(segments);
    $line("var buf = Buffer.alloc(buffersize);");
    $line("var offset = 0;");
    emit_write(segments);
    $line("return buf;");
    $line("}");
    return new Function("write_int", "write_float", "Buffer", $result())(write_int, write_float, Buffer2);
  }
  require_buffer_more_ints();
  var $ = import.meta.require("util").format;
  var parse2 = require_parse().parse;
  var interp = require_interp();
  var parse_int = interp.parse_int;
  var parse_float = interp.parse_float;
  var construct = require_constructor();
  var write_int = construct.write_int;
  var write_float = construct.write_float;
  var Buffer2 = require_safe_buffer2().Buffer;
  var lines = [];
  exports.compile_pattern = compile_pattern;
  exports.compile = function() {
    var str = [].join.call(arguments, ",");
    var p = parse2(str);
    return compile_pattern(p);
  };
  exports.compile_builder = function() {
    var str = [].join.call(arguments, ",");
    var p = parse2(str);
    return compile_ctor(p);
  };
});

// node_modules/@acuminous/bitsyntax/index.js
var require_bitsyntax = __commonJS((exports, module) => {
  exports.parse = require_parse().parse;
  exports.match = require_interp().match;
  exports.build = require_constructor().build;
  exports.write = require_constructor().write;
  exports.matcher = exports.compile = require_compile().compile;
  exports.builder = require_compile().compile_builder;
});

// node_modules/amqplib/lib/frame.js
var require_frame = __commonJS((exports, module) => {
  function parseFrame(bin, max) {
    var fh = frameHeaderPattern(bin);
    if (fh) {
      var { size, rest } = fh;
      if (size > max) {
        throw new Error("Frame size exceeds frame max");
      } else if (rest.length > size) {
        if (rest[size] !== FRAME_END)
          throw new Error("Invalid frame");
        return {
          type: fh.type,
          channel: fh.channel,
          size,
          payload: rest.slice(0, size),
          rest: rest.slice(size + 1)
        };
      }
    }
    return false;
  }
  var defs = require_defs();
  var constants = defs.constants;
  var decode = defs.decode;
  var Bits = require_bitsyntax();
  exports.PROTOCOL_HEADER = "AMQP" + String.fromCharCode(0, 0, 9, 1);
  var FRAME_METHOD = constants.FRAME_METHOD;
  var FRAME_HEARTBEAT = constants.FRAME_HEARTBEAT;
  var FRAME_HEADER = constants.FRAME_HEADER;
  var FRAME_BODY = constants.FRAME_BODY;
  var FRAME_END = constants.FRAME_END;
  var bodyCons = Bits.builder(FRAME_BODY, "channel:16, size:32, payload:size/binary", FRAME_END);
  exports.makeBodyFrame = function(channel, payload) {
    return bodyCons({ channel, size: payload.length, payload });
  };
  var frameHeaderPattern = Bits.matcher("type:8", "channel:16", "size:32", "rest/binary");
  exports.parseFrame = parseFrame;
  var headerPattern = Bits.matcher("class:16", "_weight:16", "size:64", "flagsAndfields/binary");
  var methodPattern = Bits.matcher("id:32, args/binary");
  var HEARTBEAT = { channel: 0 };
  exports.decodeFrame = function(frame) {
    var payload = frame.payload;
    switch (frame.type) {
      case FRAME_METHOD:
        var idAndArgs = methodPattern(payload);
        var id = idAndArgs.id;
        var fields = decode(id, idAndArgs.args);
        return { id, channel: frame.channel, fields };
      case FRAME_HEADER:
        var parts = headerPattern(payload);
        var id = parts["class"];
        var fields = decode(id, parts.flagsAndfields);
        return {
          id,
          channel: frame.channel,
          size: parts.size,
          fields
        };
      case FRAME_BODY:
        return { channel: frame.channel, content: frame.payload };
      case FRAME_HEARTBEAT:
        return HEARTBEAT;
      default:
        throw new Error("Unknown frame type " + frame.type);
    }
  };
  exports.HEARTBEAT_BUF = Buffer.from([
    constants.FRAME_HEARTBEAT,
    0,
    0,
    0,
    0,
    0,
    0,
    constants.FRAME_END
  ]);
  exports.HEARTBEAT = HEARTBEAT;
});

// node_modules/amqplib/lib/mux.js
var require_mux = __commonJS((exports, module) => {
  var assert = import.meta.require("assert");
  var schedule = typeof setImmediate === "function" ? setImmediate : process.nextTick;

  class Mux {
    constructor(downstream) {
      this.newStreams = [];
      this.oldStreams = [];
      this.blocked = false;
      this.scheduledRead = false;
      this.out = downstream;
      var self2 = this;
      downstream.on("drain", function() {
        self2.blocked = false;
        self2._readIncoming();
      });
    }
    _readIncoming() {
      if (this.blocked)
        return;
      var accepting = true;
      var out = this.out;
      function roundrobin(streams) {
        var s;
        while (accepting && (s = streams.shift())) {
          var chunk = s.read();
          if (chunk !== null) {
            accepting = out.write(chunk);
            streams.push(s);
          }
        }
      }
      roundrobin(this.newStreams);
      if (accepting) {
        assert.equal(0, this.newStreams.length);
        roundrobin(this.oldStreams);
      } else {
        assert(this.newStreams.length > 0, "Expect some new streams to remain");
        Array.prototype.push.apply(this.oldStreams, this.newStreams);
        this.newStreams = [];
      }
      this.blocked = !accepting;
    }
    _scheduleRead() {
      var self2 = this;
      if (!self2.scheduledRead) {
        schedule(function() {
          self2.scheduledRead = false;
          self2._readIncoming();
        });
        self2.scheduledRead = true;
      }
    }
    pipeFrom(readable) {
      var self2 = this;
      function enqueue() {
        self2.newStreams.push(readable);
        self2._scheduleRead();
      }
      function cleanup() {
        readable.removeListener("readable", enqueue);
        readable.removeListener("error", cleanup);
        readable.removeListener("end", cleanup);
        readable.removeListener("unpipeFrom", cleanupIfMe);
      }
      function cleanupIfMe(dest) {
        if (dest === self2)
          cleanup();
      }
      readable.on("unpipeFrom", cleanupIfMe);
      readable.on("end", cleanup);
      readable.on("error", cleanup);
      readable.on("readable", enqueue);
    }
    unpipeFrom(readable) {
      readable.emit("unpipeFrom", this);
    }
  }
  exports.Mux = Mux;
});

// node_modules/amqplib/lib/heartbeat.js
var require_heartbeat = __commonJS((exports, module) => {
  var EventEmitter = import.meta.require("events");
  exports.UNITS_TO_MS = 1000;

  class Heart extends EventEmitter {
    constructor(interval, checkSend, checkRecv) {
      super();
      this.interval = interval;
      var intervalMs = interval * exports.UNITS_TO_MS;
      var beat = this.emit.bind(this, "beat");
      var timeout = this.emit.bind(this, "timeout");
      this.sendTimer = setInterval(this.runHeartbeat.bind(this, checkSend, beat), intervalMs / 2);
      var recvMissed = 0;
      function missedTwo() {
        if (!checkRecv())
          return ++recvMissed < 2;
        else {
          recvMissed = 0;
          return true;
        }
      }
      this.recvTimer = setInterval(this.runHeartbeat.bind(this, missedTwo, timeout), intervalMs);
    }
    clear() {
      clearInterval(this.sendTimer);
      clearInterval(this.recvTimer);
    }
    runHeartbeat(check, fail) {
      if (!check())
        fail();
    }
  }
  exports.Heart = Heart;
});

// node_modules/amqplib/lib/format.js
var require_format2 = __commonJS((exports, module) => {
  var defs = require_defs();
  var format2 = import.meta.require("util").format;
  var HEARTBEAT = require_frame().HEARTBEAT;
  exports.closeMessage = function(close) {
    var code = close.fields.replyCode;
    return format2('%d (%s) with message "%s"', code, defs.constant_strs[code], close.fields.replyText);
  };
  exports.methodName = function(id) {
    return defs.info(id).name;
  };
  exports.inspect = function(frame, showFields) {
    if (frame === HEARTBEAT) {
      return "<Heartbeat>";
    } else if (!frame.id) {
      return format2("<Content channel:%d size:%d>", frame.channel, frame.size);
    } else {
      var info = defs.info(frame.id);
      return format2("<%s channel:%d%s>", info.name, frame.channel, showFields ? " " + JSON.stringify(frame.fields, undefined, 2) : "");
    }
  };
});

// node_modules/amqplib/lib/bitset.js
var require_bitset = __commonJS((exports, module) => {
  function wordIndex(bitIndex) {
    return Math.floor(bitIndex / 32);
  }
  function trailingZeros(i) {
    if (i === 0)
      return 32;
    let y, n = 31;
    y = i << 16;
    if (y != 0) {
      n = n - 16;
      i = y;
    }
    y = i << 8;
    if (y != 0) {
      n = n - 8;
      i = y;
    }
    y = i << 4;
    if (y != 0) {
      n = n - 4;
      i = y;
    }
    y = i << 2;
    if (y != 0) {
      n = n - 2;
      i = y;
    }
    return n - (i << 1 >>> 31);
  }

  class BitSet {
    constructor(size) {
      if (size) {
        const numWords = Math.ceil(size / 32);
        this.words = new Array(numWords);
      } else {
        this.words = [];
      }
      this.wordsInUse = 0;
    }
    ensureSize(numWords) {
      const wordsPresent = this.words.length;
      if (wordsPresent < numWords) {
        this.words = this.words.concat(new Array(numWords - wordsPresent));
      }
    }
    set(bitIndex) {
      const w = wordIndex(bitIndex);
      if (w >= this.wordsInUse) {
        this.ensureSize(w + 1);
        this.wordsInUse = w + 1;
      }
      const bit = 1 << bitIndex;
      this.words[w] |= bit;
    }
    clear(bitIndex) {
      const w = wordIndex(bitIndex);
      if (w >= this.wordsInUse)
        return;
      const mask = ~(1 << bitIndex);
      this.words[w] &= mask;
    }
    get(bitIndex) {
      const w = wordIndex(bitIndex);
      if (w >= this.wordsInUse)
        return false;
      const bit = 1 << bitIndex;
      return !!(this.words[w] & bit);
    }
    nextSetBit(fromIndex) {
      let w = wordIndex(fromIndex);
      if (w >= this.wordsInUse)
        return -1;
      let word = this.words[w] & 4294967295 << fromIndex;
      while (true) {
        if (word)
          return w * 32 + trailingZeros(word);
        w++;
        if (w === this.wordsInUse)
          return -1;
        word = this.words[w];
      }
    }
    nextClearBit(fromIndex) {
      let w = wordIndex(fromIndex);
      if (w >= this.wordsInUse)
        return fromIndex;
      let word = ~this.words[w] & 4294967295 << fromIndex;
      while (true) {
        if (word)
          return w * 32 + trailingZeros(word);
        w++;
        if (w == this.wordsInUse)
          return w * 32;
        word = ~this.words[w];
      }
    }
  }
  exports.BitSet = BitSet;
});

// node_modules/amqplib/lib/error.js
var require_error = __commonJS((exports, module) => {
  function trimStack(stack, num) {
    return stack && stack.split("\n").slice(num).join("\n");
  }
  function IllegalOperationError(msg, stack) {
    var tmp = new Error;
    this.message = msg;
    this.stack = this.toString() + "\n" + trimStack(tmp.stack, 2);
    this.stackAtStateChange = stack;
  }
  function stackCapture(reason) {
    var e = new Error;
    return "Stack capture: " + reason + "\n" + trimStack(e.stack, 2);
  }
  var inherits = import.meta.require("util").inherits;
  inherits(IllegalOperationError, Error);
  IllegalOperationError.prototype.name = "IllegalOperationError";
  exports.IllegalOperationError = IllegalOperationError;
  exports.stackCapture = stackCapture;
});

// node_modules/amqplib/lib/connection.js
var require_connection = __commonJS((exports, module) => {
  function mainAccept(frame2) {
    var rec = this.channels[frame2.channel];
    if (rec) {
      return rec.channel.accept(frame2);
    } else
      this.closeWithError(fmt("Frame on unknown channel %d", frame2.channel), constants.CHANNEL_ERROR, new Error(fmt("Frame on unknown channel: %s", inspect(frame2, false))));
  }
  function channel0(connection) {
    return function(f) {
      if (f === HEARTBEAT)
        ;
      else if (f.id === defs.ConnectionClose) {
        connection.sendMethod(0, defs.ConnectionCloseOk, {});
        var emsg = fmt("Connection closed: %s", closeMsg(f));
        var s = stackCapture(emsg);
        var e = new Error(emsg);
        e.code = f.fields.replyCode;
        if (isFatalError(e)) {
          connection.emit("error", e);
        }
        connection.toClosed(s, e);
      } else if (f.id === defs.ConnectionBlocked) {
        connection.emit("blocked", f.fields.reason);
      } else if (f.id === defs.ConnectionUnblocked) {
        connection.emit("unblocked");
      } else if (f.id === defs.ConnectionUpdateSecretOk) {
        connection.emit("update-secret-ok");
      } else {
        connection.closeWithError(fmt("Unexpected frame on channel 0"), constants.UNEXPECTED_FRAME, new Error(fmt("Unexpected frame on channel 0: %s", inspect(f, false))));
      }
    };
  }
  function invalidOp(msg, stack) {
    return function() {
      throw new IllegalOperationError(msg, stack);
    };
  }
  function invalidateSend(conn, msg, stack) {
    conn.sendMethod = conn.sendContent = conn.sendMessage = invalidOp(msg, stack);
  }
  function wrapStream(s) {
    if (s instanceof Duplex)
      return s;
    else {
      var ws = new Duplex;
      ws.wrap(s);
      ws._write = function(chunk, encoding, callback) {
        return s.write(chunk, encoding, callback);
      };
      return ws;
    }
  }
  function isFatalError(error) {
    switch (error && error.code) {
      case defs.constants.CONNECTION_FORCED:
      case defs.constants.REPLY_SUCCESS:
        return false;
      default:
        return true;
    }
  }
  var defs = require_defs();
  var constants = defs.constants;
  var frame = require_frame();
  var HEARTBEAT = frame.HEARTBEAT;
  var Mux = require_mux().Mux;
  var Duplex = import.meta.require("stream").Duplex;
  var EventEmitter = import.meta.require("events");
  var Heart = require_heartbeat().Heart;
  var methodName = require_format2().methodName;
  var closeMsg = require_format2().closeMessage;
  var inspect = require_format2().inspect;
  var BitSet = require_bitset().BitSet;
  var fmt = import.meta.require("util").format;
  var PassThrough = import.meta.require("stream").PassThrough;
  var IllegalOperationError = require_error().IllegalOperationError;
  var stackCapture = require_error().stackCapture;
  var DEFAULT_WRITE_HWM = 1024;
  var SINGLE_CHUNK_THRESHOLD = 2048;

  class Connection extends EventEmitter {
    constructor(underlying) {
      super();
      var stream = this.stream = wrapStream(underlying);
      this.muxer = new Mux(stream);
      this.rest = Buffer.alloc(0);
      this.frameMax = constants.FRAME_MIN_SIZE;
      this.sentSinceLastCheck = false;
      this.recvSinceLastCheck = false;
      this.expectSocketClose = false;
      this.freeChannels = new BitSet;
      this.channels = [{
        channel: { accept: channel0(this) },
        buffer: underlying
      }];
    }
    sendProtocolHeader() {
      this.sendBytes(frame.PROTOCOL_HEADER);
    }
    open(allFields, openCallback0) {
      var self2 = this;
      var openCallback = openCallback0 || function() {
      };
      var tunedOptions = Object.create(allFields);
      function wait(k) {
        self2.step(function(err, frame2) {
          if (err !== null)
            bail(err);
          else if (frame2.channel !== 0) {
            bail(new Error(fmt("Frame on channel != 0 during handshake: %s", inspect(frame2, false))));
          } else
            k(frame2);
        });
      }
      function expect(Method, k) {
        wait(function(frame2) {
          if (frame2.id === Method)
            k(frame2);
          else {
            bail(new Error(fmt("Expected %s; got %s", methodName(Method), inspect(frame2, false))));
          }
        });
      }
      function bail(err) {
        openCallback(err);
      }
      function send(Method) {
        self2.sendMethod(0, Method, tunedOptions);
      }
      function negotiate(server, desired) {
        if (server === 0 || desired === 0) {
          return Math.max(server, desired);
        } else {
          return Math.min(server, desired);
        }
      }
      function onStart(start) {
        var mechanisms = start.fields.mechanisms.toString().split(" ");
        if (mechanisms.indexOf(allFields.mechanism) < 0) {
          bail(new Error(fmt("SASL mechanism %s is not provided by the server", allFields.mechanism)));
          return;
        }
        self2.serverProperties = start.fields.serverProperties;
        try {
          send(defs.ConnectionStartOk);
        } catch (err) {
          bail(err);
          return;
        }
        wait(afterStartOk);
      }
      function afterStartOk(reply) {
        switch (reply.id) {
          case defs.ConnectionSecure:
            bail(new Error("Wasn't expecting to have to go through secure"));
            break;
          case defs.ConnectionClose:
            bail(new Error(fmt("Handshake terminated by server: %s", closeMsg(reply))));
            break;
          case defs.ConnectionTune:
            var fields = reply.fields;
            tunedOptions.frameMax = negotiate(fields.frameMax, allFields.frameMax);
            tunedOptions.channelMax = negotiate(fields.channelMax, allFields.channelMax);
            tunedOptions.heartbeat = negotiate(fields.heartbeat, allFields.heartbeat);
            try {
              send(defs.ConnectionTuneOk);
              send(defs.ConnectionOpen);
            } catch (err) {
              bail(err);
              return;
            }
            expect(defs.ConnectionOpenOk, onOpenOk);
            break;
          default:
            bail(new Error(fmt("Expected connection.secure, connection.close, " + "or connection.tune during handshake; got %s", inspect(reply, false))));
            break;
        }
      }
      function onOpenOk(openOk) {
        self2.channelMax = tunedOptions.channelMax || 65535;
        self2.frameMax = tunedOptions.frameMax || 4294967295;
        self2.heartbeat = tunedOptions.heartbeat;
        self2.heartbeater = self2.startHeartbeater();
        self2.accept = mainAccept;
        succeed(openOk);
      }
      function endWhileOpening(err) {
        bail(err || new Error("Socket closed abruptly " + "during opening handshake"));
      }
      this.stream.on("end", endWhileOpening);
      this.stream.on("error", endWhileOpening);
      function succeed(ok) {
        self2.stream.removeListener("end", endWhileOpening);
        self2.stream.removeListener("error", endWhileOpening);
        self2.stream.on("error", self2.onSocketError.bind(self2));
        self2.stream.on("end", self2.onSocketError.bind(self2, new Error("Unexpected close")));
        self2.on("frameError", self2.onSocketError.bind(self2));
        self2.acceptLoop();
        openCallback(null, ok);
      }
      this.sendProtocolHeader();
      expect(defs.ConnectionStart, onStart);
    }
    close(closeCallback) {
      var k = closeCallback && function() {
        closeCallback(null);
      };
      this.closeBecause("Cheers, thanks", constants.REPLY_SUCCESS, k);
    }
    closeBecause(reason, code, k) {
      this.sendMethod(0, defs.ConnectionClose, {
        replyText: reason,
        replyCode: code,
        methodId: 0,
        classId: 0
      });
      var s = stackCapture("closeBecause called: " + reason);
      this.toClosing(s, k);
    }
    closeWithError(reason, code, error) {
      this.emit("error", error);
      this.closeBecause(reason, code);
    }
    onSocketError(err) {
      if (!this.expectSocketClose) {
        this.expectSocketClose = true;
        this.emit("error", err);
        var s = stackCapture("Socket error");
        this.toClosed(s, err);
      }
    }
    toClosing(capturedStack, k) {
      var send = this.sendMethod.bind(this);
      this.accept = function(f) {
        if (f.id === defs.ConnectionCloseOk) {
          if (k)
            k();
          var s = stackCapture("ConnectionCloseOk received");
          this.toClosed(s, undefined);
        } else if (f.id === defs.ConnectionClose) {
          send(0, defs.ConnectionCloseOk, {});
        }
      };
      invalidateSend(this, "Connection closing", capturedStack);
    }
    _closeChannels(capturedStack) {
      for (var i = 1;i < this.channels.length; i++) {
        var ch = this.channels[i];
        if (ch !== null) {
          ch.channel.toClosed(capturedStack);
        }
      }
    }
    toClosed(capturedStack, maybeErr) {
      this._closeChannels(capturedStack);
      var info = fmt("Connection closed (%s)", maybeErr ? maybeErr.toString() : "by client");
      invalidateSend(this, info, capturedStack);
      this.accept = invalidOp(info, capturedStack);
      this.close = function(cb) {
        cb && cb(new IllegalOperationError(info, capturedStack));
      };
      if (this.heartbeater)
        this.heartbeater.clear();
      this.expectSocketClose = true;
      this.stream.end();
      this.emit("close", maybeErr);
    }
    _updateSecret(newSecret, reason, cb) {
      this.sendMethod(0, defs.ConnectionUpdateSecret, {
        newSecret,
        reason
      });
      this.once("update-secret-ok", cb);
    }
    startHeartbeater() {
      if (this.heartbeat === 0)
        return null;
      else {
        var self2 = this;
        var hb = new Heart(this.heartbeat, this.checkSend.bind(this), this.checkRecv.bind(this));
        hb.on("timeout", function() {
          var hberr = new Error("Heartbeat timeout");
          self2.emit("error", hberr);
          var s = stackCapture("Heartbeat timeout");
          self2.toClosed(s, hberr);
        });
        hb.on("beat", function() {
          self2.sendHeartbeat();
        });
        return hb;
      }
    }
    freshChannel(channel, options) {
      var next = this.freeChannels.nextClearBit(1);
      if (next < 0 || next > this.channelMax)
        throw new Error("No channels left to allocate");
      this.freeChannels.set(next);
      var hwm = options && options.highWaterMark || DEFAULT_WRITE_HWM;
      var writeBuffer = new PassThrough({
        objectMode: true,
        highWaterMark: hwm
      });
      this.channels[next] = { channel, buffer: writeBuffer };
      writeBuffer.on("drain", function() {
        channel.onBufferDrain();
      });
      this.muxer.pipeFrom(writeBuffer);
      return next;
    }
    releaseChannel(channel) {
      this.freeChannels.clear(channel);
      var buffer = this.channels[channel].buffer;
      buffer.end();
      this.channels[channel] = null;
    }
    acceptLoop() {
      var self2 = this;
      function go() {
        try {
          var f;
          while (f = self2.recvFrame())
            self2.accept(f);
        } catch (e) {
          self2.emit("frameError", e);
        }
      }
      self2.stream.on("readable", go);
      go();
    }
    step(cb) {
      var self2 = this;
      function recv() {
        var f;
        try {
          f = self2.recvFrame();
        } catch (e) {
          cb(e, null);
          return;
        }
        if (f)
          cb(null, f);
        else
          self2.stream.once("readable", recv);
      }
      recv();
    }
    checkSend() {
      var check = this.sentSinceLastCheck;
      this.sentSinceLastCheck = false;
      return check;
    }
    checkRecv() {
      var check = this.recvSinceLastCheck;
      this.recvSinceLastCheck = false;
      return check;
    }
    sendBytes(bytes) {
      this.sentSinceLastCheck = true;
      this.stream.write(bytes);
    }
    sendHeartbeat() {
      return this.sendBytes(frame.HEARTBEAT_BUF);
    }
    sendMethod(channel, Method, fields) {
      var frame2 = encodeMethod(Method, channel, fields);
      this.sentSinceLastCheck = true;
      var buffer = this.channels[channel].buffer;
      return buffer.write(frame2);
    }
    sendMessage(channel, Method, fields, Properties, props, content) {
      if (!Buffer.isBuffer(content))
        throw new TypeError("content is not a buffer");
      var mframe = encodeMethod(Method, channel, fields);
      var pframe = encodeProperties(Properties, channel, content.length, props);
      var buffer = this.channels[channel].buffer;
      this.sentSinceLastCheck = true;
      var methodHeaderLen = mframe.length + pframe.length;
      var bodyLen = content.length > 0 ? content.length + FRAME_OVERHEAD : 0;
      var allLen = methodHeaderLen + bodyLen;
      if (allLen < SINGLE_CHUNK_THRESHOLD) {
        var all = Buffer.allocUnsafe(allLen);
        var offset = mframe.copy(all, 0);
        offset += pframe.copy(all, offset);
        if (bodyLen > 0)
          makeBodyFrame(channel, content).copy(all, offset);
        return buffer.write(all);
      } else {
        if (methodHeaderLen < SINGLE_CHUNK_THRESHOLD) {
          var both = Buffer.allocUnsafe(methodHeaderLen);
          var offset = mframe.copy(both, 0);
          pframe.copy(both, offset);
          buffer.write(both);
        } else {
          buffer.write(mframe);
          buffer.write(pframe);
        }
        return this.sendContent(channel, content);
      }
    }
    sendContent(channel, body) {
      if (!Buffer.isBuffer(body)) {
        throw new TypeError(fmt("Expected buffer; got %s", body));
      }
      var writeResult = true;
      var buffer = this.channels[channel].buffer;
      var maxBody = this.frameMax - FRAME_OVERHEAD;
      for (var offset = 0;offset < body.length; offset += maxBody) {
        var end = offset + maxBody;
        var slice = end > body.length ? body.subarray(offset) : body.subarray(offset, end);
        var bodyFrame = makeBodyFrame(channel, slice);
        writeResult = buffer.write(bodyFrame);
      }
      this.sentSinceLastCheck = true;
      return writeResult;
    }
    recvFrame() {
      var frame2 = parseFrame(this.rest, this.frameMax);
      if (!frame2) {
        var incoming = this.stream.read();
        if (incoming === null) {
          return false;
        } else {
          this.recvSinceLastCheck = true;
          this.rest = Buffer.concat([this.rest, incoming]);
          return this.recvFrame();
        }
      } else {
        this.rest = frame2.rest;
        return decodeFrame(frame2);
      }
    }
  }
  var encodeMethod = defs.encodeMethod;
  var encodeProperties = defs.encodeProperties;
  var FRAME_OVERHEAD = defs.FRAME_OVERHEAD;
  var makeBodyFrame = frame.makeBodyFrame;
  var parseFrame = frame.parseFrame;
  var decodeFrame = frame.decodeFrame;
  exports.Connection = Connection;
  exports.isFatalError = isFatalError;
});

// node_modules/amqplib/lib/credentials.js
var require_credentials = __commonJS((exports, module) => {
  var codec = require_codec();
  exports.plain = function(user, passwd) {
    return {
      mechanism: "PLAIN",
      response: function() {
        return Buffer.from(["", user, passwd].join(String.fromCharCode(0)));
      },
      username: user,
      password: passwd
    };
  };
  exports.amqplain = function(user, passwd) {
    return {
      mechanism: "AMQPLAIN",
      response: function() {
        const buffer = Buffer.alloc(16384);
        const size = codec.encodeTable(buffer, { LOGIN: user, PASSWORD: passwd }, 0);
        return buffer.subarray(4, size);
      },
      username: user,
      password: passwd
    };
  };
  exports.external = function() {
    return {
      mechanism: "EXTERNAL",
      response: function() {
        return Buffer.from("");
      }
    };
  };
});

// node_modules/amqplib/package.json
var require_package3 = __commonJS((exports, module) => {
  module.exports = {
    name: "amqplib",
    homepage: "http://amqp-node.github.io/amqplib/",
    main: "./channel_api.js",
    version: "0.10.5",
    description: "An AMQP 0-9-1 (e.g., RabbitMQ) library and client.",
    repository: {
      type: "git",
      url: "git+https://github.com/amqp-node/amqplib.git"
    },
    engines: {
      node: ">=10"
    },
    dependencies: {
      "@acuminous/bitsyntax": "^0.1.2",
      "buffer-more-ints": "~1.0.0",
      "url-parse": "~1.5.10"
    },
    devDependencies: {
      claire: "0.4.1",
      mocha: "^9.2.2",
      nyc: "^15.1.0",
      "uglify-js": "2.8.x"
    },
    scripts: {
      test: "make test"
    },
    keywords: [
      "AMQP",
      "AMQP 0-9-1",
      "RabbitMQ"
    ],
    author: "Michael Bridgen <mikeb@squaremobius.net>",
    license: "MIT"
  };
});

// node_modules/amqplib/lib/connect.js
var require_connect = __commonJS((exports, module) => {
  function copyInto(obj, target) {
    var keys = Object.keys(obj);
    var i = keys.length;
    while (i--) {
      var k = keys[i];
      target[k] = obj[k];
    }
    return target;
  }
  function clone(obj) {
    return copyInto(obj, {});
  }
  function openFrames(vhost, query, credentials2, extraClientProperties) {
    if (!vhost)
      vhost = "/";
    else
      vhost = QS.unescape(vhost);
    var query = query || {};
    function intOrDefault(val, def) {
      return val === undefined ? def : parseInt(val);
    }
    var clientProperties = Object.create(CLIENT_PROPERTIES);
    return {
      clientProperties: copyInto(extraClientProperties, clientProperties),
      mechanism: credentials2.mechanism,
      response: credentials2.response(),
      locale: query.locale || "en_US",
      channelMax: intOrDefault(query.channelMax, 0),
      frameMax: intOrDefault(query.frameMax, 4096),
      heartbeat: intOrDefault(query.heartbeat, 0),
      virtualHost: vhost,
      capabilities: "",
      insist: 0
    };
  }
  function credentialsFromUrl(parts) {
    var user = "guest", passwd = "guest";
    if (parts.username != "" || parts.password != "") {
      user = parts.username ? unescape(parts.username) : "";
      passwd = parts.password ? unescape(parts.password) : "";
    }
    return credentials.plain(user, passwd);
  }
  function connect(url, socketOptions, openCallback) {
    var sockopts = clone(socketOptions || {});
    url = url || "amqp://localhost";
    var noDelay = !!sockopts.noDelay;
    var timeout = sockopts.timeout;
    var keepAlive = !!sockopts.keepAlive;
    var keepAliveDelay = sockopts.keepAliveDelay || 0;
    var extraClientProperties = sockopts.clientProperties || {};
    var protocol, fields;
    if (typeof url === "object") {
      protocol = (url.protocol || "amqp") + ":";
      sockopts.host = url.hostname;
      sockopts.servername = sockopts.servername || url.hostname;
      sockopts.port = url.port || (protocol === "amqp:" ? 5672 : 5671);
      var user, pass;
      if (url.username == undefined && url.password == undefined) {
        user = "guest";
        pass = "guest";
      } else {
        user = url.username || "";
        pass = url.password || "";
      }
      var config = {
        locale: url.locale,
        channelMax: url.channelMax,
        frameMax: url.frameMax,
        heartbeat: url.heartbeat
      };
      fields = openFrames(url.vhost, config, sockopts.credentials || credentials.plain(user, pass), extraClientProperties);
    } else {
      var parts = URL2(url, true);
      protocol = parts.protocol;
      sockopts.host = parts.hostname;
      sockopts.servername = sockopts.servername || parts.hostname;
      sockopts.port = parseInt(parts.port) || (protocol === "amqp:" ? 5672 : 5671);
      var vhost = parts.pathname ? parts.pathname.substr(1) : null;
      fields = openFrames(vhost, parts.query, sockopts.credentials || credentialsFromUrl(parts), extraClientProperties);
    }
    var sockok = false;
    var sock;
    function onConnect() {
      sockok = true;
      sock.setNoDelay(noDelay);
      if (keepAlive)
        sock.setKeepAlive(keepAlive, keepAliveDelay);
      var c = new Connection(sock);
      c.open(fields, function(err, ok) {
        if (timeout)
          sock.setTimeout(0);
        if (err === null) {
          openCallback(null, c);
        } else {
          sock.end();
          sock.destroy();
          openCallback(err);
        }
      });
    }
    if (protocol === "amqp:") {
      sock = import.meta.require("net").connect(sockopts, onConnect);
    } else if (protocol === "amqps:") {
      sock = import.meta.require("tls").connect(sockopts, onConnect);
    } else {
      throw new Error("Expected amqp: or amqps: as the protocol; got " + protocol);
    }
    if (timeout) {
      sock.setTimeout(timeout, function() {
        sock.end();
        sock.destroy();
        openCallback(new Error("connect ETIMEDOUT"));
      });
    }
    sock.once("error", function(err) {
      if (!sockok)
        openCallback(err);
    });
  }
  var URL2 = require_url_parse();
  var QS = import.meta.require("querystring");
  var Connection = require_connection().Connection;
  var fmt = import.meta.require("util").format;
  var credentials = require_credentials();
  var CLIENT_PROPERTIES = {
    product: "amqplib",
    version: require_package3().version,
    platform: fmt("Node.JS %s", process.version),
    information: "http://squaremo.github.io/amqp.node",
    capabilities: {
      publisher_confirms: true,
      exchange_exchange_bindings: true,
      "basic.nack": true,
      consumer_cancel_notify: true,
      "connection.blocked": true,
      authentication_failure_close: true
    }
  };
  exports.connect = connect;
  exports.credentialsFromUrl = credentialsFromUrl;
});

// node_modules/amqplib/lib/channel.js
var require_channel = __commonJS((exports, module) => {
  function invalidOp(msg, stack) {
    return function() {
      throw new IllegalOperationError(msg, stack);
    };
  }
  function invalidateSend(ch, msg, stack) {
    ch.sendImmediately = ch.sendOrEnqueue = ch.sendMessage = invalidOp(msg, stack);
  }
  function acceptDeliveryOrReturn(f) {
    var event;
    if (f.id === defs.BasicDeliver)
      event = "delivery";
    else if (f.id === defs.BasicReturn)
      event = "return";
    else
      throw fmt("Expected BasicDeliver or BasicReturn; got %s", inspect(f));
    var self2 = this;
    var fields = f.fields;
    return acceptMessage(function(message) {
      message.fields = fields;
      self2.emit(event, message);
    });
  }
  function acceptMessage(continuation) {
    var totalSize = 0, remaining = 0;
    var buffers = null;
    var message = {
      fields: null,
      properties: null,
      content: null
    };
    return headers;
    function headers(f) {
      if (f.id === defs.BasicProperties) {
        message.properties = f.fields;
        totalSize = remaining = f.size;
        if (totalSize === 0) {
          message.content = Buffer.alloc(0);
          continuation(message);
          return acceptDeliveryOrReturn;
        } else {
          return content;
        }
      } else {
        throw "Expected headers frame after delivery";
      }
    }
    function content(f) {
      if (f.content) {
        var size = f.content.length;
        remaining -= size;
        if (remaining === 0) {
          if (buffers !== null) {
            buffers.push(f.content);
            message.content = Buffer.concat(buffers);
          } else {
            message.content = f.content;
          }
          continuation(message);
          return acceptDeliveryOrReturn;
        } else if (remaining < 0) {
          throw fmt("Too much content sent! Expected %d bytes", totalSize);
        } else {
          if (buffers !== null)
            buffers.push(f.content);
          else
            buffers = [f.content];
          return content;
        }
      } else
        throw "Expected content frame after headers";
    }
  }
  var defs = require_defs();
  var closeMsg = require_format2().closeMessage;
  var inspect = require_format2().inspect;
  var methodName = require_format2().methodName;
  var assert = import.meta.require("assert");
  var EventEmitter = import.meta.require("events");
  var fmt = import.meta.require("util").format;
  var IllegalOperationError = require_error().IllegalOperationError;
  var stackCapture = require_error().stackCapture;

  class Channel extends EventEmitter {
    constructor(connection) {
      super();
      this.connection = connection;
      this.reply = null;
      this.pending = [];
      this.lwm = 1;
      this.unconfirmed = [];
      this.on("ack", this.handleConfirm.bind(this, function(cb) {
        if (cb)
          cb(null);
      }));
      this.on("nack", this.handleConfirm.bind(this, function(cb) {
        if (cb)
          cb(new Error("message nacked"));
      }));
      this.on("close", function() {
        var cb;
        while (cb = this.unconfirmed.shift()) {
          if (cb)
            cb(new Error("channel closed"));
        }
      });
      this.handleMessage = acceptDeliveryOrReturn;
    }
    allocate() {
      this.ch = this.connection.freshChannel(this);
      return this;
    }
    sendImmediately(method, fields) {
      return this.connection.sendMethod(this.ch, method, fields);
    }
    sendOrEnqueue(method, fields, reply) {
      if (!this.reply) {
        assert(this.pending.length === 0);
        this.reply = reply;
        this.sendImmediately(method, fields);
      } else {
        this.pending.push({
          method,
          fields,
          reply
        });
      }
    }
    sendMessage(fields, properties, content) {
      return this.connection.sendMessage(this.ch, defs.BasicPublish, fields, defs.BasicProperties, properties, content);
    }
    _rpc(method, fields, expect, cb) {
      var self2 = this;
      function reply(err, f) {
        if (err === null) {
          if (f.id === expect) {
            return cb(null, f);
          } else {
            var expectedName = methodName(expect);
            var e = new Error(fmt("Expected %s; got %s", expectedName, inspect(f, false)));
            self2.closeWithError(f.id, fmt("Expected %s; got %s", expectedName, methodName(f.id)), defs.constants.UNEXPECTED_FRAME, e);
            return cb(e);
          }
        } else if (err instanceof Error)
          return cb(err);
        else {
          var closeReason = (err.fields.classId << 16) + err.fields.methodId;
          var e = method === closeReason ? fmt("Operation failed: %s; %s", methodName(method), closeMsg(err)) : fmt("Channel closed by server: %s", closeMsg(err));
          var closeFrameError = new Error(e);
          closeFrameError.code = err.fields.replyCode;
          closeFrameError.classId = err.fields.classId;
          closeFrameError.methodId = err.fields.methodId;
          return cb(closeFrameError);
        }
      }
      this.sendOrEnqueue(method, fields, reply);
    }
    toClosed(capturedStack) {
      this._rejectPending();
      invalidateSend(this, "Channel closed", capturedStack);
      this.accept = invalidOp("Channel closed", capturedStack);
      this.connection.releaseChannel(this.ch);
      this.emit("close");
    }
    toClosing(capturedStack, k) {
      var send = this.sendImmediately.bind(this);
      invalidateSend(this, "Channel closing", capturedStack);
      this.accept = function(f) {
        if (f.id === defs.ChannelCloseOk) {
          if (k)
            k();
          var s = stackCapture("ChannelCloseOk frame received");
          this.toClosed(s);
        } else if (f.id === defs.ChannelClose) {
          send(defs.ChannelCloseOk, {});
        }
      };
    }
    _rejectPending() {
      function rej(r) {
        r(new Error("Channel ended, no reply will be forthcoming"));
      }
      if (this.reply !== null)
        rej(this.reply);
      this.reply = null;
      var discard;
      while (discard = this.pending.shift())
        rej(discard.reply);
      this.pending = null;
    }
    closeBecause(reason, code, k) {
      this.sendImmediately(defs.ChannelClose, {
        replyText: reason,
        replyCode: code,
        methodId: 0,
        classId: 0
      });
      var s = stackCapture("closeBecause called: " + reason);
      this.toClosing(s, k);
    }
    closeWithError(id, reason, code, error) {
      var self2 = this;
      this.closeBecause(reason, code, function() {
        error.code = code;
        if (id) {
          error.classId = defs.info(id).classId;
          error.methodId = defs.info(id).methodId;
        }
        self2.emit("error", error);
      });
    }
    acceptMessageFrame(f) {
      try {
        this.handleMessage = this.handleMessage(f);
      } catch (msg) {
        if (typeof msg === "string") {
          this.closeWithError(f.id, msg, defs.constants.UNEXPECTED_FRAME, new Error(msg));
        } else if (msg instanceof Error) {
          this.closeWithError(f.id, "Error while processing message", defs.constants.INTERNAL_ERROR, msg);
        } else {
          this.closeWithError(f.id, "Internal error while processing message", defs.constants.INTERNAL_ERROR, new Error(msg.toString()));
        }
      }
    }
    handleConfirm(handle, f) {
      var tag = f.deliveryTag;
      var multi = f.multiple;
      if (multi) {
        var confirmed = this.unconfirmed.splice(0, tag - this.lwm + 1);
        this.lwm = tag + 1;
        confirmed.forEach(handle);
      } else {
        var c;
        if (tag === this.lwm) {
          c = this.unconfirmed.shift();
          this.lwm++;
          while (this.unconfirmed[0] === null) {
            this.unconfirmed.shift();
            this.lwm++;
          }
        } else {
          c = this.unconfirmed[tag - this.lwm];
          this.unconfirmed[tag - this.lwm] = null;
        }
        handle(c);
      }
    }
    pushConfirmCallback(cb) {
      this.unconfirmed.push(cb || false);
    }
    onBufferDrain() {
      this.emit("drain");
    }
    accept(f) {
      switch (f.id) {
        case undefined:
        case defs.BasicDeliver:
        case defs.BasicReturn:
        case defs.BasicProperties:
          return this.acceptMessageFrame(f);
        case defs.BasicAck:
          return this.emit("ack", f.fields);
        case defs.BasicNack:
          return this.emit("nack", f.fields);
        case defs.BasicCancel:
          return this.emit("cancel", f.fields);
        case defs.ChannelClose:
          if (this.reply) {
            var reply = this.reply;
            this.reply = null;
            reply(f);
          }
          var emsg = "Channel closed by server: " + closeMsg(f);
          this.sendImmediately(defs.ChannelCloseOk, {});
          var error = new Error(emsg);
          error.code = f.fields.replyCode;
          error.classId = f.fields.classId;
          error.methodId = f.fields.methodId;
          this.emit("error", error);
          var s = stackCapture(emsg);
          this.toClosed(s);
          return;
        case defs.BasicFlow:
          return this.closeWithError(f.id, "Flow not implemented", defs.constants.NOT_IMPLEMENTED, new Error("Flow not implemented"));
        default:
          var reply = this.reply;
          this.reply = null;
          if (this.pending.length > 0) {
            var send = this.pending.shift();
            this.reply = send.reply;
            this.sendImmediately(send.method, send.fields);
          }
          return reply(null, f);
      }
    }
  }

  class BaseChannel extends Channel {
    constructor(connection) {
      super(connection);
      this.consumers = new Map;
    }
    registerConsumer(tag, callback) {
      this.consumers.set(tag, callback);
    }
    unregisterConsumer(tag) {
      this.consumers.delete(tag);
    }
    dispatchMessage(fields, message) {
      var consumerTag = fields.consumerTag;
      var consumer = this.consumers.get(consumerTag);
      if (consumer) {
        return consumer(message);
      } else {
        throw new Error("Unknown consumer: " + consumerTag);
      }
    }
    handleDelivery(message) {
      return this.dispatchMessage(message.fields, message);
    }
    handleCancel(fields) {
      var result = this.dispatchMessage(fields, null);
      this.unregisterConsumer(fields.consumerTag);
      return result;
    }
  }
  exports.acceptMessage = acceptMessage;
  exports.BaseChannel = BaseChannel;
  exports.Channel = Channel;
});

// node_modules/amqplib/lib/api_args.js
var require_api_args = __commonJS((exports, module) => {
  function setIfDefined(obj, prop, value) {
    if (value != null)
      obj[prop] = value;
  }
  var EMPTY_OPTIONS = Object.freeze({});
  var Args = {};
  Args.assertQueue = function(queue, options) {
    queue = queue || "";
    options = options || EMPTY_OPTIONS;
    var argt = Object.create(options.arguments || null);
    setIfDefined(argt, "x-expires", options.expires);
    setIfDefined(argt, "x-message-ttl", options.messageTtl);
    setIfDefined(argt, "x-dead-letter-exchange", options.deadLetterExchange);
    setIfDefined(argt, "x-dead-letter-routing-key", options.deadLetterRoutingKey);
    setIfDefined(argt, "x-max-length", options.maxLength);
    setIfDefined(argt, "x-max-priority", options.maxPriority);
    setIfDefined(argt, "x-overflow", options.overflow);
    setIfDefined(argt, "x-queue-mode", options.queueMode);
    return {
      queue,
      exclusive: !!options.exclusive,
      durable: options.durable === undefined ? true : options.durable,
      autoDelete: !!options.autoDelete,
      arguments: argt,
      passive: false,
      ticket: 0,
      nowait: false
    };
  };
  Args.checkQueue = function(queue) {
    return {
      queue,
      passive: true,
      nowait: false,
      durable: true,
      autoDelete: false,
      exclusive: false,
      ticket: 0
    };
  };
  Args.deleteQueue = function(queue, options) {
    options = options || EMPTY_OPTIONS;
    return {
      queue,
      ifUnused: !!options.ifUnused,
      ifEmpty: !!options.ifEmpty,
      ticket: 0,
      nowait: false
    };
  };
  Args.purgeQueue = function(queue) {
    return {
      queue,
      ticket: 0,
      nowait: false
    };
  };
  Args.bindQueue = function(queue, source, pattern, argt) {
    return {
      queue,
      exchange: source,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.unbindQueue = function(queue, source, pattern, argt) {
    return {
      queue,
      exchange: source,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.assertExchange = function(exchange, type, options) {
    options = options || EMPTY_OPTIONS;
    var argt = Object.create(options.arguments || null);
    setIfDefined(argt, "alternate-exchange", options.alternateExchange);
    return {
      exchange,
      ticket: 0,
      type,
      passive: false,
      durable: options.durable === undefined ? true : options.durable,
      autoDelete: !!options.autoDelete,
      internal: !!options.internal,
      nowait: false,
      arguments: argt
    };
  };
  Args.checkExchange = function(exchange) {
    return {
      exchange,
      passive: true,
      nowait: false,
      durable: true,
      internal: false,
      type: "",
      autoDelete: false,
      ticket: 0
    };
  };
  Args.deleteExchange = function(exchange, options) {
    options = options || EMPTY_OPTIONS;
    return {
      exchange,
      ifUnused: !!options.ifUnused,
      ticket: 0,
      nowait: false
    };
  };
  Args.bindExchange = function(dest, source, pattern, argt) {
    return {
      source,
      destination: dest,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.unbindExchange = function(dest, source, pattern, argt) {
    return {
      source,
      destination: dest,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.publish = function(exchange, routingKey, options) {
    options = options || EMPTY_OPTIONS;
    function convertCC(cc) {
      if (cc === undefined) {
        return;
      } else if (Array.isArray(cc)) {
        return cc.map(String);
      } else
        return [String(cc)];
    }
    var headers = Object.create(options.headers || null);
    setIfDefined(headers, "CC", convertCC(options.CC));
    setIfDefined(headers, "BCC", convertCC(options.BCC));
    var deliveryMode;
    if (options.persistent !== undefined)
      deliveryMode = options.persistent ? 2 : 1;
    else if (typeof options.deliveryMode === "number")
      deliveryMode = options.deliveryMode;
    else if (options.deliveryMode)
      deliveryMode = 2;
    var expiration = options.expiration;
    if (expiration !== undefined)
      expiration = expiration.toString();
    return {
      exchange,
      routingKey,
      mandatory: !!options.mandatory,
      immediate: false,
      ticket: undefined,
      contentType: options.contentType,
      contentEncoding: options.contentEncoding,
      headers,
      deliveryMode,
      priority: options.priority,
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      expiration,
      messageId: options.messageId,
      timestamp: options.timestamp,
      type: options.type,
      userId: options.userId,
      appId: options.appId,
      clusterId: undefined
    };
  };
  Args.consume = function(queue, options) {
    options = options || EMPTY_OPTIONS;
    var argt = Object.create(options.arguments || null);
    setIfDefined(argt, "x-priority", options.priority);
    return {
      ticket: 0,
      queue,
      consumerTag: options.consumerTag || "",
      noLocal: !!options.noLocal,
      noAck: !!options.noAck,
      exclusive: !!options.exclusive,
      nowait: false,
      arguments: argt
    };
  };
  Args.cancel = function(consumerTag) {
    return {
      consumerTag,
      nowait: false
    };
  };
  Args.get = function(queue, options) {
    options = options || EMPTY_OPTIONS;
    return {
      ticket: 0,
      queue,
      noAck: !!options.noAck
    };
  };
  Args.ack = function(tag, allUpTo) {
    return {
      deliveryTag: tag,
      multiple: !!allUpTo
    };
  };
  Args.nack = function(tag, allUpTo, requeue) {
    return {
      deliveryTag: tag,
      multiple: !!allUpTo,
      requeue: requeue === undefined ? true : requeue
    };
  };
  Args.reject = function(tag, requeue) {
    return {
      deliveryTag: tag,
      requeue: requeue === undefined ? true : requeue
    };
  };
  Args.prefetch = function(count, global2) {
    return {
      prefetchCount: count || 0,
      prefetchSize: 0,
      global: !!global2
    };
  };
  Args.recover = function() {
    return { requeue: true };
  };
  module.exports = Object.freeze(Args);
});

// node_modules/amqplib/lib/channel_model.js
var require_channel_model = __commonJS((exports, module) => {
  var EventEmitter = import.meta.require("events");
  var promisify = import.meta.require("util").promisify;
  var defs = require_defs();
  var { BaseChannel } = require_channel();
  var { acceptMessage } = require_channel();
  var Args = require_api_args();
  var { inspect } = require_format2();

  class ChannelModel extends EventEmitter {
    constructor(connection) {
      super();
      this.connection = connection;
      ["error", "close", "blocked", "unblocked"].forEach((ev) => {
        connection.on(ev, this.emit.bind(this, ev));
      });
    }
    close() {
      return promisify(this.connection.close.bind(this.connection))();
    }
    updateSecret(newSecret, reason) {
      return promisify(this.connection._updateSecret.bind(this.connection))(newSecret, reason);
    }
    async createChannel() {
      const channel = new Channel(this.connection);
      await channel.open();
      return channel;
    }
    async createConfirmChannel() {
      const channel = new ConfirmChannel(this.connection);
      await channel.open();
      await channel.rpc(defs.ConfirmSelect, { nowait: false }, defs.ConfirmSelectOk);
      return channel;
    }
  }

  class Channel extends BaseChannel {
    constructor(connection) {
      super(connection);
      this.on("delivery", this.handleDelivery.bind(this));
      this.on("cancel", this.handleCancel.bind(this));
    }
    async rpc(method, fields, expect) {
      const f = await promisify((cb) => {
        return this._rpc(method, fields, expect, cb);
      })();
      return f.fields;
    }
    async open() {
      const ch = await this.allocate.bind(this)();
      return ch.rpc(defs.ChannelOpen, { outOfBand: "" }, defs.ChannelOpenOk);
    }
    close() {
      return promisify((cb) => {
        return this.closeBecause("Goodbye", defs.constants.REPLY_SUCCESS, cb);
      })();
    }
    assertQueue(queue, options) {
      return this.rpc(defs.QueueDeclare, Args.assertQueue(queue, options), defs.QueueDeclareOk);
    }
    checkQueue(queue) {
      return this.rpc(defs.QueueDeclare, Args.checkQueue(queue), defs.QueueDeclareOk);
    }
    deleteQueue(queue, options) {
      return this.rpc(defs.QueueDelete, Args.deleteQueue(queue, options), defs.QueueDeleteOk);
    }
    purgeQueue(queue) {
      return this.rpc(defs.QueuePurge, Args.purgeQueue(queue), defs.QueuePurgeOk);
    }
    bindQueue(queue, source, pattern, argt) {
      return this.rpc(defs.QueueBind, Args.bindQueue(queue, source, pattern, argt), defs.QueueBindOk);
    }
    unbindQueue(queue, source, pattern, argt) {
      return this.rpc(defs.QueueUnbind, Args.unbindQueue(queue, source, pattern, argt), defs.QueueUnbindOk);
    }
    assertExchange(exchange, type, options) {
      return this.rpc(defs.ExchangeDeclare, Args.assertExchange(exchange, type, options), defs.ExchangeDeclareOk).then((_ok) => {
        return { exchange };
      });
    }
    checkExchange(exchange) {
      return this.rpc(defs.ExchangeDeclare, Args.checkExchange(exchange), defs.ExchangeDeclareOk);
    }
    deleteExchange(name, options) {
      return this.rpc(defs.ExchangeDelete, Args.deleteExchange(name, options), defs.ExchangeDeleteOk);
    }
    bindExchange(dest, source, pattern, argt) {
      return this.rpc(defs.ExchangeBind, Args.bindExchange(dest, source, pattern, argt), defs.ExchangeBindOk);
    }
    unbindExchange(dest, source, pattern, argt) {
      return this.rpc(defs.ExchangeUnbind, Args.unbindExchange(dest, source, pattern, argt), defs.ExchangeUnbindOk);
    }
    publish(exchange, routingKey, content, options) {
      const fieldsAndProps = Args.publish(exchange, routingKey, options);
      return this.sendMessage(fieldsAndProps, fieldsAndProps, content);
    }
    sendToQueue(queue, content, options) {
      return this.publish("", queue, content, options);
    }
    consume(queue, callback, options) {
      const fields = Args.consume(queue, options);
      return new Promise((resolve, reject) => {
        this._rpc(defs.BasicConsume, fields, defs.BasicConsumeOk, (err, ok) => {
          if (err)
            return reject(err);
          this.registerConsumer(ok.fields.consumerTag, callback);
          resolve(ok.fields);
        });
      });
    }
    async cancel(consumerTag) {
      const ok = await promisify((cb) => {
        this._rpc(defs.BasicCancel, Args.cancel(consumerTag), defs.BasicCancelOk, cb);
      })().then((ok2) => {
        this.unregisterConsumer(consumerTag);
        return ok2.fields;
      });
    }
    get(queue, options) {
      const fields = Args.get(queue, options);
      return new Promise((resolve, reject) => {
        this.sendOrEnqueue(defs.BasicGet, fields, (err, f) => {
          if (err)
            return reject(err);
          if (f.id === defs.BasicGetEmpty) {
            return resolve(false);
          } else if (f.id === defs.BasicGetOk) {
            const fields2 = f.fields;
            this.handleMessage = acceptMessage((m) => {
              m.fields = fields2;
              resolve(m);
            });
          } else {
            reject(new Error(`Unexpected response to BasicGet: ${inspect(f)}`));
          }
        });
      });
    }
    ack(message, allUpTo) {
      this.sendImmediately(defs.BasicAck, Args.ack(message.fields.deliveryTag, allUpTo));
    }
    ackAll() {
      this.sendImmediately(defs.BasicAck, Args.ack(0, true));
    }
    nack(message, allUpTo, requeue) {
      this.sendImmediately(defs.BasicNack, Args.nack(message.fields.deliveryTag, allUpTo, requeue));
    }
    nackAll(requeue) {
      this.sendImmediately(defs.BasicNack, Args.nack(0, true, requeue));
    }
    reject(message, requeue) {
      this.sendImmediately(defs.BasicReject, Args.reject(message.fields.deliveryTag, requeue));
    }
    recover() {
      return this.rpc(defs.BasicRecover, Args.recover(), defs.BasicRecoverOk);
    }
    qos(count, global2) {
      return this.rpc(defs.BasicQos, Args.prefetch(count, global2), defs.BasicQosOk);
    }
  }
  Channel.prototype.prefetch = Channel.prototype.qos;

  class ConfirmChannel extends Channel {
    publish(exchange, routingKey, content, options, cb) {
      this.pushConfirmCallback(cb);
      return super.publish(exchange, routingKey, content, options);
    }
    sendToQueue(queue, content, options, cb) {
      return this.publish("", queue, content, options, cb);
    }
    waitForConfirms() {
      const awaiting = [];
      const unconfirmed = this.unconfirmed;
      unconfirmed.forEach((val, index) => {
        if (val !== null) {
          const confirmed = new Promise((resolve, reject) => {
            unconfirmed[index] = (err) => {
              if (val)
                val(err);
              if (err === null)
                resolve();
              else
                reject(err);
            };
          });
          awaiting.push(confirmed);
        }
      });
      if (!this.pending) {
        var cb;
        while (cb = this.unconfirmed.shift()) {
          if (cb)
            cb(new Error("channel closed"));
        }
      }
      return Promise.all(awaiting);
    }
  }
  exports.ConfirmChannel = ConfirmChannel;
  exports.Channel = Channel;
  exports.ChannelModel = ChannelModel;
});

// node_modules/amqplib/channel_api.js
var require_channel_api = __commonJS((exports, module) => {
  function connect(url, connOptions) {
    return promisify(function(cb) {
      return raw_connect(url, connOptions, cb);
    })().then(function(conn) {
      return new ChannelModel(conn);
    });
  }
  var raw_connect = require_connect().connect;
  var ChannelModel = require_channel_model().ChannelModel;
  var promisify = import.meta.require("util").promisify;
  exports.connect = connect;
  exports.credentials = require_credentials();
  exports.IllegalOperationError = require_error().IllegalOperationError;
});

// src/index.ts
var import_dotenv2 = __toESM(require_main(), 1);

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1;i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1;j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
};
var getPath = (request) => {
  const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return match ? match[1] : "";
};
var getQueryStrings = (url) => {
  const queryIndex = url.indexOf("?", 8);
  return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
};
var mergePath = (...paths) => {
  let p = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p[p.length - 1] === "/") {
      p = p.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p = `${p}/`;
    } else if (path !== "/") {
      p = `${p}${path}`;
    }
    if (path === "/" && p === "") {
      p = "/";
    }
  }
  return p;
};
var checkOptionalParameter = (path) => {
  if (!path.match(/\:.+\?$/)) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return /%/.test(value) ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? undefined : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return;
    }
  }
  const results = {};
  encoded ?? (encoded = /[%+]/.test(url));
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? undefined : nextKeyIndex : valueIndex);
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? undefined : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ?? (results[name] = value);
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  const pairs = cookie.trim().split(";");
  return pairs.reduce((parsedCookie, pairStr) => {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      return parsedCookie;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      return parsedCookie;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
    }
    return parsedCookie;
  }, {});
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain) {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite}`;
  }
  if (opt.partitioned) {
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt = {}) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/utils/stream.js
var StreamingApi = class {
  constructor(writable, _readable) {
    this.abortSubscribers = [];
    this.writable = writable;
    this.writer = writable.getWriter();
    this.encoder = new TextEncoder;
    const reader = _readable.getReader();
    this.responseReadable = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        done ? controller.close() : controller.enqueue(value);
      },
      cancel: () => {
        this.abortSubscribers.forEach((subscriber) => subscriber());
      }
    });
  }
  async write(input) {
    try {
      if (typeof input === "string") {
        input = this.encoder.encode(input);
      }
      await this.writer.write(input);
    } catch (e) {
    }
    return this;
  }
  async writeln(input) {
    await this.write(input + "\n");
    return this;
  }
  sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async close() {
    try {
      await this.writer.close();
    } catch (e) {
    }
  }
  async pipe(body) {
    this.writer.releaseLock();
    await body.pipeTo(this.writable, { preventClose: true });
    this.writer = this.writable.getWriter();
  }
  async onAbort(listener) {
    this.abortSubscribers.push(listener);
  }
};

// node_modules/hono/dist/context.js
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  Object.entries(map).forEach(([key, value]) => headers.set(key, value));
  return headers;
};
var _status;
var _executionCtx;
var _headers;
var _preparedHeaders;
var _res;
var _isFresh;
var Context = class {
  constructor(req, options) {
    this.env = {};
    this._var = {};
    this.finalized = false;
    this.error = undefined;
    __privateAdd(this, _status, 200);
    __privateAdd(this, _executionCtx, undefined);
    __privateAdd(this, _headers, undefined);
    __privateAdd(this, _preparedHeaders, undefined);
    __privateAdd(this, _res, undefined);
    __privateAdd(this, _isFresh, true);
    this.renderer = (content) => this.html(content);
    this.notFoundHandler = () => new Response;
    this.render = (...args) => this.renderer(...args);
    this.setRenderer = (renderer) => {
      this.renderer = renderer;
    };
    this.header = (name, value, options2) => {
      if (value === undefined) {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).delete(name);
        } else if (__privateGet(this, _preparedHeaders)) {
          delete __privateGet(this, _preparedHeaders)[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options2?.append) {
        if (!__privateGet(this, _headers)) {
          __privateSet(this, _isFresh, false);
          __privateSet(this, _headers, new Headers(__privateGet(this, _preparedHeaders)));
          __privateSet(this, _preparedHeaders, {});
        }
        __privateGet(this, _headers).append(name, value);
      } else {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).set(name, value);
        } else {
          __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
          __privateGet(this, _preparedHeaders)[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options2?.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    };
    this.status = (status) => {
      __privateSet(this, _isFresh, false);
      __privateSet(this, _status, status);
    };
    this.set = (key, value) => {
      this._var ?? (this._var = {});
      this._var[key] = value;
    };
    this.get = (key) => {
      return this._var ? this._var[key] : undefined;
    };
    this.newResponse = (data, arg, headers) => {
      if (__privateGet(this, _isFresh) && !headers && !arg && __privateGet(this, _status) === 200) {
        return new Response(data, {
          headers: __privateGet(this, _preparedHeaders)
        });
      }
      if (arg && typeof arg !== "number") {
        const headers2 = setHeaders(new Headers(arg.headers), __privateGet(this, _preparedHeaders));
        return new Response(data, {
          headers: headers2,
          status: arg.status
        });
      }
      const status = typeof arg === "number" ? arg : __privateGet(this, _status);
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers);
      setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
      if (__privateGet(this, _res)) {
        __privateGet(this, _res).headers.forEach((v, k) => {
          __privateGet(this, _headers)?.set(k, v);
        });
        setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
      }
      headers ?? (headers = {});
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          __privateGet(this, _headers).set(k, v);
        } else {
          __privateGet(this, _headers).delete(k);
          for (const v2 of v) {
            __privateGet(this, _headers).append(k, v2);
          }
        }
      }
      return new Response(data, {
        status,
        headers: __privateGet(this, _headers)
      });
    };
    this.body = (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    this.text = (text, arg, headers) => {
      if (!__privateGet(this, _preparedHeaders)) {
        if (__privateGet(this, _isFresh) && !headers && !arg) {
          return new Response(text);
        }
        __privateSet(this, _preparedHeaders, {});
      }
      __privateGet(this, _preparedHeaders)["content-type"] = TEXT_PLAIN;
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    this.json = (object, arg, headers) => {
      const body = JSON.stringify(object);
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    this.jsonT = (object, arg, headers) => {
      return this.json(object, arg, headers);
    };
    this.html = (html, arg, headers) => {
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        if (!(html instanceof Promise)) {
          html = html.toString();
        }
        if (html instanceof Promise) {
          return html.then((html2) => resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {})).then((html2) => {
            return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
          });
        }
      }
      return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    this.redirect = (location, status = 302) => {
      __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers);
      __privateGet(this, _headers).set("Location", location);
      return this.newResponse(null, status);
    };
    this.streamText = (cb, arg, headers) => {
      headers ?? (headers = {});
      this.header("content-type", TEXT_PLAIN);
      this.header("x-content-type-options", "nosniff");
      this.header("transfer-encoding", "chunked");
      return this.stream(cb, arg, headers);
    };
    this.stream = (cb, arg, headers) => {
      const { readable, writable } = new TransformStream;
      const stream = new StreamingApi(writable, readable);
      cb(stream).finally(() => stream.close());
      return typeof arg === "number" ? this.newResponse(stream.responseReadable, arg, headers) : this.newResponse(stream.responseReadable, arg);
    };
    this.cookie = (name, value, opt) => {
      const cookie = serialize(name, value, opt);
      this.header("set-cookie", cookie, { append: true });
    };
    this.notFound = () => {
      return this.notFoundHandler(this);
    };
    this.req = req;
    if (options) {
      __privateSet(this, _executionCtx, options.executionCtx);
      this.env = options.env;
      if (options.notFoundHandler) {
        this.notFoundHandler = options.notFoundHandler;
      }
    }
  }
  get event() {
    if (__privateGet(this, _executionCtx) && "respondWith" in __privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (__privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    __privateSet(this, _isFresh, false);
    return __privateGet(this, _res) || __privateSet(this, _res, new Response("404 Not Found", { status: 404 }));
  }
  set res(_res2) {
    __privateSet(this, _isFresh, false);
    if (__privateGet(this, _res) && _res2) {
      __privateGet(this, _res).headers.delete("content-type");
      for (const [k, v] of __privateGet(this, _res).headers.entries()) {
        if (k === "set-cookie") {
          const cookies = __privateGet(this, _res).headers.getSetCookie();
          _res2.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res2.headers.append("set-cookie", cookie);
          }
        } else {
          _res2.headers.set(k, v);
        }
      }
    }
    __privateSet(this, _res, _res2);
    this.finalized = true;
  }
  get var() {
    return { ...this._var };
  }
  get runtime() {
    const global2 = globalThis;
    if (global2?.Deno !== undefined) {
      return "deno";
    }
    if (global2?.Bun !== undefined) {
      return "bun";
    }
    if (typeof global2?.WebSocketPair === "function") {
      return "workerd";
    }
    if (typeof global2?.EdgeRuntime === "string") {
      return "edge-light";
    }
    if (global2?.fastly !== undefined) {
      return "fastly";
    }
    if (global2?.__lagon__ !== undefined) {
      return "lagon";
    }
    if (global2?.process?.release?.name === "node") {
      return "node";
    }
    return "other";
  }
};
_status = new WeakMap;
_executionCtx = new WeakMap;
_headers = new WeakMap;
_preparedHeaders = new WeakMap;
_res = new WeakMap;
_isFresh = new WeakMap;

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        if (context instanceof Context) {
          context.req.routeIndex = i;
        }
      } else {
        handler = i === middleware.length && next || undefined;
      }
      if (!handler) {
        if (context instanceof Context && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && context instanceof Context && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  constructor(status = 500, options) {
    super(options?.message);
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      return this.res;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};

// node_modules/hono/dist/utils/body.js
function isFormDataContent(contentType) {
  if (contentType === null) {
    return false;
  }
  return contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded");
}
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = {};
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  return form;
}
function isArrayField(field) {
  return Array.isArray(field);
}
var parseBody = async (request, options = { all: false }) => {
  const contentType = request.headers.get("Content-Type");
  if (isFormDataContent(contentType)) {
    return parseFormData(request, options);
  }
  return {};
};
var handleParsingAllValues = (form, key, value) => {
  if (form[key] && isArrayField(form[key])) {
    appendToExistingArray(form[key], value);
  } else if (form[key]) {
    convertToNewArray(form, key, value);
  } else {
    form[key] = value;
  }
};
var appendToExistingArray = (arr, value) => {
  arr.push(value);
};
var convertToNewArray = (form, key, value) => {
  form[key] = [form[key], value];
};

// node_modules/hono/dist/request.js
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet2 = (obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _validatedData;
var _matchResult;
var HonoRequest = class {
  constructor(request, path = "/", matchResult = [[]]) {
    __privateAdd2(this, _validatedData, undefined);
    __privateAdd2(this, _matchResult, undefined);
    this.routeIndex = 0;
    this.bodyCache = {};
    this.cachedBody = (key) => {
      const { bodyCache, raw: raw2 } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody) {
        return cachedBody;
      }
      if (bodyCache.arrayBuffer) {
        return (async () => {
          return await new Response(bodyCache.arrayBuffer)[key]();
        })();
      }
      return bodyCache[key] = raw2[key]();
    };
    this.raw = request;
    this.path = path;
    __privateSet2(this, _matchResult, matchResult);
    __privateSet2(this, _validatedData, {});
  }
  param(key) {
    return key ? this.getDecodedParam(key) : this.getAllDecodedParams();
  }
  getDecodedParam(key) {
    const paramKey = __privateGet2(this, _matchResult)[0][this.routeIndex][1][key];
    const param = this.getParamValue(paramKey);
    return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : undefined;
  }
  getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(__privateGet2(this, _matchResult)[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.getParamValue(__privateGet2(this, _matchResult)[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
      }
    }
    return decoded;
  }
  getParamValue(paramKey) {
    return __privateGet2(this, _matchResult)[1] ? __privateGet2(this, _matchResult)[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name.toLowerCase()) ?? undefined;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  cookie(key) {
    const cookie = this.raw.headers.get("Cookie");
    if (!cookie) {
      return;
    }
    const obj = parse(cookie);
    if (key) {
      const value = obj[key];
      return value;
    } else {
      return obj;
    }
  }
  async parseBody(options) {
    if (this.bodyCache.parsedBody) {
      return this.bodyCache.parsedBody;
    }
    const parsedBody = await parseBody(this, options);
    this.bodyCache.parsedBody = parsedBody;
    return parsedBody;
  }
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(target, data) {
    __privateGet2(this, _validatedData)[target] = data;
  }
  valid(target) {
    return __privateGet2(this, _validatedData)[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return __privateGet2(this, _matchResult)[0].map(([[, route]]) => route);
  }
  get routePath() {
    return __privateGet2(this, _matchResult)[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
  get headers() {
    return this.raw.headers;
  }
  get body() {
    return this.raw.body;
  }
  get bodyUsed() {
    return this.raw.bodyUsed;
  }
  get integrity() {
    return this.raw.integrity;
  }
  get keepalive() {
    return this.raw.keepalive;
  }
  get referrer() {
    return this.raw.referrer;
  }
  get signal() {
    return this.raw.signal;
  }
};
_validatedData = new WeakMap;
_matchResult = new WeakMap;

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/hono-base.js
function defineDynamicClass() {
  return class {
  };
}
var __accessCheck3 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet3 = (obj, member, getter) => {
  __accessCheck3(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd3 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet3 = (obj, member, value, setter) => {
  __accessCheck3(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var COMPOSED_HANDLER = Symbol("composedHandler");
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  const message = "Internal Server Error";
  return c.text(message, 500);
};
var _path;
var _Hono = class extends defineDynamicClass() {
  constructor(options = {}) {
    super();
    this._basePath = "/";
    __privateAdd3(this, _path, "/");
    this.routes = [];
    this.notFoundHandler = notFoundHandler;
    this.errorHandler = errorHandler;
    this.onError = (handler) => {
      this.errorHandler = handler;
      return this;
    };
    this.notFound = (handler) => {
      this.notFoundHandler = handler;
      return this;
    };
    this.head = () => {
      console.warn("`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.");
      return this;
    };
    this.handleEvent = (event) => {
      return this.dispatch(event.request, event, undefined, event.request.method);
    };
    this.fetch = (request, Env, executionCtx) => {
      return this.dispatch(request, executionCtx, Env, request.method);
    };
    this.request = (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== undefined) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    };
    this.fire = () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, undefined, event.request.method));
      });
    };
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.map((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          __privateSet3(this, _path, args1);
        } else {
          this.addRoute(method, __privateGet3(this, _path), args1);
        }
        args.map((handler) => {
          if (typeof handler !== "string") {
            this.addRoute(method, __privateGet3(this, _path), handler);
          }
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      if (!method) {
        return this;
      }
      __privateSet3(this, _path, path);
      for (const m of [method].flat()) {
        handlers.map((handler) => {
          this.addRoute(m.toUpperCase(), __privateGet3(this, _path), handler);
        });
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        __privateSet3(this, _path, arg1);
      } else {
        handlers.unshift(arg1);
      }
      handlers.map((handler) => {
        this.addRoute(METHOD_NAME_ALL, __privateGet3(this, _path), handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
  }
  clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  route(path, app) {
    const subApp = this.basePath(path);
    if (!app) {
      return subApp;
    }
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  showRoutes() {
    const length = 8;
    this.routes.map((route) => {
      console.log(`\x1B[32m${route.method}\x1B[0m ${" ".repeat(length - route.method.length)} ${route.path}`);
    });
  }
  mount(path, applicationHandler, optionHandler) {
    const mergedPath = mergePath(this._basePath, path);
    const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
    const handler = async (c, next) => {
      let executionContext = undefined;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      const options = optionHandler ? optionHandler(c) : [c.env, executionContext];
      const optionsArray = Array.isArray(options) ? options : [options];
      const queryStrings = getQueryStrings(c.req.url);
      const res = await applicationHandler(new Request(new URL((c.req.path.slice(pathPrefixLength) || "/") + queryStrings, c.req.url), c.req.raw), ...optionsArray);
      if (res) {
        return res;
      }
      await next();
    };
    this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  get routerName() {
    this.matchRoute("GET", "/");
    return this.router.name;
  }
  addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  matchRoute(method, path) {
    return this.router.match(method, path);
  }
  handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.matchRoute(method, path);
    const c = new Context(new HonoRequest(request, path, matchResult), {
      env,
      executionCtx,
      notFoundHandler: this.notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.notFoundHandler(c);
        });
      } catch (err) {
        return this.handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.notFoundHandler(c))).catch((err) => this.handleError(err, c)) : res;
    }
    const composed = compose(matchResult[0], this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error("Context is not finalized. You may forget returning Response object or `await next()`");
        }
        return context.res;
      } catch (err) {
        return this.handleError(err, c);
      }
    })();
  }
};
var Hono = _Hono;
_path = new WeakMap;

// node_modules/hono/dist/router/reg-exp-router/node.js
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var Node = class {
  constructor() {
    this.children = {};
  }
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.index !== undefined) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.children[regexpStr];
      if (!node) {
        if (Object.keys(this.children).some((k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[regexpStr] = new Node;
        if (name !== "") {
          node.varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.varIndex]);
      }
    } else {
      node = this.children[token];
      if (!node) {
        if (Object.keys(this.children).some((k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[token] = new Node;
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.children[k];
      return (typeof c.varIndex === "number" ? `(${k})@${c.varIndex}` : k) + c.buildRegExpStr();
    });
    if (typeof this.index === "number") {
      strList.unshift(`#${this.index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  constructor() {
    this.context = { varIndex: 0 };
    this.root = new Node;
  }
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0;; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1;i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1;j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (typeof handlerIndex !== "undefined") {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (typeof paramIndex !== "undefined") {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ?? (wildcardRegExpCache[path] = new RegExp(path === "*" ? "" : `^${path.replace(/\/\*/, "(?:|/.*)")}\$`));
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = {};
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie;
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map((route) => [!/\*|\/:/.test(route[0]), ...route]).sort(([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length);
  const staticMap = {};
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length;i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, {}]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = {};
      paramCount -= 1;
      for (;paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length;i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length;j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length;k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return;
}
var methodNames = [METHOD_NAME_ALL, ...METHODS].map((method) => method.toUpperCase());
var emptyParam = [];
var nullMatcher = [/^$/, [], {}];
var wildcardRegExpCache = {};
var RegExpRouter = class {
  constructor() {
    this.name = "RegExpRouter";
    this.middleware = { [METHOD_NAME_ALL]: {} };
    this.routes = { [METHOD_NAME_ALL]: {} };
  }
  add(method, path, handler) {
    var _a;
    const { middleware, routes } = this;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (methodNames.indexOf(method) === -1) {
      methodNames.push(method);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = {};
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          var _a2;
          (_a2 = middleware[m])[path] || (_a2[path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
        });
      } else {
        (_a = middleware[method])[path] || (_a[path] = findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach((p) => re.test(p) && routes[m][p].push([handler, paramCount]));
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length;i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        var _a2;
        if (method === METHOD_NAME_ALL || method === m) {
          (_a2 = routes[m])[path2] || (_a2[path2] = [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ]);
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  buildAllMatchers() {
    const matchers = {};
    methodNames.forEach((method) => {
      matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL];
    });
    this.middleware = this.routes = undefined;
    return matchers;
  }
  buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.middleware, this.routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute || (hasOwnRoute = true);
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]]));
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  constructor(init) {
    this.name = "SmartRouter";
    this.routers = [];
    this.routes = [];
    Object.assign(this, init);
  }
  add(method, path, handler) {
    if (!this.routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.routes) {
      throw new Error("Fatal error");
    }
    const { routers, routes } = this;
    const len = routers.length;
    let i = 0;
    let res;
    for (;i < len; i++) {
      const router = routers[i];
      try {
        routes.forEach((args) => {
          router.add(...args);
        });
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.routers = [router];
      this.routes = undefined;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var Node2 = class {
  constructor(method, handler, children) {
    this.order = 0;
    this.params = {};
    this.children = children || {};
    this.methods = [];
    this.name = "";
    if (method && handler) {
      const m = {};
      m[method] = { handler, possibleKeys: [], score: 0, name: this.name };
      this.methods = [m];
    }
    this.patterns = [];
  }
  insert(method, path, handler) {
    this.name = `${method} ${path}`;
    this.order = ++this.order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    const parentPatterns = [];
    for (let i = 0, len = parts.length;i < len; i++) {
      const p = parts[i];
      if (Object.keys(curNode.children).includes(p)) {
        parentPatterns.push(...curNode.patterns);
        curNode = curNode.children[p];
        const pattern2 = getPattern(p);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.children[p] = new Node2;
      const pattern = getPattern(p);
      if (pattern) {
        curNode.patterns.push(pattern);
        parentPatterns.push(...curNode.patterns);
        possibleKeys.push(pattern[1]);
      }
      parentPatterns.push(...curNode.patterns);
      curNode = curNode.children[p];
    }
    if (!curNode.methods.length) {
      curNode.methods = [];
    }
    const m = {};
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      name: this.name,
      score: this.order
    };
    m[method] = handlerSet;
    curNode.methods.push(m);
    return curNode;
  }
  gHSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.methods.length;i < len; i++) {
      const m = node.methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== undefined) {
        handlerSet.params = {};
        handlerSet.possibleKeys.forEach((key) => {
          const processed = processedSet[handlerSet.name];
          handlerSet.params[key] = params[key] && !processed ? params[key] : nodeParams[key] ?? params[key];
          processedSet[handlerSet.name] = true;
        });
        handlerSets.push(handlerSet);
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.params = {};
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i = 0, len = parts.length;i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length;j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.children[part];
        if (nextNode) {
          nextNode.params = node.params;
          if (isLast === true) {
            if (nextNode.children["*"]) {
              handlerSets.push(...this.gHSets(nextNode.children["*"], method, node.params, {}));
            }
            handlerSets.push(...this.gHSets(nextNode, method, node.params, {}));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.patterns.length;k < len3; k++) {
          const pattern = node.patterns[k];
          const params = { ...node.params };
          if (pattern === "*") {
            const astNode = node.children["*"];
            if (astNode) {
              handlerSets.push(...this.gHSets(astNode, method, node.params, {}));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.gHSets(child, method, node.params, params));
            continue;
          }
          if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
            if (typeof key === "string") {
              params[name] = part;
              if (isLast === true) {
                handlerSets.push(...this.gHSets(child, method, params, node.params));
                if (child.children["*"]) {
                  handlerSets.push(...this.gHSets(child.children["*"], method, params, node.params));
                }
              } else {
                child.params = params;
                tempNodes.push(child);
              }
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const results = handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [results.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  constructor() {
    this.name = "TrieRouter";
    this.node = new Node2;
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (const p of results) {
        this.node.insert(method, p, handler);
      }
      return;
    }
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter, new TrieRouter]
    });
  }
};

// src/helper/logger.ts
var import_moment = __toESM(require_moment(), 1);
var import_winston = __toESM(require_winston(), 1);
var { combine, timestamp, printf, colorize } = import_winston.format;
var loggerFormat = printf(({ level, message, timestamp: timestamp2 }) => {
  return `${timestamp2} [${level}]: ${message}`;
});
var Logger = import_winston.createLogger({
  level: "debug",
  format: combine(colorize(), timestamp({
    format: () => import_moment.default().format("ddd, DD MMM YYYY HH:mm:ss")
  }), loggerFormat),
  transports: [new import_winston.transports.Console]
});
// src/helper/error-handler.ts
var handleError = (context, error) => {
  Logger.error(`[${context}]`, error);
};
// src/helper/request.ts
import { createServer } from "http";
var convertToRequest = async (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  const headers = new Headers(req.headers);
  const options = { method, headers };
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    options.body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        resolve(data);
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
  }
  return new Request(url.toString(), options);
};
var serverless = (app) => createServer(async (req, res) => {
  try {
    const request = await convertToRequest(req);
    const response = await app.fetch(request);
    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    const body = await response.text();
    res.end(body);
  } catch (err) {
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});
// src/service/rabbitmq-infra.ts
var import_dotenv = __toESM(require_main(), 1);
var import_amqplib = __toESM(require_channel_api(), 1);
import_dotenv.config({ path: "../.env" });
var RABBITMQ_URL = "amqps://gxylgqlb:OWeSHYsGOtgehoHdMHBwkbnvUOHLZQCI@armadillo.rmq.cloudamqp.com/gxylgqlb";
if (!RABBITMQ_URL) {
  throw new Error("Environment variable RABBITMQ_URL is not set.");
}
var connectRabbitMQ = async (qName) => {
  try {
    const connection = await import_amqplib.default.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange("myapp-rabbitmq", "direct", { durable: true });
    console.log(`Connected to RabbitMQ and listening on queue: ${qName}`);
    return channel;
  } catch (error) {
    handleError("RabbitMQ Connection", error);
    throw error;
  }
};
var processMessage = async (channel, msg, handler) => {
  if (!msg)
    return;
  try {
    const payload = JSON.parse(msg.content.toString());
    console.log("Received message:", payload);
    await handler(payload);
    channel.ack(msg);
  } catch (error) {
    handleError("Message Processing", error);
  }
};

// src/listener/index.ts
var listeningQueue = async (qName, receiveHandler) => {
  try {
    const channel = await connectRabbitMQ(qName);
    const q = await channel.assertQueue(qName, { durable: true });
    await channel.bindQueue(q.queue, "myapp-rabbitmq", qName);
    channel.consume(q.queue, async (msg) => await processMessage(channel, msg, receiveHandler), { noAck: false });
  } catch (error) {
    handleError("Queue Listener", error);
  }
};

// src/listener/create-user.ts
var handleCreateUser = async (payload) => {
  Logger.info("Processing payload:", payload);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

// src/index.ts
async function startListener() {
  try {
    Logger.info("Starting listener...");
    await listeningQueue("USER_REGISTRATION", handleCreateUser);
    Logger.info("Listener started successfully.");
  } catch (error) {
    Logger.error("Failed to start listener:", error);
    throw error;
  }
}
async function startServer() {
  try {
    await startListener();
    server.listen(port, () => {
      Logger.info(`[Hono-Service] Server is running on port ${port}`);
    });
  } catch (error) {
    Logger.error("Failed to start server and listener:", error);
    process.exit(1);
  }
}
import_dotenv2.config();
var app = new Hono2;
var port = process.env.PORT || 8989;
app.get("/", (c) => {
  return c.json({
    message: "Service is running",
    timestamp: new Date().toISOString()
  });
});
app.get("/queue", async (c) => {
  try {
    Logger.info("Manually triggering queue listener...");
    await listeningQueue("USER_REGISTRATION", handleCreateUser);
    return c.json({
      message: "USER_REGISTRATION queue processing initiated",
      processed: true
    });
  } catch (error) {
    Logger.error("Queue processing failed:", error);
    return c.json({
      message: "Queue processing failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});
app.notFound((c) => c.json({
  message: "Route not found",
  status: 404
}, 404));
app.onError((error, c) => {
  Logger.error("Unhandled application error:", error);
  return c.json({
    message: "Internal server error",
    error: error instanceof Error ? error.message : "Unknown error"
  }, 500);
});
var server = serverless(app);
startServer();
