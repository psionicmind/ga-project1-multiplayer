// Reference: https://www.youtube.com/watch?v=OUWFY1qY47Y by Adson Paulo Aug 30, 202

// import {startStopwatch, stopStopwatch, stopWatchStartTime } from './helperClass/stopwatch.js';

// const socket = io("ws://localhost:8080");
// const socket = io("ws://192.168.0.109:8080");// point to server ip address


// LOGIC
// Shared variables among multiplayers
const movements={
    t1tot2: 12,
    t1tot3: 13,
    t2tot1: 21,
    t2tot3: 23,
    t3tot1: 31,
    t3tot2: 32,
}

const towerNumber={
    Tower1:0,
    Tower2:1,
    Tower3:2,
}

let numberOfDisc = 3;
let discFlashWaitTime = 50;
let countDownWaitTime = 200;
let hanoiArray=[];
let players = [];
const maxSidebySidePlayers = 2;
let currentNumberOfSidebySidePlayers = 1;
// x3
// let htmlTowers = document.querySelectorAll('.tower')

// x1
// let feedback = document.querySelector(".feedback")
// let steps = document.querySelector(".steps")

// let container = document.querySelectorAll(".container")[0]
var baseContainer = document.getElementsByClassName("container")[0];
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

        this.stopWatchStartTime=0; // to keep track of the start time
        this.stopwatchInterval=null; // to keep track of the interval
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
                    
                    let keys = Object.keys(players)
                    for (let index = 0; index < keys.length; index++) {
                        console.log(`keys[index]= ${keys[index]}`);                        
                        console.log(`type of keys[index] = ${typeof(keys[index])}`);                        
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
        // players[username].tower1 = structuredClone(players[mainPlayerName].tower1);
        // players[username].tower2 = structuredClone(players[mainPlayerName].tower2);
        // players[username].tower3 = structuredClone(players[mainPlayerName].tower3);
        players[username].tower1 = [...players[mainPlayerName].tower1];
        players[username].tower2 = [...players[mainPlayerName].tower2];
        players[username].tower3 = [...players[mainPlayerName].tower3];
    }

    AssignElementsToDerivedClass(username);// ui    
    if (IsMainPlayer){
        generateTower(username, numberOfDisc); // data
        UiCreateDisc(username);                // ui
        loadAllDiscToTower1(username);         // ui
        UiUpdateFeedback(username, "Welcome to Tower of Hanoi !")        
    }
    else{
        resetGame(username)
        UiUpdateFeedback(username, "Welcome to Tower of Hanoi !")
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

// sideBySidePlayerName = getSidebySidePlayerName();

addPlayer(mainPlayerName, true);




function deletePlayer(username){
    // get container by id and remove
    document.getElementById(username).remove();
    delete players[username];    
    currentNumberOfSidebySidePlayers--;
}

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
        UiMoveDisc(username, towerNumber.Tower1, towerNumber.Tower2)
        return true;
    }
    else
        return false;
}

function t1tot3(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower1, players[username].tower3)){
        players[username].tower3.push(players[username].tower1.pop())
        UiMoveDisc(username, towerNumber.Tower1, towerNumber.Tower3)
        return true;
    }
    else
        return false;
}

function t2tot1(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower2, players[username].tower1)){    
        players[username].tower1.push(players[username].tower2.pop())
        UiMoveDisc(username, towerNumber.Tower2, towerNumber.Tower1)        
        return true;
    }
    else
        return false;
}

function t2tot3(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower2, players[username].tower3)){    
        players[username].tower3.push(players[username].tower2.pop())
        UiMoveDisc(username, towerNumber.Tower2, towerNumber.Tower3)
        return true;
    }
    else
        return false;
}

function t3tot1(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower3, players[username].tower1)){    
        players[username].tower1.push(players[username].tower3.pop())
        UiMoveDisc(username, towerNumber.Tower3, towerNumber.Tower1)        
        return true;
    }
    else
        return false;
}

