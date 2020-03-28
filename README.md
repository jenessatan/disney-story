# The Disney Story

### Rationale for design choices

We wanted to do a scrolly-telling version of Disney’s animation studios through the data that they had publicly available.

We started off with an overview of the animation studio as part of the corporate Walt Disney Company. To do this, we showed the contribution of the animation studios to the company revenue over time. We utilized an area chart to show the part-to-whole relationship of the animation studio to the overall company revenue. The revenue is a quantitative value that ranges from USD0-60Billion. We considered using either a clustered bar or stacked bar chart but the years range from 1992 - 2016 (i.e. a period of 24 years) and we felt that there were too many years to opt to use the clustered bar chart. In addition, we felt that area charts were great since it expresses the continuous flow of time so we opted for that rather than the stacked bar chart. The revenue is broken down into 5 categories so we used a categorical color scheme. Our main focus is the animation studio, so we aligned it on the bottom axis so that viewers are still able to easily read the values it contributed on its own using the y-axis.

After showing the financial part of the animation studio, we wanted users to be able to explore the data related to individual movies and the voice actors behind some of the main characters in the movie. We decided to express this through a node-link graph. We shape-coded the nodes where voice actors were represented as stars and the movies used mickey icons. We wanted to use these shapes to bring the Disney theme into our design. Users would be able to explore which movies shared voice actors how many movies a voice actor participated in. Initially, we planned that the default view would show all the movies and voice actor data that we had gathered. However, there were over 700 voice actors for the 80 movies which resulted in a hairball mess in the links. We decided instead to show the data per era beginning with the most recent era. While this makes it difficult to see relationships of voice actors and movies across adjacent eras, we felt it was a good solution that still allowed viewers to discover which movies belonged to which era. Viewers can choose which era they would like to view using navigation buttons at the top of the graph. We will be providing a legend at the bottom but this will be implemented after milestone 2. We will also use color hue to encode the era each disney movie belongs to. This is to be consistent with the dot plot graph below it. We have identified 8 different categorical eras (technically there are 9 from our research but we have no movies for the silent era which dates before 1928 so we have decided to ignore it). We are once again utilizing a categorical color palette. The stroke on the movies and voice actor nodes indicates if it is an Oscar Winner. Hovering over the nodes and links brings up a tooltip that provides more information about the movies and voice actors as well as the relationship between the two. Later, we will be implementing highlighting that changes the luminosity on hover to bring into even more focus the object (node or link) that is currently being viewed.

From going into detail about the movies and their related voice actors, we decide to take a step back and provide another overview of movies. We utilized a dot plot and size-coded the dots to express its gross revenue. As previously mentioned, we use color hue to encode the era each movie belongs to. We decided to use a dot plot because each dot still expresses a single movie and the user will be able to see the number of movies released each year. Typically there’s only about 1-3 movies released per year and our years range from 1928-2016 (approximately 87 years). We chose the dot plot visualization over a bar chart because being able to see the movies individually is important. After the milestone, we want to use the dot-plot graph as an interactive navigation for users to see different movies in the node-link graph by using brush selection. This will remove the limitation of seeing voice actor-movie relationships only for movies within the same era and allow users to explore our dataset better.

### Vision changes since your proposal? 
Our vision for this project has not changed since our proposal. While we had to make adjustments from our original plan (such as only showing the most recent era of the node-link graph) from a useability perspective, these changes do not impact the visualization goals that we set out to achieve. 


### Screenshots
![Revenue Area Chart](/images/screenshots/area.png)
This is the landing screen and visualization where we discuss the Walt Disney Animation Studio in relation to the global corporation.

![Actor Node-Link Chart & Movie Era Dot Plot](/images/screenshots/node-dot.png)
This is the exploratory view where users can view different eras and look at voice actors and movie data.

