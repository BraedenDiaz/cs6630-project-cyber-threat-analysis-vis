
class Month {
    constructor(month, date) {
        this.month = month;
        this.date = date;
    }

}

class DatePicker {
    constructor(cyberAttackDataCSV, selectedDateChanged) {
        this.cyberAttackDataCSV = cyberAttackDataCSV;
        this.selectedDateChanged = selectedDateChanged;
        
        this.width = 2071;
        this.height = 550;
        this.cellSize = 45;

        this.formatPercent = d3.format(".1%");

        this.colorScale = null;

        this.months = [];

        this.firstDay = new Date(this.cyberAttackDataCSV[0].values[0].datetime);

        // The currently selected date and time in milliseconds since 1 January, 1970, 00:00:00, UTC, with leap seconds ignored
        this.selectedDateInMilliseconds = Date.parse(this.firstDay);
    }

    get date()
    {
        return this.selectedDateInMilliseconds;
    }

    set date(newDate)
    {
        this.selectedDateInMilliseconds = newDate;
        this.selectedDateChanged(this.selectedDateInMilliseconds);
    }

    drawDatePicker() {
        const that = this;

        let attacksPerDay = [], minAttacks, maxAttacks;

        this.cyberAttackDataCSV.forEach(day => {
            attacksPerDay.push(day.values.length);
        })

        minAttacks = d3.min(attacksPerDay);
        maxAttacks = d3.max(attacksPerDay);

        this.colorScale = d3.scaleLinear()
            .domain([minAttacks, maxAttacks / 3, maxAttacks])
            .range(["white", "red", "darkred"]);

        // Create and add Month objects that correspond with the dataset
        this.months.push(new Month("March",  new Date(2013, 2, 1)));
        this.months.push(new Month("April", new Date(2013, 3, 1)));
        this.months.push(new Month("May", new Date(2013, 4, 1)));
        this.months.push(new Month("June", new Date(2013, 5, 1)));
        this.months.push(new Month("July", new Date(2013, 6, 1)));
        this.months.push(new Month("August", new Date(2013, 7, 1)));
        this.months.push(new Month("September", new Date(2013, 7, 1)));

        // Create the overall SVG that will contain the entire calendar
        const svg = d3.select("#date-div").append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        // Create a group that will contain the items for one single month
        const monthGroups = svg.selectAll("g").data(this.months)
            .enter()
            .append("g")
            .attr("transform", (d, i) => {
                switch (i) {
                    case 5:
                        return `translate(50, 300)`;
                    case 6:
                        return `translate(450, 300)`;;
                    default:
                        return `translate(${(i * 400) + 50}, 0)`;
                }
            });

        // Append the month name to the group of months
        monthGroups.append("text")
            .attr("transform", (d, i) => `translate(-10, ${this.cellSize * 2}) rotate(-90)`)
            .attr("font-family", "sans-serif")
            .attr("font-size", 20)
            .attr("text-anchor", "middle")
            .text(d => d.month);

        // Create a group that will contain the border path and dates for a Month
        const g = monthGroups.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(function (d) {
                switch (d.month) {
                    case "March":
                        return d3.timeDays(new Date(2013, 2, 3), new Date(2013, 3, 1));
                    case "April":
                        return d3.timeDays(new Date(2013, 3, 1), new Date(2013, 4, 1));
                    case "May":
                        return d3.timeDays(new Date(2013, 4, 1), new Date(2013, 5, 1));
                    case "June":
                        return d3.timeDays(new Date(2013, 5, 1), new Date(2013, 6, 1));
                    case "July":
                        return d3.timeDays(new Date(2013, 6, 1), new Date(2013, 7, 1));
                    case "August":
                        return d3.timeDays(new Date(2013, 7, 1), new Date(2013, 8, 1));
                    case "September":
                        return d3.timeDays(new Date(2013, 8, 1), new Date(2013, 8, 8));
                }
            });

        const formatDate = d3.timeFormat("%b-%d-%y");

        // Create a group for each day of the month
        const gGroups = g.enter()
            .append("g")
            .attr("class", "date-group")
            .attr("transform", function (d) {
                const x = d.getDay() * that.cellSize;
                const y = (d3.timeWeek.count(d3.timeMonth(d), d) * that.cellSize);
                return "translate(" + x + "," + y + ")";
            })
            .style("fill", d => {
                for (let attack of this.cyberAttackDataCSV)
                    if (Date.parse(d) === Date.parse(attack.key))
                        return that.colorScale(attack.values.length);
            })
            .on("click", d => {
                if (formatDate(d) === formatDate(new Date(2013, 2, 3)))
                    this.selectedDateInMilliseconds = Date.parse(new Date(2013, 2, 3, 21, 53));
                else
                    this.selectedDateInMilliseconds = Date.parse(d);
                this.selectedDateChanged(this.selectedDateInMilliseconds);
                gGroups.select("rect").classed("selected", false);
                d3.select(`#${formatDate(d)}-rect`).classed("selected", true);
            });

        // Add a rectangle to each corresponding group that represents a single day
        gGroups.append("rect")
            .attr("id", d => {
                return formatDate(d) + "-rect";
            })
            .attr("width", this.cellSize)
            .attr("height", this.cellSize)
            .attr("class", d => (Date.parse(d) === Date.parse(new Date(2013, 2, 3)) ? "date-rect selected" : "date-rect"))
            .attr("rx", 4)
            .attr("ry", 4)
            .datum(d3.timeFormat("%Y-%m-%d"));

        // Add the text for the date of the corrsponding day in the single month
        gGroups.append("text")
            .text(function (d) {
                return d.getDate();
            })
            .attr("class", "date-text")
            .attr("x", (this.cellSize / 2) - 3)
            .attr("y", (this.cellSize / 2) + 3);

        // Create the border around the group of days for one whole month
        monthGroups.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .selectAll("path")
            .data(function (d) {
                switch (d.month) {
                    case "March":
                        return d3.timeMonths(new Date(2013, 2, 1), new Date(2013, 3, 1));
                    case "April":
                        return d3.timeMonths(new Date(2013, 3, 1), new Date(2013, 4, 1));
                    case "May":
                        return d3.timeMonths(new Date(2013, 4, 1), new Date(2013, 5, 1));
                    case "June":
                        return d3.timeMonths(new Date(2013, 5, 1), new Date(2013, 6, 1));
                    case "July":
                        return d3.timeMonths(new Date(2013, 6, 1), new Date(2013, 7, 1));
                    case "August":
                        return d3.timeMonths(new Date(2013, 7, 1), new Date(2013, 8, 1));
                    case "September":
                        return d3.timeMonths(new Date(2013, 8, 1), new Date(2013, 9, 1));
                }
            })
            .enter().append("path")
            .attr("d", d => this.pathMonth(d));


        /****** Color Scale Legend ******/
        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", `translate(${this.width - 1400}, ${this.height - 50})`);

        const legendLinear = d3.legendColor()
            .shapeWidth(50)
            .cells(25)
            .orient("horizontal")
            .scale(this.colorScale)
            .labelFormat(".0f");

        svg.select(".legendLinear")
            .call(legendLinear);
    }

    // Used to update the highlighting of the currently selected date
    updateDatePicker()
    {
        const gGroups = d3.selectAll(".date-group");

        const formatDate = d3.timeFormat("%b-%d-%y");

        gGroups.select("rect").classed("selected", false);
        d3.select(`#${formatDate(this.selectedDateInMilliseconds)}-rect`).classed("selected", true);
    }

    // A function that helps draw the border path based on the month and date
    pathMonth(t0) {
        const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = t0.getDay(),
            w0 = d3.timeWeek.count(d3.timeMonth(t0), t0),
            d1 = t1.getDay(),
            w1 = d3.timeWeek.count(d3.timeMonth(t1), t1);
        return "M" + d0 * this.cellSize + "," + (w0) * this.cellSize + "H" + 7 * this.cellSize + "V" + (w1) * this.cellSize + "H" + (d1 + 1) * this.cellSize + "V" + (w1 + 1) * this.cellSize + "H" + 0 + "V" + (w0 + 1) * this.cellSize + "H" + d0 * this.cellSize + "Z";
    }
}