let area = new Area({parentElement: '#revenue-overall'});
let nodeLink = new NodeLink({parentElement: '#movie-actors'});
let histogram = new Histogram({parentElement: '#movie-era'});

let nodelinkDataProcessor = new NodeLinkDataProcessor();

let nodes = [];
let links = [];

Promise.all([
  d3.csv('data/disney_revenue.csv'),
  d3.csv('data/disney-movies.csv'),
  d3.csv('data/disney-voice-actors.csv')
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

  nodelinkDataProcessor.processMovieData(moviesRaw, nodes);
  nodelinkDataProcessor.processVoiceActorData(actorsRaw, nodes, links);
  console.log(nodes);
  console.log(links);

  area.initVis({data: revenueRaw});
});
