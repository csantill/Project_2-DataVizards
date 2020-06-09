
var censusdata;
var claimsdata;
var mapsPlaceholder = [];
var layerReference = [];

function buildFeaturePopup(feature)
{
    selectedYear = d3.select("#selYear").node().value;
    selectedState = feature.properties.name;
    let census = censusdata.filter(rec => (rec.state == selectedState) && (rec.year == selectedYear)  )
    let census_string = "<br>"
    if (Array.isArray(census) && census.length){
        census_string= "Population Estimate : " + census[0].value.toLocaleString() + "<br>";
    }
    console.log(census.value)
    return "<h3>" + feature.properties.name +"</h3><hr><br>"+
           "Population Density: <b>" + feature.properties.density + "</b><br>" +
           census_string +
           "Year : <b> " + selectedYear + "</b>" 
}




function createFeatures(data) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layerReference.push(layer)
         layer.bindPopup(buildFeaturePopup(feature));
     }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const stategeojson = L.geoJSON(data,{
        onEachFeature: onEachFeature
    });
    // Sending our earthquakes layer to the createMap function
    createMap(stategeojson);
}



function createMap(stategeojson) {
    // Define tileLayers
    const lightmap =L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}",{
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,"+
                      "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>,"+
                      " Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id : "mapbox/light-v10", // https://docs.mapbox.com/api/maps/#static-tiles
        accessToken : API_KEY
      });
      const darkmap =L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}",{
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,"+
                      "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>,"+
                      " Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id : "mapbox/dark-v10", // https://docs.mapbox.com/api/maps/#static-tiles
        accessToken : API_KEY
      });        
      L.Map.addInitHook(function () {
        mapsPlaceholder.push(this); // Use whatever global scope variable you like.
      });
    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Street Map": lightmap,
        "Dark Map": darkmap
    };
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [lightmap,stategeojson]
    });

   // Create overlay object to hold our overlay layer
    const overlayMaps = {
        States:stategeojson
    };

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

function loadDropDown(dropPick,columns,defaultOptionName) {
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
    options.property("selected", function(d){return d === defaultOptionName})
       
}

function loadStates(data){
    let columns = []
    data.forEach(element => {
        columns.push(element.properties.name)
    });
    loadDropDown('#selState',columns.sort(),'Texas')
}

function loadYears(){
    let columns = ['2015','2016','2017','2018','2019','2020']
    loadDropDown('#selYear',columns,columns[columns.length-1])
}

function UpdateDisplay()
{
    // reload the map tool tip data
    reloadlayers();
    selectedYear = d3.select("#selYear").node().value;
    selectedState = d3.select("#selState").node().value;
//    selectedState = feature.properties.name;
    
}


function reloadlayers()
{
    let map = mapsPlaceholder.pop();
    //mapsPlaceholder.pop(map);

    layerReference.forEach( element => {
        const newpopup = buildFeaturePopup(element.feature)
        element._popup.setContent(newpopup)
        // console.log(element.properties)
        // console.log("in here")
    });
}

function createChart() {
   let trace = {
    type: "bar",
    x: claimsdata.map(val => val.year_month),
    y: claimsdata.map(val => val.initial_claim)
}
    var data = [trace];
    var layout = {
        title: "claims"
    }
    Plotly.newPlot("bar", data, layout);
}
    

async function init(){
    const url = "/census_data/"
    censusdata = await d3.json(url);
    const url2 = "/unemployment_claims/"
    claimsdata = await d3.json(url2);
    // load_census_data();
    loadStates(statesData.features);
    loadYears();
    createFeatures(statesData.features);
    createChart()
}

init();

d3.selectAll("#selYear").on("change", UpdateDisplay)


