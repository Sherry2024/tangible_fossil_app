/*jshint esversion: 8 */

/**
 * tangible.js
 * 
 * NOTE: This file contains methods and code that were originally developed by [King's Digital Lab/tangible-11ty].
 * Repository: https://github.com/armbennett/tangible-11ty.git
 * 
 * Modifications:
 * - I have added/modified the following methods:
 *   - constructor()
 *   - checkFossilPresence()
 *   - setupTangible() (added new functionality for sound sets)
 *   - added Challenges buttons in several methods.
 * 
 * All other methods are part of the original codebase and are not my own work.
 */


export default class Tangible {

    constructor() {
        this.commands = {
            "LOOP": "Loop",
            "ENDLOOP": "End Loop",
            "PLAY": "Play",
        };
        // Code library for translations
        // Will be made into its getter/setter
        this.codeLibrary = {
            31: this.commands.PLAY,
            47: "Delay",
            55: this.commands.LOOP,
            59: this.commands.ENDLOOP,
            103: "0",
            107: "1",
            109: "2",
            115: "3",
            117: "4",
            121: "5",
            143: "6",
            151: "7",
            155: "8",
            157: "9",
            167: "A",
            171: "B",
            173: "C",
            179: "D",
            181: "E",
            185: "F",
            199: "G",
            203: "H",
            205: "I",
            211: "J",
            213: "K",
            217: "L",
            227: "M",
            229: "N",
            233: "O",
            241: "P",
            271: "Q",
            279: "R",
            282: "S",
            285: "T",
            295: "U",
            299: "V",
            301: "W",
            307: "X",
            309: "Y",
            313: "Z",

            // New TopCode for fossil parts
            327: "Neck",
            331: "Body",
            333: "Left Forelimb",
            339: "Right Forelimb",
            341: "Left Hindlimb",
            345: "Right Hindlimb",
            355: "Tail",
            357: "Skull",
        };
        this.topcodeHeight = 40;
        this.topcodeWidth = 100;
        this.variableIncrementer = 0;
		this.mode = "environment";
        this.declarations = "";
        // Fossil pieces 
        this.requiredFossilPieces =[327, 331, 333, 339, 341, 345, 355, 357]; 
        this.allPiecesDetected = false;
        // Set the challenge stage for "fossil"
        this.challengeStage = 0;
        // Codes currently seen
        this.currentCodes = [];
        this.soundSets = {
            GimmeGimmeGimme: [["A","B","C","D"],['challenge1','challenge2']],
            EyeOfTheTiger: [["A","B","C","D"],['challenge1','challenge2']],
            DoctorFoster: [["A","B","C","D","E","F"],['']],
            JingleBells: [["A","B","C","D","E","F"],['challenge1']],
            Limerick1: [["A","B","C","D","E","F","G","H"],['challenge1']],
            Limerick2: [["A","B","C","D","E","F","G"],['']],
            Limerick3: [["A","B","C","D","E"],['challenge1']],
            Poem: [["A","B","C","D","E","F","G","H"],['']],
            Popcorn: [["A","B","C","D"],['challenge1']],
            RowYourBoat: [["A","B","C","D","E","F","G","H"],['challenge1']],
            Story: [["A","B","C","D","E","F","G","H"],['challenge1']],
            // New TopCode for fossil parts
            Fossil: [["A"],['challenge1','challenge2']]
            //challenge1: Please ensure all fossil pieces are present. Arrange each piece so that the side with the TopCode is facing towards the camera.
            //challenge2: Please assemble the fossil by arranging all the pieces in their correct positions. Once completed, please scan the assembled fossil to verify its accuracy.
        }

        // set the default voice to be one that is relatively clear and slow 
        this.preferredVoiceName = "Google UK English Female";
        //wait until all voices are loaded in the browser
        window.speechSynthesis.onvoiceschanged = () => { 
            console.log("All voices loaded:");
            speechSynthesis.getVoices().forEach(v => console.log(v.name, v.lang));
        };

        //relative positions of fossil pieces, with the body as the anchor/reference point
        this.fossilReferenceLayout = {
            "331": { "x": 0, "y": 0 },
            "327": { "x": -1.2, "y": 0 },
            "357": { "x": -2.1, "y": 0 },
            "355": { "x": 2.0, "y": 0 },
            "333": { "x": -0.5, "y": 1.6 },
            "339": { "x": -0.5, "y": -1.6 },
            "341": { "x": 1.2, "y": 1.6 },
            "345": { "x": 1.2, "y": -1.6 }
        };


    }
    /*
    // Text-to-speech.
    speak(text) {
        if (!('speechSynthesis' in window)) {
            console.warn("Text-to-speech not supported in this browser.");
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name === this.preferredVoiceName);
        if (preferred) {
            utterance.voice = preferred;
        } else {
            console.warn(`Preferred voice "${this.preferredVoiceName}" not found. Using default voice.`);
        }
        speechSynthesis.speak(utterance);
    }
    */
    speak(text) {
        if (!('speechSynthesis' in window)) {
            console.warn("Text-to-speech not supported in this browser.");
            return;
        }
    
        // Wait until voices are available
        const waitForVoices = new Promise((resolve) => {
            let voices = speechSynthesis.getVoices();
            if (voices.length) {
                resolve(voices);
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    resolve(speechSynthesis.getVoices());
                };
            }
        });
    
