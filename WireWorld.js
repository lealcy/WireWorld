"use strict";

/**
 *  Copyright Notice:
 * 
 *  This code was first written by Lealcy Tardelli Belegante 
 *  (lealcy@gmail.com) and can be found at https://github.com/lealcy/WireWorld. 
 *  This code can be changed and reused freely but will not receive support by 
 *  its creator(s).
 * 
 *  Changelog:
 * 
 *  2016/04/05 - Initial release (lealcy@gmail.com).
 * 
 */

class WireWorld {
    constructor(canvas, width, height) {
        this.empty = 0;
        this.head = 1;
        this.tail = 2;
        this.wire = 3;
        this.tools = ["empty", "head", "tail", "wire"];
        this.colors = ["Black", "DodgerBlue", "Salmon", "Gold"];
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = width;
        this.height = height;
        this.tWidth = canvas.width / width;
        this.tHeight = canvas.height / height;
        this.state = this.createState(width, height, this.empty);
        this.stop = false;
        this.mouse = {
            isDown: false,
            moved: false,
            tileX: -1,
            tileY: -1,
        };
        
        this.canvas.onmousedown = this.mouseDown.bind(this);
        this.canvas.onmouseup = this.mouseUp.bind(this);
        this.canvas.onmousemove = this.mouseMove.bind(this);
        this.canvas.onmousewheel = this.mouseWheel.bind(this);
        this.canvas.oncontextmenu = () => false; // disables the context menu
    }
    
    render() {
        window.requestAnimationFrame.call(window, this.render.bind(this));
        if (!this.stop) {
                this.updateState();
        }    

        // Render the board
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                if (this.state[i][j] == this.empty && ((i+j) % 2 == 0)) {
                    this.ctx.fillStyle = "#0f0f0f";
                } else {
                    this.ctx.fillStyle = this.colors[this.state[i][j]];
                }
                this.ctx.fillRect(i * this.tWidth, j * this.tHeight, 
                    this.tWidth, this.tHeight);
            }
        }
    }
    
    createState(width, height, defaultValue) {
        var arr = new Array(width);
        for (var i = 0; i < width; i++) {
            arr[i] = new Array(height);
            for (var j = 0; j < height; j++) {
                arr[i][j] = defaultValue;
            }
        }
        return arr;
    }
    
    updateState() {
        var s = this.state;
        var ns = this.createState(this.width, this.height, this.empty);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                switch(s[i][j]) {
                    case this.empty:
                        break;
                    case this.head:
                        ns[i][j] = this.tail;
                        break;
                    case this.tail:
                        ns[i][j] = this.wire;
                        break;
                    case this.wire:
                        var heads = 0;
                        for (var k = -1; k < 2; k++) {
                            for (var w = -1; w < 2; w++) {
                                if ((i + k) >= 0 && (i + k) < this.width &&
                                    (j + w) >= 0 && (j + w) < this.height &&
                                    (k || w) && s[i + k][j + w] == this.head) {
                                    heads++;
                                }
                            }
                        }
                        ns[i][j] = heads == 1 || heads == 2 ? 
                            this.head : this.wire;
                        break;
                }
            }
        }
        this.state = ns;
    }
    
    placeComponent(i, j, button, forceWireEmpty) {
        if (i < 0 || i >= this.width || j < 0 || j >= this.height) {
            return;
        }
        switch(button) {
            case 0: // left button
                if (forceWireEmpty) {
                    this.state[i][j] = this.wire;
                } else {
                    switch(this.state[i][j]) {
                        case this.wire:
                            this.state[i][j] = this.head;
                            break;
                        case this.head:
                            this.state[i][j] = this.tail;
                            break;
                        default:
                            this.state[i][j] = this.wire;
                            break;
                    }
                }
                break;
            case 1: // center button
                this.stop = !this.stop;
                if(!this.stop) {
                    this.render();
                }
                break;
            case 2: // right button
                this.state[i][j] = this.empty;
                break;
        }
    }
    
    mouseDown(e) {
        this.mouse.isDown = true;
        var x = e.offsetX === undefined ? e.originalEvent.layerX : e.offsetX;
        var y = e.offsetY === undefined ? e.originalEvent.layerY : e.offsetY;
        this.mouse.tileX = Math.floor(x / this.tWidth);
        this.mouse.tileY = Math.floor(y / this.tHeight);
        this.placeComponent(this.mouse.tileX, this.mouse.tileY, e.button);

    }
    
    mouseMove(e) {
        if (this.mouse.isDown) {
            var x = e.offsetX === undefined ? e.originalEvent.layerX : e.offsetX;
            var y = e.offsetY === undefined ? e.originalEvent.layerY : e.offsetY;
            var i = Math.floor(x / this.tWidth);
            var j = Math.floor(y / this.tHeight);
            if (!this.mouse.moved) {
                if (this.mouse.tileX != i || this.mouse.tileY != j) {
                    this.mouse.moved = true;
                }
            } else {
                this.placeComponent(i, j, e.button, true);
            }
        }
    }
    
    mouseUp(e) {
        this.mouse.isDown = false;
        this.mouse.moved = false;
    }
    
    mouseWheel(e) {
        switch (e.wheelDelta / 120) {
            case 1: // Wheel up.
                // clear all eletrons
                for (var i = 0; i < this.width; i++) {
                    for (var j = 0; j < this.height; j++) {
                        if ([this.tail, this.head].find(
                            v => v == this.state[i][j])) {
                            this.state[i][j] = this.wire;
                        }
                    }
                }                
                break;
            case -1: // Wheel down.
                // Clear the board.
                this.state = this.createState(this.width, this.height, 
                    this.empty);
                break;
        }
    }
    
}

