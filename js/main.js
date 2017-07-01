var scene, camera, renderer;
var geometry, material, light, raycaster, cubes, wallMaterial, floorMaterial, vector;

var CUBE_SIZE = 1000;
var W_KEY_CODE = 87;
var A_KEY_CODE = 65;
var S_KEY_CODE = 83;
var D_KEY_CODE = 68;

var maze = [[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
			[ 1, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
			[ 1, 0, 1, 0, 1, 1, 1, 1, 0, 1 ],
			[ 1, 0, 1, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 1, 0, 1, 1, 0, 1, 0, 1 ],
			[ 1, 0, 0, 0, 0, 1, 1, 1, 1, 1 ],
			[ 1, 0, 1, 1, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 1, 0, 0, 0, 1, 1, 1, 1 ],
			[ 1, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]];

init();
animate()

function init() {
	cubes = [];
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500000 );
	camera.position.set( 3000, 0, 3000 );

	vector = new THREE.Vector3( 0, 0, -1 );
	vector.applyQuaternion( camera.quaternion );
	raycaster = new THREE.Raycaster( camera.position, vector, 0, 1000 );
	
    geometry = new THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
    wallMaterial = new THREE.MeshLambertMaterial( { color: 0x999999, wireframe: false } );
	floorMaterial = new THREE.MeshLambertMaterial( { color: 0x990000, wireframe: false } );
	
	light = new THREE.PointLight( 0xFFFFFF, 1,3000 );
	setLightPos();
	
	//fog = new THREE.Fog( 0x990000, 1, 7000 )
	//scene.fog = fog;
	
	scene.add( light );
	
	var posX = 0;
	var posZ = 0;
	var wallPosY = 0;
	var floorPosY = -1000;
	
	for(var x = 0; x < maze.length; x++) {
		var row = maze[x];
		for(var y = 0; y < row.length; y++) {
			if(row[y] === 1) {
				cubes.push(new THREE.Mesh( geometry, wallMaterial ));
				scene.add(cubes[cubes.length-1]);
				cubes[cubes.length-1].position.setX(posX);
				cubes[cubes.length-1].position.setZ(posZ);
				cubes[cubes.length-1].position.setY(wallPosY);
			}
			else if(row[y] === 0) {
				cubes.push(new THREE.Mesh( geometry, floorMaterial ));
				scene.add(cubes[cubes.length-1]);
				cubes[cubes.length-1].position.setX(posX);
				cubes[cubes.length-1].position.setZ(posZ);
				cubes[cubes.length-1].position.setY(floorPosY);
			}
			posX = posX + CUBE_SIZE;
		}
		posX = 0;
		posZ = posZ + CUBE_SIZE;
	}
	
	//camera.lookAt( cubes[0].position );
	
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function animate() {
    requestAnimationFrame( animate );

    renderer.render( scene, camera );

}

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == W_KEY_CODE) {
        // up arrow
		var isCollision = checkCollision();
        if(!isCollision) {
            camera.translateZ( -CUBE_SIZE );
            setLightPos();
        }
    }
    else if (e.keyCode == S_KEY_CODE) {
        // down arrow
		camera.rotation.y += 180 * Math.PI / 180;
    }
    else if (e.keyCode == A_KEY_CODE) {
       // left arrow
	   camera.rotation.y += 90 * Math.PI / 180;
    }
    else if (e.keyCode == D_KEY_CODE) {
       // right arrow
	   camera.rotation.y -= 90 * Math.PI / 180;
    }
}

function checkCollision() {
	vector = new THREE.Vector3( 0, 0, -1 );
	vector.applyQuaternion( camera.quaternion );
	raycaster.set( camera.position, vector );
	console.log(raycaster.intersectObjects( scene.children, false )[0]);
    if(raycaster.intersectObjects( scene.children, false )[0]) {
        return true;
    }
    return false;
}

function setLightPos() {
	light.position.set( camera.position.x, camera.position.y, camera.position.z );
}