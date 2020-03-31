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
    private ocr: OCR
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
      const result = await Filesystem.writeFile({
        path: 'scans/temp.jpeg',
        data: image.base64String,
        directory: FilesystemDirectory.Cache
      });
      this.ocr.recText(OCRSourceType.NORMFILEURL, `file://${Filesystem.getUri({ directory: FilesystemDirectory.Cache, path: 'scans/temp.jpeg' })}`)
      .then(async (res: OCRResult) => {
        let alertRet = await Modals.alert({
          title: 'Result',
          message: JSON.stringify(res)
        });
        this.history.addScan(JSON.stringify(res));
        this.oldScans.unshift(JSON.stringify(res));
      })
      .catch((error: any) => console.error(error));
    }
    else {
      if (this.history.apiEndpoint != null) {

      }
      else {
        Toast.show({
          text: 'Please set the API Endpoint via the popover menu.'
        });
      }
    }
  }
}
