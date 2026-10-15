export type Gender = 'male' | 'female';
export type Direction = 'forward' | 'reverse';
export type RelationId = 'father' | 'mother' | 'husband' | 'wife' | 'olderBrother' | 'youngerBrother' | 'olderSister' | 'youngerSister' | 'son' | 'daughter';

export const relations: readonly { id: RelationId; label: string }[] = [
  { id: 'father', label: '爸爸' },
  { id: 'mother', label: '妈妈' },
  { id: 'husband', label: '老公' },
  { id: 'wife', label: '老婆' },
  { id: 'olderBrother', label: '哥哥' },
  { id: 'youngerBrother', label: '弟弟' },
  { id: 'olderSister', label: '姐姐' },
  { id: 'youngerSister', label: '妹妹' },
  { id: 'son', label: '儿子' },
  { id: 'daughter', label: '女儿' },
];

export function formatChain(chain: readonly RelationId[]): string {
  return chain.map(id => relations.find(relation => relation.id === id)!.label).join('的');
}

export function isRelationDisabled(relation: RelationId, gender: Gender): boolean {
  return (gender === 'female' && relation === 'wife') ||
    (gender === 'male' && relation === 'husband');
}
