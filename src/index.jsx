import Inferno from 'inferno';
import { Router } from 'inferno-router';
import createBrowserHistory from 'history/createBrowserHistory';
import 'prismjs/themes/prism-okaidia.css';
import createRoutes from './createRouters';
import './style.css';

const browserHistory = createBrowserHistory();
const routes = createRoutes(window.__INITIAL_STATE__);

Inferno.render((
  <Router history={browserHistory}>
    {routes}
  </Router>
), document.getElementById('root'));