        waitForVoices.then((voices) => {
            const utterance = new SpeechSynthesisUtterance(text);
            const preferred = voices.find(v => v.name === this.preferredVoiceName);
            if (preferred) {
                utterance.voice = preferred;
            } else {
                console.warn(`Preferred voice "${this.preferredVoiceName}" not found. Using default.`);
            }
            speechSynthesis.speak(utterance);
        });
    }
    

    /** Loads assets and data for this set of tiles
     *  
     *
     *  @param soundSet the name of the sound set to load
     *  @return array of sounds
    
    preloads(soundSet) {
		var soundsTemp = {};
		this.soundSets[soundSet][0].forEach(function(element) {
    	soundsTemp[element] = new Audio("/tangible-11ty/assets/sound/"+soundSet+"/"+element+".mp3");
		});
		document.getElementById("challenges").innerHTML = '';
		let challenge = 1;
		if (this.soundSets[soundSet][1] != ''){
            this.soundSets[soundSet][1].forEach(function(element) {
		        document.getElementById("challenges").innerHTML += "<h3>Challenge "+challenge+"</h3><audio controls><source src='/tangible-11ty/assets/sound/"+soundSet+"/"+element+".mp3' type='audio/mpeg'></audio>";
		        challenge += 1;
		    });
		};
		
		this.sounds = soundsTemp;
    }
    */
    preloads(soundSet) {
        var soundsTemp = {};
        this.soundSets[soundSet][0].forEach(function(element) {
            soundsTemp[element] = new Audio("/tangible-11ty/assets/sound/" + soundSet + "/" + element + ".mp3");
        });
        this.sounds = soundsTemp;
        document.getElementById("challenges").innerHTML = '';
        let challenge = 1;
        // Above is unchanegd. 
        //
        if (this.soundSets[soundSet][1] && this.soundSets[soundSet][1].length > 0) {
            this.soundSets[soundSet][1].forEach((element, index) => {
                const audioId = `challenge-audio-${index + 1}`;
                const html = `
                    <h3>Challenge ${index + 1}</h3>
                    <audio controls id="${audioId}">
                        <source src='/tangible-11ty/assets/sound/${soundSet}/${element}.mp3' type='audio/mpeg'>
                    </audio>`;
                document.getElementById("challenges").innerHTML += html;
                challenge++;
            });
    
            // 👇 Only attach challengeStage logic if soundSet is Fossil
            if (soundSet === "Fossil") {
                for (let i = 1; i <= this.soundSets[soundSet][1].length; i++) {
                    const audioEl = document.getElementById(`challenge-audio-${i}`);
                    if (audioEl) {
                        audioEl.addEventListener("play", () => {
                            this.challengeStage = i;
                            console.log("Challenge stage set to", i);
                        });
                    }
                }
            }
        }
    }
    
    playAudio(audio) {
     return new Promise(res => {
            audio.play();
            audio.onended = res;
        });
    }

    /**
     Set the video canvas to the right aspect ratio
     */
    setVideoCanvasHeight(canvasId) {
        let canvas = document.getElementById(canvasId);
        let heightRatio = 1.5;
        canvas.height = canvas.width * heightRatio;
    }


    /**
     Parse the topcodes that are found.  Each item in the array topCodes has:
     x,y coordinates found and code: the int of topcode
     @param topCodes Found codes
     @return text translations of code
     */
    parseCodesAsText(topCodes) {
        let outputString = "";
        let grid = this.sortTopCodesIntoGrid(topCodes);
        for (let i = 0; i < grid.length; i++) {
            for (let x = 0; x < grid[i].length; x++) {
                outputString += this.codeLibrary[grid[i][x].code] + ", X:" + grid[i][x];
            }
            outputString += "<br/>\n";
        }

        return outputString;
    }

    /** Sort topcodes into a grid using x,y coordinates
     *
     * @param topCodes to sort
     * @return multi-dimensional grid array
     */
    sortTopCodesIntoGrid(topCodes) {
        // Sort topcodes by y, then x
        topCodes.sort(this.sortTopCodeComparator.bind(this));
        //console.log(topCodes);
        let grid = [];
        let line = Array();
        let currentY = -1;
        // loop through, add lines as y changes
        for (let i = 0; i < topCodes.length; i++) {
            if (currentY >= 0 && topCodes[i].y - currentY >= this.topcodeHeight) {
                // New line
                grid.push(line);
                line = Array();
                currentY = topCodes[i].y;
            } else if (currentY < 0) {
                currentY = topCodes[i].y;
            }
            line.push(topCodes[i]);
        }
        // Add last line and return
        grid.push(line);
        return grid;
    }

    /**
     * Sort the top codes y ascending
     * X DESCENDING because the video is mirrorer
     * @param a
     * @param b
     * @return {number}
     */
    sortTopCodeComparator(a, b) {

        if (Math.abs(a.y - b.y) <= this.topcodeHeight) {
            // same line
            if (a.x == b.x) {
                return 0;
            }
            if (a.x < b.x) {
                return 1;
            }
            return -1;
        }
        // Different lines
        if (a.y < b.y) {
            return -1;
        }
        return 1;
    }

    /**
     Parse topcodes as javascript.  Each item in the array topCodes has:
     x,y coordinates found and code: the int of topcode
     @param topCodes Found codes
     @return text translations of code
     */
    parseCodesAsJavascript(topCodes) {

        let outputJS = "";
        let grid = this.sortTopCodesIntoGrid(topCodes);
        //console.log(grid);
        for (let i = 0; i < grid.length; i++) {
            outputJS += this.parseTopCodeLine(grid[i]);
        }
        /*for (let i = 0; i < topCodes.length; i++) {
            if (topCodes[i].code in this.codeLibrary){
                outputJS += this.codeLibrary[topCodes[i].code] + " ";

            }
        }*/
        return outputJS;
    }


    parseTopCodeLine(line) {
        //this.codeLibrary[grid[i][x].code]
        let lineJS = "\n";
        let i = 0;
        while (i < line.length) {
            let parsedCode = this.codeLibrary[line[i].code];
            //console.log(parsedCode);
            switch (parsedCode) {
                case this.commands.LOOP:
                    // See if we've got a number next
                    if (line.length > i + 1) {
                        let nextSymbol = this.codeLibrary[line[i + 1].code];
                        if (parseInt(nextSymbol)) {
                            lineJS += "for (let x" + this.variableIncrementer + "=0; x" + this.variableIncrementer + " < " + nextSymbol + "; x" + this.variableIncrementer + "++){";
                            this.variableIncrementer += 1;
                            i += 1;
                        }
                    } else {
                        //console.log("ERROR: No increment or bad increment for for loop!");
                    }
                    break;
                case this.commands.ENDLOOP:
                    lineJS += "} \n";
                    break;
                case this.commands.PLAY:
                    if (line.length > i + 1) {
                        let letter = this.codeLibrary[line[i + 1].code];
                        lineJS += "await context.playAudio(this.sounds." + letter + ");\n";
                        //lineJS += "await new Promise(r => setTimeout(resolve, this.sounds." + letter + ".duration * 100));";
                    }
                    lineJS += "";
                    break;

            }
            i += 1;
        }
        return lineJS;
    }

    // await new Promise(resolve => setTimeout(resolve, 1500));

    async evalTile(tileCode, context) {

        eval('(async (context) => {"use strict";' + tileCode + '})(context)');
        return true;
    }


    async runCode() {
        if (this.currentCodes && this.currentCodes.length > 0) {
            let parsedJS = this.declarations + this.parseCodesAsJavascript(this.currentCodes);
            //console.log(parsedJS);
            let parsedText = this.parseCodesAsText(this.currentCodes);
            document.getElementById("codes").innerHTML = parsedText;
            document.getElementById("result").innerHTML = parsedJS;
            //parsedJS = "await this.playAudio(this.sounds.A); await this.playAudio(this.sounds.B); return true";
            let parsedLines = [];
            parsedLines.push(this.evalTile(parsedJS, this));
            let done = await Promise.all(parsedLines);
        }
    }

    // New. checks if all required fossil pieces are present and detected, plays a sound "ok" if true. 
    checkFossilPresence(force = false) {
        if (this.currentSet !== "Fossil") return false;
        const detectedCodes = this.currentCodes.map(c => c.code);
        const allPresent = this.requiredFossilPieces.every(code => detectedCodes.includes(code));
        if (allPresent) {
            if (!this.allPiecesDetected || force) {
                this.allPiecesDetected = true;
                console.log("All fossil parts detected!");
            }
            console.log("Running Challenge 1 with force =", force);
            return true;
        } else {
            if (force) {
                this.speak("Some fossil pieces are missing.");
            }
            console.log("Running Challenge 1 with force =", force);
            return false;
        }
    }
    

    validateFossilArrangement() {
        if (this.currentSet !== "Fossil" || !this.allPiecesDetected) return;
    
        const coords = {};
        let body = this.currentCodes.find(c => c.code === 331);
        if (!body) return;
    
        for (let c of this.currentCodes) {
            if ([327, 357, 355, 333, 339, 341, 345, 331].includes(c.code)) {
                coords[c.code] = { x: c.x - body.x, y: c.y - body.y };
            }
        }
    
        const ref = this.fossilReferenceLayout;
        let errors = [];
    
        for (let code in ref) {
            let actual = coords[code];
            let expected = ref[code];
            if (!actual) continue;
    
            let dx = actual.x - expected.x * 100; // scale reference
            let dy = actual.y - expected.y * 100;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 100) { // tolerance
                errors.push(`${this.codeLibrary[code]} is misplaced`);
            }
        }
    
        if (errors.length === 0) {
            this.speak("Excellent! The fossil has been assembled correctly.");
        } else {
            this.speak("Please check the following parts: " + errors.join(", "));
        }
        console.log("Running Challenge 2...");

    }
    

    setupTangible() {
        //this.setVideoCanvasHeight('video-canvas');
        let tangible = this;
        // register a callback function with the TopCode library
        TopCodes.setVideoFrameCallback("video-canvas", function (jsonString) {
            // convert the JSON string to an object
            var json = JSON.parse(jsonString);
            // get the list of topcodes from the JSON object
            var topcodes = json.topcodes;
            // obtain a drawing context from the <canvas>
            var ctx = document.querySelector("#video-canvas").getContext('2d');
            // draw a circle over the top of each TopCode
            //document.querySelector("#codes").innerHTML = '';
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";   // very translucent red
            for (let i = 0; i < topcodes.length; i++) {
                ctx.beginPath();
                ctx.arc(topcodes[i].x, topcodes[i].y, topcodes[i].radius, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.font = "26px Arial";
                ctx.fillText(topcodes[i].code, topcodes[i].x, topcodes[i].y);
                //console.log(topcodes[i].code +', x:'+topcodes[i].x, topcodes[i].y)
                //document.querySelector("#result").innerHTML += '<br/>' + topcodes[i].code + ', x:' + topcodes[i].x + ', y:' + topcodes[i].y;
            }

            //document.querySelector("#result").innerHTML = tangible.parseCodesAsText(topcodes);
            tangible.currentCodes = topcodes;
            
            if (tangible.currentSet === "Fossil" && tangible.challengeStage === 2) {
                tangible.validateFossilArrangement();
                tangible.challengeStage = 0;
            }

            //hide the original run button when "Fossil" is selected
            const runBtn = document.getElementById('run');
            const run1 = document.getElementById('run1');
            const run2 = document.getElementById('run2');
            
            if (tangible.currentSet === "Fossil") {
                runBtn.style.display = "none";
                runBtn.disabled = true;
                run1.style.display = "inline-block";
                run2.style.display = "inline-block";
            } else {
                runBtn.style.display = "inline-block";
                runBtn.disabled = false;
                run1.style.display = "none";
                run2.style.display = "none";
            }
        }, this);

        // Setup buttons
        //console.log(document.getElementById('run'));
        let runButton = document.getElementById('run');
        runButton.onclick = function () {
            this.runCode();
        }.bind(this);
        
        let switchBtn = document.getElementById('switch-view');
        switchBtn.onclick = function () {
        	TopCodes.stopVideoScan('video-canvas');
        	if (this.mode === "user") {
        		this.mode = "environment";
        	} else {
        		this.mode = "user";
        	}
        	TopCodes.startStopVideoScan('video-canvas',this.mode);
        }.bind(this);
        
        let cameraBtn = document.getElementById('camera-button');
        cameraBtn.onclick = function () {
            TopCodes.startStopVideoScan('video-canvas',this.mode);
        }.bind(this);
        
        let setSelect = document.getElementById('soundSets');
        setSelect.onchange = function () {
        	//this.preloads(setSelect.value);
            this.currentSet = setSelect.value;
            this.preloads(this.currentSet); // allow user to update selected sound track.

            //disable runButton when "Fossil" is selected
            const runBtn = document.getElementById('run');
            if (this.currentSet === "Fossil") {
                runBtn.style.display = "none";
                runBtn.disabled = true;
            } else {
                runBtn.style.display = "inline-block";
                runBtn.disabled = false;
            }
            
            //disable run challenges button when "Fossil" is not selected
            const run1 = document.getElementById('run1');
            const run2 = document.getElementById('run2');
            if (this.currentSet === "Fossil") {
                run1.style.display = "inline-block";
                run2.style.display = "inline-block";
            } else {
                run1.style.display = "none";
                run2.style.display = "none";
            }            
        }.bind(this);
        
        // Set challenge buttons to update challengeStage only
        let runBtn1 = document.getElementById('run1');
        let runBtn2 = document.getElementById('run2');
        
        // run logic of button 1 
        runBtn1.onclick = () => {
            if (this.checkFossilPresence(true)) {
                this.speak("Great: All fossil pieces are present. Please start the next challenge.");
            } else {
                this.speak("Some fossil pieces are missing.");
            }
        };
        
        runBtn2.onclick = () => {
            this.challengeStage = 2;
            this.validateFossilArrangement(); 
        };


        // Run preloads
        this.preloads("GimmeGimmeGimme");
        //this disable 2 challenge buttons when preloading the program.
        document.getElementById('run1').style.display = "none";
        document.getElementById('run2').style.display = "none";   
    }

}