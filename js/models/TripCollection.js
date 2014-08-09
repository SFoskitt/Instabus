var when = require('when');
var utils = require('../utils');
var Trip = require('./Trip');
var requests = require('../requests');

var TripCollection = {
    fetch: function(route, direction, stop) {
        var deferred = when.defer(),
            url = 'http://query.yahooapis.com/v1/public/yql',
            capUrl = 'http://www.capmetro.org/planner/s_service.asp?output=xml&opt=2&tool=SI&route=' + route + '&stopid=' + stop,
            params = {
                q: 'select * from xml where url="' + capUrl + '"',
                format: 'json' // let yql do the conversion from xml to json
            };

        requests.get(url, params)
            .then(function(data) {
                var results = data.query.results,
                    Envelope,
                    Fault,
                    Service,
                    Tripinfo,
                    trips;

                if (results === null || !results.Envelope) {
                    console.error("Bad arrival times data:", data);
                    deferred.reject('The CapMetro API is unavailable');
                    return;
                }

                Envelope = results.Envelope;
                Fault = Envelope.Body.Fault;

                if (Fault) {
                    console.error(Fault);
                    deferred.reject(new Error(Fault.faultstring));
                    return;
                }

                Service = Envelope.Body.SchedulenearbyResponse.Atstop.Service;
                if (Array.isArray(Service)) {
                    // Filter out the wrong direction
                    // But don't filter out the wrong direction if only one service is returned: this happens at the last stop in a route
                    Service = Service.filter(function(s) {
                        // `Direction` in the xml is N or S, not 0 or 1. convert it to something sane
                        return utils.getDirectionID(s.Route, s.Direction) === direction;
                    })[0];
                }

                Tripinfo = Service.Tripinfo;
                if (!Array.isArray(Tripinfo)) {
                    Tripinfo = [Tripinfo];
                }

                trips = Tripinfo.map(function(tripData) { return new Trip(tripData); });

                // show only the most recent old trip
                for (var i = 0; i < trips.length; i++) {
                    if (! trips[i].old()) {
                        if (i > 0) {
                            trips = trips.slice(i-1);
                        }
                        break;
                    }
                }

                deferred.resolve(trips);
            }.bind(this))
        .catch(function(err) {
            console.error("Fetch arrivals", err);
            deferred.reject(err);
        });

        return deferred.promise;
    }
};

module.exports = TripCollection;
