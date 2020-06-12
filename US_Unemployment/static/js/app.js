var censusdata;
var claimsdata;
var mapsPlaceholder = [];
var layerReference = [];
var GeoJSONlayerReference;
var controlLayers;

var darkmap;
var ligthmap;

var overlayMaps;
var baseMaps;

function buildFeaturePopup(feature) {
    selectedYear = d3.select("#selYear").node().value;
    selectedState = feature.properties.name;
    let census = censusdata.filter(rec => (rec.state == selectedState) && (rec.year == selectedYear))
    let census_string = "<br>"
    if (Array.isArray(census) && census.length) {
        census_string = "Population Estimate : " + census[0].value.toLocaleString() + "<br>";
    }
    yearly_claims = "Annual Inital Claims : " + calculateYearlyClaim(feature).toLocaleString() + "<br>";;
    // console.log(census.value)
    return "<h3>" + feature.properties.name + "</h3>"
        // + '<div id="unemp_rate_chart_'+selectedState+'"  style="width: 200px; height: 200px;"></div>'
        +
        '<div id="unemp_rate_chart_' + selectedState + '"  style="width: 250px; height: 250px;"></div>' +
        "Population Density: <b>" + feature.properties.density + "</b><br>" +
        census_string +
        yearly_claims + "Year : <b> " + selectedYear + "</b>"
}

function buildUnemploymentChart(e) {
    let feature = e.target.feature;

    selectedYear = d3.select("#selYear").node().value;
    selectedState = feature.properties.name;

    function filterstateyear(row) {
        return (row.state == selectedState) && (row.year == selectedYear)
    }
    let filterdata = claimsdata.filter(filterstateyear);
    let trace = {
        type: 'scatter',
        x: filterdata.map(val => val.year_month),
        y: filterdata.map(val => val.unemployment_rate),
    }
    var data = [trace];
    var layout = {
        'xaxis': {
            'showgrid': true,
            'visible': true,
            'showticklabels': false,
            'gridwidth': 2,
            'nticks': 12
        },
        'yaxis': {
            'showgrid': true,
            'visible': true,
            'gridwidth': 2,
            'showticklabels': false
        },
        // width:500,
        // height:500,
        //        autosize:true,
        title: "Unemployment Rate",
        showlegend: false
    }
    Plotly.newPlot('unemp_rate_chart_' + selectedState, data, layout, { displayModeBar: false })
}

function creategeoJSONLayer(data) {
    function onEachFeature(feature, layer) {
        layerReference.push(layer)
        layer.bindPopup(buildFeaturePopup(feature))
        layer.on('popupopen', function(e) {
            buildUnemploymentChart(e)
        })
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const stategeojson = L.geoJSON(data, {
        onEachFeature: onEachFeature
    });
    return stategeojson;
}


function calculateYearlyClaim(feature) {
    let selectedYear = d3.select("#selYear").node().value;
    let selectedState = feature.properties.name;

    function filterstateyear(row) {
        return (row.state == selectedState) && (row.year == selectedYear)
    }
    let filterdata = claimsdata.filter(filterstateyear);
    const reducer = (accumulator, item) => {
        return accumulator + item.initial_claim;
    };
    const totalclaims = filterdata.reduce(reducer, 0)
    return totalclaims
}


function setSelectedIndex(s, v) {
    for (var i = 0; i < s.options.length; i++) {
        if (s.options[i].text == v) {
            s.options[i].selected = true;
            return;
        }
    }
}


function choroplethJSONLayer(data) {
    function onEachFeature(feature, layer) {
        layerReference.push(layer)
        layer.bindPopup(buildFeaturePopup(feature))
        layer.on('popupopen', function(e) {
            buildUnemploymentChart(e)
        })
        layer.on('click', function(e) {
            let selectedState = feature.properties.name;
            let n = d3.select("#selState").node()
            setSelectedIndex(n, selectedState)
            UpdateDisplayState();
            console.log('Layer clicked!', e);
        })
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const stategeojson = L.choropleth(data, {
        valueProperty: 'TotalClaims',
        // scale: ['SkyBlue', 'Navy'],
        scale: ['#F1EEF6', '034E7B'],

        steps: 7,
        mode: 'q',
        style: {
            color: '#fff',
            weight: 2,
            fillOpacity: 0.8
        },
        onEachFeature: onEachFeature
    });
    return stategeojson;
}

function createFeatures(data) {
    //    stategeojson=creategeoJSONLayer(data)
    stategeojson = choroplethJSONLayer(data)
    GeoJSONlayerReference = stategeojson;
    // Sending our earthquakes layer to the createMap function
    createMap(stategeojson);
}

function legend_for_choropleth_layer(layer, name, units, id) {
    // Code from 
    // http://blog.rtwilson.com/automatically-generating-a-legend-for-a-choropleth-layer-in-leaflet/

    // Generate a HTML legend for a Leaflet layer created using choropleth.js
    //
    // Arguments:
    // layer: The leaflet Layer object referring to the layer - must be a layer using
    //        choropleth.js
    // name: The name to display in the layer control (will be displayed above the legend, and next
    //       to the checkbox
    // units: A suffix to put after each numerical range in the layer - for example to specify the
    //        units of the values - but could be used for other purposes)
    // id: The id to give the <ul> element that is used to create the legend. Useful to allow the legend
    //     to be shown/hidden programmatically
    //
    // Returns:
    // The HTML ready to be used in the specification of the layers control
    var limits = layer.options.limits;
    var colors = layer.options.colors;
    var labels = [];

    // Start with just the name that you want displayed in the layer selector
    var HTML = name

    // For each limit value, create a string of the form 'X-Y'
    limits.forEach(function(limit, index) {
        if (index === 0) {
            var to = parseFloat(limits[index]).toFixed(0);
            var range_str = "< " + to;
        } else {
            var from = parseFloat(limits[index - 1]).toFixed(0);
            var to = parseFloat(limits[index]).toFixed(0);
            var range_str = from + "-" + to;
        }

        // Put together a <li> element with the relevant classes, and the right colour and text
        labels.push('<li class="sublegend-item"><div class="sublegend-color" style="background-color: ' +
            colors[index] + '">&nbsp;</div> ' + range_str + units + '</li>');
    })

    // Put all the <li> elements together in a <ul> element
    HTML += '<ul id="' + id + '" class="sublegend">' + labels.join('') + '</ul>';

    return HTML;
}



function createMap(stategeojson) {
    // Define tileLayers
    lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors," +
            "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>," +
            " Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/light-v10", // https://docs.mapbox.com/api/maps/#static-tiles
        accessToken: API_KEY
    });
    darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors," +
            "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>," +
            " Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/dark-v10", // https://docs.mapbox.com/api/maps/#static-tiles
        accessToken: API_KEY
    });
    L.Map.addInitHook(function() {
        mapsPlaceholder.push(this); // Use whatever global scope variable you like.
    });
    // Define a baseMaps object to hold our base layers
    baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap
    };
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        // layers: [lightmap, stategeojson]
        layers: [lightmap, stategeojson]
    });

    // Create overlay object to hold our overlay layer
    overlayMaps = {
        [legend_for_choropleth_layer(stategeojson, 'Annual Initial Claims', '', 'legend_IMD')]: stategeojson
    };

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    controlLayers = L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
        position: 'bottomright'
    }).addTo(myMap);
}

