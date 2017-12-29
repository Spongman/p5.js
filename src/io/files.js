/**
 * @module IO
 * @submodule Input
 * @for p5
 * @requires core
 */

/* globals Request: false */
/* globals Headers: false */

'use strict';

var p5 = require('../core/main');
require('whatwg-fetch');
require('es6-promise').polyfill();
var fetchJsonp = require('fetch-jsonp');
require('../core/error_helpers');

/**
 * Loads a JSON file from a file or a URL, and returns an Object.
 * Note that even if the JSON file contains an Array, an Object will be
 * returned with index numbers as keys.
 *
 * This method is asynchronous, meaning it may not finish before the next
 * line in your sketch is executed. JSONP is supported via a polyfill and you
 * can pass in as the second argument an object with definitions of the json
 * callback following the syntax specified <a href="https://github.com/camsong/
 * fetch-jsonp">here</a>.
 *
 * @method loadJSON
 * @param  {String}        path       name of the file or url to load
 * @param  {Object}        [jsonpOptions] options object for jsonp related settings
 * @param  {String}        [datatype] "json" or "jsonp"
 * @param  {function}      [callback] function to be executed after
 *                                    <a href="#/p5/loadJSON">loadJSON()</a> completes, data is passed
 *                                    in as first argument
 * @param  {function}      [errorCallback] function to be executed if
 *                                    there is an error, response is passed
 *                                    in as first argument
 * @return {Object|Array}             JSON data
 * @example
 *
 * <p>Calling <a href="#/p5/loadJSON">loadJSON()</a> inside <a href="#/p5/preload">preload()</a> guarantees to complete the
 * operation before <a href="#/p5/setup">setup()</a> and <a href="#/p5/draw">draw()</a> are called.</p>
 *
 * <div><code>
 * // Examples use USGS Earthquake API:
 * //   https://earthquake.usgs.gov/fdsnws/event/1/#methods
 * var earthquakes;
 * function preload() {
 *   // Get the most recent earthquake in the database
 *   var url =
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/' +
 *     'summary/all_day.geojson';
 *   earthquakes = loadJSON(url);
 * }
 *
 * function setup() {
 *   noLoop();
 * }
 *
 * function draw() {
 *   background(200);
 *   // Get the magnitude and name of the earthquake out of the loaded JSON
 *   var earthquakeMag = earthquakes.features[0].properties.mag;
 *   var earthquakeName = earthquakes.features[0].properties.place;
 *   ellipse(width / 2, height / 2, earthquakeMag * 10, earthquakeMag * 10);
 *   textAlign(CENTER);
 *   text(earthquakeName, 0, height - 30, width, 30);
 * }
 * </code></div>
 *
 *
 * <p>Outside of preload(), you may supply a callback function to handle the
 * object:</p>
 * <div><code>
 * function setup() {
 *   noLoop();
 *   var url =
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/' +
 *     'summary/all_day.geojson';
 *   loadJSON(url, drawEarthquake);
 * }
 *
 * function draw() {
 *   background(200);
 * }
 *
 * function drawEarthquake(earthquakes) {
 *   // Get the magnitude and name of the earthquake out of the loaded JSON
 *   var earthquakeMag = earthquakes.features[0].properties.mag;
 *   var earthquakeName = earthquakes.features[0].properties.place;
 *   ellipse(width / 2, height / 2, earthquakeMag * 10, earthquakeMag * 10);
 *   textAlign(CENTER);
 *   text(earthquakeName, 0, height - 30, width, 30);
 * }
 * </code></div>
 *
 * @alt
 * 50x50 ellipse that changes from black to white depending on the current humidity
 * 50x50 ellipse that changes from black to white depending on the current humidity
 *
 */
/**
 * @method loadJSON
 * @param  {String}        path
 * @param  {String}        datatype
 * @param  {function}      [callback]
 * @param  {function}      [errorCallback]
 * @return {Object|Array}
 */
/**
 * @method loadJSON
 * @param  {String}        path
 * @param  {function}      callback
 * @param  {function}      [errorCallback]
 * @return {Object|Array}
 */
p5.prototype.loadJSON = function() {
  var path = arguments[0];
  var callback;
  var errorCallback;
  var options;

  var ret = {}; // object needed for preload
  var t = 'json';

  // check for explicit data type argument
  for (var i = 1; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg === 'string') {
      if (arg === 'jsonp' || arg === 'json') {
        t = arg;
      }
    } else if (typeof arg === 'function') {
      if (!callback) {
        callback = arg;
      } else {
        errorCallback = arg;
      }
    } else if (typeof arg === 'object' && arg.hasOwnProperty('jsonpCallback')) {
      t = 'jsonp';
      options = arg;
    }
  }

  var self = this;
  this.httpDo(
    path,
    'GET',
    options,
    t,
    function(resp) {
      for (var k in resp) {
        ret[k] = resp[k];
      }
      if (typeof callback !== 'undefined') {
        callback(resp);
      }

      self._decrementPreload();
    },
    errorCallback
  );

  return ret;
};

/**
 * Reads the contents of a file and creates a String array of its individual
 * lines. If the name of the file is used as the parameter, as in the above
 * example, the file must be located in the sketch directory/folder.
 * <br><br>
 * Alternatively, the file maybe be loaded from anywhere on the local
 * computer using an absolute path (something that starts with / on Unix and
 * Linux, or a drive letter on Windows), or the filename parameter can be a
 * URL for a file found on a network.
 * <br><br>
 * This method is asynchronous, meaning it may not finish before the next
 * line in your sketch is executed.
 *
 * @method loadStrings
 * @param  {String}   filename   name of the file or url to load
 * @param  {function} [callback] function to be executed after <a href="#/p5/loadStrings">loadStrings()</a>
 *                               completes, Array is passed in as first
 *                               argument
 * @param  {function} [errorCallback] function to be executed if
 *                               there is an error, response is passed
 *                               in as first argument
 * @return {String[]}            Array of Strings
 * @example
 *
 * <p>Calling loadStrings() inside <a href="#/p5/preload">preload()</a> guarantees to complete the
 * operation before <a href="#/p5/setup">setup()</a> and <a href="#/p5/draw">draw()</a> are called.</p>
 *
 * <div><code>
 * var result;
 * function preload() {
 *   result = loadStrings('assets/test.txt');
 * }

 * function setup() {
 *   background(200);
 *   var ind = floor(random(result.length));
 *   text(result[ind], 10, 10, 80, 80);
 * }
 * </code></div>
 *
 * <p>Outside of preload(), you may supply a callback function to handle the
 * object:</p>
 *
 * <div><code>
 * function setup() {
 *   loadStrings('assets/test.txt', pickString);
 * }
 *
 * function pickString(result) {
 *   background(200);
 *   var ind = floor(random(result.length));
 *   text(result[ind], 10, 10, 80, 80);
 * }
 * </code></div>
 *
 * @alt
 * randomly generated text from a file, for example "i smell like butter"
 * randomly generated text from a file, for example "i have three feet"
 *
 */
