#!/usr/bin/env node

async function app() {
    const moment = require("moment-timezone");
    const args = require("minimist")(process.argv.slice(2))

    if (args.h) {
        console.log("Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE");
        console.log("  -h\t\tShow this help message and exit.");
        console.log("  -n -s\t\tLatitude: N positive; S negative.");
        console.log("  -e -w\t\tLongitude: E positive; W negative.");
        console.log("  -z\t\tTime zone: uses tz.guess() from moment-timezone by default.");
        console.log("  -d 0-6\tDay to retrieve weather: 0 is today; defaults to 1.");
        console.log("  -j\t\tEcho pretty JSON from open-meteo API and exit.");
        process.exit(0);
    }
    
    if (args.n != null && args.s != null) {
        console.log("ERROR: Cannot specify LATITUDE twice.");
        process.exit(1);
    }
    
    if (args.w != null && args.e != null) {
        console.log("ERROR: Cannot specify LONGITUDE twice.");
        process.exit(1);
    }

    if (args.d > 6 || args.d < 0) {
        console.log("ERROR: Day option -d must be 0-6.");
        process.exit(1);
    }

    var timezone;
    if (args.z) {
        timezone = args.z;
    }
    else {
        timezone = moment.tz.guess();
    }

    timezone = encodeURIComponent(timezone);

    var latitude;
    var longitude;

    if (args.n) {
        if (args.n < 0) {
            latitude = -args.n;
        }
        else {
            latitude = args.n;
        }
    }
    else {
        if (args.s > 0) {
            latitude = -args.s;
        }
        else {
            latitude = args.s;
        }    
    }

    if (args.n) {
        if (args.w < 0) {
            longitude = -args.w;
        }
        else {
            longitude = args.w;
        }
    }
    else {
        if (args.e > 0) {
            longitude = -args.e;
        }
        else {
            longitude = args.e;
        }    
    }

    latitude = Math.round((latitude + Number.EPSILON) * 100) / 100;
    longitude = Math.round((longitude + Number.EPSILON) * 100) / 100;
    
    
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&daily=precipitation_hours&current_weather=true&windspeed_unit=mph&precipitation_unit=inch&timezone=' + timezone);
    const data = await response.json();
    
    if (args.j) {
        console.log(data);
        process.exit(0);
    }


    var days = args.d;
    if (args.d == null) {
        days = 1;
    } 
    
    if (data.daily.precipitation_hours[days] > 0) {
        process.stdout.write("You might need your galoshes ")
    }
    else {
        process.stdout.write("You will not need your galoshes ")
    }

    if (days == 0) {
        console.log("today.")
    } else if (days > 1) {
        console.log("in " + days + " days.")
    } else {
        console.log("tomorrow.")
    }
}

app();



