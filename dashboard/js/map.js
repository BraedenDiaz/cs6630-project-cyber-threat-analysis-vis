
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

class WorldMap
{
    constructor(cyberAttackDataCSV, aggregatedCountriesAttacksCSV, datePicker)
    {
        this.cyberAttackDataCSV = cyberAttackDataCSV;
        this.aggregatedCountriesAttacksCSV = aggregatedCountriesAttacksCSV;
        this.datePicker = datePicker;

        this.finalSelectedAttacks = [];

        //console.log("Map: Data", this.cyberAttackDataCSV);
       // console.log("Map: Agg Countries", this.aggregatedCountriesAttacksCSV);

        this.width = 2071;
        this.height = 874;
        this.projection = d3.geoWinkel3().scale(250).translate([this.width / 2, this.height / 2]);

        // The currently selected date and time in milliseconds since 1 January, 1970, 00:00:00, UTC, with leap seconds ignored
        this.selectedDate = this.datePicker.date;

        const formatDate = d3.timeFormat("%-m/%-d/%y");
        this.previousDate = null;

        this.selectedDayAttacks = null;
        this.selectedDayTime = null;

        this.animationRunning = false;
        this.animationInterval = null;

        this.lockAttacksSwitch = document.getElementById("lock-attacks-switch");
        this.lockAttacks = this.lockAttacksSwitch.checked;
        this.lockAttacksSwitch.addEventListener("click", () => this.lockAttacks = this.lockAttacksSwitch.checked);


        this.speedDropdown = document.getElementById("speed-dropdown");
        this.speedDropdown.value = "Fast";
        this.animationSpeed = this.changeAnimationSpeed(this.speedDropdown.value);
        this.speedDropdown.addEventListener("change", () => this.animationSpeed = this.changeAnimationSpeed(this.speedDropdown.value));

        this.playBtn = d3.select("#play-btn");

        this.playBtn.on("click", () => {
                if (this.animationRunning)
                {
                    this.stopAnimation();
                    this.speedDropdown.disabled = false;
                }
                else
                {
                    this.speedDropdown.disabled = true;
                    this.playMapAnimation();
                }
            })
    }

    changeAnimationSpeed(newSpeed)
    {
        switch(newSpeed)
        {
            case "Slow":
                return 1000;
            case "Medium":
                return 500;
            case "Fast":
                return 100;
            case "Really Fast":
                return 50;
            default:
                return 1000;
        }
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

        
        // Tooltip
        d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

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
        const formatDate = d3.timeFormat("%-m/%-d/%y");
        const formatTime = d3.timeFormat("%H:%M");

        if (formatDate(new Date(this.selectedDate)) !== this.previousDate)
        {
           this.finalSelectedAttacks = [];
           this.previousDate =  formatDate(new Date(this.selectedDate));
           this.selectedDayAttacks = this.cyberAttackDataCSV.get(formatDate(new Date(this.selectedDate)));

           // Aggregate by time
           this.selectedDayAttacks = d3.nest()
                .key(d => {
                    return d.datetime;
                })
                .entries(this.selectedDayAttacks);

           this.selectedDayAttacks.sort((a, b) => {
                return Date.parse(new Date(a.key)) - Date.parse(new Date(b.key));
            });
        }

        // Stop if we past the last day
        if(!this.selectedDayAttacks)
        {
            this.stopAnimation();
            return;
        }

        this.selectedDayTime = this.selectedDayAttacks.shift();

        // If we run out of attacks for the day, go to the next day
        if (!this.selectedDayTime)
        {
            this.finalSelectedAttacks = [];
            this.previousDate =  formatDate(new Date(this.selectedDate));
            const currDate = new Date(this.selectedDate);
            this.selectedDayAttacks = this.cyberAttackDataCSV.get(formatDate(currDate.setDate(currDate.getDate() + 1)));

            // Stop if we past the last day
            if(!this.selectedDayAttacks)
            {
                this.stopAnimation();
                return;
            }
 
            // Aggregate by time
            this.selectedDayAttacks = d3.nest()
                 .key(d => {
                     return d.datetime;
                 })
                 .entries(this.selectedDayAttacks);
 
            this.selectedDayAttacks.sort((a, b) => {
                 return Date.parse(new Date(a.key)) - Date.parse(new Date(b.key));
             });
 
             this.selectedDayTime  = this.selectedDayAttacks.shift()
        }

        if (this.lockAttacks)
            this.selectedDayTime.values.forEach(value => this.finalSelectedAttacks.push(value));
        else
            this.finalSelectedAttacks = this.selectedDayTime.values;

        //console.log("Final Selected Attacks", finalSelectedAttacks);

        const mapSVG = d3.select("#map-svg");

        // Convert the projected latitude and longitude coordinates into an SVG path string
       // const path = d3.geoPath().projection(this.projection);

        let attackBubbles = mapSVG.selectAll("circle").data(this.finalSelectedAttacks);

        attackBubbles.exit().remove();

        const tooltipDiv = d3.select(".tooltip");

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
            .style("opacity", 0.8)
            .on("mouseover", d => {
                tooltipDiv.html(this.tooltipRender(d))
                    .style("opacity", 0.9)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltipDiv.style("opacity", 0));

        //attackBubbles = attackBubblesEnter.merge(attackBubbles);

        const currentDate = new Date(this.selectedDate);

        d3.select("#date-label")
            .text(formatDate(currentDate));

        d3.select("#time-label")
            .text(formatTime(currentDate));
    }

    playMapAnimation()
    {
        this.animationInterval = setInterval(() => {
            this.updateMap();
            this.datePicker.date = Date.parse(new Date(this.selectedDayTime.key));
        }, this.animationSpeed);
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

    /**
     * Returns html that can be used to render the tooltip.
     * 
     * @param data 
     * @returns {string}
     */
    tooltipRender(data) {
        // Render the Attacker's IP
        let text = `<h4><b>Attacker IP: ${data.srcstr}</b></h4>`;

        text = text + `<h5><b>Source Port:</b> ${data.spt}</h5>`;

        text = text + `<h5><b>Country:</b> ${data.country}</h5>`;

        text = text + `<h5><b>Honeypot:</b> ${data.host}</h5>`;

        text = text + `<h5><b>Destination Port:</b> ${data.dpt}</h5>`

        text = text + `<h5><b>Protocol:</b> ${data.proto}</h5>`;

        return text;
    }
}