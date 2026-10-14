import { describe, expect, it } from 'vitest';
import { calculate } from './engine';
import type { RelationId } from './relations';

describe('真实亲属称呼计算', () => {
  it.each<{ chain: RelationId[]; name: string }>([
    { chain: ['father'], name: '爸爸' },
    { chain: ['mother'], name: '妈妈' },
    { chain: ['father', 'father'], name: '爷爷' },
    { chain: ['mother', 'mother'], name: '外婆' },
    { chain: ['father', 'olderBrother'], name: '伯父' },
    { chain: ['father', 'youngerBrother'], name: '叔叔' },
    { chain: ['father', 'olderSister'], name: '姑妈' },
    { chain: ['mother', 'youngerBrother'], name: '舅舅' },
    { chain: ['mother', 'olderSister'], name: '姨妈' },
    { chain: ['son', 'son'], name: '孙子' },
    { chain: ['daughter', 'daughter'], name: '外孙女' },
    { chain: ['father', 'olderBrother', 'wife'], name: '伯母' },
  ])('$chain → $name', ({ chain, name }) => {
    expect(calculate(chain, 'male', 'forward')).toMatchObject({ status: 'resolved', names: expect.arrayContaining([name]) });
  });

  it('空链是自己', () => {
    expect(calculate([], 'female', 'forward').names).toEqual(['自己']);
    expect(calculate([], 'male', 'reverse').names).toEqual(['自己']);
  });

  it('反向称呼使用我的性别', () => {
    expect(calculate(['father', 'olderBrother'], 'male', 'reverse').names).toContain('侄子');
    expect(calculate(['father', 'olderBrother'], 'female', 'reverse').names).toContain('侄女');
    expect(calculate(['mother'], 'male', 'reverse').names).toContain('儿子');
    expect(calculate(['mother'], 'female', 'reverse').names).toContain('女儿');
  });

  it('姻亲反向称呼沿用计算库的明确结果', () => {
    expect(calculate(['father', 'olderBrother', 'wife'], 'male', 'reverse')).toMatchObject({
      status: 'resolved', names: expect.arrayContaining(['夫侄子']),
    });
  });

  it('不确定年龄时保留表姐和表妹', () => {
    expect(calculate(['mother', 'olderSister', 'daughter'], 'female', 'forward').names).toEqual(expect.arrayContaining(['表姐', '表妹']));
  });

  it('堂亲不擅自判断长幼', () => {
    expect(calculate(['father', 'youngerBrother', 'son'], 'male', 'forward').names).toEqual(expect.arrayContaining(['堂哥', '堂弟']));
  });

  it('不可能路径返回友好失败而非编造称呼', () => {
    expect(calculate(['father', 'husband'], 'male', 'forward')).toMatchObject({ status: 'unresolved', names: [], message: expect.any(String) });
  });
});