p5.prototype.loadStrings = function() {
  var ret = [];
  var callback, errorCallback;

  for (var i = 1; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg === 'function') {
      if (typeof callback === 'undefined') {
        callback = arg;
      } else if (typeof errorCallback === 'undefined') {
        errorCallback = arg;
      }
    }
  }

  var self = this;
  p5.prototype.httpDo.call(
    this,
    arguments[0],
    'GET',
    'text',
    function(data) {
      // split lines handling mac/windows/linux endings
      var lines = data
        .replace(/\r\n/g, '\r')
        .replace(/\n/g, '\r')
        .split(/\r/);
      Array.prototype.push.apply(ret, lines);

      if (typeof callback !== 'undefined') {
        callback(ret);
      }

      self._decrementPreload();
    },
    errorCallback
  );

  return ret;
};

/**
 * <p>Reads the contents of a file or URL and creates a <a href="#/p5.Table">p5.Table</a> object with
 * its values. If a file is specified, it must be located in the sketch's
 * "data" folder. The filename parameter can also be a URL to a file found
 * online. By default, the file is assumed to be comma-separated (in CSV
 * format). Table only looks for a header row if the 'header' option is
 * included.</p>
 *
 * <p>Possible options include:
 * <ul>
 * <li>csv - parse the table as comma-separated values</li>
 * <li>tsv - parse the table as tab-separated values</li>
 * <li>header - this table has a header (title) row</li>
 * </ul>
 * </p>
 *
 * <p>When passing in multiple options, pass them in as separate parameters,
 * seperated by commas. For example:
 * <br><br>
 * <code>
 * loadTable('my_csv_file.csv', 'csv', 'header');
 * </code>
 * </p>
 *
 * <p> All files loaded and saved use UTF-8 encoding.</p>
 *
 * <p>This method is asynchronous, meaning it may not finish before the next
 * line in your sketch is executed. Calling <a href="#/p5/loadTable">loadTable()</a> inside <a href="#/p5/preload">preload()</a>
 * guarantees to complete the operation before <a href="#/p5/setup">setup()</a> and <a href="#/p5/draw">draw()</a> are called.
 * <p>Outside of <a href="#/p5/preload">preload()</a>, you may supply a callback function to handle the
 * object:</p>
 * </p>
 *
 * @method loadTable
 * @param  {String}         filename   name of the file or URL to load
 * @param  {String}         options  "header" "csv" "tsv"
 * @param  {function}       [callback] function to be executed after
 *                                     <a href="#/p5/loadTable">loadTable()</a> completes. On success, the
 *                                     <a href="#/p5.Table">Table</a> object is passed in as the
 *                                     first argument.
 * @param  {function}  [errorCallback] function to be executed if
 *                                     there is an error, response is passed
 *                                     in as first argument
 * @return {Object}                    <a href="#/p5.Table">Table</a> object containing data
 *
 * @example
 * <div class="norender">
 * <code>
 * // Given the following CSV file called "mammals.csv"
 * // located in the project's "assets" folder:
 * //
 * // id,species,name
 * // 0,Capra hircus,Goat
 * // 1,Panthera pardus,Leopard
 * // 2,Equus zebra,Zebra
 *
 * var table;
 *
 * function preload() {
 *   //my table is comma separated value "csv"
 *   //and has a header specifying the columns labels
 *   table = loadTable('assets/mammals.csv', 'csv', 'header');
 *   //the file can be remote
 *   //table = loadTable("http://p5js.org/reference/assets/mammals.csv",
 *   //                  "csv", "header");
 * }
 *
 * function setup() {
 *   //count the columns
 *   print(table.getRowCount() + ' total rows in table');
 *   print(table.getColumnCount() + ' total columns in table');
 *
 *   print(table.getColumn('name'));
 *   //["Goat", "Leopard", "Zebra"]
 *
 *   //cycle through the table
 *   for (var r = 0; r < table.getRowCount(); r++)
 *     for (var c = 0; c < table.getColumnCount(); c++) {
 *       print(table.getString(r, c));
 *     }
 * }
 * </code>
 * </div>
 *
 * @alt
 * randomly generated text from a file, for example "i smell like butter"
 * randomly generated text from a file, for example "i have three feet"
 *
 */
/**
 * @method loadTable
 * @param  {String}         filename
 * @param  {function}       [callback]
 * @param  {function}  [errorCallback]
 * @return {Object}
 */
