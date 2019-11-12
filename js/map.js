
class Map
{
    constructor(cyberAttackDataCSV)
    {
        this.cyberAttackDataCSV = cyberAttackDataCSV;
        this.width = 2071;
        this.height = 874;
        this.projection = d3.geoWinkel3().scale(250).translate([this.width / 2, this.height / 2]);
        this.selectedDate = new Date(d3.select("#date-input").node().getAttribute("min"));
        this.selectedTime = 0;
    }

    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(world)
    {
        this.drawTimeSlider();

        // Convert the topojson data to geojson data
        const geojson = topojson.feature(world, world.objects.countries);

        // Convert the projected latitude and longitude coordinates into an SVG path string
        const path = d3.geoPath().projection(this.projection);

        const mapSVG = d3.select("#map-svg");

        // Bind the geo data and create one path per GeoJSON feature
        mapSVG.selectAll("path")
            .data(geojson.features)
            .join("path")
            .attr("id", d => d.id)
            .attr("d", path);

        const graticule = d3.geoGraticule();

        mapSVG.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path)
            .attr("fill", "none");

        mapSVG.append("path")
            .attr("class", "attack-graticule")
            .attr("d", path({type: 'Feature', geometry: {type: 'LineString', coordinates: [[0.1278, 51.5074], [-74.0059, 40.7128]]}}))
            .attr("fill", "none");
    }

    drawTimeSlider()
    {
        let that = this;

        let timeScale = d3.scaleLinear().domain([0, 23]).range([30, 730]);

        let timeSlider = d3.select('#selectedTime-slider')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', 0)
            .attr('max', 23)
            .attr('value', this.selectedTime);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.selectedTime);

        sliderText.attr('x', timeScale(this.selectedTime));
        sliderText.attr('y', 25);

        const slider = d3.select(".slider").node();

        timeSlider.on("input", () => {
            this.selectedTime = slider.value;
            sliderText.attr("x", timeScale(that.selectedTime));
            sliderText.text(that.selectedTime);
        });
    }
}