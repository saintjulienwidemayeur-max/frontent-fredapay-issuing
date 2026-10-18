/*
 * Freda Pay Issuing shows every date and time in Haiti time (America/Port-au-Prince), whatever the visitor's own
 * time zone is: this makes toLocaleString / toLocaleDateString / toLocaleTimeString default to it. A call that passes
 * its own timeZone keeps it.
 */
(function () {
  var TZ = 'America/Port-au-Prince';
  ['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString'].forEach(function (name) {
    var original = Date.prototype[name];
    Date.prototype[name] = function (locales, options) {
      var opts = Object.assign({}, options || {});
      if (!opts.timeZone) opts.timeZone = TZ;
      return original.call(this, locales, opts);
    };
  });
})();
