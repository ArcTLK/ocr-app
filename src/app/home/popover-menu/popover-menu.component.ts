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
      let promptRet = await Modals.prompt({
        title: 'API Configuration',
        message: 'Enter the API endpoint'
      });
      if (!promptRet.cancelled) {
        this.history.apiEndpoint = promptRet.value;
      }
    });
  }
}
