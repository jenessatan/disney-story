class Histogram {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1500,
            containerHeight: _config.containerHeight || 600,
        };
        this.config.margin = _config.margin || { top: 20, right: 75, bottom: 150, left: 70 };
    }

    initVis(movies, moviesCount, columns, labels, extraInfoElem) {
        const vis = this;
        vis.setWidthHeight();
        vis.movies = movies;
        vis.moviesCount = moviesCount;
        vis.columns = columns;
        vis.labels = labels;
        vis.extra_info_elem = extraInfoElem;
        vis.getEraFromYear = DataProcessor.getDisneyEra;
        vis.setColours();
        // vis.setDataByYear(year);
        vis.setValues();
        vis.setScales();
        vis.setAxes();
        vis.setTooltip();
        vis.svg = d3.select(vis.config.parentElement)
            .style("height", `${vis.config.containerHeight}px`)
            .style("width", `${vis.config.containerWidth}px`);
        vis.chart = vis.svg.append("g").attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    }

    setColours() {
        const vis = this;
        vis.colour_normal = "#000000";
        vis.colour_hover = "#f2bf33";
        vis.colour_select = "#dea814";
        vis.colour_era = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666'];
    }

    // setDataByYear(year) {
    //     const vis = this;
    //     vis.year = year;
    //     vis.movies = vis.movies.filter(row => (row[`${vis.columns["x"]}`].getFullYear() >= year) && row[`${vis.columns["x"]}`].getFullYear() < year+10);
    // }

    setWidthHeight() {
        const vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    }

    setValues() {
        const vis = this;
        // Methods to set values 
        vis.value_x = d => d[`${vis.columns.x}`];
        vis.value_y = d => d[`${vis.columns.y}`];
        vis.value_size = d => d[`${vis.columns.size}`];
        vis.value_colour_era = d => d[`${vis.columns.era}`];
    }

    setScales() {
        const vis = this;
        vis.setScaleX();
        vis.setScaleY();
        vis.setScaleSize();
        vis.setScaleColourEra();
    }

    setScaleX() {
        const vis = this;
        const domain_x = vis.movies.map(vis.value_x);
        const range_x = [0, vis.width];
        vis.scale_x = vis.getScaleBand(domain_x, range_x, 0, 1);
    }

    setScaleY() {
        const vis = this;
        const domain_y = vis.movies.map(vis.value_y);
        const range_y = [vis.height, 0];
        vis.scale_y = vis.getScaleBand(domain_y, range_y, 1, 1);
    }

    setScaleSize() {
        const vis = this;
        const domain_size = d3.extent(vis.movies, vis.value_size);
        const range_size = [2, 20];
        vis.scale_size = vis.getScaleSqrt(domain_size, range_size);
    }

    setScaleColourEra() {
        const vis = this;
        const domain_colour = vis.movies.map(vis.value_colour_era);
        const range_colour = vis.colour_era;
        vis.scale_colour_era = vis.getScaleOrdinal(domain_colour, range_colour);
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
        const vis = this;
        vis.setAxisX();
        vis.setAxisY();
    }

    setAxisX() {
        const vis = this;
        vis.axis_x = vis.getAxisBottom(vis.scale_x);
    }
    
    setAxisY() {
        const vis = this;
        vis.axis_y = vis.getAxisLeft(vis.scale_y);
    }

    getAxisBottom(scale) {
        const vis = this;
        return d3.axisBottom(scale)
            .tickSizeOuter(0)
            .tickSize(-vis.height)
    }

    getAxisLeft(scale) {
        const vis = this;
        return d3.axisLeft(scale)
            .tickPadding(2)
            .tickSize(-vis.width)
            .tickSizeOuter(0);
    }

    renderData() {
        const vis = this;
        vis.renderCircles("movie");
    }

    update(year) {
        const vis = this;
        vis.setDataByYear(year);
        vis.setScaleX();
        vis.setAxisX();
        vis.updateAxisX(vis.axis_x);
        vis.renderData();
    }

    updateAxisX(x_axis) {
        const vis = this;
        vis.axis_x_g.call(x_axis);
        vis.tiltTickAxisX();
    }

    render() {
        const vis = this;
        // vis.renderAxisY(vis.axis_y);
        vis.renderAxisX(vis.axis_x);
        vis.renderAxisEra(90);
        vis.tiltTickAxisX(-45, "-0.8em", "-0.15em");
        vis.renderData();
        // vis.renderLegends();
    }

    // renderMarks(className, x_offset, y_offset) {
    //     const vis = this;
    //     const marks = vis.chart.selectAll(`.${className}`).data(vis.movies, d => d["date"]);
    //     marks
    //         .enter().append("image") // Should be constant and not changed when updating
    //         .attr("class", className)
    //         .attr("width", "2.7em")
    //         .attr("transform", `translate(${x_offset}, ${y_offset})`)
    //         .attr("y", d => vis.scale_y(vis.value_y(d))) // init position
    //         .attr("x", d => vis.scale_x(vis.value_x(d))) // init position
    //         .merge(marks) // Enter + Update
    //         .attr("href", d => vis.scale_size(vis.value_rocket(d)))
    //         .on("mouseover", d => vis.showTooltip(d))
    //         .on("mouseout", () => vis.hideTooltip())
    //         .attr("y", d => vis.scale_y(vis.value_y(d)))
    //         .attr("x", d => vis.scale_x(vis.value_x(d)));
    //     marks.exit().remove();
    // }

    renderCircles(className) {
        const vis = this;
        const circles = vis.chart.selectAll(`.${className}`).data(vis.movies);
        circles
            .enter().append("circle")
                .attr("class", className)
                .attr("opacity", 0.7)
                .attr("r", d => vis.scale_size(vis.value_size(d)))
                .attr("cx", d => vis.scale_x(vis.value_x(d)))
                .attr("cy", d => vis.scale_y(vis.value_y(d)))
            .merge(circles)
                .attr("fill", d => vis.scale_colour_era(vis.value_colour_era(d)))
                .on("mouseover", d => vis.showTooltip(d))
                .on("mouseout", () => vis.hideTooltip())
            .transition().duration(1000)
                .attr("r", d => vis.scale_size(vis.value_size(d)))
                .attr("cy", d => vis.scale_y(vis.value_y(d)))
                .attr("cx", d => vis.scale_x(vis.value_x(d)));
        circles.exit().remove();
    }

    tiltTickAxisX(rotation=-45, dx="-0.8em", dy="-0.15em") {
        const vis = this;
        vis.axis_x_g.selectAll("text:not(.x-axis-label)")
            .attr("fill", d => vis.scale_colour_era(vis.getEraFromYear(d)))
            .style("font-size", 11)
            .style("text-anchor", "end")
            .attr("dx", `${dx}`)
            .attr("dy", `${dy}`)
            .attr("transform", `rotate(${rotation})`);
    }

    renderAxisX(x_axis) {
        const vis = this;
        vis.axis_x_g = vis.chart.append("g").call(x_axis)
            .attr("transform", `translate(0,${vis.height-40})`);
        vis.axis_x_g.selectAll(".tick line") // Change attr of the minor-axis lines
            .attr("stroke", "#b89c98")
            .attr("stroke-width", "1")
            .attr("opacity", "0.6");
        vis.axis_x_g.append("text")
            .attr("fill", "black")
            .attr("class", "x-axis-label")
            .attr("y", -10)
            .attr("x", vis.width - 20)
            .text(vis.labels.x)
            .style("font-size", 15)
            .style("font-weight", "bold");
    }

    renderAxisEra(rotation=90) {
        const vis = this;
        vis.axis_era_g = vis.chart.append("g")
            .attr("class", "era-axis-group")
            .attr("transform", `translate(0,${vis.height})`); // adjust y so that the group-labels are below labels
        
        const era = vis.axis_era_g.selectAll(".era-axis-group").data(vis.moviesCount);
        era.enter().append("text")
            .attr("fill", d => vis.scale_colour_era(vis.value_colour_era(d)))
            .attr("class", "era-axis-elements")
            .attr("y", 0)
            .attr("x", (d, i) => (vis.scale_x.bandwidth() * d.cumsum) - (vis.scale_x.bandwidth() * d.count / 2))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .style("font-size", 11)
            .style("font-weight", "bold")
            .text(d => vis.value_colour_era(d))
            .call(vis.wrap, 5);
        era.exit().remove();

        vis.axis_era_g.append("text")
            .attr("fill", "black")
            .attr("class", "era-axis-label")
            .text(vis.labels.era)
            .style("font-size", 15)
            .style("font-weight", "bold")
            .attr("transform", `translate(${vis.width -20}, -25), rotate(${rotation})`);
    }

    renderAxisY(y_axis) {
        const vis = this;
        vis.axis_y_g = vis.chart.append("g").call(y_axis);
        vis.axis_y_g.selectAll(".tick line") // Change attr of the minor-axis lines
            .attr("stroke", "#b89c98")
            .attr("stroke-width", "1")
            .attr("opacity", "0.6");
        vis.axis_y_g.append("text")
            .attr("fill", "black")
            .attr("class", "y-axis-label")
            .attr("y", -vis.config.margin.left / 2 + 30)
            .attr("x", -30)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text(vis.labels.y)
            .style("font-size", 15)
            .style("font-weight", "bold");
    }

    // Tool tip
    setTooltip() {
        const vis = this;
        vis.tooltip = d3.select(vis.extra_info_elem).style("visibility", "hidden");
    }
    showTooltip(row) {
        const vis = this;
        vis.tooltip
            .style("visibility", "visible")
            .style("left", `${d3.event.pageX}px`)
            .style("top", `${d3.event.pageY - 100}px`);

        const new_line = "\n";
        const movie_title = ` Title: ${row["movie_title"]} `;
        const movie_rating = ` Rating: ${row["rating"]} `;
        const movie_gross_revenue = ` Gross Revenue: $${row["box_office"]} `;
        const movie_info = movie_title + new_line + movie_rating + new_line + movie_gross_revenue;
        vis.renderTextsWithPreElem(vis.tooltip, movie_info);
    }
    hideTooltip() {
        const vis = this;
        vis.tooltip.style("visibility", "hidden");
    }
    renderTextsWithPreElem(selection, text) {
        selection.select("pre").remove();
        selection.append("pre").text(text);
    }

    // Legends
    renderLegends() {
        const vis = this;
        // Legends
        const x_dots_pos = 0;
        const x_labels_pos = x_dots_pos + 10;
        const y_first_dot_pos = vis.height + 110;
        const y_offset_dots_pos = 25;
        const x_offset_dots_pos = 100;
        const feature_title_font_size = "0.8em";
        const feature_item_font_size = "0.8em";

        // Legend: Colour feature
        vis.chart.selectAll("legend-colour-dots").data(vis.scale_colour.domain())
            .enter().append("circle")
            .attr("cx", x_dots_pos)
            .attr("cy", (d, i) => { return y_first_dot_pos + i * (y_offset_dots_pos) })
            .attr("r", 7)
            .style("fill", (d) => vis.scale_colour(d));
        vis.chart.selectAll("legend-colour-labels").data(vis.scale_colour.domain())
            .enter().append("text")
            .attr("x", x_labels_pos)
            .attr("y", (d, i) => { return y_first_dot_pos + i * (y_offset_dots_pos) + 2 })
            .text((d) => { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size", feature_item_font_size);
        vis.chart.append("text")
            .attr("x", x_labels_pos)
            .attr("y", y_first_dot_pos - 20)
            .text(vis.labels["status"])
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", feature_title_font_size);


        // Legend: Mark feature
        vis.chart.selectAll("legend-mark-dots").data(vis.scale_size.domain())
            .enter().append("image")
            .attr("href", d => vis.scale_size(d))
            .attr("width", "2.7em")
            .attr("transform", (d, i) => `translate(${(x_dots_pos + x_offset_dots_pos * 2.5) + i * (x_offset_dots_pos)}, ${y_first_dot_pos})`)
        vis.chart.selectAll("legend-mark-labels").data(vis.scale_size.domain())
            .enter().append("text")
            .attr("x", (d, i) => (x_labels_pos + x_offset_dots_pos * 2.5) + i * (x_offset_dots_pos))
            .attr("y", y_first_dot_pos - 10)
            .text(d => (d === "Other") ? d : `${d} Series`)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size", feature_item_font_size);
        vis.chart.append("text")
            .attr("x", x_labels_pos + x_offset_dots_pos * 2)
            .attr("y", y_first_dot_pos - 20)
            .text(vis.labels["rocket"])
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
}
