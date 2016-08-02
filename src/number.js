// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './list'], function(Node, List) {
  
  var Digit     = Node.fromHex('b456f922babe2c361f5e1698bf7ff64f');
  var NextDigit = Node.fromHex('cd9fb05be29e780fd9723b93498c6a1a');

  var N0 = Node.fromHex('5cfd607ae8e5314b1a1788628f127c81');
  var N1 = Node.fromHex('ea00242dd04ec5e96e4251e050f7bd3e');
  var N2 = Node.fromHex('f1084405448fe482a8581f4f9ac503a5');
  var N3 = Node.fromHex('94eef34208646aa40a50d5e13ee85d88');
  var N4 = Node.fromHex('52137324ddad739ae0e6f8b4a9b3a6df');
  var N5 = Node.fromHex('44ad1d6ec166d415aeea63fa55379ae5');
  var N6 = Node.fromHex('cd8c1673f804e3a139cbd31701a03e16');
  var N7 = Node.fromHex('75eaa9969ba9810e4d3957536cc261db');
  var N8 = Node.fromHex('eaeadfccb1863e046372058124259a41');
  var N9 = Node.fromHex('19de925a61547ad4dee7849b3a5a1f71');
  var DecimalPoint = Node.fromHex('5e1080992558015f5f146ff218885556');
  var Minus = Node.fromHex('4e5b8703cdbabb9715f5a6cea313826a');
  
  var charsToDigits = {
    '0': N0,
    '1': N1,
    '2': N2,
    '3': N3,
    '4': N4,
    '5': N5,
    '6': N6,
    '7': N7,
    '8': N8,
    '9': N9,
    '.': DecimalPoint,
    '-': Minus,
  }
  
  var digitsToChars = new Map();
  digitsToChars.set(Node.toMapKey(N0), '0');
  digitsToChars.set(Node.toMapKey(N1), '1');
  digitsToChars.set(Node.toMapKey(N1), '1');
  digitsToChars.set(Node.toMapKey(N2), '2');
  digitsToChars.set(Node.toMapKey(N3), '3');
  digitsToChars.set(Node.toMapKey(N4), '4');
  digitsToChars.set(Node.toMapKey(N5), '5');
  digitsToChars.set(Node.toMapKey(N6), '6');
  digitsToChars.set(Node.toMapKey(N7), '7');
  digitsToChars.set(Node.toMapKey(N8), '8');
  digitsToChars.set(Node.toMapKey(N9), '9');
  digitsToChars.set(Node.toMapKey(DecimalPoint), '.');
  digitsToChars.set(Node.toMapKey(Minus), '-');
  
  function Number(web, base) {
    this.list = List(web, NextDigit, Digit, base);
  }
  
  Number.prototype.hasValidNumber = function() {
    var digits = this.list.get();
    if (digits.length === 0) {
      return false;
    }
    var chars = [];
    for (var i=0; i < digits.length; i++) {
      var digit = Node.toMapKey(digits[i]);
      var char = digitsToChars.get(digit);
      if (!char) {
        return false;
      }
      chars.push(char);
    }
    var string = chars.join('');
    var number = parseFloat(string);
    return !isNaN(number);
  }
  
  Number.prototype.get = function() {
    var digits = this.list.get();
    if (digits.length === 0) {
      throw 'Cannot get number, no digits could be retrieved.';
    }
    var chars = [];
    for (var i=0; i < digits.length; i++) {
      var digit = Node.toMapKey(digits[i]);
      var char = digitsToChars.get(digit);
      if (!char) {
        throw 'Cannot get number, list contains an invalid digit.';
      }
      chars.push(char);
    }
    var string = chars.join('');
    var number = parseFloat(string);
    if (isNaN(number)) {
      throw 'Cannot get number, "' + string + '" could not be converted to a float.';
    }
    return number;
  }
  
  Number.prototype.set = function(number) {
    number = parseFloat(number);
    if (isNaN(number)) {
      throw 'Cannot set number, given argument is not a valid number.';
    }
    var chars = Array.from(String(number));
    var digits = [];
    for (var i=0; i < chars.length; i++) {
      var char = chars[i];
      var digit = charsToDigits[char];
      if (!digit) {
        throw 'Cannot set number, unrecognized digit "' + char + '" in string "' + String(number) + '".';
      }
      digits.push(digit);
    }
    this.list.clear();
    return this.list.append(digits);
  }
  
  Number.prototype.clear = function() {
    this.list.clear();
  }
  
  return function(web, base) {
    return new Number(web, base);
  }
});