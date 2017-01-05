var { Router, Route, IndexRoute, hashHistory, IndexLink, Link } = ReactRouter

var HistoryBox = React.createClass({
  url          : '/api/history',
  pollInterval : 2000,
  loadTreeJSON: function() {
    $.ajax({
      url: this.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({history: data.commits, head: data.head});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {history: [], head: null};
  },
  componentDidMount: function() {
    this.loadTreeJSON();
    setInterval(this.loadTreeJSON, this.pollInterval);
  },
  render: function() {
    return (
      <div className="HistoryBox">
        <h2>Atual: {this.state.head}</h2>
        <HistoryItems data={this.state.history} head={this.state.head}/>
      </div>
    );
  }
});

var HistoryItems = React.createClass({
  render: function() {
    var headItem = this.props.head;

    this.props.data.reverse();

    var nodes = this.props.data.map(function(nodeItem) {

      if(nodeItem!=null) {
          return (
            <HistoryItem head={headItem} node={nodeItem}>
              {nodeItem}
            </HistoryItem>
          );
      }
    });
    return (
      <div className="HistoryItems">
        {nodes}
      </div>
    );
  }
});

var HistoryItem = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },
  render: function() {
      if (this.props.head == this.props.node ) {
        var nodeValue = this.props.node;
        return (
            <h2 className="historyItemHightlight" >
              <Link to={`/viewcommit/${this.props.node}`}><span dangerouslySetInnerHTML={this.rawMarkup()} /></Link>
            </h2>
        );
      } else {
        return (
            <h2 className="historyItem">
             <Link to={`/viewcommit/${this.props.node}`}><span dangerouslySetInnerHTML={this.rawMarkup()} /></Link>
            </h2>
        );
      }
  }
});


/**

 */

var Directory = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function() {
    if(this.props.tree) {
      return (
        <div className="directoryFolder">
          <h2 className="directoryName">
            <span dangerouslySetInnerHTML={this.rawMarkup()} />
            <span>{this.props.signature}</span>
          </h2>
          <DirectoryItem data={this.props.tree} />
        </div>
      );
    } else {
      return (
        <div className="directoryFolder">
          <h2 className="directoryName">
            <span dangerouslySetInnerHTML={this.rawMarkup()} />
            <span>{this.props.signature}</span>
          </h2>
        </div>
      );
    }
  }
});

var DirectoryBox = React.createClass({
  url          : '/api/tree',
  pollInterval : 2000,
  loadTreeJSON: function() {

    if(this.props.params.commitId) {
      this.url = '/api/commit/'+this.props.params.commitId;
    }

    $.ajax({
      url: this.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data.root.tree, rootMainSignature: data.root.sha1});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadTreeJSON();
    setInterval(this.loadTreeJSON, this.pollInterval);
  },
  render: function() {
    return (
      <div className="DirectoryBox">
        <DirectoryItem data={this.state.data} signature={this.state.rootMainSignature}/>
      </div>
    );
  }
});

var DirectoryItem = React.createClass({
  render: function() {
    var directoryNodes = this.props.data.map(function(nodeItem) {
      return (
        <Directory tree={nodeItem.tree} signature={nodeItem.sha1}>
          {nodeItem.shortpath}
        </Directory>
      );
    });
    return (
      <div className="DirectoryItem">
        {this.props.signature}
        {directoryNodes}
      </div>
    );
  }
});


ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={HistoryBox}>
    </Route>
  </Router>
), document.getElementById('content-history'));

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={DirectoryBox}>
      <Route path="viewcommit/:commitId" component={DirectoryBox}>
      </Route>
    </Route>
  </Router>
), document.getElementById('content'));
