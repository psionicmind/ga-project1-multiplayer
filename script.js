// LOGIC
const movements={
    t1tot2: 12,
    t1tot3: 13,
    t2tot1: 21,
    t2tot3: 23,
    t3tot1: 31,
    t3tot2: 32,
}

const towerNumber={
    tower1:0,
    tower2:1,
    tower3:2,
}

const typeOfPlayer={
    sidebyside:0,
    online:1,    
}

const serverClientType={
    server: "server",
    client: "client",
}
let socket=undefined;
let io=undefined;
let http=undefined;

let numberOfDisc = 3;
let discFlashWaitTime = 50;
let countDownWaitTime = 200;
let hanoiArray=[];
let players = [];
const maxSidebySidePlayers = 20;
let currentNumberOfSidebySidePlayers = 1;
let currentNumberOfPlayers = 1;
let serverOrClient = undefined;
let IsStartNow = false;

let browserPageZoomPc = 100;
var baseContainer = document.getElementsByClassName("container")[0];

var serverClientPanel = document.getElementsByClassName("serverclient-panel")[0];
var serverLabel = document.getElementsByClassName("server-label")[0];
var clientEditBoxForServerIP = document.getElementsByClassName("client-IP")[0];

var addSidePlayerButton = document.getElementsByClassName("add-side-player")[0];
var addSidePlayerNameEditBox = document.getElementsByClassName("add-side-player-name")[0];
// let timer = document.querySelector(".timer")
var startCountDownButton = document.getElementsByClassName("start-countdown-button")[0];
var countdownLabelNo3 = document.getElementsByClassName("countdown-labelno3")[0];
var countdownLabelNo2 = document.getElementsByClassName("countdown-labelno2")[0];
var countdownLabelNo1 = document.getElementsByClassName("countdown-labelno1")[0];
var countdownLabelGo = document.getElementsByClassName("countdown-labelGo")[0];

const placeholderNames = ['Tom', 'Dick', 'Harry', 'Jack', 'Jill', 'SnowWhite', 'Pride', 'Greed', 'Lust', 'Envy', 'Gluttony', 'Wrath', 'Sloth'];

// https://www.w3schools.com/tags/ref_colornames.asp
const discColors = ['Fuchsia','Gold','GreenYellow','LightSalmon','MediumBlue','MediumVioletRed','OrangeRed','DarkMagenta','BurlyWood'];




// individual player's varaible
class TowerOfHaoi {
    constructor(){
        // Data
        this.username="";
        this.tower1=[]
        this.tower2=[]
        this.tower3=[]
        this.numberOfSteps = 0;
        this.fromTower= -1;
        this.toTower=-1;
        this.showSolutionSteps = 0;
        this.typeOfPlayer = typeOfPlayer.sidebyside;
        this.winner = "";

        this.stopWatchStartTime=undefined; // to keep track of the start time
        this.stopwatchInterval=undefined; // to keep track of the interval
        this.elapsedPausedTime = 0; // to keep track of the elapsed time while stopped        

        // UI
        this.container=null;
        this.htmlTowers=null;
        this.feedback=null;
        this.steps=null;
        this.timer=null;
        this.showSolutionButton=null;
        this.resetButton=null;
        this.discs = [];
    }
}

// Server Client Code
function serverSetup(event){
    const serverIP = "192.168.0.109";

    const ws = `ws://${serverIP}:8080`;
    serverLabel.innerHTML += `  ${ws} `;

    const http = require("http").createServer();

    const io = require("socket.io")(http, {
        cors: { origin: "*" },
    });
    
    io.on("connection", (socket) => {
        console.log("a user connected");
        socket.on("message", (message) => {
        console.log(message);
        console.log("server received message: " + JSON.stringify(message));
        io.emit(
            "message",
            `${socket.id} said ${JSON.stringify(message)}`
        );
        });
    });
    
    http.listen(8080, () => console.log("listening on http://localhost:8080"));        
}

