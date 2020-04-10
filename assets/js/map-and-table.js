console.log("We did it");

//********** Loading Data ***********//

// $.getScript("https://apis.google.com/js/api.js", function(data, textStatus, jqxhr) {
//   console.log("Loaded google sheets API");
//
//   var clientId = '847799223129-gn1uib4fdqf8ni9qbitgs19uas01u3b7.apps.googleusercontent.com',
//       apiKey = 'AIzaSyDjrMQHPhyYBk1KoPl50B6stlt9Td_ztNQ',
//       discoveryDocs = ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
//       scopes = "https://www.googleapis.com/auth/spreadsheets.readonly";
//
//   gapi.load('client:auth2', function() {
//     gapi.client.init({
//       apiKey: apiKey,
//       clientId: clientId,
//       discoveryDocs: discoveryDocs,
//       scopes: scopes
//     }).then(function() {
//       gapi.auth2.getAuthInstance().isSignedIn.listen(function(isSignedIn) {
//         if (isSignedIn) {
//           getData();
//         }
//       })
//     });
//   })
//
//   function getData() {
//     gapi.client.sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: "A1:AH3"
//     }).then(resp => {
//       var result = resp.result;
//       console.log(result);
//     })
//   }
// });
//
//
// var spreadsheetId = '1qklx8i0bK1Uim6RJISaskjYZEsErxwCyLXB4q4aa_zc',
//     sheetId = '480173839';

$.getScript("https://d3js.org/d3.v5.min.js", function() {
  d3.csv("data/medschool-data.csv").then(function(data) {
    console.log(data);

    data.forEach(function(d) {
      d.Timestamp = new Date(d.Timestamp);
      d.size = +d["Approximately how many students are on your COVID19 task force? "];
      d.lat = +d.lat;
      d.lon = +d.lon;
    });

    loadLeafletAndDrawMap(data);
    // makeTable(data);
  });
})


//*************** MAP ***************//
function loadLeafletAndDrawMap(data) {
// Using leaflet.js
  $('head').append('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"\n' +
      '   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="\n' +
      '   crossorigin=""/>');

  $.getScript("https://unpkg.com/leaflet@1.6.0/dist/leaflet.js", function(data, textStatus, jqxhr) {
    drawMap();
  });

  function drawMap() {
    console.log("Loaded leaflet.js");

    var harvardMed = [42.3356352, -71.1041786];
    var medMap = L.map('map').setView(harvardMed, 4);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 15,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiYmVubGV2eXgiLCJhIjoiY2s4dG5mcjRjMDI1NDNmbzM2ZDM4YndhZyJ9.llL2JU0MdARpMvjAjgybpA'
    }).addTo(medMap);

    // Parsing data as GeoJSON
    var geoData = data
        .filter(d => d["Email Address"] !== "")
        .map(function(d) {
      return {
        "type": "Feature",
        "properties": {
          "name": d["If USA, which school are you representing?"],
          "city": d["City of main medical school campus"],
          "size": d.size,
          "website": d["If your task force has a website, please write the address."],
          "contact": d["Who is the best point of contact (name and email) for your task force for any communication going forward?"]
        },
        "geometry": {
          "type": "Point",
          "coordinates": [d.lon, d.lat]
        }
      }
    });
    console.log(geoData);

    pointStyle = {
      radius: 8,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };

    function onEachFeature(feature, layer) {
      if (feature.properties) {
        if (feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
        } else {
          layer.bindPopup(feature.properties.name);
        }
      }
    }

    L.geoJSON(geoData, {
      pointToLayer: function(feature, latlon) {
        return L.circleMarker(latlon, pointStyle);
      },
      onEachFeature: onEachFeature
    }).addTo(medMap);
  }


}


//************** TABLE **************//
function makeTable(data) {

}