let area = new Area({ parentElement: '#revenue-overall' });
let nodeLink = new NodeLink({ parentElement: '#movie-actors' });
let histogram = new Histogram({ parentElement: '#movie-era' });

let nodes = [];
let links = [];
let nodeLinkDataByEra = {};

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
  let startingEra = DataProcessor.movieEras[DataProcessor.movieEras.length - 1];
  nodeLink.initVis({dataByEra: nodeLinkDataByEra, initialEra: startingEra});

  histogram.initVis(
    moviesRaw, DataProcessor.getMoviesCountForBigGroupLabels(moviesRaw),
    { x: "year", y: "count", size: "box_office", era: "disney_era" },
    { x: "Time", y: "None", size: "Gross Revenue", era: "Disney Era" },
    "#movie-era-tooltip"
  );
  histogram.render();
});

// -------- INTERACTIVE CHECKS --------
let updateNodeLinkGraph = function() {
  console.log('button click');
  let era =$(this).val();
  console.log(era);
  nodeLink.update(era);
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

eraButtons.forEach(button => button.addEventListener('click', updateNodeLinkGraph));
