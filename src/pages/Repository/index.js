import React, { Component } from 'react';
import { FcPrevious, FcNext } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { Loading, Owner, IssueList, Filter, Pagination } from './styles';
import { Container } from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filter, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { filter, page } = this.state;

    if (prevState.filter !== filter || prevState.page !== page) {
      const { match } = this.props;
      const repoName = decodeURIComponent(match.params.repository);
      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page,
        },
      });

      this.setState({
        issues: issues.data,
        loading: false,
      });
    }
  }

  handlePrevious = () => {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  };

  handleNext = () => {
    const { page } = this.state;
    this.setState({ page: page + 1 });
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositorios</Link>
          <img
            src={repository.owner && repository.owner.avatar_url}
            alt="owner"
          />
          <h1>{repository.name}</h1>
          <h1>{repository.description}</h1>
        </Owner>

        <Filter>
          <select
            onChange={(event) => this.setState({ filter: event.target.value })}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
        </Filter>

        <IssueList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <Pagination>
          <button
            type="button"
            onClick={this.handlePrevious}
            style={
              page === 1 ? { pointerEvents: 'none', opacity: '0.8' } : null
            }
          >
            <FcPrevious />
          </button>
          <button type="button" onClick={this.handleNext}>
            <FcNext />
          </button>
        </Pagination>
      </Container>
    );
  }
}