p5.prototype.loadTable = function(path) {
  var callback;
  var errorCallback;
  var options = [];
  var header = false;
  var ext = path.substring(path.lastIndexOf('.') + 1, path.length);
  var sep = ',';
  var separatorSet = false;

  if (ext === 'tsv') {
    //Only need to check extension is tsv because csv is default
    sep = '\t';
  }

  for (var i = 1; i < arguments.length; i++) {
    if (typeof arguments[i] === 'function') {
      if (typeof callback === 'undefined') {
        callback = arguments[i];
      } else if (typeof errorCallback === 'undefined') {
        errorCallback = arguments[i];
      }
    } else if (typeof arguments[i] === 'string') {
      options.push(arguments[i]);
      if (arguments[i] === 'header') {
        header = true;
      }
      if (arguments[i] === 'csv') {
        if (separatorSet) {
          throw new Error('Cannot set multiple separator types.');
        } else {
          sep = ',';
          separatorSet = true;
        }
      } else if (arguments[i] === 'tsv') {
        if (separatorSet) {
          throw new Error('Cannot set multiple separator types.');
        } else {
          sep = '\t';
          separatorSet = true;
        }
      }
    }
  }

  var t = new p5.Table();

  var self = this;
  this.httpDo(
    path,
    'GET',
    'text',
    function(resp) {
      var state = {};

      // define constants
      var PRE_TOKEN = 0,
        MID_TOKEN = 1,
        POST_TOKEN = 2,
        POST_RECORD = 4;

      var QUOTE = '"',
        CR = '\r',
        LF = '\n';

      var records = [];
      var offset = 0;
      var currentRecord = null;
      var currentChar;

      var tokenBegin = function() {
        state.currentState = PRE_TOKEN;
        state.token = '';
      };

      var tokenEnd = function() {
        currentRecord.push(state.token);
        tokenBegin();
      };

      var recordBegin = function() {
        state.escaped = false;
        currentRecord = [];
        tokenBegin();
      };

      var recordEnd = function() {
        state.currentState = POST_RECORD;
        records.push(currentRecord);
        currentRecord = null;
      };

      for (;;) {
        currentChar = resp[offset++];

        // EOF
        if (currentChar == null) {
          if (state.escaped) {
            throw new Error('Unclosed quote in file.');
          }
          if (currentRecord) {
            tokenEnd();
            recordEnd();
            break;
          }
        }
        if (currentRecord === null) {
          recordBegin();
        }

        // Handle opening quote
        if (state.currentState === PRE_TOKEN) {
          if (currentChar === QUOTE) {
            state.escaped = true;
            state.currentState = MID_TOKEN;
            continue;
          }
          state.currentState = MID_TOKEN;
        }

        // mid-token and escaped, look for sequences and end quote
        if (state.currentState === MID_TOKEN && state.escaped) {
          if (currentChar === QUOTE) {
            if (resp[offset] === QUOTE) {
              state.token += QUOTE;
              offset++;
            } else {
              state.escaped = false;
              state.currentState = POST_TOKEN;
            }
          } else if (currentChar === CR) {
            continue;
          } else {
            state.token += currentChar;
          }
          continue;
        }

        // fall-through: mid-token or post-token, not escaped
        if (currentChar === CR) {
          if (resp[offset] === LF) {
            offset++;
          }
          tokenEnd();
          recordEnd();
        } else if (currentChar === LF) {
          tokenEnd();
          recordEnd();
        } else if (currentChar === sep) {
          tokenEnd();
        } else if (state.currentState === MID_TOKEN) {
          state.token += currentChar;
        }
      }

      // set up column names
      if (header) {
        t.columns = records.shift();
      } else {
        for (i = 0; i < records[0].length; i++) {
          t.columns[i] = 'null';
        }
      }
      var row;
      for (i = 0; i < records.length; i++) {
        //Handles row of 'undefined' at end of some CSVs
        if (records[i].length === 1) {
          if (records[i][0] === 'undefined' || records[i][0] === '') {
            continue;
          }
        }
        row = new p5.TableRow();
        row.arr = records[i];
        row.obj = makeObject(records[i], t.columns);
        t.addRow(row);
      }
      if (typeof callback === 'function') {
        callback(t);
      }

      self._decrementPreload();
    },
    function(err) {
      // Error handling
      p5._friendlyFileLoadError(2, path);

      if (errorCallback) {
        errorCallback(err);
      } else {
        throw err;
      }
    }
  );

  return t;
};

// helper function to turn a row into a JSON object
function makeObject(row, headers) {
  var ret = {};
  headers = headers || [];
  if (typeof headers === 'undefined') {
    for (var j = 0; j < row.length; j++) {
      headers[j.toString()] = j;
    }
  }
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = row[i];
    ret[key] = val;
  }
  return ret;
}

function parseXML(two) {
  var one = new p5.XML();
  var children = two.childNodes;
  if (children && children.length) {
    for (var i = 0; i < children.length; i++) {
      var node = parseXML(children[i]);
      one.addChild(node);
    }
    one.setName(two.nodeName);
    one._setCont(two.textContent);
    one._setAttributes(two);
    for (var j = 0; j < one.children.length; j++) {
      one.children[j].parent = one;
    }
    return one;
  } else {
    one.setName(two.nodeName);
    one._setCont(two.textContent);
    one._setAttributes(two);
    return one;
  }
}

/**
 * Reads the contents of a file and creates an XML object with its values.
 * If the name of the file is used as the parameter, as in the above example,
 * the file must be located in the sketch directory/folder.
 *
 * Alternatively, the file maybe be loaded from anywhere on the local
 * computer using an absolute path (something that starts with / on Unix and
 * Linux, or a drive letter on Windows), or the filename parameter can be a
 * URL for a file found on a network.
 *
 * This method is asynchronous, meaning it may not finish before the next
 * line in your sketch is executed. Calling <a href="#/p5/loadXML">loadXML()</a> inside <a href="#/p5/preload">preload()</a>
 * guarantees to complete the operation before <a href="#/p5/setup">setup()</a> and <a href="#/p5/draw">draw()</a> are called.
 *
 * Outside of <a href="#/p5/preload">preload()</a>, you may supply a callback function to handle the
 * object.
 *
 * @method loadXML
 * @param  {String}   filename   name of the file or URL to load
 * @param  {function} [callback] function to be executed after <a href="#/p5/loadXML">loadXML()</a>
 *                               completes, XML object is passed in as
 *                               first argument
 * @param  {function} [errorCallback] function to be executed if
 *                               there is an error, response is passed
 *                               in as first argument
 * @return {Object}              XML object containing data
 * @example
 * <div class='norender'><code>
 * // The following short XML file called "mammals.xml" is parsed
 * // in the code below.
 * //
 * // <?xml version="1.0"?>
 * // &lt;mammals&gt;
 * //   &lt;animal id="0" species="Capra hircus">Goat&lt;/animal&gt;
 * //   &lt;animal id="1" species="Panthera pardus">Leopard&lt;/animal&gt;
 * //   &lt;animal id="2" species="Equus zebra">Zebra&lt;/animal&gt;
 * // &lt;/mammals&gt;
 *
 * var xml;
 *
 * function preload() {
 *   xml = loadXML('assets/mammals.xml');
 * }
 *
 * function setup() {
 *   var children = xml.getChildren('animal');
 *
 *   for (var i = 0; i < children.length; i++) {
 *     var id = children[i].getNum('id');
 *     var coloring = children[i].getString('species');
 *     var name = children[i].getContent();
 *     print(id + ', ' + coloring + ', ' + name);
 *   }
 * }
 *
 * // Sketch prints:
 * // 0, Capra hircus, Goat
 * // 1, Panthera pardus, Leopard
 * // 2, Equus zebra, Zebra
 * </code></div>
 *
 * @alt
 * no image displayed
 *
 */
p5.prototype.loadXML = function() {
  var ret = {};
  var callback, errorCallback;

  for (var i = 1; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg === 'function') {
      if (typeof callback === 'undefined') {
        callback = arg;
      } else if (typeof errorCallback === 'undefined') {
        errorCallback = arg;
      }
    }
  }

  var self = this;
  this.httpDo(
    arguments[0],
    'GET',
    'xml',
    function(xml) {
      for (var key in xml) {
        ret[key] = xml[key];
      }
      if (typeof callback !== 'undefined') {
        callback(ret);
      }

      self._decrementPreload();
    },
    errorCallback
  );

  return ret;
};