function fetchYourOwnIP(cmd){
    var process = require('child_process');
    process.exec(cmd, function (err,stdout,stderr) {
        if (err) {
            console.log("\n"+stderr);
        } else {
            console.log(stdout);
        }
    });
}

function clientSetup (){
    const serverIP= clientEditBoxForServerIP.innerHTML;
    socket = io(`ws://${serverIP}:8080`);

    // receive message
    socket.on("message", (text) => {
      const el = document.createElement("li");
      el.innerHTML = text;
      console.log(`test=${text}`);
      document.querySelector("ul").appendChild(el);
    });
    
    // send out message using EMIT
    document.querySelector("button").onclick = () => {
      testjson= {"username":"king", "action": "move", "fromtower":1, "totower":2}
      socket.username="wakaka";
      socket.emit("message",testjson);
    };
}


// https://stackoverflow.com/questions/4427094/how-can-i-duplicate-a-div-onclick-event
function UiDuplicateTowerOfHanoi(username){    
    var clone = baseContainer.cloneNode(true); // true for deep clone
    clone.id = username;
    baseContainer.parentNode.appendChild(clone);    
}

function startCountDown(){
    sleep(countDownWaitTime).then(() => { 
        startCountDownButton.disabled = true;
        countdownLabelNo3.style.color = "lime";
        sleep(countDownWaitTime).then(()=>{ 
            countdownLabelNo2.style.color = "lime";
            sleep(countDownWaitTime).then(()=>{ 
                countdownLabelNo1.style.color = "lime";
                sleep(countDownWaitTime).then(()=>{ 
                    countdownLabelGo.style.color = "lime";   
                    IsStartNow = true;

                    let keys = Object.keys(players)
                    for (let index = 0; index < keys.length; index++) {
                        startStopwatch(keys[index]);                    
                    }                    
                });
            });
        });
    });
}



function addPlayer(username, IsMainPlayer){
    players[username] = new TowerOfHaoi();

    if (IsMainPlayer)
        baseContainer.id = username;
    else{
        UiDuplicateTowerOfHanoi(username);
        players[username].tower1 = [...players[mainPlayerName].tower1];
        players[username].tower2 = [...players[mainPlayerName].tower2];
        players[username].tower3 = [...players[mainPlayerName].tower3];
    }

    AssignElementsToDerivedClass(username);// ui    
    if (IsMainPlayer){
        generateTower(username, numberOfDisc); // data
        UiCreateDisc(username);                // ui
        loadAllDiscToTower1(username);         // ui
        UiUpdateFeedback(username, "Welcome to Tower of Hanoi ! Control Keys are 1, 2 and 3")        
    }
    else{
        resetGame(username)
        UiUpdateFeedback(username, "Welcome to Tower of Hanoi ! Control Keys are z, x and c")
    }

}

// this function can only be use after UI is cloned
function AssignElementsToDerivedClass(username){
    newUser = document.getElementById(username);
    players[username].username = username;
    players[username].htmlTowers = newUser.querySelectorAll('.tower');
    players[username].feedback = newUser.querySelector(".feedback");
    players[username].steps = newUser.querySelector(".steps");
    players[username].timer = newUser.querySelector(".timer");
    players[username].showSolutionButton = newUser.querySelector(".show-solution");
    players[username].resetButton = newUser.querySelector(".reset-game");

    players[username].showSolutionButton.addEventListener('click', function(event) {
        showSolution(username);
    });

    players[username].resetButton.addEventListener('click', function(event) {
        resetGame(username);
    });    
}

function resizeBrowserPageZoom(){
    browserPageZoomPc *=  0.9;
    if (browserPageZoomPc > 50){
        document.body.style.zoom = `${browserPageZoomPc}%`;
    }
    else{
        console.log("cannot reduce size anymore. too small.")
    }
}



// can have ui edit box and button to register Main player username
function getMainPlayerName(){
    return "ken";
}
const mainPlayerName = getMainPlayerName();

function getSidebySidePlayerName(){
    if (addSidePlayerNameEditBox.value ==="")
        return addSidePlayerNameEditBox.placeholder;
    else
        return addSidePlayerNameEditBox.value;
}

