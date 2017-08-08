import { renderToString } from 'inferno-server'
import { RouterContext, match } from 'inferno-router';
import hook from 'css-modules-require-hook';
import template from './template';

hook({
  extensions: ['.css'],
  camelCase: true,
  generateScopedName: '[name]__[local]',
});

// import 会提升，导致hook失效
const createRouters = require('../src/createRouters').default;

export default function staticRender({title, state, url}) {
  const renderProps = match(createRouters(state), url);
  const staticString = renderToString(<RouterContext {...renderProps}/>);
  return template({title, state, staticString});
}