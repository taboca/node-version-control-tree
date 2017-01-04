var HistoryBox = React.createClass({
  loadTreeJSON: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({history: data.commits, head: data.head});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {history: [], head: null};
  },
  componentDidMount: function() {
    this.loadTreeJSON();
    setInterval(this.loadTreeJSON, this.props.pollInterval);
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
              <a href={`/api/commit/${this.props.node}`}><span dangerouslySetInnerHTML={this.rawMarkup()} /></a>
            </h2>
        );

      } else {
        return (
            <h2 className="historyItem">
              <span dangerouslySetInnerHTML={this.rawMarkup()} />
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
  loadTreeJSON: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data.root.tree, rootMainSignature: data.root.sha1});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadTreeJSON();
    setInterval(this.loadTreeJSON, this.props.pollInterval);
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


ReactDOM.render(
  <HistoryBox url="/api/history" pollInterval={2000} />,
  document.getElementById('content-history')
);

ReactDOM.render(
  <DirectoryBox url="/api/tree" pollInterval={2000} />,
  document.getElementById('content')

);
