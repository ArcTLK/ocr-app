import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { HistoryService } from '../../history.service';
import { Plugins } from '@capacitor/core';

const { Modals } = Plugins;

@Component({
  selector: 'app-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss'],
})
export class PopoverMenuComponent implements OnInit {
  private popover: PopoverController;
  constructor(
    private navParams: NavParams,
    public history: HistoryService
  ) {
    this.popover = this.navParams.get('popover');
  }

  ngOnInit() {}
  toggleOffline() {
    this.popover.dismiss().then(() => this.history.isOffline = !this.history.isOffline);
  }
  openApiEntryModal() {
    this.popover.dismiss().then(async () => {
      if (this.history.apiEndpoint == null) {
        var message = 'Enter the API endpoint';
      }
      else {
        var message = 'Enter the API endpoint\nCurrently it is set to ' + this.history.apiEndpoint;
      }
      let promptRet = await Modals.prompt({
        title: 'API Configuration',
        message: message
      });
      if (!promptRet.cancelled) {
        this.history.apiEndpoint = promptRet.value;
      }
    });
  }
}
