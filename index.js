const fs = require('fs'),
      mysql = require('mysql'),
      vars = require('./vars'),
      connection = mysql.createConnection({
        host: vars.MYSQL_HOST,
        user: vars.MYSQL_USER,
        password: vars.MYSQL_PASSWORD,
        database: vars.MYSQL_DATABASE
      });

connection.connect();

const groups = [];

connection.query(`SELECT * FROM ${vars.TOWNS_TABLE}`, (error, results, fields) => {
  if(error) {
    throw error;
  }


  const wstream = fs.createWriteStream(vars.OUTPUT);

  const townMarkers = [];
  for(let i = 0; i < results.length; ++i) {
    const pos = results[i].spawn.split('#');
    townMarkers.push(`
      {
        "pos" : [${parseInt(pos[1])}, ${parseInt(pos[3])}, ${parseInt(pos[2])}],
        "title" : "${results[i].name}"
      }
    `);
  }

  let townMarkerGroup = `
    {
  		"id" : "towns",
  		"name" : "Towns",
  		"icon" : "town.png",
  		"iconSize" : [32, 32],
  		"showDefault" : true,
  		"markers" : {
  			"${vars.TOWNY_WORLD_NAME}" : [
          ${townMarkers.join(',')}
  			],
  		},
  	}
  `;

  groups.push(townMarkerGroup);


  processTownBlocks(() => {
    wstream.write('var MAPCRAFTER_MARKERS = [');
    wstream.write(groups.join(','));
    wstream.write('];');
    wstream.end();
    connection.end();
  });
});

function processTownBlocks(callback) {
  connection.query(`SELECT * FROM ${vars.TOWN_BLOCKS_TABLE}`, (error, results, fields) => {
    const areas = [],
          hash = {};

    for(let i = 0; i < results.length; ++i) {
      hash[results[i].x + '_' + results[i].z] = { x: results[i].x, z: results[i].z };
    }

    let top, left, bottom, right, n, e, s, w, points = [];

    for(const prop in hash) {
      if(hash.hasOwnProperty(prop)) {
        n = hash[hash[prop].x + '_' + (hash[prop].z - 1)];
        e = hash[(hash[prop].x + 1) + '_' + hash[prop].z];
        s = hash[hash[prop].x  + '_' + (hash[prop].z + 1)];
        w = hash[(hash[prop].x - 1) + '_' + hash[prop].z];

        top = hash[prop].z * 16;
        left = hash[prop].x * 16;
        bottom = top + 16;
        right = left + 16;

        if(n && e && s && w) {
          continue;
        } else if(n && e && s) {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          addArea(areas, points);
          //points.push(`{ x: ${right}, z: ${bottom} }`);
          //points.push(`{ x: ${right}, z: ${top} }`);
        } else if(e && s && w) {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${top} }`);
          addArea(areas, points);
          //points.push(`{ x: ${right}, z: ${bottom} }`);
          //points.push(`{ x: ${right}, z: ${top} }`);
        } else if(n && s && w) {
          points = [];
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          addArea(areas, points);
          //points.push(`{ x: ${right}, z: ${bottom} }`);
          //points.push(`{ x: ${right}, z: ${top} }`);
        } else if(n && e && w) {
          points = [];
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          addArea(areas, points);
          //points.push(`{ x: ${right}, z: ${bottom} }`);
          //points.push(`{ x: ${right}, z: ${top} }`);
        } else if(n && s) {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          addArea(areas, points);
          points = [];
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          addArea(areas, points);
        } else if(e && w) {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${top} }`);
          addArea(areas, points);
          points = [];
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          addArea(areas, points);
        } else if(n && e) {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          addArea(areas, points);
        } else if(n && w) {
          points = [];
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          addArea(areas, points);
        } else if(s && e) {
          points = [];
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${left}, z: ${top}}`);
          points.push(`{ x: ${right}, z: ${top} }`);
          addArea(areas, points);
        } else if(s && w) {
          points = [];
          points.push(`{ x: ${right}, z: ${bottom} }`);
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${left}, z: ${top} }`);
          addArea(areas, points);
        } else if(s) {
          points = [];
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          addArea(areas, points);
        }  else if(n) {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          points.push(`{ x: ${right}, z: ${top} }`);
          addArea(areas, points);
        } else if(e) {
          points = [];
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          addArea(areas, points);
        } else if(w) {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          addArea(areas, points);
        } else {
          points = [];
          points.push(`{ x: ${left}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${top} }`);
          points.push(`{ x: ${right}, z: ${bottom} }`);
          points.push(`{ x: ${left}, z: ${bottom} }`);
          points.push(`{ x: ${left}, z: ${top} }`);
          addArea(areas, points);
        }
      }
    }


      const group = `
      {
        "id": "town_areas",
        "name": "Towns Borders",
        "createMarker" : function(ui, groupInfo, markerInfo) {
            var latlngs = [];

            for(var i = 0; i < markerInfo.points.length; ++i) {
              latlngs.push(ui.mcToLatLng(markerInfo.points[i].x, markerInfo.points[i].z, 64));
            }

            return L.polyline(latlngs, {"color" : markerInfo.color});
        },
        "markers" : {
            "world" : [${areas.join(',')}],
        }
      }
      `;

      groups.push(group);

      callback();
  });
}

function addArea(areas, points) {
  areas.push(`{
    "points": [${points.join(',')}],
    "color": "red"
  }`);
}