let sideBySidePlayerName ="";

addPlayer(mainPlayerName, true);

function generateTower(username, discNum){
    for (let index = discNum; index >= 1; index--) {
        console.log(`${username} pushing ${index} to tower1`)
        players[username].tower1.push(index);        
    }
    consoleLogTowerInfo(username);    
}






function t1tot2(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower1, players[username].tower2)){
        players[username].tower2.push(players[username].tower1.pop())    
        UiMoveDisc(username, towerNumber.tower1, towerNumber.tower2)
        return true;
    }
    else
        return false;
}

function t1tot3(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower1, players[username].tower3)){
        players[username].tower3.push(players[username].tower1.pop())
        UiMoveDisc(username, towerNumber.tower1, towerNumber.tower3)
        return true;
    }
    else
        return false;
}

function t2tot1(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower2, players[username].tower1)){    
        players[username].tower1.push(players[username].tower2.pop())
        UiMoveDisc(username, towerNumber.tower2, towerNumber.tower1)        
        return true;
    }
    else
        return false;
}

function t2tot3(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower2, players[username].tower3)){    
        players[username].tower3.push(players[username].tower2.pop())
        UiMoveDisc(username, towerNumber.tower2, towerNumber.tower3)
        return true;
    }
    else
        return false;
}

function t3tot1(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower3, players[username].tower1)){    
        players[username].tower1.push(players[username].tower3.pop())
        UiMoveDisc(username, towerNumber.tower3, towerNumber.tower1)        
        return true;
    }
    else
        return false;
}

function t3tot2(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower3, players[username].tower2)){    
        players[username].tower2.push(players[username].tower3.pop())
        UiMoveDisc(username, towerNumber.tower3, towerNumber.tower2)        
        return true;
    }
    else
        return false;
}

function rulesCheckIsMovedDiscSmallerThanTargetTower(username ,from_Tower, to_Tower){
    let toTowerDiscValue = -1;

    if (to_Tower.length===0){
        toTowerDiscValue = 99; // an impossible value to beat
    }
    else{
        toTowerDiscValue = to_Tower[to_Tower.length-1];
    }
    
    if (from_Tower[from_Tower.length-1] < toTowerDiscValue)
        return true;
    else{
        const warning = "disc is bigger than target tower! pls try again.";
        UiUpdateFeedback(username, warning);
        console.log(`${username} : ${warning}`);
        return false;
    }
}

function movement(username, keyNumber){
    let result = false;
    switch (keyNumber) {
        case movements.t1tot2:
            result=t1tot2(username);
            break;
        case movements.t1tot3:
            result=t1tot3(username);
            break;
        case movements.t2tot1:
            result=t2tot1(username);
            break;
        case movements.t2tot3:
            result=t2tot3(username);
            break;
        case movements.t3tot1:
            result=t3tot1(username);
            break;
        case movements.t3tot2:
            result=t3tot2(username);
            break;
    }
    if (result){
        players[username].numberOfSteps += 1;
        UiUpdateSteps(username, players[username].numberOfSteps);
    }
}


serverClientPanel.addEventListener('click', function(event){
    console.log("radioButtons panel clicked");
    serverOrClient = document.querySelector('input[name="serverclient"]:checked').value;
    console.log(`radio button value = ${serverOrClient}`);
    
    if (serverOrClient===serverClientType.server)
        serverSetup();
    else
        clientSetup();
});

