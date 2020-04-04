let area = new Area({ parentElement: '#revenue-overall' });
let nodeLink = new NodeLink({ parentElement: '#movie-actors' });
let dotplot = new Dotplot({ parentElement: '#movie-era' });

let nodes = [];
let links = [];
let nodeLinkDataByEra = {};

let hoveredNode = null;
let selectedNode = null;
let currentEra = '';

Promise.all([
  d3.csv('data/disney_revenue.csv'),
  d3.csv('data/disney-movies-awards.csv'),
  d3.csv('data/disney-actors-awards.csv')
]).then(files => {
  let revenueRaw = files[0];
  let moviesRaw = files[1];
  let actorsRaw = files[2];

  revenueRaw.forEach(val => {
    val.year = +val.year;
    val.studio = +val.studio;
    val.consumer = +val.consumer;
    val.interactive = +val.interactive;
    val.parks_resorts = +val.parks_resorts;
    val.media = +val.media;
    val.total = +val.total;
  });

  DataProcessor.processMovieData(moviesRaw, nodes);
  DataProcessor.processVoiceActorData(actorsRaw, nodes, links);
  DataProcessor.movieEras.forEach(era => {
    DataProcessor.groupNodeLinkByEra(nodes, links, nodeLinkDataByEra, era);
  });

  area.initVis({data: revenueRaw});
  currentEra = DataProcessor.movieEras[DataProcessor.movieEras.length - 1];

  /**
   * Because the nodeLink graph mutates the data that is passed to it, we have to provide it a deep copy rather than
   * a reference to the data. This allows us to keep the original data intact and update the data of the graph based
   * on the user's interactions
   */
  nodeLink.initVis({dataByEra: JSON.parse(JSON.stringify(nodeLinkDataByEra)), initialEra: currentEra});

  dotplot.initVis(
    moviesRaw, DataProcessor.getMoviesCountForBigGroupLabels(moviesRaw),
    { x: "year", y: "count", size: "box_office", era: "disney_era" },
    { x: "Time", y: "None", size: "Gross Revenue", era: "Disney Era" },
    "#movie-era-tooltip"
  );
  dotplot.render();
});

// -------- INTERACTIVE CHECKS --------
let updateNodeGraphByEraLabel = function(era) {
  currentEra = era;
  selectedNode = null;
  nodeLink.updateEra(
      JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].nodes)),
      JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].links)),
      JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].neighbours)));
};



let nodeSelectionHandler = function(title, era){
  let nodeData, nodeLinks, nodeNeighbors;
  if(selectedNode === null || selectedNode !== title) {
    selectedNode = title;
    currentEra = era;
    let {filteredLinks, movieNodes } = DataProcessor.getMovieNodeLinkData(era, title, nodeLinkDataByEra);
    nodeData = JSON.parse(JSON.stringify(movieNodes));
    nodeLinks = JSON.parse(JSON.stringify(filteredLinks));
    nodeNeighbors = JSON.parse(JSON.stringify(nodeLinkDataByEra[era].neighbours));
  } else {
    selectedNode = null;
    nodeData = JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].nodes));
    nodeLinks = JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].links));
    nodeNeighbors = JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].neighbours))
  }
  nodeLink.updateEra(nodeData, nodeLinks, nodeNeighbors);
} 

let setHoveredNode = function(node, type, era) {
  hoveredNode = node;
  if(type == "actor" && selectedNode === null) {
    nodeLink.showOneHopNodeLink(node);
  } else if ((!era || (!!era && era == currentEra))) {
    dotplot.selectMovie(node);
    nodeLink.showOneHopNodeLink(node);
  } else {
    dotplot.selectMovie(node);
  }
}

let resetHoveredNode = function() {
  hoveredNode = null;
  dotplot.deselectMovie();
  nodeLink.showAllNodeLink();
}

// -------- INTERACTIVE CHECKS --------
let updateNodeLinkGraph = function() {
  let era =$(this).val();
  nodeLink.updateEra(
      JSON.parse(JSON.stringify(nodeLinkDataByEra[era].nodes)),
      JSON.parse(JSON.stringify(nodeLinkDataByEra[era].links)),
      JSON.parse(JSON.stringify(nodeLinkDataByEra[era].neighbours)));
};

let preGoldenBtn = document.getElementById('pre-golden-age-btn');
let goldenBtn = document.getElementById('golden-age-btn');
let wartimeBtn = document.getElementById('wartime-era-btn');
let silverBtn = document.getElementById('silver-age-btn');
let darkAgeBtn = document.getElementById('dark-age-btn');
let renaissanceBtn = document.getElementById('renaissance-btn');
let postRenaissanceBtn = document.getElementById('post-renaissance-btn');
let secondRenaissanceBtn = document.getElementById('second-renaissance-btn');

let eraButtons = [
    preGoldenBtn, goldenBtn, wartimeBtn, silverBtn, darkAgeBtn, renaissanceBtn,
    postRenaissanceBtn, secondRenaissanceBtn
];

eraButtons.forEach(button  => {
  button.addEventListener('click', updateNodeLinkGraph);
  button.style.backgroundColor = DataProcessor.getMovieColor(button.value);
});
