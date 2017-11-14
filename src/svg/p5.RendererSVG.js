'use strict';

var p5 = require('../core/main');
var constants = require('../core/constants');
require('../core/p5.Renderer');

var svgNS = 'http://www.w3.org/2000/svg';

/**
 * 3D graphics class
 * @class p5.RendererSVG
 * @constructor
 * @extends p5.Renderer
 * @todo extend class to include public method for offscreen
 * rendering (FBO).
 *
 */
p5.RendererSVG = function(pInst, isMainCanvas, attr) {
  var elt = document.createElementNS(svgNS, 'svg');
  elt.setAttributeNS(null, 'fill', 'none');
  elt.setAttributeNS(null, 'stroke-linecap', 'round');
  //elt.xmlns = svgNS;

  p5.Renderer.call(this, elt, pInst, constants.SVG, isMainCanvas);

  this.container = elt;

  //this.fill(255, 255, 255, 255);

  return this;
};

p5.RendererSVG.prototype = Object.create(p5.Renderer.prototype);

p5.RendererSVG.prototype._applyDefaults = function() {
  this._pointSize = 1;
  this._strokeWeight = 1;
  this._strokeColor = this._pInst.color(constants._DEFAULT_STROKE);
  this._fillColor = this._pInst.color(constants._DEFAULT_FILL);
  this._blendMode = null;
  this._alignmentBaseline = 'top';
  this._textAnchor = null;

  this.strokeCap(constants.ROUND);
  this.strokeJoin(constants.MITER);
};

//////////////////////////////////////////////
// Setting
//////////////////////////////////////////////

p5.RendererSVG.prototype._initContext = function() {};

//This is helper function to reset the context anytime the attributes
//are changed with setAttributes()

p5.RendererSVG.prototype._resetContext = function(attr, options, callback) {};

p5.RendererSVG.prototype._addElement = function(tagName, attributes) {
  var elt = document.createElementNS(svgNS, tagName);
  for (var name in attributes) {
    elt.setAttributeNS(null, name, attributes[name]);
  }
  if (this._blendMode && tagName !== 'g') {
    elt.style.mixBlendMode = this._blendMode;
  }
  this.container.appendChild(elt);
  return elt;
};

p5.RendererSVG.prototype.background = function() {
  this.clear();

  var color = this._pInst.color.apply(this._pInst, arguments);
  this.elt.style.backgroundColor = color.toString();
};

p5.RendererSVG.prototype.clear = function() {
  this.elt.style.backgroundColor = '';
  this.elt.innerHTML = '';
  this.container = this.elt;
  if (this._pInst._styles.length) {
    console.log(
      'warning: clear() called on SVG renderer while styles remain on stack.'
    );
  }
};

p5.RendererSVG.prototype.fill = function(v1, v2, v3, a) {
  this._fillColor = this._pInst.color.apply(this._pInst, arguments);
};

p5.RendererSVG.prototype.stroke = function(r, g, b, a) {
  this._strokeColor = this._pInst.color.apply(this._pInst, arguments);
};

p5.RendererSVG.prototype.strokeWeight = function(w) {
  this._strokeWeight = w;
};

p5.RendererSVG.prototype._getFill = function() {
  if (!this._doFill) {
    return null;
  }
  if (!this._fillColor) {
    return constants._DEFAULT_FILL;
  }
  return this._fillColor.toString();
};

p5.RendererSVG.prototype._getStroke = function() {
  if (!this._doStroke) {
    return null;
  }
  if (!this._strokeColor) {
    return constants._DEFAULT_STROKE;
  }
  return this._strokeColor.toString();
};

p5.RendererSVG.prototype._applyStroke = function(elt) {
  if (this._doStroke) {
    elt.setAttributeNS(null, 'stroke', this._strokeColor.toString());
    if (this._strokeWeight !== 1) {
      elt.setAttributeNS(null, 'stroke-width', this._strokeWeight);
    }
    if (this._strokeJoin) {
      elt.setAttributeNS(null, 'stroke-linejoin', this._strokeJoin);
    }
    if (this._strokeCap) {
      elt.setAttributeNS(null, 'stroke-linecap', this._strokeCap);
    }
  }
};

p5.RendererSVG.prototype.line = function(x1, y1, x2, y2) {
  if (this._doStroke) {
    var elt = this._addElement('line', {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    });
    this._applyStroke(elt);
  }
};

