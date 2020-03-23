class NodeLink {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1300,
      containerHeight: _config.containerHeight || 600
    };
    this.config.margin = _config.margin || {
      top: 0,
      bottom: 0,
      right: 0,
      left: 0
    };
    this.config.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.config.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;
    this.svg = d3.select(this.config.parentElement)
        .attr('width', this.config.containerWidth)
        .attr('height', this.config.containerHeight);
  }

  initVis(props) {
    let vis = this;

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

    vis.nodeData = props.nodeData;
    vis.linkData = props.linkData;
    vis.dataByEra = props.dataByEra;

    vis.render();
  }

  update() {
    let vis = this;
  }

  render() {
    let vis = this;

    vis.simulation = d3.forceSimulation(vis.nodeData)
        .force("charge", d3.forceManyBody().strength(-5))
        .force("center", d3.forceCenter(vis.config.width/2, vis.config.height/2))
        .force('link', d3.forceLink().id(d => d.id).strength(0.03));

    vis.links = vis.chart.append('g')
        .selectAll('line')
        .data(vis.linkData)
        .enter().append('line')
        .attr('stroke-width', 1)
        .attr('stroke', '#e5e5e5');

    vis.nodes = vis.chart.append('g')
        .selectAll('circle')
        .data(vis.nodeData, d => d.id)
        .enter().append('circle')
        .attr('r', 3)
        .attr('fill', d => vis.getNodeColor(d));

    vis.simulation.force('link').links(vis.linkData);
    vis.simulation.nodes(vis.nodeData).on('tick', () => {
      vis.nodes
          .attr('cx', node => node.x)
          .attr('cy', node => node.y);

      vis.links
          .attr('x1', link => link.source.x)
          .attr('y1', link => link.source.y)
          .attr('x2', link => link.target.x)
          .attr('y2', link => link.target.y);
    });

  }

  getNodeColor(node) {
    if (node.type === "movie") {
      return 'red';
    } else {
      return '#fcba03';
    }
  }

}
