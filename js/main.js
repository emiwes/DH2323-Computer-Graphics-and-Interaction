var container = document.getElementById("render");
WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;
RAINDROPS = [];
SPHERES = [];
TEXTURELOADER = new THREE.TextureLoader();
RAINENABLED = false;

// EPICENTER = new THREE.Vector2(0,0);
EPICENTERS = [];
STEP = new THREE.Clock();
// STEP = 0;
var stats = new Stats();
var ms_Water;
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );


function deg2rad(deg){
	var res = deg * (3.14 / 180);
	return res;
}

function init(){
	// create a WebGL renderer, camera
	// and a SCENE;
	CAMERA = new THREE.PerspectiveCamera( 45, WIDTH/HEIGHT, 0.1, 10000);
	SCENE = new THREE.Scene();

	// the camera starts at 0,0,0
	// so pull it back
	CAMERA.position.set( 300, 50, 300 );
	// CAMERA.rotation.y += 3*Math.PI/4;
	// CAMERA.rotation.x += Math.PI/8;
	// CAMERA.rotation.z += Math.PI;
	CAMERA.lookAt(new THREE.Vector3(0,0,0));
	SCENE.add(CAMERA);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	container.appendChild(renderer.domElement);

	//pointLight = new THREE.DirectionalLight(0x999911);
	pointLight = new THREE.PointLight(0x999911);

	// set its position
	pointLight.position.set( -600, 100, -600);
	SCENE.add(pointLight);

	ambLight = new THREE.AmbientLight(0x666666);
 	SCENE.add(ambLight);
	return SCENE;
}

function initSurface(){
	MATERIALS = [];
	var geometry = new THREE.PlaneGeometry( 2000, 2000, 96, 96);

	var waterN = TEXTURELOADER.load("img/waternormals2.jpg");
	waterN.wrapS = waterN.wrapT = THREE.RepeatWrapping;

	ms_Water1 = new THREE.Water(renderer, CAMERA, SCENE, {
		textureWidth: 256,
		textureHeight: 256,
		alpha: 0.9,
		sunDirection: pointLight.position.normalize(),
		sunColor: 0xffffff,
		waterNormals: waterN,
		waterColor: 0x001f4e,
		betaVersion: 0,
		side: THREE.DoubleSide,
		name: "ms_Water1"
	});

	var waterNorm = TEXTURELOADER.load("img/waternormals.jpg");
	waterNorm.wrapS = waterNorm.wrapT = THREE.RepeatWrapping;

	ms_Water2 = new THREE.Water(renderer, CAMERA, SCENE, {
		textureWidth: 256,
		textureHeight: 256,
		alpha: 0.9,
		sunDirection: pointLight.position.normalize(),
		sunColor: 0xffffff,
		waterNormals: waterNorm,
		waterColor: 0x001f4e,
		betaVersion: 0,
		side: THREE.DoubleSide,
		name: "ms_Water2"
	});
	ms_Water = ms_Water2;
	MATERIALS.push(ms_Water1);
	MATERIALS.push(ms_Water2);
	plane = new THREE.Mesh( geometry, ms_Water.material );
	plane.add(ms_Water);
	plane.name = "waterSurface";

	plane.rotation.x += (deg2rad(90));
	// plane.rotation.x = Math.PI * 0.5;
	SCENE.add( plane );
}

function initBottom(){
	var geometry = new THREE.PlaneGeometry( 2000, 2000, 1, 1);
	var texture = TEXTURELOADER.load('img/sand-texture.jpg');

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
	var path = "img/";
	var format = '.png';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];

	textureCube = new THREE.CubeTextureLoader().load( urls );
	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;
	var material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	} );
	var mesh = new THREE.Mesh( new THREE.BoxGeometry( 5000, 5000, 5000 ), material );
	mesh.position.y = -400;
	SCENE.add( mesh );
}

function addSphere(r,x,z){
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xCC0000
	});

	var radius = r;
	var segments = 32;
	var rings = 32;

	var sphereGeometry =  new THREE.SphereGeometry(	radius,	segments, rings);
	var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.userData = {"velocity": {"x":0, "y":0, "z":0}, "impact": false};
	sphere.name = "sphere"; 
	sphere.position.y = 50;
	sphere.position.x = x;
	sphere.position.z = z;
	SPHERES.push(sphere);
	SCENE.add(sphere);
}

function addRainDrops(amount){
	var textureLoader = new THREE.TextureLoader();
	var sprite = TEXTURELOADER.load("img/sprite1.png");

	var rainDropMaterial = new THREE.PointsMaterial({
		color: 0xb47e21,
		size: 2,
		map: sprite,
		blending: THREE.SubtractiveBlending,
		transparent: true,
		depthTest: false
	});

	var max = 1000;
	var min = -1000;

	var rainDropGeometry = new THREE.Geometry();

	for(var i = 0; i < amount; i++){
		var rainDrop = new THREE.Vector3();
		rainDrop.x = Math.random() * (max - min) + min;
		rainDrop.z = Math.random() * (max - min) + min;
		rainDrop.y = Math.random() * (350 - 100) + 100;
		rainDrop.userData = {"velocity": {"x":0,"y":-3,"z":0}};


		rainDropGeometry.vertices.push(rainDrop);
	}
	RAIN = new THREE.Points(rainDropGeometry, rainDropMaterial);
	// SCENE.add(RAIN);
}

