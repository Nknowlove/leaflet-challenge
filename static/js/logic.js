// Create the map object
let myMap = L.map("map", {
    center: [27.96044, -82.30695],
    zoom: 7
});

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store the API endpoint as queryUrl
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Function to determine the marker size based on magnitude
    function markerSize(magnitude) {
        return magnitude * 4;  // Scale the marker size
    }

    // Create a GeoJSON layer
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            let depth = feature.geometry.coordinates[2];
            let magnitude = feature.properties.mag;

            return L.circleMarker(latlng, {
                radius: markerSize(magnitude),
                fillColor: chooseColor(depth),
                color: "#000", // Marker outline color
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<h3>Location: ${feature.properties.place}</h3>
                <hr>
                <p>${new Date(feature.properties.time)}</p>
                <br><h2>Magnitude: ${magnitude}</h2>
                <h2>Depth: ${depth} km</h2>`);
        }
    });

    // Add the GeoJSON layer to the map
    earthquakes.addTo(myMap);

    // Create the legend
    createLegend();
}

// Function to determine the marker color based on depth
function chooseColor(depth) {
    if (depth > 90) return "#FF0000";  // Red
    else if (depth > 70) return "#FF4500"; // Orange-Red
    else if (depth > 50) return "#FF8C00"; // Orange
    else if (depth > 30) return "#FFA500"; // Light Greenish
    else if (depth > 10) return "#EEE8AA"; // Green
    else return "#ADFF2F"; // Light Green
}

// Create the legend
function createLegend() {
    var legend = L.control({position: "bottomright"});

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
            depth = [-10, 10, 30, 50, 70, 90]; // Depth intervals

        div.innerHTML += "<h3 style='text-align: center'>Depth (km)</h3>";

        // Loop through the depth intervals to create legend entries
        for (var i = 0; i < depth.length - 1; i++) {
            div.innerHTML += 
                '<i style="background:' + chooseColor(depth[i + 1]) + '"></i> ' +  // Use the upper limit for color
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }

        return div; // Return the completed legend
    };

    legend.addTo(myMap); // Add the legend to the map
}
