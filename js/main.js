var container = document.getElementById("render");
var WIDTH = window.innerWidth;
	  HEIGHT = window.innerHeight;

var step = 0;


function deg2rad(deg){
	var res = deg * (3.14 / 180);
	console.log(res);
	return res;
}

function init(){


	// set some camera attributes
	var VIEW_ANGLE = 45,
	  ASPECT = WIDTH / HEIGHT,
	  NEAR = 0.1,
	  FAR = 10000;

	// create a WebGL renderer, camera
	// and a scene;
	camera =
	  new THREE.PerspectiveCamera(
	    VIEW_ANGLE,
	    ASPECT,
	    NEAR,
	    FAR);

	scene = new THREE.Scene();

	// add the camera to the scene
	scene.add(camera);

	// the camera starts at 0,0,0
	// so pull it back
	camera.position.z = 300;
	camera.position.y = 100;
	camera.rotation.x += 50;


	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	container.appendChild(renderer.domElement);
	

	pointLight =
 	new THREE.PointLight(0xFF00FF);

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add to the scene
	scene.add(pointLight);

	ambLight =
 	new THREE.AmbientLight(0x333333);

 	scene.add(ambLight);

	
	return scene;
}

function initPlane(){

	var geometry = new THREE.PlaneGeometry( 500, 500, 256, 256);
	var texture = THREE.ImageUtils.loadTexture('img/water-texture.jpg');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 4, 4 );

	var material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide, map: texture} );
	var plane = new THREE.Mesh( geometry, material );

	plane.rotation.x += (deg2rad(90));
	scene.add( plane );
	return plane;
}

function addSphere(){

	var sphereMaterial =
	new THREE.MeshLambertMaterial(
	{
	color: 0xCC0000
	});
	var radius = 50,
	segments = 16,
	rings = 16;

	// create a new mesh with
	// sphere geometry - we will cover
	// the sphereMaterial next!
	sphere = new THREE.Mesh(

	new THREE.SphereGeometry(
	radius,
	segments,
	rings),

	sphereMaterial);

	// add the sphere to the scene
	scene.add(sphere);
}



function render(){
	step += 0.01;
	pointLight.position.y = Math.sin(step)*300; 
	pointLight.position.x = 75 - Math.cos(step)* 75; 
	

	renderer.render(scene, camera);
}

function animate(){
	requestAnimationFrame(animate);


	render();
}

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


var scene = init();
initCtrl();
initPlane();
addSphere();
animate();