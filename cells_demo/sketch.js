let particles = [];
let nInitParticles = 3;
let maxParticles = 70;
let gravitionalConst = 10;
let massMin = 0.0001
let massMax = 100;
let dragCoef = -0.999;
let growthRate = 0.05;
let splitProb = 0.001;
let deathProb = 0.0001;

function setup() {
    createCanvas(393, 743);
    colorMode(HSL);
    stroke(255);
    strokeWeight(10);

    // Voronoi stuff
    voronoiCellStroke(0);
    voronoiCellStrokeWeight(5);
    voronoiSiteFlag(false);

    // Create particles
    for (let i = 0; i < nInitParticles; i++) {
        let p = new Particle(random(width), random(height), massMin, random(0, 360), random(20, 80), random(20, 80));
        particles.push(p);
    }

}
function mousePressed() {
    if (particles.length > 2) {
        // DIRTY, DIRTY CODE

        // Getting siteId, not cellID
        let diagram = voronoiGetDiagram();
        let cellId = voronoiGetSite(mouseX, mouseY);
        let x = diagram['cells'][cellId]['site']['x'];
        let y = diagram['cells'][cellId]['site']['y'];

        // Finding corresponding particle
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].position.x == x && particles[i].position.y == y) {

                // Removing particle
                particles.splice(i, 1);
                return;
            }
        }
    }
}

function draw() {

    clear();
    background(10);

    voronoiClearSites();

    // Removing dead particles
    particles = particles.filter(function (x) {return x.alive});

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        voronoiSite(particles[i].position.x, particles[i].position.y, particles[i].getColor());
        particles[i].display();
    }

    voronoi(width, height, false);
    voronoiDraw(0, 0, true, false);

}

class Particle {
    constructor(x, y, m, h, s, l) {
        this.mass = m;
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.hue = h;
        this.saturation = s;
        this.lightness = l;
        this.alive = true;
    }

    getColor() {
        return color(this.hue, this.saturation, this.lightness);
    }

    applyForce(f) {
        this.acceleration.add(p5.Vector.div(f, this.mass));
    }

    update() {


        // Calculating repulsion with other particles
        for (let i = 0; i < particles.length; i++) {
            if (particles[i] != this) {
                let distance = this.position.dist(particles[i].position);
                let magnitude = -gravitionalConst * this.mass * particles[i].mass / distance**2

                let force = p5.Vector.sub(particles[i].position, this.position);
                force.normalize();

                force.setMag(magnitude);

                this.applyForce(force);

            }
        }

        // Adding repulsion from sides
        // Left
        let distance = -this.position.x;
        let magnitude = -gravitionalConst * this.mass * massMax / distance**2

        let force = createVector(distance, 0);
        force.normalize();

        force.setMag(magnitude);

        this.applyForce(force);

        // Right
        distance = width - this.position.x;
        magnitude = -gravitionalConst * this.mass * massMax / distance**2

        force = createVector(distance , 0);
        force.normalize();

        force.setMag(magnitude);

        this.applyForce(force);

        // Top
        distance = -this.position.y;
        magnitude = -gravitionalConst * this.mass * massMax / distance**2

        force = createVector(0, distance);
        force.normalize();

        force.setMag(magnitude);

        this.applyForce(force);

        // Bottom
        distance = height - this.position.y;
        magnitude = -gravitionalConst * this.mass * massMax / distance**2

        force = createVector(0, distance);
        force.normalize();

        force.setMag(magnitude);

        this.applyForce(force);

        // Adding drag (proportional to velocity)
        let drag = p5.Vector.mult(this.velocity, dragCoef);
        this.applyForce(drag);

        // Updating acceleration, velocity and position
        this.velocity.add(this.acceleration);

        // Caping velocity
        this.velocity.setMag(constrain(this.velocity.mag(), 0, 5));

        this.position.add(this.velocity);
        this.acceleration.mult(0);

        // Growing
        if (this.mass < massMax) {
            this.mass += growthRate;
        }

        // Splitting
        if (random() < splitProb && particles.length < maxParticles) {
            this.split();

        }

        // Dying
        if (random() < deathProb && particles.length > 1) {
            this.alive = false;
        }

    }

    split() {
        this.mass /= 2;
        particles.push(new Particle(this.position.x + 10, this.position.y + 10, this.mass, this.hue + random(-50, 50), this.saturation + random(-10, 10), this.lightness + random(-10, 10)));
    }

    display() {
        point(this.position.x, this.position.y);
    }
}
