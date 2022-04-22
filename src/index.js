'use strict';

const xmlbuilder = require('xmlbuilder2');
const trackpoints = require('./trackpoints.js');

const now = new Date();

let root = xmlbuilder.create({ version: '1.0', encoding: "UTF-8"  })
    .ele('gpx')
        .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        .att('xmlns', 'http://www.topografix.com/GPX/1/1')
        .att('xsi:schemaLocation', 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd http://www.topografix.com/GPX/gpx_style/0/2 http://www.topografix.com/GPX/gpx_style/0/2/gpx_style.xsd')
        .att('xmlns:gpxtpx', 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1')
        .att('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3')
        .att('xmlns:gpx_style', 'http://www.topographix.com/GPX/gpx_style/0/2')
        .att('version', '1.1')
        .ele('metadata')
            .ele('name')
                .txt('')
            .up()
        .up()
        .ele('trk')
            .ele('name')
                .txt('TODO')
            .up()
            .ele('type')
                .txt('Cycling')
            .up()
            .ele('trkseg');

trackpoints.forEach((p) => {
    root = root.ele('trkpt')
        .att('lat', p.lat)
        .att('lon', p.lng)
        .ele('ele')
            .txt(p.elevation)
            .up()
        .ele('time')
            .txt((new Date(now.getTime() + (Number(p.timedelta_micro) / 1000))).toISOString())
            .up()
        .up()
});
root = root
            .up()
        .up()
    .up()
    .end({pretty: true});
console.log(root.toString());

function saveFile(filename, data, type) {
    // https://stackoverflow.com/a/46819159
    const blob = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

saveFile('ride-to-glory.gpx', root.toString(), 'application/gpx+xml');
