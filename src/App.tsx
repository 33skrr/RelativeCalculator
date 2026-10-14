import { useMemo, useReducer } from 'react';
import { calculate } from './calculator/engine';
import { formatChain, isRelationDisabled, relations } from './calculator/relations';
import { calculatorReducer, initialState } from './calculator/state';

export default function App() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const result = useMemo(() => state.calculated
    ? calculate(state.chain, state.gender, state.direction) : null,
  [state.chain, state.gender, state.direction, state.calculated]);

  return (
    <main className="calculator" aria-label="亲戚计算器">
      <header className="gender-row">
        <span id="gender-label">我是：</span>
        <div className="gender-options" role="group" aria-labelledby="gender-label">
          {(['female', 'male'] as const).map(gender => (
            <button key={gender} type="button" aria-pressed={state.gender === gender}
              onClick={() => dispatch({ type: 'setGender', gender })}>
              {gender === 'female' ? '女生' : '男生'}
            </button>
          ))}
        </div>
      </header>

      <section className="display" aria-label="计算显示区">
        <p className="chain" aria-label="关系链">{formatChain(state.chain)}</p>
        <div className={`answer${result?.status === 'unresolved' ? ' answer-error' : ''}`}
          role="status" aria-live="polite" aria-atomic="true">
          {result && (result.status === 'resolved' ? result.names.join(' / ') : result.message)}
        </div>
      </section>

      <section className="controls" aria-label="关系输入">
        <p className="direction">{state.direction === 'forward' ? '我称呼对方' : '对方称呼我'}</p>
        <div className="keypad">
          {relations.map(relation => (
            <button key={relation.id} type="button" className="key"
              disabled={isRelationDisabled(relation.id, state.gender)}
              onClick={() => dispatch({ type: 'append', relation: relation.id })}>
              {relation.label}
            </button>
          ))}
          <button type="button" className="key key-wide key-action" onClick={() => dispatch({ type: 'toggleDirection' })}>切换</button>
          <button type="button" className="key key-action" disabled={!state.chain.length}
            onClick={() => dispatch({ type: 'backspace' })}>回退</button>
          <button type="button" className="key key-action" onClick={() => dispatch({ type: 'reset' })}>重置</button>
          <button type="button" className="key key-wide key-equals" aria-label="计算"
            onClick={() => dispatch({ type: 'calculate' })}>＝</button>
        </div>
      </section>
    </main>
  );
}
