import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({
 publicDir:'../app/public',
 envDir:'../app',
 define:{'import.meta.env.VITE_APP_SURFACE':JSON.stringify('desktop')},
 resolve:{dedupe:['react','react-dom','motion','@radix-ui/react-dialog']},
 plugins:[{name:'desktop-platform',enforce:'pre',resolveId(source,importer){if(importer?.includes('/app/src/')&&/^\.\.?\/mobile$/.test(source))return here+'src/platform.tsx';}},react()],
 server:{host:'127.0.0.1',port:5180,strictPort:true,fs:{allow:['..']}},
 build:{outDir:'dist/client',rollupOptions:{input:{main:here+'index.html',review:here+'review.html'}}},
});
