import { Route, IndexRoute } from 'inferno-router';
import {App, PostList, Post, Tags, Archives, About, Draw} from './components/index';

const createRoutes = initialState => (
  <Route path="/" component={ App } { ...initialState }>
    <IndexRoute component={ PostList } />
    <Route path="blog" component={ PostList } />
    <Route path="blog/:name" component={ Post } />
    <Route path="tags" component={ Tags } />
    <Route path="archives" component={ Archives } />
    <Route path="about" component={ About } />
    <Route path="wanke/draw" component={ Draw } />
  </Route>
);

export default createRoutes;
