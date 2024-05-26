import { createBoidsSketch } from "./boids.js";
import { createWouterSketch } from "./wouter.js";

window.addEventListener("scroll", () => {
  checkWindowY("#title", 0.15, "move-to-top");
  checkWindowY(".screen.wouter-intro .title", 0.4, "animation-active");
  checkWindowY(".screen.wouter-intro .story", 0.8, "animation-active");
  checkWindowY(".screen.separation-problem .title", 1.5, "animation-active");
  checkWindowY(".screen.separation-problem .story", 1.8, "animation-active");
  checkWindowY(".screen.separation-solution .title", 2.5, "animation-active");
  checkWindowY(".screen.separation-solution .story", 2.8, "animation-active");
  checkWindowY(".screen.alignment-problem .title", 4.5, "animation-active");
  checkWindowY(".screen.alignment-problem .story", 4.8, "animation-active");
  checkWindowY(".screen.alignment-solution .title", 5.5, "animation-active");
  checkWindowY(".screen.alignment-solution .story", 5.8, "animation-active");
  checkWindowY(".screen.cohesion-problem .title", 7.5, "animation-active");
  checkWindowY(".screen.cohesion-problem .story", 7.8, "animation-active");
  checkWindowY(".screen.cohesion-solution .title", 8.5, "animation-active");
  checkWindowY(".screen.cohesion-solution .story", 8.8, "animation-active");
});

createWouterElememt(".wouter");

createBoidsBackgroundForScreen(".screen.intro .boids", {
  separation: true,
  alignment: true,
  cohesion: true,
  radius: 5,
  count: 200,
  highlight: false,
});

createBoidsBackgroundForScreen(".screen.wouter-intro .boids", {
  separation: false,
  alignment: false,
  cohesion: false,
  radius: 5,
  count: 100,
  highlight: false,
});

createBoidsBackgroundForScreen(".screen.separation-problem .boids", {
  separation: false,
  alignment: false,
  cohesion: false,
  radius: 15,
  count: 80,
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.separation-solution .boids", {
  separation: true,
  alignment: false,
  cohesion: false,
  radius: 15,
  count: 80,
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.separation-explaination .boids", {
  separation: true,
  alignment: false,
  cohesion: false,
  radius: 15,
  count: 80,
  showVectors: {
    separation: true,
  },
  maxForce: 0.01,
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.alignment-problem .boids", {
  separation: true,
  alignment: false,
  cohesion: false,
  radius: 15,
  count: 80,
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.alignment-solution .boids", {
  separation: true,
  alignment: true,
  cohesion: false,
  radius: 15,
  count: 80,
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.alignment-explaination .boids", {
  separation: true,
  alignment: true,
  cohesion: false,
  radius: 15,
  count: 80,
  showVectors: {
    alignment: true,
  },
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.cohesion-problem .boids", {
  separation: true,
  alignment: true,
  cohesion: false,
  radius: 15,
  count: 80,
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.cohesion-solution .boids", {
  separation: true,
  alignment: true,
  cohesion: true,
  radius: 15,
  count: 80,
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.cohesion-explaination .boids", {
  separation: true,
  alignment: true,
  cohesion: true,
  radius: 15,
  count: 80,
  showVectors: {
    cohesion: true,
  },
  highlight: true,
});

createBoidsBackgroundForScreen(".screen.end .boids", {
  separation: true,
  alignment: true,
  cohesion: true,
  radius: 5,
  count: 200,
  highlight: false,
});

function checkWindowY(query, height, className) {
  const windowHeight = window.innerHeight;
  const element = document.querySelector(query);
  if (window.scrollY >= windowHeight * height) {
    element.classList.add(className);
  } else if (window.scrollY < windowHeight * height) {
    element.classList.remove(className);
  }
}

function createWouterElememt(query) {
  const wouterElement = document.querySelector(query);
  const wouterTarget = document.querySelector("#wouter-target");
  new p5(
    createWouterSketch(
      wouterElement,
      wouterElement.clientWidth,
      wouterElement.clientHeight,
      () => {
        if (!window) return false;

        const y = window.scrollY / window.innerHeight;
        if (y >= 0.5 && y < 10.5) {
          return {
            x: wouterTarget.getBoundingClientRect().x,
            y: wouterTarget.getBoundingClientRect().y,
          };
        }
      },
      true
    )
  );
}

function createBoidsBackgroundForScreen(query, options) {
  const element = document.querySelector(query);

  let intersectionOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.0,
  };

  let running = false;

  let observer = new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
  }, intersectionOptions);

  observer.observe(element);

  new p5(
    createBoidsSketch(
      element,
      element.clientWidth,
      element.clientHeight,
      () => running,
      options
    )
  );
}
