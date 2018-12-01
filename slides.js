class Slide {
  constructor(node) {
    this.node = node;
  }

  // Resets the slide state and returns the DOMNode the slide will work in.
  show(fromStart) {
    return this.node;
  }

  // Steps the current slide. Returns `true` if the slide was able
  // to step itself, and `false` if it had no more steps.
  increment() {
    return false;
  }

  // Steps back the current slide. Returns `true` if the slide was able
  // to step itself, and `false` if it had no more steps.
  decrement() {
    return false;
  }
};

window.Slide = Slide;

const state = {
  container: document.getElementById('slides'),
  slides: [],
  current: -1,

  initialize() {
    // Create slide objects out of the HTML
    Array.from(this.container.children).forEach((child, i) => {
      this.container.removeChild(child);

      const type = child.getAttribute('data-type');
      if (type) {
        this.slides.push(new window.TYPES[type](child));
      } else {
        this.slides.push(new Slide(child));
      }
    });

    this.container.classList.remove('loading');

    if (window.location.hash) {
      this.loadSlide(parseInt(window.location.hash.slice(1)));
    } else {
      this.loadSlide(0);
    }
  },

  currentSlide() {
    return this.slides[this.current];
  },

  goToSlide(id) {
    this.loadSlide(id);
    window.history.replaceState(null, document.title, `#${id}`);
  },

  loadSlide(id) {
    if (id < 0) {
      id = 0;
    }
    if (id >= this.slides.length) {
      id = this.slides.length - 1;
    }

    if (this.current === id) {
      return;
    }

    while (state.container.firstChild) {
      this.container.removeChild(state.container.firstChild);
    }

    const prev = this.current;
    this.current = id;
    const node = this.currentSlide().show(prev < this.current);
    this.container.appendChild(node);
  },

  increment() {
    const didStep = this.currentSlide().increment();
    if (!didStep) {
      this.goToSlide(this.current + 1);
    }
  },

  decrement() {
    const didStep = this.currentSlide().decrement();
    if (!didStep) {
      this.goToSlide(this.current - 1);
    }
  }
};

window.TYPES = {};

// Defer execution so slide definitions have a chance to set themselves up
setTimeout(() => state.initialize(), 0);

const title = 'Improving the Procedural Modelling Workflow';

window.addEventListener('keydown', (event) => {
  if (event.keyCode == 39 || event.keyCode == 40) {
    state.increment();
  } else if (event.keyCode == 37 || event.keyCode == 38) {
    state.decrement();
  }
});
