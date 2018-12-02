class GrammarGen extends Slide {
  constructor(node) {
    super(node);

    const grammarNode = node.querySelector('grammar');
    const grammarTable = this.parseGrammar(grammarNode);
    grammarNode.parentElement.replaceChild(grammarTable, grammarNode);

    const breakdownNode = node.querySelector('breakdown');
    this.breakdownTable = this.parseBreakdown(breakdownNode);
    breakdownNode.parentElement.replaceChild(this.breakdownTable, breakdownNode);
  }

  parseGrammar(node) {
    this.grammar = {};
    const table = document.createElement('table');
    table.classList.add('small');

    Array.from(node.querySelectorAll('definition')).forEach(child => {
      const name = child.getAttribute('data-name');

      const row = document.createElement('tr');
      const header = document.createElement('th');
      const text = document.createElement('span');
      text.classList.add('code');
      text.innerText = name;
      header.appendChild(text);
      row.appendChild(header);

      const definition = document.createElement('td');
      Array.from(child.children).forEach(part => definition.appendChild(part));
      row.appendChild(definition);

      table.appendChild(row);
      this.grammar[name] = row;
    });

    return table;
  }

  parseBreakdown(node) {
    this.maxStep = -1;
    this.breakdown = [];

    const findMaxDepth = (ruleNode) => {
      if (ruleNode.nodeName === 'terminal') {
        return 1;
      } else {
        let max = 0;
        Array.from(ruleNode.children).forEach(child => {
          max = Math.max(max, findMaxDepth(child) + 1);
        });

        return max;
      }
    };
    const maxDepth = findMaxDepth(node);

    const breakdownTable = document.createElement('table');
    breakdownTable.classList.add('appearing');
    breakdownTable.classList.add('small');
    const rows = [];

    const handleRule = (ruleNode, depth, parentStep) => {
      const first = !rows[depth];
      if (first) {
        rows[depth] = document.createElement('tr');
        breakdownTable.appendChild(rows[depth]);
      }

      let cell = null;
      if (ruleNode.nodeName.toLowerCase() === 'terminal') {
        cell = document.createElement('th');
        cell.innerText = ruleNode.innerText;
        cell.setAttribute('rowspan', maxDepth - depth);
        cell.setAttribute('style', 'vertical-align: bottom');

        for (let i = depth + 1; i < maxDepth; i++) {
          if (!rows[i]) {
            rows[i] = document.createElement('tr');
            breakdownTable.appendChild(rows[i]);
          }
        }
      } else if (ruleNode.nodeName.toLowerCase() === 'rule') {
        cell = document.createElement('td');
        cell.setAttribute('data-rule', ruleNode.getAttribute('data-type'));
        cell.innerText = ruleNode.getAttribute('data-type');
      } else {
        throw new Error(`Unexpected node of type ${ruleNode.nodeName}`);
      }

      cell.setAttribute('data-step', parentStep + 1);
      if (first) {
        cell.classList.add('first');
      }
      rows[depth].appendChild(cell);

      if (ruleNode.nodeName.toLowerCase() === 'rule') {
        this.maxStep += 2 ;
        const currentStep = this.maxStep;
        cell.setAttribute('data-highlight', currentStep);

        let colspan = 0;
        Array.from(ruleNode.children).forEach(child => {
          colspan += handleRule(child, depth + 1, currentStep);
        });
        cell.setAttribute('colspan', colspan);
        return colspan;
      } else {
        return 1;
      }
    };

    Array.from(node.children).forEach(child => handleRule(child, 0, -1));
    this.maxStep++;
    return breakdownTable;
  }

  show(fromStart) {
    if (fromStart) {
      this.step = 0;
    } else {
      this.step = this.maxStep;
    }
    this.update();

    return this.node;
  }

  increment() {
    if (this.step === this.maxStep) {
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
    Object.keys(this.grammar).forEach(rule => this.grammar[rule].classList.remove('highlighted'));

    Array.from(this.breakdownTable.querySelectorAll('td, th')).forEach(child => {
      const step = child.getAttribute('data-step');
      if (step) {
        if (parseInt(step) <= this.step) {
          child.classList.remove('hidden');
        } else {
          child.classList.add('hidden');
        }
      }

      const highlight = child.getAttribute('data-highlight');
      if (highlight) {
        if (parseInt(highlight) === this.step) {
          child.classList.add('highlighted');
          const rule = child.getAttribute('data-rule');
          if (rule) {
            this.grammar[rule].classList.add('highlighted');
          }
        } else {
          child.classList.remove('highlighted');
        }
      }
    });
  }
};

window.TYPES['grammar-gen'] = GrammarGen;
