
d3.csv("data/AWS_Honeypot_marx-geo.csv").then(attacksCSV => {
    // Use D3 for converting strings to Dates
    const parseDateTime = d3.timeParse("%m/%d/%y %H:%M");
    const formatDate = d3.timeFormat("%-m/%-d/%y");

    function selectedDateChanged(newDate)
    {
        datePicker.updateDatePicker();
        worldMap.updateDate(newDate);
        timeSlider.updateDate(newDate);
    }

    // Process the CSV and convert the values to the appropriate type
    const processedAttacksCSV = attacksCSV.map(attack => {
        // Convert the datetime to a Date object
        attack.datetime = parseDateTime(attack.datetime);

        // Convert the latitude and longitude into floating point types
        attack.latitude = +attack.latitude;
        attack.longitude = +attack.longitude;

        return attack;
    });

    // Aggregate the dataset by the date
    const aggregatedDatesAttacksCSV = d3.nest()
        .key(d => {
            return new Date(formatDate(d.datetime));
        })
        .entries(processedAttacksCSV);

    const aggregatedCountriesAttacksCSV = d3.nest()
        .key(d => {
            return d.country;
        })
        .entries(processedAttacksCSV);

    const aggregatedDatesAttacksMap = new Map();

    for (let attackDate of aggregatedDatesAttacksCSV)
        aggregatedDatesAttacksMap.set(formatDate(new Date(attackDate.key)), attackDate.values);

    const datePicker = new DatePicker(aggregatedDatesAttacksCSV, selectedDateChanged);
    datePicker.drawDatePicker();

    const timeSlider = new TimeSlider(aggregatedDatesAttacksCSV, datePicker);
    timeSlider.drawTimeSlider();

    const worldMap = new WorldMap(aggregatedDatesAttacksMap, aggregatedCountriesAttacksCSV, datePicker);
   
    d3.json("data/world.json").then(mapData => {
        worldMap.drawMap(mapData);
    });
})