function t3tot2(username){
    if(rulesCheckIsMovedDiscSmallerThanTargetTower(username, players[username].tower3, players[username].tower2)){    
        players[username].tower2.push(players[username].tower3.pop())
        UiMoveDisc(username, towerNumber.Tower3, towerNumber.Tower2)        
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

addSidePlayerButton.addEventListener('click', function(event) {
    if (currentNumberOfSidebySidePlayers < maxSidebySidePlayers){
        sideBySidePlayerName = getSidebySidePlayerName();
        addPlayer(sideBySidePlayerName, false);
        currentNumberOfSidebySidePlayers++;
        if (currentNumberOfSidebySidePlayers === maxSidebySidePlayers){
            addSidePlayerNameEditBox.placeholder = "No more can be added";    
            addSidePlayerButton.disabled = true;
        }
        else
            addSidePlayerNameEditBox.placeholder = placeholderNames[Math.floor(Math.random() * placeholderNames.length)];

        // make race feature enabled
        startCountDownButton.style.visibility = "visible";
        countdownLabelNo3.style.visibility = "visible";
        countdownLabelNo2.style.visibility = "visible";
        countdownLabelNo1.style.visibility = "visible";
        countdownLabelGo.style.visibility = "visible";        
    }
});

startCountDownButton.addEventListener('click', function(event) {
    startCountDown();
});

// this eventlistener is only for player or players(2) playing on one browser.
document.addEventListener('keydown', function(event) {
    // console.log(typeof (event.key)) // it is a string
    if(event.key == 1) {
        username = mainPlayerName;
        UiUpdateFeedback(username, " ");
        if (players[username].fromTower!=-1){
            players[username].toTower = towerNumber.Tower1;
            toTowerSelectedPostProcess(username);
        }
        else{
            players[username].fromTower = towerNumber.Tower1;
            fromTowerSelectedPostProcess(username, towerNumber.Tower1);
        }
    }
    else if(event.key == 2) {
        username = mainPlayerName;        
        UiUpdateFeedback(username, " ");        
        if (players[username].fromTower!=-1){
            players[username].toTower = towerNumber.Tower2;
            toTowerSelectedPostProcess(username);
        }            
        else{
            players[username].fromTower = towerNumber.Tower2;
            fromTowerSelectedPostProcess(username, towerNumber.Tower2);
        }
    }
    else if(event.key == 3) {
        username = mainPlayerName;        
        UiUpdateFeedback(username, " ");        
        if (players[username].fromTower!=-1){
            players[username].toTower = towerNumber.Tower3;
            toTowerSelectedPostProcess(username);
        }            
        else{
            players[username].fromTower = towerNumber.Tower3
            fromTowerSelectedPostProcess(username, towerNumber.Tower3);
        }
    }
    if(event.key == 'z') {
        username = sideBySidePlayerName;  
        UiUpdateFeedback(username, " ");          
        if (players[username].fromTower!=-1){
            players[username].toTower = towerNumber.Tower1;
            toTowerSelectedPostProcess(username);
        }            
        else{
            players[username].fromTower = towerNumber.Tower1;
            fromTowerSelectedPostProcess(username, towerNumber.Tower1);
        }
    }
    else if(event.key == 'x') {
        username = sideBySidePlayerName;  
        UiUpdateFeedback(username, " ");  
        if (players[username].fromTower!=-1){
            players[username].toTower = towerNumber.Tower2;
            toTowerSelectedPostProcess(username);
        }            
        else{
            players[username].fromTower = towerNumber.Tower2;
            fromTowerSelectedPostProcess(username, towerNumber.Tower2);
        }
    }
    else if(event.key == 'c') {
        username = sideBySidePlayerName;  
        UiUpdateFeedback(username, " ");          
        if (players[username].fromTower!=-1){
            players[username].toTower = towerNumber.Tower3;
            toTowerSelectedPostProcess(username);
        }            
        else{
            players[username].fromTower = towerNumber.Tower3
            fromTowerSelectedPostProcess(username, towerNumber.Tower3);
        }
    }

});

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
        console.log("YOU WIN!");
        stopStopwatch(username);
    }
    return false;
}


