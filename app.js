d3.json("data/samples.json").then(d => {
    // get data from json file 
    const names = d.names;
    const metadata = d.metadata;
    const samples = d.samples;

    dataset_selection = d3.select("#selDataset");

    // bind [names] to #selDataset, get list of all participants in the study, and add to dropdown menu
    dataset_selection.selectAll("option")
        .data(names)
        .enter()
        .append("option")
        .attr("value", (d) => d)
        .html((d) => d);



    dataset_selection.on("change", function () {
        let selected_id = parseInt(dataset_selection.node().value);
        console.log(selected_id)
        let filtered_metadata = metadata.filter(d => {
            return d.id === selected_id;
        });
        build_table(filtered_metadata[0]);

    })


    // run this when page finishes loading
    let selected_id = parseInt(dataset_selection.node().value);
    let filtered_metadata = metadata.filter(d => {
        return d.id === selected_id;
    });
    build_table(filtered_metadata[0]);
});

function build_table(metadata_obj) {
    //clear out any table data from previous user selections
    d3.select("#sample-metadata").html("")

    //create new table 
    let table = d3.select("#sample-metadata").append("table").attr("class", "table table-striped table-hover table-sm")
    let tbody = table.append("tbody")
    //loop through metadata object, and add all key-value pairs to table
    Object.entries(metadata_obj).forEach((k) => {
        let trow = tbody.append("tr");
        trow.append("th").text(k[0]);
        trow.append("td").text(k[1]);
    });
};