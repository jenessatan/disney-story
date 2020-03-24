class DataProcessor {
    constructor () {
        this.movieEras = ['Pre-Golden Age', 'Golden Age', 'Wartime Era', 'Silver Age', 'Dark Age',
            'Disney Renaissance', 'Post-Renaissance', 'Second Disney Renaissance'];
    }

    processMovieData(moviesRaw, nodes) {
        moviesRaw.forEach(movie => {
            let releaseDate = new Date(movie["release_date"]);
            let disneyEra = this.getDisneyEra(releaseDate.getFullYear());
            let movieObj = {
                type: "movie",
                id: movie["movie_title"],
                director: movie["director"],
                release_date: releaseDate,
                rating: +movie["rating"],
                box_office: +movie["box_office"],
                era: disneyEra
            };
            nodes.push(movieObj);
        });
    }

    getDisneyEra(year) {
        if (year >= 1928 && year <= 1936 ) {
            return this.movieEras[0];
        } else if (year >= 1937 && year <= 1942) {
            return this.movieEras[1];
        } else if (year >= 1943 && year <= 1949) {
            return this.movieEras[2];
        } else if (year >= 1950 && year <= 1969) {
            return this.movieEras[3];
        } else if (year >= 1970 && year <= 1988) {
            return this.movieEras[4];
        } else if (year >= 1989 && year <= 1999) {
            return this.movieEras[5];
        } else if (year >= 2000 && year <= 2009) {
            return this.movieEras[6];
        } else if (year >= 2010 && year <= 2019) {
            return this.movieEras[7];
        }
    }

    processVoiceActorData(actorsRaw, nodes, links) {
        actorsRaw.forEach(vActor => {
            if (nodes.find(node => node.id === vActor['voice-actor']) === undefined) {
                // we only want to create an actor node if none exists
                let vActorNode = {
                    type: "actor",
                    id: vActor['voice-actor']
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

    groupNodeLinkByEra(nodes, links, result, era) {
        let matchingMovieNodes = nodes.filter(node => node.type === "movie" && node.era === era);
        let movies = matchingMovieNodes.map(node => node.id);
        let matchingLinks = links.filter(link => movies.includes(link.target));
        let voiceActors = matchingLinks.map(link => link.source);
        let matchingVoiceActorNodes = nodes.filter(node => node.type === "actor" && voiceActors.includes(node.id));
        result[era] = {
            nodes: matchingMovieNodes.concat(matchingVoiceActorNodes),
            links: matchingLinks
        };
    }

    getMovieColor(era) {
        switch(era) {
            case this.movieEras[0]:
                return "gray";
            case this.movieEras[1]:
                return "red";
            case this.movieEras[2]:
                return "orange";
            case this.movieEras[3]:
                return "yellow";
            case this.movieEras[4]:
                return "green";
            case this.movieEras[5]:
                return "blue";
            case this.movieEras[6]:
                return "indigo";
            case this.movieEras[7]:
                return "violet";
            default:
                return "black";
        }
    }
}
