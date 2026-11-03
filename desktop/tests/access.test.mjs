import test from 'node:test';
import assert from 'node:assert/strict';
import {surfaceRoute} from '../../app/src/desktop/surface.ts';
for(const route of ['find','results','results-map','booking-flow','search-params','destination','search-dates'])test(`Guest web route: ${route}`,()=>{assert.equal(surfaceRoute(route,false,true),route);assert.equal(surfaceRoute(route,false,false),'phone');});
for(const route of ['profile','trips','trip-chat','rewards','favorites','profile-security'])test(`Private route stays protected: ${route}`,()=>{assert.equal(surfaceRoute(route,false,true),'phone');assert.equal(surfaceRoute(route,true,true),route);});
