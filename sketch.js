w = 800;
h = 800;
const offset = 100;
const perlinScale = .001;
const perlinScale2 = .5;
const pscale = {x: 1, y: 1};
seed = Date.now();
seed = 1599539141173;

console.log(seed);


// inCircle and helper functions

function inCircle(p1, p2, p3){ 
  let side=getSides(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
  let a=side.a, b=side.b, c=side.c; 
  let inCenter=getIncenter(a, b, c, p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]); 
  let inRadius=getInradius(a, b, c); 
  return([inCenter.x, inCenter.y, inRadius]);
} 
function getSides(Ax, Ay, Bx, By, Cx, Cy){ 
  return { 
    a: dist(Bx, By, Cx, Cy), 
    b: dist(Cx, Cy, Ax, Ay), 
    c: dist(Ax, Ay, Bx, By), 
  } 
} 
function getIncenter(a, b, c, x1, y1, x2, y2, x3, y3){ 
  return { 
    x: (a*x1 + b*x2 + c*x3)/(a + b + c), 
    y: (a*y1 + b*y2 + c*y3)/(a + b + c) 
  } 
} 
function getInradius(a, b, c){ 
  let s=(a+b+c)/2    // Semi-perimeter 
  let area=sqrt(s*(s-a)*(s-b)*(s-c)) 
  return area/s 
} 

// End inCircle


function splitcurve(pts, t) {
    var p0 = [pts[0],pts[1]], p1 = [pts[2],pts[3]], p2 = [pts[4],pts[5]], p3 = [pts[6],pts[7]];

    if (p0[0] == p1[0] && p0[1] == p1[1] && p2[0] == p3[0] && p2[1] == p3[1]) {
    	let p4 = [int(p1[0] + (p2[0]-p1[0])/2.5), int(p1[1] + (p2[1]-p1[1])/2)];
    	let firsthalf = [p0[0], p0[1], p0[0], p0[1], p4[0], p4[1], p4[0], p4[1]];
    	let secondhalf = [p4[0], p4[1], p4[0], p4[1], p3[0], p3[1], p3[0], p3[1]];
    	return [firsthalf, secondhalf];
    } else {
	    let p4 = larp(p0, p1, t);
	    let p5 = larp(p1, p2, t);
	    let p6 = larp(p2, p3, t);
	    let p7 = larp(p4, p5, t);
	    let p8 = larp(p5, p6, t);
	    let p9 = larp(p7, p8, t);

	    let firsthalf = [p0[0], p0[1], p4[0], p4[1], p7[0], p7[1], p9[0], p9[1]];
	    let secondhalf =  [p9[0], p9[1], p8[0], p8[1], p6[0], p6[1], p3[0], p3[1]];
	    return [firsthalf, secondhalf];
	}
}


function getDistance(x1, y1, x2, y2) {
	
	let xs = x2 - x1,
		ys = y2 - y1;		
	
	xs *= xs;
	ys *= ys;
	 
	return Math.sqrt( xs + ys );
};

function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

function checkCircles(x, y, circles, r) {
	for (let k = 0; k < circles.length; k++) {
		if (getDistance(circles[k][0], circles[k][1], x, y) < circles[k][2] + r) {
			return false;
		}
	}
	return true;
}

function packCircles(circles, radius, count, colors, startx, starty, wide, high, polygon){
	let bandwidth = w / colors.length;
	for (let i = 0; i < count; i++) {
		let x = Math.floor(random() * wide + startx),
			y = Math.floor(random() * high + starty);
		if (checkCircles(x, y, circles, radius) == false) {
			continue;
		}
		if (inside([x,y], polygon)) {
			//continue;
		}
		mycolor = colors[Math.floor(random()*colors.length)];

		circles.push([x, y, radius, mycolor]);

		let x1 = x;
		let y1 = y;
		let r = radius;
		for (let j = 0; j < 20; j++) {
			let g = field[int(x1/pscale.x)][int(y1/pscale.y)];
			if (x > w/2) {
				g += Math.PI;
			}
			let inc = r*0.2;
			let xy = toXY(x1, y1, r+r-inc, g);
			x1 = xy.x;
			y1 = xy.y;
			if (x1 < 0 || y1 < 0 || x1 > w || y1 > h) {
				break;
			}
			if (checkCircles(x1, y1, circles, r-inc-.01) == false) {
				break;
			}
			r -= inc;
			circles.push([x1, y1, r, mycolor]);
		}
	}
}


