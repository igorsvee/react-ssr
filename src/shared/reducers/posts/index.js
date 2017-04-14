/* @flow */

import {combineReducers} from 'redux';
import type {Reducer} from 'redux';
import type {Action} from '../../types/redux';

import all, * as FromAll from './all';
import type {State as AllState} from './all';

import byId, * as FromById from './byId';
import type {State as ByIdState} from './byId';

// -----------------------------------------------------------------------------
// EXPORTED REDUCER STATE TYPE

export type State = {
  all: AllState,
  byId: ByIdState
};

// -----------------------------------------------------------------------------
// REDUCER

const posts : Reducer<State, Action> = combineReducers({
  all,
  byId,
});

// -----------------------------------------------------------------------------
// EXPORTED SELECTORS

export function getById(state: State, id: number) {
  return FromById.getById(state.byId, id);
}

export function getAll(state: State) {
  return FromAll
    .getAll(state.all)
    .map(id => getById(state, id));
}

import {handleActions} from 'redux-actions'
import Immutable from 'seamless-immutable'

const initialState = Immutable({
    all: [],
    byId: {},
});

// -----------------------------------------------------------------------------
// REDUCER EXPORT

export default handleActions({
  FETCHING_POST : (state, action) =>{
       return state;
  } ,

  FETCHED_POST : (state, action) =>{
      const post = action.payload;
      console.warn(state.all instanceof Immutable)
      if(state.all.find(x => post.id === x)){
        return state;
      }else{
        const updatedArray = state.all.asMutable();
        updatedArray.push(post.id);
        return state.set('all',updatedArray).setIn(['byId',post.id],post)
      }
  } ,

}, initialState);

// export default posts;
