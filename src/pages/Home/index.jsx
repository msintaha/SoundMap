import React from 'react';
import Service from '../../services/Service';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  componentDidMount() {
    Service.list().then(data => this.setState({ data }));
  }

  render() {
    return (
      <div className="home">
        <h1>SoundMap</h1>
        <h5>A vis tool for exploring multi attribute sound datasets</h5>
      </div>
    );
  }
}

export default Home;
