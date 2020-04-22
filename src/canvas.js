import React, { Component } from 'react';
import { v4 } from 'uuid';
import Pusher from 'pusher-js';
import util from 'util';

class Canvas extends Component {
  constructor(props) {
    super(props);

    this.pusher = new Pusher('a1de361e8a5975db6810', {
      cluster: 'us2',
    });
  }
  isPainting = false;
  userStrokeStyle = '#EE92C2';
  guestStrokeStyle = '#F0C987';
  line = [];
  userId = v4();
  prevPos = { offsetX: 0, offsetY: 0 };

  _getOffsets(targetTouches) {
    const element = document.querySelector('canvas');
    console.log(util.inspect(element, {showHidden: false, depth: null}))
    const x = element.getBoundingClientRect().x;
    const y = element.getBoundingClientRect().y;
    const offsetX = targetTouches[0].clientX - x;
    const offsetY = targetTouches[0].clientY - y;
    return { offsetX, offsetY };
  }

  onTouchStart = ({ targetTouches }) => {
    this.prevPos = this._getOffsets(targetTouches);
    this.isPainting = true;
  }

  onTouchMove = ({ targetTouches }) => {
    if (this.isPainting) {
      const { offsetX, offsetY } = this._getOffsets(targetTouches);
      const offSetData = { offsetX, offsetY };
      this.position = {
        start: { ...this.prevPos },
        stop: { ...offSetData },
      };
      this.line = this.line.concat(this.position);
      this.paint(this.prevPos, offSetData, this.userStrokeStyle);
    }
  }

  endPaintEvent = () => {
    if (this.isPainting) {
      this.isPainting = false;
      //this.sendPaintData();
    }
  }

  paint = (prevPos, currPos, strokeStyle) => {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(offsetX, offsetY);
    this.ctx.stroke();
    this.prevPos = { offsetX, offsetY };
  }

  async sendPaintData() {
    const body = {
      line: this.line,
      userId: this.userId,
    };

    const req = await fetch('http://tabula-srv.herokuapp.com/paint', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });
    const res = await req.json();
    console.log(res);
    this.line = [];
  }

  componentDidMount() {
    const canvas = document.querySelector('#drawingCanvas');
    canvas.width = 200;
    canvas.height = 200;
    this.ctx = canvas.getContext('2d');
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 5;

    const channel = this.pusher.subscribe('painting');
    channel.bind('draw', (data) => {
      const { userId, line } = data;
      if (userId !== this.userId) {
        line.forEach((position) => {
          this.paint(position.start, position.stop, this.guestStrokeStyle);
        });
      }
    });
  }

  render() {
    return (
      <canvas
        id="drawingCanvas"
        style={{ background: 'black' }}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.endPaintEvent}
      />
    );
  }
}

export default Canvas;
