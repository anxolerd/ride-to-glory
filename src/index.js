'use strict';

const xmlbuilder = require('xmlbuilder2');
const trackpoints = require('./trackpoints.js');
const FLUCTUATION = 0.0001;
const TIME_DRIFT = 1000;


function constructGpxRide(startTime, name, fluctuation_probability) {
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
                    .txt(name)
                .up()
            .up()
            .ele('trk')
                .ele('name')
                    .txt(name)
                .up()
                .ele('type')
                    .txt('Cycling')
                .up()
                .ele('trkseg');

    trackpoints.forEach((p) => {
        let lat = Number(p.lat);
        let lng = Number(p.lng);
        if (Math.random() < fluctuation_probability) {
            lat = lat + Math.random() * FLUCTUATION;
        }
        if (Math.random() < fluctuation_probability) {
            lng = lng + Math.random() * FLUCTUATION;
        }
        let timedelta = p.timedelta_micro;
        if (Math.random() < fluctuation_probability) {
            timedelta = timedelta + (Math.random() * TIME_DRIFT - TIME_DRIFT / 2);
        }
        let time = new Date(startTime.getTime() + (Number(timedelta) / 1000));
        root = root.ele('trkpt')
            .att('lat', lat.toString())
            .att('lon', lng.toString())
            .ele('ele')
                .txt(p.elevation)
                .up()
            .ele('time')
                .txt(time.toISOString())
                .up()
            .up()
    });
    root = root
                .up()
            .up()
        .up()
        .end({pretty: true});
    return root;
}


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

const btn_generate = document.getElementById('form_generate');
btn_generate.addEventListener('click', function() {
    const title = document.getElementById('form_title').value;
    const fluctuation_probability = Number(document.getElementById('form_fluctuation_prob').value) / 100;
    saveFile(
        'ride-to-glory.gpx',
        constructGpxRide(new Date(), title, fluctuation_probability).toString(),
        'application/gpx+xml'
    );
});
