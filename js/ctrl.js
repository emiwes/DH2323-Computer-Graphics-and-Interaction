function initCtrl(){
	var drag = false;
	document.body.addEventListener("mousedown", function(){
		drag = true;
	});

	document.body.addEventListener("click", function(){
		clickObject(event);
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
		
		camera.translateX(amount);
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

function clickObject(e){
	var mouseVector = new THREE.Vector3();
	var raycaster = new THREE.Raycaster();

	mouseVector.x = 2 * (e.clientX / WIDTH) - 1;
  	mouseVector.y = 1 - 2 * ( e.clientY / HEIGHT );
	raycaster.setFromCamera( mouseVector, camera );	
	var intersects = raycaster.intersectObjects( SCENE.children );
	console.log(intersects);
	if(intersects[0].object.name == "waterSurface"){
		console.log("clicked water")
		EPICENTER.x = intersects[0].point.x;
		EPICENTER.y = intersects[0].point.z;
		STEP = 0;
	}
	// intersects[0].object.material.color.r = Math.random();
	// intersects[0].object.material.color.g = Math.random();
	// intersects[0].object.material.color.b = Math.random();
}

