import fromExponential from 'from-exponential';
import thousands from 'thousands';
import toPrecision from './to-precision.js';
import { addSuffix } from './morpheme.js';

/**
 * @import {PRECISION_SETTING} from './to-precision.js';
 * @import {ROUNDING_MODE} from './to-precision.js';
 */

/**
 * @param {number|string} value
 * @param {object} [options]
 * @param {number} [options.precision]
 * @param {PRECISION_SETTING} [options.precisionSetting = PRECISION_SETTING.REDUCE]
 * @param {ROUNDING_MODE} [options.roundingMode = ROUNDING_MODE.HALF_EVEN]
 * @param {string} [options.thousandsSeparator]
 * @param {string} [options.decimalSeparator = '.']
 * @param {boolean} [options.separateOneDigit = true]
 * @param {string[]} [options.units]
 * @param {number} [options.stepValue]
 * @return {string}
 */
export default function prettyNum(value, {precision, precisionSetting, roundingMode, thousandsSeparator, decimalSeparator, separateOneDigit = true, units, stepValue} = {}) {
    // remove exponential notation
    let num = fromExponential(value);

    // reduce precision
    num = toPrecision(num, precision, {precisionSetting, roundingMode});

    if (units && stepValue && Number(num) >= stepValue) {
        let v = 1;
        const temporaryNum = Number(num);
        const objs = [];
        const keys = Object.keys(objs);
        let closeValue;

        for (let index = 0, l = units.length; index < l; index += 1) {
            v *= stepValue;
            objs[v] = units[index];
        }

        const reducer = (a, c) => (Math.abs(Number(a) - temporaryNum) < Math.abs(Number(c) - temporaryNum) ? a : c);

        for (let index = 0, l = keys.length; index < l; index += 1) {
            const key = keys[index];
            closeValue = reducer(closeValue, key);
        }

        const result = (temporaryNum / Number(closeValue)).toString();
        return addSuffix(result, objs[closeValue]);
    }

    // skip separation if `!separateOneDigit && num < 10000`
    if (thousandsSeparator && (separateOneDigit || Number(num) >= 10000)) {
        num = thousands(num, thousandsSeparator);
    }

    if (decimalSeparator && decimalSeparator !== '.') {
        num = num.replace('.', decimalSeparator);
    }

    return num;
}
