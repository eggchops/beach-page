const transColours = ['#72CDF4','#F9B8C3','#FFFFFF'];
const prideColours = ["#2E2E2E","#7A4D1F","#F42525","#FBA651","#F6E956","#5ABE29","#306EE8","#6F1AE6"];

const wavesLimit = 40;
const wavesCount = 9;

const gameTextOptions = [
	"sploosh!",
	"splash!",
	"wow!",
	"refreshing!",
	"i saw a jellyfish!"
];

const playEnabled = true;

let currentTheme = "standard-mode";
let gameState = false;
let interval;

window.onload = function(){
	if(window.matchMedia?.("(prefers-color-scheme:dark)").matches){
		toggleThemes();
	}
	// start();
}

// 	Animated Pride Flags
// 	Adapted for pure JS from https://www.joshwcomeau.com/animation/pride-flags 
function animateFlags(){
	const flagList = ["trans","pride"];
	flagList.forEach((flagName) =>{
		const numOfColumns = 10;
		const staggeredDelay = -50;
		for (let index = 0; index < numOfColumns; index++) {
			var node = `<div
				key=`+index+`
				class="column `+flagName+`"
				style="animation-delay:`+index*staggeredDelay+`ms;"
				/>`;
			document.getElementById(flagName).innerHTML += node;
		}
	});
}

// Configure the positioning and colours of confetti
function throwConfetti(colours, options=null){
	if(options){

	} else{
		options = {
			colors: colours,
			angle: 120,
			origin: {
				x: 0.9,
				y: 0.9
			},
			spread: 60
		};
	}
	confetti(options);
}

// Cycle between regular, dark mode, and high contrast
function toggleThemes(){
	var newTheme = "";
		switch(currentTheme){
			case "standard-mode":
				newTheme = "dark-mode";
				break;
			case "dark-mode":
				newTheme = "high-contrast-mode";
				break;
			case "high-contrast-mode":
			default:
				newTheme = "standard-mode";
				break;
		}
	document.querySelectorAll(".themeable").forEach((element) => {
		element.classList.remove(currentTheme);
		element.classList.add(newTheme);
	});
	currentTheme = newTheme;
}


function start(){
	gameState = !gameState;
	document.querySelector("#start-button").innerHTML = gameState 
		? "⏹" 
		:  "▶" ;
	if(!gameState){
		window.clearInterval(interval);
		document.querySelector(".game-container").innerHTML = "";
		window.onmousemove = null;
		incrementGameText(true);
		return;
	}
	generateNumbers(wavesCount);
	
	var splashTimeout = 20;
	
	// Update gamestate each interval
	interval = window.setInterval(() => { 
		var speedMod = 1;
		var wavesMod = wavesLimit;
		if(window.innerWidth < 800){
			speedMod = 2;
			wavesMod = 60;
		}
		document.querySelectorAll(".numbers").forEach((number) => {
			var right = number.getAttribute("data-right");
			if(right > wavesMod){
				right = wavesMod/2;
			}
			number.classList.remove("d-none");
			number.setAttribute("style","position:fixed;top:"
				+ number.getAttribute("data-top") +"; right:" 
				+ right + "%;transition: right " 
				+ number.getAttribute("data-speed")+"ms;"
			);
			right = parseInt(right) + speedMod;
			document.getElementById("waves_" + (number.getAttribute("id").replace("number_","")))
				.setAttribute("style","width:"+right+"%; transition: width "+number.getAttribute("data-speed")+"ms;");
			number.setAttribute("data-right",(right));

			// Player has touched a wave
			if(overlaps(document.querySelector("#player"),number) && splashTimeout >= 20){
				// document.getElementById("game-text").innerHTML = (splashTimeout > 30) ? "splash!" : "sploosh!";
				incrementGameText();
				splashTimeout = 0;
				throwConfetti(["#FFFFFF","#71C8F4"],{
					colors: ["#FFFFFF","#71C8F4"],
					origin:{
						x: 0.9,
						y: 0.3
					},
					angle:160,
					spread: 30
				});
			}
		});
		splashTimeout++;

	 },100);

	 if(playEnabled){
		window.onmousemove = function(e){
			var positionY = e.pageY - (document.querySelector("#player").getBoundingClientRect().height / 2);
			var positionX = e.pageX - (document.querySelector("#player").getBoundingClientRect().width / 2);

			document.querySelector("#player").setAttribute("style","position:absolute;top:"
				+positionY+"px;left:"+positionX+"px;");
		}
	}
}

function generateNumbers(count){
	let container = document.querySelector(".game-container");
	let template = `<div class="numbers d-none" id="number_{index}"
		data-right="{right}" data-top="{top}px" data-speed="{speed}"
		style="position:fixed;right:{right}%;top:{top}px;">
		<div class="waves" id="waves_{index_w}"></div>
		<div class="foam">
			<h1 class="d-none">{value}</h1>
		</div>
	</div>`;
	let numberObjects = "";
	var currentHeight = 0;
	for(var i=0; i<count;i++){
		numberObjects += template.replace("{index}",i)
			.replace("{right}",Math.floor(Math.random()/4 * 10))
			.replace("{top}",currentHeight)
			.replace("{speed}",Math.floor((Math.random()/2 + 0.3) * 1000))
			.replace("{index_w}",i)
			.replace("{value}",Math.floor(Math.random() * 10));
		currentHeight += 48;
	}
	let player = `<div id="player" style="position:absolute;right:50%;top:50%;display:none;">
		<h1>
			<i class="bi-person-fill"></i>
		</h1>
	</div>`;
	var game = document.createElement("div");
	game.innerHTML = player + numberObjects;
	container.appendChild(game);
}


// Collision-checking function sourced from https://stackoverflow.com/a/59435080
function overlaps(a, b) {
	const rect1 = a.getBoundingClientRect();
	const rect2 = b.getBoundingClientRect();
	const isInHoriztonalBounds =
	  rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x;
	const isInVerticalBounds =
	  rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
	const isOverlapping = isInHoriztonalBounds && isInVerticalBounds;
	return isOverlapping;
}

function incrementGameText(stop = false){
	document.getElementById("game-text").innerHTML = stop 
		? "&nbsp;" 
		: gameTextOptions[Math.floor(Math.random() * gameTextOptions.length)];
}