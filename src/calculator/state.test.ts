import { describe, expect, it } from 'vitest';
import { calculatorReducer, initialState, type CalculatorState } from './state';
import { formatChain, isRelationDisabled } from './relations';

describe('用户指定的性别联动', () => {
  it.each([
    ['female', 'wife', true], ['female', 'husband', false],
    ['male', 'husband', true], ['male', 'wife', false],
    ['male', 'mother', false], ['female', 'father', false],
  ] as const)('%s / %s 禁用为 %s', (gender, relation, disabled) => {
    expect(isRelationDisabled(relation, gender)).toBe(disabled);
  });
  it('切换性别立即改变禁用状态，不能添加被禁用的关系', () => {
    const female = calculatorReducer(initialState, { type: 'setGender', gender: 'female' });
    expect(calculatorReducer(female, { type: 'append', relation: 'wife' }).chain).toEqual([]);
    expect(calculatorReducer(female, { type: 'append', relation: 'husband' }).chain).toEqual(['husband']);
  });
  it('禁用只关联顶部性别，不关联链末端', () => {
    const mother = calculatorReducer(initialState, { type: 'append', relation: 'mother' });
    expect(calculatorReducer(mother, { type: 'append', relation: 'husband' }).chain).toEqual(['mother']);
    expect(calculatorReducer(mother, { type: 'append', relation: 'wife' }).chain).toEqual(['mother', 'wife']);
  });
});

describe('计算器状态', () => {
  const computed: CalculatorState = { gender: 'female', chain: ['father', 'olderBrother'], direction: 'forward', calculated: true };
  it('切换不改链、不改性别且保留已计算状态', () => {
    const reverse = calculatorReducer(computed, { type: 'toggleDirection' });
    expect(reverse).toEqual({ ...computed, direction: 'reverse' });
    expect(calculatorReducer(reverse, { type: 'toggleDirection' })).toEqual(computed);
  });
  it('追加和回退清除已计算状态', () => {
    expect(calculatorReducer(computed, { type: 'append', relation: 'son' })).toMatchObject({ chain: ['father', 'olderBrother', 'son'], calculated: false });
    expect(calculatorReducer(computed, { type: 'backspace' })).toMatchObject({ chain: ['father'], calculated: false });
    expect(calculatorReducer(initialState, { type: 'backspace' }).chain).toEqual([]);
  });
  it('重置清空并恢复正向，保留女生选择', () => {
    expect(calculatorReducer({ ...computed, direction: 'reverse' }, { type: 'reset' })).toEqual({ gender: 'female', chain: [], direction: 'forward', calculated: false });
  });
  it('更改性别保留已输入内容和计算状态', () => {
    expect(calculatorReducer(computed, { type: 'setGender', gender: 'male' })).toEqual({ ...computed, gender: 'male' });
  });
  it('按等号标记计算，空链也可计算', () => {
    expect(calculatorReducer(initialState, { type: 'calculate' })).toMatchObject({ calculated: true, chain: [] });
  });
  it('显示原始中文关系链', () => {
    expect(formatChain(['mother', 'olderSister', 'daughter'])).toBe('妈妈的姐姐的女儿');
    expect(formatChain([])).toBe('');
  });
});
