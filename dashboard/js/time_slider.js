
class TimeSlider
{
    constructor(cyberAttackDataCSV, datePicker)
    {
        this.cyberAttackDataCSV = cyberAttackDataCSV;
        this.datePicker = datePicker;

        this.margin = {top: 10, right: 30, bottom: 30, left: 60};
        this.width = 1036 - this.margin.left - this.margin.right;
        this.height = 150 - this.margin.top - this.margin.bottom;

        // The currently selected date and time in milliseconds since 1 January, 1970, 00:00:00, UTC, with leap seconds ignored
        this.selectedDate = this.datePicker.date;

        this.timeScale = null;
        this.attackScale = null;

        this.svg = d3.select("#time-div")
            .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    drawTimeSlider()
    {
        const svg = this.svg;

        svg.html(null);

        const formatDate = d3.timeFormat("%-m/%-d/%y");
        const formatTime = d3.timeFormat("%H:%M");
        const selectedDateObj = this.cyberAttackDataCSV.get(formatDate(this.selectedDate));

        //console.log("selectedDateObj", selectedDateObj);

        // Aggregate by time
        const aggregatedTime= d3.nest()
            .key(d => {
                return d.datetime;
            })
            .entries(selectedDateObj);

        // Sort the array by time
        aggregatedTime.sort((a, b) => {
            return Date.parse(new Date(a.key)) - Date.parse(new Date(b.key));
        });

        //console.log("aggregatedTime", aggregatedTime);

        const firstTime = new Date(selectedDateObj[0].datetime);
        const lastTime = new Date(selectedDateObj[selectedDateObj.length - 1].datetime);

        this.timeScale = d3.scaleTime()
            .domain([firstTime, lastTime])
            .range([0, this.width]);

        const xAxis = d3.axisBottom(this.timeScale);
        
        svg.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(xAxis);

        let maxNumOfAttacks = 0;

        const validTimes = [];

        for (let time of aggregatedTime)
        {
            validTimes.push(formatTime(new Date(time.key)));
            if (time.values.length > maxNumOfAttacks)
                maxNumOfAttacks = time.values.length;
        }
        
        this.attackScale = d3.scaleLinear()
            .domain([0, maxNumOfAttacks])
            .range([this.height, 0]);

        const yAxis = d3.axisLeft(this.attackScale);

        svg.append("g")
            .call(yAxis);

        svg.append("path")
            .datum(aggregatedTime)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => this.timeScale(new Date(d.key)))
                .y(d => this.attackScale(d.values.length)));

        const slider = svg.append("rect")
            .attr("class", "slider-rect")
            .attr("x", this.timeScale(this.selectedDate))
            .attr("y", 0)
            .attr("width", 5)
            .attr("height", this.height);

        const dragHandler = d3.drag()
            .on("drag", () => {
                d3.select(".slider-rect")
                    .attr("x", () => {
                        if (d3.event.x < 0)
                        {
                            this.datePicker.date = this.timeScale.invert(0).setSeconds(0);
                            return 0;
                        }
                        else if (d3.event.x > this.width)
                        {
                            this.datePicker.date = this.timeScale.invert(this.width).setSeconds(0);
                            return this.width;
                        }
                        else if (validTimes.includes(formatTime(new Date(this.timeScale.invert(d3.event.x).setSeconds(0)))))
                        {
                            this.datePicker.date = this.timeScale.invert(d3.event.x).setSeconds(0);
                            return d3.event.x;
                        }
                        else
                            return d3.event.x;
                    });
            });

        dragHandler(slider);
            
    }

    updateDate(newDate)
    {
        this.selectedDate = newDate;
        this.drawTimeSlider();
    }
}