import "./styles.css";
import { createRef, useEffect } from "react";
import { hydrate } from "react-dom";

let canvas, c;

let time = 0,
  prevDelta = 0;
let t1 = 0,
  t2 = 0;
let playerObj;

let spikesLeft = [2, 5, 7];
let newSpikes = [];

let gameOver = false;
let points = 0;

let bounceValue = -8,
  speedValue = 5;

let xSubtractor = speedValue,
  ySubtractor = bounceValue;

class Player {
  x;
  y;
  w;
  h;
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

class SpikeRight {
  xa;
  ya;
  xb;
  yb;
  xc;
  yc;
  xd;
  yd;
  xe;
  ye;

  offset;

  constructor(x, y, a, h, whichOne, offset, direction) {
    if (direction === "RIGHT") {
      this.offset = offset * whichOne * 2 + h * whichOne;
      this.xa = x;
      this.ya = y + this.offset;
      this.xb = x;
      this.yb = y + a + this.offset;
      this.xc = x + h;
      this.yc = y + a / 2 + this.offset;
      this.xd = x + h / 2;
      this.yd = y + a / 4 + this.offset;
      this.xe = x + h / 2;
      this.ye = y + 0.75 * a + this.offset;
    }
    if (direction === "LEFT") {
      this.offset = offset * whichOne * 2 + h * whichOne;
      this.xa = x;
      this.ya = y + this.offset;
      this.xb = x;
      this.yb = y + a + this.offset;
      this.xc = x - h;
      this.yc = y + a / 2 + this.offset;
      this.xd = x - h / 2;
      this.yd = y + a / 4 + this.offset;
      this.xe = x - h / 2;
      this.ye = y + 0.75 * a + this.offset;
    }
  }
  draw() {
    c.beginPath();
    c.moveTo(this.xa, this.ya);
    c.lineTo(this.xb, this.yb);
    c.lineTo(this.xc, this.yc);
    c.lineTo(this.xa, this.ya);
    c.stroke();
  }
  intersected() {
    if (
      intersecting(this.xa, this.ya) ||
      intersecting(this.xb, this.yb) ||
      intersecting(this.xc, this.yc) ||
      intersecting(this.xd, this.yd) ||
      intersecting(this.xe, this.ye)
    )
      return true;
    return false;
  }
}

const restart = () => {
  xSubtractor = speedValue;
  ySubtractor = bounceValue;
  gameOver = false;
};

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const intersecting = (xP, yP) => {
  if (
    yP < playerObj.y ||
    yP > playerObj.y + playerObj.w ||
    xP < playerObj.x ||
    xP > playerObj.x + playerObj.h
  ) {
    return false;
  }
  return true;
};

const renderingFunc = (delta) => {
  try {
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (delta) {
      time = delta - prevDelta;
    }
    prevDelta = delta;

    if (gameOver) {
      playerObj.x = canvas.width / 2;
      playerObj.y = canvas.height / 2;

      if (newSpikes[0]) {
        for (let newSpike of newSpikes) {
          newSpike.draw();
        }
      }

      c.beginPath();
      c.rect(playerObj.x, playerObj.y, playerObj.w, playerObj.h);
      c.stroke();
    } else {
      if (time) {
        t1 += time / 1000;
        t2 += time / 1000;
      }

      if (playerObj.y >= canvas.height || playerObj.y <= 0) {
        gameOver = true;
        //alert("Game Over");
      }

      if (playerObj.x + playerObj.w >= canvas.width || playerObj.x <= 0) {
        points++;
        if (points % 10 === 0) xSubtractor += 0.2;
        newSpikes = [];
        spikesLeft = [];

        let maxNumberSpikes = Math.floor(canvas.height / (30 + 5 * 2)) - 1;
        let numbersArray = [];
        for (let i = 0; i < maxNumberSpikes; i++) {
          numbersArray.push(i);
        }

        let numberOfSpikes = Math.floor(points / 7) + 1;
        let minSpikes = 3,
          maxSpikes = maxNumberSpikes - 4;
        if (numberOfSpikes < minSpikes) numberOfSpikes = minSpikes;
        if (numberOfSpikes > maxSpikes) numberOfSpikes = maxSpikes;

        for (let i = 0; i < numberOfSpikes; i++) {
          let numbersArrayTemp = [...numbersArray];
          let randomSpike =
            numbersArrayTemp[getRandomArbitrary(0, numbersArrayTemp.length)];
          spikesLeft.push(randomSpike);
          numbersArrayTemp.splice(numbersArrayTemp.indexOf(randomSpike), 1);
          numbersArray = [...numbersArrayTemp];
        }
        for (let spikeLeft of spikesLeft) {
          if (xSubtractor < 0)
            newSpikes.push(
              new SpikeRight(canvas.width, 10, 40, 30, spikeLeft, 5, "LEFT")
            );
          else {
            newSpikes.push(
              new SpikeRight(0, 10, 40, 30, spikeLeft, 5, "RIGHT")
            );
          }
        }
        xSubtractor = -xSubtractor;
      }
      if (t2 > 0.06) {
        ySubtractor += 0.4;
      }
      if (t1 > 0.005) {
        playerObj.x += xSubtractor;
        playerObj.y += ySubtractor;
        for (let newSpike of newSpikes) {
          if (newSpike.intersected()) {
            gameOver = true;
            alert("Game Over");
          }
        }
        t1 = 0;
      }

      if (newSpikes[0]) {
        for (let newSpike of newSpikes) {
          newSpike.draw();
        }
      }

      c.beginPath();
      c.rect(playerObj.x, playerObj.y, playerObj.w, playerObj.h);
      c.stroke();
    }
    window.requestAnimationFrame(renderingFunc);
  } catch (err) {
    console.log("We've got an error in main");
  }
};

const listeners = () => {
  window.addEventListener("click", () => {
    ySubtractor = bounceValue;

    if (gameOver) {
      restart();
    }
  });
};

export default function App() {
  const ref = createRef();
  useEffect(() => {
    canvas = ref.current;
    c = canvas.getContext("2d");
    playerObj = new Player(canvas.width / 2, canvas.height / 2, 50, 50);

    listeners();

    renderingFunc();
  }, []);

  return (
    <div className="App">
      <canvas width={400} height={600} ref={ref}></canvas>
    </div>
  );
}
