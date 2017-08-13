import Component from 'inferno-component';
import { Link } from 'inferno-router';
import styles from './archives.css';

export default class Archives extends Component {
  constructor (prop) {
    super(prop);
    this.getPostsData = this.getPostsData.bind(this);
  }

  componentDidMount () {
    document.title = '归档 | 任祥磊的博客';
    this.getPostsData();
  }

  getPostsData () {
    fetch(`/json/archives`)
      .then(res => res.json())
      .then(data => {
        this.props.update(data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  render () {
    const { archives } = this.props;

    return (
      <div>
        <article>
          <h1 className="title">归档</h1>
          {archives.map(archive => (
            <div>
              <h2 id={`#${archive[0]}`}>{archive[0]}</h2>
              <ul>
                {archive[1].map(data => (
                  <li><Link to={`/blog/${data.name}`}>{data.title}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </article>
      </div>
    );
  }
}