p5.RendererSVG.prototype.point = function(x, y) {
  var sw = this._strokeWeight;
  if (sw > 1) {
    this._addElement('ellipse', {
      cx: x + 0.5,
      cy: y + 0.5,
      r: sw / 2,
      fill: this._strokeColor.toString()
    });
  } else {
    this._addElement('rect', {
      x: x,
      y: y,
      width: 1,
      height: 1,
      fill: this._strokeColor.toString()
    });
  }
};

p5.RendererSVG.prototype.ellipse = function(cx, cy, rx, ry) {
  if (this._doStroke || this._doFill) {
    var elt = this._addElement('ellipse', {
      cx: cx + rx / 2,
      cy: cy + ry / 2,
      rx: rx / 2,
      ry: ry / 2
    });

    this._applyStroke(elt);
    if (this._doFill) {
      elt.setAttributeNS(null, 'fill', this._fillColor.toString());
    }
  }
};

p5.RendererSVG.prototype.arc = function(x, y, w, h, start, stop, mode) {
  if (!this._doStroke && !this._doFill) return;

  var pInst = this._pInst;
  var x1 = x + w * pInst.cos(start) / 2;
  var y1 = y + h * pInst.sin(start) / 2;
  var x2 = x + w * pInst.cos(stop) / 2;
  var y2 = y + h * pInst.sin(stop) / 2;

  start = this._pInst._toDegrees(start);
  stop = this._pInst._toDegrees(stop);

  var sweep = (stop - start) % 360;
  if (sweep < 0) {
    sweep = 360 + sweep;
  }

  //var da = start + stop + 360 * 10;

  var path =
    'M ' +
    x1 +
    ',' +
    y1 +
    ' A ' +
    w / 2 +
    ',' +
    h / 2 +
    ' ' +
    ' 0 ' +
    (sweep > 180 ? 1 : 0) +
    ' 1 ' +
    x2 +
    ',' +
    y2;

  switch (mode) {
    default:
    case constants.OPEN:
      break;
    case constants.CHORD:
      path += ' Z';
      break;
    case constants.PIE:
      path += ' L ' + x + ',' + y + ' Z';
      break;
  }

  var elt = this._addElement('path', { d: path });

  this._applyStroke(elt);
  if (this._doFill) {
    elt.setAttributeNS(null, 'fill', this._fillColor.toString());
  }
};

p5.RendererSVG.prototype.rect = function(x, y, w, h, tl, tr, br, bl) {
  if (!this._doStroke && !this._doFill) return;

  var elt;

  if (tl || tr || bl || br) {
    if (typeof tr === 'undefined') {
      tr = tl || 0;
    }
    if (typeof bl === 'undefined') {
      bl = tl || 0;
    }
    if (typeof br === 'undefined') {
      br = tl || 0;
    }

    elt = this._addElement('path', {
      d:
        'M ' +
        (x + tl) +
        ',' +
        y +
        ' L ' +
        (x + w - tr) +
        ',' +
        y +
        ' A ' +
        tr +
        ',' +
        tr +
        ' 0 0 1 ' +
        (x + w) +
        ' ' +
        (y + tr) +
        ' L ' +
        (x + w) +
        ',' +
        (y + h - br) +
        ' A ' +
        br +
        ',' +
        br +
        ' 0 0 1 ' +
        (x + w - br) +
        ' ' +
        (y + h) +
        ' L ' +
        (x + bl) +
        ',' +
        (y + h) +
        ' A ' +
        bl +
        ',' +
        bl +
        ' 0 0 1 ' +
        x +
        ' ' +
        (y + h - bl) +
        ' L ' +
        x +
        ',' +
        (y + tr) +
        ' A ' +
        tl +
        ',' +
        tl +
        ' 0 0 1 ' +
        (x + tl) +
        ' ' +
        y +
        ' Z'
    });
  } else {
    elt = this._addElement('rect', {
      x: x,
      y: y,
      width: w,
      height: h
    });
  }

  this._applyStroke(elt);
  if (this._doFill) {
    elt.setAttributeNS(null, 'fill', this._fillColor.toString());
  }
};

