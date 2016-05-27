var container = document.getElementById("render");
WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;
RAINDROPS = [];
SPHERES = [];

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
	CAMERA.position.set( 300, 50, 300 );
	// CAMERA.rotation.y += 3*Math.PI/4;
	// CAMERA.rotation.x += Math.PI/8;
	// CAMERA.rotation.z += Math.PI;
	CAMERA.lookAt(new THREE.Vector3(0,0,0));
	SCENE.add(CAMERA);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	container.appendChild(renderer.domElement);

	pointLight = new THREE.DirectionalLight(0xffff55);

	// set its position
	pointLight.position.set( -600, 100, -600);
	SCENE.add(pointLight);

	//ambLight = new THREE.AmbientLight(0x666666);
 	//SCENE.add(ambLight);
	return SCENE;
}

function initSurface(){
	var geometry = new THREE.PlaneGeometry( 2000, 2000, 96, 96);
	// var texture = THREE.ImageUtils.loadTexture('img/water.jpg');
	// texture.wrapS = THREE.RepeatWrapping;
	// texture.wrapT = THREE.RepeatWrapping;
	// texture.repeat.set( 4, 4 );


	var waterN = new THREE.ImageUtils.loadTexture("img/waternormals.jpg");
	waterN.wrapS = waterN.wrapT = THREE.RepeatWrapping;

	ms_Water = new THREE.Water(renderer, CAMERA, SCENE, {
		textureWidth: 256, 
		textureHeight: 256, 
		alpha: 0.9, 
		sunDirection: pointLight.position.normalize(), 
		sunColor: 0xffffff, 
		waterNormals: waterN, 
		waterColor: 0x001f4e, 
		betaVersion: 0, 
		side: THREE.DoubleSide
	});

	// var material = new THREE.MeshLambertMaterial({
	// 	color: 0xffffff,
	// 	side: THREE.DoubleSide,
	// 	map: texture,
	// 	transparent: true,
	// 	opacity: 0.5
	// });

	// console.log("MirrorShader");


	// var mirrorShader = THREE.ShaderLib["MirrorShader"];
	// var mirrorShader = THREE.ShaderLib["cube"];
	// mirrorShader.uniforms[ "tCube" ].value = textureCube;
	// var material = new THREE.ShaderMaterial({
	// 	// fragmentShader: mirrorShader.fragmentShader
	// 	// , vertexShader: mirrorShader.vertexShader
	// 	// , opacity: 0.5
	// 	// , side: THREE.DoubleSide
	// 	fragmentShader: mirrorShader.fragmentShader,
	// 	vertexShader: mirrorShader.vertexShader,
	// 	uniforms: mirrorShader.uniforms,
	// 	depthWrite: false,
	// 	side: THREE.DoubleSide
	// });

	// var shader = THREE.ShaderLib["test"];

	// var material = new THREE.ShaderMaterial({
	// 	fragmentShader: shader.fragmentShader
	// 	, vertexShader: shader.vertexShader
	// 	, side: THREE.DoubleSide
	// })

	plane = new THREE.Mesh( geometry, ms_Water.material );
	plane.add(ms_Water);
	plane.name = "waterSurface";

	plane.rotation.x += (deg2rad(90));
	// plane.rotation.x = Math.PI * 0.5;
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
	sphere.userData = {"yVelocity": 0, "xzVelocity": {"x":0, "z":0}};
	sphere.name = "sphere";
	sphere.position.y = 50;
	sphere.position.x = x;
	sphere.position.z = z;
	SPHERES.push(sphere);
	SCENE.add(sphere);
}