/**
 * @method loadBytes
 * @param {string}   file            name of the file or URL to load
 * @param {function} [callback]      function to be executed after <a href="#/p5/loadBytes">loadBytes()</a>
 *                                    completes
 * @param {function} [errorCallback] function to be executed if there
 *                                    is an error
 * @returns {Object} an object whose 'bytes' property will be the loaded buffer
 *
 * @example
 * <div class='norender'><code>
 * var data;
 *
 * function preload() {
 *   data = loadBytes('assets/mammals.xml');
 * }
 *
 * function setup() {
 *   for (var i = 0; i < 5; i++) {
 *     console.log(data.bytes[i].toString(16));
 *   }
 * }
 * </code></div>
 *
 * @alt
 * no image displayed
 *
 */
p5.prototype.loadBytes = function(file, callback, errorCallback) {
  var ret = {};

  var self = this;
  this.httpDo(
    file,
    'GET',
    'arrayBuffer',
    function(arrayBuffer) {
      ret.bytes = new Uint8Array(arrayBuffer);

      if (typeof callback === 'function') {
        callback(ret);
      }

      self._decrementPreload();
    },
    errorCallback
  );
  return ret;
};

/**
 * Method for executing an HTTP GET request. If data type is not specified,
 * p5 will try to guess based on the URL, defaulting to text. This is equivalent to
 * calling <code>httpDo(path, 'GET')</code>. The 'binary' datatype will return
 * a Blob object, and the 'arrayBuffer' datatype will return an ArrayBuffer
 * which can be used to initialize typed arrays (such as Uint8Array).
 *
 * @method httpGet
 * @param  {String}        path       name of the file or url to load
 * @param  {String}        [datatype] "json", "jsonp", "binary", "arrayBuffer",
 *                                    "xml", or "text"
 * @param  {Object|Boolean} [data]    param data passed sent with request
 * @param  {function}      [callback] function to be executed after
 *                                    <a href="#/p5/httpGet">httpGet()</a> completes, data is passed in
 *                                    as first argument
 * @param  {function}      [errorCallback] function to be executed if
 *                                    there is an error, response is passed
 *                                    in as first argument
 * @return {Promise} A promise that resolves with the data when the operation
 *                   completes successfully or rejects with the error after
 *                   one occurs.
 * @example
 * <div class='norender'><code>
 * // Examples use USGS Earthquake API:
 * //   https://earthquake.usgs.gov/fdsnws/event/1/#methods
 * var earthquakes;
 * function preload() {
 *   // Get the most recent earthquake in the database
 *   var url =
    'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
 *     'format=geojson&limit=1&orderby=time';
 *   httpGet(url, 'jsonp', false, function(response) {
 *     // when the HTTP request completes, populate the variable that holds the
 *     // earthquake data used in the visualization.
 *     earthquakes = response;
 *   });
 * }
 *
 * function draw() {
 *   if (!earthquakes) {
 *     // Wait until the earthquake data has loaded before drawing.
 *     return;
 *   }
 *   background(200);
 *   // Get the magnitude and name of the earthquake out of the loaded JSON
 *   var earthquakeMag = earthquakes.features[0].properties.mag;
 *   var earthquakeName = earthquakes.features[0].properties.place;
 *   ellipse(width / 2, height / 2, earthquakeMag * 10, earthquakeMag * 10);
 *   textAlign(CENTER);
 *   text(earthquakeName, 0, height - 30, width, 30);
 *   noLoop();
 * }
 * </code></div>
 */
/**
 * @method httpGet
 * @param  {String}        path
 * @param  {Object|Boolean} data
 * @param  {function}      [callback]
 * @param  {function}      [errorCallback]
 * @return {Promise}
 */
/**
 * @method httpGet
 * @param  {String}        path
 * @param  {function}      callback
 * @param  {function}      [errorCallback]
 * @return {Promise}
 */
p5.prototype.httpGet = function() {
  var args = Array.prototype.slice.call(arguments);
  args.splice(1, 0, 'GET');
  return p5.prototype.httpDo.apply(this, args);
};

/**
 * Method for executing an HTTP POST request. If data type is not specified,
 * p5 will try to guess based on the URL, defaulting to text. This is equivalent to
 * calling <code>httpDo(path, 'POST')</code>.
 *
 * @method httpPost
 * @param  {String}        path       name of the file or url to load
 * @param  {String}        [datatype] "json", "jsonp", "xml", or "text".
 *                                    If omitted, <a href="#/p5/httpPost">httpPost()</a> will guess.
 * @param  {Object|Boolean} [data]    param data passed sent with request
 * @param  {function}      [callback] function to be executed after
 *                                    <a href="#/p5/httpPost">httpPost()</a> completes, data is passed in
 *                                    as first argument
 * @param  {function}      [errorCallback] function to be executed if
 *                                    there is an error, response is passed
 *                                    in as first argument
 * @return {Promise} A promise that resolves with the data when the operation
 *                   completes successfully or rejects with the error after
 *                   one occurs.
 *
 * @example
 * <div>
 * <code>
 * // Examples use jsonplaceholder.typicode.com for a Mock Data API
 *
 * var url = 'https://jsonplaceholder.typicode.com/posts';
 * var postData = { userId: 1, title: 'p5 Clicked!', body: 'p5.js is way cool.' };
 *
 * function setup() {
 *   createCanvas(800, 800);
 * }
 *
 * function mousePressed() {
 *   // Pick new random color values
 *   var r = random(255);
 *   var g = random(255);
 *   var b = random(255);
 *
 *   httpPost(url, 'json', postData, function(result) {
 *     strokeWeight(2);
 *     stroke(r, g, b);
 *     fill(r, g, b, 127);
 *     ellipse(mouseX, mouseY, 200, 200);
 *     text(result.body, mouseX, mouseY);
 *   });
 * }
 * </code>
 * </div>
 *
 *
 * <div><code>
 * var url = 'https://invalidURL'; // A bad URL that will cause errors
 * var postData = { title: 'p5 Clicked!', body: 'p5.js is way cool.' };
 *
 * function setup() {
 *   createCanvas(800, 800);
 * }
 *
 * function mousePressed() {
 *   // Pick new random color values
 *   var r = random(255);
 *   var g = random(255);
 *   var b = random(255);
 *
 *   httpPost(
 *     url,
 *     'json',
 *     postData,
 *     function(result) {
 *       // ... won't be called
 *     },
 *     function(error) {
 *       strokeWeight(2);
 *       stroke(r, g, b);
 *       fill(r, g, b, 127);
 *       text(error.toString(), mouseX, mouseY);
 *     }
 *   );
 * }
 * </code></div>
 *
 */
/**
 * @method httpPost
 * @param  {String}        path
 * @param  {Object|Boolean} data
 * @param  {function}      [callback]
 * @param  {function}      [errorCallback]
 * @return {Promise}
 */
/**
 * @method httpPost
 * @param  {String}        path
 * @param  {function}      callback
 * @param  {function}      [errorCallback]
 * @return {Promise}
 */
