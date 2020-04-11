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
    makeTable(data);
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
        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
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
  table = $('#table').attr('class', 'table table-hover');
  table.append('<thead></thead>');
  thead = $('#table thead');
  thead.append('<th colspan="2">Medical School COVID-19 Responses</th>')
  //
  // ['school-info', 'school-initiatives'].forEach(function(d) {
  //   thead.append(`<th class=${d}></th>`).attr('scope', 'col');
  // });
  table.append('<tbody></tbody>');
  tbody = $('#table tbody');
  data.forEach(function(d) {
    tbody.append(schoolRows(d));
  })
}

var initiativeNames = {
  directPatientCare: 'Direct patient care',
  remoteCare: 'Remote patient care',
  nonClinical: 'Non-clinical initiatives',
  healthcareWorker: 'Healthcare worker support initiatives',
  commOutreach: 'Community outreach programs',
  medSchool: 'Administrative decisions',
  cov19Ed: 'COVID-19 education'
};

var adminDecisions = {
  medSchoolClinRot: 'Allowing clinical rotations',
  medSchoolSubIntern: 'Allowing medicine sub-internships',
  medSchoolAwayRot: 'Allowing away rotations',
  medSchoolEarlyGrad: 'Planning to offer early graduation',
  medSchoolEarlyGradWhen: 'Graduating',
  medSchoolWellness: 'Mental wellness supports for student body',
};

var initiativeQuestions = {
  directPatientCare: 'Does your task force coordinate any of the following in-person patient care-related opportunities for medical students?',
  remoteCare: 'Does your task force coordinate any of the following remote (virtual only) patient care-related opportunities for medical students?',
  nonClinical: 'Does your task force coordinate any other opportunities that do not involve clinical care?',
  healthcareWorker: 'Does your task force coordinate any of the following initiatives supporting healthcare workers in the community?',
  commOutreach: 'Does your task force coordinate any of the following community outreach programs?',
  medSchoolClinRot: 'Is your medical school currently allowing clinical rotations?',
  medSchoolSubIntern: 'Is your medical school currently allowing medicine sub-internships?',
  medSchoolAwayRot: 'Is your medical school currently allowing away rotations?',
  medSchoolEarlyGrad: 'Is your medical school planning to offer early graduation?',
  medSchoolEarlyGradWhen: 'If your school is graduating students early, when?',
  medSchoolWellness: 'Are there any mental wellness support measures in place for the student body?',
  cov19Ed: 'Has your medical school faculty or administration distributed COVID19 education materials to the student body?',
  cov19EdKind: 'What kind of materials are you using to learn about COVID19?',
  otherInfo: 'If is there any additional information you would like to share with our team regarding your COVID19 task force or any of the initiatives at school? please share below.',
  advocacy: 'Is your task force involved in any advocacy initiatives?'
};

function schoolRows(d) {
  var res = [],
      name = d["If USA, which school are you representing?"],
      city = d["City of main medical school campus"],
      state = d["If USA, in which state is your medical school?"],
      website = d["If your task force has a website, please write the address."],
      contact = d["Who is the best point of contact (name and email) for your task force for any communication going forward?"],
      instagram = `IG: ${d["If your task force has an Instagram account, please write the handle."]}`;

  // School name and city
  var header = makeRowTh([name, `${city}, ${state}`]);
  res.push(header);

  // Contact info
  var contacts = [website, contact, instagram];
  contacts = contacts.join('<br/>');
  var contactInfo = makeRowTd(["Contact information", contacts]);
  res.push(contactInfo);

  // Getting info for each field on questionnaire
  var rows = getSchoolInitiatives(d);
  res.push(rows);

  // Getting info on admin decisions
  var adminDecisions = getAdminDecisions(d);
  res.push(adminDecisions);

  // Process into html element
  res = res.join('');
  return res;
}

function getSchoolInitiatives(d) {
  return getRowGroup(d, initiativeNames, initiativeQuestions);
}

function getAdminDecisions(d) {
  return getRowGroup(d, adminDecisions, initiativeQuestions);
}

function getRowGroup(d, names, questions) {
  var res = [];
  for (var e in names) {
    var q = questions[e],
        resp = d[q];
    if (!((resp === "") || (resp === undefined))) {
      var decName = names[e],
          decRow = makeRowTd([decName, resp]);
      res.push(decRow);
    }
  }
  return res.join('');
}

function makeRow(cells, rowType) {
  var res = ['<tr>'];
  cells.forEach((d, i) => {
    var toAdd;
    if (i > 0) {
      var contents = d.replace(/;\w*/g, '</li><li>');
      toAdd = `<ul><li>${contents}</li></ul>`;
    } else {
      toAdd = d;
    }
    res.push(`<${rowType} class="col-${i}">${toAdd}</${rowType}>`)
  });
  res.push('</tr>');
  return res.join('')
}

function makeRowTd(cells) {
  return makeRow(cells, 'td');
}
function makeRowTh(cells) {
  return makeRow(cells, 'th');
}
