import React from "react";
import { createRoot } from 'react-dom/client';
import './index.css'
import App from "./App";


//@ts-ignore
const container = createRoot(document.getElementById('app'));
container.render(<App />)