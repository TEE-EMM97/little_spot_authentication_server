# little_spot_authentication_server
a wrapper service which holds app-ids on behalf of an insecure client

Please see the following items for inspiration:

* [example app](https://github.com/aliceliveprojects/little_spot_app)
* [Spotify Developer Dashboard (requires account)](https://developer.spotify.com/dashboard/login)
* [cordova plugin](https://github.com/Festify/cordova-spotify-oauth)
* [tutorial](https://devdactic.com/ionic-spotify-app-oauth/)

When deployed, environment variables (see below) are set on the host. These will tie the server to a specific, Spotify developer account, via a client ID and server secret. This means you must use your own server deployment, for your own client app.

This application can be deployed from localhost for debugging. Make sure the client mobile app is on the same wireless local network. The urls used look like this, for example:

**EXCHANGE URL**: http://192.168.1.5:8000/spotify/exchange   
**REFRESH URL**: http://192.168.1.5:8000/spotify/refresh


The server must define the following environment variables:


|var|example|
|-|-|
|API_DOMAIN|obtained from your server| 
|API_PORT|443|
|API_SCHEME|https|
|SPOTIFY_API_DOMAIN|accounts.spotify.com|
|SPOTIFY_API_PATH|/api/token| 
|SPOTIFY_CLIENT_CALLBACK_URL|gaddumspotify://callback| 
|SPOTIFY_CLIENT_ID| obtained from dev account|
|SPOTIFY_CLIENT_SECRET|obtained from dev account |
|SPOTIFY_ENCRYPTION_SECRET|known to server and client|
 
Note: Authorised staff can find test credentials [here](https://github.com/CMDT/DigitalLabs_TeachingProjects/tree/master/docs/accounts/alice/spotify)