function rainFall(){
	var max = 1000;
	var min = -1000;
	for (var i = 0; i < RAIN.geometry.vertices.length; i++){
		var drop = RAIN.geometry.vertices[i];
		drop.y += drop.userData.velocity.y;
		drop.userData.velocity.y -= 0.01;
		if(drop.y < 0){
			drop.x = Math.random() * (max - min) + min;
			drop.z = Math.random() * (max - min) + min;
			drop.y = Math.random() * (350 - 100) + 100;
			drop.userData.velocity.y = -3;
		}
	}
}


function floating(obj){
	var objPosition = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
	var raycaster = new THREE.Raycaster();
	obj.userData.velocity.y -= 0.2;

	raycaster.set( objPosition, new THREE.Vector3(0,-1,0) );
	var down = raycaster.intersectObjects( SCENE.children );
	raycaster.set( objPosition, new THREE.Vector3(0,1,0) );
	var up = raycaster.intersectObjects( SCENE.children );
	
	var yDiff;
	var r = obj.geometry.parameters.radius;
	var h = 2*r;


	if(down[0].object.name == "waterSurface"){
		yDiff = down[0].distance;
	}else if(up[0].object.name == "waterSurface"){
		yDiff = -up[0].distance;	
	}
	


	//sphere is touching the surface
	if(yDiff-r <= 0){
		//detect surface impact
		if(!obj.userData.impact){
			obj.userData.impact = true;
			var position = new THREE.Vector2(obj.position.x, obj.position.z);
			var mag = r;//obj.geomerty.parameters.radius;
			var wavelength = h;
			var decay = 0.5;
			var epi = new Epicenter(mag, decay, wavelength, position);
			EPICENTERS.push(epi);
		}
		//move in x,y direction due to waves
		var objNormal = down[0].face.normal;

		//h = amount of radius under water
		if(-yDiff < h) {
			h = -yDiff;
		}
		obj.userData.velocity.x /= 1.5;
		obj.userData.velocity.z /= 1.5;

		obj.userData.velocity.x += objNormal.x/10;
		obj.userData.velocity.z += objNormal.y/10;

		//submerged volyme
		//volume of sphere cap?
		var volSubmerged = ((3.14*h)/6)*(3*(Math.sqrt(h*(2*r-h)))^2+h^2);
		//volSubmerged *= 0.005;
		obj.userData.velocity.y += 0.01*volSubmerged;
		//obj.userData.velocity.x *= objNormal.x;
		//obj.userData.velocity.y *= objNormal.y;
		//obj.userData.velocity.z *= objNormal.z;
		if (obj.userData.velocity.y > 0.4){
			obj.userData.velocity.y = 0.4;
		}
	}

}

function render(){
	renderer.render(SCENE, CAMERA);
}

function animate(){
	requestAnimationFrame(animate);
	stats.begin();
	// console.dir(plane);
	var vLength = plane.geometry.vertices.length;

	for (var i = 0; i < vLength; i++) {
		//v.z is local to the plane. due to rotation this corresponds to global y
	    var v = plane.geometry.vertices[i];
	   //.geometry.attributes.position.array[i*3+1];
	    // console.log(v);
		v.z = 0;
	}

	for(var j in EPICENTERS){
		var wavelength = EPICENTERS[j].wavelength;
		var decay = EPICENTERS[j].decay;
		var deltaStep = STEP.getElapsedTime() - EPICENTERS[j].startTime;
		deltaStep*=5;

		var magnitude = EPICENTERS[j].magnitude;// - deltaStep;// * decay;
		var wavefront = deltaStep*wavelength;// + wavelength;

  		for (var i = 0; i < vLength; i++) {
		    var v = plane.geometry.vertices[i];
			var dist = new THREE.Vector2(v.x, v.y).sub(EPICENTERS[j].position).length();
			if(dist < wavefront){
				var vmagnitude = (magnitude*(dist/wavefront*decay));
				if(vmagnitude < 0.001 && deltaStep > 100){
					EPICENTERS.splice(j,1);
					break;
				}


				v.z += Math.sin(dist/wavelength - deltaStep) * vmagnitude;

			}
		}
	}


	if(RAINENABLED){
		rainFall();
		RAIN.geometry.verticesNeedUpdate = true;
	}

	for(var i = 0; i < SPHERES.length; i++){
		SPHERES[i].position.y += SPHERES[i].userData.velocity.y;
		SPHERES[i].position.x += SPHERES[i].userData.velocity.x;
		SPHERES[i].position.z += SPHERES[i].userData.velocity.z;
		floating(SPHERES[i]);
	}

	plane.geometry.computeFaceNormals();
	plane.geometry.verticesNeedUpdate = true;


	stats.end();
	ms_Water.material.uniforms.time.value += 1.0 / 60.0;
	ms_Water.render();
	render();
}



var SCENE = init();
initCtrl();
initBottom();
addSphere(10,0,0);
addRainDrops(50000);
initSurface();
initSkyBox();
animate();