p5.prototype.httpPost = function() {
  var args = Array.prototype.slice.call(arguments);
  args.splice(1, 0, 'POST');
  return p5.prototype.httpDo.apply(this, args);
};

/**
 * Method for executing an HTTP request. If data type is not specified,
 * p5 will try to guess based on the URL, defaulting to text.<br><br>
 * For more advanced use, you may also pass in the path as the first argument
 * and a object as the second argument, the signature follows the one specified
 * in the Fetch API specification.
 *
 * @method httpDo
 * @param  {String}        path       name of the file or url to load
 * @param  {String}        [method]   either "GET", "POST", or "PUT",
 *                                    defaults to "GET"
 * @param  {String}        [datatype] "json", "jsonp", "xml", or "text"
 * @param  {Object}        [data]     param data passed sent with request
 * @param  {function}      [callback] function to be executed after
 *                                    <a href="#/p5/httpGet">httpGet()</a> completes, data is passed in
 *                                    as first argument
 * @param  {function}      [errorCallback] function to be executed if
 *                                    there is an error, response is passed
 *                                    in as first argument
 * @return {Promise} A promise that resolves with the data when the operation
 *                   completes successfully or rejects with the error after
 *                   one occurs.
 *
 * @example
 * <div>
 * <code>
 * // Examples use USGS Earthquake API:
 * // https://earthquake.usgs.gov/fdsnws/event/1/#methods
 *
 * // displays an animation of all USGS earthquakes
 * var earthquakes;
 * var eqFeatureIndex = 0;
 *
 * function preload() {
 *   var url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson';
 *   httpDo(
 *     url,
 *     {
 *       method: 'GET',
 *       // Other Request options, like special headers for apis
 *       headers: { authorization: 'Bearer secretKey' }
 *     },
 *     function(res) {
 *       earthquakes = res;
 *     }
 *   );
 * }
 *
 * function draw() {
 *   // wait until the data is loaded
 *   if (!earthquakes || !earthquakes.features[eqFeatureIndex]) {
 *     return;
 *   }
 *   clear();
 *
 *   var feature = earthquakes.features[eqFeatureIndex];
 *   var mag = feature.properties.mag;
 *   var rad = mag / 11 * ((width + height) / 2);
 *   fill(255, 0, 0, 100);
 *   ellipse(width / 2 + random(-2, 2), height / 2 + random(-2, 2), rad, rad);
 *
 *   if (eqFeatureIndex >= earthquakes.features.length) {
 *     eqFeatureIndex = 0;
 *   } else {
 *     eqFeatureIndex += 1;
 *   }
 * }
 * </code>
 * </div>
 */
/**
 * @method httpDo
 * @param  {String}        path
 * @param  {Object}        options   Request object options as documented in the
 *                                    "fetch" API
 * <a href="https://developer.mozilla.org/en/docs/Web/API/Fetch_API">reference</a>
 * @param  {function}      [callback]
 * @param  {function}      [errorCallback]
 * @return {Promise}
 */
p5.prototype.httpDo = function() {
  var type;
  var callback;
  var errorCallback;
  var request;
  var jsonpOptions = {};
  var cbCount = 0;
  var contentType = 'text/plain';
  // Trim the callbacks off the end to get an idea of how many arguments are passed
  for (var i = arguments.length - 1; i > 0; i--) {
    if (typeof arguments[i] === 'function') {
      cbCount++;
    } else {
      break;
    }
  }
  // The number of arguments minus callbacks
  var argsCount = arguments.length - cbCount;
  var path = arguments[0];
  if (
    argsCount === 2 &&
    typeof path === 'string' &&
    typeof arguments[1] === 'object'
  ) {
    // Intended for more advanced use, pass in Request parameters directly
    request = new Request(path, arguments[1]);
    callback = arguments[2];
    errorCallback = arguments[3];
  } else {
    // Provided with arguments
    var method = 'GET';
    var data;

    for (var j = 1; j < arguments.length; j++) {
      var a = arguments[j];
      if (typeof a === 'string') {
        if (a === 'GET' || a === 'POST' || a === 'PUT' || a === 'DELETE') {
          method = a;
        } else if (
          a === 'json' ||
          a === 'jsonp' ||
          a === 'binary' ||
          a === 'arrayBuffer' ||
          a === 'xml' ||
          a === 'text'
        ) {
          type = a;
        } else {
          data = a;
        }
      } else if (typeof a === 'number') {
        data = a.toString();
      } else if (typeof a === 'object') {
        if (a.hasOwnProperty('jsonpCallback')) {
          for (var attr in a) {
            jsonpOptions[attr] = a[attr];
          }
        } else {
          data = JSON.stringify(a);
          contentType = 'application/json';
        }
      } else if (typeof a === 'function') {
        if (!callback) {
          callback = a;
        } else {
          errorCallback = a;
        }
      }
    }

    request = new Request(path, {
      method: method,
      mode: 'cors',
      body: data,
      headers: new Headers({
        'Content-Type': contentType
      })
    });
  }

  // do some sort of smart type checking
  if (!type) {
    if (path.indexOf('json') !== -1) {
      type = 'json';
    } else if (path.indexOf('xml') !== -1) {
      type = 'xml';
    } else {
      type = 'text';
    }
  }

  var promise;
  if (type === 'jsonp') {
    promise = fetchJsonp(path, jsonpOptions);
  } else {
    promise = fetch(request);
  }
  promise = promise.then(function(res) {
    if (!res.ok) {
      var err = new Error(res.body);
      err.status = res.status;
      err.ok = false;
      throw err;
    }

    switch (type) {
      case 'json':
      case 'jsonp':
        return res.json();
      case 'binary':
        return res.blob();
      case 'arrayBuffer':
        return res.arrayBuffer();
      case 'xml':
        return res.text().then(function(text) {
          var parser = new DOMParser();
          var xml = parser.parseFromString(text, 'text/xml');
          return parseXML(xml.documentElement);
        });
      default:
        return res.text();
    }
  });
  promise.then(callback || function() {});
  promise.catch(errorCallback || console.error);
  return promise;
};

/**
 * @module IO
 * @submodule Output
 * @for p5
 */

window.URL = window.URL || window.webkitURL;

// private array of p5.PrintWriter objects
p5.prototype._pWriters = [];

/**
 * @method createWriter
 * @param {String} name name of the file to be created
 * @param {String} [extension]
 * @return {p5.PrintWriter}
 * @example
 * <div>
 * <code>
 * createButton('save')
 *   .position(10, 10)
 *   .mousePressed(function() {
 *     var writer = createWriter('squares.txt');
 *     for (var i = 0; i < 10; i++) {
 *       writer.print(i * i);
 *     }
 *     writer.close();
 *     writer.clear();
 *   });
 * </code>
 * </div>
 */
