
/*class AttackData
{
    constructor(datetime, cc, country, IP, locale, host, spt, dpt, protocol, latitude, longitude)
    {
        this.datetime = datetime;
        this.cc = cc;
        this.country = country;
        this.IP = IP;
        this.locale = locale;
        this.host = host;
        this.spt = spt;
        this.dpt = dpt;
        this.protocol = protocol;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}*/

class Map
{
    constructor(cyberAttackDataCSV, aggregatedCountriesAttacksCSV, datePicker)
    {
        this.cyberAttackDataCSV = cyberAttackDataCSV;
        this.aggregatedCountriesAttacksCSV = aggregatedCountriesAttacksCSV;
        this.datePicker = datePicker;

        this.finalSelectedAttacks = [];

        console.log("Map: Data", this.cyberAttackDataCSV);
        console.log("Map: Agg Countries", this.aggregatedCountriesAttacksCSV);

        this.width = 2071;
        this.height = 874;
        this.projection = d3.geoWinkel3().scale(250).translate([this.width / 2, this.height / 2]);

        // The currently selected date and time in milliseconds since 1 January, 1970, 00:00:00, UTC, with leap seconds ignored
        this.selectedDate = this.datePicker.date;

        const formatDate = d3.timeFormat("%-m/%-d/%y");
        this.previousDate = formatDate(new Date(this.selectedDate));

        this.animationRunning = false;
        this.animationInterval = null;

        this.playBtn = d3.select("#play-btn");

        this.playBtn.on("click", () => {
                if (this.animationRunning)
                {
                    this.stopAnimation();
                }
                else
                {
                    this.playMapAnimation();
                }
            })
    }

    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(world)
    {
        //this.drawTimeSlider();

        // Convert the topojson data to geojson data
        const geojson = topojson.feature(world, world.objects.countries);

        // Convert the projected latitude and longitude coordinates into an SVG path string
        const path = d3.geoPath().projection(this.projection);

        const mapSVG = d3.select("#map-svg");

        const mapGroup = mapSVG.append("g")
            .attr("id", "map-group");

        // Bind the geo data and create one path per GeoJSON feature
        mapGroup.selectAll("path")
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

        // Attack Graticule Example
        /*mapSVG.append("path")
            .attr("class", "attack-graticule")
            .attr("d", path({type: 'Feature', geometry: {type: 'LineString', coordinates: [[0.1278, 51.5074], [-74.0059, 40.7128]]}}))
            .attr("fill", "none");*/

        const currentDate = new Date(this.selectedDate);
        const formatDate = d3.timeFormat("%-m/%-d/%y");
        const formatTime = d3.timeFormat("%H:%M");

        mapSVG.append("text")
            .attr("id", "date-label")
            .attr("class", "date label")
            .attr("text-anchor", "end")
            .attr("y", 100)
            .attr("x", 350)
            .text(formatDate(currentDate));

        mapSVG.append("text")
            .attr("id", "time-label")
            .attr("class", "date label")
            .attr("text-anchor", "end")
            .attr("y", 200)
            .attr("x", 350)
            .text(formatTime(currentDate));

        this.updateMap();
    }

    updateMap()
    {
        let selectedDayAttacks;

        const formatDate = d3.timeFormat("%-m/%-d/%y");
        const formatTime = d3.timeFormat("%H:%M");

        if (formatDate(new Date(this.selectedDate)) !== this.previousDate)
        {
           this.finalSelectedAttacks = [];
           this.previousDate =  formatDate(new Date(this.selectedDate));
        }

        for (let attackDate of this.cyberAttackDataCSV)
        {
            if (formatDate(new Date(attackDate.key)) === formatDate(new Date(this.selectedDate)))
            {
                selectedDayAttacks = attackDate;
                break;
            }
        }
        

        for (let attackTime of selectedDayAttacks.values)
        {
            if (Date.parse(new Date(this.selectedDate)) >= Date.parse(new Date(attackTime.datetime)))
            {
                this.finalSelectedAttacks.push(attackTime);
            }
        }

        //console.log("Final Selected Attacks", finalSelectedAttacks);

        const mapSVG = d3.select("#map-svg");

        // Convert the projected latitude and longitude coordinates into an SVG path string
       // const path = d3.geoPath().projection(this.projection);

        let attackBubbles = mapSVG.selectAll("circle").data(this.finalSelectedAttacks);

        attackBubbles.exit().remove();

        const attackBubblesEnter = attackBubbles.enter().append("circle")
            .attr("class", "attack-circle")
            .attr("cx", d => {
                return this.projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", d => {
                return this.projection([d.longitude, d.latitude])[1];
            })
            .attr("r", 5)
            .attr("fill", "red")
            .style("opacity", 0.8);

        attackBubbles = attackBubblesEnter.merge(attackBubbles);

        const currentDate = new Date(this.selectedDate);

        d3.select("#date-label")
            .text(formatDate(currentDate));

        d3.select("#time-label")
            .text(formatTime(currentDate));
    }

    playMapAnimation()
    {
        this.animationInterval = setInterval(() => {
            this.datePicker.date = this.selectedDate += 60000;
        }, 50);
        this.animationRunning = true;
        this.playBtn.text("Stop Animation");
    }
    
    stopAnimation()
    {
        clearInterval(this.animationInterval);
        this.animationRunning = false;
        this.playBtn.text("Play Animation");
    }

    updateDate(newDate)
    {
        this.selectedDate = newDate;
        this.updateMap();
    }
}