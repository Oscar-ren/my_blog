'use strict';

import Inferno from 'inferno';
import Component from 'inferno-component';
import { Link, IndexLink } from 'inferno-router';
import styles from './app.css';

export default class App extends Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.update = this.update.bind(this);
  }

  update (props) {
    this.setState({...this.state, ...props});
  }

  render () {
    const {children, params, ...initialState} = this.props;

    const Main = children ? Inferno.cloneVNode(children, {
      ...initialState,
      ...this.state,
      update: this.update
    }) : null;

    return (
      <div>
        <div className={styles.left_column}>
          <header id="header">
            <div className={styles.profilepic}>
              <a />
            </div>
            <h1>任祥磊</h1>
            <p className={styles.subtitle}>我本是卧龙岗散淡的人～</p>
            <nav className={styles.main_nav}>
              <ul>
                <li><Link to="/" title="首页">首页</Link></li>
                <li><Link to="/tags" title="分类">分类</Link></li>
                <li><Link to="/archives" title="归档">归档</Link></li>
                {/* <li><Link to="/about" title="关于">关于</Link></li> */}
              </ul>
            </nav>
          </header>
        </div>
        <div className={styles.main_column}>
          <div className={styles.content}>{Main}</div>
          <footer>
            <p>© 2017 - <a href="https://github.com/Oscar-ren" target="_block">Oscar-ren</a> 的博客</p>
          </footer>
        </div>
      </div>
    );
  }
}

App.defaultProps = {
  // 预置props
  origin: typeof window !== 'undefined' ? window.location.origin : ''
};