p5.prototype.createWriter = function(name, extension) {
  var newPW;
  // check that it doesn't already exist
  for (var i in p5.prototype._pWriters) {
    if (p5.prototype._pWriters[i].name === name) {
      // if a p5.PrintWriter w/ this name already exists...
      // return p5.prototype._pWriters[i]; // return it w/ contents intact.
      // or, could return a new, empty one with a unique name:
      newPW = new p5.PrintWriter(name + this.millis(), extension);
      p5.prototype._pWriters.push(newPW);
      return newPW;
    }
  }
  newPW = new p5.PrintWriter(name, extension);
  p5.prototype._pWriters.push(newPW);
  return newPW;
};

/**
 *  @class p5.PrintWriter
 *  @param  {String}     filename
 *  @param  {String}     [extension]
 */
p5.PrintWriter = function(filename, extension) {
  var self = this;
  this.name = filename;
  this.content = '';
  //Changed to write because it was being overloaded by function below.
  /**
   * Writes data to the PrintWriter stream
   * @method write
   * @param {Array} data all data to be written by the PrintWriter
   * @example
   * <div class="norender notest">
   * <code>
   * // creates a file called 'newFile.txt'
   * var writer = createWriter('newFile.txt');
   * // write 'Hello world!'' to the file
   * writer.write(['Hello world!']);
   * // close the PrintWriter and save the file
   * writer.close();
   * </code>
   * </div>
   * <div class='norender notest'>
   * <code>
   * // creates a file called 'newFile2.txt'
   * var writer = createWriter('newFile2.txt');
   * // write 'apples,bananas,123' to the file
   * writer.write(['apples', 'bananas', 123]);
   * // close the PrintWriter and save the file
   * writer.close();
   * </code>
   * </div>
   * <div class='norender notest'>
   * <code>
   * // creates a file called 'newFile3.txt'
   * var writer = createWriter('newFile3.txt');
   * // write 'My name is: Teddy' to the file
   * writer.write('My name is:');
   * writer.write(' Teddy');
   * // close the PrintWriter and save the file
   * writer.close();
   * </code>
   * </div>
   */
  this.write = function(data) {
    this.content += data;
  };
  /**
   * Writes data to the PrintWriter stream, and adds a new line at the end
   * @method print
   * @param {Array} data all data to be printed by the PrintWriter
   * @example
   * <div class='norender notest'>
   * <code>
   * // creates a file called 'newFile.txt'
   * var writer = createWriter('newFile.txt');
   * // creates a file containing
   * //  My name is:
   * //  Teddy
   * writer.print('My name is:');
   * writer.print('Teddy');
   * // close the PrintWriter and save the file
   * writer.close();
   * </code>
   * </div>
   * <div class='norender notest'>
   * <code>
   * var writer;
   *
   * function setup() {
   *   createCanvas(400, 400);
   *   // create a PrintWriter
   *   writer = createWriter('newFile.txt');
   * }
   *
   * function draw() {
   *   // print all mouseX and mouseY coordinates to the stream
   *   writer.print([mouseX, mouseY]);
   * }
   *
   * function mouseClicked() {
   *   // close the PrintWriter and save the file
   *   writer.close();
   * }
   * </code>
   * </div>
   */
  this.print = function(data) {
    this.content += data + '\n';
  };
  /**
   * Clears the data already written to the PrintWriter object
   * @method clear
   * @example
   * <div class ="norender notest"><code>
   * // create writer object
   * var writer = createWriter('newFile.txt');
   * writer.write(['clear me']);
   * // clear writer object here
   * writer.clear();
   * // close writer
   * writer.close();
   * </code></div>
   *
   */
  this.clear = function() {
    this.content = '';
  };
  /**
   * Closes the PrintWriter
   * @method close
   * @example
   * <div class="norender notest">
   * <code>
   * // create a file called 'newFile.txt'
   * var writer = createWriter('newFile.txt');
   * // close the PrintWriter and save the file
   * writer.close();
   * </code>
   * </div>
   * <div class='norender notest'>
   * <code>
   * // create a file called 'newFile2.txt'
   * var writer = createWriter('newFile2.txt');
   * // write some data to the file
   * writer.write([100, 101, 102]);
   * // close the PrintWriter and save the file
   * writer.close();
   * </code>
   * </div>
   */
  this.close = function() {
    // convert String to Array for the writeFile Blob
    var arr = [];
    arr.push(this.content);
    p5.prototype.writeFile(arr, filename, extension);
    // remove from _pWriters array and delete self
    for (var i in p5.prototype._pWriters) {
      if (p5.prototype._pWriters[i].name === this.name) {
        // remove from _pWriters array
        p5.prototype._pWriters.splice(i, 1);
      }
    }
    self.clear();
    self = {};
  };
};

/**
 * @module IO
 * @submodule Output
 * @for p5
 */

// object, filename, options --> saveJSON, saveStrings,
// filename, [extension] [canvas] --> saveImage

/**
 *  <p>Save an image, text, json, csv, wav, or html. Prompts download to
 *  the client's computer. <b>Note that it is not recommended to call <a href="#/p5/save">save()</a>
 *  within draw if it's looping, as the <a href="#/p5/save">save()</a> function will open a new save
 *  dialog every frame.</b></p>
 *  <p>The default behavior is to save the canvas as an image. You can
 *  optionally specify a filename.
 *  For example:</p>
 * <pre class='language-javascript'><code>
 * save();
 * save('myCanvas.jpg'); // save a specific canvas with a filename
 * </code></pre>
 *
 *  <p>Alternately, the first parameter can be a pointer to a canvas
 *  <a href="#/p5.Element">p5.Element</a>, an Array of Strings,
 *  an Array of JSON, a JSON object, a <a href="#/p5.Table">p5.Table</a>, a <a href="#/p5.Image">p5.Image</a>, or a
 *  p5.SoundFile (requires p5.sound). The second parameter is a filename
 *  (including extension). The third parameter is for options specific
 *  to this type of object. This method will save a file that fits the
 *  given paramaters. For example:</p>
 *
 * <pre class='language-javascript'><code>
 * // Saves canvas as an image
 * save('myCanvas.jpg');
 *
 * // Saves pImage as a png image
 * var img = createImage(10, 10);
 * save(img, 'my.png');
 *
 * // Saves canvas as an image
 * var cnv = createCanvas(100, 100);
 * save(cnv, 'myCanvas.jpg');
 *
 * // Saves p5.Renderer object as an image
 * var gb = createGraphics(100, 100);
 * save(gb, 'myGraphics.jpg');
 *
 * var myTable = new p5.Table();
 *
 * // Saves table as html file
 * save(myTable, 'myTable.html');
 *
 * // Comma Separated Values
 * save(myTable, 'myTable.csv');
 *
 * // Tab Separated Values
 * save(myTable, 'myTable.tsv');
 *
 * var myJSON = { a: 1, b: true };
 *
 * // Saves pretty JSON
 * save(myJSON, 'my.json');
 *
 * // Optimizes JSON filesize
 * save(myJSON, 'my.json', true);
 *
 * // Saves array of strings to a text file with line breaks after each item
 * var arrayOfStrings = ['a', 'b'];
 * save(arrayOfStrings, 'my.txt');
 * </code></pre>
 *
 *  @method save
 *  @param  {Object|String} [objectOrFilename]  If filename is provided, will
 *                                             save canvas as an image with
 *                                             either png or jpg extension
 *                                             depending on the filename.
 *                                             If object is provided, will
 *                                             save depending on the object
 *                                             and filename (see examples
 *                                             above).
 *  @param  {String} [filename] If an object is provided as the first
 *                               parameter, then the second parameter
 *                               indicates the filename,
 *                               and should include an appropriate
 *                               file extension (see examples above).
 *  @param  {Boolean|String} [options]  Additional options depend on
 *                            filetype. For example, when saving JSON,
 *                            <code>true</code> indicates that the
 *                            output will be optimized for filesize,
 *                            rather than readability.
 */
