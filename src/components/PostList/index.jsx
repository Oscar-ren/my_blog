import Component from 'inferno-component';
import { Link } from 'inferno-router';
import styles from './postlist.css';
import fecha from 'fecha';

export default class PostList extends Component {
  constructor (props) {
    super(props);
    this.state = {
      posts: [],
      post: {}
    };
    this.processBlogContent = this.processBlogContent.bind(this);
    this.getPostsData = this.getPostsData.bind(this);
  }

  processBlogContent (content) {
    return `${content.split('<!--more-->')[0]} [...]`;
  }

  componentDidMount () {
    this.getPostsData();
    document.title = '任祥磊的博客';
  }

  getPostsData (page = 1, tag = '') {
    fetch(`/json/posts?page=${page}&tag=${encodeURIComponent(tag)}`)
      .then(res => res.json())
      .then(data => {
        this.props.update(data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  render () {
    const {posts} = this.props;

    return (
      <div>
        {posts.map(prop => {
          return (
            <article>
              <section className={styles.meta}>
                <div className={styles.date}>{fecha.format(new Date(prop.date), 'MMM D, YYYY')}</div>
              </section>
              <h1 className={styles.title}><Link to={`/blog/${prop.name}`}>{prop.title}</Link></h1>
              <div>
                <div dangerouslySetInnerHTML={{__html: this.processBlogContent(prop.content)}} />
                <p><Link to={`/blog/${prop.name}`}>继续阅读 »</Link></p>
              </div>
            </article>
          );
        })}
        <nav className={styles.page_nav}>
          <Link className={styles.next} to="/">下一页 »</Link>
          <div className={styles.center}>
            <Link to="/archives">博客归档</Link>
          </div>
        </nav>
      </div>
    );
  }
}

PostList.defaultProps = {
  // 预置props
  posts: []
};
