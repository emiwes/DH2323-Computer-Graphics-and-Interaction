function initCtrl(){
	var dragCamera = false;
	var dragSphere = false;
	document.body.addEventListener("mousedown", function(){
		if(getTargetObject(event).object.name === "sphere"){
			draggingObj = getTargetObject(event);
			dragSphere = true;
		}
		else{
			dragCamera = true;
		}
	});

	document.body.addEventListener("click", function(){
		clickObject(event);
	});

	document.body.addEventListener("contextmenu", function(){
		addSphereAt(event);
	});

	document.body.addEventListener("mouseup", function(){
		dragCamera = false;
		dragSphere = false;
	});

	document.body.addEventListener("mousemove", function(){
		if( dragCamera ){
			rotateCamera(event);
		}
		else if( dragSphere ){
			translateSphere(event, draggingObj);
		}
	});

	document.addEventListener("mousewheel", function(){
		event.preventDefault();
		zoomCamera(event);
	});

	document.body.addEventListener("keydown", function(){
		switch(event.code){
			case "KeyW":
				panCamera("z",-4);
				break;
			case "KeyA":
				panCamera("x", -4);
				break;
			case "KeyS":
				panCamera("z", 4);
				break;
			case "KeyD":
				panCamera("x", 4);
				break;
			case "Space":
				EPICENTERS = [];
				break;
			case "KeyR":
				panCamera("y", 4);
				break;
			case "KeyF":
				panCamera("y", -4);
				break;
		}
	});
}

function panCamera(dir, amount){
	if(dir == "y"){
		CAMERA.position[dir] += amount;
	}else if(dir == "x"){
		CAMERA.translateX(amount);
	}else if(dir == "z"){
		CAMERA.translateZ(amount);
	}
}

function rotateCamera(e){
	var x = e.movementX;
	var y = e.movementY;

	CAMERA.rotateY(Math.sin(-x*0.01));
	CAMERA.rotateX(Math.sin(-y*0.01));
}

function zoomCamera(e){
	CAMERA.translateZ( - e.wheelDeltaY*0.1);
}

function clickObject(e){
	var intersectedObject = getTargetObject(e);
	if( intersectedObject.object.name == "waterSurface" ){
		var position =  new THREE.Vector2(intersectedObject.point.x, intersectedObject.point.z);
		var mag = Math.random()*10;
		// var mag = 6.0;
		//var randomWaveLengthFactor = Math.floor(Math.random() * 10) + 1;
		var wavelength = mag*3;
		var decay = 1;
		var epi = new Epicenter(mag, decay, wavelength, position);
		EPICENTERS.push(epi);
		//console.log(EPICENTERS);
		// STEP = 0;
	}
	// intersects[0].object.material.color.r = Math.random();
	// intersects[0].object.material.color.g = Math.random();
	// intersects[0].object.material.color.b = Math.random();
}

function getTargetObject(e){
	var mouseVector = new THREE.Vector3();
	var raycaster = new THREE.Raycaster();

	mouseVector.x = 2 * (e.clientX / WIDTH) - 1;
  	mouseVector.y = 1 - 2 * ( e.clientY / HEIGHT );
	raycaster.setFromCamera( mouseVector, CAMERA );
	var intersects = raycaster.intersectObjects( SCENE.children );
	return intersects[0];
}

function translateSphere(e, sphere){
	var mouseX = e.movementX;
	var mouseY = e.movementY;

	sphere.object.position.x += mouseX;
	sphere.object.position.z += mouseY;
}

function addSphereAt(e){
	e.preventDefault();
	var intersectedObject = getTargetObject(e);
	if( intersectedObject.object.name == "waterSurface"){
		if(SPHERES.length >= 5){
			var obj = SPHERES.splice(0,1)[0];
			obj.position.x = intersectedObject.point.x;
			obj.position.z = intersectedObject.point.z;
			obj.position.y = 50;
			obj.userData.impact = false;
			obj.userData.velocity = {"x":0,"y":0,"z":0}
			SPHERES.push(obj);
		}else{
			addSphere(10, intersectedObject.point.x, intersectedObject.point.z);
		}
	}
}