### Sources of Data:
As per our project proposal, our visualizations use the [Disney dataset provided in Data World](https://data.world/dot2/disney-character-data-set-project/workspace/project-summary?agentid=kgarrett&datasetid=disney-character-success-00-16) and the [Academy Award dataset from Kaggle](https://www.kaggle.com/theacademy/academy-awards). Missing movie and actor data was taken manually from [IMDB](https://www.imdb.com/).

### Data Preprocessing Pipeline
There were slight inconsistencies between the Disney datasets in the Data World workspace. Therefore, most of our data preprocessing involved rectifying those inconsistencies. This includes:

-   Filtering out voice actors/roles that were not in a Disney animated feature film
    
-   Filtering out live action movies that are not relevant to our project
    
-   Adding missing movie box office revenues
    
-   Adding missing voice actors & roles of Disney animated feature films
    
-   Formatting the dates in the movies dataset for consistency and Javascript compatibility
    
-   Filling in IMDB ratings for the movies
    
-   Joining the Academy Award dataset with the movies dataset to obtain the wins for the movies of interest
    
-   Joining the Academy Award dataset with the voice actors dataset to obtain the wins for the voice actors of interest
    

Some preprocessing steps were done manually in Excel, and some were done automatically in Python (joining datasets to get awards for movies and actors). The Python codes were included in our github repo as a zip file.The joining process can be laid out as follows:

1.  Cleaning the movie titles and actor names in movies, actors, and awards datasets
    
2.  In the awards dataset, columns called “Name” and “Film” are relevant. For each of the movies and actors datasets, two left joins from the award to the movies/actors were carried out and then concatenated to produce a single result. Since we were dealing with strings comparison, I used fuzzy matching (package “fuzzywuzzy”) with a threshold of 95% on the matching score.

## Project Management & Team Assessment
### Status Update & Contributions Breakdown
| Milestone | Est Date | Actual Date | Est Hrs | Actual Hrs | Team Member |
|--|--|--|--|--|--|
| Narrative | Mar 10 | Mar 23 | 3 | 4 | J |
|Data Processing|Mar 14|Mar 25|12|12|CJK|
|Glyph Files|Mar 15|Mar 15|3|0.5|K|
|Static Area View|Mar 18|Mar 19| 7 | 7|J|
|Area Interactivity|Mar 28|Mar 28|8|8|J|
|Static Node View|Mar 20|Mar 27|27|24|K|
|Static Dot Plot View|Mar 20|Mar 24|17|13|C|
|Tooltip Creation| Mar 31| Mar 25| 9|9|CK|
|Milestone 2 Writeup| Mar 23|Mar 28| 4|4|CJK|
|Data Filtering by Era|Mar 28|-----|17|-----|C|
|Brush Selection Interactivity|Mar 28| -----|17|-----|J|
|Linkage Between Node & Dot Views|Mar 28|-----|12|-----|K|
|Character Icon Files| Mar 30| -----| 6| -----|J|
|Add Narrative | Mar 31| -----| 3| ----- | J|
|Legend Creation|Mar 31| -----| 4| -----|C|
|Tech Debt & Testing | Apr 3 | ----- | 15 | ----- | CJK|
|Milestone 3 Writeup | Apr 5 | ----- | 8 | ----- | CJK |

C = Bang Chi Duong ; J = Jenessa Tan ; K = Ana Katrina Tan

###  Contributions Breakdown
**Bang Chi** processed the Academy Award data to get the award information for each of the movies and actors of interest, cleaning and joining multiple datasets as described above. He built the dot plot histogram view of the Disney movies broken down by year and Disney era. **Jenessa** cleaned and processed the original Disney DataWorld datasets, filtering out the irrelevant movies and voice actors, filling in missing data & ensuring proper formatting of the dates.  She built the area view of the Disney corporate revenue. **Ana Katrina** processed the original Disney DataWorld datasets as well, ensuring consistency between the voice actor and movie datasets. She built the node-link view of the movies and voice actors. 

Everyone is contributing equally.

### Team Process
Team has a clear vision of the problems: **Excellent**

Team is properly organized to complete task and cooperates well: **Excellent**

Team managed time wisely: **Good**

Team acquired needed knowledge base: **Good**

Efforts communicated well within group: **Excellent**