addSidePlayerButton.addEventListener('click', function(event) {
    if (currentNumberOfSidebySidePlayers < maxSidebySidePlayers){
        sideBySidePlayerName = getSidebySidePlayerName();
        addPlayer(sideBySidePlayerName, false);

        // make race feature enabled
        startCountDownButton.style.visibility = "visible";
        countdownLabelNo3.style.visibility = "visible";
        countdownLabelNo2.style.visibility = "visible";
        countdownLabelNo1.style.visibility = "visible";
        countdownLabelGo.style.visibility = "visible";        
        
        resizeBrowserPageZoom();
    
        // things to do after max side by side player is reached.
        currentNumberOfPlayers++;
        currentNumberOfSidebySidePlayers++;
        if (currentNumberOfSidebySidePlayers === maxSidebySidePlayers){
            addSidePlayerNameEditBox.placeholder = "No more can be added";    
            addSidePlayerButton.disabled = true;
        }
        else
            addSidePlayerNameEditBox.placeholder = placeholderNames[Math.floor(Math.random() * placeholderNames.length)];
    }
});

startCountDownButton.addEventListener('click', function(event) {
    startCountDown();        
});

// this eventlistener is only for player or players(2) playing on one browser.
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case '1':
        case '2':
        case '3':
            username = mainPlayerName;
            eventKeyProcess(username, event.key);
            break;
        case 'z':
        case 'x':
        case 'c':
            username = sideBySidePlayerName;  
            eventKeyProcess(username, event.key);
            break;
    }

});

function eventKeyProcess(username, eventKey){
    if (currentNumberOfPlayers>1)
        if (IsStartNow ==false){
            UiUpdateFeedback(username, "Please wait for the start button to be press");
            return;
        }


    if (players[username].winner==""){
        switch (eventKey) {
            case "z":
                eventKey=1;
                break;
            case "x":
                eventKey=2;
                break;            
            case "c":
                eventKey=3;
                break;    
        }

        UiUpdateFeedback(username, " ");
        if (players[username].fromTower!=-1){
            players[username].toTower = (+eventKey)-1;
            toTowerSelectedPostProcess(username);
        }
        else{
            players[username].fromTower = (+eventKey)-1;
            fromTowerSelectedPostProcess(username, (+eventKey)-1);
        }
    }
    else if (players[username].winner==username)
        UiUpdateFeedback(username, "YOU won already!");
    else                
        UiUpdateFeedback(username, `${players[username].winner} won already!`);
}

function fromTowerSelectedPostProcess(username, towerNumber){
    // start as long as you have pressed on any tower
    if (!players[username].stopWatchStartTime) 
        startStopwatch(username);

    if (!IsTowerEmpty(username, towerNumber))
        UiFlashDisc(username, towerNumber);    
}

function toTowerSelectedPostProcess(username){
    let moveCode = (players[username].fromTower+1)*10+(players[username].toTower+1);
    console.log("moveCode=" + moveCode);

    // rules check, all ok, can move pieces from tower to tower.        
    movement(username, moveCode);

    players[username].fromTower=-1;
    players[username].toTower=-1;
    // consoleLogTowerInfo();
    if (checkWin(username)){
        if (currentNumberOfPlayers===1)
            stopStopwatch(username);
        else{
            for(player in players){
                stopStopwatch(player);
            }
        }

    }
    return false;
}


function IsTowerEmpty(username, checkTower){
    if ((checkTower ===towerNumber.tower1) && (players[username].tower1.length==0)){
        console.log(`nothing from that tower ${checkTower} `);
        players[username].fromTower=-1; //global variable is updated
        players[username].toTower=-1;   //global variable is updated         
        return true;
    }
    else if ((checkTower ===towerNumber.tower2) && (players[username].tower2.length==0)){
        console.log(`nothing from that tower ${checkTower} `);
        players[username].fromTower=-1;
        players[username].toTower=-1;            
        return true;
    }
    if ((checkTower ===towerNumber.tower3) && (players[username].tower3.length==0)){
        console.log(`nothing from that tower ${checkTower} `);
        players[username].fromTower=-1;
        players[username].toTower=-1;            
        return true;
    }

    return false;    
}

function consoleLogTowerInfo(username){
    console.log(`tower1 is ${players[username].tower1}`);
    console.log(`tower2 is ${players[username].tower2}`);
    console.log(`tower3 is ${players[username].tower3}`);
}

