console.log("We did it");

//********** Loading Data ***********//

var CLIENT_ID = '215843568409-98hm18619evi20acvoa5ddcb6gifdkpq.apps.googleusercontent.com',
    API_KEY = 'AIzaSyCLOZgLJJeYpafuLnA9nHQRfl-HoYSpLFM',
    DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var spreadsheetId = '1ZP4ny5UEvOMj8tX-6V7c3aRso0gYrsAocSbb_57MzzY',
    range = "A1:AH20";

// $.getScript("https://apis.google.com/js/api.js", function(data, textStatus, jqxhr) {
//   console.log("Loaded google sheets API");
//
//   function handleClientLoad() {
//     gapi.load('client:auth2', initClient);
//   }
//
//   function initClient() {
//     gapi.client.init({
//       apiKey: API_KEY,
//       clientId: CLIENT_ID,
//       discoveryDocs: DISCOVERY_DOCS,
//       scope: SCOPES
//     }).then(function () {
//       gapi.auth2.getAuthInstance().signIn();
//
//       // Listen for sign-in state changes.
//       gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
//
//       // Handle the initial sign-in state.
//       updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
//     }, function(error) {
//       console.log(JSON.stringify(error, null, 2));
//     });
//   }
//
//   function updateSigninStatus(isSignedIn) {
//     if (isSignedIn) {
//       console.log("Signed in");
//       readData();
//     } else {
//       console.log("Not signed in");
//     }
//   }
//
//   function readData() {
//     gapi.client.sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: range
//     }).then((response) => {
//       var result = response.result;
//       var numRows = result.values ? result.values.length : 0;
//       console.log(`${numRows} rows retrieved.`);
//       console.log(result);
//     });
//   }
//
//   handleClientLoad();
// });

$.getScript("https://d3js.org/d3.v5.min.js", function() {
  // var sheetUrl = 'https://spreadsheets.google.com/feeds/list/1ZP4ny5UEvOMj8tX-6V7c3aRso0gYrsAocSbb_57MzzY/od6/public/basic?alt=json';
  var sheetUrl = 'http://spreadsheets.google.com/tq?tqx=out:csv&tq=select%20*&key=1ZP4ny5UEvOMj8tX-6V7c3aRso0gYrsAocSbb_57MzzY',
      corsUrl = 'https://cors-anywhere.herokuapp.com/';

  d3.csv(corsUrl + sheetUrl).then(function(data) {
    console.log("JSON from sheet");
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

  // d3.csv("data/medschool-data.csv").then(function(data) {
    // console.log(data);
  // });
});


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
  table = $('<table></table>').attr('class', 'table table-hover');
  table.appendTo('#table');
  table.append('<thead></thead>');
  thead = $('#table thead');
  thead.append('<th colspan="2">Medical School COVID-19 Responses (click school for more information)</th>');
  //
  // ['school-info', 'school-initiatives'].forEach(function(d) {
  //   thead.append(`<th class=${d}></th>`).attr('scope', 'col');
  // });
  table.append('<tbody></tbody>');
  tbody = $('#table tbody');
  data.forEach(function(d, i) {
    tbody.append(schoolRows(d, i));
  });

  // $('tr.collapse').on('show.bs.collapse', function() {
  //   $(this).parent('th.clickable').addClass('active');
  // })
  // $('tr.collapse').on('hide.bs.collapse', function() {
  //   $(this).parent('th.clickable').removeClass('active');
  // })
}

var initiativeNames = {
  directPatientCare: 'Direct patient care initiatives',
  remoteCare: 'Remote patient care initiatives',
  nonClinical: 'Other patient care initiatives',
  healthcareWorker: 'Initiatives to support healthcare workers',
  commOutreach: 'Community outreach initiatives',
  medSchool: 'Administrative decisions',
  cov19Ed: 'COVID-19 education',
  cov19EdKind: 'Type of COVID-19 medical education',
  advocacy: 'Advocacy initiatives'
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

function schoolRows(d, i) {
  var res = [],
      name = d["If USA, which school are you representing?"],
      city = d["City of main medical school campus"],
      state = d["If USA, in which state is your medical school?"],
      website = d["If your task force has a website, please write the address."],
      contact = d["Who is the best point of contact (name and email) for your task force for any communication going forward?"],
      instagram = d["If your task force has an Instagram account, please write the handle."],
      facebook = d["If your task force has a Facebook, please write the address. "],
      twitter = d["If your task force has a Twitter account, please write the handle. (ie. @FutureMDvsCOVID)"];

  if (name === "") {
    name = d["If outside of the USA, what is the name of your medical school?"];
  }

  website = `<a href="${website}" target="_blank">${website}</a>`;

  var contacts = [];
  function checkContactInfo(medium, name) {
    if (medium !== "") {
      contacts.push(`${name}: ${medium}`);
    }
  }

  [ [contact, "Contact"],
    [website, "Website"],
    [instagram, "Instagram"],
    [facebook, "Facebook"],
    [twitter, "Twitter"]
  ].forEach(d => checkContactInfo(d[0], d[1]));
  contacts = contacts.join(';');

  // School name and city
  var header = makeRowTh([name, `${city}, ${state}`], i);
  res.push(header);

  // Contact info
  // var contacts = [website, contact, instagram, facebook, twitter].filter(d => d !== "");
  // contacts = contacts.join('<br/>');
  var contactInfo = makeRowTd(["Contact information", contacts], i);
  res.push(contactInfo);

  // Getting info for each field on questionnaire
  var rows = getSchoolInitiatives(d, i);
  res.push(rows);

  // Getting info on admin decisions
  var adminDecisions = getAdminDecisions(d, i);
  res.push(adminDecisions);

  // Process into html element
  res = res.join('');
  return res;
}

function getSchoolInitiatives(d, i) {
  return getRowGroup(d, initiativeNames, initiativeQuestions, i);
}

function getAdminDecisions(d, i) {
  return getRowGroup(d, adminDecisions, initiativeQuestions, i);
}

function getRowGroup(d, names, questions, i) {
  var res = [];
  for (var e in names) {
    var q = questions[e],
        resp = d[q];
    if (!((resp === "") || (resp === undefined))) {
      var decName = names[e],
          decRow = makeRowTd([decName, resp], i);
      res.push(decRow);
    }
  }
  return res.join('');
}

function makeRow(cells, rowType, rowClass) {
  var res;
  if (rowClass !== undefined) {
    res = [`<tr class=${rowClass}>`];
  } else{
    res = ['<tr>'];
  }
  cells.forEach((d, i) => {
    var toAdd;
    if (i > 0) {
      var contents = d.replace(/;\s*/g, '</li><li>');
      toAdd = `<ul><li>${contents}</li></ul>`;
    } else {
      toAdd = d;
    }
    res.push(`<${rowType} class="col-${i}">${toAdd}</${rowType}>`)
  });
  res.push('</tr>');
  return res.join('')
}

function makeRowTd(cells, schoolNum) {
  var row = $(makeRow(cells, 'td', `collapse`));
  row.addClass(`school-${schoolNum}`);
  return row.prop('outerHTML');
}
function makeRowTh(cells, schoolNum) {
  var row = $(makeRow(cells, 'th', 'clickable'));
  row.attr('data-toggle', 'collapse').attr('data-target', `.school-${schoolNum}`);
  return row.prop('outerHTML');
}
