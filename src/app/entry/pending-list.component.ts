import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { InventoryService } from '../inventory.service';
import { InventoryBase } from '../models/InventoryBase';
import { OpenFoodFactProduct } from '../models/OpenFoodFactProduct';
import { ProductService } from '../product.service';
import { SoundService } from '../sound.service';

@Component({
  selector: 'app-pending-list',
  templateUrl: './pending-list.component.html',
  styleUrls: ['./pending-list.component.scss']
})
export class PendingListComponent implements OnInit {

  public inventory: Observable<InventoryBase[]>;

  constructor(private invSrv: InventoryService
            , private readonly productSrv: ProductService
            , private readonly soundSrv: SoundService
    ) {
    this.inventory = this.invSrv.pendingList$();
  }

  ngOnInit(): void{
  }

  private update(itm: InventoryBase, product: OpenFoodFactProduct): InventoryBase {
    const rtnInvItm = JSON.parse(JSON.stringify(itm)) as InventoryBase;
    rtnInvItm.brand_owner = product.brand_owner;
    rtnInvItm.image_url = product.image_url;
    rtnInvItm.product_name = product.product_name;
    if (product.brands) {
      rtnInvItm.brands = product.brands;
    }
    return rtnInvItm;
  }

  async onRefresh(itm: InventoryBase): Promise<void> {
    const product = await this.productSrv.get(itm.code);
    if (product) {
      this.soundSrv.playSuccess();
      const upItem = this.update(itm, product);
      upItem.pending = false;
      this.invSrv.update(upItem);

      // todo: run though exiting pending inventory items, and update them too...
      const currLst = await this.inventory.pipe(take(1)).toPromise()
      currLst.filter((litm) => litm.code === itm.code).forEach((litm) => {
        const lupItem = this.update(litm, product);
        lupItem.pending = false;
        this.invSrv.update(lupItem);
      });
    } else {
      this.soundSrv.playFail();
    }
  }
}
