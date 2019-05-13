import React from 'react';

const VK = window.VK;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: 6978024,
      status: '',
      userId: '',
      user: {},
      friends: [],
    };
  }

  loadData() {
    const { userId } = this.state;
    const params = {
      user_ids: userId,
      v: '5.73',
      fields: 'sex,bdate,photo_200',
    };
    VK.Api.call('users.get', params, r => {
      if (r.response) {
        const { first_name, last_name, photo_200, sex, bdate } = r.response[0];
        this.setState({
          user: {
            firstName: first_name,
            lastName: last_name,
            photo: photo_200,
            sex: sex,
            bdate: bdate,
          },
        });
      } else throw new Error('ERROR');
    });
    const paramsFriends = { ...params, order: 'random', count: 5 };
    VK.Api.call('friends.get', paramsFriends, r => {
      const friends = r.response.items;
      const newFriends = friends.map(({ first_name, last_name, photo_200, sex, bdate, id }) =>
        ({ first_name, last_name, photo_200, sex, bdate, id }));
      this.setState({ friends: newFriends });
    });
  }

  getvkAuthStatus() {
    const { appId } = this.state;
    VK.init({
      apiId: appId,
    });

    VK.Auth.getLoginStatus(response => {
      if (response.status === 'connected') {
        const userId = response.session.mid;
        this.setState({
          userId: userId,
          status: response.status,
        });
        this.loadData();
      } else {
        return;
      }
    });
  }

  vkAuthorization() {
    VK.Auth.login(response => {
      if (response.status === 'connected') {
        const userId = response.session.mid;
        this.setState({
          userId: userId,
          status: response.status,
        });
        this.loadData(); 
      } else {
        return;
      }
    });
  }

  componentDidMount() {
    this.getvkAuthStatus();
  }

  handleLogin = (e) => {
    e.preventDefault();
    this.vkAuthorization();
  }

  handleLogout = (e) => {
    VK.Auth.logout(response => {
      window.location.reload(true);
    });
  }

  renderFriends() {
    const { friends } = this.state;
    return (
      <div>
        <h5 className="title-friends">Вот несколько твоих друзей</h5>
      <div className="row row-friends d-flex justify-content-center">
        {friends.map(({ first_name, last_name, photo_200, sex, id, bdate }) => (
          <div key={id} className="card card-friend">
            <img src={photo_200} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">{first_name} {last_name}</h5>
              <p className="card-text">{bdate && `Дата рождения ${bdate}`}</p>
              <p className="card-text">Пол {sex === 2 ? 'мужской' : 'женский'}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    );
  }

  renderButton() {
    const { status } = this.state;
    if (status === 'connected') {
      return (
      <div className="btn-logout">
        <button onClick={this.handleLogout} type="button" className="btn btn-success">
          Выйти
        </button>
      </div>
      );
    }
    return (
      <div className="btn-login">
        <button onClick={this.handleLogin} type="button" className="btn btn-success">
          Войти через ВК
        </button>
      </div>
    );
  }

  renderUserCard() {
    const { firstName, lastName, photo, sex, bdate } = this.state.user;
    return (
      <div className="card user">
        <div className="row no-gutters">
          <div className="col-4 col-md-5">
            <img src={photo} className="card-img" alt="..." />
          </div>
          <div className="col-8 col-md-7 card-body">
            <h5>Приветствую тебя {firstName} {lastName}!</h5>
            <p className="card-text">{bdate && `Дата рождения ${bdate}`}</p>
            <p className="card-text">Пол {sex === 2 ? 'мужской' : 'женский'}</p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { status } = this.state;
    return (
      <div className="app container-fluid">
        {this.renderButton()}
        { status === 'connected' ? this.renderUserCard() : null}
        {status === 'connected' ? this.renderFriends() : null}
      </div>
    );
  }
}