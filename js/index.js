let area = new Area({ parentElement: '#revenue-overall' });
let nodeLink = new NodeLink({ parentElement: '#movie-actors' });
let dotplot = new Dotplot({ parentElement: '#movie-era' });

let nodes = [];
let links = [];
let nodeLinkDataByEra = {};
let blurbs = {};

let hoveredNode = null;
let selectedNode = null;
let currentEra = '';

Promise.all([
  d3.csv('data/disney_revenue.csv'),
  d3.csv('data/disney-movies-awards.csv'),
  // d3.csv('data/disney-actors-awards.csv')
  d3.csv('data/disney-voice-actors-2.csv'),
  d3.json('data/era-blurbs.json')
]).then(files => {
  let revenueRaw = files[0];
  let moviesRaw = files[1];
  let actorsRaw = files[2];
  blurbs = files[3];

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
  currentEra = DataProcessor.movieEras[0];/* DataProcessor.movieEras[DataProcessor.movieEras.length - 1]; */

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
  updateEraBlurb();
  updateEraBlurbButton();
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
  currentEra =$(this).val();
  nodeLink.updateEra(
      JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].nodes)),
      JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].links)),
      JSON.parse(JSON.stringify(nodeLinkDataByEra[currentEra].neighbours)));
  updateEraBlurb();
  updateEraBlurbButton();
};

let preGoldenBtn = document.getElementById('pre-golden-age-btn');
let goldenBtn = document.getElementById('golden-age-btn');
let wartimeBtn = document.getElementById('wartime-era-btn');
let silverBtn = document.getElementById('silver-age-btn');
let darkAgeBtn = document.getElementById('dark-age-btn');
let renaissanceBtn = document.getElementById('renaissance-btn');
let postRenaissanceBtn = document.getElementById('post-renaissance-btn');
let secondRenaissanceBtn = document.getElementById('second-renaissance-btn');
let previousBtn = document.getElementById('previous-era');
let nextBtn = document.getElementById('next-era');


let eraButtons = [
    preGoldenBtn, goldenBtn, wartimeBtn, silverBtn, darkAgeBtn, renaissanceBtn,
    postRenaissanceBtn, secondRenaissanceBtn
];

eraButtons.forEach(button  => {
  button.addEventListener('click', updateNodeLinkGraph);
  button.style.backgroundColor = DataProcessor.getMovieColor(button.value);
});

let updateEraBlurb = function() {
  let mainContainer = document.getElementById('disney-era-blurb');

  let blurbDetailsContainer = document.createElement('div');
  blurbDetailsContainer.className = 'blurb-details';

  let headerElem = document.createElement('h1');
  let header = document.createTextNode(currentEra);
  headerElem.style.color = DataProcessor.getMovieColor(currentEra);
  headerElem.appendChild(header);

  let yearElem = document.createElement('h3');
  let year = document.createTextNode(blurbs[currentEra].years);
  yearElem.appendChild(year);

  let blurbElem = document.createElement('p');
  let blurb = document.createTextNode(blurbs[currentEra].description);
  blurbElem.appendChild(blurb);

  blurbDetailsContainer.appendChild(headerElem);
  blurbDetailsContainer.appendChild(yearElem);
  blurbDetailsContainer.appendChild(blurbElem);

  mainContainer.replaceChild(blurbDetailsContainer, mainContainer.children[0]);
};

let updateEraBlurbButton = function() {
  let indexOfCurrent = DataProcessor.movieEras.indexOf(currentEra);

  if(indexOfCurrent == 0) {
    previousBtn.style.visibility = 'hidden';
    nextBtn.style.backgroundColor = DataProcessor.movieColourEras[indexOfCurrent + 1];
  } else if(indexOfCurrent == DataProcessor.movieEras.length - 1) {
    nextBtn.style.visibility = 'hidden';
    previousBtn.style.backgroundColor = DataProcessor.movieColourEras[indexOfCurrent - 1];
  } else {
    previousBtn.style.visibility = 'visible';
    nextBtn.style.visibility = 'visible';
    previousBtn.style.backgroundColor = DataProcessor.movieColourEras[indexOfCurrent - 1];
    nextBtn.style.backgroundColor = DataProcessor.movieColourEras[indexOfCurrent + 1];
  }
};

let changeToNextEra = function(){
  let indexOfCurrent = DataProcessor.movieEras.indexOf(currentEra);
  currentEra = DataProcessor.movieEras[indexOfCurrent + 1];
  updateNodeGraphByEraLabel(currentEra);
}

let changeToPreviousEra = function(){
  let indexOfCurrent = DataProcessor.movieEras.indexOf(currentEra);
  currentEra = DataProcessor.movieEras[indexOfCurrent - 1];
  updateNodeGraphByEraLabel(currentEra);
}

previousBtn.addEventListener('click', changeToPreviousEra);
nextBtn.addEventListener('click', changeToNextEra);