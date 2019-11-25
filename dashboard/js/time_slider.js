
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

        // Aggregate by  time
        const aggregatedTime= d3.nest()
            .key(d => {
                return d.time;
            })
            .entries(selectedDateObj.values);

        this.timeScale = d3.scaleTime()
            .domain([new Date(selectedDateObj.key), new Date((new Date(selectedDateObj.key)).setHours(23))])
            .range([0, this.width]);

        const xAxis = svg.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(this.timeScale));
            
    }
}