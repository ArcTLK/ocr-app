import { Component, OnInit } from '@angular/core';
import { Plugins, CameraResultType, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { HistoryService } from '../history.service';
import { PopoverMenuComponent } from './popover-menu/popover-menu.component';
import { PopoverController } from '@ionic/angular';
import { OCR, OCRSourceType, OCRResult } from '@ionic-native/ocr/ngx';
import { NgxSpinnerService } from 'ngx-spinner';

const { Camera, Toast, Modals, Filesystem } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public oldScans: string[];
  constructor(
    private http: HttpClient,
    private history: HistoryService,
    private popover: PopoverController,
    private ocr: OCR,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.oldScans = this.history.getScans();
  }

  async openPopoverMenu() {
    // create popover
    var popover = await this.popover.create({
      component: PopoverMenuComponent,
      componentProps: { popover }, // passing popover for closing popover from within
      event: event,
      animated: true,
      showBackdrop: true,
      translucent: true
    });
    // display popover
    return await popover.present();
  }

  async takePicture() {
    if (this.history.isOffline) {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64
      });
      this.spinner.show();
      const result = await Filesystem.writeFile({
        path: 'scans/temp.jpeg',
        data: image.base64String,
        directory: FilesystemDirectory.Cache
      });
      Filesystem.getUri({ directory: FilesystemDirectory.Cache, path: 'scans/temp.jpeg' }).then(file => {
        this.ocr.recText(OCRSourceType.NORMFILEURL, `${file.uri}`)
        .then(async (res: OCRResult) => {
          if (res.foundText) {
            var message = res.blocks.blocktext.join(' ');
          }
          else {
            var message = 'Sorry, we were unable to recognize any textual characters';
          }
          let alertRet = await Modals.alert({
            title: 'Result',
            message: message
          });
          this.history.addScan(message);
          this.oldScans.unshift(message);
        })
        .catch((error: any) => {
          Modals.alert({
            title: 'Error',
            message: JSON.stringify(error)
          });
        })
        .finally(() => this.spinner.hide());
      });
    }
    else {
      if (this.history.apiEndpoint != null) {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64
        });
        this.spinner.show();
        let bytes = atob(image.base64String);
        let n = bytes.length;
        let u8arr = new Uint8Array(n);
        while(n--){
          u8arr[n] = bytes.charCodeAt(n);
        }
        let file = new File([u8arr], 'image', { type: 'image/png' });
        const formData: FormData = new FormData();
        formData.append(file.name, file, file.name);
        this.http.post('http://' + this.history.apiEndpoint, formData).toPromise()
        .then(async (response: string) => {
          let alertRet = await Modals.alert({
            title: 'Result',
            message: response
          });
          this.history.addScan(response);
          this.oldScans.unshift(response);
        })
        .catch(error => {
          Modals.alert({
            title: 'Error',
            message: JSON.stringify(error)
          });
        })
        .finally(() => this.spinner.hide());
      }
      else {
        Toast.show({
          text: 'Please set the API Endpoint via the popover menu.'
        });
      }
    }
  }
}
