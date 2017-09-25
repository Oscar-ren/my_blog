'use strict';

import Component from 'inferno-component';
import styles from '../Draw/draw.css';
import fecha from 'fecha';

export default class AwardLog extends Component {
  constructor (props) {
    super(props);
    this.state = {
      log: [],
      award: []
    };
    this.getAwardLog = this.getAwardLog.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount () {
    this.getAwardLog();
    document.title = '抽奖后台';
  }

  getAwardLog () {
    let self = this;
    fetch(`/vanke/getAwardLog`)
      .then(res => res.json())
      .then(data => {
        self.setState({
          log: data.log,
          award: data.award
        });
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  reset () {
    let self = this;
    fetch(`/vanke/resetAward`)
      .then(res => res.json())
      .then(data => {
        alert("重置成功");
        self.setState({
          log: [],
          award: data.award
        });
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  render () {

    return (
      <div>
        <div className={styles.logOperator}>
          {this.state.award.map(item => {
            return (
              <span>{`奖品：${item.name} 剩余数：${item.remain} `}<br /></span>
            )
          })}
          <button onClick={this.reset}>重置</button>
        </div>
        <article>
          <div>领取信息({`已领取${this.state.log.length}个奖品`}):</div>
          <ol className={styles.activityInfo}>
            {this.state.log.map((item) => {
              return (
                <li>{`时间：${fecha.format(new Date(item.timestamp), 'YYYY-MM-DD hh:mm:ss')}， 领取了奖品${item.award.name}`}</li>
              )
            })}
          </ol>
        </article>
      </div>
    );
  }
}