function checkWin(username){
    if ((players[username].tower2.length == numberOfDisc)|| (players[username].tower3.length == numberOfDisc)){
        console.log("YOU WIN!");
        UiUpdateFeedback(username, "YOU WIN!");
        AnnounceWinnerFreezeGame(username);
        return true;
    }
    else
        return false;
}

function AnnounceWinnerFreezeGame(username){
    for (player in players){
        console.log(player)
        players[player].winner = username; // this only set the data in mainplayer's computer.            

        if (player != username){
            UiUpdateFeedback(player, "You LOSE!");
        }

    }
}

//HTML

function UiCreateDisc(username){
    for (let index = 0; index < numberOfDisc; index++) {
        let tempDisc = document.createElement("div");
        tempDisc.classList.add('disc');  // so can use disc class at css
        tempDisc.style.backgroundColor = discColors[index];
        tempDisc.style.width = 180 - ((index+1) * 20) + 'px';

        // initially on game start, only tower 1 will be loaded with disc, 
        // from largest to smallest size.
        players[username].discs.push(tempDisc); 
    }
}

function UiLoadDiscColor(username){
    for (let index = 0; index < numberOfDisc; index++) {
        players[username].discs[index].style.backgroundColor = discColors[index];
    }
}


//********************************************************************************
//********************************************************************************
//*************************    User Interface      *******************************
//********************************************************************************
//********************************************************************************

function UiUpdateFeedback(username, text){
    if (text ===" ")
        players[username].feedback.innerHTML = `${username}`;
    else
        players[username].feedback.innerHTML = `${username}: ${text}`;
}

function UiUpdateSteps(username, stepValue){
    players[username].steps.innerHTML = `Number of Steps: ${stepValue}`;
}

function UiInsertDisc(username, disc, towerNum){
    players[username].htmlTowers[towerNum].prepend(disc);
}

function UiRemoveDisc(username, towerNum){
    let disc = players[username].htmlTowers[towerNum].firstChild;
    players[username].htmlTowers[towerNum].removeChild(disc);
    return disc;
}

function loadAllDiscToTower1(username){
    // this is for INITIAL loading of all disc to tower1 using players[username].discs
    if (players[username].discs.length ===0){
        UiCreateDisc(username);                // ui
    }

    for (let index = 0; index < players[username].discs.length; index++) {
        UiInsertDisc(username, players[username].discs[index], towerNumber.tower1);    
    }
}

function UiMoveDisc(username, fromWhichTower, ToWhichTower){
    UiInsertDisc(username, UiRemoveDisc(username, fromWhichTower), ToWhichTower)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function UiFlashDisc(username, towerNum){
    players[username].htmlTowers[towerNum].firstChild.style.backgroundColor = 'blue';

    sleep(discFlashWaitTime).then(() => { 
        UiLoadDiscColor(username);        
        sleep(discFlashWaitTime).then(()=>{ 
            players[username].htmlTowers[towerNum].firstChild.style.backgroundColor = 'blue';
            sleep(discFlashWaitTime).then(()=>{ 
                UiLoadDiscColor(username);        
            });
        });
    });
}

function blinkElement(element){
    element.style.visibility = "hidden"
    sleep(500).then(() => { 
        element.style.visibility = "visible"
        sleep(500).then(() => { 
            element.style.visibility = "hidden"
            sleep(500).then(() => { 
                element.style.visibility = "visible"
            });
        });
    });
}

// https://www.geeksforgeeks.org/c-program-for-tower-of-hanoi/


function hanoiAlgo2(n, from_Tower, to_Tower, aux_Tower)
{
    if (n===0){
        console.log("return")
        return;
    }
        hanoiAlgo2(n-1, from_Tower, aux_Tower, to_Tower);
        console.log(`move disc from ${from_Tower} to ${to_Tower}`);
        hanoiArray.push({from_Tower, to_Tower});
        hanoiAlgo2(n-1, aux_Tower, to_Tower, from_Tower);
}

hanoiAlgo2(numberOfDisc, towerNumber.tower1+1, towerNumber.tower3+1, towerNumber.tower2+1)
console.log(hanoiArray)



// https://www.educative.io/answers/how-to-create-a-stopwatch-in-javascript
function startStopwatch(username) {
    if (!players[username].stopwatchInterval) {
        players[username].stopWatchStartTime = new Date().getTime() - players[username].elapsedPausedTime; // get the starting time by subtracting the elapsed paused time from the current time
        players[username].stopwatchInterval = setInterval(updateStopwatch, 1000, username); // update every second
    }
}

function stopStopwatch(username) {
    clearInterval(players[username].stopwatchInterval); // stop the interval
    players[username].elapsedPausedTime = new Date().getTime() - players[username].stopWatchStartTime; // calculate elapsed paused time
    players[username].stopwatchInterval = null; // reset the interval variable
}
  
function resetStopwatch(username) {
    stopStopwatch(username); // stop the interval
    players[username].elapsedPausedTime = 0; // reset the elapsed paused time variable
    players[username].timer.innerHTML = "Timer 00:00"; // reset the display
}

function updateStopwatch(username) {
    var currentTime = new Date().getTime(); // get current time in milliseconds
    var elapsedTime = currentTime - players[username].stopWatchStartTime; // calculate elapsed time in milliseconds
    var seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
    var minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes

    var displayTime = "Timer " + pad(minutes) + ":" + pad(seconds); // format display time
    players[username].timer.innerHTML = displayTime; // update the UI display
}

function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
}

