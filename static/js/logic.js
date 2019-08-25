// Store our API endpoint USGS +2.5 magnitude earthquakes for the last 30days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// map of tectonic plates in GeoJSON format
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log(data.features)
  console.log(data.features[0].geometry.coordinates)
  d3.json(platesUrl, function(data2) { 
    console.log(data2.features[0].geometry.coordinates) //[0][0]

    // get plate lat, lng (format output = (lng, lat))
    var plateCoordinates = [];
    for (var j = 0; j < data2.features.length; j++) {
      var latLngPairs = [];
      for (var k = 0; k < data2.features[j].geometry.coordinates.length; k++) {
        latLngPairs.push([data2.features[j].geometry.coordinates[k][1], data2.features[j].geometry.coordinates[k][0]])
      }
      plateCoordinates.push(latLngPairs)
    }
    console.log(plateCoordinates)

    // Define variables for our base layers (dark map and streetmap)
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });

    var pirates = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.pirates",
      accessToken: API_KEY
    });

    var highContrast = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.high-contrast",
      accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });

    // select colors for circles and legend from https://leafletjs.com/examples/choropleth/
    function getColor(d) {
      return d > 5 ? '#BD0026' :
            d > 4 ? '#E31A1C' :
            d > 3 ? '#FC4E2A' :
            d > 2 ? '#FD8D3C' :
            d > 1 ? '#FEB24C' :
                    '#FED976';
    }

    // scaling factor to make circles visible and reduce overlap
    function markerSize(earthquake_mag) {
      return earthquake_mag * 15000;
    }

    var magMarkers = [];

    for (var i = 0; i < data.features.length; i++) {
      magMarkers.push(
        L.circle([+data.features[i].geometry.coordinates[1], +data.features[i].geometry.coordinates[0]], {
            //stroke: false,
            fillOpacity: 0.6,
            color: getColor(+data.features[i].properties.mag),
            fillColor: getColor(+data.features[i].properties.mag),
            radius: markerSize(+data.features[i].properties.mag)
        }).bindPopup("<h4>" + data.features[i].properties.place + "</h4> <hr> <p>Significance Rating: " + data.features[i].properties.sig  + "</p> <hr> <p>Earthquake Depth(km): " +  data.features[i].geometry.coordinates[2] + "</p> <hr> <p>Earthquake Magnitude: " + data.features[i].properties.mag + "</p>")
      ) 
    }

    // Fault lines for loop
    var faultMarkers = [];

    console.log(plateCoordinates[0][1], plateCoordinates[0][0])

    for (var m = 0; m < plateCoordinates.length; m++) {
      faultMarkers.push(
        L.polyline(plateCoordinates[m], {
            color: "#86c4be",
        }).bindPopup("<h4>" + data2.features[m].properties.Name + "</h4>")
      ) 
    }
    
    console.log(faultMarkers)

    // HEAT MAP
    var heatArray = [];

    for (var w = 0; w < data.features.length; w++) {
        heatArray.push([data.features[w].geometry.coordinates[1], data.features[w].geometry.coordinates[0]]);
    }
  
    var heat = L.heatLayer(heatArray, {
      radius: 20,
      blur: 35
    })

    
    // layer groups earthquakes / fault lines
    var earthquakeMag = L.layerGroup(magMarkers);
    var faults = L.layerGroup(faultMarkers);
    var hotinHere = L.layerGroup(heat);
    
    // Create a baseMaps object
    var baseMaps = {
      "Street Map": streetmap,
      "Light Map": lightmap,
      "Satellite": satellite,
      "Pirates": pirates,
      "High Contrast": highContrast,
      "Dark Map": darkmap,
     
    };

    // Create an overlay object
    var overlayMaps = {
      "Earthquake Magnitude": earthquakeMag,
      "Earthquake Heat Map": hotinHere,
      "Plate Boundaries": faults,
    };

    // Define a map object
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 3.5,
      layers: [darkmap, earthquakeMag, faults]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {      
      collapsed: false
    }).addTo(myMap);



    // add colored legend to map adapted from https://leafletjs.com/examples/choropleth/
    var legend = L.control({position: 'bottomright'});



    legend.onAdd = function () {

      var div = L.DomUtil.create('div', 'info legend'),
      mags = [0, 1, 2, 3, 4, 5]

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(mags[i] + 1)  + '"></i> ' +
                mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
        }

      return div;
    };

    legend.addTo(myMap);
  })


});