p5.prototype.save = function(object, _filename, _options) {
  // parse the arguments and figure out which things we are saving
  var args = arguments;
  // =================================================
  // OPTION 1: saveCanvas...

  // if no arguments are provided, save canvas
  var cnv = this._curElement.elt;
  if (args.length === 0) {
    p5.prototype.saveCanvas(cnv);
    return;
  } else if (args[0] instanceof p5.Renderer || args[0] instanceof p5.Graphics) {
    // otherwise, parse the arguments

    // if first param is a p5Graphics, then saveCanvas
    p5.prototype.saveCanvas(args[0].elt, args[1], args[2]);
    return;
  } else if (args.length === 1 && typeof args[0] === 'string') {
    // if 1st param is String and only one arg, assume it is canvas filename
    p5.prototype.saveCanvas(cnv, args[0]);
  } else {
    // =================================================
    // OPTION 2: extension clarifies saveStrings vs. saveJSON
    var extension = _checkFileExtension(args[1], args[2])[1];
    switch (extension) {
      case 'json':
        p5.prototype.saveJSON(args[0], args[1], args[2]);
        return;
      case 'txt':
        p5.prototype.saveStrings(args[0], args[1], args[2]);
        return;
      // =================================================
      // OPTION 3: decide based on object...
      default:
        if (args[0] instanceof Array) {
          p5.prototype.saveStrings(args[0], args[1], args[2]);
        } else if (args[0] instanceof p5.Table) {
          p5.prototype.saveTable(args[0], args[1], args[2]);
        } else if (args[0] instanceof p5.Image) {
          p5.prototype.saveCanvas(args[0].canvas, args[1]);
        } else if (args[0] instanceof p5.SoundFile) {
          p5.prototype.saveSound(args[0], args[1], args[2], args[3]);
        }
    }
  }
};

/**
 *  Writes the contents of an Array or a JSON object to a .json file.
 *  The file saving process and location of the saved file will
 *  vary between web browsers.
 *
 *  @method saveJSON
 *  @param  {Array|Object} json
 *  @param  {String} filename
 *  @param  {Boolean} [optimize]   If true, removes line breaks
 *                                 and spaces from the output
 *                                 file to optimize filesize
 *                                 (but not readability).
 *  @example
 * <div><code>
 * var json = {}; // new  JSON Object
 *
 * json.id = 0;
 * json.species = 'Panthera leo';
 * json.name = 'Lion';
 *
 * createButton('save')
 *   .position(10, 10)
 *   .mousePressed(function() {
 *     saveJSON(json, 'lion.json');
 *   });
 *
 * // saves the following to a file called "lion.json":
 * // {
 * //   "id": 0,
 * //   "species": "Panthera leo",
 * //   "name": "Lion"
 * // }
 * </code></div>
 *
 * @alt
 * no image displayed
 *
 */
p5.prototype.saveJSON = function(json, filename, opt) {
  var stringify;
  if (opt) {
    stringify = JSON.stringify(json);
  } else {
    stringify = JSON.stringify(json, undefined, 2);
  }
  this.saveStrings(stringify.split('\n'), filename, 'json');
};

p5.prototype.saveJSONObject = p5.prototype.saveJSON;
p5.prototype.saveJSONArray = p5.prototype.saveJSON;

/**
 *  Writes an array of Strings to a text file, one line per String.
 *  The file saving process and location of the saved file will
 *  vary between web browsers.
 *
 *  @method saveStrings
 *  @param  {String[]} list   string array to be written
 *  @param  {String} filename filename for output
 *  @param  {String} [extension] the filename's extension
 *  @example
 * <div><code>
 * var words = 'apple bear cat dog';
 *
 * // .split() outputs an Array
 * var list = split(words, ' ');
 *
 * createButton('save')
 *   .position(10, 10)
 *   .mousePressed(function() {
 *     saveStrings(list, 'nouns.txt');
 *   });
 *
 * // Saves the following to a file called 'nouns.txt':
 * //
 * // apple
 * // bear
 * // cat
 * // dog
 * </code></div>
 *
 * @alt
 * no image displayed
 *
 */
p5.prototype.saveStrings = function(list, filename, extension) {
  var ext = extension || 'txt';
  var pWriter = this.createWriter(filename, ext);
  for (var i = 0; i < list.length; i++) {
    if (i < list.length - 1) {
      pWriter.print(list[i]);
    } else {
      pWriter.print(list[i]);
    }
  }
  pWriter.close();
  pWriter.clear();
};

// =======
// HELPERS
// =======

function escapeHelper(content) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 *  Writes the contents of a <a href="#/p5.Table">Table</a> object to a file. Defaults to a
 *  text file with comma-separated-values ('csv') but can also
 *  use tab separation ('tsv'), or generate an HTML table ('html').
 *  The file saving process and location of the saved file will
 *  vary between web browsers.
 *
 *  @method saveTable
 *  @param  {p5.Table} Table  the <a href="#/p5.Table">Table</a> object to save to a file
 *  @param  {String} filename the filename to which the Table should be saved
 *  @param  {String} [options]  can be one of "tsv", "csv", or "html"
 *  @example
 *  <div><code>
 * var table;
 *
 * function setup() {
 *   table = new p5.Table();
 *
 *   table.addColumn('id');
 *   table.addColumn('species');
 *   table.addColumn('name');
 *
 *   var newRow = table.addRow();
 *   newRow.setNum('id', table.getRowCount() - 1);
 *   newRow.setString('species', 'Panthera leo');
 *   newRow.setString('name', 'Lion');
 *
 *   // To save, un-comment next line then click 'run'
 *   // saveTable(table, 'new.csv');
 * }
 *
 * // Saves the following to a file called 'new.csv':
 * // id,species,name
 * // 0,Panthera leo,Lion
 * </code></div>
 *
 * @alt
 * no image displayed
 *
 */
