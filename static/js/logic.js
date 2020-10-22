var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
function displayMap(data, inputData2) {
    // create each feature
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) +
            "</p><br><p>Magnitude: " + feature.properties.mag + "</p>");
    }


    function getColor(mag) {

        if (mag > 5) {
            color = '#FF0000';
        }
        else if (mag > 4) {
            color = '#FF6600';
        }
        else if (mag > 3) {
            color = '#FF9900';
        }
        else if (mag > 2) {
            color = '#FFCC00';
        }
        else if (mag > 1) {
            color = '#00FF00';
        }
        else {
            color = '#99CC00';
        }
        return color
    }
    function createCircles(feature) {
        var mag = feature.properties.mag

        var color = getColor(mag)

        var geojsonMarkerOptions = {
            radius: mag * 3,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], geojsonMarkerOptions);
    }

    // create plate layer

    var faultlines=L.layerGroup();
    L.geoJSON(inputData2, {
        fillOpacity:0
    }).addTo(faultlines);


    // create Layer
    var earthquakes = L.layerGroup();
    L.geoJSON(data, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircles
    }).addTo(earthquakes)


    // create map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v9",
        accessToken: API_KEY
    });
    var satelite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-streets-v9",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satelite": satelite,
        "Outdoors": outdoors,
        "GrayScale": lightmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes
        ,"Fault Lines": faultlines
    };

    var myMap = L.map("map", {
        center: [
            0, 0
        ],
        zoom: 1,
        layers: [lightmap, earthquakes]
    });
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    
    // create Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += '<i style="background: #00FF00"></i><span>0-1</span><br>';
        div.innerHTML += '<i style="background: #FFFF00"></i><span>1-2</span><br>';
        div.innerHTML += '<i style="background: #FFCC00"></i><span>2-3</span><br>';
        div.innerHTML += '<i style="background: #FF9900"></i><span>3-4</span><br>';
        div.innerHTML += '<i style="background: #FF6600"></i><span>4-5</span><br>';
        div.innerHTML += '<i style="background: #FF0000"></i><span>5+</span><br>';
        return div;
    };
    legend.addTo(myMap);
}

d3.json(url, function (response) {
    d3.json('static/data/plates.json', function(plateData){
        displayMap(response.features, plateData.features)
    })
})