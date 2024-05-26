export const createBoidsSketch = (
  parent,
  width,
  height,
  isRunning,
  options
) => {
  return (p5) => {
    // Eerst maken we een lege lijst met alle vissen (ookwel boids in het algoritme).
    const flock = [];

    p5.setup = () => {
      const canvas = p5.createCanvas(width, height);
      canvas.parent(parent);

      // In die lijst zetten we nieuwe boids.
      for (let i = 0; i < options.count; i++) {
        let boid = new Boid(
          p5.random(0, width),
          p5.random(0, height),
          p5,
          options
        );
        flock.push(boid);
      }

      // We geven de laatste flock een andere kleur, zodat er altijd eentje te vinden is.
      // We nemen de laatste zodat deze altijd te zien is boven alle andere boids.
      if (options.highlight) {
        flock[flock.length - 1].highlight = true;
      }
    };

    p5.draw = () => {
      p5.clear();
      if (!isRunning()) return;
      for (let i = 0; i < flock.length; i++) {
        flock[i].run(flock, p5);
      }
    };
  };
};

class Boid {
  constructor(x, y, p5, options) {
    // De acceleratie van de boid.
    this.acceleration = p5.createVector(0, 0);
    // De snelheid van de boid.
    this.velocity = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.velocity.mult(3);
    // De positie van de boid.
    this.position = p5.createVector(x, y);
    this.radius = options.radius;
    // De maximale snelheid van de boid.
    this.maxSpeed = options.maxSpeed || 3.0;
    // De maximale kracht waarmee de boid mag worden gestuurd.
    this.maxForce = options.maxForce || 0.05;

    this.enableSeparation = options.separation;
    this.enableAlignment = options.alignment;
    this.enableCoheseion = options.cohesion;
    this.showVectors = options.showVectors;

    this.highlight = false;
  }

  run(flock, p5) {
    const { separation, alignment, cohesion } = this.flock(flock, p5);

    this.update();
    this.checkBorders(p5);
    this.render(p5);

    if (this.showVectors) {
      this.renderVectors(
        p5,
        this.showVectors.separation ? separation : null,
        this.showVectors.alignment ? alignment : null,
        this.showVectors.cohesion ? cohesion : null
      );
    }
  }

  flock(flock, p5) {
    let separation = this.enableSeparation ? this.seperate(flock, p5) : null;
    let alignment = this.enableAlignment ? this.align(flock, p5) : null;
    let cohesion = this.enableCoheseion ? this.cohesion(flock, p5) : null;

    if (this.enableSeparation) separation.mult(3.0);
    if (this.enableAlignment) alignment.mult(1.0);
    if (this.enableCoheseion) cohesion.mult(1.0);

    if (this.enableSeparation) this.applyForce(separation);
    if (this.enableAlignment) this.applyForce(alignment);
    if (this.enableCoheseion) this.applyForce(cohesion);

    return { separation, alignment, cohesion };
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);

    this.position.add(this.velocity);

