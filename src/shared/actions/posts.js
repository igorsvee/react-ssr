/* @flow */
/* eslint-disable import/prefer-default-export */
import {createAction} from 'redux-actions';
import type {Post} from '../types/model';
import type {Action, ThunkAction} from '../types/redux';

function fetching(id: number): Action {
  return {type: 'FETCHING_POST', payload: id};
}

function fetched(post: Post): Action {
  return {type: 'FETCHED_POST', payload: post};
}

//todo: are these global ones even needed when there's react-jobs?
const fetchPostsStart = createAction('FETCHING_START', (id: number) => id);
const fetchPostsError = createAction('FETCH_ERROR', (error: string) => error);

const fetchPostsSuccess = createAction('FETCH_SUCCESS', (data: Post) => data);


// export function fetch(id: number) : ThunkAction {
//   return (dispatch, getState, { axios }) => {
//     dispatch(fetching(id));
//
//     return axios
//       .get(`https://jsonplaceholder.typicode.com/posts/${id}`)
//       .then(({ data }) => dispatch(fetched(data)))
//       // We use 'react-jobs' to call our actions.  We don't want to return
//       // the actual action to the 'react-jobs' withJob as it will cause
//       // the data to be serialized into the react-jobs state by the server.
//       // As we already have the state in the redux state tree, which is also
//       // getting serialized by the server we will just return a simple "true"
//       // here to indicate to react-jobs that all is well.
//       .then(() => true);
//   };
// }


function fetchWithError() {
  return new Promise((_, reject) => {
    setTimeout(() => reject("oops"), 500)
  })
}

// import axios from 'axios';
export function fetch(id: number) {
  return (dispatch, getState, opts) => {
    // console.warn(opts)
    const axios = opts.axios;
    // console.warn(axios)
    dispatch(fetchPostsStart(id));

    return axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
    // return fetchWithError()
      .then(({data}) => dispatch(fetchPostsSuccess(data)))
      // We use 'react-jobs' to call our actions.  We don't want to return
      // the actual action to the 'react-jobs' withJob as it will cause
      // the data to be serialized into the react-jobs state by the server.
      // As we already have the state in the redux state tree, which is also
      // getting serialized by the server we will just return a simple "true"
      // here to indicate to react-jobs that all is well.
      .then(() => true)
      .catch((err) => {
        dispatch(fetchPostsError(err));
        throw new Error(err); //  for react jobs
        // return false;
      })
  };


}