p5.RendererSVG.prototype.quad = function(x1, y1, x2, y2, x3, y3, x4, y4) {
  if (!this._doStroke && !this._doFill) return;

  var elt = this._addElement('path', {
    d:
      'M ' +
      x1 +
      ',' +
      y1 +
      ' L ' +
      x2 +
      ',' +
      y2 +
      ' L ' +
      x3 +
      ',' +
      y3 +
      ' L ' +
      x4 +
      ',' +
      y4 +
      ' L ' +
      x1 +
      ',' +
      y1 +
      ' Z'
  });

  this._applyStroke(elt);
  if (this._doFill) {
    elt.setAttributeNS(null, 'fill', this._fillColor.toString());
  }
};

p5.RendererSVG.prototype.triangle = function(x1, y1, x2, y2, x3, y3) {
  if (!this._doStroke && !this._doFill) return;

  var elt = this._addElement('path', {
    d:
      'M ' +
      x1 +
      ',' +
      y1 +
      ' L ' +
      x2 +
      ',' +
      y2 +
      ' L ' +
      x3 +
      ',' +
      y3 +
      ' L ' +
      x1 +
      ',' +
      y1 +
      ' Z'
  });

  this._applyStroke(elt);
  if (this._doFill) {
    elt.setAttributeNS(null, 'fill', this._fillColor.toString());
  }
};

function xy(v) {
  return v[0] + ',' + v[1];
}

function xy2(x, y) {
  return x + ',' + y;
}

p5.RendererSVG.prototype.endShape = function(
  mode,
  vertices,
  isCurve,
  isBezier,
  isQuadratic,
  isContour,
  shapeKind
) {
  if (vertices.length === 0) {
    return this;
  }
  if (!this._doStroke && !this._doFill) {
    return this;
  }
  var closeShape = mode === constants.CLOSE;
  if (closeShape && !isContour) {
    vertices.push(vertices[0]);
  }
  var i, v;
  var numVerts = vertices.length;
  var path;

  switch (shapeKind) {
    case constants.POLYGON:
    default:
      if (isCurve && numVerts > 3) {
        var s = 1 - this._curveTightness;

        path = 'M ' + xy(vertices[1]);
        for (i = 1; i + 2 < numVerts; i++) {
          v = vertices[i];
          var nv = vertices[i + 1];
          var b1 = [
            v[0] + (s * nv[0] - s * vertices[i - 1][0]) / 6,
            v[1] + (s * nv[1] - s * vertices[i - 1][1]) / 6
          ];
          var b2 = [
            nv[0] + (s * v[0] - s * vertices[i + 2][0]) / 6,
            nv[1] + (s * v[1] - s * vertices[i + 2][1]) / 6
          ];
          path += ' C ' + xy(b1) + ' ' + xy(b2) + ' ' + xy(nv);
        }
        if (closeShape) {
          path += ' L ' + xy(vertices[i + 1]);
        }
      } else if (isBezier) {
        path = '';
        for (i = 0; i < numVerts; i++) {
          v = vertices[i];
          if (v.isVert) {
            path += (v.moveTo || !i ? ' M ' : ' L ') + xy(v);
          } else {
            path +=
              ' C ' +
              xy2(v[0], v[1]) +
              ' ' +
              xy2(v[2], v[3]) +
              ' ' +
              xy2(v[4], v[5]);
          }
        }
      } else if (isQuadratic) {
        path = '';
        for (i = 0; i < numVerts; i++) {
          v = vertices[i];
          if (v.isVert) {
            path += (v.moveTo || !i ? ' M ' : ' L ') + xy(v);
          } else {
            path += ' Q ' + xy2(v[0], v[1]) + ' ' + xy2(v[2], v[3]);
          }
        }
      } else {
        path = 'M ' + xy(vertices[0]);
        for (i = 1; i < numVerts; i++) {
          v = vertices[i];
          if (v.isVert) {
            path += (v.moveTo || !i ? ' M ' : ' L ') + xy(v);
          }
        }
      }
      break;

    case constants.POINTS:
      for (i = 0; i < numVerts; i++) {
        v = vertices[i];
        if (this._doStroke) {
          this._pInst.stroke(v[6]);
        }
        this._pInst.point(v[0], v[1]);
      }
      break;

    case constants.LINES:
      for (i = 0; i + 1 < numVerts; i += 2) {
        v = vertices[i];
        if (this._doStroke) {
          this._pInst.stroke(vertices[i + 1][6]);
        }
        this._pInst.line(v[0], v[1], vertices[i + 1][0], vertices[i + 1][1]);
      }
      break;

    case constants.TRIANGLES:
      for (i = 0; i < numVerts - 2; i += 3) {
        this.triangle(
          vertices[i + 0][0],
          vertices[i + 0][1],
          vertices[i + 1][0],
          vertices[i + 1][1],
          vertices[i + 2][0],
          vertices[i + 2][1]
        );
      }
      break;

    case constants.TRIANGLE_STRIP:
      for (i = 0; i < numVerts - 2; i += 1) {
        this.triangle(
          vertices[i + 0][0],
          vertices[i + 0][1],
          vertices[i + 1][0],
          vertices[i + 1][1],
          vertices[i + 2][0],
          vertices[i + 2][1]
        );
      }
      break;

    case constants.TRIANGLE_FAN:
      for (i = 1; i < numVerts - 1; i += 1) {
        this.triangle(
          vertices[0][0],
          vertices[0][1],
          vertices[i + 0][0],
          vertices[i + 0][1],
          vertices[i + 1][0],
          vertices[i + 1][1]
        );
      }
      break;

    case constants.QUADS:
      for (i = 0; i < numVerts - 3; i += 4) {
        this.quad(
          vertices[i + 0][0],
          vertices[i + 0][1],
          vertices[i + 1][0],
          vertices[i + 1][1],
          vertices[i + 2][0],
          vertices[i + 2][1],
          vertices[i + 3][0],
          vertices[i + 3][1]
        );
      }
      break;

    case constants.QUAD_STRIP:
      for (i = 0; i < numVerts - 3; i += 2) {
        this.quad(
          vertices[i + 0][0],
          vertices[i + 0][1],
          vertices[i + 1][0],
          vertices[i + 1][1],
          vertices[i + 3][0],
          vertices[i + 3][1],
          vertices[i + 2][0],
          vertices[i + 2][1]
        );
      }
      break;
  }

  if (path) {
    var elt = this._addElement('path', { d: path });
    this._applyStroke(elt);
    if (this._doFill) {
      elt.setAttributeNS(null, 'fill', this._fillColor.toString());
    }
  }

  isCurve = false;
  isBezier = false;
  isQuadratic = false;
  isContour = false;
  if (closeShape) {
    vertices.pop();
  }
  return this;
};

