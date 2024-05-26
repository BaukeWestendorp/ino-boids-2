export const createWouterSketch = (
  parent,
  width,
  height,
  getTargetPosition,
  isRunning
) => {
  return (p5) => {
    let radius;
    let position;
    let blink = false;

    p5.setup = () => {
      const canvas = p5.createCanvas(width, height);
      canvas.parent(parent);

      position = p5.createVector(width / 2, height / 2);
      radius = 30;

      setInterval(() => {
        blink = true;

        setTimeout(() => {
          blink = false;
        }, 100);
      }, 2000);
    };

    p5.draw = () => {
      p5.clear();
      if (!isRunning) return;

      let targetPosition = p5.createVector(p5.mouseX, p5.mouseY);
      let lerpSpeed = 0.05;

      if (getTargetPosition()) {
        targetPosition = p5.createVector(
          getTargetPosition().x,
          getTargetPosition().y
        );
        lerpSpeed = 0.15;
      }

      position.lerp(targetPosition, lerpSpeed);

      const theta =
        Math.atan2(p5.mouseY - position.y, p5.mouseX - position.x) +
        p5.radians(90);

      p5.push();
      p5.translate(position.x, position.y);
      p5.rotate(theta);

      // Eyes
      p5.strokeWeight(5);
      p5.stroke("#911919");
      p5.fill("#ffffff");
      p5.circle(15, -60, radius);
      p5.circle(-15, -60, radius);

      p5.fill("#000000");
      p5.noStroke();
      if (blink) {
        p5.noFill();
      }
      p5.circle(15, -70, radius / 2);
      p5.circle(-15, -70, radius / 2);

      // Body
      p5.stroke("#911919");
      p5.fill("#e35e5e");
      p5.strokeWeight(10);
      p5.beginShape();
      p5.vertex(0, -radius * 2);
      p5.vertex(-radius, radius * 2);
      p5.vertex(radius, radius * 2);
      p5.endShape(p5.CLOSE);

      p5.pop();
    };
  };
};
