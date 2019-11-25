
class TimeSlider
{
    constructor(cyberAttackDataCSV, datePicker, selectedTimeChanged)
    {
        this.cyberAttackDataCSV = cyberAttackDataCSV;
        this.datePicker = datePicker;
        this.selectedTimeChanged = selectedTimeChanged;


        this.margin = {top: 10, right: 30, bottom: 30, left: 60};
        this.width = 1036 - this.margin.left - this.margin.right;
        this.height = 150 - this.margin.top - this.margin.bottom;

        // The currently selected date and time in milliseconds since 1 January, 1970, 00:00:00, UTC, with leap seconds ignored
        this.selectedDate = this.datePicker.date;

        this.timeScale = null;
        this.attackScale = null;
    }

    drawTimeSlider()
    {

        console.log("Data", this.cyberAttackDataCSV);
        const that = this;

        const svg = d3.select("#time-div")
            .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        const formatDate = d3.timeFormat("%-m/%-d/%y");
        const formatTime = d3.timeFormat("%H:%M");

        let selectedDateOnly = Date.parse(new Date(formatDate(this.selectedDate)));
        let selectedDateObj;

        for (let date of this.cyberAttackDataCSV)
        {
            if (Date.parse(new Date(date.key)) === selectedDateOnly)
            {
                selectedDateObj = date;
                break;
            }
        }

        console.log("selectedDateObj", selectedDateObj);

        // Aggregate by time
        const aggregatedTime= d3.nest()
            .key(d => {
                return d.datetime;
            })
            .entries(selectedDateObj.values);

        // Sort the array by time
        aggregatedTime.sort((a, b) => {
            return Date.parse(new Date(a.key)) - Date.parse(new Date(b.key));
        });

        console.log("aggregatedTime", aggregatedTime);

        const firstTime = new Date(selectedDateObj.values[0].datetime);
        const lastTime = new Date(selectedDateObj.values[selectedDateObj.values.length - 1].datetime);

        this.timeScale = d3.scaleTime()
            .domain([firstTime, lastTime])
            .range([0, this.width]);

        const xAxis = d3.axisBottom(this.timeScale);
        
        svg.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(xAxis);

        let maxNumOfAttacks = 0;

        for (let time of aggregatedTime)
        {
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
            
    }
}