// point from index.hmtl directly
function showSolution(username){
    console.log("in showsolution")
    console.log(`in showSolution ${ players[username].showSolutionSteps}`);
    console.log(`in hanoiArray.length ${hanoiArray.length}`);

    if ((players[username].tower1.length != numberOfDisc)&&
        (players[username].showSolutionSteps === 0))
    {
        UiUpdateFeedback(username, "Please reset game before using SHOW SOLUTION feature");
        return;
    }

    if (players[username].showSolutionSteps < hanoiArray.length){
        UiUpdateFeedback(username, "Keep Pressing the Show Solution until all disc are at one tower")    
        let moveCode = (hanoiArray[players[username].showSolutionSteps]['from_Tower'])*10+(hanoiArray[players[username].showSolutionSteps]['to_Tower']);
        console.log("moveCode=" + moveCode);
        movement(username, moveCode);
        players[username].showSolutionSteps++;
        if (players[username].showSolutionSteps===hanoiArray.length)
            UiUpdateFeedback(username, "Solution Complete!");
    }
}


function resetGame(username){
    if (currentNumberOfPlayers>1){
        for(player in players)
            resetEachPlayer(player);
    }
    else
        resetEachPlayer(username);

    startCountDownButton.disabled = false;
    countdownLabelNo1.style.color = "grey";
    countdownLabelNo2.style.color = "grey";
    countdownLabelNo3.style.color = "grey";
    countdownLabelGo.style.color = "grey";
}

function resetEachPlayer(username){
        console.log("reset game")
    players[username].stopWatchStartTime=0;
    resetStopwatch(username);

    UiUpdateSteps(username, 0);

    for (let index = 0; index < players[username].tower1.length; index++) {
        UiRemoveDisc(username, towerNumber.tower1)        
    }

    for (let index = 0; index < players[username].tower2.length; index++) {
        UiRemoveDisc(username, towerNumber.tower2)        
    }

    for (let index2 = 0; index2 < players[username].tower3.length; index2++) {
        UiRemoveDisc(username, towerNumber.tower3)        
    }
    players[username].tower1=[];
    players[username].tower2=[];
    players[username].tower3=[];
    players[username].numberOfSteps = 0;
    players[username].fromTower= -1;
    players[username].toTower=-1;
    players[username].showSolutionSteps = 0;
    players[username].winner = "";

    generateTower(username, numberOfDisc);
    loadAllDiscToTower1(username);
    UiLoadDiscColor(username);
    UiUpdateFeedback(username, "Game Reset")
    if (currentNumberOfPlayers>1)
        IsStartNow = false;
    else
        IsStartNow = true;
}



