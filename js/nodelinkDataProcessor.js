class NodeLinkDataProcessor {
    constructor () {}

    processMovieData(moviesRaw, nodes) {
        moviesRaw.forEach(movie => {
            let releaseDate = new Date(movie["release_date"]);
            let disneyEra = this.getDisneyEra(releaseDate.getFullYear());
            let movieObj = {
                type: "movie",
                id: movie["movie_title"],
                release_date: releaseDate,
                rating: +movie["rating"],
                box_office: +movie["box_office"],
                era: disneyEra
            };
            nodes.push(movieObj);
        });
    }

    getDisneyEra(year) {
        if (year >= 1923 && year <=1928 ) {
            return 'Silent Era';
        } else if (year >= 1937 && year <= 1942) {
            return 'Golden Age';
        } else if (year >= 1943 && year <= 1949) {
            return 'Wartime Era';
        } else if (year >= 1950 && year <= 1969) {
            return 'Silver Age';
        } else if (year >= 1970 && year <= 1988) {
            return 'Dark Age';
        } else if (year >= 1989 && year <= 1999) {
            return 'Disney Renaissance';
        } else if (year >= 2000 && year <= 2009) {
            return 'Post-Renaissance';
        } else if (year >= 2010 && year <= 2019) {
            return 'Second Disney Renaissance';
        }
    }

    processVoiceActorData(actorsRaw, nodes, links) {
        actorsRaw.forEach(vActor => {

            let vActorNode = {
                type: "actor",
                id: vActor['voice-actor']
            };
            nodes.push(vActorNode);

            let link = {
                source: vActor['voice-actor'],
                target: vActor['movie'],
                role: vActor['character']
            };
            links.push(link);

        });
    }
}
