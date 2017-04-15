/* @flow */

import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
// import {withJob} from 'react-jobs/ssr';
import {withJob} from 'react-jobs/ssr';
import Helmet from 'react-helmet';
import * as PostActions from '../../../../actions/posts';
import * as FromState from '../../../../reducers';
import type {Post as PostType} from '../../../../types/model';

type Props = {
  post: ?PostType,
};

function Post(props: Props) {
  const post = props.post;
  if (!post) {
    // Post hasn't been fetched yet. It would be better if we had a "status"
    // reducer attached to our posts which gave us a bit more insight, such
    // as whether the post is currently being fetched, or if the fetch failed.
    // if(props.job.error){
    //   return <h1>Error...</h1>
    // }
    // if(props.job.inProgress){
    //   return <h1>Loading...</h1>
    // }

    return null;
  }

  const {title, body} = post;

  return (
    <div>
      <Helmet title={`Posts - ${title}`}/>

      <h1>{title}</h1>
      <div>
        {body}
      </div>
      <div>
        Foo
      </div>
    </div>
  );
}

// function mapStateToProps(state, {params: {id}}) {
function mapStateToProps(state, props) {
  // console.warn(props)
  const id = props.match.params.id;
  return {
    // post: FromState.getPostById(state, id),
    post: state.posts.byId[id]
  };
}

const mapActionsToProps = {
  fetchPost: PostActions.fetch,
};

// We use the "compose" function from redux (but the lodash/ramda/etc equivalent
// would do the same), so that we can neatly attach multiple higher order
// functions to our component.
// They get attached to our component from a bottom up approach (i.e. the
// arguments of compose from right to left).
// Firstly the "withJob" is attached, indicating we want to do some async work.
// Then the redux "connect" is attached.
// This means the redux state and action will be passed through our "withJob".
// The job is meant to fire the fetching of a post.  If no post exists within
// the redux state it will fire the "fetchPost" redux-thunk action.  If you
// look at that action you will see it returns a Promise. It is a requirement
// to return a Promise when executing an asynchronous job so that the job
// runner knows when the job is complete.  You will also see that we first
// check to see if the post already exists within the state, if so we just
// return it which would then result in a synchronous execution of our component.
export default compose(
  connect(mapStateToProps, mapActionsToProps),
  withJob({
    work: function(props)  {
      const {fetchPost,post,match} = props;
      const id = match.params.id;
      // console.warn(props)
      if (post) {
        // We already have a post, just return true.
        return true;
      }
      // Execute the redux-thunk powered action that returns a Promise and
      // fetches the post.
      return fetchPost(id);
    },
    shouldWorkAgain: (prevProps, nextProps) =>
    prevProps.match.params.id !== nextProps.match.params.id,
    LoadingComponent: (props) => <div>In withJob Loading...</div>, // Optional
    ErrorComponent: ({ error }) => <div>In withJob error: {error.message}</div>, // Optional
  })
)(Post);
