function main() {

// Defining canvas elements //
var cs  = document.getElementById('myCanvas');
var ctx = cs.getContext('2d');
var cx=cs.width;
var cy=cs.height;



// Initialization of the global parameters
var calcOn =false;

var dt = 0.2;
var ds = 1.2;

var pActAct=0.08, pInhAct=-0.08, pActC=0.1;
var pActInh=0.11, pInhInh=0, pInhC=-0.15;
var pActLimit=0.2, pInhLimit=0.5
var diffConstA=0.02; diffConstI=0.5;
var decayConstA=0.03, decayConstI=0.06;

// Parameters for diffusion and reaction
var parameterSet= new Array(100);
 for (var i=0; i<20; i++){
   parameterSet[i]=new Array(20);
 }

//preset parameter sets
parameterSet[0]=[0.08,-0.08,0.1,0.11,0,-0.15,0.2,0.5,0.02,0.5,0.03,0.06];
parameterSet[1]=[0.08,-0.08,0.01,0.11,0,-0.15,0.2,0.5,0.02,0.5,0.03,0.06];
parameterSet[2]=[0.08,-0.08,0.10 ,0.11,0,-0.15,0.2,0.5,0.01,0.5,0.03,0.09];
parameterSet[3]=[0.08,-0.08,0.2,0.11,0,-0.15,0.2,0.5,0.02,0.5,0.03,0.06];
parameterSet[4]=[0.08,-0.08,0,0.08,0,-0.13,0.9,0.4,0.015,0.09,0.03,0.019];
parameterSet[5]=[0.08,-0.092,0.0,0.06,0,-0.15,0.2,0.1,0.02,0.25,0.03,0.03];
parameterSet[6]=[0.09,-0.08,0,0.1,0,-0.15,0.5,0.5,0.01,0.01,0.03,0.03];
parameterSet[7]=[0.08,-0.08,0,0.11,0,-0.15,0.2,0.5,0.04,0.5,0.03,0.06];
parameterSet[8]=[2,-6,0,0.2,0,0,1,5,0.02,0,0.1,0.6];
parameterSet[9]=[0.09,-0.08,0,0.06,0,-0.19,0.2,0.5,0.01,0.03,0.03,0.03];
parameterSet[10]=[0.1,-0.08,0,0.11,0,-0.15,0.2,0.5,0.04,0.2,0.03,0.02];
















//Variables for drawing
  var fieldSize=100; //filed size
  var cellSize=6; //cell size


// Definition of arrays
    var actConc = new Array(100);
    var inhConc = new Array(100);
    var actDiffArray = new Array(100);
    var inhDiffArray = new Array(100);
    for (var i=0; i<100; i++){
      actConc[i]=new Array(100);
      inhConc[i]=new Array(100);
      actDiffArray[i]=new Array(100);
      inhDiffArray[i]=new Array(100);
    }


// Funtions called by button action
document.getElementById("runButton").addEventListener("click", handleRunButton);
document.getElementById("stopButton").addEventListener("click", handleStopButton);
document.getElementById("randomizeButton").addEventListener("click", handleRandomButton);
document.getElementById("clearButton").addEventListener("click", handleClearButton);

document.getElementById("xxx").addEventListener("click", changeParameterSet);



// Settings for the pen for drawing with mouse
  var drawing = false;
  var penDensity=100;
  var penSize=1;

// Listening to mouse actions
cs.addEventListener('mousedown', function(e) {
  drawing = true;
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var px=Math.floor(x/cellSize);
  var y = e.clientY - rect.top;
  var py=Math.floor(y/cellSize);
  pendrawing(px,py);
  });

cs.addEventListener('mousemove', function(e){
  if (!drawing){
    return
  };
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var px=Math.floor(x/cellSize);
  var y = e.clientY - rect.top;
  var py=Math.floor(y/cellSize);
  pendrawing(px,py);
});

cs.addEventListener('mouseup', function() {
  drawing = false;
});





// Main
randomizeArray();
drawSkin();

var intervalId;










// =========================== FUNCTIONS ===========================
// Run calculation
function runCalculation(){
  if (calcOn==true){
    drawSkin();
    for (i=0; i<50; i++){
      calcDiffusion();
      calcReaction();
    }
  }
}


// Drawing===========================

// Draw a single cell
function drawCell(px,py,c){
  var x =px*cellSize;           // coordinate of the cell
  var y =py*cellSize;
  var cc=c*50;
//    var cc=c*1;
  if (cc>240){
    cc=240;
  }
  ctx.fillStyle = "rgb(" + cc + "," + cc + "," + cc + ")";
  ctx.fillRect(x, y, cellSize, cellSize);
}
// Draw a whole skin
function drawSkin(){
  for (var i=0; i<100; i++){
    for  (var j=0; j<100; j++){
    　drawCell(i,j,actConc[i][j]);
}}}


//Handling Arrays===========================

//Set actConc and inhConc with random values (0~1)
function randomizeArray(){
  for (var i=0; i<100; i++){
    for  (var j=0; j<100; j++){
    actConc[i][j]=3*Math.random();
    inhConc[i][j]=3*Math.random();
}}}

//Set actConc and inhConc with 0
function clearArray(){
  for (var i=0; i<100; i++){
    for  (var j=0; j<100; j++){
    actConc[i][j]=0;
    inhConc[i][j]=0;
}}}

// Array for calculation of diffusion
function setDiffusionArray(){
  var root2=Math.sqrt(2);
  var pp=1;
  for (var i=0; i<100; i++){
    for  (var j=0; j<100; j++){
      var rightCell=actConc[(i+1)%100][j];
      var leftCell=actConc[(i+99)%100][j];
      var upperCell=actConc[i][(j+1)%100];
      var lowerCell=actConc[i][(j+99)%100];
      var rightUpper=actConc[(i+1)%100][(j+1)%100]*root2/pp;
      var leftUpper=actConc[(i+99)%100][(j+1)%100]*root2/pp;
      var rightDown=actConc[(i+1)%100][(j+99)%100]*root2/pp;
      var leftDown=actConc[(i+99)%100][(j+99)%100]*root2/pp;
      actDiffArray[i][j]=diffConstA*dt*(rightCell+leftCell+upperCell+lowerCell+rightUpper+leftUpper+rightDown+leftDown-(4+4*root2/pp)*actConc[i][j])/ds/ds;
      rightCell=inhConc[(i+1)%100][j];
      leftCell=inhConc[(i+99)%100][j];
      upperCell=inhConc[i][(j+1)%100];
      lowerCell=inhConc[i][(j+99)%100];
      rightUpper=inhConc[(i+1)%100][(j+1)%100]*root2/pp;
      leftUpper=inhConc[(i+99)%100][(j+1)%100]*root2/pp;
      rightDown=inhConc[(i+1)%100][(j+99)%100]*root2/pp;
      leftDown=inhConc[(i+99)%100][(j+99)%100]*root2/pp;
      inhDiffArray[i][j]=diffConstI*dt*(rightCell+leftCell+upperCell+lowerCell+rightUpper+leftUpper+rightDown+leftDown-(4+4*root2/pp)*inhConc[i][j])/ds/ds;
}}}

// Cacluation of diffusion
function calcDiffusion(){
  setDiffusionArray();
  for (var i=0; i<100; i++){
    for  (var j=0; j<100; j++){
    actConc[i][j]+=actDiffArray[i][j];
    inhConc[i][j]+=inhDiffArray[i][j];
}}}

// Calcuation of reaction terms
function calcReaction(){
  for (var i=0; i<100; i++){
    for  (var j=0; j<100; j++){
      var synAct=pActAct*actConc[i][j]+pInhAct*inhConc[i][j]+pActC;
      if (synAct<0){
        synAct=0;
      }
      if (synAct>pActLimit){
        synAct=pActLimit;
      }
      var synInh=pActInh*actConc[i][j]+pInhInh*inhConc[i][j]+pInhC;
      if (synInh<0){
        synInh=0;
      }
      if (synInh>pInhLimit){
        synInh=pInhLimit;
      }
      actConc[i][j]+=(-decayConstA*actConc[i][j]+synAct)*dt;
      inhConc[i][j]+=(-decayConstI*inhConc[i][j]+synInh)*dt;
}
}
}



// Button actions
function handleRunButton(){
  readParameter();
  calcOn = true;
  clearInterval(intervalId); // Clear previous if any
  const intervalBox = document.getElementById("interval-id");
  const interval = Number(intervalBox?.value || 100);
  intervalId = setInterval(runCalculation, interval);
}
  function handleStopButton(){
    calcOn=false;
  }
  function handleRandomButton(){
    randomizeArray();
    drawSkin();
  }
  function handleClearButton(){
    clearArray();
    drawSkin();
  }

  // retrieve parameter values
  function readParameter(){
    var box1 =document.getElementById("pActAct-id").value;
        pActAct=Number(box1);
    var box2=document.getElementById("pInhAct-id").value;
        pInhAct =Number(box2);
    var box3 = document.getElementById("pActC-id").value;
        pActC=Number(box3);
    var box4=document.getElementById("pActInh-id").value;
        pActInh=Number(box4);
    var box5=document.getElementById("pInhInh-id").value;
        pInhInh=Number(box5);
    var box6=document.getElementById("pInhC-id").value;
        pInhC=Number(box6);
    var box7=document.getElementById("pActLimit-id").value;
        pActLimit=Number(box7);
    var box8=document.getElementById("pInhLimit-id").value;
        pInhLimit=Number(box8);
    var box9=document.getElementById("diffConstA-id").value;
        diffConstA=Number(box9);
    var box10=document.getElementById("diffConstI-id").value;
        diffConstI=Number(box10);
    var box11=document.getElementById("decayConstA-id").value;
        decayConstA=Number(box11);
    var box12=document.getElementById("decayConstI-id").value;
        decayConstI=Number(box12);
  }


  // paramater change by the preset parameter set
  function changeParameterSet(){
    const x = document.formParameter.selectParameterSet;
    const num = x.selectedIndex;
    pActAct=parameterSet[num][0];
    pInhAct=parameterSet[num][1];
    pActC=parameterSet[num][2];
    pActInh=parameterSet[num][3];
    pInhInh=parameterSet[num][4];
    pInhC=parameterSet[num][5];
    pActLimit=parameterSet[num][6];
    pInhLimit=parameterSet[num][7];
    diffConstA=parameterSet[num][8];
    diffConstI=parameterSet[num][9];
    decayConstA=parameterSet[num][10];
    decayConstI=parameterSet[num][11];
    document.getElementById("pActAct-id").value=parameterSet[num][0];
    document.getElementById("pInhAct-id").value=parameterSet[num][1];
    document.getElementById("pActC-id").value=parameterSet[num][2];
    document.getElementById("pActInh-id").value=parameterSet[num][3];
    document.getElementById("pInhInh-id").value=parameterSet[num][4];
    document.getElementById("pInhC-id").value=parameterSet[num][5];
    document.getElementById("pActLimit-id").value=parameterSet[num][6];
    document.getElementById("pInhLimit-id").value=parameterSet[num][7];
    document.getElementById("diffConstA-id").value=parameterSet[num][8];
    document.getElementById("diffConstI-id").value=parameterSet[num][9];
    document.getElementById("decayConstA-id").value=parameterSet[num][10];
    document.getElementById("decayConstI-id").value=parameterSet[num][11];
  }


//drawing tool
  function pendrawing(x,y){
    for (i=x-penSize; i<x+penSize+1; i++){
        for (j=y-penSize; j<y+penSize+1; j++){
          var px=(i+100)%100;
          var py=(j+100)%100;
          drawCell(px,py,penDensity);
          actConc[i][j]=1;
    }
    }
  }
}

