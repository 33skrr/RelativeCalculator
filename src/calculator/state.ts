import { isRelationDisabled, type Direction, type Gender, type RelationId } from './relations';

export interface CalculatorState {
  gender: Gender;
  chain: readonly RelationId[];
  direction: Direction;
  calculated: boolean;
}

export type CalculatorAction =
  | { type: 'append'; relation: RelationId }
  | { type: 'backspace' | 'reset' | 'toggleDirection' | 'calculate' }
  | { type: 'setGender'; gender: Gender };

export const initialState: CalculatorState = {
  gender: 'male', chain: [], direction: 'forward', calculated: false,
};

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'append':
      return isRelationDisabled(action.relation, state.gender) ? state :
        { ...state, chain: [...state.chain, action.relation], calculated: false };
    case 'backspace':
      return { ...state, chain: state.chain.slice(0, -1), calculated: false };
    case 'reset':
      return { ...initialState, gender: state.gender };
    case 'setGender':
      return { ...state, gender: action.gender };
    case 'toggleDirection':
      return { ...state, direction: state.direction === 'forward' ? 'reverse' : 'forward' };
    case 'calculate':
      return { ...state, calculated: true };
  }
}
