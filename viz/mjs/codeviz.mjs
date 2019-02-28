import {html,  Component } from '/lib/htm-preact.mjs';

function circle_pack() {
    var _chart = {};
    var _svg,
      _valueAccessor,
      _nodes,
      _bodyG,
      _focus,
      _view,
      _node,
      _root,
      _circle,
      _colorAnalysis,
      _div;
      var _width = 800, _height = 800;
    var diameter;
    var margin = 20;
    var color = d3.scaleLinear()
      .domain([-1, 5])
      .range(["hsl(183, 78%, 92%)", "hsl(183, 78%, 37%)"])
      .interpolate(d3.interpolateHsl);

    var analysis_color = d3.scaleLinear()
      .domain([0, 255])
      .range(["hsl(5, 78%, 100%)", "hsl(5, 78%, 36%)"])
      .interpolate(d3.interpolateHsl);

    _chart.render = function (b) {
      if (_svg) {
          console.log(b);
          console.log("trying to remove");
          d3.select(b).select("svg").remove();
      }
      _svg = d3.select(b).append("svg")
          .attr("height", _height)
          .attr("width", _width);
          diameter = _width;
      _div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
      renderBody(_svg);
    };

    function renderBody(svg) {
      
      _bodyG = svg.append("g")
          .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
      

      var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(10);

      _root = d3.hierarchy(_nodes)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

      _focus = _root;
      _view = null;

      pack(_root);

      var descendants = _root.descendants();

      renderCircles(descendants);
      renderLabels(descendants);
      _node = _bodyG.selectAll("circle,text");
      _svg
      .on("click", function() { zoom(_root); });

      zoomTo([_root.x, _root.y, _root.r * 2 + margin]);
    }
    function getTooltipText(d) {
      return `File name: ${d.data.name}</br>` +
             `# of Lines ${d.data.size} <br/>`  +
             `Age: ${d.data.age}<br/>` +
             `# of Changes: ${d.data.changes}`;
    }
    function renderCircles(nodes) {
      _circle = _bodyG.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
          .style("fill", function(d) { return d.children ? color(d.depth) : analysis_color(_colorAnalysis(d)); })
          .on("click", function(d) { if (_focus !== d) zoom(d), d3.event.stopPropagation(); })
          .on("mouseover", function(d) {
            if (!d.children) {
              _div.transition()
                  .duration(200)
                  .style("opacity", .9);
              _div	.html(getTooltipText(d) )
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
            }
          })
          .on("mouseout", function(d) {
            _div.transition()
                .duration(500)
                .style("opacity", 0);
          });

    }

    function renderLabels(nodes) {
      var text = _bodyG.selectAll("text")
      .data(nodes)
      .enter().append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) { return (d.parent === _root) ? 1 : 0; })
        .style("display", function(d) { return (d.parent === _root)? "inline" : "none"; })
        .text(function(d) { return d.data.name; });
    }

    function zoom(d) {
      var focus0 = _focus; _focus = d;

      var transition = d3.transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .tween("zoom", function(d) {
            var i = d3.interpolateZoom(_view, [_focus.x, _focus.y, _focus.r * 2 + margin]);
            return function(t) { zoomTo(i(t)); };
          });

      transition.selectAll("text")
        .filter(function(d) { return d.parent === _focus || this.style.display === "inline"; })
          .style("fill-opacity", function(d) { return d.parent === _focus ? 1 : 0; })
          .on("start", function(d) { if (d.parent === _focus) this.style.display = "inline"; })
          .on("end", function(d) { if (d.parent !== _focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
      var k = diameter / v[2]; _view = v;
      _node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
      _circle.attr("r", function(d) { return d.r * k; });
    }


    _chart.nodes = function (n) {
      if (!arguments.length) return _nodes;
      _nodes = n;
      return _chart;
    };

    function colorAnalysisByAge(d) {
      return d.data.age_color;
    }

    function colorAnalysisByChanges(d) {
      return d.data.changes_color;
    }

    _colorAnalysis = colorAnalysisByAge;

    _chart.setColorAnalysisByAge = function () {
      _colorAnalysis = colorAnalysisByAge;
      return _chart;
    };

    _chart.setColorAnalysisByAChanges = function () {
      _colorAnalysis = colorAnalysisByChanges;
      return _chart;
    };

    return _chart;
  }

var chart = circle_pack();


class CodeViz extends Component {
    render(props, state) {
        // props === this.props
        // state === this.state
        if (props.analysis === "age") {
            chart.setColorAnalysisByAge();
        } else {
            chart.setColorAnalysisByAChanges();
        }
        console.log(props.analysis);
        return html`<div ref=${d => chart.nodes(props.data).render(d)}></div>`;
        //return html`<div>${props.data}</div>`;
    }
}

export {CodeViz};