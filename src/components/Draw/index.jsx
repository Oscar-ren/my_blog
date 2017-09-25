'use strict';

import Component from 'inferno-component';
import styles from './draw.css';

export default class Draw extends Component {
  constructor (props) {
    super(props);
    this.state = {
      alreadyGet: false
    };
    this.getAward = this.getAward.bind(this);
    this.noGet = this.noGet.bind(this);
  }

  componentDidMount () {
    this.getAwardInfo();
    document.title = '深圳万科客户关系中心';
  }

  getAwardInfo () {
    let self = this;
    fetch(`/vanke/getAwardInfo`)
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
    fetch(`/vanke/getAward?id=${self.state.id}`)
      .then(res => res.json())
      .then(data => {
        if(!data.error) {
          self.setState({
            remain: data.remain,
            alreadyGet: true
          });
          alert('恭喜你领取成功！');
        }else {
          alert(data.errMsg);
        }
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  noGet () {
    alert('您已领取奖品，请勿重复领取，谢谢');
  }

  render () {

    return (
      <div>
        <section className={styles.awardPic}>
          <img src={this.state.pic ? `../pics/${this.state.pic}` : ''} alt=""/>
        </section>
        <article className={styles.abutt}>
          <h2 className="title">{this.state.name || '商品名称'}</h2>
          {/*<span>剩余：{this.state.remain || 0}</span>*/}
          <div className={styles.operator}>
            <button onClick={this.state.alreadyGet ? this.noGet : this.getAward}>立即领取</button>
          </div>
          <span>活动说明:</span>
          <ol className={styles.activityInfo}>
            <li>抽奖时间仅限于2017年9月26日—2017年9月30日;</li>
            <li>抽中的业主请联系现场工作人员及时领取奖品;</li>
            <li>本次活动最终解释权归深圳市万科云城房地产有限公司。</li>
          </ol>
        </article>
      </div>
    );
  }
}

