import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:['offline.spec.ts','storage.spec.ts'],workers:1,timeout:180000,use:{browserName:'chromium',channel:'chrome',headless:true,viewport:{width:1440,height:1000}},reporter:'list'});
