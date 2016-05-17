function initCtrl(){
	var drag = false;
	document.body.addEventListener("mousedown", function(){
		drag = true;
	});

	document.body.addEventListener("mouseup", function(){
		drag = false;
	});

	document.body.addEventListener("mousemove", function(){
		if(drag){
			rotateCamera(event);
		}
	});

	document.addEventListener("mousewheel", function(){
		event.preventDefault();
		zoomCamera(event);
	});

	document.body.addEventListener("keydown", function(){
		switch(event.code){
			case "KeyW":
				panCamera("y",4);
				break;
			case "KeyA":
				panCamera("x", -2);
				break;
			case "KeyS":
				panCamera("y",-2);
				break;
			case "KeyD":
				panCamera("x", 2);
				break;
		}
	});
}

function panCamera(dir, amount){
	if(dir == "y"){
		camera.position[dir] += amount;
	}else if(dir == "x"){
		camera.translateX( amount);
	}
}

function rotateCamera(e){
	var x = e.movementX;
	var y = e.movementY;

	camera.rotation.y += Math.sin(-x*0.01);
	camera.rotation.x += Math.sin(-y*0.01);
}

function zoomCamera(e){
	camera.translateZ( - e.wheelDeltaY*0.1);
}