p5.prototype.saveTable = function(table, filename, options) {
  var ext;
  if (options === undefined) {
    ext = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
  } else {
    ext = options;
  }
  var pWriter = this.createWriter(filename, ext);

  var header = table.columns;

  var sep = ','; // default to CSV
  if (ext === 'tsv') {
    sep = '\t';
  }
  if (ext !== 'html') {
    // make header if it has values
    if (header[0] !== '0') {
      for (var h = 0; h < header.length; h++) {
        if (h < header.length - 1) {
          pWriter.write(header[h] + sep);
        } else {
          pWriter.write(header[h]);
        }
      }
      pWriter.write('\n');
    }

    // make rows
    for (var i = 0; i < table.rows.length; i++) {
      var j;
      for (j = 0; j < table.rows[i].arr.length; j++) {
        if (j < table.rows[i].arr.length - 1) {
          pWriter.write(table.rows[i].arr[j] + sep);
        } else if (i < table.rows.length - 1) {
          pWriter.write(table.rows[i].arr[j]);
        } else {
          pWriter.write(table.rows[i].arr[j]);
        }
      }
      pWriter.write('\n');
    }
  } else {
    // otherwise, make HTML
    pWriter.print('<html>');
    pWriter.print('<head>');
    var str = '  <meta http-equiv="content-type" content';
    str += '="text/html;charset=utf-8" />';
    pWriter.print(str);
    pWriter.print('</head>');

    pWriter.print('<body>');
    pWriter.print('  <table>');

    // make header if it has values
    if (header[0] !== '0') {
      pWriter.print('    <tr>');
      for (var k = 0; k < header.length; k++) {
        var e = escapeHelper(header[k]);
        pWriter.print('      <td>' + e);
        pWriter.print('      </td>');
      }
      pWriter.print('    </tr>');
    }

    // make rows
    for (var row = 0; row < table.rows.length; row++) {
      pWriter.print('    <tr>');
      for (var col = 0; col < table.columns.length; col++) {
        var entry = table.rows[row].getString(col);
        var htmlEntry = escapeHelper(entry);
        pWriter.print('      <td>' + htmlEntry);
        pWriter.print('      </td>');
      }
      pWriter.print('    </tr>');
    }
    pWriter.print('  </table>');
    pWriter.print('</body>');
    pWriter.print('</html>');
  }
  // close and clear the pWriter
  pWriter.close();
  pWriter.clear();
}; // end saveTable()

/**
 *  Generate a blob of file data as a url to prepare for download.
 *  Accepts an array of data, a filename, and an extension (optional).
 *  This is a private function because it does not do any formatting,
 *  but it is used by <a href="#/p5/saveStrings">saveStrings</a>, <a href="#/p5/saveJSON">saveJSON</a>, <a href="#/p5/saveTable">saveTable</a> etc.
 *
 *  @param  {Array} dataToDownload
 *  @param  {String} filename
 *  @param  {String} [extension]
 *  @private
 */
p5.prototype.writeFile = function(dataToDownload, filename, extension) {
  var type = 'application/octet-stream';
  if (p5.prototype._isSafari()) {
    type = 'text/plain';
  }
  var blob = new Blob(dataToDownload, {
    type: type
  });
  p5.prototype.downloadFile(blob, filename, extension);
};

/**
 *  Forces download. Accepts a url to filedata/blob, a filename,
 *  and an extension (optional).
 *  This is a private function because it does not do any formatting,
 *  but it is used by <a href="#/p5/saveStrings">saveStrings</a>, <a href="#/p5/saveJSON">saveJSON</a>, <a href="#/p5/saveTable">saveTable</a> etc.
 *
 *  @method downloadFile
 *  @private
 *  @param  {String|Blob} data    either an href generated by createObjectURL,
 *                                or a Blob object containing the data
 *  @param  {String} [filename]
 *  @param  {String} [extension]
 */
p5.prototype.downloadFile = function(data, fName, extension) {
  var fx = _checkFileExtension(fName, extension);
  var filename = fx[0];

  if (data instanceof Blob) {
    var fileSaver = require('file-saver');
    fileSaver.saveAs(data, filename);
    return;
  }

  var a = document.createElement('a');
  a.href = data;
  a.download = filename;

  // Firefox requires the link to be added to the DOM before click()
  a.onclick = function(e) {
    destroyClickedElement(e);
    e.stopPropagation();
  };

  a.style.display = 'none';
  document.body.appendChild(a);

  // Safari will open this file in the same page as a confusing Blob.
  if (p5.prototype._isSafari()) {
    var aText = 'Hello, Safari user! To download this file...\n';
    aText += '1. Go to File --> Save As.\n';
    aText += '2. Choose "Page Source" as the Format.\n';
    aText += '3. Name it with this extension: ."' + fx[1] + '"';
    alert(aText);
  }
  a.click();
};

/**
 *  Returns a file extension, or another string
 *  if the provided parameter has no extension.
 *
 *  @param   {String} filename
 *  @param   {String} [extension]
 *  @return  {String[]} [fileName, fileExtension]
 *
 *  @private
 */
function _checkFileExtension(filename, extension) {
  if (!extension || extension === true || extension === 'true') {
    extension = '';
  }
  if (!filename) {
    filename = 'untitled';
  }
  var ext = '';
  // make sure the file will have a name, see if filename needs extension
  if (filename && filename.indexOf('.') > -1) {
    ext = filename.split('.').pop();
  }
  // append extension if it doesn't exist
  if (extension) {
    if (ext !== extension) {
      ext = extension;
      filename = filename + '.' + ext;
    }
  }
  return [filename, ext];
}
p5.prototype._checkFileExtension = _checkFileExtension;

/**
 *  Returns true if the browser is Safari, false if not.
 *  Safari makes trouble for downloading files.
 *
 *  @return  {Boolean} [description]
 *  @private
 */
p5.prototype._isSafari = function() {
  var x = Object.prototype.toString.call(window.HTMLElement);
  return x.indexOf('Constructor') > 0;
};

/**
 *  Helper function, a callback for download that deletes
 *  an invisible anchor element from the DOM once the file
 *  has been automatically downloaded.
 *
 *  @private
 */
function destroyClickedElement(event) {
  document.body.removeChild(event.target);
}

module.exports = p5;
