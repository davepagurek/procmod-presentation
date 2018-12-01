class Example2D extends window.Slide {
  constructor(node) {
    super(node);

    this.step = 0;
    this.numSteps = 3;

    this.title = document.createElement('h2');
    node.appendChild(this.title);
  }

  show(fromStart) {
    if (fromStart) {
      this.step = 0;
    } else {
      this.step = this.numSteps - 1;
    }
    this.update();

    return this.node;
  }

  increment() {
    if (this.step === this.numSteps - 1) {
      return false;

    } else {
      this.step++;
      this.update();

      return true;
    }
  }

  decrement() {
    if (this.step === 0) {
      return false;

    } else {
      this.step--;
      this.update();

      return true;
    }
  }

  update() {
    this.title.innerText = `Title ${this.step}`;
  }
}

window.TYPES['2d-example'] = Example2D;
