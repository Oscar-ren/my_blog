'use strict';

import Component from 'inferno-component';
import styles from './draw.css';

export default class Draw extends Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.getAward = this.getAward.bind(this);
  }

  componentDidMount () {
    this.getAwardInfo();
    document.title = '任祥磊的博客';
  }

  getAwardInfo () {
    let self = this;
    fetch(`/wanke/getAwardInfo`)
      .then(res => res.json())
      .then(data => {
        if(!data.error) {
          self.setState({...data.award, id: data.id});
        }else {
          alert(data.errMsg);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  getAward () {
    let self = this;
    fetch(`/wanke/getAward?id=${self.state.id}`)
      .then(res => res.json())
      .then(data => {
        if(!data.error) {
          self.setState({
            remain: data.remain
          });
          alert('恭喜你领取成功！');
        }else {
          alert(data.errMsg);
        }
      })
      .catch(err => {
        console.log('err', err);
      });

    this.getAward = function(){};
  }

  render () {

    return (
      <div>
        <section className={styles.awardPic}>
          <img src={this.state.pic ? `../pics/${this.state.pic}` : ''} alt=""/>
        </section>
        <article className={styles.abutt}>
          <h2 className="title">{this.state.name || '商品名称'}</h2>
          <span>剩余：{this.state.remain || 0}</span>
          <div className={styles.operator}>
            <button onClick={this.getAward}>立即领取</button>
          </div>
        </article>
      </div>
    );
  }
}

