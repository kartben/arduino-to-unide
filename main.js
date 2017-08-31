var http = require('http')

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty.usbmodem1421', {
	baudRate: 115200
});
const parser = port.pipe(new Readline({
	delimiter: '\r\n'
}));

parser.on('data', function(d) {
	console.log(d)

	if (d === "OVERCURRENT") {

		var body = JSON.stringify({
			"content-spec": "urn:spec://eclipse.org/unide/machine-message#v2",
			"device": {
				"deviceID": "a4927dad-58d4-4580-b460-79cefd56775b",
				"operationalStatus": "normal",
			},

			"messages": [{
				"origin": "sensor-id-992.2393.22",
				"ts": new Date().toISOString(),
				"type": "DEVICE",
				"severity": "HIGH",
				"code": "190ABT",
				"title": "overcurrent",
				"description": "Motor current threshold exceeded. Cooling down for 5 seconds.",
				"hint": "Check the motor"
			}]
		})


		var request = new http.ClientRequest({
			hostname: "localhost",
			port: 8080,
			path: "/rest/v2/message?validate=true",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(body)
			}
		})

		request.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});

		request.on('response', function(r) {
			console.log(r.statusCode);
		});

		request.end(body)
	} else {
		var partID = d.split(':')[0];
		var metricValue = d.split(':')[1];

		var body = JSON.stringify({
			"content-spec": "urn:spec://eclipse.org/unide/measurement-message#v2",
			"device": {
				"deviceID": "a4927dad-58d4-4580-b460-79cefd56775b",
				"operationalStatus": "normal",
			},

			"part": {
				"partTypeID": "F00VH07328",
				"partID": partID,
				"result": "NOK",
				"code": "HUH289",
				"metaData": {
					"chargeID": "845849",
					"toolID": "32324-432143"
				}
			},

			"measurements": [{
				"ts": new Date().toISOString(),
				"result": "NOK",
				"code": "0000 EE01",
				"limits": {
					"current": {
						"upperError": 33,
						"lowerError": 0
					}
				},

				"series": {
					"$_time": [
						0
					],

					"current": [
						metricValue
					]
				}
			}]
		})


		var request = new http.ClientRequest({
			hostname: "localhost",
			port: 8080,
			path: "/rest/v2/measurement?validate=true",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(body)
			}
		})

		request.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});

		request.on('response', function(r) {
			//console.log(r.statusCode);
		});

		request.end(body)
	}

});