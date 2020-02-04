// ******** RUN THESE ON PAGE LOAD ************

// select testID subject control on page
dataset_selection_control = d3.select("#selDataset");

load_subjects();
update_page();

// listen for change test subject change, and then run update_page when a change occurs 
dataset_selection_control.on("change", update_page);

// ******** The following functions pull data from the csv and bind it to the page

function load_subjects() {
    d3.json("data/samples.json").then(data => {
        // get subject_ids from data
        const subject_ids = data.names;

        // bind [subject_ids] to #selDataset, get list of all participants in the study, 
        // and then add each [subject_ids] to dropdown menu
        dataset_selection_control.selectAll("option")
            .data(subject_ids)
            .enter()
            .append("option")
            .attr("value", (d) => d)
            .html((d) => d);
    });
}

function update_page() {
    d3.json("data/samples.json").then(d => {
        // get data from json file 
        const metadata = d.metadata;
        const samples = d.samples;

        // get all belly button washes from the metadata array. This is used for the gauge chart.
        const all_washes = metadata.map(m => m.wfreq);

        // get the average of all belly button washes in the dataset, and round to nearest .5 value. This is used for the gauge chart.
        const avg_washes = roundToHalfNumber(all_washes.reduce((a, b) => a + b, 0) / all_washes.length);

        // get value of the test subject ID node. 
        let selected_id = dataset_selection_control.node().value;

        // in the JSON, selected_id is stored as an int, so we must parseInt on it for the filter
        let metadata_selectedID = metadata.filter(m => {
            return m.id === +selected_id;
        });

        // in the JSON, selected_id is stored as a string, so we just pass the string value to the filter.
        let samples_selectedID = samples.filter(s => {
            return s.id === selected_id;
        });

        build_table(metadata_selectedID[0]);
        build_barchart(samples_selectedID[0]);
        build_bubblechart(samples_selectedID[0]);
        build_gaugechart(metadata_selectedID[0], avg_washes);
    });
}



// ******** The following functions all build the data displayed on the page

// This function rounds numbers to values in .5 increments
function roundToHalfNumber(num) {
    return Math.round(num * 2) / 2;
}


function build_table(metadata_obj) {
    //clear out any table data from previous user selections
    d3.select("#sample-metadata").html("");

    //create new table 
    let table = d3.select("#sample-metadata")
        .append("table")
        .attr("class", "table table-striped table-hover table-responsive")
    let tbody = table.append("tbody");

    //loop through metadata object, and add all key-value pairs to table
    Object.entries(metadata_obj).forEach((k) => {
        let trow = tbody.append("tr");
        trow.append("th").text(`${k[0]}:`);
        trow.append("td").text(k[1]);
    });
};


// default font styles for chart headers
const font_title_style = {
    family: 'Arial',
    size: 14,
    color: "black"
}

function build_barchart(samples_id) {

    // sample values are already sorted from highest to lowest, so we only need to
    // slice the first 10 elements from each of the arrays, and then reverse them,
    // to display the Top 10 OTUs for each test subject.
    let top10_samples = samples_id.sample_values.slice(0, 10).reverse();
    let top10_otu_ids = samples_id.otu_ids.slice(0, 10).map(d => `OTU ${d}`).reverse();
    let top10_otu_labels = samples_id.otu_labels.slice(0, 10).reverse();

    //clear out previous chart data 
    d3.select("#bar").html("");

    let trace = {
        x: top10_samples,
        y: top10_otu_ids,
        type: "bar",
        orientation: "h",
        text: top10_otu_labels
    };

    let layout = {
        title: "Top 10 OTUs for Selected Subject",
        font: font_title_style
    };

    let data = [trace];

    Plotly.newPlot("bar", data, layout)

}

function build_bubblechart(samples_id) {

    //clear out previous chart data 
    d3.select("#bubble").html("");

    let trace = {
        x: samples_id.otu_ids,
        y: samples_id.sample_values,
        mode: 'markers',
        marker: {
            color: samples_id.otu_ids,
            size: samples_id.sample_values
        },
        text: samples_id.otu_labels
    };

    let data = [trace];

    let layout = {
        title: `All Samples for Selected Subject`,
        font: font_title_style
    };

    Plotly.newPlot("bubble", data, layout);

}

function build_gaugechart(metadata_obj, washes) {

    //clear out any table data from previous user selections
    d3.select("#gauge").html("");

    //get wash freq from current subjext
    let wash_freq = metadata_obj.wfreq;

    var data = [{
        domain: {
            x: [0, 1],
            y: [0, 1]
        },
        value: wash_freq,
        title: {
            text: `<b>Washing Frequency for Selected Subject</b><br>Dataset avg: ${washes}/per week`,
            font: font_title_style
        },
        type: "indicator",
        mode: "gauge+number+delta",
        delta: {
            reference: washes
        },
        gauge: {
            axis: {
                range: [null, 9]
            },
            steps: [{
                    range: [0, 1],
                    text: "0-1",
                    color: "#DCDCDC"
                },
                {
                    range: [1, 2],
                    color: "#D3D3D3"
                },
                {
                    range: [2, 3],
                    color: "#C0C0C0"
                },
                {
                    range: [3, 4],
                    color: "#A9A9A9"
                },
                {
                    range: [4, 5],
                    color: "#808080"
                },
                {
                    range: [5, 6],
                    color: "#696969"
                },
                {
                    range: [6, 7],
                    color: "#778899"
                },
                {
                    range: [7, 8],
                    color: "#708090"
                },
                {
                    range: [8, 9],
                    color: "#2F4F4F"
                }

            ],
        }
    }];

    var layout = {
        width: 800,
        height: 650,
        margin: {
            t: 0,
            b: 0
        }
    };
    Plotly.newPlot('gauge', data, layout);

};