p5.RendererSVG.prototype.translate = function(x, y) {
  this._addTransform('translate(' + xy2(x, y) + ')');
  return this;
};

p5.RendererSVG.prototype.translate = function(x, y) {
  this._addTransform('translate(' + xy2(x, y) + ')');
  return this;
};

p5.RendererSVG.prototype.scale = function(x, y) {
  this._addTransform('scale(' + xy2(x, y) + ')');
  return this;
};

p5.RendererSVG.prototype.rotate = function(rad) {
  this._addTransform('rotate(' + this._pInst._toDegrees(rad) + ')');
  return this;
};

p5.RendererSVG.prototype.shearX = function(rad) {
  this._addTransform('skewX(' + this._pInst._toDegrees(rad) + ')');
  return this;
};

p5.RendererSVG.prototype.shearY = function(rad) {
  this._addTransform('skewY(' + this._pInst._toDegrees(rad) + ')');
  return this;
};

p5.RendererSVG.prototype.applyMatrix = function(a, b, c, d, e, f) {
  this._addTransform('matrix(' + [a, b, c, d, e, f].join(',') + ')');
  return this;
};

// TODO: this is likely broken if push() is called after transforms were applied,
p5.RendererSVG.prototype.resetMatrix = function() {
  var styleCount = this._pInst._styles.length;
  if (styleCount > 0) {
    var lastStyle = this._pInst._styles[styleCount - 1];
    this.container = lastStyle._rendererState.container;
  } else {
    this.container = this.elt;
  }
};

p5.RendererSVG.prototype._newState = function() {
  if (this.container === this.elt || this.container.firstElementChild) {
    this.container = this._addElement('g');
  }
  return this.container;
};

p5.RendererSVG.prototype._addTransform = function(newTransform) {
  var container = this._newState();
  var transform = container.getAttributeNS(null, 'transform') || '';
  container.setAttributeNS(null, 'transform', transform + ' ' + newTransform);
  return this;
};

p5.RendererSVG.prototype.push = function() {
  var oldContainer = this.container;
  this.container = this._addElement('g');
  return {
    container: oldContainer
  };
};

p5.RendererSVG.prototype.pop = function(state) {
  this.container = state.container;
};

