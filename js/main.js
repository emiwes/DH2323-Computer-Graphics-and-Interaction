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
	// create a WebGL renderer, camera
	// and a SCENE;
	CAMERA = new THREE.PerspectiveCamera( 45, WIDTH/HEIGHT, 0.1, 10000);
	SCENE = new THREE.Scene();

	// the camera starts at 0,0,0
	// so pull it back
	CAMERA.position.set( 0, 100, 300 );
	CAMERA.rotation.x += 50;
	SCENE.add(CAMERA);

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
	plane.position.y = -50;
	SCENE.add( plane );
}

function initSkyBox(){
	var path = "img/skybox/";
	var format = '.jpg';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];

	var textureCube = new THREE.CubeTextureLoader().load( urls );
	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;
	var material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	} ),
	mesh = new THREE.Mesh( new THREE.BoxGeometry( 1500, 1500, 1500 ), material );
	SCENE.add( mesh );
}

function addSphere(){
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xCC0000
	});

	var radius = 10;
	var segments = 32;
	var rings = 32;

	var sphereGeometry =  new THREE.SphereGeometry(	radius,	segments, rings);
	sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.userData = {"yVelocity": 0};
	sphere.name = "sphere";
	SCENE.add(sphere);
}


function floating(obj){
	var objPosition = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
	var raycaster = new THREE.Raycaster();

	raycaster.set( objPosition, new THREE.Vector3(0,-1,0) );	
	var under = raycaster.intersectObjects( SCENE.children );
	raycaster.set( objPosition, new THREE.Vector3(0,1,0) );	
	var above = raycaster.intersectObjects( SCENE.children );
	var yDiff = 0;
	if(under[0].object.name == "waterSurface"){
		//yDiff = -under[0].distance;
		obj.userData.yVelocity -= 0.05;
	}else if(above[0].object.name == "waterSurface"){
		//yDiff = above[0].distance;
		obj.userData.yVelocity += 0.02;
	}
	//obj.userData.yVelocity += yDiff*0.1;

}

function render(){

	STEP += 0.07;

	// pointLight.position.y = Math.sin(STEP)*300;
	// pointLight.position.x = 75 - Math.cos(STEP)* 75;

	renderer.render(SCENE, CAMERA);
}

function animate(){
	requestAnimationFrame(animate);
	//define wave origin
	//v.z is local to the plane. due to rotation this corresponds to global y
	var magnitude = 3.0;
	var size = 5.0;
	var decay = 0.1;
	var vLength = plane.geometry.vertices.length;
	if (STEP < magnitude/decay){
	  	for (var i = 0; i < vLength; i++) {
		    var v = plane.geometry.vertices[i];
		    var dist = new THREE.Vector2(v.x, v.y).sub(EPICENTER);
			v.z = Math.sin(dist.length()/size - STEP) * (magnitude - STEP*decay);
		}
	// animate floating ball

	// var dist = new THREE.Vector2(sphere.position.x, sphere.position.z).sub(EPICENTER);		
	// sphere.position.y =  Math.sin((dist.length())/size - (STEP)) * (magnitude - STEP*decay);
	sphere.position.y += sphere.userData.yVelocity;
	floating(sphere);

	}


	plane.geometry.verticesNeedUpdate = true;
	render();
}


var SCENE = init();
initSkyBox();
initCtrl();
initSurface();
initBottom();
addSphere();
animate();
