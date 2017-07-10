var scene, camera, renderer;
var geometry, material, light, raycaster, cubes, wallMaterial, floorMaterial, vector, sprites;



var CUBE_SIZE = 1000;

// Maze setup constants
var SHADOW_DEMON = 3;
var PLAYER = 2;
var WALL = 1;
var EMPTY_FLOOR = 0;

// Input constants
var W_KEY_CODE = 87;
var A_KEY_CODE = 65;
var S_KEY_CODE = 83;
var D_KEY_CODE = 68;

var player;

var maze = [[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
			[ 1, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
			[ 1, 0, 1, 0, 1, 1, 1, 1, 0, 1 ],
			[ 1, 0, 1, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 1, 0, 1, 1, 0, 1, 0, 1 ],
			[ 1, 0, 0, 0, 0, 1, 1, 1, 1, 1 ],
			[ 1, 0, 1, 1, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 1, 0, 0, 0, 1, 1, 1, 1 ],
			[ 1, 0, 0, 0, 1, 0, 0, 0, 2, 1 ],
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]];

init();
animate()

function init() {
	cubes = [];
	sprites = [];
    scene = new THREE.Scene();
	
    geometry = new THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
    wallMaterial = new THREE.MeshLambertMaterial( { color: 0x999999, wireframe: false } );
	floorMaterial = new THREE.MeshLambertMaterial( { color: 0x990000, wireframe: false } );
	
	var posX = 0;
	var posZ = 0;
	var wallPosY = 0;
	var floorPosY = -CUBE_SIZE;
	
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500000 );
	for(var x = 0; x < maze.length; x++) {
		var row = maze[x];
		for(var y = 0; y < row.length; y++) {
			if(row[y] === WALL) {
				cubes.push(new THREE.Mesh( geometry, wallMaterial ));
				scene.add(cubes[cubes.length-1]);
				cubes[cubes.length-1].position.setX(posX);
				cubes[cubes.length-1].position.setZ(posZ);
				cubes[cubes.length-1].position.setY(wallPosY);
			}
			else if(row[y] === EMPTY_FLOOR) {
				cubes.push(new THREE.Mesh( geometry, floorMaterial ));
				scene.add(cubes[cubes.length-1]);
				cubes[cubes.length-1].position.setX(posX);
				cubes[cubes.length-1].position.setZ(posZ);
				cubes[cubes.length-1].position.setY(floorPosY);
			}
			else if(row[y] === PLAYER) {
				cubes.push(new THREE.Mesh( geometry, floorMaterial ));
				scene.add(cubes[cubes.length-1]);
				cubes[cubes.length-1].position.setX(posX);
				cubes[cubes.length-1].position.setZ(posZ);
				cubes[cubes.length-1].position.setY(floorPosY);
				camera.position.set( posX, wallPosY, posZ );
			}
			else if(row[y] === SHADOW_DEMON) {
				cubes.push(new THREE.Mesh( geometry, floorMaterial ));
				scene.add(cubes[cubes.length-1]);
				cubes[cubes.length-1].position.setX(posX);
				cubes[cubes.length-1].position.setZ(posZ);
				cubes[cubes.length-1].position.setY(floorPosY);

				var spriteMap = new THREE.TextureLoader().load( "img/Shadow_Demon.png" );
				var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff, fog: true  } );
				var width = spriteMaterial.map.image.width;
				var height = spriteMaterial.map.image.height;
				var sprite = new THREE.Sprite( spriteMaterial );
				sprite.scale.set(width, height, 1);
				sprite.position.set( posX, wallPosY, posZ );
				sprites.push(sprite);
				scene.add( sprite );
			}
			posX = posX + CUBE_SIZE;
		}
		posX = 0;
		posZ = posZ + CUBE_SIZE;
	}

	vector = new THREE.Vector3( 0, 0, -1 );
	vector.applyQuaternion( camera.quaternion );
	raycaster = new THREE.Raycaster( camera.position, vector, 0, 1000 );

	light = new THREE.PointLight( 0xFFFFFF, 1,3000 );
	setLightPos();
	
	//fog = new THREE.Fog( 0x990000, 1, 7000 )
	//scene.fog = fog;
	
	scene.add( light );
	
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );
	// TODO replace prompt with a GUI interface
	var name = prompt('Please enter your name');
	var potion = createItem(new HpRecovery(50), 'Potion', 'A tasty beverage that recovers 50 HP.')
	player = createPerson(new Player(), name, 100, [potion]);
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function getCameraFacing() {
	var vector = new THREE.Vector3(0, 0, -1);
	vector.applyQuaternion(camera.quaternion);
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
		getCameraFacing();
    }
    else if (e.keyCode == A_KEY_CODE) {
       // left arrow
	   camera.rotation.y += 90 * Math.PI / 180;
	   getCameraFacing();
    }
    else if (e.keyCode == D_KEY_CODE) {
       // right arrow
	   camera.rotation.y -= 90 * Math.PI / 180;
	   getCameraFacing();
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

// Person functions
function createPerson(type, name, maxHp, inventory) {
	return _.assign(
		type, {
		name: name, 
		maxHp: maxHp,
		hp: maxHp, 
		inventory: inventory
	});
}

function Player() {
	this.getInventory = function() {
		return this.inventory;
	}
}

// Item functions
function createItem(type, name, description) {
	return _.assign(
		type, {
		name: name, 
		description:description
	});
}

function HpRecovery(amount) {
	this.amount = amount;
	this.useItem = function(person) {
		person.hp = person.hp + this.amount;
	}
}

// Player screen functions
$('#inventory-btn').click(function() {
	if(document.getElementById('display-screen').innerHTML === '') {
		var source = $('#inventory-template').html();
		var template = Handlebars.compile(source);
		var context = player.getInventory();
		var html = template(context);
		document.getElementById('display-screen').innerHTML = html;
	} else {
		document.getElementById('display-screen').innerHTML = '';
	}
});

$('#player-stats-btn').click(function() {
	if(document.getElementById('display-screen').innerHTML === '') {
		var source = $('#player-stats-template').html();
		var template = Handlebars.compile(source);
		var context = player;
		var html = template(context);
		document.getElementById('display-screen').innerHTML = html;
	} else {
		document.getElementById('display-screen').innerHTML = '';
	}
});