class Histogram {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1500,
            containerHeight: _config.containerHeight || 250,
        };
        this.config.margin = _config.margin || { top: 0, right: 50, bottom: 100, left: 50 };
    }

    initVis(movies, moviesCount, columns, labels, tooltipDivId) {
        this.setWidthHeight();
        this.movies = movies;
        this.moviesCount = moviesCount;
        this.columns = columns;
        this.labels = labels;
        this.tooltip_div_id = tooltipDivId;
        this.setColours();
        // this.setDataByYear(year);
        this.setValues();
        this.setScales();
        this.setAxes();
        this.setTooltip();
        this.svg = d3.select(this.config.parentElement)
            .style("height", `${this.config.containerHeight}px`)
            .style("width", `${this.config.containerWidth}px`);
        this.chart = this.svg.append("g").attr("transform", `translate(${this.config.margin.left},${this.config.margin.top})`);
    }

    setColours() {
        this.colour_normal = "#000000";
        this.colour_hover = "#f2bf33";
        this.colour_select = "#dea814";
    }

    // setDataByYear(year) {
    //  
    //     this.year = year;
    //     this.movies = this.movies.filter(row => (row[`${this.columns["x"]}`].getFullYear() >= year) && row[`${this.columns["x"]}`].getFullYear() < year+10);
    // }

    setWidthHeight() {
        this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
        this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;
    }

    setValues() {
        // Methods to set values 
        this.value_x = d => d[`${this.columns.x}`];
        this.value_y = d => d[`${this.columns.y}`];
        this.value_size = d => d[`${this.columns.size}`];
        this.value_colour_era = d => d[`${this.columns.era}`];
    }

    setScales() {
        this.setScaleX();
        this.setScaleY();
        this.setScaleSize();
        this.setScaleColourEra();
    }

    setScaleX() {
        const domain_x = this.movies.map(this.value_x);
        const range_x = [0, this.width];
        this.scale_x = this.getScaleBand(domain_x, range_x, 0, 1);
    }

    setScaleY() {
        const domain_y = this.movies.map(this.value_y);
        const range_y = [this.height, 0];
        this.scale_y = this.getScaleBand(domain_y, range_y, 1, 1);
    }

    setScaleSize() {
        const domain_size = d3.extent(this.movies, this.value_size);
        const range_size = [1, 14];
        this.scale_size = this.getScaleSqrt(domain_size, range_size);
    }

    setScaleColourEra() {
        const domain_colour = DataProcessor.movieEras;
        const range_colour = DataProcessor.movieColourEras;
        this.scale_colour_era = this.getScaleOrdinal(domain_colour, range_colour);
    }

    // getScaleLinear(domain, range) {
    //     return d3.scaleLinear()
    //         .domain(domain)
    //         .range(range)
    //         .nice();
    // }

    getScaleSqrt(domain, range) {
        return d3.scaleSqrt()
            .domain(domain)
            .range(range);
    }

    getScaleBand(domain, range, paddingInner=0, paddingOuter=0) {
        return d3.scaleBand()
            .domain(domain)
            .range(range)
            .paddingInner(paddingInner)
            .paddingOuter(paddingOuter);
    }

    getScaleOrdinal(domain, range) {
        return d3.scaleOrdinal()
            .domain(domain)
            .range(range);
    }

    // getScaleTime(domain, range) {
    //     return d3.scaleTime()
    //         .domain(domain)
    //         .range(range);
    // }

    setAxes() {
        this.setAxisX();
        this.setAxisY();
    }

    setAxisX() {
        this.axis_x = this.getAxisBottom(this.scale_x);
    }
    
    setAxisY() {
        this.axis_y = this.getAxisLeft(this.scale_y);
    }

    getAxisBottom(scale) {
        return d3.axisBottom(scale)
            .tickSizeOuter(0)
            // .tickSize(-this.height)
    }

    getAxisLeft(scale) {
        return d3.axisLeft(scale)
            .tickPadding(2)
            .tickSize(-this.width)
            .tickSizeOuter(0);
    }

    renderData() {
        this.renderCircles("movie");
    }

    update(year) {
        this.setDataByYear(year);
        this.setScaleX();
        this.setAxisX();
        this.updateAxisX(this.axis_x);
        this.renderData();
    }

    updateAxisX(x_axis) {
        this.axis_x_g.call(x_axis);
        this.tiltTickAxisX();
    }

    render() {
        // this.renderAxisY(this.axis_y);
        this.renderAxisX(this.axis_x);
        this.renderAxisEra(90);
        this.tiltTickAxisX(-45, "-0.8em", "-0.15em");
        this.renderData();
        // this.renderLegends();
    }

    // renderMarks(className, x_offset, y_offset) {
    //  
    //     const marks = this.chart.selectAll(`.${className}`).data(this.movies, d => d["date"]);
    //     marks
    //         .enter().append("image") // Should be constant and not changed when updating
    //         .attr("class", className)
    //         .attr("width", "2.7em")
    //         .attr("transform", `translate(${x_offset}, ${y_offset})`)
    //         .attr("y", d => this.scale_y(this.value_y(d))) // init position
    //         .attr("x", d => this.scale_x(this.value_x(d))) // init position
    //         .merge(marks) // Enter + Update
    //         .attr("href", d => this.scale_size(this.value_rocket(d)))
    //         .on("mouseover", d => this.showTooltip(d))
    //         .on("mouseout", () => this.hideTooltip())
    //         .attr("y", d => this.scale_y(this.value_y(d)))
    //         .attr("x", d => this.scale_x(this.value_x(d)));
    //     marks.exit().remove();
    // }

    renderCircles(className) {
        const circles = this.chart.selectAll(`.${className}`).data(this.movies);
        circles
            .enter().append("circle")
                .attr("class", className)
                .attr("opacity", 0.7)
                .attr("r", d => this.scale_size(this.value_size(d)))
                .attr("cx", d => this.scale_x(this.value_x(d)))
                .attr("cy", d => this.scale_y(this.value_y(d)))
            .merge(circles)
                .attr("fill", d => this.scale_colour_era(this.value_colour_era(d)))
                .on("mouseover", d => {
                    setHoveredNode(d.movie_title, "movie", d.disney_era);
                    this.showTooltip(d)
                })
                .on("mouseout", () => {
                    resetHoveredNode();
                    this.hideTooltip()
                })
                // .on("click", d => {
                //     nodeSelectionHandler(d.movie_title)})
            .transition().duration(1000)
                .attr("r", d => this.scale_size(this.value_size(d)))
                .attr("cy", d => this.scale_y(this.value_y(d)))
                .attr("cx", d => this.scale_x(this.value_x(d)));
        circles.exit().remove();
    }

    tiltTickAxisX(rotation=-45, dx="-0.8em", dy="-0.15em") {
        this.axis_x_g.selectAll("text:not(.x-axis-label)")
            .attr("fill", d => this.scale_colour_era(DataProcessor.getDisneyEra(d)))
            .style("font-size", 11)
            .style("text-anchor", "end")
            .attr("dx", `${dx}`)
            .attr("dy", `${dy}`)
            .attr("transform", `rotate(${rotation})`);
    }

    renderAxisX(x_axis) {
        this.axis_x_g = this.chart.append("g").call(x_axis)
            .attr("transform", `translate(0,${this.height})`);
        // this.axis_x_g.selectAll(".tick line") // Change attr of the minor-axis lines
        //     .attr("stroke", "#b89c98")
        //     .attr("stroke-width", "1")
        //     .attr("opacity", "0.6");
        this.axis_x_g.append("text")
            .attr("fill", "black")
            .attr("class", "x-axis-label")
            .attr("y", -10)
            .attr("x", this.width - 20)
            .text(this.labels.x)
            .style("font-size", 15)
            .style("font-weight", "bold");
    }

    renderAxisEra(rotation=90) {
        this.axis_era_g = this.chart.append("g")
            .attr("class", "era-axis-group")
            .attr("transform", `translate(0,${this.height+30})`); // adjust y so that the group-labels are below labels
        
        const era = this.axis_era_g.selectAll(".era-axis-group").data(this.moviesCount);
        era.enter().append("text")
            .attr("fill", d => this.scale_colour_era(this.value_colour_era(d)))
            .attr("class", "era-axis-elements")
            .attr("y", 0)
            .attr("x", (d, i) => (this.scale_x.bandwidth() * d.cumsum) - (this.scale_x.bandwidth() * d.count / 2))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .style("font-size", 11)
            .style("font-weight", "bold")
            .style('pointer-events', 'auto')
            .on('click', d => updateNodeLinkGraph(d.disney_era))
            .text(d => this.value_colour_era(d))
            .call(this.wrap, 5);
        era.exit().remove();

        this.axis_era_g.append("text")
            .attr("fill", "black")
            .attr("class", "era-axis-label")
            .text(this.labels.era)
            .style("font-size", 15)
            .style("font-weight", "bold")
            .attr("transform", `translate(${this.width -20}, -25), rotate(${rotation})`);
    }

    renderAxisY(y_axis) {
        this.axis_y_g = this.chart.append("g").call(y_axis);
        this.axis_y_g.selectAll(".tick line") // Change attr of the minor-axis lines
            .attr("stroke", "#b89c98")
            .attr("stroke-width", "1")
            .attr("opacity", "0.6");
        this.axis_y_g.append("text")
            .attr("fill", "black")
            .attr("class", "y-axis-label")
            .attr("y", -this.config.margin.left / 2 + 30)
            .attr("x", -30)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text(this.labels.y)
            .style("font-size", 15)
            .style("font-weight", "bold");
    }

    // Tool tip
    setTooltip() {
        this.tooltip = d3.select(this.tooltip_div_id).attr("class", "movie-tooltip").style("visibility", "hidden");
    }

    showTooltip(row) {
        this.tooltip
            .style("visibility", "visible")
            .style("left", () => this.getXposition())
            .style("top", () => this.getYposition());
        this.createTooltipData(row);
    }
    
    hideTooltip() {
        this.tooltip.style("visibility", "hidden");
        this.removeTooltipData();
    }

    createTooltipData(row) {
        this.tooltip_data = this.tooltip.append("div").attr("class", "tooltip-data");
        const movie_title = `${row["movie_title"]}`;
        const movie_rating = `Rating: ${row["rating"]}`;
        const movie_gross_revenue = `Gross Revenue: $${this.formatThousandCommas(row["box_office"])}`;
        this.tooltip_data.append("h4").attr("class", "movie-title").text(movie_title);
        this.tooltip_data.append("p").text(movie_rating);
        this.tooltip_data.append("p").text(movie_gross_revenue);
    }

    removeTooltipData() {
        this.tooltip_data.remove();
    }

    getXposition() {
        if (d3.event.pageX < 1300) {
            return (d3.event.pageX - 50) + "px";
        } else {
            return (d3.event.pageX - 200) + "px";
        }
    }

    getYposition() {
        if (d3.event.pageY > 300) {
            return (d3.event.pageY - 120) + "px";
        } else {
            return (d3.event.pageY + 50) + "px";
        }
    }

    // Legends
    renderLegends() {
        // Legends
        const x_dots_pos = 0;
        const x_labels_pos = x_dots_pos + 10;
        const y_first_dot_pos = this.height + 110;
        const y_offset_dots_pos = 25;
        const x_offset_dots_pos = 100;
        const feature_title_font_size = "0.8em";
        const feature_item_font_size = "0.8em";

        // Legend: Colour feature
        this.chart.selectAll("legend-colour-dots").data(this.scale_colour.domain())
            .enter().append("circle")
            .attr("cx", x_dots_pos)
            .attr("cy", (d, i) => { return y_first_dot_pos + i * (y_offset_dots_pos) })
            .attr("r", 7)
            .style("fill", (d) => this.scale_colour(d));
        this.chart.selectAll("legend-colour-labels").data(this.scale_colour.domain())
            .enter().append("text")
            .attr("x", x_labels_pos)
            .attr("y", (d, i) => { return y_first_dot_pos + i * (y_offset_dots_pos) + 2 })
            .text((d) => { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size", feature_item_font_size);
        this.chart.append("text")
            .attr("x", x_labels_pos)
            .attr("y", y_first_dot_pos - 20)
            .text(this.labels["status"])
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", feature_title_font_size);


        // Legend: Mark feature
        this.chart.selectAll("legend-mark-dots").data(this.scale_size.domain())
            .enter().append("image")
            .attr("href", d => this.scale_size(d))
            .attr("width", "2.7em")
            .attr("transform", (d, i) => `translate(${(x_dots_pos + x_offset_dots_pos * 2.5) + i * (x_offset_dots_pos)}, ${y_first_dot_pos})`)
        this.chart.selectAll("legend-mark-labels").data(this.scale_size.domain())
            .enter().append("text")
            .attr("x", (d, i) => (x_labels_pos + x_offset_dots_pos * 2.5) + i * (x_offset_dots_pos))
            .attr("y", y_first_dot_pos - 10)
            .text(d => (d === "Other") ? d : `${d} Series`)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size", feature_item_font_size);
        this.chart.append("text")
            .attr("x", x_labels_pos + x_offset_dots_pos * 2)
            .attr("y", y_first_dot_pos - 20)
            .text(this.labels["rocket"])
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", feature_title_font_size);
    }

    // Helper to wrap long Axis Label texts
    wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = 0,
                tspan = text.text(null)
                            .append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                .text(word);
                }
            }
        });
    }

    formatThousandCommas(number) {
        return d3.format(',.2f')(number);
    }

    selectMovie(name) {
        d3.selectAll('circle').transition().attr('opacity', 0.3);
        d3.selectAll('circle').filter(d => {
            return d.movie_title == name}).transition()
            .attr('opacity', 0.9)
            .attr('stroke-opacity', 1)
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5)
    }

    deselectMovie() {
        d3.selectAll('circle').transition()
            .attr('opacity', 0.7)
            .attr('stroke-opacity', 0)
    }
}
