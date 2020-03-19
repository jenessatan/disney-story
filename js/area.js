class Area {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 420
    };
    this.config.margin = _config.margin || {
      top: 10,
      bottom: 45,
      right: 10,
      left: 50
    };
  }

  initVis(props) {
    let vis = this;

    let {data} = props;

    vis.data = data;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement);
    vis.chart = vis.svg.append("g")
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);
    
    const xAxisLabel = 'Year';
    const yAxisLabel = 'Annual Gross Revenue (in millions USD)';
    const yValue = d => d.total;
    const xValue = d => d.year;
    vis.categories = ['studio' ,'consumer','interactive','parks_resorts','media'];

    // initialize and set axes
    vis.xScale = d3.scaleLinear()
      .domain(d3.extent(data, xValue))
      .range([0, vis.width]);
    
    vis.yScale = d3.scaleLinear()
      .domain([0, d3.max(data, yValue)])
      .range([vis.height, 0])
      .nice();
    
    vis.colour = d3.scaleOrdinal()
      .domain(vis.categories)
      .range(d3.schemeSet2)
    
      const xAxis = d3.axisBottom(vis.xScale).tickFormat(d3.format("d"));

      const yAxis = d3.axisLeft(vis.yScale);
  
      const yAxisG = vis.chart.append('g').call(yAxis);
      yAxisG.append('text')
        .attr('fill', 'black')
        .attr('class', 'axis-label')
        .attr('y', 10)
        .attr('x', -5)
        .attr('transform', 'rotate(-90)')
        .text(yAxisLabel);
  
      const xAxisG = vis.chart.append('g').call(xAxis).attr("transform", `translate(0,${vis.height})`);
      xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('fill', 'black')
        .attr('x', vis.width)
        .attr('y', 40)
        .text(xAxisLabel);

    d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('opacity', 0);
    
    vis.update();
  }

  update() {
    let vis = this;
    vis.stackedData = d3.stack()
      .keys(vis.categories)(vis.data)

  
    vis.render();
  }

  render() {
    let vis = this;

    // console.log(vis.stackedData);

    let area = d3.area()
      .x((d,i) => vis.xScale(d.data.year))
      .y0(d => vis.yScale(d[0]))
      .y1(d => vis.yScale(d[1]));

    vis.chart.selectAll('.layers')
      .data(vis.stackedData)
      .enter()
      .append('path')
      .attr('class', d => 'layers '+d.key)
      .style('fill', d => vis.colour(d.key))
      .attr('d', area);

    let size = 10;
    vis.chart.selectAll("myrect")
      .data(vis.categories)
      .enter()
      .append("rect")
        .attr("x", 20)
        .attr("y", (d,i) => 10 + i*(size+5)) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", d => vis.colour(d))
        .on("mouseover", vis.highlight)
        .on("mouseleave", vis.noHighlight)

    // Add one dot in the legend for each name.
    vis.chart.selectAll("mylabels")
      .data(vis.categories)
      .enter()
      .append("text")
        .attr("x", 20 + size*1.2)
        .attr("y",(d,i) => 10 + i*(size+5) + (size/2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => vis.colour(d))
        .text(d => vis.label(d))
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", vis.highlight)
        .on("mouseleave", vis.noHighlight)
  }

  highlight(d) {
    d3.selectAll('.layers').style('opacity', 0.1)
    d3.select('.'+d).style('opacity', 1)
  }

  noHighlight(d) {
    d3.selectAll('.layers').style('opacity', 1)
  }

  label(d) {
    switch(d) {
      case 'studio':
        return 'Studio Entertainment';
      case 'consumer':
        return 'Disney Consumer Products';
      case 'interactive':
        return 'Disney Interactive Media';
      case 'parks_resorts':
        return 'Parks & Resorts';
      case 'media':
        return 'Disney Media Networks';
      default:
        return d;
    }
  }
}