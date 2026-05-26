# PurdueMosaic
Our Code for Purdue Helloworld 2023.

A collaborative synchronous pixel drawing app using Socket.IO.

## ✨ New Features & Optimizations
- **Premium Gold Theme**: Refreshed UI featuring an animated gold gradient, light glassmorphism (`backdrop-filter`), and the `Outfit` Google Font.
- **Rolling Window Gallery**: The server now intelligently saves a snapshot of the canvas (if it was drawn on) when the countdown timer hits zero. It maintains a rolling history of up to 12 images.
- **Dynamic Downloads**: Click on any canvas or image in the gallery to instantly save a `.png` file named after that specific prompt!
- **O(1) Client Rendering**: Drastically improved frontend performance by caching pixel DOM nodes, eliminating expensive `O(N)` DOM queries on every single pixel draw.
- **Bug Fixes**: Addressed double-socket connection issues and streamlined the timer logic.

Created by @inner-LMNt, @alexxliu, @alex2tu & @maxluo81 at Purdue Helloworld in September 2023.

Live at [**https://purdue-mosaic.onrender.com/**](https://purdue-mosaic.onrender.com/)

<img width="1093" alt="mosaic-demo" src="https://github.com/inner-LMNt/PurdueMosaic/assets/72209628/a86701a2-6290-40f6-bfc2-3ec2591cd099">

## Run Locally:

```
cd PurdueMosaic/server
node index.js
```

After you've started the dev server you can access it by going to [localhost:3000](http://localhost:3000).

Have fun!!! :)
