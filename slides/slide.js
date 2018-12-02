class Slide {
  constructor(node) {
    this.node = node;
    this.maxOrder = 0;
    this.order = 0;
    Array.from(node.querySelectorAll('*')).forEach(child => {
      const order = child.getAttribute('data-order');
      if (order) {
        this.maxOrder = Math.max(this.maxOrder, parseInt(order));
      }
    });
  }

  // Resets the slide state and returns the DOMNode the slide will work in.
  show(fromStart) {
    if (fromStart) {
      this.order = 0;
    } else {
      this.order = this.maxOrder;
    }
    this.update();

    return this.node;
  }

  // Steps the current slide. Returns `true` if the slide was able
  // to step itself, and `false` if it had no more steps.
  increment() {
    if (this.order === this.maxOrder) {
      return false;

    } else {
      this.order++;
      this.update();

      return true;
    }
  }

  // Steps back the current slide. Returns `true` if the slide was able
  // to step itself, and `false` if it had no more steps.
  decrement() {
    if (this.order === 0) {
      return false;

    } else {
      this.order--;
      this.update();

      return true;
    }
  }

  update() {
    Array.from(this.node.querySelectorAll('*')).forEach(child => {
      const order = child.getAttribute('data-order');
      if (order) {
        if (parseInt(order) <= this.order) {
          child.classList.remove('hidden');
        } else {
          child.classList.add('hidden');
        }
      }
    });
  }
};

window.Slide = Slide;
