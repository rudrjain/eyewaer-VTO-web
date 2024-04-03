import {Controller} from './controller.js';
import {UI} from '../ui/ui.js';

const e = {
  Controller, 
  UI
}

if (!window.MEDIAPIPEAR) {
  window.MEDIAPIPEAR = {};
}

window.MEDIAPIPEAR.FACE = e;


export {Controller,UI}