function cmyk(x, y, c, m, yl, k) {
	let radius = 20;
	let ksize = radius * k;
	let csize = radius * c + ksize;
	let msize = radius * m + csize;
	let ysize = radius * yl + msize;
	noStroke();
	fill('green');
	circle(x, y, ysize);
	fill('red');
	circle(x, y, msize);
	fill('blue');
	circle(x, y, csize);
	fill('black');
	circle(x, y, ksize);
}


function toXY(xoff, yoff, r, theta) {
	let x1 = r * cos(theta);
  	let y1 = r * sin(theta);
  	return {x: x1 + xoff, y: y1 + yoff};
}


function initField(xsize, ysize, scale) {
	let field = [];
	for (let x = 0; x < xsize; x++) {
		tf = []
		for (let y = 0; y < xsize; y++) {
			tf.push((openSimplex.noise2D(x*scale, y*scale)*Math.PI));
		}
		field.push(tf.slice());
	}
	return field;
}



function preload() {
  //img = loadImage('woman.png');
}

const openSimplex = openSimplexNoise(seed);

function setup() {
	setAttributes('antialias', true);
	smooth();
	createCanvas(w+200, h+200);
	noLoop();
	randomSeed(seed);

	colorMode(HSB);
	background(color(45, 20, 90));
	background('#DDDDDD');

	colors = [
			 [color('#303841'),
			  color('#00adb5'),
			  color('#FFFFFF'),
			  color('#ff5722')], 

		 	 [color('#f0f0e0'),
		 	  color('#fdcb4a'),
		 	  color('#72777d'),
		 	  color('#41444b')]
		 	 ];

	circles = [];

	field = initField(w/pscale.x + offset*2, h/pscale.y + offset*2, perlinScale);
}


function draw() {

	polygon = [
			  [700, 0],
			  [random()*400+400, 400],
			  [random()*400+400, 400],
			  [random()*400+400, 400],
			  [100, 800],
			  [random()*400, 400],
			  [random()*400, 400],
			  [random()*400, 400]
			  ];

	packCircles(circles, 150, 1, colors[0], 0, 0, w, h, polygon);
	//circles.push([w/2, h/2, 150, color('#DDDDDD')]);
	packCircles(circles, 70, 20, colors[0], 0, 0, w, h, polygon);
	packCircles(circles, 30, 200, colors[0], 0, 0, w, h, polygon);
	packCircles(circles, 20, 1000, colors[0], 0, 0, w, h, polygon);
	packCircles(circles, 10, 1000, colors[0], 0, 0, w, h, polygon);
	packCircles(circles, 5, 20000, colors[0], 0, 0, w, h, polygon);
	grid = [];
	const spacing = 30;
	stroke('black');
	noStroke();
	cache = createGraphics(w, h);
	cache.noStroke();
	translate(100, 100);
	for (let i = 0; i < circles.length; i++) {
		fill(circles[i][3]);
		let x = circles[i][0];
		let y = circles[i][1];
		let r = circles[i][2];
		let rt = 0;
		if (x > w/2) {
			rt = Math.PI;
		}
		let x1 = toXY(x, y, r, field[int(x/pscale.x)][int(y/pscale.y)] + rt).x;
			let y1 = toXY(x, y, r, field[int(x/pscale.x)][int(y/pscale.y)] + rt).y;
			let x2 = toXY(x, y, r, field[int(x/pscale.x)][int(y/pscale.y)] + (Math.PI*2)/3+.5 + rt).x;
			let y2 = toXY(x, y, r, field[int(x/pscale.x)][int(y/pscale.y)] + (Math.PI*2)/3+.5 + rt).y;
			let x3 = toXY(x, y, r, field[int(x/pscale.x)][int(y/pscale.y)] + (Math.PI*2)*(2/3)-.5 + rt).x;
			let y3 = toXY(x, y, r, field[int(x/pscale.x)][int(y/pscale.y)] + (Math.PI*2)*(2/3)-.5 + rt).y;
		if (random() > .5) {
			triangle(x1, y1, x2, y2, x3, y3);
		} else {
			circle(x, y, r*1.5);
			triangle(x1, y1, x2, y2, x3, y3);
		}
	}
	//image(cache, 100, 100);
}