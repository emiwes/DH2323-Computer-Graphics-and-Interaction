var container = document.getElementById("render");
WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;
EPICENTER = new THREE.Vector2(0,0);
STEP = 0;

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
	// and a SCENE;
	camera =
	  new THREE.PerspectiveCamera(
	    VIEW_ANGLE,
	    ASPECT,
	    NEAR,
	    FAR);

	SCENE = new THREE.Scene();
	SCENE.add(camera);

	// the camera starts at 0,0,0
	// so pull it back
	camera.position.set( 0, 100, 300 );
	camera.rotation.x += 50;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	container.appendChild(renderer.domElement);


	pointLight = new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.set( 10, 250, 130);
	SCENE.add(pointLight);

	ambLight = new THREE.AmbientLight(0x333333);
 	SCENE.add(ambLight);
	return SCENE;
}

function initSurface(){
	var geometry = new THREE.PlaneGeometry( 500, 500, 256, 256);
	var texture = THREE.ImageUtils.loadTexture('img/water-texture.jpg');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 4, 4 );


	var material = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide, 
		map: texture,
		transparent: true,
		opacity: 0.5
	});

	plane = new THREE.Mesh( geometry, material );
	plane.name = "waterSurface";

	plane.rotation.x += (deg2rad(90));
	SCENE.add( plane );
}

function initBottom(){
	var geometry = new THREE.PlaneGeometry( 500, 500, 1, 1);
	var texture = THREE.ImageUtils.loadTexture('img/sand-texture.jpg');

	var material = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide, 
		map: texture
	});

	var plane = new THREE.Mesh( geometry, material );

	plane.rotation.x += (deg2rad(90));
	plane.position.y = -100;
	SCENE.add( plane );
}

function addSphere(){
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xCC0000
	});

	var radius = 50;
	var segments = 32;
	var rings = 32;

	var sphereGeometry =  new THREE.SphereGeometry(	radius,	segments, rings);
	sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	SCENE.add(sphere);
}

function render(){
	STEP += 0.07;

	// pointLight.position.y = Math.sin(STEP)*300; 
	// pointLight.position.x = 75 - Math.cos(STEP)* 75; 
	
	renderer.render(SCENE, camera);
}

function animate(){
	requestAnimationFrame(animate);
	//define wave origin
	//v.z is local to the plane. due to rotation this corresponds to global y
	var magnitude = 7.0;
	var size = 10.0;
	var decay = 0.1;
	var vLength = plane.geometry.vertices.length;
	if (STEP < magnitude/decay){
	  	for (var i = 0; i < vLength; i++) {
		    var v = plane.geometry.vertices[i];
		    var dist = new THREE.Vector2(v.x, v.y).sub(EPICENTER);		    
			v.z = Math.sin(dist.length()/size - STEP) * (magnitude - STEP*decay);
		}
	// animate floating ball
	var dist = new THREE.Vector2(sphere.position.x, sphere.position.z).sub(EPICENTER);		
	sphere.position.y =  Math.sin((dist.length())/size - (STEP)) * (magnitude - STEP*decay);
	}

	plane.geometry.verticesNeedUpdate = true;
	render();
}


var SCENE = init();
initCtrl();
initSurface();
initBottom();
addSphere();
animate();
