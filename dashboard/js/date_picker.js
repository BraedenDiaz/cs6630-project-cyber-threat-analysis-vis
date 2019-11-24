
class Month {
    constructor(month, date) {
        this.month = month;
        this.date = date;
    }

}

class DatePicker {
    constructor() {
        this.width = 2071;
        this.height = 550;
        this.cellSize = 45;

        this.formatPercent = d3.format(".1%");

        this.color = d3.scaleQuantize()
            .domain([0, 100])
            .range(["#ffffff", "#e6f7ff", "#b3e6ff", "#99ddff", "#66ccff", "#4dc3ff", "#1ab2ff", "#0077b3", "#004466"]);

        this.months = [];

        this.month_strings = ["January", "February", "March"];
    }

    drawDatePicker() {
        const that = this;

        // Create and add Month objects that correspond with the dataset
        this.months.push(new Month("March", new Date(2013, 2, 1)));
        this.months.push(new Month("April", new Date(2013, 3, 1)));
        this.months.push(new Month("May", new Date(2013, 4, 1)));
        this.months.push(new Month("June", new Date(2013, 5, 1)));
        this.months.push(new Month("July", new Date(2013, 6, 1)));
        this.months.push(new Month("August", new Date(2013, 7, 1)));
        this.months.push(new Month("September", new Date(2013, 7, 1)));

        // Create the overall SVG that will contain the entire calendar
        const svg = d3.select("#date-div")
            .selectAll("svg")
            .data([2013])
            .enter().append("svg")
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
            .attr("transform", (d, i) => `translate(-10, ${this.cellSize}) rotate(-90)`)
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
                        return d3.timeDays(new Date(2013, 2, 1), new Date(2013, 3, 1));
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
                        return d3.timeDays(new Date(2013, 8, 1), new Date(2013, 9, 1));
                }
            });

        const formatDate = d3.timeFormat("%b-%d-%y");

        // Create a group for each day of the month
        const gRects = g.enter()
            .append("g")
            .attr("class", "date-group")
            .attr("transform", function (d) {
                const x = d.getDay() * that.cellSize;
                const y = (d3.timeWeek.count(d3.timeMonth(d), d) * that.cellSize);
                return "translate(" + x + "," + y + ")";
            })
            .on("click", d => {
                gRects.select("rect").classed("selected", false);
                d3.select(`#${formatDate(d)}-rect`).classed("selected", true);
            });

        // Add a rectangle to each corresponding group that represents a single day
        gRects.append("rect")
            .attr("id", d => {
                return formatDate(d) + "-rect";
            })
            .attr("width", this.cellSize)
            .attr("height", this.cellSize)
            .attr("class", d => (Date.parse(d) === Date.parse(new Date(2013, 2, 1)) ? "date-rect selected" : "date-rect"))
            .attr("rx", 4)
            .attr("ry", 4)
            .datum(d3.timeFormat("%Y-%m-%d"));

        // Add the text for the date of the corrsponding day in the single month
        gRects.append("text")
            .text(function (d) {
                return d.getDate();
            })
            .attr("class", "date-text")
            .attr("x", this.cellSize / 2)
            .attr("y", this.cellSize / 2);

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

        /*const start_box = svg.append("rect")
            .attr("x", 225)
            .attr("y", 45)
            .attr("width", this.cellSize)
            .attr("height", this.cellSize)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .style("fill", "#FFD700");*/
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