import json
import xml.etree.ElementTree as xml

from datetime import datetime

if __name__ == '__main__':
    tree = xml.ElementTree(file='ride-to-glory.gpx')
    root = tree.getroot()
    metadata, track = root

    name, type_, segment = track

    trackpoints = []

    for trackpoint in segment:
        lat_lng = trackpoint.attrib
        elevation, time = trackpoint
        elevation = elevation.text
        time = time.text
        trackpoints.append({
            'lat': lat_lng['lat'],
            'lng': lat_lng['lon'],
            'elevation': elevation,
            'time_str': time.replace('Z', '+00:00'),
        })

    trackpoints = sorted(trackpoints, key=lambda p: p['time_str'])
    start_time = datetime.fromisoformat(trackpoints[0]['time_str'])

    for trackpoint in trackpoints:
        point_time = datetime.fromisoformat(trackpoint['time_str'])
        timedelta = point_time - start_time
        timedelta_micro = timedelta.seconds * 10 ** 6 + timedelta.microseconds
        trackpoint['timedelta'] = timedelta
        trackpoint['timedelta_micro'] = timedelta_micro

    data = json.dumps([{
        'lat': p['lat'],
        'lng': p['lng'],
        'elevation': p['elevation'],
        'timedelta_micro': str(p['timedelta_micro']),
    } for p in trackpoints], indent=2)

    with open('src/trackpoints.js', 'w') as f:
        f.write("module.exports = " + data)