//////////////////////////////////////////////
// SHAPE | Attributes
//////////////////////////////////////////////

p5.RendererSVG.prototype.noSmooth = function() {
  this.container.setAttributeNS(null, 'shape-rendering', 'optimizeSpeed');
  return this;
};

p5.RendererSVG.prototype.smooth = function() {
  this.container.setAttributeNS(null, 'shape-rendering', 'geometricPrecision');
  return this;
};

p5.RendererSVG.prototype.strokeCap = function(cap) {
  switch (cap) {
    case constants.ROUND:
    default:
      this._strokeCap = null;
      break;
    case constants.SQUARE:
      this._strokeCap = 'butt';
      break;
    case constants.PROJECT:
      this._strokeCap = 'square';
      break;
  }
  return this;
};

p5.RendererSVG.prototype.strokeJoin = function(join) {
  switch (join) {
    case constants.MITER:
    default:
      this._strokeJoin = null;
      break;
    case constants.BEVEL:
      this._strokeJoin = 'bevel';
      break;
    case constants.ROUND:
      this._strokeJoin = 'round';
      break;
  }
  return this;
};

p5.RendererSVG.prototype.blendMode = function(mode) {
  switch (mode) {
    // TODO: some of these are missing
    case constants.BLEND:
      this._blendMode = null;
      break;
    default:
      this._blendMode = mode;
      break;
  }
};

p5.RendererSVG.prototype.textWidth = function(s) {
  if (this._isOpenType()) {
    return this._textFont._textWidth(s, this._textSize);
  }
  var elt = this._addElement('text', {
    'font-size': this._textSize,
    style: 'font-family: ' + this._textFont
  });
  elt.textContent = s;
  this._applyStroke(elt);
  var width = elt.clientWidth;
  elt.parentNode.removeChild(elt);
  return width;
};

p5.RendererSVG.prototype._applyTextProperties = function() {
  var font,
    p = this._pInst;

  p5.Renderer.prototype._applyTextProperties.apply(this, arguments);

  font = this._textFont;
  if (this._isOpenType()) {
    font = this._textFont.font.familyName;
  }

  this.drawingContext.font =
    (this._textStyle || 'normal') +
    ' ' +
    (this._textSize || 12) +
    'px ' +
    (font || 'sans-serif');

  this.drawingContext.textAlign = this._textAlign;

  switch (this._textAlign) {
    case constants.LEFT:
      this._textAnchor = null;
      break;
    case constants.CENTER:
      this._textAnchor = 'middle';
      break;
    case constants.RIGHT:
      this._textAnchor = 'end';
      break;
  }

  switch (this._textBaseline) {
    case constants.TOP:
      this._alignmentBaseline = 'hanging';
      break;
    case constants.CENTER:
      this._alignmentBaseline = 'middle';
      break;
    case constants.BOTTOM:
    case constants.BASELINE:
      this._alignmentBaseline = null;
      break;
  }

  return p;
};

p5.RendererSVG.prototype._renderText = function(p, line, x, y, maxY) {
  if (y >= maxY) {
    return; // don't render lines beyond our maxY position
  }

  p.push(); // fix to #803

  if (!this._isOpenType()) {
    // a system/browser font

    var elt = this._addElement('text', {
      x: x,
      y: y,
      'font-size': this._textSize,
      style: 'font-family: ' + this._textFont
    });

    if (this._alignmentBaseline) {
      elt.setAttributeNS(null, 'dominant-baseline', this._alignmentBaseline);
    }
    if (this._textAnchor) {
      elt.setAttributeNS(null, 'text-anchor', this._textAnchor);
    }

    switch (this._textStyle) {
      case constants.BOLD:
        elt.style.fontWeight = 'bold';
        break;
      case constants.ITALIC:
        elt.style.fontStyle = 'italic';
        break;
    }

    if (this._strokeSet) {
      this._applyStroke(elt);
    }
    if (this._doFill) {
      var fillColor = this._fillSet
        ? this._fillColor
        : constants._DEFAULT_TEXT_FILL;
      elt.setAttributeNS(null, 'fill', fillColor.toString());
    }

    elt.textContent = line;
  } else {
    // an opentype font, let it handle the rendering

    this._textFont._renderPath(line, x, y, { renderer: this });
  }

  p.pop();

  return p;
};

module.exports = p5.RendererSVG;
