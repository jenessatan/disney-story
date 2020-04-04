class DataProcessor {

    static movieEras = [
        'Pre-Golden Age', 'Golden Age', 'Wartime Era', 'Silver Age', 'Dark Age',
        'Disney Renaissance', 'Post-Renaissance', 'Second Disney Renaissance'
    ];

    static movieColourEras = [
        'gray', 'red', 'orange', '#b59009', 'green',
        'blue', 'indigo', 'violet'
    ];

    static processMovieData(moviesRaw, nodes) {
        let countMap = {};
        moviesRaw.forEach(movie => {
            let releaseDate = new Date(movie["release_date"]);
            movie["release_date"] = releaseDate;

            const year = releaseDate.getFullYear();
            movie["year"] = year;

            countMap[year] = (!Object.keys(countMap).includes(year.toString())) ? 0 : countMap[year] + 1;
            movie["count"] = countMap[year];

            let disneyEra = DataProcessor.getDisneyEra(year);
            movie["disney_era"] = disneyEra;

            movie["rating"] = +movie["rating"];
            movie["box_office"] = +movie["box_office"];

            let movieObj = {
                type: "movie",
                id: movie["movie_title"],
                director: movie["director"],
                release_date: releaseDate,
                rating: +movie["rating"],
                box_office: +movie["box_office"],
                era: disneyEra,
                award: movie["Award"]
            };
            nodes.push(movieObj);
        });
    }

    static getDisneyEra(year) {
        if (year >= 1928 && year <= 1936) {
            return DataProcessor.movieEras[0];
        } else if (year >= 1937 && year <= 1942) {
            return DataProcessor.movieEras[1];
        } else if (year >= 1943 && year <= 1949) {
            return DataProcessor.movieEras[2];
        } else if (year >= 1950 && year <= 1969) {
            return DataProcessor.movieEras[3];
        } else if (year >= 1970 && year <= 1988) {
            return DataProcessor.movieEras[4];
        } else if (year >= 1989 && year <= 1999) {
            return DataProcessor.movieEras[5];
        } else if (year >= 2000 && year <= 2009) {
            return DataProcessor.movieEras[6];
        } else if (year >= 2010 && year <= 2019) {
            return DataProcessor.movieEras[7];
        }
    }

    static processVoiceActorData(actorsRaw, nodes, links) {
        actorsRaw.forEach(vActor => {
            if (nodes.find(node => node.type === 'actor' && node.id === vActor['voice-actor']) === undefined) {
                // we only want to create and add the node to the array if the actor doesn't exist yet
                let vActorNode = {
                    type: "actor",
                    id: vActor['voice-actor'],
                    award: vActor['Award']
                };
                nodes.push(vActorNode);
            }

            let link = {
                source: vActor['voice-actor'],
                target: vActor['movie'],
                role: vActor['character']
            };
            links.push(link);
        });
    }

    static groupNodeLinkByEra(nodes, links, result, era) {
        let matchingMovieNodes = nodes.filter(node => node.type === "movie" && node.era === era);
        let movies = matchingMovieNodes.map(node => node.id);
        let matchingLinks = links.filter(link => movies.includes(link.target));
        let voiceActors = matchingLinks.map(link => link.source);
        let matchingVoiceActorNodes = nodes.filter(node => node.type === "actor" && voiceActors.includes(node.id));
        let neighbours = {};
        matchingLinks.forEach((d) => {
            neighbours[d.source + " , " + d.target] = 1;
            neighbours[d.target + " , " + d.source] = 1;
        })
        result[era] = {
            nodes: matchingMovieNodes.concat(matchingVoiceActorNodes),
            links: matchingLinks,
            neighbours
        };
    }

    /**
     * Returns the nodes and links of a single movie
     * @param era
     * @param title
     * @param nodeLinkDataByEra
     *
     */
    static getMovieNodeLinkData(era, title, nodeLinkDataByEra) {
        let eraNodeData = nodeLinkDataByEra[era].nodes;
        let eraLinkData = nodeLinkDataByEra[era].links;
        let filteredLinks = eraLinkData.filter(link => link.target === title);
        let actors = filteredLinks.map(link => link.source);
        let movieNode = eraNodeData.find(node => node.type === 'movie' && node.id === title);
        let actorNodes = eraNodeData.filter(node => node.type === 'actor' && actors.includes(node.id));
        let movieNodes = actorNodes.concat(movieNode);
        return {filteredLinks, movieNodes};
    }

    static getMovieColor(era) {
        switch (era) {
            case DataProcessor.movieEras[0]:
                return DataProcessor.movieColourEras[0];
            case DataProcessor.movieEras[1]:
                return DataProcessor.movieColourEras[1];
            case DataProcessor.movieEras[2]:
                return DataProcessor.movieColourEras[2];
            case DataProcessor.movieEras[3]:
                return DataProcessor.movieColourEras[3];
            case DataProcessor.movieEras[4]:
                return DataProcessor.movieColourEras[4];
            case DataProcessor.movieEras[5]:
                return DataProcessor.movieColourEras[5];
            case DataProcessor.movieEras[6]:
                return DataProcessor.movieColourEras[6];
            case DataProcessor.movieEras[7]:
                return DataProcessor.movieColourEras[7];
            default:
                return "black";
        }
    }

    static getMoviesCountForBigGroupLabels(moviesRaw) {
        let moviesCount = d3.nest()
            .key(d => d["disney_era"])
            .key(d => d["release_date"].getFullYear())
            .entries(moviesRaw);

        moviesCount = moviesCount.map(d => {
            return {
                disney_era: d.key,
                count: d.values.length
            };
        });

        moviesCount = moviesCount.map((d, i) => {
            const prev = moviesCount[i - 1];
            const cumsum = prev ? d.count + prev.cumsum : d.count;
            d.cumsum = cumsum;
            return d;
        });

        return moviesCount
    }
}
