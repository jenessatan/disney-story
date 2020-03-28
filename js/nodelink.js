class NodeLink {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1300,
      containerHeight: _config.containerHeight || 450
    };
    this.config.margin = _config.margin || {
      top: 0,
      bottom: 50,
      right: 0,
      left: 0
    };
    this.config.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.config.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;
    this.svg = d3.select(this.config.parentElement)
        .attr('width', this.config.containerWidth)
        .attr('height', this.config.containerHeight);
    this.tooltip = document.getElementById('node-link-tooltip');
    this.tooltipSelection = d3.select('#node-link-tooltip')
        .style('opacity', 0);

    this.dateFormatter = d3.timeFormat('%B %d, %Y');
    this.amountFormatter = d3.format(',.2f');
  }

  initVis(props) {
    let vis = this;

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

    vis.dataByEra = props.dataByEra;
    vis.nodeData = props.dataByEra[props.initialEra].nodes;
    vis.linkData = props.dataByEra[props.initialEra].links;

    vis.nodeScale = d3.scaleSqrt()
        .domain([0, 10])
        .range([0.07, 0.2]);

    vis.hovered = {};

   vis.chart.append('g').attr('class', 'link-group');
   vis.chart.append('g').attr('class', 'node-group');

    vis.render();
  }

  update(era) {
    let vis = this;
    vis.nodeData = vis.dataByEra[era].nodes;
    vis.linkData = vis.dataByEra[era].links;

    vis.render();
  }

  render() {
    let vis = this;

    vis.simulation = d3.forceSimulation(vis.nodeData)
        .force('charge', d3.forceManyBody().strength(-1))
        .force('center', d3.forceCenter(vis.config.width/2, vis.config.height/2))
        .force('collide', d3.forceCollide().radius((d) => vis.getNodeRadius(d)).iterations(2))
        .force('x', d3.forceX(vis.config.width/2).strength(0.015))
        .force('y', d3.forceY(vis.config.height/2).strength(0.03))
        .force('link', d3.forceLink().id(d => d.id))
        .on('tick', () => {
          vis.nodeEnter
              .attr('x', node => vis.getNodeXPosition(node))
              .attr('y', node => vis.getNodeYPosition(node))
              .attr('transform', node => vis.adjustNodePosition(node));

          vis.linkEnter
              .attr('x1', link => link.source.x)
              .attr('y1', link => link.source.y)
              .attr('x2', link => link.target.x)
              .attr('y2', link => link.target.y);
        });

    vis.links = vis.chart.select('.link-group').selectAll('.link')
        .data(vis.linkData, d => d.source.id + " - " + d.target.id);

    vis.links.exit()
        .transition()
        .attr('stroke-opacity', 0)
        .remove();

    vis.linkEnter = vis.links.enter().append('line')
        .attr('class', 'link')
        .attr('stroke-width', 3)
        .attr('stroke', '#e5e5e5')
        .on('mouseover.tooltip', d => vis.updateLinkTooltip(d))
        .on('mouseout.tooltip', () => vis.updateLinkTooltip(null))
        .merge(vis.links);

    vis.nodes = vis.chart.select('.node-group').selectAll('path')
        .data(vis.nodeData, d => d.id);

    vis.nodes.exit().remove();
    vis.nodeEnter = vis.nodes.enter().append('path')
        .attr('d', d => vis.getPath(d.type))
        .attr('fill', d => vis.getNodeColor(d))
        .attr('stroke-width', d => vis.getNodeStrokeWidth(d.award))
        .attr('stroke', 'black')
        .on('mouseover.tooltip', d => vis.updateNodeTooltip(d))
        .on('mouseout.tooltip', () => vis.updateNodeTooltip(null))
        .merge(vis.nodes);

    vis.simulation.force('link').links(vis.linkData);
    vis.simulation.nodes(vis.nodeData);
    vis.simulation.alpha(1).restart();
  }

  updateLinkTooltip(data) {
    let vis = this;
    if (data) {
      vis.tooltip.className = "role-tooltip";

      let newData = document.createElement('div');
      newData.className = "tooltip-data";

      let roleData = document.createElement('div');
      roleData.className = "role-data";

      let actorNameElem = document.createElement('h4');
      let actorName = document.createTextNode(data.source.id);
      actorNameElem.appendChild(actorName);

      let asElem = document.createElement('p');
      let as = document.createTextNode('as');
      asElem.appendChild(as);

      let characterNameElem = document.createElement('h4');
      let charName = document.createTextNode(data.role);
      characterNameElem.appendChild(charName);

      let inElem = document.createElement('p');
      let inTxt = document.createTextNode('in');
      inElem.appendChild(inTxt);

      let movieNameElem = document.createElement('h4');
      let movieName = document.createTextNode(data.target.id);
      movieNameElem.appendChild(movieName);

      roleData.appendChild(actorNameElem);
      roleData.appendChild(asElem);
      roleData.appendChild(characterNameElem);
      roleData.appendChild(inElem);
      roleData.appendChild(movieNameElem);
      newData.appendChild(roleData);

      if (vis.tooltip.children.length !== 0) {
        // we want to delete the old data inside the tooltip
        vis.tooltip.replaceChild(newData, vis.tooltip.childNodes[0]);
      } else {
        vis.tooltip.appendChild(newData);
      }
      vis.tooltipSelection
          .style('top', () => `${d3.event.pageY}px`)
          .style('left', () => `${d3.event.pageX + 20}px`)
          .style('opacity', '1');
    } else {
      vis.tooltipSelection
          .style('opacity', '0');
    }
  }

  getNodeColor(node) {
    if (node.type === "movie") {
      return DataProcessor.getMovieColor(node.era);
    } else {
      return '#fcba03';
    }
  }

  getPath(type) {
    if (type === "movie") {
      // mickey path
      return "M88 41.5C88 42.9981 87.9158 44.4777 87.7517 45.9347C93.998 44.0266 100.629 43 107.5 43C114.371 43 121.002 44.0266 127.248 45.9347C127.084 44.4777 127 42.9981 127 41.5C127 18.5802 146.699 0 171 0C195.301 0 215 18.5802 215 41.5C215 64.4198 195.301 83 171 83C170.379 83 169.761 82.9879 169.146 82.9638C172.908 91.3728 175 100.692 175 110.5C175 147.779 144.779 178 107.5 178C70.2208 178 40 147.779 40 110.5C40 100.692 42.0918 91.3728 45.8536 82.9638C45.2389 82.9879 44.621 83 44 83C19.6995 83 0 64.4198 0 41.5C0 18.5802 19.6995 0 44 0C68.3005 0 88 18.5802 88 41.5Z"
    } else {
      // star path
      return "M83.2937 7.56232C85.0898 2.03445 92.9102 2.03444 94.7063 7.5623L111.227 58.4073C112.03 60.8794 114.334 62.5532 116.933 62.5532H170.395C176.207 62.5532 178.624 69.9909 173.922 73.4073L130.67 104.831C128.567 106.359 127.687 109.067 128.491 111.539L145.011 162.384C146.807 167.912 140.48 172.509 135.778 169.093L92.5267 137.669C90.4238 136.141 87.5762 136.141 85.4733 137.669L42.222 169.093C37.5197 172.509 31.1928 167.912 32.9889 162.384L49.5094 111.539C50.3127 109.067 49.4327 106.359 47.3298 104.831L4.07847 73.4073C-0.623809 69.9909 1.79283 62.5532 7.60517 62.5532H61.0668C63.6661 62.5532 65.9699 60.8795 66.7731 58.4073L83.2937 7.56232Z"
    }
  }

  getNodeStrokeWidth(award) {
    return (award === "") ? 0 : 10;
  }

  getNodeXPosition(node) {
    let vis = this;
    let nodeRadius;
    if (node.type === 'actor') {
      nodeRadius = 5;
    } else {
      nodeRadius = vis.getNodeRadius(node)/2;
    }
    return Math.max(nodeRadius * 4, Math.min((vis.config.width - (nodeRadius * 4)), node.x));
  }

  getNodeYPosition(node) {
    let vis = this;
    let nodeRadius;
    if (node.type === 'actor') {
      nodeRadius = 5;
    } else {
      nodeRadius = vis.getNodeRadius(node)/2;
    }
    return Math.max(nodeRadius * 4, Math.min((vis.config.height - (nodeRadius * 4)), node.y));
  }

  adjustNodePosition(node) {
    let vis = this;
    let nodeRadius = vis.getNodeRadius(node)/2;
    let scale = node.type === 'actor'? 0.07 : vis.nodeScale(node.rating);
    return `translate(${node.x-nodeRadius}, ${node.y-nodeRadius}), scale(${scale})`;
  }

  getNodeRadius(node) {
    let vis = this;
    if (node.type === 'movie') {
      let scale = vis.nodeScale(node.rating);
      return 215 * scale;
    } else {
      return 10;
    }
  }

  updateNodeTooltip(data) {
    let vis = this;
    if (data) {
      let newData = document.createElement('div');
      if (data.type === "movie") {
        vis.tooltip.className = "movie-tooltip";
        vis.formatMovieData(data, newData);
      } else {
        vis.tooltip.className = "actor-tooltip";
        vis.formatActorData(data, newData)
      }

      newData.className = "tooltip-data";
      if (vis.tooltip.children.length !== 0) {
        // we want to delete the old data inside the tooltip
        vis.tooltip.replaceChild(newData, vis.tooltip.childNodes[0]);
      } else {
        vis.tooltip.appendChild(newData);
      }
      vis.tooltipSelection
          .style('top', () => `${d3.event.pageY}px`)
          .style('left', () => `${d3.event.pageX + 20}px`)
          .style('opacity', '1');
    } else {
      vis.tooltipSelection
          .style('opacity', '0');
    }
  }

  formatMovieData(data, div) {
    let vis = this;
    let movieContainer = div;
    movieContainer.className = "movie-data";

    // Movie Title
    let titleElem = document.createElement('h4');
    titleElem.className = "movie-title";
    let title = document.createTextNode(data.id);
    titleElem.appendChild(title);

    // Rating
    let ratingElem = document.createElement('p');
    let rating = document.createTextNode("Rating: " + data.rating);
    ratingElem.appendChild(rating);

    // Release Date
    let releaseElem = document.createElement('p');
    let release = document.createTextNode("Release Date: " + vis.dateFormatter(data.release_date));
    releaseElem.appendChild(release);

    // Directors
    let directorElem = document.createElement('p');
    let directors = document.createTextNode("Director(s): " + data.director);
    directorElem.appendChild(directors);

    // Box-Office
    let boxOfficeElem = document.createElement('p');
    let boxOffice = document.createTextNode("Box Office: USD " + vis.amountFormatter(data.box_office));
    boxOfficeElem.appendChild(boxOffice);

    movieContainer.appendChild(titleElem);
    movieContainer.appendChild(ratingElem);
    movieContainer.appendChild(releaseElem);
    movieContainer.appendChild(directorElem);
    movieContainer.appendChild(boxOfficeElem);

    // Awards
    if (data.award !== "") {
      let awardsElem = document.createElement('p');
      let awards = document.createTextNode('Awards: ' + data.award);
      awardsElem.appendChild(awards);
      movieContainer.appendChild(awardsElem);
    }

  }

  formatActorData(data, div) {
    let actorContainer = div;
    actorContainer.className = "actor-data";

    // Actor Name
    let actorElem = document.createElement('h4');
    let actor = document.createTextNode(data.id);
    actorElem.appendChild(actor);

    actorContainer.appendChild(actorElem);

    // Awards
    if (data.award !== "") {
      let awardsElem = document.createElement('p');
      let award = document.createTextNode('Awards: ' + data.award);
      awardsElem.appendChild(award);
      actorContainer.appendChild(awardsElem);
    }
  }

}
