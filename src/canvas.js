import React, { Component } from 'react';
import { v4 } from 'uuid';
import Pusher from 'pusher-js';

class Canvas extends Component {
  constructor(props) {
    super(props);

    this.pusher = new Pusher('PUSHER_KEY', {
      cluster: 'eu',
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
    const x = element.getBoundingClientRect().x;
    const y = element.getBoundingClientRect().y;
    console.log(JSON.stringify(this.canvas.getBoundingClientRect()));
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
      this.sendPaintData();
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
    /*
    const body = {
      line: this.line,
      userId: this.userId,
    };

    const req = await fetch('http://localhost:4000/paint', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });
    const res = await req.json();
    this.line = [];
    */
  }

  componentDidMount() {
    this.canvas.width = 200;
    this.canvas.height = 200;
    this.ctx = this.canvas.getContext('2d');
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
        ref={(ref) => (this.canvas = ref)}
        style={{ background: 'black' }}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.endPaintEvent}
      />
    );
  }
}

export default Canvas;
