'use strict';

var fs = require('fs'),
  path = require('path'),
  http = require('http'),
  cors = require('cors'),
  spotifyService = require('./service/SpotifyService'),
  app = require('connect')(),
  swaggerTools = require('swagger-tools'),
  jsyaml = require('js-yaml');


// Cross Origin Requests - must have this, as we are an API.
// Without it, browsers running SPWAs from domains different to ours (e.g. github pages)
// will reject HTTP requests during pre-flight check.
app.use(cors());

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);


var getSpotifyConfig = function(){

  var result = {};

  if(!process.env.SPOTIFY_CLIENT_CALLBACK_URL){
    throw new Error("SPOTIFY_CLIENT_CALLBACK_URL undefined!");
  }
  if(!process.env.SPOTIFY_ENCRYPTION_SECRET){
    throw new Error("SPOTIFY_ENCRYPTION_SECRET undefined!");
  }
  if(!process.env.SPOTIFY_CLIENT_SECRET){
    throw new Error("SPOTIFY_CLIENT_SECRET undefined!");
  }
  if(!process.env.SPOTIFY_CLIENT_ID){
    throw new Error("SPOTIFY_CLIENT_ID undefined!");
  }
  if(!process.env.SPOTIFY_API_DOMAIN){
    throw new Error("SPOTIFY_API_DOMAIN undefined!");
  }
  if(!process.env.SPOTIFY_API_PATH){
    throw new Error("SPOTIFY_API_PATH undefined!");
  }

  result.clientId = process.env.SPOTIFY_CLIENT_ID;
  result.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  result.clientCallbackUrl = process.env.SPOTIFY_CLIENT_CALLBACK_URL;
  result.encryptionSecret = process.env.SPOTIFY_ENCRYPTION_SECRET;
  result.apiDomain = process.env.SPOTIFY_API_DOMAIN;
  result.apiPath = process.env.SPOTIFY_API_PATH;

  
  return result;

}


var getSwaggerUIConfig = function(){
  var result = {};

  result.scheme = process.env.API_SCHEME;
  result.domain = process.env.API_DOMAIN;
  result.port = process.env.API_PORT;
  result.existingPort = process.env.PORT; // assigned by Heroku if deployed.
  
  return result;

}
var writeSwaggerUIConfig = function(swaggerDoc, env){

  var doc = {};
  doc.scheme = swaggerDoc.schemes[0];  //WILL THROW IF SCHEMES NOT DEFINED IN DOC
  doc.domain = swaggerDoc.host.split(':')[0];  //WILL THROW IF HOST NOT DEFINED IN DOC 
  doc.port = swaggerDoc.host.split(':')[1];  //WILL THROW IF PORT NOT DEFINED IN DOC  
  
  if (env.existingPort){
    console.log("remote deployment has already defined port");
    if(env.port){
      
      doc.port = env.port; // override (useful for consistency, or if the remote service is not heroku, and listening on a different port.)
      console.log("external facing port env variable is set. Updating swagger.yaml with this value: %s", doc.port);
    }else{
      doc.port = 443; // override the setting with Heroku's default external facing port
      console.log("external facing port env variable is unset. Updating swagger.yaml with default value: %s", doc.port);
    }
  }else{
    console.log("local deployment.");
    if(env.port){
        doc.port = env.port; //override (useful if you have lots of servers running on local host)
        console.log("overriding swagger.yaml port to env variable: %s", doc.port);
    }else{
        env.port = doc.port;
        console.log("env varable not defined for port. Setting to default from swagger.yaml: %s ", env.port );
    }
  }
  if(env.domain){
    doc.domain = env.domain; //override (useful if you want to deploy to a different server than specified in the yaml)
    console.log("overriding swagger.yaml domain to env variable: %s", doc.domain);
  }
  if(env.scheme){
    doc.scheme = env.scheme; // override (useful if you want to deploy to a different comms scheme than that defined in the yaml.
    console.log("overriding swagger.yaml scheme to env variable: %s", doc.scheme);
  }
  
  var hostAddrPort = doc.domain + ":" + doc.port;
  var schemes = [doc.scheme];

  swaggerDoc.host = hostAddrPort;
  swaggerDoc.schemes = schemes;
  
  return swaggerDoc;
}


var spotifyConfig = getSpotifyConfig(); 

var swaggerUIConfig = getSwaggerUIConfig();
swaggerDoc = writeSwaggerUIConfig(swaggerDoc, swaggerUIConfig);
var serverPort = swaggerUIConfig.existingPort || swaggerUIConfig.port;

spotifyService.initialise(spotifyConfig); // throws


// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi(
    { swaggerUiDir: path.join(__dirname, './swagger_spwa') }
  ));



  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server available at: %s://%s', swaggerDoc.schemes[0], swaggerDoc.host);
    console.log('The internal port assigned to your server  is: %d', serverPort );
    console.log('Your swaggerUI is available at: %s://%s/docs' , swaggerDoc.schemes[0], swaggerDoc.host);
  });

});
