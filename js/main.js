var container = document.getElementById("render");
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

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
	scene.add(camera);

	// the camera starts at 0,0,0
	// so pull it back
	camera.position.set( 0, 100, 300 );
	camera.rotation.x += 50;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	container.appendChild(renderer.domElement);

	pointLight = new THREE.PointLight(0xFF00FF);

	// set its position
	pointLight.position.set( 10, 50, 130);
	scene.add(pointLight);

	ambLight = new THREE.AmbientLight(0x333333);
 	scene.add(ambLight);
	return scene;
}

function initPlane(){
	var geometry = new THREE.PlaneGeometry( 500, 500, 256, 256);
	var texture = THREE.ImageUtils.loadTexture('img/water-texture.jpg');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 4, 4 );

	var material = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide, map: texture
	});

	plane = new THREE.Mesh( geometry, material );

	plane.rotation.x += (deg2rad(90));
	scene.add( plane );
}

function addSphere(){
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xCC0000
	});

	var radius = 50;
	var segments = 16;
	var rings = 16;

	var sphereGeometry =  new THREE.SphereGeometry(	radius,	segments, rings);
	sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
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

var scene = init();
initCtrl();
initPlane();
addSphere();
animate();
