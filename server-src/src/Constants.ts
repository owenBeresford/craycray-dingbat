
/* TODO: You need to set this URL to your host where the app is run. 
 maybe it would be nice to have an install script for this line 
 See also the client-src Constants with the same data in it */
export const HOST_NAME= "app.hiss:3001";
export const HOST_NAME_SB="localhost:6006";
export const TEST_LOCATION_URL = "https://"+HOST_NAME;
export const APP_DEFAULT_API= "https://"+HOST_NAME+"/api/shared-state";

export const TEMP_DIR="/tmp/"; 

// Currently all the files in the App
export const VALID_ROUTES = [
  "/",
  "/index.html",
  "/asset/favicon.ico",
  "/asset/manifest.json",
  "/asset/shopping.min.css",
  "/asset/shopping.es.min.mjs",
  "/asset/logo.png",
  "/asset/worker1.es.min.mjs",
  "/api/shared-state",
];
