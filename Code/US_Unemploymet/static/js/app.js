function createFeatures(data) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    // function onEachFeature(feature, layer) {
    //     layer.bindPopup("<h3>" + feature.properties.place +
    //     "</h3>Magnitude: <b>" + feature.properties.mag + 
    //     "</b><hr><p>"  + new Date(feature.properties.time) + "</p>");
    // }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const stategeojson = L.geoJSON(data);
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

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Street Map": lightmap,
        "Dark Map": darkmap
    };
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [lightmap]
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

    columns = []
    data.forEach(element => {
        columns.push(element.properties.NAME)
    });
    loadDropDown('#selState',columns,columns[0])
}

function loadYears(){
    columns = ['2015','2016','2017','2018','2019','2020']
    loadDropDown('#selYear',columns,columns[0])
}


 function init(){
    // const queryUrl = "/api/states";
    // const data = await d3.json(queryUrl);
    //createMap();
     loadStates(statesData.features);
     loadYears();
     createFeatures(statesData.features);
}

init();


