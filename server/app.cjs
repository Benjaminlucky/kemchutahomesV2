// CommonJS entry for Phusion Passenger (DirectAdmin/cPanel "Setup Node.js
// App"). Older Passenger versions load the startup file with require(),
// which can't load index.js directly because this package is an ES module.
import("./index.js");
