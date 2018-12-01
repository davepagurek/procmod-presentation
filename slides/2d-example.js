const ns = 'http://www.w3.org/2000/svg';

class Example2D extends window.Slide {
  constructor(node) {
    super(node);

    this.step = 0;

    const stepsNode = node.querySelector('steps');
    this.steps = Array.from(stepsNode.children).map(step => this.parseStep(step));
    this.stepTransforms = this.transformsForSteps(this.steps);

    this.svg = this.evaluate(this.steps);

    this.viewport = document.createElementNS(ns, 'path');
    this.viewport.setAttribute('d', 'M-50,-50L-50,50L50,50L50,-50Z M-5,0L5,0 M0,-5L0,5');

    this.svg.appendChild(this.viewport);
    this.stepsText = this.textForSteps(this.steps);

    const container = document.createElement('div');
    container.classList.add('container');
    container.appendChild(this.svg);

    const stepsContainer = document.createElement('div');
    stepsContainer.classList.add('stepsContainer');

    this.stepsText.forEach(step => stepsContainer.appendChild(step));
    container.appendChild(stepsContainer);

    node.replaceChild(container, stepsNode);
  }

  textForSteps(steps) {
    return steps.map((step, i) => {
      const text = document.createElement('div');
      text.classList.add('step');
      text.innerText = this.display(step);
      text.setAttribute('data-step', i);

      return text;
    });
  }

  display(instruction) {
    if (instruction.type === 'line') {
      return 'lineTo(' +
        `${instruction.to.x}, ${instruction.to.y})`;
    } else if (instruction.type === 'circle') {
      return `circle(${instruction.r})`;
    } else if (instruction.type === 'transform') {
      return instruction.transform;
    } else if (instruction.type === 'push') {
      return '[';
    } else if (instruction.type === 'pop') {
      return ']';
    } else if (instruction.type === 'rule') {
      return instruction.name;
    }
    return '';
  }

  transformsForSteps(steps) {
    const stack = [];
    const transforms = [''];

    steps.forEach(step => {
      const last = transforms[transforms.length - 1];

      if (step.type === 'transform') {
        const cssTransform = step.transform
          .replace(/translate\(([\d\.-]+), ([\d\.-]+)\)/g, 'translate($1px, $2px)')
          .replace(/rotate\(([\d\.-]+)\)/g, 'rotate($1deg)');
        transforms.push(`${last} ${cssTransform}`);
      } else if (step.type === 'rule') {
        const ruleTransforms = this.transformsForSteps(step.commands);
        const lastInRule = ruleTransforms[ruleTransforms.length - 1];
        transforms.push(`${last} ${lastInRule}`);
      } else if (step.type === 'push') {
        transforms.push(last);
        stack.push(last);
      } else if (step.type === 'pop') {
        const popped = stack.pop();
        transforms.push(popped);
      } else {
        transforms.push(last);
      }
    });

    return transforms;
  }

  parseStep(stepNode) {
    const step = {};

    step.type = stepNode.getAttribute('data-type');
    if (step.type === 'transform') {
      step.transform = stepNode.getAttribute('data-transform');
    } else if (step.type === 'line') {
      step.from = {
        x: parseInt(stepNode.getAttribute('data-x1')),
        y: parseInt(stepNode.getAttribute('data-y1'))
      };
      step.to = {
        x: parseInt(stepNode.getAttribute('data-x2')),
        y: parseInt(stepNode.getAttribute('data-y2'))
      };
    } else if (step.type === 'circle') {
      step.x = parseInt(stepNode.getAttribute('data-x'));
      step.y = parseInt(stepNode.getAttribute('data-y'));
      step.r = parseInt(stepNode.getAttribute('data-r'));
    } else if (step.type === 'rule') {
      step.name = stepNode.getAttribute('data-name');
      step.commands = Array.from(stepNode.children).map(this.parseStep);
    }

    return step;
  }

  getStyle(overrides) {
    const style = Object.assign({
      'stroke-width': 2,
      fill: 'none',
      'vector-effect': 'non-scaling-stroke',
    }, overrides);

    return Object.keys(style).reduce(
      (styleString, key) => `${styleString} ${key}: ${style[key]};`, '');
  }

  evaluate(instructions) {
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', 200);
    svg.setAttribute('height', 200);
    svg.setAttribute('style', 'background-color: #FFF');
    svg.setAttribute('viewBox', '0 0 100 100');

    let currentGroup = document.createElementNS(ns, 'g');
    currentGroup.setAttribute('transform', 'translate(50 50)');
    svg.appendChild(currentGroup);

    const stack = [];

    const handleInstruction = (instruction, step) => {
      if (instruction.type === 'line') {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('data-step', step);
        path.setAttribute('d', [
          `M${instruction.from.x},${instruction.from.y}`,
          `L${instruction.to.x},${instruction.to.y}`
        ].join(' '));
        path.setAttribute('style', this.getStyle({
          stroke: '#000',
          'stroke-dasharray': 2 * path.getTotalLength(),
          'stroke-dashoffset': 2 * path.getTotalLength()
        }));

        currentGroup.appendChild(path);

      } else if (instruction.type === 'circle') {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('data-step', step);
        path.setAttribute('d', [
          `M${instruction.x - instruction.r},${instruction.y}`,
          `a${instruction.r},${instruction.r} 0 1,0 ${instruction.r * 2},0`,
          `a${instruction.r},${instruction.r} 0 1,0 ${-instruction.r * 2},0`
        ].join(' '));
        path.setAttribute('style', this.getStyle({
          stroke: '#000',
          'stroke-dasharray': 2 * path.getTotalLength(),
          'stroke-dashoffset': 2 * path.getTotalLength()
        }));

        currentGroup.appendChild(path);

      } else if (instruction.type === 'transform') {
        const g = document.createElementNS(ns, 'g');
        g.setAttribute('data-step', step);
        g.setAttribute('transform', instruction.transform);
        currentGroup.appendChild(g);
        currentGroup = g;

      } else if (instruction.type === 'pop') {
        currentGroup = stack.pop();

      } else if (instruction.type === 'push') {
        stack.push(currentGroup);

      } else if (instruction.type === 'rule') {
        instruction.commands.forEach(command => handleInstruction(command, step));
      }
    }

    instructions.forEach(handleInstruction);

    return svg;
  }

  show(fromStart) {
    if (fromStart) {
      this.step = 0;
    } else {
      this.step = this.steps.length;
    }
    this.update();

    return this.node;
  }

  increment() {
    if (this.step === this.steps.length) {
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
    Array.from(this.svg.querySelectorAll('*')).forEach(child => {
      const step = child.getAttribute('data-step');
      if (step) {
        if (parseInt(step) >= this.step) {
          child.classList.remove('visible');
        } else {
          child.classList.add('visible');
        }
      }
    });
    this.viewport.setAttribute('style', this.getStyle({
      stroke: '#F00',
      transform: 'translate(50px, 50px)' + this.stepTransforms[this.step]
    }));

    this.stepsText.forEach(text => {
      const step = text.getAttribute('data-step');
      if (step) {
        if (parseInt(step) >= this.step) {
          text.classList.remove('visible');
        } else {
          text.classList.add('visible');
        }
      }
    });
  }
}

window.TYPES['2d-example'] = Example2D;