function loadDropDown(dropPick, columns, defaultOptionName) {
    let selectOpt = d3.select(dropPick);
    let options = selectOpt.selectAll("option")
        .data(columns)
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });
    options.property("selected", function(d) { return d === defaultOptionName })

}

function loadStates(data) {
    let columns = []
    data.forEach(element => {
        columns.push(element.properties.name)
    });
    loadDropDown('#selState', columns.sort(), 'Texas')
}

function loadYears() {
    let columns = ['2015', '2016', '2017', '2018', '2019', '2020']
    loadDropDown('#selYear', columns, columns[columns.length - 1])
}

function updateGEOJSON() {
    statesData.features.forEach(element => {
        element.properties['TotalClaims'] = calculateYearlyClaim(element)
    })
}

function recreateMap() {
    let mymap = mapsPlaceholder[0];
    mymap.closePopup();
    mymap.removeLayer(GeoJSONlayerReference);
    controlLayers.removeLayer(darkmap);
    controlLayers.removeLayer(lightmap);
    controlLayers.removeLayer(GeoJSONlayerReference);
    controlLayers.remove(mymap);
    layerReference = [];
    updateGEOJSON();
    stategeojson = choroplethJSONLayer(statesData)
    GeoJSONlayerReference = stategeojson;
    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        [legend_for_choropleth_layer(stategeojson, 'Annual Initial Claims', '', 'legend_IMD')]: stategeojson
    };
    GeoJSONlayerReference.addTo(mymap);
    controlLayers = L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
        position: 'bottomright'
    }).addTo(mymap);

}
// Called when the year changes
function UpdateDisplay() {

    recreateMap();
    reloadlayers();
    updateChart();
}

function updateChart() {

    selectedState = d3.select("#selState").node().value;
    selectedYear = d3.select("#selYear").node().value;

    var filteredData = claimsdata.filter(val => {
        return val.state === selectedState && val.year === selectedYear

    })
    var trace = {
        type: "bar",
        x: filteredData.map(val => val.year_month),
        y: filteredData.map(val => val.initial_claim),
        marker: {
            color: ["#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B", "#034E7B"]
        },
    }
    var data = [trace];
    var layout = {
        title: `<b>${selectedState} ${selectedYear} - Initial Unemployment Claims </b>`,
        plot_bgcolor: "#e8e8e8",
        fontsize: 18,
        family: 'Helvetica',
        width: 550,
        height: 450,
        margin: { t: 80, b: 80, r: 2 },
        xaxis: {
            tickangle: -45,
        },
        yaxis: {
            autotick: true,
            ticks: 'outside',
            tick0: 0,
            ticklen: 8,
            tickwidth: 2,
            tickcolor: '#000',
            showgrid: false,
        },

    }
    Plotly.newPlot("bar", data, layout);
}


//. Called when the state changes
function UpdateDisplayState() {
    // reload the map tool tip data
    //    reloadlayers();

    updateChart()
}


function reloadlayers() {
    layerReference.forEach(element => {
        const newpopup = buildFeaturePopup(element.feature)
        element.feature.properties
        element._popup.setContent(newpopup)
    });
}

async function init() {
    const url = "/census_data/"
    censusdata = await d3.json(url);
    const url2 = "/unemployment_claims/"
    claimsdata = await d3.json(url2);

    loadStates(statesData.features);
    loadYears();
    updateGEOJSON();
    createFeatures(statesData);
    updateChart()
}

init();

d3.selectAll("#selYear").on("change", UpdateDisplay)
d3.selectAll("#selState").on("change", UpdateDisplayState)