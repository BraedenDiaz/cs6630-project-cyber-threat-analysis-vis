
class RankBarChart
{
    constructor(cyberAttackDataCSV, datePicker)
    {
        this.cyberAttackDataCSV = cyberAttackDataCSV;
        this.datePicker = datePicker;

        this.currentData = [];

        this.margin = {top: 10, right: 30, bottom: 30, left: 40};
        this.width = 1036 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;

        // The currently selected date and time in milliseconds since 1 January, 1970, 00:00:00, UTC, with leap seconds ignored
        this.selectedDate = this.datePicker.date;
        this.formatDate = d3.timeFormat("%-m/%-d/%y");

        this.xScale = null;
    }

    updateCurrentData()
    {
        const selectedDayAttacks = this.cyberAttackDataCSV.get(this.formatDate(new Date(this.selectedDate)));

        const aggregateAttacksByIP = d3.nest()
            .key(d => {
                return d.srcstr;
            })
            .entries(selectedDayAttacks);

        //console.log("aggIP", aggregateAttacksByIP);
    }

    drawBarChart()
    {
        this.updateCurrentData();

        //console.log("RankBarChart: Data", this.cyberAttackDataCSV);
        //console.log("RankBarChart: Current Data", this.currentData);

        const svg = d3.select("#ranking-bar-chart-div")
            .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);


        //this.xScale = d3.scaleLinear();
    }

    updateBarChart()
    {

    }

    updateDate(newDate)
    {
        this.selectedDate = newDate;
        this.updateBarChart();
    }
}