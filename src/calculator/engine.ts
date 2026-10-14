import relationship from 'relationship.js';
import { formatChain, type Direction, type Gender, type RelationId } from './relations';

export type CalculationResult =
  | { status: 'resolved'; names: string[] }
  | { status: 'unresolved'; names: []; message: string };

// Use familiar general Mandarin names without changing the engine's relationships.
const commonNames: Record<string, string> = {
  大姑: '姑妈', 小姑: '姑姑', 大姨: '姨妈', 小姨: '阿姨', 大舅: '舅舅', 小舅: '舅舅',
  姨哥: '表哥', 姨弟: '表弟', 姨姐: '表姐', 姨妹: '表妹',
  舅哥: '表哥', 舅弟: '表弟', 舅姐: '表姐', 舅妹: '表妹',
  姑哥: '表哥', 姑弟: '表弟', 姑姐: '表姐', 姑妹: '表妹',
};

export function calculate(chain: readonly RelationId[], gender: Gender, direction: Direction): CalculationResult {
  if (chain.length === 0) return { status: 'resolved', names: ['自己'] };
  try {
    const names = [...new Set(relationship({
      text: formatChain(chain),
      sex: gender === 'male' ? 1 : 0,
      reverse: direction === 'reverse',
    }).map(name => commonNames[name] ?? name))];
    if (names.length) return { status: 'resolved', names };
  } catch {
    // An unsupported relationship must not take down the calculator.
  }
  return { status: 'unresolved', names: [], message: '暂未找到对应称呼，请检查关系' };
}