function addRainDrops(amount){
	var textureLoader = new THREE.TextureLoader();
	var sprite = textureLoader.load("img/sprite.png");
	var rainDropMaterial = new THREE.PointsMaterial({
		color: 0x990099,
		size: 10,
		map: sprite,
		blending: THREE.AdditiveBlending,
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
		rainDrop.userData = {"yVelocity": 0};

		rainDropGeometry.vertices.push(rainDrop);
	}
	RAIN = new THREE.Points(rainDropGeometry, rainDropMaterial);
	SCENE.add(RAIN);
}

function rainFall(){
	var max = 1000;
	var min = -1000;
	for (var i = 0; i < RAIN.geometry.vertices.length; i++){
		var drop = RAIN.geometry.vertices[i];
		drop.y += drop.userData.yVelocity;
		drop.userData.yVelocity -= 0.01;
		if(drop.y < 0){
			drop.x = Math.random() * (max - min) + min;
			drop.z = Math.random() * (max - min) + min;
			drop.y = Math.random() * (350 - 100) + 100;
			drop.userData = {"yVelocity": 0};
		}
	}
}


function floating(obj){
	var objPosition = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
	var raycaster = new THREE.Raycaster();

	raycaster.set( objPosition, new THREE.Vector3(0,-1,0) );
	var under = raycaster.intersectObjects( SCENE.children );
	raycaster.set( objPosition, new THREE.Vector3(0,1,0) );
	var above = raycaster.intersectObjects( SCENE.children );
	var yDiff = 100;// gardcoded due to that yDiff need to be set in frame 1.
	var r = obj.geometry.parameters.radius;
	//var v0 = obj.userData.yVelocity;
	obj.userData.yVelocity -= 0.098;

	//the ball is above the surface
	if(under[0].object.name == "waterSurface"){
		yDiff = under[0].distance;
		// console.log(under[0].object.geometry);
		// console.log(obj);
		// console.log(under[0].object.geometry.vertices[under[0].face.b]);
		// console.log(under[0].object.geometry.vertices[under[0].face.c]);
		//obj.userData.yVelocity -= 0.098;
		
		
		

		

		//the ball is under the surface
	}else if(above[0].object.name == "waterSurface"){
		yDiff = -above[0].distance;

		
	}
	//detect obj impact
	if(yDiff-r < r && obj.userData.yVelocity < -1){
		var position = new THREE.Vector2(obj.position.x, obj.position.z);
		var h = yDiff-r;
		var mag = h;//obj.geomerty.parameters.radius;
		var wavelength = mag*3;
		var decay = 0.5;
		var epi = new Epicenter(mag, decay, wavelength, position);
		EPICENTERS.push(epi);
	}
	//sphere are touching the surface
	if(yDiff-r <= 0){
		//move in x,y direction due to waves
		var objNormal = under[0].face.normal;

		//h = amount of radius under water
		var h = 2*r;
		if(-yDiff < 2*r) {
			h = -yDiff;
		}
		obj.userData.xzVelocity.x /= 1.1;
		obj.userData.xzVelocity.z /= 1.1;

		obj.userData.xzVelocity.x += objNormal.x;
		obj.userData.xzVelocity.z += objNormal.y;

		//submerged volyme
		//volume of obj cap?
		var volSubmerged = ((3.14*h)/6)*(3*(Math.sqrt(h*(2*r-h)))^2+h^2);
		//var volSubmerged = h/r;
		obj.userData.yVelocity += 0.005*volSubmerged;
		if (obj.userData.yVelocity > 0.4){
			obj.userData.yVelocity = 0.4;
		}
	}

}

function render(){


	// STEP += 0.07;

	// pointLight.position.y = Math.sin(STEP)*300;
	// pointLight.position.x = 75 - Math.cos(STEP)* 75;

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

	for(var k in RAINDROPS){
		RAINDROPS[k].position.y += RAINDROPS[k].userData.yVelocity;
		//floating(RAINDROPS[k]);
		RAINDROPS[k].userData.yVelocity -= 0.098;
		if(RAINDROPS[k].position.y< -50){
			RAINDROPS.splice(k,1);
		}
	}
	for(var i = 0; i < SPHERES.length; i++){
		SPHERES[i].position.y += SPHERES[i].userData.yVelocity;
		SPHERES[i].position.x += SPHERES[i].userData.xzVelocity.x;
		SPHERES[i].position.z += SPHERES[i].userData.xzVelocity.z;
		floating(SPHERES[i]);
	}
	rainFall();
	
	plane.geometry.computeFaceNormals();
	plane.geometry.verticesNeedUpdate = true;
	RAIN.geometry.verticesNeedUpdate = true;

	stats.end();
	ms_Water.material.uniforms.time.value += 1.0 / 60.0;

	ms_Water.render();
	render();
}



var SCENE = init();
initCtrl();
initBottom();
addSphere(10,0,0);
addRainDrops(50250);
initSurface();
initSkyBox();
animate();
