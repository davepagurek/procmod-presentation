# <a href="https://davepagurek.github.io/procmod-presentation/">Improving the Procedural Modelling Workflow</a>
A presentation about procedural modelling

![copy-and-paste](https://user-images.githubusercontent.com/5315059/49350745-0c1a9a80-f665-11e8-90ee-dbfb2cca3884.gif)

This is a presentation version of this blog post: https://www.davepagurek.com/blog/procedural-modelling/

## Technical overview

Slides are `<section>` elements in `index.html`. Each `DOMNode` is processed by a slide class. A slide has the following public interface:

```typescript
interface Slide {
  // Parse the initial markup
  constructor(node: DOMNode);

  // Return the DOMNode to display for this slide. `fromStart` refers to whether or not we arrived
  // at this slide by going in order from the previous slide, or in reverse from the next slide.
  show(fromStart: boolean): DOMNode;

  // Advance the slide. Returns `true` if the slide handled the increment action, and `false` if
  // there is nothing next in this slide and the next slide should be shown.
  increment(): boolean;

  // Decrement the slide. Returns `true` if the slide handled the decrement action, and `false` if
  // there is nothing earlier in this slide and the previous slide should be shown.
  decrement(): boolean;
}
```

There are three slide types currently, specified by adding the `data-type` attribute on a `<section>` tag.

### Default

If the `data-order` attribute is present on an element and given a value of `x`, that element will have 0 opacity until the slide is advanced `x` times. The `data-disappear` attribute, if given a value of `y`, will make the element only visible when advanced `n` times, where `x <= n < y`.

If the `disappearing` class is added to a node, rather than having opacity of 0, it will also have a width of 0 initially so that it doesn't take up space. To make this transition smoothly, the initial width of the non-hidden element is grabbed upfront and set as a `style` attribute that then gets overridden.

### 2d-example

A `<steps>` element must be specified, which includes a list of `<step>` elements for each step in the generation of a shape. `<step>` elements will have a `data-type` attribute indicating the drawing command and more `data-*` attributes for command parameters. The slide will then visualize the pen position as one steps through the draw commands one by one, with the canvas on the left and with the commands on the right. `push()` and `pop()` commands indent and dedent subsequent commands, respectively.

To smoothly transition the outline and crosshair of the pen as transformations are applied to it, transforms are converted to CSS transform syntax, and the stack of transforms is stored as a single CSS transform string for each step.

Paths animate their entry by using SVG dashed lines and offsets. The dash length is the length of the path. The offset starts at 100% before the path is visible, and transitions to 0 to draw the path. Path length is unscaled, so the scale of the path is recorded so that the offset can be scaled accordingly. (This probably doesn't work for nonuniform scaling factors, but I don't use any of those!)

### grammar-gen

This takes two elements: a `<breakdown>` element, showing a grammar parse tree, and a `<grammar>` element, showing the grammar definition. This lets the user step through the breakdown in depth-first order, highlighting the rule being broken down and its grammar definition before then showing the concrete breakdown chosen.