    // We zetten de acceleratie na iedere ronde weer op 0.
    this.acceleration.mult(0);
  }

  checkBorders(p5) {
    const r = this.radius * 2;
    if (this.position.x < -r) this.position.x = p5.width + r;
    if (this.position.y < -r) this.position.y = p5.height + r;
    if (this.position.x > p5.width + r) this.position.x = -r;
    if (this.position.y > p5.height + r) this.position.y = -r;
  }

  render(p5) {
    const theta = this.velocity.heading() + p5.radians(90);
    p5.strokeWeight(Math.ceil(this.radius / 10));
    if (this.highlight) {
      p5.fill("#e35e5e");
      p5.stroke("#911919");
    } else {
      p5.fill("#5eb9e3");
      p5.stroke("#196b91");
    }
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(theta);
    p5.beginShape();
    p5.vertex(0, -this.radius * 2);
    p5.vertex(-this.radius, this.radius * 2);
    p5.vertex(this.radius, this.radius * 2);
    p5.endShape(p5.CLOSE);

    p5.pop();
  }

  renderVectors(p5, separation, alignment, cohesion) {
    if (separation) {
      separation.mult(1000);
      if (separation.mag() > 1) {
        drawArrow(p5, this.position, separation, "#ff0000");
      }
    }

    if (alignment) {
      alignment.mult(1000);
      if (alignment.mag() > 1) {
        drawArrow(p5, this.position, alignment, "#00ff00");
      }
    }

    if (cohesion) {
      cohesion.mult(1000);
      if (cohesion.mag() > 1) {
        drawArrow(p5, this.position, cohesion, "#0000ff");
      }
    }
  }

  seperate(flock, p5) {
    const desiredSeparation = this.radius * 4;
    let steer = p5.createVector(0, 0);
    let count = 0;

    // Voor iedere boid, check of deze te dichtbij is.
    for (let i = 0; i < flock.length; i++) {
      let distance = p5.constructor.Vector.dist(
        this.position,
        flock[i].position
      );

      // Als de afstand meer dan 0 is en minder is dan de gewenste afstand:
      // (De afstand is 0 als het deze boid zelf is)
      if (distance > 0 && distance < desiredSeparation) {
        // Bereken de vector die weg wijst van de boid ernaast.
        let difference = p5.constructor.Vector.sub(
          this.position,
          flock[i].position
        );
        difference.normalize();
        steer.add(difference);
        count++;
      }
    }

    // Pak het gemiddelde van de stuurkracht, zodat deze niet te groot is.
    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  align(flock, p5) {
    const neighbourDistance = this.radius * 10;
    let totalVelocity = p5.createVector(0, 0);
    let count = 0;

    for (let i = 0; i < flock.length; i++) {
      let distance = p5.constructor.Vector.dist(
        this.position,
        flock[i].position
      );
      if (distance > 0 && distance < neighbourDistance) {
        totalVelocity.add(flock[i].velocity);
        count++;
      }
    }

    if (count > 0) {
      totalVelocity.div(count);
      totalVelocity.normalize();
      totalVelocity.mult(this.maxSpeed);
      let steer = p5.constructor.Vector.sub(totalVelocity, this.velocity);
      steer.limit(this.maxForce);

      return steer;
    } else {
      return p5.createVector(0, 0);
    }
  }

  cohesion(flock, p5) {
    let neighbourDistance = this.radius * 10;
    let summedLocation = p5.createVector(0, 0);
    let count = 0;
    for (let i = 0; i < flock.length; i++) {
      let distance = p5.constructor.Vector.dist(
        this.position,
        flock[i].position
      );
      if (distance > 0 && distance < neighbourDistance) {
        summedLocation.add(flock[i].position);
        count++;
      }
    }

    if (count > 0) {
      summedLocation.div(count);

      // Stuur naar de nieuwe locatie toe.
      return this.seek(summedLocation, p5);
    } else {
      return p5.createVector(0, 0);
    }
  }

  seek(target, p5) {
    let desired = target.sub(this.position);

    // We moeten de vector normaliseren, zodat we geen last
    // hebben van de afstand tussen de boids
    desired.normalize();
    desired.mult(this.maxSpeed);

    // De stuurkracht is een vector met de richting
    // waarin de boid moet bewegen om naar het target toe te gaan.
    let steer = p5.constructor.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);

    return steer;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }
}

// draw an arrow for a vector at a given base position
function drawArrow(p5, base, vec, myColor) {
  p5.push();
  p5.stroke(myColor);
  p5.strokeWeight(2);
  p5.fill(myColor);
  p5.translate(base.x, base.y); //Will transport the object line (below) to the tip of the positional vector v1
  p5.line(0, 0, vec.x, vec.y); //The line from the O to the tip of v1
  p5.rotate(vec.heading()); //Rotates the following triangle the angle of v1
  let arrowSize = 6; // Determines size of the vector arrowhead (triangle).
  p5.translate(vec.mag() - arrowSize, 0); //Will translate a triangle below by the modulus of v1
  p5.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  p5.pop();
}
