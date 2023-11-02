import {
  getDeclensionConst,
  getGenderByRule,
  endsWith,
  getGenderConst,
  startsWith,
  NOMINATIVE,
  GENITIVE,
  DATIVE,
  ACCUSATIVE,
  INSTRUMENTAL,
  PREPOSITIONAL,
  getDeclensionStr,
  applyMod,
  applyRule,
  findExactRule,
  FEMALE,
  MALE,
  ANDROGYNOUS,
  findRule,
  inclineByRules,
  getGenderByRuleSet,
  getModByIdx,
} from "./problem";

describe('String Manipulation Functions', () => {
  describe('getDeclensionConst()', () => {
    it('return DECLENSION as const', () => {
      expect(getDeclensionConst('nominative')).toEqual(NOMINATIVE);
      expect(getDeclensionConst(NOMINATIVE)).toEqual(NOMINATIVE);

      expect(getDeclensionConst('genitive')).toEqual(GENITIVE);
      expect(getDeclensionConst(GENITIVE)).toEqual(GENITIVE);

      expect(getDeclensionConst('dative')).toEqual(DATIVE);
      expect(getDeclensionConst(DATIVE)).toEqual(DATIVE);

      expect(getDeclensionConst('accusative')).toEqual(ACCUSATIVE);
      expect(getDeclensionConst(ACCUSATIVE)).toEqual(ACCUSATIVE);

      expect(getDeclensionConst('instrumental')).toEqual(INSTRUMENTAL);
      expect(getDeclensionConst(INSTRUMENTAL)).toEqual(INSTRUMENTAL);

      expect(getDeclensionConst('prepositional')).toEqual(PREPOSITIONAL);
      expect(getDeclensionConst(PREPOSITIONAL)).toEqual(PREPOSITIONAL);
    });

    it('return null', () => {
      expect(getDeclensionConst(null)).toEqual(null);
      expect(getDeclensionConst('strange')).toEqual(null);
    });

    it('return DECLENSION as string', () => {
      expect(getDeclensionStr('nominative')).toEqual('nominative');
      expect(getDeclensionStr(NOMINATIVE)).toEqual('nominative');

      expect(getDeclensionStr('genitive')).toEqual('genitive');
      expect(getDeclensionStr(GENITIVE)).toEqual('genitive');

      expect(getDeclensionStr('dative')).toEqual('dative');
      expect(getDeclensionStr(DATIVE)).toEqual('dative');

      expect(getDeclensionStr('accusative')).toEqual('accusative');
      expect(getDeclensionStr(ACCUSATIVE)).toEqual('accusative');

      expect(getDeclensionStr('instrumental')).toEqual('instrumental');
      expect(getDeclensionStr(INSTRUMENTAL)).toEqual('instrumental');

      expect(getDeclensionStr('prepositional')).toEqual('prepositional');
      expect(getDeclensionStr(PREPOSITIONAL)).toEqual('prepositional');
    });

    it('return null', () => {
      expect(getDeclensionStr(null)).toEqual(null);
      expect(getDeclensionStr('strange')).toEqual(null);
    });
  });

  describe('applyMod()', () => {
    it('should skip . in mod', () => {
      expect(applyMod('test', '.')).toEqual('test');
    });

    it('should remove char on -', () => {
      expect(applyMod('test', '-')).toEqual('tes');
      expect(applyMod('test', '--')).toEqual('te');
      expect(applyMod('test', '---ABC')).toEqual('tABC');
    });

    it('should add char otherwise', () => {
      expect(applyMod('test', 'ABC')).toEqual('testABC');
    });
  });

  describe('applyRule()', () => {
    it('should choose correct declension mod', () => {
      const rule = { mods: ['-ы', '-е', '-у', '-ой', '-Е'] } as Parameters<typeof applyRule>[0];
      expect(applyRule(rule, 'мама', NOMINATIVE)).toEqual('мама');
      expect(applyRule(rule, 'мама', GENITIVE)).toEqual('мамы');
      expect(applyRule(rule, 'мама', DATIVE)).toEqual('маме');
      expect(applyRule(rule, 'мама', ACCUSATIVE)).toEqual('маму');
      expect(applyRule(rule, 'мама', INSTRUMENTAL)).toEqual('мамой');
      expect(applyRule(rule, 'мама', PREPOSITIONAL)).toEqual('мамЕ');
    });
  });

  describe('findExactRule()', () => {
    it('should return null if rule not found', () => {
      const rules = [{ gender: FEMALE, mods: [], test: ['а'] }] as Parameters<typeof findExactRule>[0];

      expect(findExactRule(rules, MALE, () => true, [])).toEqual(null);
    });

    it('should filter by matchFn', () => {
      const rules = [
        { gender: MALE, test: ['а', 'б'], mods: [] },
        { gender: MALE, test: ['в'], mods: [] },
      ] as Parameters<typeof findExactRule>[0];

      expect(findExactRule(rules, MALE, (s) => 'ввв'.endsWith(s))).toEqual(rules[1]);
      expect(findExactRule(rules, MALE, (s) => 'ббб'.endsWith(s))).toEqual(rules[0]);
      expect(findExactRule(rules, MALE, (s) => 'ффф'.endsWith(s))).toEqual(null);
    });

    it('should filter by same gender', () => {
      const rules = [
        { gender: MALE, test: ['а'], tags: ['firstWord'], mods: [] },
        { gender: MALE, test: ['а'], mods: [] },
        { gender: FEMALE, test: ['а'], mods: [] },
      ] as Parameters<typeof findExactRule>[0];
      expect(findExactRule(rules, MALE, () => true)).toEqual(rules[1]);
      expect(findExactRule(rules, FEMALE, () => true)).toEqual(rules[2]);
    });

    it('should filter by tags', () => {
      const rules = [
        { gender: FEMALE, mods: [], test: ['а'] },
        { gender: MALE, test: ['а'], tags: ['firstWord'], mods: [] },
        { gender: MALE, test: ['а'], mods: [] },
      ] as Parameters<typeof findExactRule>[0];
      expect(findExactRule(rules, MALE, () => true, ['firstWord'])).toEqual(rules[1]);
      expect(findExactRule(rules, MALE, () => true, ['someTag'])).toEqual(rules[2]);
    });

    it('should accept ANDROGYNOUS for male and female', () => {
      const rules = [{ gender: ANDROGYNOUS, test: ['а'], mods: [] }] as Parameters<typeof findExactRule>[0];

      expect(findExactRule(rules, ANDROGYNOUS, () => true)).toEqual(rules[0]);
      expect(findExactRule(rules, MALE, () => true)).toEqual(rules[0]);
      expect(findExactRule(rules, FEMALE, () => true)).toEqual(rules[0]);
    });
  });

  describe('findRule()', () => {
    const ruleSet = {
      exceptions: [
        {
          gender: MALE,
          test: ['лев'],
          mods: ['--ьва', '--ьву', '--ьва', '--ьвом', '--ьве'],
        },
      ],
      suffixes: [
        {
          gender: MALE,
          test: ['б', 'в'],
          mods: ['а', 'у', 'а', 'ом', 'е'],
        },
      ],
    } as Parameters<typeof findRule>[2];

    it('should return null if empty string', () => {
      expect(findRule('', MALE, ruleSet)).toEqual(null);
    });

    it('should firstly look exceptions by matching whole string', () => {
      expect(findRule('лев', MALE, ruleSet)).toEqual(ruleSet.exceptions?.[0]);
    });

    it('should look suffixes by matching end of string', () => {
      expect(findRule('ярослав', MALE, ruleSet)).toEqual(ruleSet.suffixes?.[0]);
    });

    it('should lowercase string', () => {
      expect(findRule('ЛЕВ', MALE, ruleSet)).toEqual(ruleSet.exceptions?.[0]);
      expect(findRule('ЯРОСЛАВ', MALE, ruleSet)).toEqual(ruleSet.suffixes?.[0]);
    });
  });

  describe('inclineByRules()', () => {
    const ruleSet = {
      exceptions: [
        {
          gender: MALE,
          test: ['лев'],
          mods: ['--ьва', '--ьву', '--ьва', '--ьвом', '--ьве'],
        },
      ],
      suffixes: [
        {
          gender: MALE,
          test: ['б', 'в'],
          mods: ['а', 'у', 'а', 'ом', 'е'],
        },
      ],
    } as Parameters<typeof inclineByRules>[3];

    it('should incline word by rules', () => {
      expect(inclineByRules('лев', GENITIVE, MALE, ruleSet)).toEqual('льва');
      expect(inclineByRules('лев', DATIVE, MALE, ruleSet)).toEqual('льву');
      expect(inclineByRules('лев', ACCUSATIVE, MALE, ruleSet)).toEqual('льва');
      expect(inclineByRules('вячеслав', INSTRUMENTAL, MALE, ruleSet)).toEqual('вячеславом');
      expect(inclineByRules('вячеслав', PREPOSITIONAL, MALE, ruleSet)).toEqual('вячеславе');
    });

    it('should incline both words written via dash', () => {
      expect(inclineByRules('лев-лев', DATIVE, MALE, ruleSet)).toEqual('льву-льву');
    });
  });

  describe('endsWith function', () => {
    it('returns true when the search string is at the end of the input string', () => {
      expect(endsWith('Hello, World', 'World')).toBe(true);
    });

    it('returns true when the search string is equal to the input string', () => {
      expect(endsWith('Hello', 'Hello')).toBe(true);
    });

    it('returns false when the search string is not at the end of the input string', () => {
      expect(endsWith('Writing tests is awesome', 'is')).toBe(false);
    });

    it('returns true when the search string is an empty string', () => {
      expect(endsWith('Testing an empty string ending', '')).toBe(true);
    });

    it('returns true when both strings are empty', () => {
      expect(endsWith('', '')).toBe(true);
    });

    it('returns false when the search string is longer than the input string', () => {
      expect(endsWith('Hello', 'Hello, World!')).toBe(false);
    });

    it('returns false when the input string is an empty string and the search string is not empty', () => {
      expect(endsWith('', 'test')).toBe(false);
    });
  });

  describe('startsWith function', () => {
    it('returns true when the search string is at the beginning of the input string', () => {
      expect(startsWith('Hello, World', 'Hello')).toBe(true);
    });

    it('returns true when the search string is an empty string', () => {
      expect(startsWith('Testing with an empty search string', '')).toBe(true);
    });

    it('returns false when the search string is not at the beginning of the input string', () => {
      expect(startsWith('Writing tests is awesome', 'is')).toBe(false);
    });

    it('returns true when the search string starts at a specific position', () => {
      expect(startsWith('Checking a specific position', 'a', 9)).toBe(true);
    });

    it('returns false when the search string length exceeds the string length', () => {
      expect(startsWith('Hello', 'Hello, World!')).toBe(false);
    });

    it('returns true when both strings are empty', () => {
      expect(startsWith('', '')).toBe(true);
    });
  });

  describe('getGenderConst function', () => {
    it('returns the correct constant for a valid string input', () => {
      expect(getGenderConst('male')).toBe(MALE);
      expect(getGenderConst('female')).toBe(FEMALE);
      expect(getGenderConst('androgynous')).toBe(ANDROGYNOUS);
    });

    it('returns the correct constant for already defined constant input', () => {
      expect(getGenderConst(MALE)).toBe(MALE);
      expect(getGenderConst(FEMALE)).toBe(FEMALE);
      expect(getGenderConst(ANDROGYNOUS)).toBe(ANDROGYNOUS);
    });

    it('returns null for an undefined or invalid input', () => {
      expect(getGenderConst('unknown')).toBe(null);
      expect(getGenderConst(null)).toBe(null);
      expect(getGenderConst(undefined)).toBe(null);
    });
  });

  describe('getGenderByRuleSet()', () => {
    const ruleSet = {
      exceptions: {
        androgynous: ['дарвин', 'грин'],
        male: ['-ага'],
      },
      suffixes: {
        male: ['н'],
        female: ['на', 'га'],
      },
    };

    it('should return null if name is empty', () => {
      expect(getGenderByRuleSet('', ruleSet)).toEqual(null);
    });

    it('should check exceptions firstly', () => {
      expect(getGenderByRuleSet('Дарвин', ruleSet)).toEqual(ANDROGYNOUS);
    });

    it('should check exceptions with suffix', () => {
      expect(getGenderByRuleSet('ольга', ruleSet)).toEqual(FEMALE);
      expect(getGenderByRuleSet('адилага', ruleSet)).toEqual(MALE);
    });

    it('should check suffixes', () => {
      expect(getGenderByRuleSet('Пилевин', ruleSet)).toEqual(MALE);
      expect(getGenderByRuleSet('Пилевина', ruleSet)).toEqual(FEMALE);
    });
  });

  describe('getGenderByRule()', () => {
    it('should return GENDER', () => {
      const rules = {
        female: ['ова'],
        male: ['ов'],
        androgynous: ['о'],
      };

      expect(getGenderByRule(rules, (some) => 'Петров'.endsWith(some))).toEqual(MALE);

      expect(getGenderByRule(rules, (some) => 'Иванова'.endsWith(some))).toEqual(FEMALE);

      expect(getGenderByRule(rules, (some) => 'Зубко'.endsWith(some))).toEqual(ANDROGYNOUS);
    });

    it('should return null if no match with rules', () => {
      const rules = {
        male: ['ов'],
      };
      expect(getGenderByRule(rules, (some) => 'Рыбак'.endsWith(some))).toEqual(null);
    });

    it('should return null if match several genders', () => {
      const rulesOverlapped = {
        female: ['a'],
        male: ['a'],
      };

      expect(getGenderByRule(rulesOverlapped, (some) => 'Рыбка'.endsWith(some))).toEqual(null);
    });
  });

  describe('getModByIdx function', () => {
    test('returns correct value at a valid index', () => {
      expect(getModByIdx(['a', 'b', 'c', 'd', 'e'], 2)).toBe('c');
    });

    test('returns "." for invalid input', () => {
      expect(getModByIdx([], 1)).toBe('.');
    });

    test('returns correct value for empty array', () => {
      expect(getModByIdx([], 0)).toBe(undefined);
    });
  });
});