function IsTowerEmpty(username, checkTower){
    if ((checkTower ===towerNumber.Tower1) && (players[username].tower1.length==0)){
        console.log(`nothing from that tower ${checkTower} `);
        players[username].fromTower=-1; //global variable is updated
        players[username].toTower=-1;   //global variable is updated         
        return true;
    }
    else if ((checkTower ===towerNumber.Tower2) && (players[username].tower2.length==0)){
        console.log(`nothing from that tower ${checkTower} `);
        players[username].fromTower=-1;
        players[username].toTower=-1;            
        return true;
    }
    if ((checkTower ===towerNumber.Tower3) && (players[username].tower3.length==0)){
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
        UiUpdateFeedback(username, "YOU WIN!");
        AnnounceWinnerFreezeGame(username);
        // app.say("You Win!")        
        return true;
    }
    else
        return false;
}

function AnnounceWinnerFreezeGame(username){
    const message = {"username": username, "action":"win"}
    // socket.emit("message", message);
    for (player in players){
        console.log(player)
        if (player != username){
            UiUpdateFeedback(player, "You LOSE!");
        }

    }
}

//HTML

function UiCreateDisc(username){
    for (let index = 0; index < numberOfDisc; index++) {
        // let basePlate = document.getElementsByClassName('base-plate');
        let tempDisc = document.createElement("div");
        tempDisc.classList.add('disc');  // so can use disc class at css
        tempDisc.style.backgroundColor = discColors[index];
        // tempDisc.style.width = basePlate.style.width - (index * 10);
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
        UiInsertDisc(username, players[username].discs[index], towerNumber.Tower1);    
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
    // setTimeout( ()=>{
    // console.log(`${n}, ${from_Tower}, ${to_Tower}, ${aux_Tower}`)
    if (n===0){
        console.log("return")
        return;
    }
    // (async () => {
        hanoiAlgo2(n-1, from_Tower, aux_Tower, to_Tower);
        // console.log(`move disc ${n} from ${from_Tower} to ${to_Tower}`);
        console.log(`move disc from ${from_Tower} to ${to_Tower}`);
        hanoiArray.push({from_Tower, to_Tower});
        // document.dispatchEvent(new KeyboardEvent('keydown', {'key': from_Tower}));

        // https://www.sitepoint.com/delay-sleep-pause-wait/
        // // sleep2(1000);
        // // await sleep(1000);
        // document.dispatchEvent(new KeyboardEvent('keydown', {'key': to_Tower}));
        hanoiAlgo2(n-1, aux_Tower, to_Tower, from_Tower);
    // })();
    // }, 1000)
}

// hanoiAlgo1(numberOfDisc, towerNumber.Tower1+1, towerNumber.Tower3+1, towerNumber.Tower2+1)
hanoiAlgo2(numberOfDisc, towerNumber.Tower1+1, towerNumber.Tower3+1, towerNumber.Tower2+1)
console.log(hanoiArray)



// https://www.educative.io/answers/how-to-create-a-stopwatch-in-javascript
function startStopwatch(username) {
    if (!players[username].stopwatchInterval) {
        players[username].stopWatchStartTime = new Date().getTime() - players[username].elapsedPausedTime; // get the starting time by subtracting the elapsed paused time from the current time
        players[username].stopwatchInterval = setInterval(updateStopwatch(username), 1000); // update every second
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

// point from index.hmtl directly
function resetGame(username){
    console.log("reset game")
    players[username].elapsedPausedTime=0;
    players[username].stopWatchStartTime=0;
    resetStopwatch(username);

    // reset Steps Data and UI
    UiUpdateSteps(username, 0);

    for (let index = 0; index < players[username].tower1.length; index++) {
        UiRemoveDisc(username, towerNumber.Tower1)        
    }

    for (let index = 0; index < players[username].tower2.length; index++) {
        UiRemoveDisc(username, towerNumber.Tower2)        
    }

    for (let index2 = 0; index2 < players[username].tower3.length; index2++) {
        UiRemoveDisc(username, towerNumber.Tower3)        
    }
    players[username].tower1=[];
    players[username].tower2=[];
    players[username].tower3=[];
    players[username].numberOfSteps = 0;
    players[username].fromTower= -1;
    players[username].toTower=-1;
    players[username].showSolutionSteps = 0;

    generateTower(username, numberOfDisc);
    loadAllDiscToTower1(username);
    UiLoadDiscColor(username);
    UiUpdateFeedback(username, "Game Reset")
}



