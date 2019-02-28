import {Component, html} from '/lib/htm-preact.mjs';

import {CodeViz} from '/mjs/codeviz.mjs'
export default class App extends Component {
    constructor() {
      super();
      this.state.data = {};
      this.state.analysis = "age";
    }

    loadData() {
      d3.json("./data/mine.json", (error, d) => {
        this.setState({data: d});
      });
    }

    componentDidMount() {
        this.loadData();
    }

    analysisByAge() {
      this.setState({analysis: "age"});
    }

    analysisByChanges() {
      this.setState({analysis: "changes"});
    }

    render(props, state){
      return html`
      <div>
        <${CodeViz} data=${this.state.data} analysis=${this.state.analysis}><//>
        <button onclick=${() => this.analysisByAge()}>Analysis by Age</button>
        <button onclick=${() => this.analysisByChanges()}>Analysis by Changes</button>
        <button onclick=${() => this.loadData()}>Load Data</button>
      </div>
      `;
    }
  }
