import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import Quagga from 'quagga';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styles: ['.vid { width: 50%; height: 50%; }']
})
export class LandingComponent implements OnInit {

  // constraints = {
  //   video: {
  //     facingMode: 'user',
  //     width: { ideal: 4096 },
  //     height: { ideal: 2160 }
  //   }
  // };
  // videoWidth = 0;
  // videoHeight = 0;

  // @ViewChild('video', { static: true }) videoElement: ElementRef;
  // @ViewChild('canvas', { static: true }) canvas: ElementRef;


  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    // this.startCamera();


    // Quagga.init({
    //   inputStream : {
    //     name : 'Live',
    //     type : 'LiveStream',
    //     constraints: {
    //       width: {min: 640},
    //       height: {min: 480},
    //       aspectRatio: {min: 1, max: 100},
    //       facingMode: 'environment' // or user
    //   }
    //   },
    //   locator: {
    //     patchSize: 'medium',
    //     halfSample: true
    //   },
    //   numOfWorkers: 2,
    //   frequency: 10,
    //   decoder: {
    //       readers : [{
    //           format: 'ean_reader',
    //           config: {}
    //       }]
    //   },
    //   locate: true
    // }, (err) => {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     console.log('Initialization finished. Ready to start');
    //     Quagga.start();
    // });

    // Quagga.onProcessed((result) => {
    //     const drawingCtx = Quagga.canvas.ctx.overlay;
    //     const drawingCanvas = Quagga.canvas.dom.overlay;

    //     if (result) {
    //       console.log('results', result, result.codeResult, arguments)
    //       if (result.boxes) {
    //         drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width'), 10)
    //                           , parseInt(drawingCanvas.getAttribute('height'), 10));
    //         result.boxes.filter((box) => box !== result.box).forEach((box) => {
    //           Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
    //         });
    //       }

    //       if (result.box) {
    //         Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
    //       }

    //       if (result.codeResult && result.codeResult.code) {
    //         Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
    //       }
    //     }
    //   });

    // Quagga.onDetected((results) => {
    //     console.log('detect', results);
    //     console.log(results.codeResult);
    //     console.log(arguments);
    //   });
  }


  // startCamera(): void {
  //   if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
  //     navigator.mediaDevices.getUserMedia(this.constraints).then(this.attachVideo.bind(this)).catch(this.handleError);
  //   } else {
  //     alert('Sorry, camera not available.');
  //   }
  // }
  // handleError(error): void {
  //   console.log('Error: ', error);
  // }

  // attachVideo(stream): void {
  //   this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  //   this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {
  //       this.videoHeight = this.videoElement.nativeElement.videoHeight;
  //       this.videoWidth = this.videoElement.nativeElement.videoWidth;
  //   });
  // }

  // capture(): void {
  //   this.renderer.setProperty(this.canvas.nativeElement, 'width', 500);
  //   this.renderer.setProperty(this.canvas.nativeElement, 'height', 500);
  //   this.canvas.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0);



   
  // }
}
