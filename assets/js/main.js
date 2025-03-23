/*jshint esversion: 8 */
import Tangible from "./tangible.js";

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
}

/* Load the main Tangible class and setup */
let tangible = new Tangible();

tangible.setupTangible();
if (getUrlParameter("demo")) {
    let testCodes = [
        {"code": 55, x: 400, y: 200},
        {"code": 109, x: 300, y: 200},

        {"code": 31, x: 300, y: 250},
        {"code": 167, x: 200, y: 250},

        {"code": 55, x: 300, y: 300},
        {"code": 109, x: 200, y: 300},

        {"code": 31, x: 300, y: 350},
        {"code": 171, x: 250, y: 350},

        {"code": 59, x: 300, y: 400},
        {"code": 31, x: 400, y: 450},
        {"code": 173, x: 300, y: 450},
        {"code": 59, x: 400, y: 500},
    ];

    tangible.currentCodes = testCodes;
}