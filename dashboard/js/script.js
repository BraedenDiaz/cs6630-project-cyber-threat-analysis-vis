
d3.csv("data/AWS_Honeypot_marx-geo.csv").then(attacksCSV => {

    // Use D3 for converting strings to Dates
    const parseDateTime = d3.timeParse("%m/%d/%y %H:%M");
    const parseDate = d3.timeParse("%m/%d/%y");
    const parseTime = d3.timeParse("%H:%M");

    function selectedDateChanged(newDate)
    {
        worldMap.updateDate(newDate);
    }

    function selectedTimeChanged(newTime)
    {

    }

    // Process the CSV and convert the values to the appropriate type
    const processedAttacksCSV = attacksCSV.map(attack => {
        // Convert the dates and times to Date objects
        attack.date = parseDate(attack.datetime.split(' ')[0]);
        attack.time = parseTime(attack.datetime.split(' ')[1]);
        attack.datetime = parseDateTime(attack.datetime);

        // Convert the latitude and longitude into floating point types
        attack.latitude = +attack.latitude;
        attack.longitude = +attack.longitude;

        return attack;
    });

    // Aggregate the dataset by the date
    const aggregatedDatesAttacksCSV = d3.nest()
        .key(d => {
            return d.date;
        })
        .entries(processedAttacksCSV);

    const datePicker = new DatePicker(aggregatedDatesAttacksCSV, selectedDateChanged);
    datePicker.drawDatePicker();

    const timeSlider = new TimeSlider(aggregatedDatesAttacksCSV, datePicker, selectedTimeChanged);
    timeSlider.drawTimeSlider();

    const worldMap = new Map(aggregatedDatesAttacksCSV, datePicker);
   
    d3.json("data/world.json").then(mapData => {
        worldMap.drawMap(mapData);
    });
})